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

def start_simulation(exercise_id: str, fast_mode: bool = False):
    """
    Launches asynchronous simulation task.
    """
    if exercise_id not in active_simulation_tasks:
        task = asyncio.create_task(run_simulation_loop(exercise_id, fast_mode=fast_mode))
        active_simulation_tasks[exercise_id] = task

def cancel_simulation(exercise_id: str):
    """
    Cancels an actively running simulation.
    """
    if exercise_id in active_simulation_tasks:
        task = active_simulation_tasks[exercise_id]
        task.cancel()
        del active_simulation_tasks[exercise_id]
    
    ex = get_exercise(exercise_id)
    if ex and ex["status"] == "running":
        ex["status"] = "cancelled"
        ex["currentPhase"] = "cancelled"
        save_exercise(ex)
