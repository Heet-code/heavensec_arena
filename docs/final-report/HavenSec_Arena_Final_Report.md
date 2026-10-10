---
title: "HavenSec Arena: AI-Powered Multi-Agent Red Team and Blue Team Cybersecurity Simulation Platform"
author: "Heet Kalthiya"
institution: "Tapi Diploma Engineering College"
programme: "Diploma in Information Technology"
semester: 5
---

# Front Matter

**Certificate**
This is to certify that the project entitled "HavenSec Arena" has been successfully completed by Heet Kalthiya in partial fulfillment of the Diploma in Information Technology at Tapi Diploma Engineering College.

**Abstract**
HavenSec Arena is a safe, isolated, multi-agent cyber-resilience simulation platform designed to orchestrate and evaluate synthetic adversarial attacks and defensive responses. Built on a Python/FastAPI backend and a Vanilla HTML/JS frontend, the project implements a deterministic event-driven state machine. It features automated Red Team (attack synthesis), Blue Team (alert detection), Investigation Analyst (incident correlation), and Response Commander (containment execution) agents. The platform successfully demonstrates the end-to-end lifecycle of a simulated cyber-incident, culminating in objective performance scoring evaluated by an independent Referee agent. 

---

# Chapter 1 — Introduction
**1.1 Project Background**
Modern enterprise networks require continuous evaluation of their cyber-resilience. HavenSec Arena provides a simulated environment to test detection and response workflows.

**1.2 Aim and Objectives**
The aim is to build a functional, multi-agent cybersecurity simulation.
Objectives:
1. Orchestrate synthetic telemetry.
2. Automate detection via Blue Team logic.
3. Automatically correlate and contain threats.
4. Calculate response latency and performance metrics.

---

# Chapter 2 — Literature Survey and Existing Systems
Existing systems like MITRE CALDERA and Atomic Red Team are designed for live networks and require significant configuration. HavenSec Arena differentiates itself by offering a fully contained, academic simulation range that does not execute live malware, making it inherently safe for educational demonstration while still modeling complex event correlation.

---

# Chapter 3 — Alternative Solutions and Solution Selection
**Solution Selection:**
- **Frontend:** HTML5, CSS3, Vanilla JS (No frameworks to ensure lightweight, transparent DOM manipulation).
- **Backend:** Python and FastAPI (Selected for strong typing via Pydantic and async capabilities suitable for state machines).
- **Storage:** SQLite (Chosen over in-memory arrays for persistent historical simulation data).
- **Isolation:** Docker & Docker Compose (To bundle and isolate the simulation).

---

# Chapter 4 — System Design and Development Methodology
**4.1 Proposed System Architecture**
The architecture is client-server based. The frontend polls the FastAPI backend. The backend manages the simulation loop using `asyncio` and SQLite for persistence.

**4.7 System Modules**
- **Simulation Engine:** Ticks through preparation, running, detecting, investigating, and responding phases.
- **Red Team Agent:** Emits synthetic `LOGIN_FAILED` and `HTTP_REQUEST` events.
- **Blue Team Sentinel:** Analyzes streams and flags `ALERT_CREATED`.
- **Investigation Analyst:** Groups alerts into `Incident` objects.
- **Response Commander:** Recommends and applies `CONTAINMENT_ACTION`.

---

# Chapter 5 — Budget and Feasibility Analysis
**Software Cost:** Free/Open Source (Python, FastAPI, SQLite, Docker).
**Hardware:** Standard developer laptop.
**Feasibility:** Highly feasible due to the exclusion of real malware execution.

---

# Chapter 6 — Project Implementation and Development
**6.1 Development Environment**
Python 3.11, FastAPI, SQLite, Vanilla HTML/JS.

**6.2 Backend Implementation**
The backend `simulation.py` contains the class-based agents. The loop runs asynchronously:
```python
red_events = red.tick(phase_time * 1000, exercise_id, phase, get_ts)
sentinel_events = sentinel.analyze(red_events, exercise_id, phase, get_ts)
```

**6.3 Frontend Implementation**
The UI leverages grid layouts to display the Red Team Log, Telemetry Stream, and Blue Team Log side-by-side, updating dynamically via `fetch()` polling.

---

# Chapter 7 — Testing, Results, and Modifications
**7.1 Integration Testing**
Tested via `test_engine.py` which executes a full 15-second simulation loop and asserts the creation of telemetry and incidents in SQLite.

| Test Case | Expected Result | Actual Result | Status |
|---|---|---|---|
| Red Team Generation | 7 Telemetry events emitted | 7 Events emitted | Pass |
| Blue Team Alert | 3 failed logins trigger Alert | Alert triggered | Pass |
| Correlation | Alert generates 1 Incident | 1 Incident created | Pass |

**7.2 Modifications Made**
The legacy Node.js/Express implementation was completely discarded in favor of a strictly typed Python FastAPI engine to meet the mandatory architectural guidelines.

---

# Chapter 8 — Final Outcome, Conclusion, and Future Scope
The project successfully meets all requirements. It is a completely safe, deterministic cyber-range. Future scope involves replacing the deterministic coaching logic with a real LLM provider (e.g. OpenAI or IBM Watsonx) when appropriate API keys are available in production.

---

# Chapter 9 — Individual Contribution and Learning
Heet Kalthiya was responsible for the entire full-stack implementation, including migrating the backend from Node.js to Python, modeling the database, orchestrating the asyncio state machine, and designing the CSS grids.

---
# References
1. FastAPI Documentation (https://fastapi.tiangolo.com)
2. Python Asyncio Library
3. MITRE ATT&CK Framework Concepts
