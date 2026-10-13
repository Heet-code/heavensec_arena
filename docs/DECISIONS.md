# HavenSec Arena — Architectural Decision Records (ADRs)

## ADR 1: Migration to Python/FastAPI Backend and Vanilla JS Frontend
- **Context:** The original workspace contained an incomplete mix of TypeScript/Express and Vite/React with conflicting runtimes and mock simulation data.
- **Decision:** Consolidate active execution to Python 3.11+ / FastAPI for the backend and HTML5 / CSS3 / Vanilla JavaScript for the frontend.
- **Consequences:** Eliminates Node.js build complexity, provides asynchronous event loops via `asyncio`, enables clean typing with Pydantic, and ensures the UI runs without external bundlers.

## ADR 2: Relational SQLite Schema vs. Key-Value Store
- **Context:** An initial prototype used a single `store` table storing JSON blobs.
- **Decision:** Migrate to a structured relational schema with dedicated tables (`exercises`, `scenarios`, `telemetry`, `alerts`, `incidents`, `response_actions`, `evaluations`, `coach_recommendations`), foreign keys, and indexes.
- **Consequences:** Provides queryability, integrity constraints, and reliable persistent history for cross-run adaptive comparisons.

## ADR 3: Independent Referee Agent for Tripartite Scoring
- **Context:** Simulations previously returned hardcoded static scores (e.g. 85%).
- **Decision:** Implement an independent `RefereeAgent` that evaluates outcomes against a ground-truth manifest established before simulation execution. Produce distinct Red Team (0–100), Blue Team (0–100), and Cyber-Resilience (0–100) scores.
- **Consequences:** Red Team score reflects adversarial completion; Blue Team score reflects detection and containment; Resilience score reflects defensive mitigation and residual risk. Resilience is explicitly NOT an average of Red and Blue.

## ADR 4: Deterministic Policy-Based Security Coach
- **Context:** External LLM APIs introduce non-deterministic failures, latency, and require external API keys.
- **Decision:** Implement a deterministic baseline adaptation engine using an empirical priority ladder, with clean interface hooks for optional external LLMs.
- **Consequences:** Fully reproducible, verifiable offline, and guaranteed to produce evidence-linked recommendations and targeted follow-up scenarios.
