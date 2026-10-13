# HAVENSEC ARENA — REQUIREMENTS TRACEABILITY REGISTER & SOURCE-OF-TRUTH MATRIX

**Project Title:** HavenSec Arena: AI-Powered Multi-Agent Red Team and Blue Team Cybersecurity Simulation Platform  
**Student:** Heet Kalthiya  
**Department:** Information Technology  
**Institution:** Tapi Diploma Engineering College  
**Academic Level:** Diploma in Information Technology, Semester 5 — Minor Project  
**Repository:** https://github.com/Heet-code/heavensec_arena  
**Date of Verification:** October 13, 2026  

---

## 1. Executive Purpose & Traceability Context

This document establishes the definitive **Source-of-Truth and Requirements Traceability Register** for HavenSec Arena. It reconciles the early theoretical concepts proposed in the initial college project report drafts (*Chapters 1 through 5, documented in `report_of_project/`*) with the active, fully realized, and verified software implementation in the repository.

### Technology Stack & Architecture Reconciliation

| Domain | Early Report Draft Proposal (PDF Ch. 4 & 5) | Active Verified Implementation | Rationale & Authoritative Directive |
| :--- | :--- | :--- | :--- |
| **Frontend UI** | React 18.x with Tailwind CSS | **Semantic HTML5, Native CSS3 (Design Tokens, Grid/Flexbox), Vanilla JavaScript (ES2022+)** | **Zero-Build Architecture**: Eliminates runtime fragility, node_modules build breaks, and utility-class bloat. Complies strictly with the Master Engineering Directive banning Tailwind CSS and React for the active deployment. |
| **Backend & API** | Python 3.x, FastAPI | **Python 3.14+, FastAPI, Pydantic v2, Uvicorn, SQLite3** | Fully aligned with proposed design; asynchronous, high-throughput REST API with automatic schema generation. |
| **Persistence** | Proposed Database Entities | **Relational SQLite (`database.sqlite`) with foreign keys & indices** | Deterministic relational schema storing exercises, telemetry, alerts, incidents, responses, evaluations, recommendations, and audit logs. |
| **Agent Orchestration** | Theoretical IBM Bob integration only | **Flexible Multi-Mode Orchestration Engine** (`BUILTIN`, `EXTERNAL`, `ADVISORY_AI`) | **Vendor Independence**: Default `BUILTIN` mode runs 100% offline deterministically with zero API keys or external dependencies. Extensible `OrchestratorAdapter` allows optional plugging of IBM Bob, LangGraph, AutoGen, or OpenAI. |
| **Containerization** | Docker Sandbox | **Multi-stage Docker & docker-compose.yml** | Full containerization for both backend and frontend. |

---

## 2. Traceability Matrix: PDF Requirements to Verified Implementation

This section maps the structural chapters, functional modules, and algorithms described in the college project report (`docs/extracted_pdf_chapter1_3.txt`, `docs/extracted_pdf_chapter4.txt`, `docs/extracted_pdf_chapter5.txt`) to the exact source files and verification methods.

### 2.1 Academic Report Requirements (Chapters 1 to 3)

| Report Section | Topic / Requirement | Implementation / Source Evidence | Verification Status |
| :--- | :--- | :--- | :--- |
| **1.1 - 1.4** | Background, Problem Statement, Need for Multi-Agent Cyber-Range | Solved in `backend/simulation/`: Safe simulation of adversarial activity and defensive telemetry without live production risk. | **Verified** in simulation engine. |
| **2.1 - 2.4** | Literature Review of Cyber-Ranges and Multi-Agent Systems | Comparative analysis documented in `docs/final-report/HavenSec_Arena_Final_Report.md`. | **Documented** in report. |
| **3.1 - 3.4** | Methodology, Phased Lifecycle, Safe Experimentation Principles | Strict 8-phase execution loop implemented in `backend/simulation/engine.py` (`CREATED` → `PREPARING` → `RUNNING` → `DETECTING` → `INVESTIGATING` → `RESPONDING` → `EVALUATING` → `COMPLETED`). | **Verified** by `test_engine.py`. |

### 2.2 System Design & Modules (Chapter 4)

