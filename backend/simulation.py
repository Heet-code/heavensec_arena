import uuid
from datetime import datetime, timezone
import asyncio
from typing import List, Dict, Any, Tuple
from database import exercise_store, telemetry_store, incident_store, score_store

def make_telemetry(exercise_id: str, ts: str, t_type: str, source: str, actor: str, severity: str, phase: str, data: dict) -> dict:
    return {
        "id": f"tel-{uuid.uuid4().hex[:8]}",
        "timestamp": ts,
        "type": t_type,
        "sourceAsset": source,
        "actor": actor,
        "severity": severity,
        "data": data,
        "correlationId": uuid.uuid4().hex,
        "exerciseId": exercise_id,
        "phase": phase
    }

class RedTeamAgent:
    def __init__(self):
        self.step = 0

    def tick(self, current_time_ms: int, exercise_id: str, phase: str, get_ts) -> List[dict]:
        events = []
        if self.step == 0 and current_time_ms >= 2000:
            events.append(make_telemetry(exercise_id, get_ts(2000), 'HTTP_REQUEST', 'WEB-01', '10.0.0.1', 'info', phase, {'method': 'GET', 'path': '/robots.txt'}))
            self.step += 1
        elif self.step == 1 and current_time_ms >= 6000:
            events.append(make_telemetry(exercise_id, get_ts(6000), 'LOGIN_FAILED', 'AUTH-01', 'employee_002', 'medium', phase, {'reason': 'invalid'}))
            events.append(make_telemetry(exercise_id, get_ts(6500), 'LOGIN_FAILED', 'AUTH-01', 'employee_002', 'medium', phase, {'reason': 'invalid'}))
            events.append(make_telemetry(exercise_id, get_ts(7000), 'LOGIN_FAILED', 'AUTH-01', 'employee_002', 'high', phase, {'reason': 'invalid'}))
            self.step += 1
        return events

class BlueTeamSentinel:
    def __init__(self):
        self.login_failures = 0
        self.alerted = False

    def analyze(self, events: List[dict], exercise_id: str, phase: str, get_ts) -> List[dict]:
        new_events = []
        for evt in events:
            if evt['type'] == 'LOGIN_FAILED':
                self.login_failures += 1
        if self.login_failures >= 3 and not self.alerted:
            self.alerted = True
            new_events.append(make_telemetry(exercise_id, get_ts(0), 'ALERT_CREATED', 'AUTH-01', 'agent-blue-sentinel', 'high', phase, {'alertType': 'brute_force'}))
        return new_events

class InvestigationAnalyst:
    def __init__(self):
        self.seen_alerts = 0
        self.incident_created = False

    def analyze(self, events: List[dict], exercise_id: str, phase: str, get_ts) -> Tuple[List[dict], List[dict]]:
        new_inc = []
        new_tel = []
        for evt in events:
            if evt['type'] == 'ALERT_CREATED':
                self.seen_alerts += 1
        
        if self.seen_alerts > 0 and not self.incident_created:
            self.incident_created = True
            inc = {
                "id": f"inc-{uuid.uuid4().hex[:8]}",
                "title": "Authentication Compromise",
                "description": "Correlated brute force attack.",
                "severity": "high",
                "status": "investigating",
                "source": "Investigation Analyst",
                "sourceAsset": "AUTH-01",
                "detectedAt": get_ts(0),
                "resolvedAt": None,
                "assignedAgent": "agent-investigation-analyst",
                "evidence": ["Correlated auth abuse"],
                "timeline": [],
                "exerciseId": exercise_id,
                "affectedAssets": ["AUTH-01"],
                "responseActions": []
            }
            new_inc.append(inc)
            new_tel.append(make_telemetry(exercise_id, get_ts(0), 'ALERT_CREATED', 'AUTH-01', 'agent-investigation-analyst', 'critical', phase, {'incidentId': inc['id']}))
        return new_inc, new_tel

