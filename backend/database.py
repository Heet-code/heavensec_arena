import sqlite3
import json
import os
from typing import List, Dict, Any, Optional

DB_PATH = os.path.join(os.path.dirname(__file__), "database.sqlite")

def get_db(db_path: Optional[str] = None):
    path = db_path or DB_PATH
    conn = sqlite3.connect(path, timeout=30.0)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn

def init_db(db_path: Optional[str] = None):
    conn = get_db(db_path)
    cursor = conn.cursor()
    
    # 1. Scenarios Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS scenarios (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT NOT NULL,
            category TEXT NOT NULL,
            difficulty TEXT NOT NULL,
            techniques_json TEXT NOT NULL,
            target_assets_json TEXT NOT NULL,
            expected_outcome TEXT NOT NULL,
            mitre_tactics_json TEXT NOT NULL,
            ground_truth_objectives_json TEXT NOT NULL
        );
    """)

    # 2. Exercises Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS exercises (
            id TEXT PRIMARY KEY,
            number INTEGER NOT NULL,
            scenario_id TEXT NOT NULL,
            scenario_name TEXT NOT NULL,
            environment_id TEXT NOT NULL,
            mode TEXT NOT NULL DEFAULT 'autonomous',
            difficulty TEXT NOT NULL,
            seed INTEGER NOT NULL,
            status TEXT NOT NULL,
            current_phase TEXT NOT NULL,
            started_at TEXT,
            ended_at TEXT,
            duration_seconds INTEGER,
            previous_exercise_id TEXT,
            config_json TEXT NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY (previous_exercise_id) REFERENCES exercises(id)
        );
    """)
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_exercises_status ON exercises(status);")

    # 3. Telemetry Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS telemetry (
            id TEXT PRIMARY KEY,
            exercise_id TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            type TEXT NOT NULL,
            source_asset TEXT NOT NULL,
            actor TEXT NOT NULL,
            severity TEXT NOT NULL,
            phase TEXT NOT NULL,
            data_json TEXT NOT NULL,
            ground_truth_objective_id TEXT,
            is_malicious INTEGER NOT NULL DEFAULT 0,
            FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
        );
    """)
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_telemetry_exercise ON telemetry(exercise_id);")

    # 4. Alerts Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS alerts (
            id TEXT PRIMARY KEY,
            exercise_id TEXT NOT NULL,
            rule_id TEXT NOT NULL,
            title TEXT NOT NULL,
            severity TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            source_asset TEXT NOT NULL,
            evidence_json TEXT NOT NULL,
            ground_truth_detected INTEGER NOT NULL DEFAULT 0,
            FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
        );
    """)
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_alerts_exercise ON alerts(exercise_id);")

    # 5. Incidents Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS incidents (
            id TEXT PRIMARY KEY,
            exercise_id TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            severity TEXT NOT NULL,
            status TEXT NOT NULL,
            source_asset TEXT NOT NULL,
            detected_at TEXT NOT NULL,
            resolved_at TEXT,
            assigned_agent TEXT NOT NULL,
            evidence_json TEXT NOT NULL,
            affected_assets_json TEXT NOT NULL,
            response_actions_json TEXT NOT NULL,
            FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
        );
    """)
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_incidents_exercise ON incidents(exercise_id);")

    # 6. Response Actions Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS response_actions (
            id TEXT PRIMARY KEY,
            exercise_id TEXT NOT NULL,
            incident_id TEXT NOT NULL,
            playbook_name TEXT NOT NULL,
            target_asset TEXT NOT NULL,
            action_type TEXT NOT NULL,
            status TEXT NOT NULL,
            rationale TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE,
            FOREIGN KEY (incident_id) REFERENCES incidents(id) ON DELETE CASCADE
        );
    """)
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_responses_exercise ON response_actions(exercise_id);")

    # 7. Evaluations Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS evaluations (
            id TEXT PRIMARY KEY,
            exercise_id TEXT NOT NULL UNIQUE,
            red_team_score REAL NOT NULL,
            blue_team_score REAL NOT NULL,
            resilience_score REAL NOT NULL,
            metrics_breakdown_json TEXT NOT NULL,
            deductions_json TEXT NOT NULL,
            bonuses_json TEXT NOT NULL,
            limitations_json TEXT NOT NULL,
            summary TEXT NOT NULL,
            evaluated_at TEXT NOT NULL,
            FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
        );
    """)

    # 8. Coach Recommendations Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS coach_recommendations (
            id TEXT PRIMARY KEY,
            exercise_id TEXT NOT NULL UNIQUE,
            priority_weakness TEXT NOT NULL,
            recommendation_text TEXT NOT NULL,
            rationale TEXT NOT NULL,
            evidence_refs_json TEXT NOT NULL,
            recommended_scenario_id TEXT NOT NULL,
            recommended_difficulty TEXT NOT NULL,
            follow_up_exercise_id TEXT,
            created_at TEXT NOT NULL,
            FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE,
            FOREIGN KEY (follow_up_exercise_id) REFERENCES exercises(id)
        );
    """)

    conn.commit()
    conn.close()

