"""
FastAPI REST API Layer for HavenSec Arena.
Exposes validated endpoints for scenarios, exercises, simulation lifecycle,
telemetry, incidents, evaluations, coach recommendations, and cross-run comparisons.
"""

import uuid
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from database import (
    get_db,
    get_exercise, save_exercise, list_exercises,
    get_telemetry_by_exercise, get_alerts_by_exercise,
    get_incidents_by_exercise, get_responses_by_exercise,
    get_evaluation, get_coach_recommendation
)
from models import ExerciseConfig, ExerciseDetail, ManualResponseRequest
from simulation.scenarios import SCENARIOS, SYNTHETIC_ENVIRONMENT, get_scenario, list_all_scenarios
from simulation.engine import start_simulation, cancel_simulation, step_manual_simulation, execute_manual_response
from simulation.coach import CoachEngine
from simulation.orchestration import OrchestrationManager, OrchestrationMode

app = FastAPI(
    title="HavenSec Arena API",
    version="2.0.0",
    description="Deterministic Cyber-Resilience Simulation Platform API"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "HavenSec Arena API",
        "version": "2.0.0",
        "engine": "Python/FastAPI",
        "runtime": "Safe Deterministic Cyber-Range"
    }

@app.get("/api/system/health")
def system_health():
    manager = OrchestrationManager.get_instance()
    health_data = manager.get_system_health()
    
    db_connected = False
    table_count = 0
    tables = []
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';")
        rows = cursor.fetchall()
        tables = [r[0] for r in rows]
        table_count = len(tables)
        db_connected = True
        conn.close()
    except Exception as e:
        db_connected = False

    return {
        "status": "operational",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "database": {
            "connected": db_connected,
            "engine": "SQLite",
            "tableCount": table_count,
            "tables": tables
        },
        "orchestration": health_data,
        "academicContext": {
            "student": "Heet Kalthiya",
            "institution": "Tapi Diploma Engineering College",
            "department": "Information Technology",
            "level": "Semester 5 — Minor Project",
            "projectTitle": "HavenSec Arena"
        }
    }

@app.get("/api/system/orchestrator")
def get_orchestrator_status():
    manager = OrchestrationManager.get_instance()
    return manager.get_system_health()

@app.post("/api/system/orchestrator/mode")
def set_orchestrator_mode(payload: Dict[str, str]):
    mode_str = payload.get("mode", "builtin").lower()
    try:
        mode = OrchestrationMode(mode_str)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid mode. Choose from {[m.value for m in OrchestrationMode]}")
    manager = OrchestrationManager.get_instance()
    manager.set_mode(mode)
    return {"status": "updated", "newMode": mode.value}

# -------------------------------------------------------------
# Scenarios & Synthetic Environment
# -------------------------------------------------------------
@app.get("/api/scenarios")
def get_scenarios():
    return list_all_scenarios()

@app.get("/api/scenarios/{scenario_id}")
def get_scenario_detail(scenario_id: str):
    sc = get_scenario(scenario_id)
    if not sc:
        raise HTTPException(status_code=404, detail="Scenario not found")
    return sc

@app.get("/api/environment")
def get_environment():
    return SYNTHETIC_ENVIRONMENT

# -------------------------------------------------------------
# Exercises Management & Lifecycle
# -------------------------------------------------------------
@app.get("/api/exercises")
def get_exercises():
    return list_exercises()

@app.post("/api/exercises")
def create_exercise(config: ExerciseConfig):
    sc = get_scenario(config.scenarioId)
    if not sc:
        raise HTTPException(status_code=400, detail="Invalid scenario ID specified")

    ex_id = f"ex-{uuid.uuid4().hex[:8]}"
    existing = list_exercises()
    number = len(existing) + 1
    now = datetime.now(timezone.utc).isoformat()

    exercise = {
        "id": ex_id,
        "number": number,
        "scenarioId": config.scenarioId,
        "scenarioName": config.scenarioName or sc["name"],
        "environmentId": SYNTHETIC_ENVIRONMENT["id"],
        "mode": "automatic" if (config.mode or "").lower() in ["automatic", "autonomous"] else "manual",
        "difficulty": config.difficulty,
        "seed": config.seed or 42,
        "targetAsset": config.targetAsset,
        "status": "created",
        "currentPhase": "created",
        "startedAt": None,
        "endedAt": None,
        "durationSeconds": config.simulationDuration,
        "previousExerciseId": config.previousExerciseId,
        "config": config.model_dump() if hasattr(config, "model_dump") else config.dict(),
        "createdAt": now
    }
    save_exercise(exercise)
    return exercise

