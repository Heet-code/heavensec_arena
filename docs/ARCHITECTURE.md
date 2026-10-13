# HavenSec Arena — System Architecture Documentation

## 1. Architectural Overview

HavenSec Arena is an AI-assisted multi-agent cybersecurity simulation and resilience evaluation platform designed for safe, reproducible exercise execution.

The architecture comprises three primary tiers:
1. **Frontend Presentation Layer:** Built with HTML5, CSS3, and Vanilla JavaScript, implementing a responsive 8-view SOC dashboard with dynamic API endpoint discovery.
2. **Backend API & Simulation Engine:** Built with Python 3.11+ and FastAPI, coordinating an asynchronous multi-agent state machine.
3. **Relational Persistence Layer:** Built with SQLite3 using foreign keys, constraints, and indexes.

---

## 2. Multi-Agent System Design

The platform coordinates seven distinct software entities with explicit responsibilities:

```
[Scenario Orchestrator] ── Controls Lifecycle (CREATED -> PREPARING -> RUNNING -> ...)
        │
        ├── [Red Team Agent] ── Emits synthetic telemetry & achieves GT objectives
        │
        ├── [Blue Team Sentinel] ── Evaluates SIEM rules, flags alerts, tracks latency
        │
        ├── [Investigation Analyst] ── Correlates alerts into incidents & graphs evidence
        │
        ├── [Response Commander] ── Dispatches bounded containment playbooks
        │
        ├── [Independent Referee] ── Audits ground truth, computes Red/Blue/Resilience scores
        │
        └── [Security Coach] ── Identifies priority gaps & recommends adaptive next scenario
```

### Agent State Transition Lifecycle
Exercises transition through strict, validated states:
`CREATED` → `PREPARING` → `RUNNING` → `DETECTING` → `INVESTIGATING` → `RESPONDING` → `EVALUATING` → `COMPLETED`
Any error transitions to `FAILED`; manual user stops transition to `CANCELLED`. Duplicate executions on the same exercise ID are rejected.

---

## 3. Relational Persistence Schema (SQLite3)

The database (`database.sqlite`) uses an audited relational structure:
- **`scenarios`**: Pre-configured threat profiles, MITRE ATT&CK mappings, and ground-truth objectives.
- **`exercises`**: Exercise runs, seeds, status, current phase, timestamps, and foreign key link `previous_exercise_id` for adaptive tracking.
- **`telemetry`**: Timestamped events, source assets, actors, severity, payloads, and `is_malicious` flags.
- **`alerts`**: SIEM alerts triggered by Blue Sentinel, linked to detection rules and ground truth flags.
- **`incidents`**: Correlated security incidents with evidence arrays, affected assets, and status (`investigating`, `contained`, `resolved`).
- **`response_actions`**: Executed playbooks (`playbook_name`, `target_asset`, `action_type`, `rationale`, `status`).
- **`evaluations`**: Independent referee records containing `red_team_score`, `blue_team_score`, `resilience_score`, metric breakdowns, deductions, and bonuses.
- **`coach_recommendations`**: Evidence-linked gap analysis, `priority_weakness`, `recommended_scenario_id`, `recommended_difficulty`, and `follow_up_exercise_id`.

---

## 4. Resilience Scoring Mathematical Model

Scoring separates adversarial success, defensive proficiency, and overall resilience into distinct 0–100 metrics:

### Red Team Performance ($S_{\text{Red}}$)
$$S_{\text{Red}} = 0.50 \cdot \left(\frac{\text{Achieved GT Objectives}}{\text{Total GT Objectives}} \cdot 100\right) + 0.30 \cdot \left(\frac{\text{Touched Assets}}{\text{Target Assets}} \cdot 100\right) + 0.20 \cdot \text{StealthIndex}$$

### Blue Team Defensive Performance ($S_{\text{Blue}}$)
$$S_{\text{Blue}} = 0.25 \cdot \text{Recall} + 0.20 \cdot \text{Precision} + 0.15 \cdot \text{LatencyScore} + 0.20 \cdot \text{InvestigationScore} + 0.20 \cdot \text{ContainmentRate}$$

### Overall System Cyber-Resilience ($S_{\text{Resilience}}$)
$$S_{\text{Resilience}} = \max\left(0, \min\left(100, 0.35 \cdot C_s + 0.30 \cdot R_d + 0.20 \cdot I_q + 0.15 \cdot L_d - \text{Penalties}_{\text{uncontained}}\right)\right)$$
- If uncontained high-impact incidents remain, an explicit deduction (-20 pts per incident) is applied.
- Resilience measures the organization's ability to resist and contain the threat. It is **not** an average of Red Team and Blue Team scores.

---

## 5. Adaptive Scenario Engine Workflow

1. The Security Coach receives completed referee evaluation metrics.
2. It evaluates a deterministic priority ladder:
   - **Recall < 75%** → Weakness: Detection Deficit → Recommends authentication scenario with adjusted correlation thresholds.
   - **Containment < 70%** → Weakness: Containment Execution Deficit → Recommends controlled ransomware scenario for fast endpoint isolation.
   - **Latency < 70%** → Weakness: Detection Latency Lag → Recommends API abuse scenario for rate-limiting tripwires.
   - **Investigation < 75%** → Weakness: Cross-Asset Correlation Gap → Recommends lateral credential compromise scenario.
   - **Precision < 70%** → Weakness: False Positive Alert Noise → Recommends web misconfiguration scenario with background traffic.
   - **Mastery (All ≥ 85%)** → Recommends Advanced scenario.
3. Automatically sets `previousExerciseId` on the next run.
4. Compares the two exercises post-run to calculate $\Delta$ Resilience and prove measurable defensive improvement.
