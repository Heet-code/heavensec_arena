# HavenSec Arena — Automated Test Execution Results

**Execution Date:** 2026-10-13  
**Environment:** Python 3.14.5 | Windows 11 | pytest 9.1.0 | pytest-asyncio 1.4.0  
**Test Suite Directory:** `backend/tests/`  
**Execution Command:** `$env:PYTHONPATH="backend"; python -m pytest backend/tests -v`  

---

## 1. Summary of Test Execution

| Total Tests | Passed | Failed | Skipped | Execution Time | Pass Rate |
|---|---|---|---|---|---|
| **13** | **13** | **0** | **0** | **0.97s** | **100.0%** |

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
| `test_coach.py` | `test_coach_weakness_identification_recall` | Verifies coach detects low recall and selects authentication scenario | **PASSED** | 0.04s |
| `test_coach.py` | `test_coach_comparison_delta` | Confirms calculation of $\Delta$ Resilience and $\Delta$ Blue scores | **PASSED** | 0.03s |
| `test_engine.py` | `test_full_simulation_loop_fast` | Executes complete 15-step simulation loop and verifies artifact persistence | **PASSED** | 0.28s |
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
collecting ... collected 13 items

backend/tests/test_agents.py::test_red_team_generation PASSED            [  7%]
backend/tests/test_agents.py::test_blue_sentinel_brute_force_detection PASSED [ 15%]
backend/tests/test_agents.py::test_investigation_and_response_lifecycle PASSED [ 23%]
backend/tests/test_api.py::test_health_check PASSED                      [ 30%]
backend/tests/test_api.py::test_scenario_endpoints PASSED                [ 38%]
backend/tests/test_api.py::test_environment_endpoint PASSED              [ 46%]
backend/tests/test_api.py::test_exercise_creation_and_lifecycle PASSED   [ 53%]
backend/tests/test_coach.py::test_coach_weakness_identification_recall PASSED [ 61%]
backend/tests/test_coach.py::test_coach_comparison_delta PASSED          [ 69%]
backend/tests/test_engine.py::test_full_simulation_loop_fast PASSED      [ 76%]
backend/tests/test_scoring.py::test_referee_empty_events PASSED          [ 84%]
backend/tests/test_scoring.py::test_referee_full_mitigation PASSED       [ 92%]
backend/tests/test_scoring.py::test_referee_uncontained_catastrophe PASSED [100%]

======================== 13 passed, 1 warning in 0.97s ========================
```
