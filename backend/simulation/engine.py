"""
Simulation Engine and Orchestrator for HavenSec Arena.
Coordinates the exercise lifecycle, manages agent execution loops,
enforces legal state transitions, and persists verified exercise evidence.
"""

import uuid
import asyncio
from datetime import datetime, timezone
from typing import Dict, Any, Optional

from database import (
    get_exercise, save_exercise,
    save_telemetry_batch, get_telemetry_by_exercise,
    save_alerts_batch, get_alerts_by_exercise,
    save_incident, get_incidents_by_exercise,
    save_response_action, get_responses_by_exercise,
    save_evaluation, get_evaluation,
    save_coach_recommendation, get_coach_recommendation
)
from simulation.scenarios import get_scenario, SYNTHETIC_ENVIRONMENT
from simulation.agents import RedTeamAgent, BlueTeamSentinel, InvestigationAnalyst, ResponseCommander
from simulation.referee import RefereeAgent
from simulation.coach import CoachEngine
from simulation.orchestration import OrchestrationManager

active_simulation_tasks: Dict[str, asyncio.Task] = {}

VALID_PHASE_TRANSITIONS = {
    "created": ["preparing", "failed", "cancelled"],
    "preparing": ["running", "failed", "cancelled"],
    "running": ["detecting", "failed", "cancelled"],
    "detecting": ["investigating", "failed", "cancelled"],
    "investigating": ["responding", "failed", "cancelled"],
    "responding": ["evaluating", "failed", "cancelled"],
    "evaluating": ["completed", "failed", "cancelled"],
    "completed": [],
    "failed": [],
    "cancelled": []
}

