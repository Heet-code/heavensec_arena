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
