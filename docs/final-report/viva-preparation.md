# HavenSec Arena — External Viva Voce Preparation Guide
**Comprehensive Technical Questions & Detailed Model Answers**

**Student:** Heet Kalthiya  
**Institute:** Tapi Diploma Engineering College  
**Department:** Information Technology (Semester 5 — Minor Project)  
**Project:** HavenSec Arena: AI-Powered Multi-Agent Cybersecurity Simulation Platform  

---

### Q1. What is HavenSec Arena and what core problem does it solve?
**Answer:** HavenSec Arena is a safe, deterministic, multi-agent cyber-resilience simulation and evaluation platform. Traditional enterprise security relies heavily on static tabletop exercises that are manual, infrequent, and lack quantitative measurement. HavenSec Arena solves this by establishing an automated continuous loop: simulating synthetic adversarial actions, observing telemetry, detecting threats, correlating incidents, executing automated containment, independently evaluating outcomes against ground truth, and adaptively recommending targeted follow-up scenarios.

---

### Q2. What is the mandatory technology stack and why was it chosen?
**Answer:**
- **Backend:** Python 3.11+ with FastAPI. Chosen for high-performance asynchronous event loops (`asyncio`), strong typing via Pydantic, and automatic OpenAPI documentation.
- **Frontend:** HTML5, CSS3, and Vanilla JavaScript. Chosen for lightweight footprint, zero compilation/bundling overhead, high maintainability, and clean DOM manipulation without heavy external dependencies.
- **Persistence:** SQLite3. Chosen for structured relational modeling with foreign keys, indexes, and zero-configuration file storage.
- **Containerization:** Docker & Docker Compose with Nginx reverse proxy.

---

### Q3. Why did you not use React or Node.js in the active implementation?
**Answer:** Early iterations explored Node.js/Express and React, but introduced build pipeline friction, conflicting runtimes, and mock data. To ensure academic rigor and long-term maintainability, the project consolidated to a native Python/FastAPI asynchronous state machine and clean Vanilla JavaScript, fulfilling the strict departmental architecture mandate.

---

### Q4. Describe the multi-agent architecture and the distinct role of each agent.
**Answer:**
1. **Scenario Orchestrator:** Manages the simulation state machine (`CREATED` → `PREPARING` → `RUNNING` → `DETECTING` → `INVESTIGATING` → `RESPONDING` → `EVALUATING` → `COMPLETED`) and reproducibility seeds.
2. **Red Team Agent:** Synthesizes attack vectors (credential stuffing, API tampering, path traversal, lateral movement, ransomware heuristics) and background traffic.
3. **Blue Team Sentinel:** Ingests telemetry, executes SIEM correlation rules, suppresses duplicate alerts, and records detection latency.
4. **Investigation Analyst:** Correlates alerts into structured `Incident` records, tracing affected assets and evidence indicators.
5. **Response Commander:** Executes bounded containment playbooks (account lockout, API key revocation, host network isolation) inside the synthetic lab.
6. **Independent Referee:** Audits exercise artifacts against pre-established ground truth to calculate objective Red, Blue, and Resilience scores.
7. **Security Coach:** Evaluates metric bottlenecks, provides actionable guidance, and adaptively selects follow-up exercises.

---

### Q5. How do you ensure safety? Could this tool be used to launch real attacks?
**Answer:** No. HavenSec Arena is strictly confined to synthetic laboratory simulation. It contains no exploit payloads, network scanners, or real malware binaries. All telemetry is emitted with dummy metadata targeting simulated assets (`WEB-01`, `API-01`, `AUTH-01`, `DB-01`, `FILE-01`). For example, in the ransomware scenario, the agent simulates file enumeration and high-entropy metadata without modifying or encrypting real host files.

---

### Q6. Why are the Red Team and Blue Team performance scores separated?
**Answer:** Because they measure opposing objectives. The Red Team score measures adversarial completion rate, target asset coverage, and stealth. The Blue Team score measures defensive recall, precision, latency, investigation completeness, and containment efficacy. If an adversary achieves all objectives quickly, the Red Team score is 95% while the Blue Team score might be 20%. Combining them would produce an ambiguous number that obscures whether the defense or adversary succeeded.

---

### Q7. Why is the Overall Cyber-Resilience score NOT the average of Red Team and Blue Team scores?
**Answer:** Averaging Red and Blue scores is fundamentally flawed: a high Red Team score indicates severe adversarial penetration, not higher organizational resilience! Overall Cyber-Resilience measures the organization's ability to resist, withstand, contain, and recover from the simulated threat. It is derived from defensive containment success (35%), threat recall (30%), investigation quality (20%), and response swiftness (15%), minus severe deductions for uncontained residual risk.