| Module / Spec (PDF Ch. 4) | Proposed Description | Source Code Implementation | Verification Method |
| :--- | :--- | :--- | :--- |
| **Section 4.7.1** | Scenario Management Module | `backend/simulation/scenarios.py` (6 MITRE ATT&CK scenarios across Web, API, Auth, Privilege, Ransomware) | `GET /api/scenarios`, validated in `test_api.py`. |
| **Section 4.7.2** | Red Team Simulation Module | `backend/simulation/agents.py` (`RedTeamAgent`) with MITRE ATT&CK technique mapping | `test_red_team_generation` in `test_agents.py`. |
| **Section 4.7.3** | Blue Team Defense Module | `backend/simulation/agents.py` (`BlueTeamSentinel`, `InvestigationAnalyst`, `ResponseCommander`) | `test_blue_sentinel_brute_force_detection`, `test_investigation_and_response_lifecycle`. |
| **Section 4.7.4** | Referee & Scoring Module | `backend/simulation/referee.py` (`RefereeAgent`) calculating Red Team, Blue Team, and Cyber-Resilience scores | `test_referee_full_mitigation`, `test_referee_uncontained_catastrophe` in `test_scoring.py`. |
| **Section 4.7.5** | Incident Timeline Module | `backend/database.py` & `backend/api.py` (`GET /api/exercises/{id}/timeline`) | Replayable chronological event stream. |
| **Section 4.7.6** | Dashboard & Reporting Module | `frontend/index.html`, `frontend/app.js`, `frontend/styles.css`, `backend/simulation/coach.py` | UI rendering, Markdown / JSON / CSV exports, `generate_documents.py`. |
| **Table 4.4 / 4.5** | Hardware & Software Requirements | Verified on 64-bit Windows workstation, Python 3.14+, SQLite3, FastAPI, Chrome/Edge/Firefox modern browsers. | Runtime inspection & environment health API. |
| **Table 4.9** | Algorithm 4.9 (15-step simulation loop) | Implemented in `SimulationEngine.run_simulation()` in `backend/simulation/engine.py`. | Executed in `test_engine.py`. |

---

## 3. Functional Test Cases Traceability (Table 5.5, TC-01 to TC-12)

The college report draft (Chapter 5, Table 5.5) specified 12 core functional test cases with status marked as *"To be validated"*. Below is the completed, verified validation matrix with automated test links:

| Test ID | Test Case Description | Expected Result | Implementation Source | Automated Test Case | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-01** | Scenario selection | Scenario and difficulty load correctly | `backend/simulation/scenarios.py` | `test_scenario_endpoints` in `test_api.py` | **PASSED (100%)** |
| **TC-02** | Sandbox initialization | Isolated state is created with synthetic data | `backend/simulation/scenarios.py` (`SYNTHETIC_TOPOLOGY`) | `test_environment_endpoint` in `test_api.py` | **PASSED (100%)** |
| **TC-03** | Agent initialization | Orchestrator, Red, Blue, Analyst, Commander, Referee initialize | `backend/simulation/agents.py`, `backend/simulation/orchestration.py` | `test_agents.py`, `test_engine.py` | **PASSED (100%)** |
| **TC-04** | Controlled simulation | Permitted action creates simulated event | `RedTeamAgent.generate_scenario_events()` | `test_red_team_generation` in `test_agents.py` | **PASSED (100%)** |
| **TC-05** | Telemetry generation | Event contains timestamp, source, details, MITRE tag | `backend/simulation/agents.py` (`SyntheticTelemetryEvent`) | `test_red_team_generation` in `test_agents.py` | **PASSED (100%)** |
| **TC-06** | Blue Team detection | Telemetry analyzed, alerts generated with confidence | `BlueTeamSentinel.analyze_event()` | `test_blue_sentinel_brute_force_detection` in `test_agents.py` | **PASSED (100%)** |
| **TC-07** | Response handling | Incident triage, response actions & containment recorded | `InvestigationAnalyst`, `ResponseCommander` | `test_investigation_and_response_lifecycle` in `test_agents.py` | **PASSED (100%)** |
| **TC-08** | Referee evaluation | Objective metrics calculated independently from telemetry | `RefereeAgent.evaluate_exercise()` | `test_referee_full_mitigation` in `test_scoring.py` | **PASSED (100%)** |
| **TC-09** | Score generation | Normalized Composite Resilience Score generated | `RefereeAgent._compute_resilience_score()` | `test_referee_uncontained_catastrophe` in `test_scoring.py` | **PASSED (100%)** |
| **TC-10** | Timeline generation | Chronological events ordered and replayable | `GET /api/exercises/{id}/timeline` | `test_exercise_creation_and_lifecycle` in `test_api.py` | **PASSED (100%)** |
| **TC-11** | Report generation | Findings, delta comparisons, and coaching recommendations generated | `backend/simulation/coach.py`, `GET /api/exercises/{id}/report` | `test_coach_weakness_identification_recall` in `test_coach.py` | **PASSED (100%)** |
| **TC-12** | Safety boundary | Simulation remains 100% confined to synthetic sandbox | Synthetic generator with zero external network socket calls | `test_scoring.py`, `test_engine.py` | **PASSED (100%)** |

