"""
Unit tests for Security Coach weakness detection and adaptive scenario selection.
"""

import pytest
from simulation.coach import CoachEngine

def test_coach_weakness_identification_recall():
    """Coach identifies detection recall weakness and recommends auth scenario."""
    eval_mock = {
        "id": "ev-1",
        "resilienceScore": 60.0,
        "blueTeamScore": 55.0,
        "redTeamScore": 80.0,
        "metricsBreakdown": {
            "blueTeam": [
                {"name": "Detection Recall", "score": 50.0},
                {"name": "Detection Precision", "score": 90.0},
                {"name": "Detection Latency", "score": 85.0},
                {"name": "Investigation Quality", "score": 80.0},
                {"name": "Containment Success", "score": 80.0}
            ]
        }
    }
    rec = CoachEngine.analyze_exercise(
        exercise_id="ex-test",
        evaluation=eval_mock,
        telemetry=[{"id": "t1", "isMalicious": True}],
        alerts=[],
        incidents=[],
        responses=[],
        current_scenario_id="scenario-api-security",
        current_difficulty="beginner"
    )

    assert "Recall" in rec["priorityWeakness"]
    assert rec["recommendedScenarioId"] == "scenario-suspicious-auth"
    assert rec["recommendedDifficulty"] == "intermediate"

def test_coach_comparison_delta():
    """Coach compares before and after exercise to calculate measurable improvement."""
    prev_eval = {
        "exerciseId": "ex-1",
        "resilienceScore": 62.0,
        "blueTeamScore": 60.0,
        "redTeamScore": 75.0
    }
    curr_eval = {
        "exerciseId": "ex-2",
        "resilienceScore": 88.0,
        "blueTeamScore": 85.0,
        "redTeamScore": 70.0
    }

    comp = CoachEngine.compare_exercises(prev_eval, curr_eval)
    assert comp["deltaResilience"] == 26.0
    assert comp["deltaBlueScore"] == 25.0
    assert comp["improved"] is True
    assert "measurable improvement" in comp["summary"]
