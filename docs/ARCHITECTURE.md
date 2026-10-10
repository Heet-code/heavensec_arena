# HavenSec Arena - System Architecture

## Overview
HavenSec Arena is an AI-assisted multi-agent cybersecurity simulation platform that models an enterprise IT environment and executes synthetic adversarial attacks, detected and mitigated by an automated blue team.

## Architecture

### Frontend (React + Vite)
- Built with React, TypeScript, and Vite.
- Uses Radix UI, Tailwind CSS, and Framer Motion for animations.
- The Live Arena view (`LiveArena.tsx`) dynamically renders simulated state by polling the backend `/api/exercises/:id` endpoints.
- Has a `localSimulation.ts` fallback, but is designed to interact with a true stateful backend.

### Backend (Node.js + Express)
- Handles the core simulation loop, orchestrates agents, and stores history.
- Exposes REST endpoints under `/api`.

### Storage (SQLite)
- Uses `better-sqlite3` to persist the state in a local file (`database.sqlite`).
- State is modeled using the `PersistentMap` wrapper which mirrors standard ES6 `Map` operations while maintaining data integrity across restarts.
- Data stored includes: Exercises, Telemetry, Incidents, Coach Recommendations, Replay Data, Agents.

### Simulation Engine (`engine.ts` & `agents.ts`)
- **Engine Loop:** Ticks every second, advancing the global exercise timeline across its phases (`preparing` -> `running` -> `detecting` -> `investigating` -> `responding` -> `containing` -> `evaluating` -> `completed`).
- **Red Team Agent:** Synthesizes attack traffic (e.g. `HTTP_REQUEST`, `LOGIN_FAILED`, `API_ANOMALY`) according to the active scenario steps.
- **Blue Team Sentinel:** Analyzes the telemetry stream to identify patterns (e.g. 3 consecutive failed logins) and generates `ALERT_CREATED` events.
- **Investigation Analyst:** Correlates alerts and anomalies to produce structured `Incident` records linking multiple compromised assets.
- **Response Commander:** Recommends and executes `CONTAINMENT_ACTION` to isolate endpoints and stop data exfiltration.
- **Referee:** Generates performance metrics based on the Blue Team's detection and containment times.
- **Security Coach:** Synthesizes post-action reviews and selects the next relevant exercise to address weaknesses.

## Data Flow
1. User clicks **Start Simulation**.
2. Frontend `POST /api/exercises/:id/start`.
3. Backend starts the `engine` loop.
4. Red Team emits events -> Persisted to SQLite.
5. Blue Team agents read events, emit alerts/incidents -> Persisted to SQLite.
6. Frontend polling `GET /api/exercises/:id/telemetry` reads the evolving situation and updates the UI stream.