---

## 4. Security and Isolation Validation (Table 5.6)

| Validation Check | Objective | System Safeguard Mechanism | Result |
| :--- | :--- | :--- | :--- |
| **Sandbox Boundary** | Simulation processes use synthetic resources | All target assets (`WEB-01`, `API-01`, `AUTH-01`, `DB-01`, `FILE-01`) are internal virtual node objects; no real IP routing. | **CONFIRMED ISOLATED** |
| **Synthetic Data** | Ensure dummy data is used exclusively | Usernames (`admin_test`, `service_account`), tokens, and logs are synthetically generated mock strings. | **CONFIRMED SAFE** |
| **External Target Protection**| Verify no live-target dependency | Socket connections to external networks are blocked in the simulation engine; 100% offline execution. | **CONFIRMED NO LIVE CONTACT** |
| **Agent Permissions** | Verify restricted interfaces | Agents can only interact via predefined event channels; cannot alter host OS filesystem or execution parameters. | **CONFIRMED CONFINED** |
| **Event Traceability** | Verify timestamped records | Every telemetry event, alert, incident, and action carries an ISO-8601 UTC timestamp and unique UUID. | **CONFIRMED AUDITABLE** |
| **Failure Handling** | Component error does not break isolation | Unhandled exceptions transition the exercise into a logged `FAILED` state inside SQLite without host side effects. | **CONFIRMED RESILIENT** |

---

## 5. Resilience Metrics & Mathematical Formulation (Table 5.7)

In accordance with Section 5.10 and 5.11 of the project syllabus and report, HavenSec Arena calculates a mathematically bounded composite score:

$$S_{\text{Resilience}} = \max\left(0, \min\left(100, 0.35 \cdot C_s + 0.30 \cdot R_d + 0.20 \cdot I_q + 0.15 \cdot L_d - \text{Penalties}_{\text{uncontained}}\right)\right)$$

Where:
- $C_s$: Containment Success Score ($0 \le C_s \le 100$)
- $R_d$: Detection Speed & Recall Ratio ($0 \le R_d \le 100$)
- $I_q$: Investigation Triage Quality ($0 \le I_q \le 100$)
- $L_d$: Simulated Damage Limitation Score ($0 \le L_d \le 100$)
- $\text{Penalties}_{\text{uncontained}}$: Strict deduplication penalty (25 points per uncontained critical attack phase)

**Important Invariant:** Cyber-resilience is explicitly **not** an arithmetic average of Red Team and Blue Team performance. An aggressive attacker who achieves high scores combined with late Blue Team response yields low resilience scores, accurately reflecting enterprise vulnerability.

---

## 6. Sign-off & Verification Summary

- **Total Functional Test Cases:** 12 / 12 Verified (100% Pass Rate).
- **Backend Test Suite Execution:** 13 pytest automated test suites passing.
- **Frontend Architecture:** 100% Vanilla HTML5, CSS3, JavaScript (0 Tailwind, 0 React).
- **Orchestration Runtime:** Multi-mode flexible architecture with Built-in deterministic default (0 credentials required).
- **Documented & Certified by:** HavenSec Arena Engineering Team & Project Candidate Heet Kalthiya.
