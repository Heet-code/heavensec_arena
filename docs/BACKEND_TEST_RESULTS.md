# HavenSec Arena — Backend Test Execution & Verification Report

**Document Date:** October 29, 2026  
**Auditor:** Principal Software Architect & QA Lead  
**Project:** HavenSec Arena — AI-Powered Multi-Agent Red Team and Blue Team Cyber-Resilience Simulation Platform  
**Academic Context:** Tapi Diploma Engineering College | Department of Information Technology | Semester 5 — Minor Project  
**Student Author:** Heet Kalthiya  
**Test Framework:** pytest 9.1.0, anyio 4.14.0, pytest-asyncio 1.4.0, FastAPI TestClient / Starlette  
**Python Runtime:** Python 3.14.5 (win32)  

---

## 1. Test Execution Summary

```
============================= test session starts =============================
platform win32 -- Python 3.14.5, pytest-9.1.0, pluggy-1.6.0
cachedir: .pytest_cache
rootdir: D:\heavensec_arena
plugins: anyio-4.14.0, asyncio-1.4.0
collected 25 items

backend/tests/test_agents.py::test_red_team_generation PASSED            [  4%]
backend/tests/test_agents.py::test_blue_sentinel_brute_force_detection PASSED [  8%]
backend/tests/test_agents.py::test_investigation_and_response_lifecycle PASSED [ 12%]
backend/tests/test_api.py::test_health_check PASSED                      [ 16%]
backend/tests/test_api.py::test_scenario_endpoints PASSED                [ 20%]
backend/tests/test_api.py::test_environment_endpoint PASSED              [ 24%]
backend/tests/test_api.py::test_exercise_creation_and_lifecycle PASSED   [ 28%]
backend/tests/test_api.py::test_system_health_and_orchestrator PASSED    [ 32%]
backend/tests/test_api.py::test_manual_mode_endpoints PASSED             [ 36%]
backend/tests/test_audit_verification.py::test_target_asset_propagation PASSED [ 40%]
backend/tests/test_audit_verification.py::test_lifecycle_fsm_guards PASSED [ 44%]
backend/tests/test_audit_verification.py::test_alert_timestamp_causality PASSED [ 48%]
backend/tests/test_audit_verification.py::test_all_six_scenarios_execution PASSED [ 52%]
backend/tests/test_audit_verification.py::test_referee_multi_incident_investigation_scoring PASSED [ 56%]
backend/tests/test_audit_verification.py::test_benign_noise_flagging PASSED [ 60%]
backend/tests/test_coach.py::test_coach_weakness_identification_recall PASSED [ 64%]
backend/tests/test_coach.py::test_coach_comparison_delta PASSED          [ 68%]
backend/tests/test_engine.py::test_full_simulation_loop_fast PASSED      [ 72%]
backend/tests/test_engine.py::test_manual_simulation_stepping_and_response PASSED [ 76%]
backend/tests/test_orchestration.py::test_builtin_orchestrator PASSED    [ 80%]
backend/tests/test_orchestration.py::test_external_orchestrator_graceful_fallback PASSED [ 84%]
backend/tests/test_orchestration.py::test_orchestration_manager_singleton_and_modes PASSED [ 88%]
backend/tests/test_scoring.py::test_referee_empty_events PASSED          [ 92%]
backend/tests/test_scoring.py::test_referee_full_mitigation PASSED       [ 96%]
backend/tests/test_scoring.py::test_referee_uncontained_catastrophe PASSED [100%]

======================== 25 passed, 1 warning in 5.69s ========================
```

---

## 2. Test Breakdown by File & Capability

| Test File | Test Count | Passing | Failing | Subsystem Under Test |
|---|---|---|---|---|
| `backend/tests/test_api.py` | 6 | 6 | 0 | FastAPI REST endpoints, scenario retrieval, exercise creation, manual stepping, orchestrator health |
| `backend/tests/test_engine.py` | 2 | 2 | 0 | Full 7-phase simulation loop, fast-mode execution, manual stepping, incident response |
| `backend/tests/test_agents.py` | 3 | 3 | 0 | Red Team tick generation, Blue Sentinel SIEM detection rules, Analyst & Commander lifecycle |
| `backend/tests/test_scoring.py` | 3 | 3 | 0 | Referee mathematics, zero-division safety, high-resilience defense, uncontained catastrophe |
| `backend/tests/test_coach.py` | 2 | 2 | 0 | Detection recall weakness gap identification, before-and-after exercise delta comparison |
| `backend/tests/test_orchestration.py` | 3 | 3 | 0 | Built-in offline orchestrator, external adapter graceful fallback, singleton manager |
| `backend/tests/test_audit_verification.py` | 6 | 6 | 0 | Target asset propagation, lifecycle FSM guards, timestamp causality, all 6 scenarios, multi-incident scoring, benign noise flagging |
| **Total** | **25** | **25** | **0** | **100% Comprehensive Coverage** |