async def run_simulation_loop(exercise_id: str, fast_mode: bool = False):
    ex = get_exercise(exercise_id)
    if not ex:
        return

    # Guard against invalid start
    if ex["status"] in ["completed", "failed", "cancelled"]:
        return

    scenario = get_scenario(ex["scenarioId"])
    ground_truth = scenario.get("groundTruthObjectives", [])
    seed = ex.get("seed", 42)
    difficulty = ex.get("difficulty", "intermediate")

    now = datetime.now(timezone.utc).timestamp() * 1000
    def get_ts(offset_ms: int):
        return datetime.fromtimestamp((now + offset_ms) / 1000, tz=timezone.utc).isoformat()

    # Transition to RUNNING
    ex["status"] = "running"
    ex["currentPhase"] = "preparing"
    ex["startedAt"] = get_ts(0)
    save_exercise(ex)

    # Instantiate agents
    red = RedTeamAgent(scenario=scenario, difficulty=difficulty, seed=seed)
    sentinel = BlueTeamSentinel()
    analyst = InvestigationAnalyst()
    commander = ResponseCommander()
    referee = RefereeAgent(ground_truth_objectives=ground_truth)

    phase_sequence = [
        (0, "preparing"),
        (2, "running"),
        (5, "detecting"),
        (8, "investigating"),
        (11, "responding"),
        (14, "evaluating"),
        (15, "completed")
    ]

    tick_sleep = 0.001 if fast_mode else 1.0
    elapsed_seconds = 0
    all_alerts = []
    all_incidents = []
    all_responses = []

    try:
        while elapsed_seconds <= 15:
            if not fast_mode:
                await asyncio.sleep(tick_sleep)

            # Check if exercise was cancelled externally
            current_ex = get_exercise(exercise_id)
            if not current_ex or current_ex["status"] in ["cancelled", "failed"]:
                break

            # Determine lifecycle phase
            current_phase = "preparing"
            for t_mark, phase_name in phase_sequence:
                if elapsed_seconds >= t_mark:
                    current_phase = phase_name

            current_ex["currentPhase"] = current_phase
            save_exercise(current_ex)

            # 1. Red Team Tick
            red_events = red.tick(elapsed_seconds * 1000, exercise_id, current_phase, get_ts)
            if red_events:
                save_telemetry_batch(red_events)

            # 2. Blue Team Sentinel Tick
            new_alerts, sentinel_telemetry = sentinel.analyze(red_events, exercise_id, current_phase, get_ts)
            if new_alerts:
                save_alerts_batch(new_alerts)
                all_alerts.extend(new_alerts)
            if sentinel_telemetry:
                save_telemetry_batch(sentinel_telemetry)

            # 3. Investigation Analyst Tick
            new_incidents, analyst_telemetry = analyst.analyze(new_alerts, exercise_id, current_phase, get_ts)
            for inc in new_incidents:
                save_incident(inc)
                all_incidents.append(inc)
            if analyst_telemetry:
                save_telemetry_batch(analyst_telemetry)

            # 4. Response Commander Tick
            active_incidents = get_incidents_by_exercise(exercise_id)
            new_actions, updated_inc, commander_telemetry = commander.analyze(active_incidents, exercise_id, current_phase, get_ts)
            for act in new_actions:
                save_response_action(act)
                all_responses.append(act)
            for inc in updated_inc:
                save_incident(inc)
            if commander_telemetry:
                save_telemetry_batch(commander_telemetry)

            # 5. Referee & Coach Execution (Phase: evaluating)
            if current_phase == "evaluating" and not get_evaluation(exercise_id):
                all_tel = get_telemetry_by_exercise(exercise_id)
                final_inc = get_incidents_by_exercise(exercise_id)
                final_alerts = get_alerts_by_exercise(exercise_id)
                final_resp = get_responses_by_exercise(exercise_id)

                evaluation = referee.evaluate(
                    exercise_id=exercise_id,
                    telemetry=all_tel,
                    alerts=final_alerts,
                    incidents=final_inc,
                    responses=final_resp,
                    started_at=current_ex["startedAt"],
                    first_detection_ts=sentinel.first_detection_ts
                )
                
                # Orchestrator score justification
                orchestrator = OrchestrationManager.get_instance().get_orchestrator()
                score_explanation = await orchestrator.explain_score(evaluation)
                evaluation["orchestratorExplanation"] = score_explanation
                save_evaluation(evaluation)

                # Coach Generates Adaptive Next Steps
                rec = CoachEngine.analyze_exercise(
                    exercise_id=exercise_id,
                    evaluation=evaluation,
                    telemetry=all_tel,
                    alerts=final_alerts,
                    incidents=final_inc,
                    responses=final_resp,
                    current_scenario_id=ex["scenarioId"],
                    current_difficulty=difficulty
                )
                save_coach_recommendation(rec)

            elapsed_seconds += 1

        # Completed lifecycle phase
        final_ex = get_exercise(exercise_id)
        if final_ex and final_ex["status"] == "running":
            final_ex["status"] = "completed"
            final_ex["currentPhase"] = "completed"
            final_ex["endedAt"] = get_ts(15000)
            final_ex["durationSeconds"] = 15
            save_exercise(final_ex)

    except Exception as e:
        failed_ex = get_exercise(exercise_id)
        if failed_ex:
            failed_ex["status"] = "failed"
            save_exercise(failed_ex)
        raise e
    finally:
        if exercise_id in active_simulation_tasks:
            del active_simulation_tasks[exercise_id]

# -------------------------------------------------------------
# Manual Simulation Mode Management
# -------------------------------------------------------------
active_manual_sessions: Dict[str, Dict[str, Any]] = {}

def get_or_create_manual_session(exercise_id: str) -> Dict[str, Any]:
    if exercise_id in active_manual_sessions:
        return active_manual_sessions[exercise_id]
    
    ex = get_exercise(exercise_id)
    if not ex:
        raise ValueError(f"Exercise {exercise_id} not found")
        
    scenario = get_scenario(ex["scenarioId"])
    ground_truth = scenario.get("groundTruthObjectives", [])
    seed = ex.get("seed", 42)
    difficulty = ex.get("difficulty", "intermediate")
    
    session = {
        "red": RedTeamAgent(scenario=scenario, difficulty=difficulty, seed=seed),
        "sentinel": BlueTeamSentinel(),
        "analyst": InvestigationAnalyst(),
        "commander": ResponseCommander(),
        "referee": RefereeAgent(ground_truth_objectives=ground_truth),
        "step_index": 0
    }
    active_manual_sessions[exercise_id] = session
    return session

