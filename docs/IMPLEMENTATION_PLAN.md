# HavenSec Arena - Implementation Plan

## Phase 1: Baseline Verification (Completed)
- [x] Inspected workspace
- [x] Fixed module resolution bug preventing backend startup (stripped `.js` extensions)
- [x] Verified frontend runs and connects to `http://localhost:3001`
- [x] Ran health checks

## Phase 2: Refactoring State & Architecture
- [x] Replaced in-memory Map arrays with persistent SQLite store using `better-sqlite3`.
- [x] Updated mock data seeding logic to use the new `PersistentMap` wrapper.

## Phase 3 & 4: Deterministic Engine & AI Agents
- [x] Refactored `server/src/simulation/engine.ts` into a true reactive event bus.
- [x] Created `RedTeamAgent` which reads the scenario and emits telemetry based on ticks.
- [x] Created `BlueTeamSentinel` which reads telemetry and emits alerts.
- [x] Created `InvestigationAnalyst` which correlates alerts into Incidents.
- [x] Created `ResponseCommander` which applies containment actions to Active Incidents.
- [x] Created `Referee` logic within the engine to generate scores based on response time.
- [x] Add unit tests for all Agent classes using Vitest.

## Phase 5: AI Integration (Optional)
- [ ] Wire IBM Watonx / OpenAI SDK to optionally generate new scenarios or coach recommendations.
- [ ] Ensure the core engine continues to operate entirely deterministically when API keys are missing.
