"""
Unit tests for Referee scoring mathematics and edge-case resilience calculations.
"""

import pytest
from simulation.referee import RefereeAgent

def test_referee_empty_events():
    """Referee handles zero events gracefully without division-by-zero crashes."""
    gt = [
        {"id": "gt-01", "name": "Test", "phase": "running", "targetAsset": "AUTH-01", "expectedIndicator": "LOGIN", "criticality": "high", "mitreTactic": "Access"}
    ]
    referee = RefereeAgent(gt)
    result = referee.evaluate("test-ex-0", telemetry=[], alerts=[], incidents=[], responses=[])
    
    assert result["redTeamScore"] == 0.0 or result["redTeamScore"] >= 0.0
    assert result["blueTeamScore"] >= 0.0
    assert result["resilienceScore"] >= 0.0
    assert "metricsBreakdown" in result

def test_referee_full_mitigation():
    """When Blue Team detects and contains all threats, resilience is high."""
    gt = [
        {"id": "gt-01", "name": "Brute Force", "phase": "detecting", "targetAsset": "AUTH-01", "expectedIndicator": "LOGIN_FAILED", "criticality": "high", "mitreTactic": "Credential Access"}
    ]
    referee = RefereeAgent(gt)
    
    telemetry = [
        {"id": "t1", "sourceAsset": "AUTH-01", "isMalicious": True, "groundTruthObjectiveId": "gt-01"}
    ]
    alerts = [
        {"id": "a1", "ruleId": "RULE-AUTH-BRUTE", "sourceAsset": "AUTH-01", "groundTruthDetected": True}
    ]
    incidents = [
        {"id": "i1", "sourceAsset": "AUTH-01", "status": "contained", "evidence": ["ev1", "ev2"]}
    ]
    responses = [
        {"id": "r1", "status": "executed"}
    ]
    
    eval_res = referee.evaluate(
        "test-ex-1", telemetry=telemetry, alerts=alerts, incidents=incidents, responses=responses,
        started_at="2026-10-10T12:00:00Z", first_detection_ts="2026-10-10T12:00:02Z"
    )

    assert eval_res["blueTeamScore"] >= 80.0
    assert eval_res["resilienceScore"] >= 80.0
    assert eval_res["resilienceScore"] != (eval_res["redTeamScore"] + eval_res["blueTeamScore"]) / 2

def test_referee_uncontained_catastrophe():
    """When Red Team succeeds and Blue Team fails to detect/contain, resilience drops and Red score is high."""
    gt = [
        {"id": "gt-01", "name": "Brute Force", "phase": "detecting", "targetAsset": "AUTH-01", "expectedIndicator": "LOGIN_FAILED", "criticality": "high", "mitreTactic": "Credential Access"},
        {"id": "gt-02", "name": "Takeover", "phase": "investigating", "targetAsset": "AUTH-01", "expectedIndicator": "SESSION_HIJACK", "criticality": "critical", "mitreTactic": "Access"}
    ]
    referee = RefereeAgent(gt)

    telemetry = [
        {"id": "t1", "sourceAsset": "AUTH-01", "isMalicious": True, "groundTruthObjectiveId": "gt-01"},
        {"id": "t2", "sourceAsset": "AUTH-01", "isMalicious": True, "groundTruthObjectiveId": "gt-02"}
    ]
    # No alerts, uncontained incident
    incidents = [
        {"id": "i1", "sourceAsset": "AUTH-01", "status": "investigating", "evidence": []}
    ]

    eval_res = referee.evaluate("test-ex-2", telemetry=telemetry, alerts=[], incidents=incidents, responses=[])
    
    assert eval_res["redTeamScore"] >= 80.0
    assert eval_res["blueTeamScore"] <= 20.0
    assert eval_res["resilienceScore"] <= 20.0
