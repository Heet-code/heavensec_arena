# HavenSec Arena — Evidence Register & Traceability Matrix

**Project:** HavenSec Arena  
**Student:** Heet Kalthiya | Tapi Diploma Engineering College  
**Date:** 2026-10-13  

---

| Requirement ID | Requirement Description | Implementation Location | Verification Method | Actual Result | Status |
|---|---|---|---|---|---|
| **REQ-01** | Bounded synthetic adversarial simulation (No real malware) | `backend/simulation/scenarios.py`, `backend/simulation/agents.py` | Unit Test: `test_red_team_generation` | Emitted structured synthetic telemetry targeting `AUTH-01`, `WEB-01` without OS impact. | **VERIFIED** |
| **REQ-02** | Rule-based SIEM detection with duplicate alert suppression | `backend/simulation/agents.py` (`BlueTeamSentinel`) | Unit Test: `test_blue_sentinel_brute_force_detection` | Generated `RULE-AUTH-BRUTE` alert on 3rd failed login; suppressed duplicates; recorded latency. | **VERIFIED** |
| **REQ-03** | Incident evidence correlation across assets | `backend/simulation/agents.py` (`InvestigationAnalyst`) | Unit Test: `test_investigation_and_response_lifecycle` | Grouped alerts into structured `Incident` linking affected asset `AUTH-01` and evidence indicators. | **VERIFIED** |
| **REQ-04** | Automated containment playbook dispatch | `backend/simulation/agents.py` (`ResponseCommander`) | Unit Test: `test_investigation_and_response_lifecycle` | Dispatched `ACCOUNT_LOCKOUT_AND_IP_BLOCK` and updated incident state to `contained`. | **VERIFIED** |
| **REQ-05** | Independent Referee ground-truth audit | `backend/simulation/referee.py` (`RefereeAgent`) | Unit Tests: `test_scoring.py` | Verified actual events against pre-established GT objectives without trusting agent claims. | **VERIFIED** |
| **REQ-06** | Tripartite scoring model (Red Team, Blue Team, Resilience) | `backend/simulation/referee.py` | Unit Tests: `test_referee_full_mitigation`, `test_referee_uncontained_catastrophe` | Produced distinct Red (0–100), Blue (0–100), and Resilience (0–100) scores; verified resilience != average. | **VERIFIED** |
| **REQ-07** | Zero-division protection and scoring safeguards | `backend/simulation/referee.py` | Unit Test: `test_referee_empty_events` | Returned normalized 0.0 scores with limitation warnings when 0 events present; no crash. | **VERIFIED** |
| **REQ-08** | Deterministic Security Coach weakness detection | `backend/simulation/coach.py` (`CoachEngine`) | Unit Test: `test_coach_weakness_identification_recall` | Flagged low recall (<75%) and recommended targeted authentication follow-up exercise. | **VERIFIED** |
| **REQ-09** | Before-and-after cross-run comparative analysis | `backend/simulation/coach.py` | Unit Test: `test_coach_comparison_delta` | Accurately computed $\Delta$ Resilience (+26.0) and confirmed measurable defensive improvement. | **VERIFIED** |
| **REQ-10** | Explicit lifecycle state machine | `backend/simulation/engine.py` | Integration Test: `test_full_simulation_loop_fast` | Advanced strictly through `CREATED` → `PREPARING` → `RUNNING` → `DETECTING` → `INVESTIGATING` → `RESPONDING` → `EVALUATING` → `COMPLETED`. | **VERIFIED** |
| **REQ-11** | Relational SQLite persistence with foreign keys | `backend/database.py` | Integration Test: `test_full_simulation_loop_fast` | Persisted exercises, telemetry, alerts, incidents, responses, evaluations, and coach recommendations. | **VERIFIED** |
| **REQ-12** | Validated FastAPI REST contracts | `backend/api.py` | Integration Test: `test_api.py` (FastAPI TestClient) | Health, scenarios, exercise lifecycle, and cancellation endpoints all returned 200 OK. | **VERIFIED** |
| **REQ-13** | Vanilla JS responsive 8-view SOC dashboard | `frontend/index.html`, `frontend/app.js`, `frontend/styles.css` | Integration & Code Review | Overview, Scenarios, Setup, Live Arena, Referee, Coach, History, and Reports rendered with XSS safety. | **VERIFIED** |
| **REQ-14** | Windows startup automation | `start.bat`, `start.ps1` | Code & Configuration Inspection | Verified scripts launch FastAPI on port 9002 and static frontend on port 8080. | **VERIFIED** |
| **REQ-15** | Docker Compose containerization | `docker-compose.yml`, `frontend/nginx.conf` | Configuration Inspection | Verified Nginx reverse proxy configuration mapping `/api/` to `backend:8000`. | **VERIFIED** |