@app.get("/api/exercises/{exercise_id}")
def get_exercise_detail(exercise_id: str):
    ex = get_exercise(exercise_id)
    if not ex:
        raise HTTPException(status_code=404, detail="Exercise not found")
    
    ex["evaluation"] = get_evaluation(exercise_id)
    ex["recommendation"] = get_coach_recommendation(exercise_id)
    return ex

@app.post("/api/exercises/{exercise_id}/start")
async def start_exercise(exercise_id: str):
    ex = get_exercise(exercise_id)
    if not ex:
        raise HTTPException(status_code=404, detail="Exercise not found")
    if ex["status"] in ["completed", "cancelled", "failed"]:
        raise HTTPException(status_code=400, detail=f"Cannot start exercise {exercise_id} with terminal status '{ex['status']}'")
    if ex["status"] == "running":
        return ex
    ex["status"] = "running"
    ex["currentPhase"] = "preparing"
    if not ex.get("startedAt"):
        ex["startedAt"] = datetime.now(timezone.utc).isoformat()
    save_exercise(ex)
    start_simulation(exercise_id)
    return get_exercise(exercise_id)

@app.post("/api/exercises/{exercise_id}/step")
async def step_exercise(exercise_id: str):
    ex = get_exercise(exercise_id)
    if not ex:
        raise HTTPException(status_code=404, detail="Exercise not found")
    if ex["status"] in ["completed", "cancelled", "failed"]:
        raise HTTPException(status_code=400, detail=f"Cannot step exercise {exercise_id} with terminal status '{ex['status']}'")
    try:
        result = await step_manual_simulation(exercise_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/exercises/{exercise_id}/respond")
def respond_exercise(exercise_id: str, payload: ManualResponseRequest):
    ex = get_exercise(exercise_id)
    if not ex:
        raise HTTPException(status_code=404, detail="Exercise not found")
    if ex["status"] != "running":
        raise HTTPException(status_code=400, detail=f"Cannot execute response on exercise {exercise_id} with status '{ex['status']}' (must be running)")
    result = execute_manual_response(
        exercise_id=exercise_id,
        incident_id=payload.incidentId,
        playbook_name=payload.playbookName,
        target_asset=payload.targetAsset,
        rationale=payload.rationale
    )
    return result

@app.post("/api/exercises/{exercise_id}/cancel")
def cancel_exercise(exercise_id: str):
    ex = get_exercise(exercise_id)
    if not ex:
        raise HTTPException(status_code=404, detail="Exercise not found")
    if ex["status"] in ["completed", "cancelled", "failed"]:
        raise HTTPException(status_code=400, detail=f"Cannot cancel exercise {exercise_id} with terminal status '{ex['status']}'")
    cancel_simulation(exercise_id)
    return get_exercise(exercise_id)

# -------------------------------------------------------------
# Telemetry, Alerts, Incidents, & Responses
# -------------------------------------------------------------
@app.get("/api/exercises/{exercise_id}/telemetry")
def get_telemetry(exercise_id: str):
    return get_telemetry_by_exercise(exercise_id)

@app.get("/api/exercises/{exercise_id}/alerts")
def get_alerts(exercise_id: str):
    return get_alerts_by_exercise(exercise_id)

@app.get("/api/exercises/{exercise_id}/incidents")
def get_incidents(exercise_id: str):
    return get_incidents_by_exercise(exercise_id)

@app.get("/api/exercises/{exercise_id}/responses")
def get_responses(exercise_id: str):
    return get_responses_by_exercise(exercise_id)

# -------------------------------------------------------------
# Referee Evaluation & Resilience Scoring
# -------------------------------------------------------------
@app.get("/api/exercises/{exercise_id}/evaluation")
def get_exercise_evaluation(exercise_id: str):
    ev = get_evaluation(exercise_id)
    if not ev:
        raise HTTPException(status_code=404, detail="Evaluation not yet ready for this exercise")
    return ev

# Backward-compatibility endpoint
@app.get("/api/exercises/{exercise_id}/score")
def get_score_legacy(exercise_id: str):
    ev = get_evaluation(exercise_id)
    if not ev:
        return None
    # Wrap in legacy structure for client compatibility
    return {
        "overall": int(ev["resilienceScore"]),
        "resilienceScore": ev["resilienceScore"],
        "redTeamScore": ev["redTeamScore"],
        "blueTeamScore": ev["blueTeamScore"],
        "summary": ev["summary"],
        "categories": [
            {"category": m["name"], "score": int(m["score"]), "maxScore": int(m["maxScore"]), "details": m["details"], "weight": m["weight"]}
            for m in ev["metricsBreakdown"].get("blueTeam", [])
        ],
        "deductions": ev["deductions"],
        "bonuses": ev["bonuses"],
        "limitations": ev["limitations"]
    }

# -------------------------------------------------------------
# Security Coach & Adaptive Scenario Engine
# -------------------------------------------------------------
@app.get("/api/exercises/{exercise_id}/recommendation")
def get_exercise_recommendation(exercise_id: str):
    rec = get_coach_recommendation(exercise_id)
    if not rec:
        raise HTTPException(status_code=404, detail="Coach recommendation not yet generated")
    return rec

@app.get("/api/exercises/{exercise_id}/comparison")
def get_exercise_comparison(exercise_id: str):
    curr_ex = get_exercise(exercise_id)
    if not curr_ex:
        raise HTTPException(status_code=404, detail="Exercise not found")
    
    prev_id = curr_ex.get("previousExerciseId")
    if not prev_id:
        return {
            "hasComparison": False,
            "message": "This exercise is a baseline exercise without a linked previous run."
        }

    curr_eval = get_evaluation(exercise_id)
    prev_eval = get_evaluation(prev_id)

    if not curr_eval or not prev_eval:
        return {
            "hasComparison": False,
            "message": "Evaluations for both previous and current exercises must be completed."
        }

    comp = CoachEngine.compare_exercises(prev_eval, curr_eval)
    comp["hasComparison"] = True
    return comp

# -------------------------------------------------------------
# Exercise Summary & Report Generation
# -------------------------------------------------------------
@app.get("/api/exercises/{exercise_id}/report")
def get_exercise_report(exercise_id: str):
    ex = get_exercise(exercise_id)
    if not ex:
        raise HTTPException(status_code=404, detail="Exercise not found")
    
    ev = get_evaluation(exercise_id)
    rec = get_coach_recommendation(exercise_id)
    tel = get_telemetry_by_exercise(exercise_id)
    inc = get_incidents_by_exercise(exercise_id)
    resp = get_responses_by_exercise(exercise_id)

    report_md = f"""# HavenSec Arena Exercise Audit Report
**Exercise ID:** `{ex['id']}`
**Scenario:** {ex['scenarioName']} ({ex['scenarioId']})
**Difficulty:** {ex['difficulty'].upper()} | **Reproducibility Seed:** `{ex['seed']}`
**Execution Status:** {ex['status'].upper()} (Phase: {ex['currentPhase'].upper()})
**Timestamps:** Started {ex['startedAt'] or 'N/A'} | Completed {ex['endedAt'] or 'N/A'}

---

## 1. Independent Referee Evaluation
- **Overall System Cyber-Resilience Score:** **{ev['resilienceScore'] if ev else 'Pending'} / 100**
- **Blue Team Defensive Performance:** **{ev['blueTeamScore'] if ev else 'Pending'} / 100**
- **Red Team Adversarial Effectiveness:** **{ev['redTeamScore'] if ev else 'Pending'} / 100**

*Summary:* {ev['summary'] if ev else 'Evaluation pending.'}

### Scoring Deductions & Bonuses
- **Deductions:** {', '.join(ev['deductions']) if ev and ev['deductions'] else 'None'}
- **Bonuses:** {', '.join(ev['bonuses']) if ev and ev['bonuses'] else 'None'}
- **Limitations:** {', '.join(ev['limitations']) if ev and ev['limitations'] else 'None'}

---

## 2. Security Coach Adaptive Recommendations
- **Priority Identified Weakness:** {rec['priorityWeakness'] if rec else 'Pending'}
- **Actionable Guidance:** {rec['recommendationText'] if rec else 'Pending'}
- **Rationale:** {rec['rationale'] if rec else 'Pending'}
- **Recommended Follow-up Scenario:** `{rec['recommendedScenarioId'] if rec else 'Pending'}` ({rec['recommendedDifficulty'] if rec else 'Pending'})

---

## 3. Incident Investigation & Containment Traceability
- **Total Telemetry Events Recorded:** {len(tel)}
- **Correlated Incidents:** {len(inc)}
- **Executed Response Playbooks:** {len(resp)}

*Containment Actions:*
"""
    for r in resp:
        report_md += f"- **[{r['timestamp']}]** `{r['playbookName']}` targeting `{r['targetAsset']}`: {r['rationale']}\n"

    return {"exerciseId": exercise_id, "markdown": report_md}