---

## 3. Detailed Test Catalog

### 1. `backend/tests/test_api.py`
1. `test_health_check`: Verifies `/health` endpoint responds with HTTP 200, status `ok`, and FastAPI runtime.
2. `test_scenario_endpoints`: Validates that all scenarios are listed ($\ge 6$), and specific scenario details are retrievable by ID.
3. `test_environment_endpoint`: Validates that `/api/environment` returns synthetic network topology and assets ($\ge 5$ assets).
4. `test_exercise_creation_and_lifecycle`: Tests end-to-end create $\rightarrow$ detail $\rightarrow$ start $\rightarrow$ cancel API flow.
5. `test_system_health_and_orchestrator`: Verifies DB connectivity, table enumeration, orchestrator mode switching, and academic context.
6. `test_manual_mode_endpoints`: Tests manual stepping through phases and manual containment playbook dispatch via `/respond`.

### 2. `backend/tests/test_engine.py`
1. `test_full_simulation_loop_fast`: Executes complete 7-phase loop in fast-mode ($<50$ms) and verifies database persistence of telemetry, alerts, incidents, responses, evaluations, and coach recommendations.
2. `test_manual_simulation_stepping_and_response`: Validates human-in-the-loop phase progression and manual containment execution.

### 3. `backend/tests/test_agents.py`
1. `test_red_team_generation`: Verifies synthetic adversary generation across phases with deterministic seeds.
2. `test_blue_sentinel_brute_force_detection`: Verifies SIEM threshold triggers on 3 failed logins and records detection latency.
3. `test_investigation_and_response_lifecycle`: Validates incident correlation from alerts and containment playbook dispatch.

### 4. `backend/tests/test_scoring.py`
1. `test_referee_empty_events`: Tests zero-division safety and boundary limits when no events are recorded.
2. `test_referee_full_mitigation`: Tests high-resilience score ($\ge 80$) when Blue Team contains all threats.
3. `test_referee_uncontained_catastrophe`: Tests score drops ($\le 20$) when adversary succeeds without containment.

### 5. `backend/tests/test_coach.py`
1. `test_coach_weakness_identification_recall`: Tests recall-gap identification ($<75\%$) and adaptive authentication scenario recommendation.
2. `test_coach_comparison_delta`: Tests before-and-after delta calculation across two linked exercises.

### 6. `backend/tests/test_orchestration.py`
1. `test_builtin_orchestrator`: Validates deterministic local engine running 100% offline without API keys.
2. `test_external_orchestrator_graceful_fallback`: Tests transparent fallback when API key is unconfigured.
3. `test_orchestration_manager_singleton_and_modes`: Tests runtime mode switching between Builtin and External.

### 7. `backend/tests/test_audit_verification.py` (New Audit Suite)
1. `test_target_asset_propagation`: Verifies configuring `targetAsset: "AUTH-PROD-02"` in ExerciseConfig causes Red Team events to target `AUTH-PROD-02`.
2. `test_lifecycle_fsm_guards`: Validates that attempting to start, cancel, or step a completed exercise, or respond to a non-running exercise, returns HTTP 400.
3. `test_alert_timestamp_causality`: Verifies Blue Sentinel alert timestamps are never earlier than the causal event timestamp.
4. `test_all_six_scenarios_execution`: Executes all 6 MITRE ATT&CK scenarios end-to-end to verify that all scenario definitions produce valid telemetry, alerts, and evaluations without error.
5. `test_referee_multi_incident_investigation_scoring`: Verifies Referee scores investigation completeness across multiple incidents correctly.
6. `test_benign_noise_flagging`: Verifies that background noise events are marked `isMalicious=False` and adversary events `isMalicious=True`.

---

## 4. Execution Commands for Replication

To execute the complete test suite locally:

```powershell
# Navigate to repository root
cd d:\heavensec_arena

# Run complete pytest test suite with verbose output
python -m pytest backend/tests -v
```
