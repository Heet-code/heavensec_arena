# HavenSec Arena

**An AI-Assisted Multi-Agent Cyber-Resilience Simulation Platform for Continuous Security Evaluation.**

[![Project Status: Complete](https://img.shields.io/badge/Project%20Status-Complete%20%26%20Verified-brightgreen)](https://github.com/Heet-code/heavensec_arena)
[![Academic Level: GTU Semester 5](https://img.shields.io/badge/Academic-GTU%20Semester%205%20Minor%20Project-blue)](https://gtu.ac.in)
[![Stack: Python/FastAPI + Vanilla JS](https://img.shields.io/badge/Stack-Python%20%7C%20FastAPI%20%7C%20Vanilla%20JS%20%7C%20SQLite-orange)](https://fastapi.tiangolo.com)

---

## Academic Identity & Project Context

- **Student:** Heet Kalthiya
- **Institution:** Tapi Diploma Engineering College
- **Department:** Information Technology
- **Academic Level:** Semester 5 — Minor Project
- **Course:** Diploma in Information Technology

---

## Executive Summary & Core Concept

**HavenSec Arena** is an isolated, deterministic-by-default cybersecurity simulation and resilience evaluation platform. It coordinates synthetic adversarial attacks, rule-based detection, incident correlation, automated containment playbooks, independent referee scoring, and adaptive coaching in a closed synthetic laboratory environment (**Acme Web Platform**).

### Core Operational Workflow
```
CONFIGURE → SIMULATE → OBSERVE → DETECT → INVESTIGATE → RESPOND → EVALUATE → LEARN → ADAPT → REPORT
```

**Safety Principle:** All offensive behaviors remain 100% synthetic, harmless, and bounded inside the simulated environment. No actual malware, external target exploitation, or disruptive actions are ever performed.

---

## Multi-Agent Architecture

```
                       ┌──────────────────────────────┐
                       │   Scenario Orchestrator      │
                       │   (Explicit Lifecycle Engine)│
                       └──────────────┬───────────────┘
                                      │
            ┌─────────────────────────┼─────────────────────────┐
            │                         │                         │
            ▼                         ▼                         ▼
┌───────────────────────┐ ┌───────────────────────┐ ┌───────────────────────┐
│     Red Team Agent    │ │   Blue Team Sentinel  │ │ Investigation Analyst │
│ (Adversarial Telemetry│ │(SIEM Detection Rules, │ │ (Incident Correlation │
│ & Ground-Truth Attack)│ │ Latency & Deduplicat.)│ │ & Evidence Graphing)  │
└───────────────────────┘ └───────────┬───────────┘ └───────────┬───────────┘
                                      │                         │
                                      ▼                         ▼
                          ┌───────────────────────┐ ┌───────────────────────┐
                          │   Response Commander  │ │  Independent Referee  │
                          │(Simulated Containment │ │ (Ground-Truth Auditing│
                          │ & IAM/Network Action) │ │ & Resilience Scoring) │
                          └───────────────────────┘ └───────────┬───────────┘
                                                                │
                                                                ▼
                                                    ┌───────────────────────┐
                                                    │     Security Coach    │
                                                    │(Gap Analysis & Select │
                                                    │ Next Adaptive Scenario│
                                                    └───────────────────────┘
```

### Agent Roles & Responsibilities
1. **Scenario Orchestrator / Manager:** Manages explicit lifecycle transitions (`CREATED` → `PREPARING` → `RUNNING` → `DETECTING` → `INVESTIGATING` → `RESPONDING` → `EVALUATING` → `COMPLETED`), assigns reproducibility seeds, and prevents concurrent runs.
2. **Red Team Agent:** Generates controlled synthetic telemetry aligned with MITRE ATT&CK techniques (Brute Force, API Parameter Tampering, Path Traversal, Lateral Movement, Ransomware Heuristics) and benign background traffic.
3. **Blue Team Sentinel:** Ingests live telemetry, applies detection rules (`RULE-AUTH-BRUTE`, `RULE-API-ABUSE`, `RULE-WEB-TRAVERSAL`, `RULE-LATERAL-MOVE`, `RULE-RANSOM-ACTIVITY`), suppresses duplicate alerts, and measures detection latency.
4. **Investigation Analyst:** Correlates alerts and telemetry into structured `Incident` entities, tracing affected assets and evidence indicators.
5. **Response Commander:** Dispatches simulated containment playbooks (`ACCOUNT_LOCKOUT_AND_IP_BLOCK`, `TOKEN_REVOCATION_AND_RATE_LIMIT`, `HOST_ISOLATION_AND_SNAPSHOT_VERIFY`, `APPLY_WAF_RULE`) within the synthetic environment.
6. **Independent Referee:** Audits exercise outcomes against pre-established ground-truth objectives. Generates independent Red Team, Blue Team, and Cyber-Resilience scores (0–100).
7. **Security Coach:** Evaluates metrics, identifies priority defensive bottlenecks (e.g. low recall, high latency, containment failure), provides evidence-linked recommendations, and selects the next adaptive exercise.

---

## Resilience Scoring Model

Scores range from 0 to 100 and distinguish three distinct concepts:

### 1. Red Team Effectiveness Score ($S_{\text{Red}}$)
$$S_{\text{Red}} = 0.50 \cdot \text{ObjectiveAchievementRate} + 0.30 \cdot \text{TargetAssetCoverage} + 0.20 \cdot \text{StealthIndex}$$
*Higher score means adversary achieved more objectives; does NOT indicate higher organization resilience.*

### 2. Blue Team Defensive Score ($S_{\text{Blue}}$)
$$S_{\text{Blue}} = 0.25 \cdot \text{Recall} + 0.20 \cdot \text{Precision} + 0.15 \cdot \text{LatencyScore} + 0.20 \cdot \text{InvestigationScore} + 0.20 \cdot \text{ContainmentRate}$$

### 3. Overall System Cyber-Resilience Score ($S_{\text{Resilience}}$)
$$S_{\text{Resilience}} = \max\left(0, \min\left(100, 0.35 \cdot C_s + 0.30 \cdot R_d + 0.20 \cdot I_q + 0.15 \cdot L_d - \text{Penalties}_{\text{uncontained}}\right)\right)$$
*Resilience is NOT an average of Red and Blue. It reflects empirical containment efficacy, threat visibility, and mitigation of residual impact.*

---

## Adaptive Scenario Engine

The platform implements an automated continuous improvement feedback loop:
1. Evaluates completed exercise metrics.
2. Identifies the primary defensive bottleneck using a deterministic priority ladder:
   - **Low Recall (< 75%)** → Recommends `scenario-suspicious-auth` with lowered failed-login threshold.
   - **Containment Failure (< 70%)** → Recommends `scenario-ransomware-controlled` for fast host isolation testing.
   - **Latency Lag (< 70%)** → Recommends `scenario-api-security` for immediate rate-limiting behavioral tripwires.
   - **Correlation Gap (< 75%)** → Recommends `scenario-credential-compromise` for cross-asset lateral movement tracking.
   - **High False Positives (< 70%)** → Recommends `scenario-web-misconfig` with background administrative noise.
   - **High Mastery across all areas (≥ 85%)** → Escalates challenge to Advanced difficulty.
3. Automatically links the follow-up exercise (`previousExerciseId`) to calculate before-and-after $\Delta$ Resilience and $\Delta$ Blue Team metrics.

---

## Approved Technology Stack

| Component | Technology | Rationale |
|---|---|---|
| **Backend API** | Python 3.11+, FastAPI | High performance asynchronous event loops, native typing, OpenAPI/Swagger docs. |
| **Frontend UI** | HTML5, CSS3, Vanilla JavaScript | Zero-build simplicity, lightweight footprint, robust browser compatibility, clean XSS-safe DOM handling. |
| **Database** | SQLite3 (Relational Schema) | Local persistence with foreign keys, indexes, and full auditability without external database server overhead. |
| **Container** | Docker & Docker Compose | Reproducible environment with isolated networking and Nginx reverse proxy. |
| **Test Suite** | pytest, pytest-asyncio, FastAPI TestClient | Automated regression testing with 100% assertion-based verification. |

---

## How to Run Locally

### Option A: Windows Quick Start (Command Prompt / PowerShell)
Double-click `start.bat` or run:
```powershell
.\start.ps1
```
- **Web UI:** [http://127.0.0.1:8080](http://127.0.0.1:8080)
- **FastAPI Documentation:** [http://127.0.0.1:9002/docs](http://127.0.0.1:9002/docs)

### Option B: Manual Execution
**Terminal 1 (Backend):**
```powershell
cd backend
python -m uvicorn api:app --host 127.0.0.1 --port 9002
```

**Terminal 2 (Frontend):**
```powershell
cd frontend
python -m http.server 8080
```

### Option C: Docker Compose
```bash
docker compose up --build
```
- Access the platform at [http://localhost](http://localhost) (proxied via Nginx to backend on port 8000).

---

## Running the Automated Test Suite

Run all automated unit and integration tests:
```powershell
$env:PYTHONPATH="backend"
python -m pytest backend/tests -v
```

---

## Deliverables & Documentation

- **Final College Report (Markdown):** `docs/final-report/HavenSec_Arena_Final_Report.md`
- **Submission Document (DOCX):** `docs/final-report/HavenSec_Arena_Final_Report.docx`
- **Submission Document (PDF):** `docs/final-report/HavenSec_Arena_Final_Report.pdf`
- **Evidence Register:** `docs/final-report/evidence-register.md`
- **Viva Preparation Guide (25+ Q&A):** `docs/final-report/viva-preparation.md`
- **Test Results Register:** `docs/final-report/test-results.md`
- **System Architecture:** `docs/ARCHITECTURE.md`
- **Implementation Decisions (ADRs):** `docs/DECISIONS.md`
- **Threat Model:** `docs/THREAT_MODEL.md`
