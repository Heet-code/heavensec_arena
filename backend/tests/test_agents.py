"""
Unit tests for agent behaviors: Red Team synthetic generation, Blue Sentinel detection rules,
Investigation Analyst correlation, and Response Commander playbooks.
"""

import pytest
from simulation.scenarios import get_scenario
from simulation.agents import RedTeamAgent, BlueTeamSentinel, InvestigationAnalyst, ResponseCommander

def test_red_team_generation():
    scenario = get_scenario("scenario-suspicious-auth")
    red = RedTeamAgent(scenario, difficulty="intermediate", seed=100)
    
    def get_ts(offset): return "2026-10-10T12:00:00Z"

    events_0 = red.tick(0, "ex-1", "preparing", get_ts)
    assert len(events_0) >= 0

    events_2 = red.tick(2000, "ex-1", "running", get_ts)
    assert any(e["type"] == "HTTP_REQUEST" for e in events_2)

    events_5 = red.tick(5000, "ex-1", "detecting", get_ts)
    login_fails = [e for e in events_5 if e["type"] == "LOGIN_FAILED"]
    assert len(login_fails) == 5

def test_blue_sentinel_brute_force_detection():
    sentinel = BlueTeamSentinel()
    def get_ts(offset): return "2026-10-10T12:00:01Z"

    fake_events = [
        {"type": "LOGIN_FAILED", "sourceAsset": "AUTH-01", "actor": "emp1", "isMalicious": True},
        {"type": "LOGIN_FAILED", "sourceAsset": "AUTH-01", "actor": "emp1", "isMalicious": True},
        {"type": "LOGIN_FAILED", "sourceAsset": "AUTH-01", "actor": "emp1", "isMalicious": True}
    ]
    alerts, tel = sentinel.analyze(fake_events, "ex-1", "detecting", get_ts)
    
    assert len(alerts) == 1
    assert alerts[0]["ruleId"] == "RULE-AUTH-BRUTE"
    assert alerts[0]["groundTruthDetected"] is True
    assert sentinel.first_detection_ts is not None

def test_investigation_and_response_lifecycle():
    analyst = InvestigationAnalyst()
    commander = ResponseCommander()
    def get_ts(offset): return "2026-10-10T12:00:02Z"

    fake_alerts = [
        {"id": "a1", "title": "Brute Force", "ruleId": "RULE-AUTH-BRUTE", "severity": "high", "sourceAsset": "AUTH-01", "evidence": ["3 fails"], "timestamp": get_ts(0)}
    ]
    incidents, tel = analyst.analyze(fake_alerts, "ex-1", "investigating", get_ts)
    assert len(incidents) == 1
    assert incidents[0]["status"] == "investigating"
    assert incidents[0]["sourceAsset"] == "AUTH-01"

    # Commander executes playbook
    responses, updated_inc, cmd_tel = commander.analyze(incidents, "ex-1", "responding", get_ts)
    assert len(responses) == 1
    assert responses[0]["playbookName"] == "PLAYBOOK-IAM-LOCKOUT"
    assert responses[0]["status"] == "executed"
    assert updated_inc[0]["status"] == "contained"
