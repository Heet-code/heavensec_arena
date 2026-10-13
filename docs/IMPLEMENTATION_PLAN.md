# HavenSec Arena — Engineering Audit & Implementation Plan

## 1. Repository Audit

| Feature | Existing Implementation | Evidence | Gap | Planned Action | Classification |
|---|---|---|---|---|---|
| **Technology Stack** | Hybrid: Node/Express & React in `server`/`client`; Python/FastAPI in `backend`; Vanilla JS in `frontend` | `server/src`, `client/src`, `backend/api.py`, `frontend/app.js` | Disconnect in `start.bat`/`start.ps1` launching Node/Vite instead of Python/FastAPI. | Update `start.bat`, `start.ps1`, `docker-compose.yml`, and `README.md` to target Python/FastAPI and Vanilla JS. | Partially implemented |
| **Persistence Layer** | Key-Value `store` table in SQLite (`database.py`) storing JSON strings | `backend/database.py` lines 16-24 | Lacks relational schema, foreign keys, indexes, structured tables for exercises, telemetry, alerts, incidents, evaluations, recommendations. | Implement structured relational SQLite tables with indexes, foreign keys, and typed helper queries. | Partially implemented |
| **Agent Architecture** | Single file with basic Red/Blue classes; only 1 attack type (auth failure) | `backend/simulation.py` | Lacks multi-scenario coverage, seed reproducibility, difficulty modifiers, and independent ground truth tracking. | Modularize into `simulation/` package: `agents.py`, `referee.py`, `coach.py`, `scenarios.py`, `engine.py`. | Partially implemented |
| **Orchestrator Lifecycle** | Incomplete phase loop without state transition guards, cancellation, or duplicate prevention | `backend/simulation.py` lines 123-169 | Does not enforce legal state machine transitions (`CREATED` -> `PREPARING` -> `RUNNING` -> `DETECTING` -> `INVESTIGATING` -> `RESPONDING` -> `EVALUATING` -> `COMPLETED`, `FAILED`/`CANCELLED`). | Build state machine with seed assignment, pre-established ground-truth generation, and cancellation. | Partially implemented |
| **Independent Referee** | Missing; hardcoded dictionary `"overall": 85` at end of loop | `backend/simulation.py` lines 178-190 | No ground-truth verification, no separate Red vs Blue scores, no resilience formulation, no deduction/bonus transparency. | Implement `RefereeAgent` that compares actual telemetry/alerts against pre-exercise ground truth. | Broken |
| **Resilience Scoring Model** | Hardcoded static numbers | `backend/simulation.py` line 179 | Resilience is collapsed into a single fake score without distinct Red Team (0-100), Blue Team (0-100), and Resilience (0-100) formulas. | Implement distinct, evidence-based mathematical models for Red Team, Blue Team, and Cyber-Resilience. | Missing |
| **Security Coach & Adaptive Scenarios** | Missing in Python; static mockup in legacy TS | `server/src/services/CoachService.ts` | No automated weakness detection, no rule/incident evidence linking, no adaptive next-scenario selection or comparison. | Implement `CoachEngine` that analyzes Referee metrics, identifies priority weaknesses, and recommends follow-up scenarios. | Missing |
| **Frontend UI** | 3 basic sections (Dashboard, Arena, Score) | `frontend/index.html`, `frontend/app.js` | Missing Overview, Scenario Library, Setup, Coach recommendations, History, and Reports views. Hardcoded port `9002`. | Implement complete 8-section responsive interface with dynamic port fallback, XSS protection, and tab switching. | Partially implemented |
| **Automated Testing** | 1 print-based script (`test_engine.py`) without assertions | `backend/test_engine.py` | No pytest test suite, no assertions, no scoring edge-case tests, no API integration test. | Create `backend/tests/` with unit tests for scoring, agents, coach, engine, and end-to-end API integration tests. | Broken |
| **College Report & Deliverables** | 111-line draft markdown report | `docs/final-report/HavenSec_Arena_Final_Report.md` | Template has 9 GTU chapters; viva preparation has only 10 basic questions; no PDF/DOCX generated from evidence. | Write comprehensive 9-chapter report, 25+ viva Q&As, evidence register, test results, and generate PDF and DOCX files. | Partially implemented |

---

## 2. Implementation Plan & Dependencies

### Phase 1: Database & Domain Models
- Define relational SQLite schema in `backend/database.py` with foreign keys, indexes, and migrations.
- Expand Pydantic models in `backend/models.py` covering all entities.

### Phase 2: Scenario Library & Ground Truth
- Define 6 diverse scenarios with MITRE ATT&CK mapping, synthetic target assets, ground-truth objectives, and difficulty modifiers in `backend/simulation/scenarios.py`.

### Phase 3: Multi-Agent Simulation Engine
- Implement `RedTeamAgent`, `BlueTeamSentinel`, `InvestigationAnalyst`, `ResponseCommander` in `backend/simulation/agents.py`.
- Implement `RefereeAgent` in `backend/simulation/referee.py` with ground-truth verification and distinct Red, Blue, and Resilience scoring algorithms.
- Implement `CoachEngine` in `backend/simulation/coach.py` with deterministic adaptation policies and before-and-after comparison.
- Implement `SimulationEngine` in `backend/simulation/engine.py` with deterministic seed, phase transitions, and persistence.

### Phase 4: API & Integration Endpoints
- Implement REST API routes in `backend/api.py` for exercises, scenarios, telemetry, alerts, incidents, evaluations, coach recommendations, history, and comparison.

### Phase 5: Frontend Interface
- Build an 8-section UI in `frontend/index.html`, `frontend/app.js`, `frontend/styles.css` with live streaming, evaluation breakdown, coach views, and reports.

### Phase 6: Automated Testing & Verification
- Author pytest unit and integration tests in `backend/tests/`.
- Run pytest, observe output, fix any defects, and record results.

### Phase 7: Final College Deliverables
- Author comprehensive `HavenSec_Arena_Final_Report.md` following GTU Minor Project Report 2025 structure.
- Generate `evidence-register.md`, `viva-preparation.md` (25+ questions), and `test-results.md`.
- Generate `HavenSec_Arena_Final_Report.pdf` and `HavenSec_Arena_Final_Report.docx`.
- Update `README.md`, `docs/ARCHITECTURE.md`, `start.bat`, and `start.ps1`.