class ResponseCommander:
    def __init__(self):
        self.responded = False

    def analyze(self, incidents: List[dict], exercise_id: str, phase: str, get_ts) -> Tuple[List[dict], List[dict]]:
        new_tel = []
        updated_inc = []
        for inc in incidents:
            if inc['status'] == 'investigating' and not self.responded and phase == 'responding':
                self.responded = True
                inc['responseActions'].append('Account locked out')
                inc['status'] = 'contained'
                inc['resolvedAt'] = get_ts(0)
                new_tel.append(make_telemetry(exercise_id, get_ts(0), 'CONTAINMENT_ACTION', 'AUTH-01', 'agent-response-commander', 'high', phase, {'action': 'lockout'}))
                updated_inc.append(inc)
        return new_tel, updated_inc

active_tasks = {}

async def simulation_loop(exercise_id: str):
    ex = exercise_store.get(exercise_id)
    if not ex: return

    now = datetime.now(timezone.utc).timestamp() * 1000
    def get_ts(offset_ms: int):
        return datetime.fromtimestamp((now + offset_ms)/1000, tz=timezone.utc).isoformat()

    ex['status'] = 'running'
    ex['startedAt'] = get_ts(0)
    exercise_store.set(exercise_id, ex)

    red = RedTeamAgent()
    sentinel = BlueTeamSentinel()
    analyst = InvestigationAnalyst()
    commander = ResponseCommander()

    phase_time = 0
    while phase_time <= 15:
        await asyncio.sleep(1)
        ex = exercise_store.get(exercise_id)
        if not ex or ex['status'] != 'running':
            break

        if phase_time == 0: ex['currentPhase'] = 'preparing'
        elif phase_time == 2: ex['currentPhase'] = 'running'
        elif phase_time == 6: ex['currentPhase'] = 'detecting'
        elif phase_time == 8: ex['currentPhase'] = 'investigating'
        elif phase_time == 10: ex['currentPhase'] = 'responding'
        elif phase_time == 14: ex['currentPhase'] = 'evaluating'
        
        exercise_store.set(exercise_id, ex)

        new_tel = []
        new_inc = []

        red_events = red.tick(phase_time * 1000, exercise_id, ex['currentPhase'], get_ts)
        new_tel.extend(red_events)

        sentinel_events = sentinel.analyze(red_events, exercise_id, ex['currentPhase'], get_ts)
        new_tel.extend(sentinel_events)

        analyst_inc, analyst_tel = analyst.analyze(red_events + sentinel_events, exercise_id, ex['currentPhase'], get_ts)
        new_tel.extend(analyst_tel)
        new_inc.extend(analyst_inc)

        existing_inc = incident_store.get(exercise_id) or []
        active_inc = existing_inc + new_inc
        commander_tel, commander_inc = commander.analyze(active_inc, exercise_id, ex['currentPhase'], get_ts)
        new_tel.extend(commander_tel)

        if new_tel:
            all_tel = telemetry_store.get(exercise_id) or []
            telemetry_store.set(exercise_id, all_tel + new_tel)

        final_inc = {inc['id']: inc for inc in active_inc}
        for inc in commander_inc:
            final_inc[inc['id']] = inc
        
        if final_inc:
            incident_store.set(exercise_id, list(final_inc.values()))

        phase_time += 1

    # End
    ex = exercise_store.get(exercise_id)
    if ex:
        ex['status'] = 'completed'
        ex['currentPhase'] = 'completed'
        ex['endedAt'] = get_ts(15000)
        exercise_store.set(exercise_id, ex)

        score = {
            "overall": 85,
            "categories": [
                {"category": "Detection", "score": 90, "maxScore": 100, "details": "Detected quickly", "weight": 0.5},
                {"category": "Response", "score": 80, "maxScore": 100, "details": "Contained successfully", "weight": 0.5}
            ],
            "exerciseId": exercise_id,
            "evaluatedAt": get_ts(15000),
            "summary": "Good performance.",
            "strengths": ["Detection"],
            "weaknesses": []
        }
        score_store.set(exercise_id, score)
    
    if exercise_id in active_tasks:
        del active_tasks[exercise_id]

def start_simulation(exercise_id: str):
    if exercise_id not in active_tasks:
        task = asyncio.create_task(simulation_loop(exercise_id))
        active_tasks[exercise_id] = task