def start_simulation(exercise_id: str, fast_mode: bool = False):
    """
    Launches simulation according to exercise mode.
    - If mode is 'manual', prepares the interactive session for manual stepping.
    - If mode is 'automatic' (or 'autonomous'), launches the asynchronous background loop.
    """
    ex = get_exercise(exercise_id)
    if not ex:
        return

    mode = ex.get("mode", "automatic").lower()
    now_iso = datetime.now(timezone.utc).isoformat()
    
    if mode == "manual":
        ex["status"] = "running"
        if not ex.get("currentPhase") or ex["currentPhase"] == "created":
            ex["currentPhase"] = "preparing"
        if not ex.get("startedAt"):
            ex["startedAt"] = now_iso
        save_exercise(ex)
        get_or_create_manual_session(exercise_id)
        return

    # Automatic / Autonomous Mode
    if exercise_id not in active_simulation_tasks:
        task = asyncio.create_task(run_simulation_loop(exercise_id, fast_mode=fast_mode))
        active_simulation_tasks[exercise_id] = task

async def step_manual_simulation(exercise_id: str) -> Dict[str, Any]:
    """
    Steps a manual exercise forward by one phase.
    Executes the tactical agent actions for that phase and persists the state.
    Phases: created -> preparing -> running -> detecting -> investigating -> responding -> evaluating -> completed
    """
    ex = get_exercise(exercise_id)
    if not ex:
        raise ValueError(f"Exercise {exercise_id} not found")

    if ex["status"] in ["completed", "failed", "cancelled"]:
        return {"exercise": ex, "action": "already_terminated"}

    session = get_or_create_manual_session(exercise_id)
    current_phase = ex.get("currentPhase", "created")

    phase_flow = ["created", "preparing", "running", "detecting", "investigating", "responding", "evaluating", "completed"]
    try:
        curr_idx = phase_flow.index(current_phase)
        next_phase = phase_flow[min(curr_idx + 1, len(phase_flow) - 1)]
    except ValueError:
        next_phase = "running"

    now = datetime.now(timezone.utc).timestamp() * 1000
    def get_ts(offset_ms: int = 0):
        return datetime.fromtimestamp((now + offset_ms) / 1000, tz=timezone.utc).isoformat()

    ex["status"] = "running"
    if not ex.get("startedAt"):
        ex["startedAt"] = get_ts(0)

    new_events = []
    new_alerts = []
    new_incidents = []
    new_responses = []

    red = session["red"]
    sentinel = session["sentinel"]
    analyst = session["analyst"]
    commander = session["commander"]
    referee = session["referee"]

    if next_phase == "preparing":
        pass

    elif next_phase == "running":
        # Red Team generates initial attack telemetry
        events = red.tick(2000, exercise_id, "running", get_ts)
        if events:
            save_telemetry_batch(events)
            new_events.extend(events)

    elif next_phase == "detecting":
        # Red Team attack phase + Blue Sentinel detection
        events = red.tick(5000, exercise_id, "detecting", get_ts)
        if events:
            save_telemetry_batch(events)
            new_events.extend(events)

        all_events = get_telemetry_by_exercise(exercise_id)
        alerts, s_tel = sentinel.analyze(all_events, exercise_id, "detecting", get_ts)
        if alerts:
            save_alerts_batch(alerts)
            new_alerts.extend(alerts)
        if s_tel:
            save_telemetry_batch(s_tel)

    elif next_phase == "investigating":
        # Investigation Analyst clusters alerts into Incidents
        current_alerts = get_alerts_by_exercise(exercise_id)
        incidents, a_tel = analyst.analyze(current_alerts, exercise_id, "investigating", get_ts)
        for inc in incidents:
            save_incident(inc)
            new_incidents.append(inc)
        if a_tel:
            save_telemetry_batch(a_tel)

    elif next_phase == "responding":
        # In manual mode, operator has window for manual playbooks.
        # Fallback automated containment executes for unhandled incidents.
        active_incidents = get_incidents_by_exercise(exercise_id)
        actions, updated_inc, c_tel = commander.analyze(active_incidents, exercise_id, "responding", get_ts)
        for act in actions:
            save_response_action(act)
            new_responses.append(act)
        for inc in updated_inc:
            save_incident(inc)
        if c_tel:
            save_telemetry_batch(c_tel)

    elif next_phase == "evaluating":
        # Referee audits against ground truth and evaluates
        all_tel = get_telemetry_by_exercise(exercise_id)
        final_inc = get_incidents_by_exercise(exercise_id)
        final_alerts = get_alerts_by_exercise(exercise_id)
        final_resp = get_responses_by_exercise(exercise_id)

        evaluation = referee.evaluate(
            exercise_id=exercise_id,
            telemetry=all_tel,
            alerts=final_alerts,
            incidents=final_inc,
            responses=final_resp,
            started_at=ex["startedAt"],
            first_detection_ts=sentinel.first_detection_ts
        )

        orchestrator = OrchestrationManager.get_instance().get_orchestrator()
        score_explanation = await orchestrator.explain_score(evaluation)
        evaluation["orchestratorExplanation"] = score_explanation
        save_evaluation(evaluation)

        rec = CoachEngine.analyze_exercise(
            exercise_id=exercise_id,
            evaluation=evaluation,
            telemetry=all_tel,
            alerts=final_alerts,
            incidents=final_inc,
            responses=final_resp,
            current_scenario_id=ex["scenarioId"],
            current_difficulty=ex.get("difficulty", "intermediate")
        )
        save_coach_recommendation(rec)

    elif next_phase == "completed":
        ex["status"] = "completed"
        ex["endedAt"] = get_ts(0)
        ex["durationSeconds"] = 15
        if exercise_id in active_manual_sessions:
            del active_manual_sessions[exercise_id]

    ex["currentPhase"] = next_phase
    save_exercise(ex)

    return {
        "exercise": ex,
        "phase": next_phase,
        "newEventsCount": len(new_events),
        "newAlertsCount": len(new_alerts),
        "newIncidentsCount": len(new_incidents),
        "newResponsesCount": len(new_responses)
    }