# Database CRUD Operations
def save_exercise(exercise: Dict[str, Any], db_path: Optional[str] = None):
    conn = get_db(db_path)
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO exercises (
            id, number, scenario_id, scenario_name, environment_id, mode, difficulty,
            seed, status, current_phase, started_at, ended_at, duration_seconds,
            previous_exercise_id, config_json, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
            status=excluded.status,
            current_phase=excluded.current_phase,
            started_at=excluded.started_at,
            ended_at=excluded.ended_at,
            duration_seconds=excluded.duration_seconds;
    """, (
        exercise["id"], exercise["number"], exercise["scenarioId"], exercise["scenarioName"],
        exercise["environmentId"], exercise.get("mode", "autonomous"), exercise["difficulty"],
        exercise.get("seed", 42), exercise["status"], exercise["currentPhase"],
        exercise.get("startedAt"), exercise.get("endedAt"), exercise.get("durationSeconds"),
        exercise.get("previousExerciseId"), json.dumps(exercise.get("config", {})),
        exercise["createdAt"]
    ))
    conn.commit()
    conn.close()

def get_exercise(exercise_id: str, db_path: Optional[str] = None) -> Optional[Dict[str, Any]]:
    conn = get_db(db_path)
    cur = conn.cursor()
    cur.execute("SELECT * FROM exercises WHERE id = ?", (exercise_id,))
    row = cur.fetchone()
    conn.close()
    if not row:
        return None
    return {
        "id": row["id"],
        "number": row["number"],
        "scenarioId": row["scenario_id"],
        "scenarioName": row["scenario_name"],
        "environmentId": row["environment_id"],
        "mode": row["mode"],
        "difficulty": row["difficulty"],
        "seed": row["seed"],
        "status": row["status"],
        "currentPhase": row["current_phase"],
        "startedAt": row["started_at"],
        "endedAt": row["ended_at"],
        "durationSeconds": row["duration_seconds"],
        "previousExerciseId": row["previous_exercise_id"],
        "config": json.loads(row["config_json"]),
        "createdAt": row["created_at"]
    }

def list_exercises(db_path: Optional[str] = None) -> List[Dict[str, Any]]:
    conn = get_db(db_path)
    cur = conn.cursor()
    cur.execute("SELECT * FROM exercises ORDER BY number DESC")
    rows = cur.fetchall()
    conn.close()
    return [{
        "id": row["id"],
        "number": row["number"],
        "scenarioId": row["scenario_id"],
        "scenarioName": row["scenario_name"],
        "environmentId": row["environment_id"],
        "mode": row["mode"],
        "difficulty": row["difficulty"],
        "seed": row["seed"],
        "status": row["status"],
        "currentPhase": row["current_phase"],
        "startedAt": row["started_at"],
        "endedAt": row["ended_at"],
        "durationSeconds": row["duration_seconds"],
        "previousExerciseId": row["previous_exercise_id"],
        "config": json.loads(row["config_json"]),
        "createdAt": row["created_at"]
    } for row in rows]

def save_telemetry_batch(events: List[Dict[str, Any]], db_path: Optional[str] = None):
    if not events:
        return
    conn = get_db(db_path)
    cur = conn.cursor()
    cur.executemany("""
        INSERT OR REPLACE INTO telemetry (
            id, exercise_id, timestamp, type, source_asset, actor, severity, phase,
            data_json, ground_truth_objective_id, is_malicious
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    """, [(
        e["id"], e["exerciseId"], e["timestamp"], e["type"], e["sourceAsset"],
        e["actor"], e["severity"], e["phase"], json.dumps(e.get("data", {})),
        e.get("groundTruthObjectiveId"), 1 if e.get("isMalicious") else 0
    ) for e in events])
    conn.commit()
    conn.close()

def get_telemetry_by_exercise(exercise_id: str, db_path: Optional[str] = None) -> List[Dict[str, Any]]:
    conn = get_db(db_path)
    cur = conn.cursor()
    cur.execute("SELECT * FROM telemetry WHERE exercise_id = ? ORDER BY timestamp ASC", (exercise_id,))
    rows = cur.fetchall()
    conn.close()
    return [{
        "id": row["id"],
        "exerciseId": row["exercise_id"],
        "timestamp": row["timestamp"],
        "type": row["type"],
        "sourceAsset": row["source_asset"],
        "actor": row["actor"],
        "severity": row["severity"],
        "phase": row["phase"],
        "data": json.loads(row["data_json"]),
        "groundTruthObjectiveId": row["ground_truth_objective_id"],
        "isMalicious": bool(row["is_malicious"])
    } for row in rows]

def save_alerts_batch(alerts: List[Dict[str, Any]], db_path: Optional[str] = None):
    if not alerts:
        return
    conn = get_db(db_path)
    cur = conn.cursor()
    cur.executemany("""
        INSERT OR REPLACE INTO alerts (
            id, exercise_id, rule_id, title, severity, timestamp, source_asset, evidence_json, ground_truth_detected
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
    """, [(
        a["id"], a["exerciseId"], a["ruleId"], a["title"], a["severity"],
        a["timestamp"], a["sourceAsset"], json.dumps(a.get("evidence", [])),
        1 if a.get("groundTruthDetected") else 0
    ) for a in alerts])
    conn.commit()
    conn.close()

def get_alerts_by_exercise(exercise_id: str, db_path: Optional[str] = None) -> List[Dict[str, Any]]:
    conn = get_db(db_path)
    cur = conn.cursor()
    cur.execute("SELECT * FROM alerts WHERE exercise_id = ? ORDER BY timestamp ASC", (exercise_id,))
    rows = cur.fetchall()
    conn.close()
    return [{
        "id": row["id"],
        "exerciseId": row["exercise_id"],
        "ruleId": row["rule_id"],
        "title": row["title"],
        "severity": row["severity"],
        "timestamp": row["timestamp"],
        "sourceAsset": row["source_asset"],
        "evidence": json.loads(row["evidence_json"]),
        "groundTruthDetected": bool(row["ground_truth_detected"])
    } for row in rows]

def save_incident(incident: Dict[str, Any], db_path: Optional[str] = None):
    conn = get_db(db_path)
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO incidents (
            id, exercise_id, title, description, severity, status, source_asset,
            detected_at, resolved_at, assigned_agent, evidence_json,
            affected_assets_json, response_actions_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
            status=excluded.status,
            resolved_at=excluded.resolved_at,
            evidence_json=excluded.evidence_json,
            affected_assets_json=excluded.affected_assets_json,
            response_actions_json=excluded.response_actions_json;
    """, (
        incident["id"], incident["exerciseId"], incident["title"], incident["description"],
        incident["severity"], incident["status"], incident.get("sourceAsset", incident.get("affectedAsset", "UNKNOWN")),
        incident["detectedAt"], incident.get("resolvedAt"), incident.get("assignedAgent", "Blue Sentinel"),
        json.dumps(incident.get("evidence", [])), json.dumps(incident.get("affectedAssets", [])),
        json.dumps(incident.get("responseActions", []))
    ))
    conn.commit()
    conn.close()

def get_incidents_by_exercise(exercise_id: str, db_path: Optional[str] = None) -> List[Dict[str, Any]]:
    conn = get_db(db_path)
    cur = conn.cursor()
    cur.execute("SELECT * FROM incidents WHERE exercise_id = ? ORDER BY detected_at ASC", (exercise_id,))
    rows = cur.fetchall()
    conn.close()
    return [{
        "id": row["id"],
        "exerciseId": row["exercise_id"],
        "title": row["title"],
        "description": row["description"],
        "severity": row["severity"],
        "status": row["status"],
        "sourceAsset": row["source_asset"],
        "detectedAt": row["detected_at"],
        "resolvedAt": row["resolved_at"],
        "assignedAgent": row["assigned_agent"],
        "evidence": json.loads(row["evidence_json"]),
        "affectedAssets": json.loads(row["affected_assets_json"]),
        "responseActions": json.loads(row["response_actions_json"])
    } for row in rows]

def save_response_action(action: Dict[str, Any], db_path: Optional[str] = None):
    conn = get_db(db_path)
    cur = conn.cursor()
    cur.execute("""
        INSERT OR REPLACE INTO response_actions (
            id, exercise_id, incident_id, playbook_name, target_asset, action_type, status, rationale, timestamp
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
    """, (
        action["id"], action["exerciseId"], action["incidentId"], action["playbookName"],
        action["targetAsset"], action.get("actionType", "containment"), action["status"], action["rationale"], action["timestamp"]
    ))
    conn.commit()
    conn.close()

def get_responses_by_exercise(exercise_id: str, db_path: Optional[str] = None) -> List[Dict[str, Any]]:
    conn = get_db(db_path)
    cur = conn.cursor()
    cur.execute("SELECT * FROM response_actions WHERE exercise_id = ? ORDER BY timestamp ASC", (exercise_id,))
    rows = cur.fetchall()
    conn.close()
    return [{
        "id": row["id"],
        "exerciseId": row["exercise_id"],
        "incidentId": row["incident_id"],
        "playbookName": row["playbook_name"],
        "targetAsset": row["target_asset"],
        "actionType": row["action_type"],
        "status": row["status"],
        "rationale": row["rationale"],
        "timestamp": row["timestamp"]
    } for row in rows]

def save_evaluation(evaluation: Dict[str, Any], db_path: Optional[str] = None):
    conn = get_db(db_path)
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO evaluations (
            id, exercise_id, red_team_score, blue_team_score, resilience_score,
            metrics_breakdown_json, deductions_json, bonuses_json, limitations_json, summary, evaluated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(exercise_id) DO UPDATE SET
            red_team_score=excluded.red_team_score,
            blue_team_score=excluded.blue_team_score,
            resilience_score=excluded.resilience_score,
            metrics_breakdown_json=excluded.metrics_breakdown_json,
            deductions_json=excluded.deductions_json,
            bonuses_json=excluded.bonuses_json,
            limitations_json=excluded.limitations_json,
            summary=excluded.summary,
            evaluated_at=excluded.evaluated_at;
    """, (
        evaluation["id"], evaluation["exerciseId"], evaluation["redTeamScore"],
        evaluation["blueTeamScore"], evaluation["resilienceScore"],
        json.dumps(evaluation.get("metricsBreakdown", {})),
        json.dumps(evaluation.get("deductions", [])),
        json.dumps(evaluation.get("bonuses", [])),
        json.dumps(evaluation.get("limitations", [])),
        evaluation["summary"], evaluation["evaluatedAt"]
    ))
    conn.commit()
    conn.close()

def get_evaluation(exercise_id: str, db_path: Optional[str] = None) -> Optional[Dict[str, Any]]:
    conn = get_db(db_path)
    cur = conn.cursor()
    cur.execute("SELECT * FROM evaluations WHERE exercise_id = ?", (exercise_id,))
    row = cur.fetchone()
    conn.close()
    if not row:
        return None
    return {
        "id": row["id"],
        "exerciseId": row["exercise_id"],
        "redTeamScore": row["red_team_score"],
        "blueTeamScore": row["blue_team_score"],
        "resilienceScore": row["resilience_score"],
        "metricsBreakdown": json.loads(row["metrics_breakdown_json"]),
        "deductions": json.loads(row["deductions_json"]),
        "bonuses": json.loads(row["bonuses_json"]),
        "limitations": json.loads(row["limitations_json"]),
        "summary": row["summary"],
        "evaluatedAt": row["evaluated_at"]
    }

def save_coach_recommendation(rec: Dict[str, Any], db_path: Optional[str] = None):
    conn = get_db(db_path)
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO coach_recommendations (
            id, exercise_id, priority_weakness, recommendation_text, rationale,
            evidence_refs_json, recommended_scenario_id, recommended_difficulty,
            follow_up_exercise_id, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(exercise_id) DO UPDATE SET
            priority_weakness=excluded.priority_weakness,
            recommendation_text=excluded.recommendation_text,
            rationale=excluded.rationale,
            evidence_refs_json=excluded.evidence_refs_json,
            recommended_scenario_id=excluded.recommended_scenario_id,
            recommended_difficulty=excluded.recommended_difficulty,
            follow_up_exercise_id=excluded.follow_up_exercise_id;
    """, (
        rec["id"], rec["exerciseId"], rec["priorityWeakness"], rec["recommendationText"],
        rec["rationale"], json.dumps(rec.get("evidenceRefs", [])),
        rec["recommendedScenarioId"], rec["recommendedDifficulty"],
        rec.get("followUpExerciseId"), rec["createdAt"]
    ))
    conn.commit()
    conn.close()

def get_coach_recommendation(exercise_id: str, db_path: Optional[str] = None) -> Optional[Dict[str, Any]]:
    conn = get_db(db_path)
    cur = conn.cursor()
    cur.execute("SELECT * FROM coach_recommendations WHERE exercise_id = ?", (exercise_id,))
    row = cur.fetchone()
    conn.close()
    if not row:
        return None
    return {
        "id": row["id"],
        "exerciseId": row["exercise_id"],
        "priorityWeakness": row["priority_weakness"],
        "recommendationText": row["recommendation_text"],
        "rationale": row["rationale"],
        "evidenceRefs": json.loads(row["evidence_refs_json"]),
        "recommendedScenarioId": row["recommended_scenario_id"],
        "recommendedDifficulty": row["recommended_difficulty"],
        "followUpExerciseId": row["follow_up_exercise_id"],
        "createdAt": row["created_at"]
    }

# Backward compatibility wrappers if needed
class PersistentMap:
    def __init__(self, namespace: str):
        self.namespace = namespace

    def get(self, key: str):
        if self.namespace == "exercises":
            return get_exercise(key)
        elif self.namespace == "telemetry":
            return get_telemetry_by_exercise(key)
        elif self.namespace == "incidents":
            return get_incidents_by_exercise(key)
        elif self.namespace == "scores":
            return get_evaluation(key)
        return None

    def set(self, key: str, value: Any):
        if self.namespace == "exercises":
            save_exercise(value)
        elif self.namespace == "telemetry":
            save_telemetry_batch(value)
        elif self.namespace == "incidents":
            for inc in value:
                save_incident(inc)
        elif self.namespace == "scores":
            save_evaluation(value)

    def values(self):
        if self.namespace == "exercises":
            return list_exercises()
        return []

exercise_store = PersistentMap("exercises")
telemetry_store = PersistentMap("telemetry")
incident_store = PersistentMap("incidents")
score_store = PersistentMap("scores")

# Auto-initialize database on import
init_db()
