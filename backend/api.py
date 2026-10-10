import uuid
from datetime import datetime, timezone
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from database import exercise_store, telemetry_store, incident_store, score_store
from simulation import start_simulation
from models import ExerciseConfig

app = FastAPI(title="HavenSec Arena API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok", "message": "HavenSec Arena API running in Python/FastAPI"}

@app.get("/api/exercises")
def get_exercises():
    return exercise_store.values()

@app.post("/api/exercises")
def create_exercise(config: ExerciseConfig):
    ex_id = f"ex-{uuid.uuid4().hex[:8]}"
    now = datetime.now(timezone.utc).isoformat()
    ex = {
        "id": ex_id,
        "number": len(exercise_store.values()) + 1,
        "scenarioId": "scenario-suspicious-auth",
        "scenarioName": config.scenario,
        "environmentId": "env-acme-web-platform",
        "mode": "manual",
        "difficulty": config.difficulty,
        "status": "created",
        "currentPhase": "created",
        "createdAt": now,
        "config": config.dict()
    }
    exercise_store.set(ex_id, ex)
    return ex

@app.post("/api/exercises/{exercise_id}/start")
async def start_exercise(exercise_id: str):
    ex = exercise_store.get(exercise_id)
    if not ex:
        raise HTTPException(status_code=404, detail="Exercise not found")
    if ex["status"] != "running":
        start_simulation(exercise_id)
    return exercise_store.get(exercise_id)

@app.get("/api/exercises/{exercise_id}/telemetry")
def get_telemetry(exercise_id: str):
    return telemetry_store.get(exercise_id) or []

@app.get("/api/exercises/{exercise_id}/incidents")
def get_incidents(exercise_id: str):
    return incident_store.get(exercise_id) or []

@app.get("/api/exercises/{exercise_id}/score")
def get_score(exercise_id: str):
    return score_store.get(exercise_id)
