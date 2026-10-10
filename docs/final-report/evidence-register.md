# Evidence Register

| Objective | Implementation Evidence | Test Evidence | Result |
|---|---|---|---|
| Safe synthetic simulation | `backend/simulation.py` (RedTeamAgent) | `test_engine.py` generates 7 mock events | Verified |
| Blue Team detection | `BlueTeamSentinel` class logic | `test_engine.py` | Verified |
| Investigation and response | `InvestigationAnalyst`, `ResponseCommander` | `test_engine.py` yields 1 resolved Incident | Verified |
| Objective scoring | `simulation.py` end-of-loop calculation | Score JSON returned from API | Verified |
| Persistence | `backend/database.py` (SQLite wrapper) | State persists in `database.sqlite` | Verified |
| Technology Stack Compliance | Vanilla HTML/CSS/JS in `frontend/`, FastAPI in `backend/` | Docker Compose builds without Node.js | Verified |
