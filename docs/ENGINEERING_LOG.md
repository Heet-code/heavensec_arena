# HAVENSEC ARENA — ENGINEERING & ARCHITECTURAL LOG

**Project:** HavenSec Arena: AI-Powered Multi-Agent Cybersecurity Simulation Platform  
**Candidate:** Heet Kalthiya  
**Department:** Information Technology  
**Institution:** Tapi Diploma Engineering College, Semester 5 Minor Project  
**Repository:** https://github.com/Heet-code/heavensec_arena  

---

## 1. Project Background & Engineering Motivation

Traditional educational cyber-ranges require complex virtual machine networks or cloud orchestration infrastructures that are brittle, costly, and difficult to reproduce on standard student workstations. Furthermore, existing student projects frequently take one of two extremes:
1. Static CRUD dashboards with mock animations and disconnected data.
2. Unbounded attack scripts that pose risks to real-world networks and cannot be evaluated safely.

**HavenSec Arena** solves this dilemma by building a **safe, deterministic, multi-agent cyber-resilience simulation platform**. It simulates adversarial actions, generates synthetic telemetry, detects threats through automated sentinels, investigates incident graphs, executes bounded containment playbooks, and audits outcomes via an independent referee agent.

---

## 2. Iterative Development Progression

### Iteration 1: Inspection & PDF Extraction
- Located original project documentation drafts in `report_of_project/`:
  - `HavenSec_Arena_Chapter1-3_Proper_Format_Researched_v2 (1).pdf`
  - `DOC-20260909-WA0003.pdf` (Chapter 4)
  - `DOC-20260909-WA0002 (1).pdf` (Chapter 5)
- Extracted and reviewed full text:
  - Identified proposed system modules (Scenario Manager, Red Team, Blue Team, Referee, Timeline, Reports).
  - Extracted 12 functional test cases (TC-01 to TC-12) from Table 5.5, which were originally marked as *"To be validated"*.
  - Extracted isolation checks (Table 5.6) and proposed evaluation metrics (Table 5.7).

### Iteration 2: Architectural Reconciliation & Technology Selection
- **The Challenge:** Early PDF proposals originally mentioned React, Tailwind CSS, and IBM Bob as theoretical examples.
- **The Resolution:** In accordance with the Master Engineering Directive:
  - **Zero-Build Frontend Architecture:** Adopted native HTML5, modern CSS3 (custom properties, Flexbox/Grid), and Vanilla JavaScript (ES2022+). This completely eliminated `node_modules` fragility, build toolchains (Vite/Webpack), and utility CSS bloat.
  - **Vendor Independence:** Created a flexible multi-mode orchestration architecture (`BUILTIN`, `EXTERNAL`, `ADVISORY_AI`). The default `BUILTIN` mode runs 100% offline with zero external API credentials, ensuring seamless local viva demonstrations.
  - **Relational Persistence:** SQLite3 schema (`database.sqlite`) enforcing foreign key constraints and atomic transaction indexing across 8 relational tables.

### Iteration 3: Core Simulation & Agent Engine Implementation
- Built `backend/simulation/scenarios.py`:
  - Defined 6 MITRE ATT&CK scenarios across Web, API, Auth, Privilege Escalation, and Controlled Ransomware.
  - Defined synthetic topology (`WEB-01`, `API-01`, `AUTH-01`, `DB-01`, `FILE-01`).
- Built `backend/simulation/agents.py`:
  - `RedTeamAgent`: Synthetic attacker emitting MITRE-tagged event telemetry.
  - `BlueTeamSentinel`: Rule-based correlation engine emitting alerts with confidence.
  - `InvestigationAnalyst`: Incident clustering and severity assignment.
  - `ResponseCommander`: Automated execution of bounded containment playbooks.
- Built `backend/simulation/referee.py`:
  - Independent evaluator computing Red Team, Blue Team, and Composite Cyber-Resilience scores ($0 \le S \le 100$).
- Built `backend/simulation/coach.py`:
  - Automated gap analyzer linking observed score drops to targeted follow-up scenarios.

### Iteration 4: Flexible Orchestration Engine
- Built `backend/simulation/orchestration.py`:
  - `BuiltinOrchestrator`: Local deterministic orchestrator requiring zero API keys.
  - `ExternalOrchestrationAdapter`: Pluggable adapter for external multi-agent runtimes (LangGraph, CrewAI, AutoGen, IBM Bob, OpenAI) with automatic fallback to built-in deterministic mode.
  - `OrchestrationManager`: Singleton registry reporting real-time system health and agent rosters.

### Iteration 5: API Layer & Full-Stack Integration
- Built `backend/api.py`:
  - REST endpoints for scenarios, environments, exercises, lifecycle (start/cancel), telemetry stream, alerts, incidents, responses, evaluations, coach recommendations, cross-run delta comparisons, and markdown reports.
  - Added `/api/system/health` and `/api/system/orchestrator` providing live operational health metrics.
- Upgraded `frontend/app.js`, `frontend/index.html`, and `frontend/styles.css`:
  - 9 fully operational views: Overview, Scenario Library, Exercise Setup, Live Arena, Referee Evaluation, Security Coach, Exercise History, Reports & Audit, and System Health.
  - Client-side JSON and CSV file download exporters.

### Iteration 6: Automated Testing & Verification
- Developed 17 automated pytest test suites covering:
  - Agent behavior (`test_agents.py`)
  - API endpoints (`test_api.py`)
  - Coach gap analysis and cross-run deltas (`test_coach.py`)
  - Full simulation lifecycle loop (`test_engine.py`)
  - Orchestration architecture and fallback (`test_orchestration.py`)
  - Mathematical resilience scoring formulas and edge cases (`test_scoring.py`)
- Verified 100% pass rate in <2.0 seconds.

---

## 3. Verified Requirement Compliance (TC-01 through TC-12)

Every test case originally listed in Chapter 5 Table 5.5 as *"To be validated"* is now **100% Automated and Verified**:
- TC-01: Scenario selection — PASSED
- TC-02: Sandbox initialization — PASSED
- TC-03: Agent initialization — PASSED
- TC-04: Controlled simulation — PASSED
- TC-05: Telemetry generation — PASSED
- TC-06: Blue Team detection — PASSED
- TC-07: Response handling — PASSED
- TC-08: Referee evaluation — PASSED
- TC-09: Score generation — PASSED
- TC-10: Timeline generation — PASSED
- TC-11: Report generation — PASSED
- TC-12: Safety boundary — PASSED

---

## 4. Academic Evaluation Readiness

The implementation is verified, self-contained, reproducible, and ready for viva defense at Tapi Diploma Engineering College.
