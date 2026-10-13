"""
Independent Referee Agent for HavenSec Arena.
Evaluates exercise outcomes against pre-established ground truth.
Calculates:
1. Red Team Performance Score (0-100)
2. Blue Team Defensive Score (0-100)
3. Overall Cyber-Resilience Score (0-100)
"""

import uuid
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone

class RefereeAgent:
    def __init__(self, ground_truth_objectives: List[Dict[str, Any]]):
        self.ground_truth = {obj["id"]: obj for obj in ground_truth_objectives}

    def evaluate(
        self,
        exercise_id: str,
        telemetry: List[Dict[str, Any]],
        alerts: List[Dict[str, Any]],
        incidents: List[Dict[str, Any]],
        responses: List[Dict[str, Any]],
        started_at: Optional[str] = None,
        first_detection_ts: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Independently audits all generated artifacts against the ground truth.
        """
        deductions: List[str] = []
        bonuses: List[str] = []
        limitations: List[str] = []

        total_gt = len(self.ground_truth)
        if total_gt == 0:
            limitations.append("No pre-established ground truth objectives defined for this scenario.")
            total_gt = 1 # Avoid division by zero

        # -------------------------------------------------------------
        # 1. RED TEAM EVALUATION (0 - 100)
        # Evaluates adversarial progress, objective completion, and stealth.
        # -------------------------------------------------------------
        achieved_gt_ids = set()
        malicious_events = [e for e in telemetry if e.get("isMalicious")]
        for e in malicious_events:
            gt_id = e.get("groundTruthObjectiveId")
            if gt_id and gt_id in self.ground_truth:
                achieved_gt_ids.add(gt_id)

        # Objective Achievement Rate (50% weight)
        objective_rate = (len(achieved_gt_ids) / total_gt) * 100.0
        
        # Ground-Truth Asset Coverage (30% weight)
        expected_assets = {obj["targetAsset"] for obj in self.ground_truth.values()}
        attacked_assets = {e["sourceAsset"] for e in malicious_events}
        asset_coverage = (len(expected_assets.intersection(attacked_assets)) / max(1, len(expected_assets))) * 100.0

        # Evasion / Stealth Index (20% weight)
        # If blue team missed any ground-truth objective, red stealth was high.
        undetected_count = total_gt - len({a.get("ruleId") for a in alerts})
        stealth_index = max(0.0, min(100.0, (undetected_count / total_gt) * 100.0))

        red_score = round(
            (0.50 * objective_rate) +
            (0.30 * asset_coverage) +
            (0.20 * stealth_index),
            1
        )

        red_metrics = [
            {"name": "Objective Achievement", "score": round(objective_rate, 1), "maxScore": 100.0, "weight": 0.50, "details": f"{len(achieved_gt_ids)} of {total_gt} objectives completed."},
            {"name": "Asset Target Coverage", "score": round(asset_coverage, 1), "maxScore": 100.0, "weight": 0.30, "details": f"Touched {len(expected_assets.intersection(attacked_assets))} intended assets."},
            {"name": "Stealth & Evasion Index", "score": round(stealth_index, 1), "maxScore": 100.0, "weight": 0.20, "details": "Resistance to early detection rules."}
        ]

        # -------------------------------------------------------------
        # 2. BLUE TEAM EVALUATION (0 - 100)
        # Evaluates detection recall, precision, latency, and containment.
        # -------------------------------------------------------------
        # True Positives & False Positives
        tp_alerts = [a for a in alerts if a.get("groundTruthDetected")]
        fp_alerts = [a for a in alerts if not a.get("groundTruthDetected")]
        
        tp_count = len(tp_alerts)
        fp_count = len(fp_alerts)
        fn_count = max(0, total_gt - tp_count)

        # Recall (25% weight)
        if (tp_count + fn_count) > 0:
            recall = (tp_count / (tp_count + fn_count)) * 100.0
        else:
            recall = 100.0
            limitations.append("Recall evaluation had zero ground-truth threat events.")

        # Precision (20% weight)
        if (tp_count + fp_count) > 0:
            precision = (tp_count / (tp_count + fp_count)) * 100.0
        else:
            precision = 0.0 if len(malicious_events) > 0 else 100.0

        # Latency (15% weight)
        latency_score = 100.0
        latency_seconds = 0.0
        if started_at and first_detection_ts:
            try:
                t0 = datetime.fromisoformat(started_at)
                t1 = datetime.fromisoformat(first_detection_ts)
                latency_seconds = max(0.0, (t1 - t0).total_seconds())
                # Deduct 5 points per second past 3s
                if latency_seconds > 3.0:
                    penalty = (latency_seconds - 3.0) * 5.0
                    latency_score = max(0.0, 100.0 - penalty)
                    deductions.append(f"Detection latency of {latency_seconds:.1f}s exceeded 3.0s baseline (-{penalty:.1f} pts).")
                else:
                    bonuses.append(f"Rapid detection in {latency_seconds:.1f}s (+5 bonus).")
                    latency_score = min(100.0, latency_score + 5.0)
            except Exception:
                limitations.append("Unable to parse timestamps for precision latency calculation.")
        elif len(malicious_events) > 0 and tp_count == 0:
            latency_score = 0.0
            deductions.append("Threat was never detected; latency scored at 0.")

        # Investigation Completeness (20% weight)
        investigated_count = len(incidents)
        if investigated_count > 0:
            investigation_score = min(100.0, 50.0 + (len(incidents[0].get("evidence", [])) * 25.0))
        else:
            investigation_score = 0.0
            deductions.append("No incidents correlated by Investigation Analyst (-20 pts).")

        # Containment & Response (20% weight)
        successful_responses = [r for r in responses if r.get("status") == "executed"]
        contained_incidents = [i for i in incidents if i.get("status") == "contained"]
        if investigated_count > 0:
            containment_rate = (len(contained_incidents) / investigated_count) * 100.0
        else:
            containment_rate = 0.0

        blue_score = round(
            (0.25 * recall) +
            (0.20 * precision) +
            (0.15 * latency_score) +
            (0.20 * investigation_score) +
            (0.20 * containment_rate),
            1
        )

        blue_metrics = [
            {"name": "Detection Recall", "score": round(recall, 1), "maxScore": 100.0, "weight": 0.25, "details": f"Detected {tp_count} of {total_gt} attack techniques."},
            {"name": "Detection Precision", "score": round(precision, 1), "maxScore": 100.0, "weight": 0.20, "details": f"{tp_count} true positives, {fp_count} false positives."},
            {"name": "Detection Latency", "score": round(latency_score, 1), "maxScore": 100.0, "weight": 0.15, "details": f"First alert generated at {latency_seconds:.1f}s."},
            {"name": "Investigation Quality", "score": round(investigation_score, 1), "maxScore": 100.0, "weight": 0.20, "details": f"Correlated {investigated_count} incidents with evidence."},
            {"name": "Containment Success", "score": round(containment_rate, 1), "maxScore": 100.0, "weight": 0.20, "details": f"Contained {len(contained_incidents)} of {max(1, investigated_count)} incidents."}
        ]

        # -------------------------------------------------------------
        # 3. OVERALL SYSTEM RESILIENCE SCORE (0 - 100)
        # Represents organizational ability to withstand and mitigate threat.
        # NOT the average of Red and Blue!
        # -------------------------------------------------------------
        # Core resilience formula:
        # 35% Containment Success + 30% Detection Efficiency + 20% Investigation Depth + 15% System Recovery
        # Minus penalty for uncontained high-impact objectives.
        uncontained_penalty = 0.0
        uncontained_count = investigated_count - len(contained_incidents)
        if uncontained_count > 0:
            uncontained_penalty = uncontained_count * 20.0
            deductions.append(f"{uncontained_count} uncontained security incidents (-{uncontained_penalty:.1f} resilience pts).")

        if len(successful_responses) > 0 and len(contained_incidents) == investigated_count and investigated_count > 0:
            bonuses.append("Full containment of attack chain achieved (+10 resilience pts).")

        base_resilience = (
            (0.35 * containment_rate) +
            (0.30 * recall) +
            (0.20 * investigation_score) +
            (0.15 * latency_score)
        ) - uncontained_penalty

        resilience_score = round(max(0.0, min(100.0, base_resilience)), 1)

        resilience_metrics = [
            {"name": "Containment Efficacy", "score": round(containment_rate, 1), "maxScore": 100.0, "weight": 0.35, "details": "Ability to halt adversarial progression."},
            {"name": "Threat Visibility", "score": round(recall, 1), "maxScore": 100.0, "weight": 0.30, "details": "Full visibility into adversary techniques."},
            {"name": "Evidence Correlation", "score": round(investigation_score, 1), "maxScore": 100.0, "weight": 0.20, "details": "Traceability of root cause and attack path."},
            {"name": "Response Swiftness", "score": round(latency_score, 1), "maxScore": 100.0, "weight": 0.15, "details": "Time window between initial attack and detection."}
        ]

        # Summary Generation
        summary = (
            f"Adversarial effectiveness rated at {red_score}%. Blue team achieved {blue_score}% defense rating "
            f"with {recall:.0f}% recall across {total_gt} ground-truth objectives. "
            f"System resilience scored at {resilience_score}% based on containment speed and residual risk."
        )

        return {
            "id": f"eval-{uuid.uuid4().hex[:8]}",
            "exerciseId": exercise_id,
            "redTeamScore": red_score,
            "blueTeamScore": blue_score,
            "resilienceScore": resilience_score,
            "metricsBreakdown": {
                "redTeam": red_metrics,
                "blueTeam": blue_metrics,
                "resilience": resilience_metrics
            },
            "deductions": deductions,
            "bonuses": bonuses,
            "limitations": limitations,
            "summary": summary,
            "evaluatedAt": datetime.now(timezone.utc).isoformat()
        }
