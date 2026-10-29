"""
Audit Verification Test Suite for HavenSec Arena.
Verifies critical architectural invariants discovered and remediated during deep backend audit:
1. Target asset propagation from ExerciseConfig to RedTeamAgent telemetry.
2. Lifecycle finite-state machine (FSM) guards against invalid transitions.
3. Timestamp causality (alerts cannot precede causing telemetry events).
4. Full execution coverage across all 6 MITRE ATT&CK scenarios.
5. Multi-incident investigation completeness scoring.
6. Separation of benign noise from malicious adversarial events.
"""

import pytest
from fastapi.testclient import TestClient
from api import app
from database import init_db, save_exercise, get_exercise, get_telemetry_by_exercise, get_alerts_by_exercise
from simulation.scenarios import SCENARIOS, list_all_scenarios
from simulation.engine import run_simulation_loop
from simulation.agents import RedTeamAgent, BlueTeamSentinel
from simulation.referee import RefereeAgent

client = TestClient(app)

def setup_module(module):
    init_db()


def test_target_asset_propagation():
    """Verifies targetAsset from exercise config propagates into Red Team telemetry events."""
    custom_target = "AUTH-PROD-02"
    res = client.post("/api/exercises", json={
        "scenarioId": "scenario-suspicious-auth",
        "difficulty": "intermediate",
        "targetAsset": custom_target,
        "seed": 99,
        "mode": "manual",
        "simulationDuration": 15
    })
    assert res.status_code == 200
    ex_id = res.json()["id"]

    # Start and step to detecting phase
    client.post(f"/api/exercises/{ex_id}/start")
    client.post(f"/api/exercises/{ex_id}/step") # running
    client.post(f"/api/exercises/{ex_id}/step") # detecting

    # Verify telemetry has custom target
    tel_res = client.get(f"/api/exercises/{ex_id}/telemetry")
    assert tel_res.status_code == 200
    telemetry = tel_res.json()
    login_fails = [t for t in telemetry if t["type"] == "LOGIN_FAILED"]
    assert len(login_fails) > 0
    assert all(t["sourceAsset"] == custom_target for t in login_fails)


def test_lifecycle_fsm_guards():
    """Verifies that invalid state transitions are blocked with HTTP 400."""
    # 1. Create and complete an exercise
    res = client.post("/api/exercises", json={
        "scenarioId": "scenario-web-misconfig",
        "difficulty": "beginner",
        "mode": "manual"
    })
    ex_id = res.json()["id"]
    client.post(f"/api/exercises/{ex_id}/start")

    # Step through to completion
    for _ in range(7):
        client.post(f"/api/exercises/{ex_id}/step")

    completed_ex = client.get(f"/api/exercises/{ex_id}").json()
    assert completed_ex["status"] == "completed"

    # A. Attempting to start a completed exercise MUST fail with 400
    restart_res = client.post(f"/api/exercises/{ex_id}/start")
    assert restart_res.status_code == 400
    assert "terminal status" in restart_res.json()["detail"]

    # B. Attempting to cancel a completed exercise MUST fail with 400
    cancel_res = client.post(f"/api/exercises/{ex_id}/cancel")
    assert cancel_res.status_code == 400
    assert "terminal status" in cancel_res.json()["detail"]

    # C. Attempting to step a completed exercise MUST fail with 400
    step_res = client.post(f"/api/exercises/{ex_id}/step")
    assert step_res.status_code == 400

    # D. Attempting to respond to an unstarted/completed exercise MUST fail with 400
    respond_res = client.post(f"/api/exercises/{ex_id}/respond", json={
        "incidentId": "inc-none",
        "playbookName": "test-playbook",
        "targetAsset": "WEB-01"
    })
    assert respond_res.status_code == 400
    assert "must be running" in respond_res.json()["detail"]


def test_alert_timestamp_causality():
    """Verifies alerts never have a timestamp earlier than the telemetry event that caused them."""
    sentinel = BlueTeamSentinel()
    def get_ts(offset): return f"2026-10-10T12:00:0{offset}Z"

    causing_event_ts = "2026-10-10T12:00:05Z"
    events = [
        {"type": "LOGIN_FAILED", "sourceAsset": "AUTH-01", "actor": "emp1", "timestamp": causing_event_ts, "isMalicious": True},
        {"type": "LOGIN_FAILED", "sourceAsset": "AUTH-01", "actor": "emp1", "timestamp": causing_event_ts, "isMalicious": True},
        {"type": "LOGIN_FAILED", "sourceAsset": "AUTH-01", "actor": "emp1", "timestamp": causing_event_ts, "isMalicious": True}
    ]
    alerts, _ = sentinel.analyze(events, "ex-causality", "detecting", get_ts)
    assert len(alerts) == 1
    # Alert timestamp must be >= causing event timestamp
    assert alerts[0]["timestamp"] >= causing_event_ts