---

### Q8. What is the exact mathematical formula for the Red Team score?
**Answer:**
$$S_{\text{Red}} = 0.50 \cdot \left(\frac{\text{Achieved Objectives}}{\text{Total Ground-Truth Objectives}} \cdot 100\right) + 0.30 \cdot \left(\frac{\text{Touched Assets}}{\text{Target Assets}} \cdot 100\right) + 0.20 \cdot \text{StealthIndex}$$
Where the Stealth Index rewards the adversary if their techniques remained unalerted by the defensive SIEM rules.

---

### Q9. What is the mathematical formula for the Blue Team score?
**Answer:**
$$S_{\text{Blue}} = 0.25 \cdot \text{Recall} + 0.20 \cdot \text{Precision} + 0.15 \cdot \text{LatencyScore} + 0.20 \cdot \text{InvestigationScore} + 0.20 \cdot \text{ContainmentRate}$$
All metrics are normalized to a 0–100 scale. If no false positives or true positives exist, the system applies defined boundary policies to avoid division by zero.

---

### Q10. What is the formula for the Overall Cyber-Resilience score?
**Answer:**
$$S_{\text{Resilience}} = \max\left(0, \min\left(100, 0.35 \cdot C_s + 0.30 \cdot R_d + 0.20 \cdot I_q + 0.15 \cdot L_d - \text{Penalties}_{\text{uncontained}}\right)\right)$$
Where $C_s$ is containment success rate, $R_d$ is detection recall, $I_q$ is investigation quality, and $L_d$ is latency swiftness. If an incident remains uncontained, a penalty of 20 points per uncontained incident is subtracted.

---

### Q11. How does the Independent Referee evaluate outcomes against ground truth?
**Answer:** Before the exercise begins, the selected scenario defines an immutable list of ground-truth objectives (e.g. `gt-auth-01`: Reconnaissance, `gt-auth-02`: High-Volume Failed Logins, `gt-auth-03`: Session Hijack). When evaluating, the Referee independently inspects the database telemetry, alerts, incidents, and responses to verify which ground-truth objectives were achieved and which were detected. It does not trust self-reported agent claims.

---

### Q12. How does the Blue Team Sentinel handle duplicate alerts?
**Answer:** The Sentinel maintains a set of triggered rule IDs (`triggered_rules`). Once a rule (e.g., `RULE-AUTH-BRUTE`) triggers on an asset, repeated events within that attack sequence do not flood the SIEM with redundant alert objects. Instead, the alert's evidence list is enriched, avoiding alert fatigue.

---

### Q13. How is detection latency calculated?
**Answer:** Detection latency is calculated as the elapsed time between the start of the exercise (`startedAt`) and the timestamp of the very first generated alert (`first_detection_ts`):
$$\Delta t = t_{\text{alert}} - t_{\text{start}}$$
If $\Delta t \le 3.0\text{s}$, the blue team receives a swiftness bonus (+5 points). If it exceeds 3.0s, a deduction of 5 points per second delay is assessed.

---

### Q14. How does the Security Coach identify the primary defensive weakness?
**Answer:** The Coach evaluates a deterministic priority ladder:
1. **Recall < 75%** → Flags Detection Recall Deficit.
2. **Containment < 70%** → Flags Containment Execution Failure.
3. **Latency < 70%** → Flags Detection Latency Lag.
4. **Investigation < 75%** → Flags Cross-Asset Correlation Gap.
5. **Precision < 70%** → Flags Alert Noise / High False Positive Rate.
6. **All ≥ 85%** → Flags Baseline Posture Verified (escalates to Advanced difficulty).

---

### Q15. How does the adaptive scenario selection work?
**Answer:** Based on the identified weakness, the Coach maps the gap to an appropriate follow-up scenario:
- Low Recall → Recommends `scenario-suspicious-auth` with lowered failed login thresholds.
- Containment Failure → Recommends `scenario-ransomware-controlled` for fast endpoint isolation.
- Latency Lag → Recommends `scenario-api-security` for rate-limiting tripwires.
- Correlation Gap → Recommends `scenario-credential-compromise` for multi-asset lateral tracking.
- High False Positives → Recommends `scenario-web-misconfig` with background administrative noise.
- Baseline Mastered → Escalates challenge to Advanced difficulty.

