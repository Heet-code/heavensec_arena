# HavenSec Arena

**An AI-powered cyber-resilience simulation platform for continuous security improvement.**

[![IBM AI Builders Challenge](https://img.shields.io/badge/IBM%20AI%20Builders-Challenge%20Submission-blue)](https://ibm.com)

---

## The Problem

Organizations invest heavily in security controls, yet it can be difficult to continuously measure how effectively those controls and response workflows perform under realistic adversarial pressure. Traditional tabletop exercises are infrequent, manual, and hard to measure consistently.

**The gap:** Security teams lack a safe, repeatable, measurable environment to continuously test and improve their detection, investigation, response, and containment capabilities.

---

## The Solution: HavenSec Arena

HavenSec Arena creates **controlled cyber-resilience exercises** using coordinated AI agents operating inside a safe synthetic environment. Every exercise produces objective measurements, and an AI Security Coach uses those measurements to recommend the next exercise — creating a continuous improvement loop.

### Core Product Loop

```
SIMULATE → DETECT → INVESTIGATE → RESPOND → EVALUATE → LEARN → IMPROVE
```

---

## How It Works

### 1. Red Team Agent
Executes controlled adversarial simulations within a **fully synthetic environment**. Red Team agents simulate realistic attack patterns (authentication anomalies, API abuse, privilege escalation) without any real-world impact.

### 2. Blue Team Agents
A coordinated set of defenders:
- **Blue Team Sentinel** — detects anomalous patterns in the telemetry stream
- **Investigation Analyst** — correlates evidence and reconstructs the attack chain
- **Response Commander** — executes response playbooks and containment actions

### 3. AI Referee
The Referee observes the full exercise and evaluates performance across five dimensions:
- **Detection** — How quickly was the threat identified?
- **Investigation** — Was the full attack chain reconstructed?
- **Response** — Were appropriate response actions taken?
- **Containment** — Was the threat isolated effectively?
- **Recovery** — Was the environment restored?

### 4. Security Coach
The Coach receives the exercise results, historical performance, and identified weaknesses. It generates:
- Specific improvement recommendations with rationale
- A targeted next exercise designed to close identified gaps
- An adaptive loop that continuously improves defensive posture

### 5. Orchestrator
Coordinates all agents through the exercise lifecycle, managing explicit phase transitions: `CREATED → PREPARING → RUNNING → DETECTING → INVESTIGATING → RESPONDING → CONTAINING → EVALUATING → COMPLETED`

---

## Multi-Agent Architecture

```
Orchestrator
├── Red Team Alpha     (adversarial simulation)
├── Red Team Beta      (supporting simulations)
├── Blue Team Sentinel (anomaly detection)
├── Investigation Analyst (evidence correlation)
├── Response Commander (containment & response)
├── Referee            (objective evaluation)
└── Security Coach     (adaptive improvement)
```

All agents implement a clean `AgentService` abstraction. The `MockAIProvider` delivers deterministic demo behavior. Real AI providers (IBM watsonx, OpenAI, Google Gemini) can be connected by implementing the `AIProvider` interface without changing any application logic.

---

## Synthetic Environment

The demo runs against a fully synthetic representation of **Acme Digital's web platform**:

| Asset | Type | IP |
|-------|------|----|
| WEB-01 | Web Server | 10.0.1.10 |
| API-01 | REST API | 10.0.1.20 |
| AUTH-01 | Auth Service | 10.0.2.10 |
| DB-01 | Database | 10.0.3.10 |
| FILE-01 | File Server | 10.0.3.20 |

All Red Team actions remain confined to this synthetic environment. **No real systems are ever targeted.**

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, React Router v6, Tailwind CSS |
| UI Components | Radix UI primitives, class-variance-authority, tailwind-merge |
| Charts | Recharts |
| Icons | Lucide React |
| Backend | Node.js, Express, TypeScript |
| Data | In-memory seed data (PostgreSQL-ready architecture) |
| AI | MockAIProvider (IBM watsonx / OpenAI interfaces ready) |
| Build | npm workspaces monorepo |

---

## How IBM Bob Was Used

IBM Bob was used as the primary AI engineering assistant throughout this project:

- **Architecture design** — Defining the multi-agent system, service layer, and type contracts
- **Full-stack implementation** — Building the complete React frontend, Express backend, and simulation engine
- **Type system design** — Shared TypeScript interfaces between agents, exercises, telemetry, and scoring
- **Deterministic simulation engine** — Designing the timed event sequence that drives the live demo
- **UI/UX design** — Professional enterprise design system with light theme, responsive layout, and micro-interactions
- **Demo data** — Realistic synthetic telemetry, incidents, scores, and coach recommendations

---

## How to Run Locally

### Prerequisites

- Node.js 18+
- npm 9+

### Setup

```bash
# Clone the repository
git clone <repo-url>
cd heavensec_arena

# Install all dependencies (npm workspaces — installs everything from root)
npm install

# Copy environment variables
cp .env.example server/.env
```

### Quick Start (Windows)

```
start.bat
```

Or with PowerShell:

```powershell
.\start.ps1
```

### Manual Start

```bash
# Terminal 1 — Backend API
node node_modules/.bin/ts-node-dev --respawn --transpile-only server/src/index.ts

# Terminal 2 — Frontend
node node_modules/.bin/vite --config client/vite.config.ts
```

The app will be available at:
- **Frontend**: http://localhost:5174
- **Backend API**: http://localhost:3001
- **Health check**: http://localhost:3001/health

### Production Build

```bash
# Build client
node node_modules/.bin/vite build --config client/vite.config.ts
```

---

## Environment Variables

Copy `.env.example` to `server/.env`. All variables are optional for the demo — the `MockAIProvider` is used when no API keys are configured.

```env
PORT=3001
NODE_ENV=development

# Optional: Real AI providers
WATSONX_API_KEY=
WATSONX_PROJECT_ID=
OPENAI_API_KEY=

# Optional: PostgreSQL
DATABASE_URL=

# CORS
CORS_ORIGIN=http://localhost:5174
```

---

## Demo Workflow

**The judge demo flow (under 2 minutes):**

1. **Overview** — See resilience score 78/100, recent exercise history, AI recommendation
2. **Start New Exercise** → **Arena Setup** → Select **AI Auto** tab
3. See AI-generated scenario with reasoning based on previous exercise weaknesses
4. Click **Accept & Start Simulation**
5. **Live Arena** — Watch Red Team and Blue Team agents operate in real-time
6. See telemetry events stream in at the bottom
7. Watch the attack graph update as assets are affected and contained
8. After 30 seconds, see the Referee score and Security Coach recommendation
9. Click **View Coach Recommendations** — see targeted improvement guidance
10. Click **Start Next Exercise** — see adaptive scenario designed to close the gap

---

## Safety Model

HavenSec Arena is a **controlled cyber-resilience simulator**. All adversarial activity is simulated within the synthetic environment. The platform does not:

- Execute real network attacks
- Access external systems
- Generate malware or exploits
- Perform unauthorized scanning
- Expose credentials or sensitive data

All Red Team behavior is modeled as timed simulation events within the in-memory synthetic environment.

---

## Future Roadmap

| Feature | Priority |
|---------|----------|
| Real-world target modeling (authorized research only) | High |
| MITRE ATT&CK technique mapping | High |
| IBM watsonx / OpenAI integration | High |
| PostgreSQL persistence | Medium |
| WebSocket real-time events | Medium |
| OWASP knowledge integration | Medium |
| Threat intelligence feeds | Medium |
| Organization / team multi-tenancy | Low |
| Dockerized sandbox environments | Low |
| SIEM integration | Low |

---

## Project Structure

```
havensec-arena/
├── client/                 # React frontend (Vite + TypeScript)
│   └── src/
│       ├── components/     # Reusable UI components
│       ├── contexts/       # ArenaContext (global state)
│       ├── data/           # Client-side mock data
│       ├── lib/            # API client
│       ├── pages/          # Route pages
│       ├── styles/         # Global CSS design system
│       └── types/          # TypeScript interfaces
├── server/                 # Express backend (TypeScript)
│   └── src/
│       ├── data/           # Seed data + in-memory stores
│       ├── routes/         # Express API routes
│       ├── services/       # Service layer
│       ├── simulation/     # Deterministic simulation engine
│       └── types/          # Shared TypeScript types
├── .env.example            # Environment variable template
└── README.md
```

---

*Built for the IBM AI Builders Challenge · HavenSec Arena v1.0*
