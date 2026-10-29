# HavenSec Arena — Comprehensive Backend Audit & Verification Report

**Document Date:** October 29, 2026  
**Auditor:** Principal Software Architect & QA Engineering Lead  
**Project:** HavenSec Arena — AI-Powered Multi-Agent Red Team and Blue Team Cyber-Resilience Simulation Platform  
**Academic Context:** Tapi Diploma Engineering College | Department of Information Technology | Semester 5 — Minor Project  
**Student Author:** Heet Kalthiya  

---

## 1. Executive Summary

A deep architectural and code-level audit was conducted across the entire HavenSec Arena backend and frontend telemetry pipeline.
The audit evaluated:
1. REST API validation and route handlers (`backend/api.py`).
2. Pydantic schema validation (`backend/models.py`).
3. Relational persistence and schema integrity (`backend/database.py`).
4. Simulation lifecycle state machine (`backend/simulation/engine.py`).
5. Multi-agent behavioral generation, detection, correlation, and containment (`backend/simulation/agents.py`).
6. Referee mathematical evaluation and resilience formulas (`backend/simulation/referee.py`).
7. Security Coach adaptive gap analysis (`backend/simulation/coach.py`).
8. Modular orchestration and external fallback (`backend/simulation/orchestration.py`).
9. Frontend real-time telemetry streaming and event deduplication (`frontend/app.js`).

### Audit Outcome Summary
- **Total Suspected Items Investigated:** 7 (Items A through G)
- **Confirmed Bugs Identified & Remediated:** 5
- **Verified Working as Designed:** 2
- **Pre-Audit Passing Tests:** 19
- **Post-Audit Passing Tests:** 25 (100% pass rate, zero regressions)

---

## 2. Suspected Problems Investigation (Items A through G)

### Item A — Target Asset Propagation
- **Suspected Issue:** When a user specifies a custom target asset (e.g. `AUTH-PROD-02`) in `ExerciseConfig`, does it actually propagate into Red Team attacks, or do agents attack hardcoded assets?
- **Investigation & Code Evidence:**
  - In `api.py` (`create_exercise`), `targetAsset` was saved only into nested `config_json`.
  - In `database.py` (`get_exercise` and `list_exercises`), `targetAsset` was omitted from the top-level returned dictionary.
  - In `engine.py` (`run_simulation_loop` and `get_or_create_manual_session`), `RedTeamAgent` was instantiated without `target_asset`.
  - In `agents.py` (`RedTeamAgent`), attack events used hardcoded `"AUTH-01"`, `"API-01"`, `"FILE-01"`.
- **Status:** **CONFIRMED BUG (Remediated)**
- **Severity:** High
- **Root Cause:** Data propagation disconnect across API, persistence, engine, and agent layers.
- **Remediation:**
  - Added `target_asset: Optional[str] = None` to `RedTeamAgent.__init__`.
  - Updated scenario generators in `agents.py` to use `self.target_asset or scenario_default`.
  - Updated `database.py` to extract `targetAsset` from `config_json` into the root exercise object.
  - Passed `target_asset = ex.get("targetAsset")` from `engine.py` into `RedTeamAgent`.
  - Verified with test `test_target_asset_propagation`.

---

### Item B — Scenario Isolation & Cross-Scenario Contamination
- **Suspected Issue:** Does `scenario-suspicious-auth` emit web reconnaissance events? Is this intentional or an accidental cross-scenario leak?
- **Investigation & Code Evidence:**
  - Inspected `backend/simulation/scenarios.py` lines 76–115.
  - `SCENARIOS["scenario-suspicious-auth"]` explicitly defines:
    - `targetAssets: ["AUTH-01", "WEB-01"]`
    - `mitreTactics: ["Initial Access", "Credential Access"]`
    - Ground-Truth Objective `gt-auth-01`: "Reconnaissance against Web Portal", target asset `WEB-01`, expected indicator `HTTP_REQUEST`, MITRE tactic `Reconnaissance`.
