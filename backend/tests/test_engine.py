"""
Integration tests for Simulation Engine: state machine, seed reproducibility, and fast execution.
"""

import pytest
import asyncio
from database import init_db, save_exercise, get_exercise, get_evaluation, get_coach_recommendation
from simulation.engine import run_simulation_loop

@pytest.mark.asyncio
async def test_full_simulation_loop_fast():
    """Runs a full simulation loop in fast mode and verifies all artifacts are persisted."""
    init_db()
    ex_id = "test-fast-ex-1"
    ex = {
        "id": ex_id,
        "number": 999,
        "scenarioId": "scenario-suspicious-auth",
        "scenarioName": "Suspicious Authentication",
        "environmentId": "env-acme-web-platform",
        "mode": "autonomous",
        "difficulty": "intermediate",
        "seed": 42,
        "status": "created",
        "currentPhase": "created",
        "createdAt": "2026-10-10T12:00:00Z"
    }
    save_exercise(ex)

    # Run loop
    await run_simulation_loop(ex_id, fast_mode=True)

    completed_ex = get_exercise(ex_id)
    assert completed_ex["status"] == "completed"
    assert completed_ex["currentPhase"] == "completed"
    assert completed_ex["endedAt"] is not None

    evaluation = get_evaluation(ex_id)
    assert evaluation is not None
    assert evaluation["resilienceScore"] > 0
    assert evaluation["blueTeamScore"] > 0
    assert evaluation["redTeamScore"] > 0

    recommendation = get_coach_recommendation(ex_id)
    assert recommendation is not None
    assert len(recommendation["priorityWeakness"]) > 0

@pytest.mark.asyncio
async def test_manual_simulation_stepping_and_response():
    """Verifies manual simulation mode: stepping through phases and manual containment response."""
    init_db()
    ex_id = "test-manual-ex-1"
    ex = {
        "id": ex_id,
        "number": 1000,
        "scenarioId": "scenario-suspicious-auth",
        "scenarioName": "Suspicious Authentication",
        "environmentId": "env-acme-web-platform",
        "mode": "manual",
        "difficulty": "intermediate",
        "seed": 42,
        "status": "created",
        "currentPhase": "created",
        "createdAt": "2026-10-10T12:00:00Z"
    }
    save_exercise(ex)

    from simulation.engine import start_simulation, step_manual_simulation, execute_manual_response
    from database import get_incidents_by_exercise, get_responses_by_exercise

    # 1. Start in manual mode
    start_simulation(ex_id)
    started_ex = get_exercise(ex_id)
    assert started_ex["status"] == "running"
    assert started_ex["currentPhase"] == "preparing"

    # 2. Step to 'running'
    res_run = await step_manual_simulation(ex_id)
    assert res_run["phase"] == "running"

    # 3. Step to 'detecting'
    res_det = await step_manual_simulation(ex_id)
    assert res_det["phase"] == "detecting"

    # 4. Step to 'investigating'
    res_inv = await step_manual_simulation(ex_id)
    assert res_inv["phase"] == "investigating"
    incidents = get_incidents_by_exercise(ex_id)
    assert len(incidents) > 0
    target_inc_id = incidents[0]["id"]

    # 5. Execute manual defensive containment response
    resp_res = execute_manual_response(
        exercise_id=ex_id,
        incident_id=target_inc_id,
        playbook_name="host-isolation",
        target_asset="AUTH-01",
        rationale="SOC analyst manually quarantined AUTH-01."
    )
    assert resp_res["responseAction"]["status"] == "executed"
    assert resp_res["incident"]["status"] == "contained"

    # 6. Step to 'responding'
    res_resp = await step_manual_simulation(ex_id)
    assert res_resp["phase"] == "responding"

    # 7. Step to 'evaluating'
    res_eval = await step_manual_simulation(ex_id)
    assert res_eval["phase"] == "evaluating"
    evaluation = get_evaluation(ex_id)
    assert evaluation is not None
    assert evaluation["resilienceScore"] > 0

    # 8. Step to 'completed'
    res_comp = await step_manual_simulation(ex_id)
    assert res_comp["phase"] == "completed"
    final_ex = get_exercise(ex_id)
    assert final_ex["status"] == "completed"
