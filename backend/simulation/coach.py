"""
Security Coach and Adaptive Scenario Engine for HavenSec Arena.
Analyzes evaluation metrics, identifies prioritized defensive gaps,
links specific evidence, and deterministically recommends targeted follow-up scenarios.
"""

import uuid
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone

class CoachEngine:
    @staticmethod
    def analyze_exercise(
        exercise_id: str,
        evaluation: Dict[str, Any],
        telemetry: List[Dict[str, Any]],
        alerts: List[Dict[str, Any]],
        incidents: List[Dict[str, Any]],
        responses: List[Dict[str, Any]],
        current_scenario_id: str,
        current_difficulty: str = "intermediate"
    ) -> Dict[str, Any]:
        """
        Inspects exercise results and determines the highest-priority security weakness.
        Outputs evidence-linked recommendations and selects the next adaptive scenario.
        """
        blue_metrics = evaluation.get("metricsBreakdown", {}).get("blueTeam", [])
        metric_map = {m["name"]: m["score"] for m in blue_metrics}

        recall = metric_map.get("Detection Recall", 100.0)
        precision = metric_map.get("Detection Precision", 100.0)
        latency = metric_map.get("Detection Latency", 100.0)
        investigation = metric_map.get("Investigation Quality", 100.0)
        containment = metric_map.get("Containment Success", 100.0)

        priority_weakness = ""
        rec_text = ""
        rationale = ""
        evidence_refs = []
        next_scenario_id = ""
        next_difficulty = current_difficulty

        # -------------------------------------------------------------
        # Deterministic Policy Priority Ladder
        # -------------------------------------------------------------
        # 1. Detection Recall Bottleneck (< 75%)
        if recall < 75.0:
            priority_weakness = "Detection Recall Deficit (Adversary Objectives Missed)"
            evidence_refs = [f"Rule recall fell to {recall:.1f}%"] + [e["id"] for e in telemetry if e.get("isMalicious")][:3]
            rec_text = (
                f"The defense missed {100 - recall:.0f}% of synthetic adversarial techniques. "
                "Update SIEM correlation thresholds to trigger on initial reconnaissance and lower the failed login threshold from 5 to 3. "
                "Schedule a follow-up authentication attack exercise to test revised detection rules."
            )
            rationale = "Unobserved threat activity allows attackers to progress along the cyber kill chain without challenge."
            next_scenario_id = "scenario-suspicious-auth"
            next_difficulty = "intermediate" if current_difficulty == "beginner" else current_difficulty

        # 2. Containment Execution Failure (< 70%)
        elif containment < 70.0:
            priority_weakness = "Response & Containment Execution Deficit"
            evidence_refs = [i["id"] for i in incidents if i.get("status") != "contained"]
            rec_text = (
                f"Containment efficacy scored only {containment:.1f}%. Detected incidents remained uncontained, "
                "leaving synthetic assets exposed to potential encryption or exfiltration. "
                "Implement automated playbook dispatch (e.g. Host Network Quarantine or IAM Lockout) on critical alerts."
            )
            rationale = "Detection without swift automated containment results in unacceptable residual damage."
            next_scenario_id = "scenario-ransomware-controlled"
            next_difficulty = "intermediate"

        # 3. Detection Latency Lag (< 70%)
        elif latency < 70.0:
            priority_weakness = "High Detection Latency Lag"
            evidence_refs = [a["id"] for a in alerts[:2]]
            rec_text = (
                f"Detection latency was degraded (score {latency:.1f}/100). The first defensive alert took excessive time "
                "to trigger after initial adversarial reconnaissance was observed. "
                "Streamline real-time telemetry ingestion pipelines and configure immediate behavioral tripwires."
            )
            rationale = "Delayed alerting provides adversaries an expanded operational dwell time."
            next_scenario_id = "scenario-api-security"
            next_difficulty = "intermediate"

        # 4. Investigation Quality / Cross-Asset Correlation Gap (< 75%)
        elif investigation < 75.0:
            priority_weakness = "Cross-Asset Correlation Gap"
            evidence_refs = [i["id"] for i in incidents]
            rec_text = (
                f"Investigation completeness scored {investigation:.1f}%. The analyst failed to fully correlate "
                "lateral movement events spanning identity stores and file repositories into a unified attack narrative. "
                "Enhance incident entity resolution to link user tokens across multiple synthetic hosts."
            )
            rationale = "Isolated alerts obscure the true scope of multi-stage adversarial campaigns."
            next_scenario_id = "scenario-credential-compromise"
            next_difficulty = "advanced"

        # 5. Alert Noise / Low Precision (< 70%)
        elif precision < 70.0:
            priority_weakness = "Alert Noise & High False-Positive Rate"
            evidence_refs = [a["id"] for a in alerts if not a.get("groundTruthDetected")]
            rec_text = (
                f"Defensive precision was suboptimal at {precision:.1f}%, indicating excessive false-positive alert volume. "
                "Tune alert heuristics to filter out routine background administrative traffic and require secondary indicator confirmation."
            )
            rationale = "High false-positive rates induce alert fatigue and distract security operations from active compromises."
            next_scenario_id = "scenario-web-misconfig"
            next_difficulty = "intermediate"

        # 6. High Performance Across All Dimensions (Mastery -> Escalate Challenge)
        else:
            priority_weakness = "Baseline Posture Verified (Ready for Advanced Adversary)"
            evidence_refs = [evaluation["id"]]
            rec_text = (
                f"The defense performed exceptionally well with {recall:.0f}% recall, {containment:.0f}% containment, "
                f"and overall resilience at {evaluation.get('resilienceScore', 0)}%. "
                "Escalate the cyber exercise to an Advanced Credential Compromise or Controlled Ransomware scenario to test resilience against stealthy lateral movement."
            )
            rationale = "Continuous resilience improvement requires challenging verified defenses with advanced adversarial tactics."
            
            # Select non-duplicate advanced scenario
            if current_scenario_id == "scenario-credential-compromise":
                next_scenario_id = "scenario-ransomware-controlled"
            elif current_scenario_id == "scenario-ransomware-controlled":
                next_scenario_id = "scenario-api-security"
            else:
                next_scenario_id = "scenario-credential-compromise"
            next_difficulty = "advanced"

        rec_id = f"rec-{uuid.uuid4().hex[:8]}"
        return {
            "id": rec_id,
            "exerciseId": exercise_id,
            "priorityWeakness": priority_weakness,
            "recommendationText": rec_text,
            "rationale": rationale,
            "evidenceRefs": evidence_refs,
            "recommendedScenarioId": next_scenario_id,
            "recommendedDifficulty": next_difficulty,
            "followUpExerciseId": None,
            "createdAt": datetime.now(timezone.utc).isoformat()
        }

    @staticmethod
    def compare_exercises(prev_eval: Dict[str, Any], curr_eval: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculates delta comparisons between a baseline exercise and an adaptive follow-up exercise.
        """
        delta_resilience = curr_eval["resilienceScore"] - prev_eval["resilienceScore"]
        delta_blue = curr_eval["blueTeamScore"] - prev_eval["blueTeamScore"]
        delta_red = curr_eval["redTeamScore"] - prev_eval["redTeamScore"]

        improved = delta_resilience > 0

        summary = (
            f"Adaptive follow-up comparison: Overall resilience changed by {delta_resilience:+.1f} points "
            f"({prev_eval['resilienceScore']} -> {curr_eval['resilienceScore']}). "
            f"Blue team defense changed by {delta_blue:+.1f} points. "
            f"Outcome: {'Targeted defensive posture demonstrated measurable improvement.' if improved else 'Residual weaknesses persist; further rule tuning recommended.'}"
        )

        return {
            "previousExerciseId": prev_eval["exerciseId"],
            "currentExerciseId": curr_eval["exerciseId"],
            "deltaResilience": round(delta_resilience, 1),
            "deltaBlueScore": round(delta_blue, 1),
            "deltaRedScore": round(delta_red, 1),
            "improved": improved,
            "summary": summary
        }