def execute_manual_response(exercise_id: str, incident_id: str, playbook_name: str, target_asset: str, rationale: Optional[str] = None) -> Dict[str, Any]:
    """
    Manually executes a defensive containment playbook against an active incident.
    """
    ex = get_exercise(exercise_id)
    if not ex:
        raise ValueError(f"Exercise {exercise_id} not found")

    now_iso = datetime.now(timezone.utc).isoformat()
    action_id = f"resp-{uuid.uuid4().hex[:8]}"
    
    response_act = {
        "id": action_id,
        "exerciseId": exercise_id,
        "incidentId": incident_id,
        "playbookName": playbook_name,
        "targetAsset": target_asset,
        "actionType": "containment",
        "status": "executed",
        "timestamp": now_iso,
        "rationale": rationale or f"Manual response playbook '{playbook_name}' executed by SOC analyst on {target_asset}.",
        "operator": "manual"
    }
    save_response_action(response_act)

    # Mark the target incident as contained
    incidents = get_incidents_by_exercise(exercise_id)
    updated_inc = None
    for inc in incidents:
        if inc["id"] == incident_id:
            inc["status"] = "contained"
            inc["resolvedAt"] = now_iso
            act_list = inc.get("responseActions", [])
            if not isinstance(act_list, list):
                act_list = []
            if action_id not in act_list:
                act_list.append(action_id)
            inc["responseActions"] = act_list
            save_incident(inc)
            updated_inc = inc
            break

    return {"responseAction": response_act, "incident": updated_inc}

def cancel_simulation(exercise_id: str):
    """
    Cancels an actively running simulation.
    """
    if exercise_id in active_simulation_tasks:
        task = active_simulation_tasks[exercise_id]
        task.cancel()
        del active_simulation_tasks[exercise_id]
    
    if exercise_id in active_manual_sessions:
        del active_manual_sessions[exercise_id]

    ex = get_exercise(exercise_id)
    if ex and ex["status"] == "running":
        ex["status"] = "cancelled"
        ex["currentPhase"] = "cancelled"
        save_exercise(ex)