- **Status:** **VERIFIED WORKING AS DESIGNED**
- **Severity:** Informational
- **Root Cause & Rationale:** In the MITRE ATT&CK enterprise matrix, adversary initial access and credential discovery are preceded by external web portal reconnaissance (e.g., scanning login pages and robots.txt). This multi-stage kill chain is an intentional architectural feature, not a bug.

---

### Item C — Event Timestamp Causality & Ordering
- **Suspected Issue:** How are timestamps generated, stored, and sorted? Can an alert have an earlier timestamp than the event that triggered it?
- **Investigation & Code Evidence:**
  - In `agents.py` (`RedTeamAgent.tick`), failed login events were generated with sub-second offsets: `get_ts(i * 400)` (e.g., $+1.6\text{s}$ at attempt 4).
  - In `BlueTeamSentinel.analyze`, when creating alerts from triggered events, alerts were stamped with `get_ts(0)`.
  - This caused the alert timestamp to be up to 1.6 seconds **earlier** than the 4th failed login event that triggered it!
  - When querying SQLite (`ORDER BY timestamp ASC`), causal ordering could be violated.
- **Status:** **CONFIRMED BUG (Remediated)**
- **Severity:** Medium
- **Remediation:**
  - Updated `BlueTeamSentinel.analyze` in `agents.py` so that alerts inherit `evt_ts = evt.get("timestamp") or get_ts(0)`.
  - Alerts are now guaranteed to have timestamps $\ge$ the triggering event timestamp.
  - Verified with test `test_alert_timestamp_causality`.

---

### Item D — Telemetry Counts & Benign vs. Adversarial Separation
- **Suspected Issue:** What does "Red Team event count" mean versus "Unified Telemetry count"? Are benign noise events and alerts polluting the Red Team activity log?
- **Investigation & Code Evidence:**
  - In `agents.py`, `RedTeamAgent` injects benign monitoring requests every 4,000ms with `isMalicious=False` and type `HTTP_REQUEST`.
  - In `frontend/app.js` line 401, the filter for the Red Team activity feed was:
    `if (t.isMalicious || ['HTTP_REQUEST', ...].includes(t.type))`
  - Because `HTTP_REQUEST` was in the list, routine benign health monitoring checks were rendered in the Red Team attack feed in the UI!
- **Status:** **CONFIRMED BUG (Remediated)**
- **Severity:** Medium
- **Remediation:**
  - Updated `frontend/app.js` to strictly check `if (t.isMalicious)`.
  - Benign events remain visible in the Unified Telemetry Stream table, but are no longer misclassified as adversarial attacks in the Red Team feed.
  - Verified with test `test_benign_noise_flagging`.

---

### Item E — Referee Scoring Mathematics & Zero-Division Safety
- **Suspected Issue:** Are all denominators protected against zero? Does the resilience score formula produce realistic scores, and how are multi-incident scenarios scored?
- **Investigation & Code Evidence:**
  - In `backend/simulation/referee.py`:
    - Zero ground-truth objectives is protected: `if total_gt == 0: total_gt = 1`.
    - Zero expected assets is protected: `max(1, len(expected_assets))`.
    - Recall zero division is protected: `if (tp_count + fn_count) > 0`.
    - Precision zero division is protected: `if (tp_count + fp_count) > 0`.
  - **Bug Discovered:** At line 127, `investigation_score` was computed as:
    `investigation_score = min(100.0, 50.0 + (len(incidents[0].get("evidence", [])) * 25.0))`
    This evaluated **only the first incident** (`incidents[0]`), ignoring evidence in any subsequent incidents (`incidents[1]`, `incidents[2]`) in multi-target scenarios!
- **Status:** **CONFIRMED BUG (Remediated)**
- **Severity:** Medium
- **Remediation:**
  - Updated `referee.py` to aggregate evidence across all correlated incidents:
    `total_evidence = sum(len(inc.get("evidence", [])) for inc in incidents)`
    `investigation_score = min(100.0, 50.0 + (total_evidence * 25.0 / investigated_count))`
  - Verified with test `test_referee_multi_incident_investigation_scoring`.

