# Viva Preparation Guide

**1. 60-Second Introduction**
"Good morning. My project is HavenSec Arena, a safe, multi-agent cybersecurity simulation platform. It models how cyber-attacks happen and how defensive teams respond. I built it using a Python FastAPI backend and a Vanilla HTML/JS frontend. It uses autonomous agents to simulate Red Team attacks, Blue Team detection, and automated containment, all evaluated by an objective Referee."

**2. Why Python/FastAPI instead of Node.js?**
"FastAPI uses Pydantic which provides strict data validation, essential for modeling complex security telemetry. It also has built-in support for asynchronous loops (`asyncio`), which is perfect for running the continuous simulation engine."

**3. Are these real attacks?**
"No. This is a strictly academic cyber-range. The 'attacks' are synthetic telemetry records inserted into an SQLite database. No actual network exploits or malware are executed."

**4. How does the Scoring work?**
"The Referee calculates latency between the first Red Team event and the Blue Team's detection, and the time taken for the Response Commander to contain the incident."

**5. How are the agents implemented?**
"Each agent is a Python class (e.g., `RedTeamAgent`, `BlueTeamSentinel`). During the `simulation_loop`, each agent receives the elapsed simulation time and the current event stream, analyzes it, and returns new events or actions deterministically."

**6. Why use Vanilla JS instead of React?**
"To maintain a lightweight footprint, minimize dependencies, and demonstrate core DOM manipulation skills without the overhead of a heavy frontend build step."
