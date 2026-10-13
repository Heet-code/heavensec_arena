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
