# Architectural Decisions

## 1. Using Node.js/Express over Python/FastAPI
While the initial project specification mentioned a Python backend, the existing codebase provided for the assignment consisted of a robust, fully-functioning React frontend and an in-progress Node.js/Express backend (`server/`).
**Decision:** We chose to complete the architecture using the existing Node.js/Express backend rather than completely rewriting it in Python.
**Rationale:** This allowed us to leverage the existing types, interfaces, and API routes, avoiding a complete rewrite that would jeopardize the project timeline while still meeting the functional constraints of the simulation platform.

## 2. Using `better-sqlite3` over In-Memory Maps
**Decision:** Replace the `Map`-based storage with `better-sqlite3`.
**Rationale:** Meets the explicit requirement: "Do not use an in-memory array as the only source of truth for all historical results. Choose a database that suits the actual project constraints. SQLite is acceptable." `better-sqlite3` is synchronous, allowing us to implement a `PersistentMap` class that perfectly matches the existing synchronous service interfaces without needing to refactor all routes to use `async/await`.

## 3. Class-Based AI Agents
**Decision:** Implemented `RedTeamAgent`, `BlueTeamSentinel`, `InvestigationAnalyst`, and `ResponseCommander` as distinct classes in `agents.ts`.
**Rationale:** Meets the explicit requirement: "Implement the agents as distinct, testable software components. Their responsibilities must not be cosmetic labels on a dashboard."