---

### Item F — Exercise Lifecycle Finite-State Machine (FSM)
- **Suspected Issue:** Can an exercise transition from an invalid state? What happens if `start` is called twice, or `cancel` is called on a completed exercise?
- **Investigation & Code Evidence:**
  - In `api.py` (`start_exercise`), calling start on a completed or cancelled exercise would overwrite its status to `running` and restart the simulation.
  - In `api.py` (`cancel_exercise`), calling cancel on a completed exercise would overwrite its status to `cancelled`.
  - In `api.py` (`respond_exercise`), responses could be dispatched on exercises that were not running.
- **Status:** **CONFIRMED BUG (Remediated)**
- **Severity:** High
- **Remediation:**
  - Added strict FSM guards in `backend/api.py`:
    - `start_exercise`: Returns 400 if status is in `["completed", "cancelled", "failed"]`. Returns existing state idempotently if already `running`.
    - `cancel_exercise`: Returns 400 if status is in `["completed", "cancelled", "failed"]`.
    - `step_exercise`: Returns 400 if status is in `["completed", "cancelled", "failed"]`.
    - `respond_exercise`: Returns 400 if status is not `running`.
  - Verified with test `test_lifecycle_fsm_guards`.

---

### Item G — Safety, Containment Boundedness & Error Handling
- **Suspected Issue:** Are all attacks strictly synthetic? Can containment lock out real user accounts or isolate host network cards?
- **Investigation & Code Evidence:**
  - Checked all playbook executions in `ResponseCommander` (`agents.py`) and `execute_manual_response` (`engine.py`).
  - No system subprocesses (`os.system`, `subprocess.Popen`) are called anywhere.
  - Containment actions only update in-memory dicts and write records to the SQLite `response_actions` and `incidents` tables.
  - All IP addresses belong to RFC 5737 test documentation blocks (`198.51.100.0/24`, `203.0.113.0/24`).
  - All usernames are synthetic dummies (`employee_001`, `service_account_01`).
- **Status:** **VERIFIED SAFE & BOUNDED**
- **Severity:** Informational
- **Conclusion:** 100% synthetic, zero blast radius, zero risk of host disruption.

---

## 3. Remediated Code Inventory

| File Modified | Lines Changed | Description of Fix |
|---|---|---|
| `backend/simulation/agents.py` | L41-47, L65-215 | Added `target_asset` parameter to `RedTeamAgent` and updated 6 attack scenarios to target it. |
| `backend/simulation/agents.py` | L244-395 | Synchronized Blue Sentinel alert timestamps with causal event timestamps (`evt_ts`). |
| `backend/simulation/engine.py` | L66-68, L216-218 | Propagated `targetAsset` from exercise database record to `RedTeamAgent` instantiation. |
| `backend/simulation/referee.py` | L124-129 | Evaluated investigation completeness across all correlated incidents rather than just index 0. |
| `backend/database.py` | L208-225, L235-253 | Surfaced `targetAsset` from nested `config_json` into root exercise dictionary in `get_exercise` and `list_exercises`. |
| `backend/api.py` | L147-152 | Saved `targetAsset` to initial exercise entity on creation. |
| `backend/api.py` | L172-216 | Added strict FSM guards on `/start`, `/cancel`, `/step`, and `/respond` to reject illegal transitions. |
| `frontend/app.js` | L400-403 | Restricted Red Team feed to `t.isMalicious === true`, keeping benign noise in telemetry only. |
| `backend/tests/test_audit_verification.py` | L1-180 | Created comprehensive 6-test audit verification suite. |

---

## 4. Conclusion

All suspected architectural issues have been thoroughly audited, verified, and fixed. The HavenSec Arena backend now features verified target asset propagation, strict state machine enforcement, causal timestamp ordering, multi-incident referee accuracy, and clean separation between synthetic attack telemetry and benign background noise.
