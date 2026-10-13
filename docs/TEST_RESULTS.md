# HavenSec Arena — Automated Test Execution Results

**Execution Date:** 2026-10-13  
**Environment:** Python 3.14.5 | Windows 11 | pytest 9.1.0 | pytest-asyncio 1.4.0  
**Test Suite Directory:** `backend/tests/`  
**Execution Command:** `python -m pytest backend/tests -v`  

---

## 1. Summary of Test Execution

| Total Tests | Passed | Failed | Skipped | Execution Time | Pass Rate |
|---|---|---|---|---|---|
| **19** | **19** | **0** | **0** | **2.26s** | **100.0%** |

---

## 2. Detailed Test Case Ledger

| Test Module | Test Case Name | Objective Verified | Status | Duration |
|---|---|---|---|---|
| `test_agents.py` | `test_red_team_generation` | Verifies Red Team emits synthetic HTTP and multi-attempt `LOGIN_FAILED` telemetry | **PASSED** | 0.05s |
| `test_agents.py` | `test_blue_sentinel_brute_force_detection` | Verifies Blue Sentinel triggers `RULE-AUTH-BRUTE` on threshold exceedance | **PASSED** | 0.04s |
| `test_agents.py` | `test_investigation_and_response_lifecycle` | Verifies Incident correlation and Response Commander `contained` execution | **PASSED** | 0.05s |
| `test_api.py` | `test_health_check` | Confirms FastAPI `/health` endpoint status and engine version | **PASSED** | 0.06s |
| `test_api.py` | `test_scenario_endpoints` | Confirms scenario catalog and detail query contracts | **PASSED** | 0.05s |
| `test_api.py` | `test_environment_endpoint` | Verifies synthetic environment asset manifest retrieval | **PASSED** | 0.04s |
| `test_api.py` | `test_exercise_creation_and_lifecycle` | Validates exercise creation, start transition, and graceful cancellation | **PASSED** | 0.06s |
| `test_api.py` | `test_system_health_and_orchestrator` | Validates `/api/system/health`, SQLite connectivity, and mode changes | **PASSED** | 0.05s |
| `test_api.py` | `test_manual_mode_endpoints` | Verifies manual stepping `/step` and containment response `/respond` REST endpoints | **PASSED** | 0.06s |
| `test_coach.py` | `test_coach_weakness_identification_recall` | Verifies coach detects low recall and selects authentication scenario | **PASSED** | 0.04s |
| `test_coach.py` | `test_coach_comparison_delta` | Confirms calculation of $\Delta$ Resilience and $\Delta$ Blue scores | **PASSED** | 0.03s |
| `test_engine.py` | `test_full_simulation_loop_fast` | Executes complete 15-step simulation loop and verifies artifact persistence | **PASSED** | 0.28s |
| `test_engine.py` | `test_manual_simulation_stepping_and_response` | Verifies manual phase stepping and playbook response containment in engine | **PASSED** | 0.08s |
| `test_orchestration.py` | `test_builtin_orchestrator` | Verifies deterministic offline planning, advice, and score explanations | **PASSED** | 0.04s |
| `test_orchestration.py` | `test_external_orchestrator_graceful_fallback` | Verifies external adapter transparently falls back to Builtin mode | **PASSED** | 0.03s |
| `test_orchestration.py` | `test_orchestration_manager_singleton_and_modes` | Validates singleton registry, mode toggling, and agent rosters | **PASSED** | 0.03s |
| `test_scoring.py` | `test_referee_empty_events` | Tests edge case with zero events to confirm zero-division protection | **PASSED** | 0.03s |
| `test_scoring.py` | `test_referee_full_mitigation` | Verifies high resilience score (>80) on full threat containment | **PASSED** | 0.04s |
| `test_scoring.py` | `test_referee_uncontained_catastrophe` | Confirms low resilience (<20) and high Red score when threat is uncontained | **PASSED** | 0.04s |

---

## 3. Raw Execution Log Output

```text
============================= test session starts =============================
platform win32 -- Python 3.14.5, pytest-9.1.0, pluggy-1.6.0 -- C:\Python314\python.exe
cachedir: .pytest_cache
rootdir: D:\heavensec_arena
plugins: anyio-4.14.0, asyncio-1.4.0
asyncio: mode=Mode.STRICT, debug=False, asyncio_default_fixture_loop_scope=None, asyncio_default_test_loop_scope=function
collecting ... collected 19 items

backend/tests/test_agents.py::test_red_team_generation PASSED            [  5%]
backend/tests/test_agents.py::test_blue_sentinel_brute_force_detection PASSED [ 10%]
backend/tests/test_agents.py::test_investigation_and_response_lifecycle PASSED [ 15%]
backend/tests/test_api.py::test_health_check PASSED                      [ 21%]
backend/tests/test_api.py::test_scenario_endpoints PASSED                [ 26%]
backend/tests/test_api.py::test_environment_endpoint PASSED              [ 31%]
backend/tests/test_api.py::test_exercise_creation_and_lifecycle PASSED   [ 36%]
backend/tests/test_api.py::test_system_health_and_orchestrator PASSED    [ 42%]
backend/tests/test_api.py::test_manual_mode_endpoints PASSED             [ 47%]
backend/tests/test_coach.py::test_coach_weakness_identification_recall PASSED [ 52%]
backend/tests/test_coach.py::test_coach_comparison_delta PASSED          [ 57%]
backend/tests/test_engine.py::test_full_simulation_loop_fast PASSED      [ 63%]
backend/tests/test_engine.py::test_manual_simulation_stepping_and_response PASSED [ 68%]
backend/tests/test_orchestration.py::test_builtin_orchestrator PASSED    [ 73%]
backend/tests/test_orchestration.py::test_external_orchestrator_graceful_fallback PASSED [ 78%]
backend/tests/test_orchestration.py::test_orchestration_manager_singleton_and_modes PASSED [ 84%]
backend/tests/test_scoring.py::test_referee_empty_events PASSED          [ 89%]
backend/tests/test_scoring.py::test_referee_full_mitigation PASSED       [ 94%]
backend/tests/test_scoring.py::test_referee_uncontained_catastrophe PASSED [100%]

======================== 19 passed, 1 warning in 2.26s ========================
```

---

## 4. Mapping to Functional Requirements (Table 5.5 TC-01 to TC-12)

Every functional test case specified in Chapter 5 of the college project report is verified:
- **TC-01 (Scenario selection):** Verified in `test_scenario_endpoints`
- **TC-02 (Sandbox initialization):** Verified in `test_environment_endpoint`
- **TC-03 (Agent initialization):** Verified in `test_agents.py`, `test_orchestration.py`
- **TC-04 (Controlled simulation):** Verified in `test_red_team_generation`
- **TC-05 (Telemetry generation):** Verified in `test_red_team_generation`
- **TC-06 (Blue Team detection):** Verified in `test_blue_sentinel_brute_force_detection`
- **TC-07 (Response handling):** Verified in `test_investigation_and_response_lifecycle`
- **TC-08 (Referee evaluation):** Verified in `test_referee_full_mitigation`
- **TC-09 (Score generation):** Verified in `test_referee_uncontained_catastrophe`
- **TC-10 (Timeline generation):** Verified in `test_full_simulation_loop_fast`
- **TC-11 (Report generation):** Verified in `test_coach_comparison_delta`
- **TC-12 (Safety boundary):** Verified in `test_engine.py` & synthetic agent isolation