---

### Q16. How does the platform prove that defensive resilience actually improved?
**Answer:** When launching an adaptive scenario, the new exercise records `previousExerciseId`. Upon completion, the `CoachEngine.compare_exercises()` endpoint calculates:
$$\Delta S_{\text{Resilience}} = S_{\text{Resilience, current}} - S_{\text{Resilience, previous}}$$
$$\Delta S_{\text{Blue}} = S_{\text{Blue, current}} - S_{\text{Blue, previous}}$$
A positive delta provides verifiable empirical proof that tuning defensive rules successfully improved cyber-resilience.

---

### Q17. What scenarios are implemented in the Scenario Library?
**Answer:** Six scenarios mapped to MITRE ATT&CK:
1. `scenario-suspicious-auth` (Brute Force, Credential Access)
2. `scenario-api-security` (API Abuse, Parameter Tampering, Data Exfiltration)
3. `scenario-web-misconfig` (Path Traversal, Information Disclosure)
4. `scenario-credential-compromise` (Pass-the-Hash, Lateral Movement, Privileged Dump)
5. `scenario-privilege-escalation` (Token Manipulation, Role Elevation)
6. `scenario-ransomware-controlled` (Mass File Enumeration, Encryption Intent Heuristics)

---

### Q18. How is persistence handled in the backend?
**Answer:** Using a structured SQLite3 database (`database.sqlite`) with foreign keys and cascade deletion. Tables include: `scenarios`, `exercises`, `telemetry`, `alerts`, `incidents`, `response_actions`, `evaluations`, and `coach_recommendations`. Transactions are managed with parameterized SQL to prevent SQL injection.

---

### Q19. How does the frontend communicate with the backend?
**Answer:** The frontend uses asynchronous JavaScript `fetch()` calls. It implements candidate API auto-discovery across common local and container ports (`/api`, `http://127.0.0.1:8000/api`, `http://127.0.0.1:9002/api`). During active exercises, it polls every 1000ms to stream telemetry, incidents, and phase updates.

---

### Q20. How does the frontend prevent Cross-Site Scripting (XSS)?
**Answer:** All incoming strings from telemetry, actors, and payloads pass through a dedicated `escapeHtml()` function that sanitizes characters (`&`, `<`, `>`, `"`, `'`) before being rendered into the DOM.

---

### Q21. How are exercises made reproducible?
**Answer:** Every exercise accepts a `seed` parameter (default 42). The `RedTeamAgent` initializes Python's `random.Random(seed)` with this value, ensuring identical timing, event parameters, and benign noise across identical runs.

---

### Q22. What happens if a simulation is cancelled or fails?
**Answer:** The Orchestrator registers active tasks in `active_simulation_tasks`. Calling `/api/exercises/{id}/cancel` invokes `task.cancel()`, terminates the coroutine cleanly, updates the exercise status to `cancelled`, and records the timestamp in SQLite.

---

### Q23. What edge cases are handled in the scoring module?
**Answer:**
1. Zero telemetry events: Returns 0.0 scores with an explicit limitation warning without division by zero.
2. Zero alerts: Correctly scores precision as 0.0 (if threats existed) and latency as 0.0.
3. Zero ground-truth objectives: Avoids dividing by zero by setting denominator to 1 with an audit warning.
4. Uncontained incidents: Deducts 20 points per uncontained incident to prevent overscoring failed defenses.

---

### Q24. How was the platform tested?
**Answer:** Using an automated pytest suite in `backend/tests/`:
- `test_scoring.py`: Mathematical models and zero-division edge cases.
- `test_agents.py`: Red team event generation, Blue detection, incident correlation, and response dispatch.
- `test_coach.py`: Weakness identification and cross-run delta calculations.
- `test_engine.py`: Fast simulation loop and SQLite persistence.
- `test_api.py`: FastAPI TestClient integration across all endpoints.
All 13 tests pass with 100% success rate in under 1 second.

---

### Q25. What are the key limitations and future scope of the project?
**Answer:**
- **Current Limitations:** Simulation executes in an in-memory/SQLite model rather than real virtualized operating system hypervisors; coaching relies on deterministic heuristics rather than live external LLMs.
- **Future Scope:** Integrating optional cloud LLM providers (e.g. OpenAI or IBM watsonx) via the extensible `CoachEngine` interface; adding automated network packet pcap generation; and expanding scenario definitions to include cloud infrastructure (AWS/GCP IAM) simulations.
