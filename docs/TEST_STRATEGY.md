# HavenSec Arena — Test Strategy

## 1. Objectives & Scope
The test strategy guarantees that every simulation component, scoring calculation, agent behavior, and API contract is verified using automated pytest assertions.

## 2. Test Levels

### 2.1 Unit Testing
- **Referee Scoring (`backend/tests/test_scoring.py`):**
  - Edge cases: Empty events, zero ground-truth objectives, zero alerts.
  - Safeguards against division by zero.
  - Full mitigation scenarios (high resilience) vs. uncontained attacks (low resilience).
  - Validation that Cyber-Resilience score is not simply the average of Red and Blue scores.
- **Agent Behaviors (`backend/tests/test_agents.py`):**
  - Red Team synthetic telemetry generation across multiple scenarios and difficulties.
  - Blue Team Sentinel detection rule evaluations, duplicate alert suppression, and latency recording.
  - Investigation Analyst incident correlation and evidence linking.
  - Response Commander playbook execution and incident state transitions (`contained`).
- **Security Coach Adaptation (`backend/tests/test_coach.py`):**
  - Identification of priority defensive bottlenecks (recall, latency, containment, correlation, precision, baseline mastery).
  - Accurate calculation of before-and-after $\Delta$ Resilience and $\Delta$ Blue scores.

### 2.2 Integration Testing
- **Simulation Engine Loop (`backend/tests/test_engine.py`):**
  - State machine transitions (`CREATED` -> `PREPARING` -> `RUNNING` -> `DETECTING` -> `INVESTIGATING` -> `RESPONDING` -> `EVALUATING` -> `COMPLETED`).
  - Fast execution mode without timing delays.
  - SQLite persistence verification for all generated artifacts.
- **REST API Endpoints (`backend/tests/test_api.py`):**
  - Verification of health check, scenario listing, exercise creation, start, cancel, telemetry retrieval, evaluations, and coach recommendations using FastAPI TestClient.

## 3. Execution Command
```powershell
$env:PYTHONPATH="backend"
python -m pytest backend/tests -v
```
