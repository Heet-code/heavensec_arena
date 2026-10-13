"""
API integration tests verifying endpoints using FastAPI TestClient.
"""

import pytest
from fastapi.testclient import TestClient
from api import app
from database import init_db

client = TestClient(app)

def setup_module(module):
    init_db()

def test_health_check():
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "ok"
    assert "FastAPI" in data["engine"]

def test_scenario_endpoints():
    res = client.get("/api/scenarios")
    assert res.status_code == 200
    scenarios = res.json()
    assert len(scenarios) >= 6
    assert any(s["id"] == "scenario-suspicious-auth" for s in scenarios)

    detail_res = client.get("/api/scenarios/scenario-suspicious-auth")
    assert detail_res.status_code == 200
    assert detail_res.json()["name"] == "Suspicious Authentication / Brute Force"

def test_environment_endpoint():
    res = client.get("/api/environment")
    assert res.status_code == 200
    data = res.json()
    assert len(data["assets"]) >= 5

def test_exercise_creation_and_lifecycle():
    # 1. Create exercise
    create_res = client.post("/api/exercises", json={
        "scenarioId": "scenario-api-security",
        "difficulty": "intermediate",
        "targetAsset": "API-01",
        "seed": 1337,
        "mode": "autonomous",
        "simulationDuration": 15
    })
    assert create_res.status_code == 200
    ex = create_res.json()
    ex_id = ex["id"]
    assert ex["status"] == "created"
    assert ex["seed"] == 1337

    # 2. Get exercise detail
    get_res = client.get(f"/api/exercises/{ex_id}")
    assert get_res.status_code == 200
    assert get_res.json()["scenarioId"] == "scenario-api-security"

    # 3. Start exercise
    start_res = client.post(f"/api/exercises/{ex_id}/start")
    assert start_res.status_code == 200
    assert start_res.json()["status"] == "running"

    # 4. Cancel exercise
    cancel_res = client.post(f"/api/exercises/{ex_id}/cancel")
    assert cancel_res.status_code == 200
    assert cancel_res.json()["status"] == "cancelled"

def test_system_health_and_orchestrator():
    # 1. System health check
    res = client.get("/api/system/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "operational"
    assert data["database"]["connected"] is True
    assert "exercises" in data["database"]["tables"]
    assert data["academicContext"]["student"] == "Heet Kalthiya"
    assert data["academicContext"]["institution"] == "Tapi Diploma Engineering College"

    # 2. Orchestrator info
    orch_res = client.get("/api/system/orchestrator")
    assert orch_res.status_code == 200
    orch_data = orch_res.json()
    assert orch_data["activeMode"] in ["builtin", "external"]
    assert orch_data["vendorIndependence"] is True

    # 3. Change mode and verify
    mode_res = client.post("/api/system/orchestrator/mode", json={"mode": "external"})
    assert mode_res.status_code == 200
    assert mode_res.json()["newMode"] == "external"

    # Reset back to builtin
    reset_res = client.post("/api/system/orchestrator/mode", json={"mode": "builtin"})
    assert reset_res.status_code == 200
    assert reset_res.json()["newMode"] == "builtin"

def test_manual_mode_endpoints():
    # 1. Create exercise with manual mode
    create_res = client.post("/api/exercises", json={
        "scenarioId": "scenario-suspicious-auth",
        "difficulty": "intermediate",
        "targetAsset": "AUTH-01",
        "seed": 42,
        "mode": "manual",
        "simulationDuration": 15
    })
    assert create_res.status_code == 200
    ex = create_res.json()
    ex_id = ex["id"]
    assert ex["mode"] == "manual"

    # 2. Start
    start_res = client.post(f"/api/exercises/{ex_id}/start")
    assert start_res.status_code == 200
    assert start_res.json()["status"] == "running"

    # 3. Step through phases
    s1 = client.post(f"/api/exercises/{ex_id}/step")
    assert s1.status_code == 200
    assert s1.json()["phase"] == "running"

    s2 = client.post(f"/api/exercises/{ex_id}/step")
    assert s2.status_code == 200
    assert s2.json()["phase"] == "detecting"

    s3 = client.post(f"/api/exercises/{ex_id}/step")
    assert s3.status_code == 200
    assert s3.json()["phase"] == "investigating"

    # 4. Check incidents and execute manual response
    inc_res = client.get(f"/api/exercises/{ex_id}/incidents")
    assert inc_res.status_code == 200
    incidents = inc_res.json()
    assert len(incidents) > 0
    inc_id = incidents[0]["id"]

    resp_res = client.post(f"/api/exercises/{ex_id}/respond", json={
        "incidentId": inc_id,
        "playbookName": "host-isolation",
        "targetAsset": "AUTH-01",
        "rationale": "Manual quarantine applied by SOC operator."
    })
    assert resp_res.status_code == 200
    assert resp_res.json()["responseAction"]["status"] == "executed"
    assert resp_res.json()["incident"]["status"] == "contained"

    # 5. Complete steps
    s4 = client.post(f"/api/exercises/{ex_id}/step")
    assert s4.status_code == 200
    assert s4.json()["phase"] == "responding"

    s5 = client.post(f"/api/exercises/{ex_id}/step")
    assert s5.status_code == 200
    assert s5.json()["phase"] == "evaluating"

    eval_res = client.get(f"/api/exercises/{ex_id}/evaluation")
    assert eval_res.status_code == 200
    assert eval_res.json()["resilienceScore"] > 0

    s6 = client.post(f"/api/exercises/{ex_id}/step")
    assert s6.status_code == 200
    assert s6.json()["phase"] == "completed"