@pytest.mark.asyncio
async def test_all_six_scenarios_execution():
    """Executes all 6 MITRE ATT&CK scenarios in fast simulation mode to verify end-to-end viability."""
    scenarios = list_all_scenarios()
    assert len(scenarios) == 6

    for sc in scenarios:
        ex_id = f"test-all-sc-{sc['id']}"
        save_exercise({
            "id": ex_id,
            "number": 5000,
            "scenarioId": sc["id"],
            "scenarioName": sc["name"],
            "environmentId": "env-acme-web-platform",
            "mode": "automatic",
            "difficulty": "intermediate",
            "seed": 77,
            "status": "created",
            "currentPhase": "created",
            "createdAt": "2026-10-10T12:00:00Z"
        })
        await run_simulation_loop(ex_id, fast_mode=True)
        final_ex = get_exercise(ex_id)
        assert final_ex["status"] == "completed"

        tel = get_telemetry_by_exercise(ex_id)
        assert len(tel) > 0
        alerts = get_alerts_by_exercise(ex_id)
        assert len(alerts) > 0


def test_referee_multi_incident_investigation_scoring():
    """Verifies Referee scores investigation completeness across multiple incidents correctly."""
    gt = [
        {"id": "gt-01", "name": "Test1", "phase": "detecting", "targetAsset": "AUTH-01", "criticality": "high", "mitreTactic": "Access"},
        {"id": "gt-02", "name": "Test2", "phase": "detecting", "targetAsset": "DB-01", "criticality": "high", "mitreTactic": "Collection"}
    ]
    referee = RefereeAgent(gt)

    telemetry = [
        {"id": "t1", "sourceAsset": "AUTH-01", "isMalicious": True, "groundTruthObjectiveId": "gt-01"},
        {"id": "t2", "sourceAsset": "DB-01", "isMalicious": True, "groundTruthObjectiveId": "gt-02"}
    ]
    alerts = [
        {"id": "a1", "ruleId": "RULE-AUTH-BRUTE", "sourceAsset": "AUTH-01", "groundTruthDetected": True},
        {"id": "a2", "ruleId": "RULE-DATA-EXFIL", "sourceAsset": "DB-01", "groundTruthDetected": True}
    ]
    incidents = [
        {"id": "i1", "sourceAsset": "AUTH-01", "status": "contained", "evidence": ["ev1", "ev2"]},
        {"id": "i2", "sourceAsset": "DB-01", "status": "contained", "evidence": ["ev3"]}
    ]
    responses = [
        {"id": "r1", "status": "executed"},
        {"id": "r2", "status": "executed"}
    ]

    res = referee.evaluate("ex-multi", telemetry=telemetry, alerts=alerts, incidents=incidents, responses=responses)
    assert res["resilienceScore"] >= 75.0
    # Investigation metric must reflect evidence from both incidents
    inv_metric = next(m for m in res["metricsBreakdown"]["blueTeam"] if m["name"] == "Investigation Quality")
    assert inv_metric["score"] >= 80.0


def test_benign_noise_flagging():
    """Verifies that background noise events are marked isMalicious=False and adversary events isMalicious=True."""
    scenario = SCENARIOS["scenario-suspicious-auth"]
    red = RedTeamAgent(scenario, difficulty="intermediate", seed=42)
    def get_ts(offset): return "2026-10-10T12:00:00Z"

    # At 4000ms, benign noise is emitted
    events = red.tick(4000, "ex-noise", "running", get_ts)
    benign = [e for e in events if not e["isMalicious"]]
    assert len(benign) >= 1
    assert benign[0]["actor"] in ["employee_001", "service_account_01", "monitoring_agent"]
    assert benign[0]["data"]["status"] == 200

    # At 5000ms, attack events are emitted
    attack_events = red.tick(5000, "ex-noise", "detecting", get_ts)
    malicious = [e for e in attack_events if e["isMalicious"]]
    assert len(malicious) >= 3
    assert all(e["groundTruthObjectiveId"] is not None for e in malicious)
