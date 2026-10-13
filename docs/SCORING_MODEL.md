# HAVENSEC ARENA — RESILIENCE SCORING MODEL SPECIFICATION

**Author:** Heet Kalthiya  
**Project:** HavenSec Arena — AI-Assisted Multi-Agent Cyber-Resilience Simulation Platform  
**Institution:** Tapi Diploma Engineering College, Semester 5 Minor Project  
**Document Version:** 2.0 (Authoritative)  

---

## 1. Executive Scoring Principle

A core principle of HavenSec Arena is that **Cyber-Resilience is NOT an arithmetic average of Red Team and Blue Team scores**:

$$\text{Resilience} \neq \frac{\text{Red Team Score} + \text{Blue Team Score}}{2}$$

In a realistic operational environment, if an attacker executes deep credential harvesting and data exfiltration while defensive responses are delayed or non-existent, the enterprise cyber-resilience is catastrophic (approaching $0$), regardless of whether the attacker was skilled or clumsy.

Conversely, if an aggressive adversary attempts multiple advanced exploits but the defensive pipeline detects, investigates, and isolates the target within seconds with minimal operational blast radius, the enterprise demonstrates **high cyber-resilience**.

---

## 2. Mathematical Formulation

The HavenSec Arena **Composite Cyber-Resilience Score** ($S_{\text{Resilience}}$) is strictly bounded between $0$ and $100$:

$$S_{\text{Resilience}} = \max\left(0, \min\left(100, \sum_{i=1}^{4} w_i \cdot M_i - P_{\text{uncontained}} + B_{\text{rapid}}\right)\right)$$

Where:

| Component | Metric Name ($M_i$) | Weight ($w_i$) | Description & Normalization Range |
| :--- | :--- | :---: | :--- |
| **$C_s$** | Containment Success | **0.35** | Ratio of contained attack objectives to attempted objectives ($0 \le C_s \le 100$). |
| **$R_d$** | Detection Speed & Recall | **0.30** | Harmonic mean of detection alert recall and normalized response latency ($0 \le R_d \le 100$). |
| **$I_q$** | Investigation Triage Quality | **0.20** | Precision of correlated alerts into corroborated incident graphs ($0 \le I_q \le 100$). |
| **$L_d$** | Simulated Damage Limitation | **0.15** | Inverse blast radius ratio measuring unaffected assets ($0 \le L_d \le 100$). |

$$\sum_{i=1}^{4} w_i = 0.35 + 0.30 + 0.20 + 0.15 = 1.00$$

### Deductions and Penalties ($P_{\text{uncontained}}$)
- **Uncontained Critical Phase Penalty:** For every ground-truth objective in an attack that reaches completion without an executed containment response, a deduction of **25 points** is subtracted from the final composite score:
  $$P_{\text{uncontained}} = 25 \times N_{\text{uncontained}}$$
- If all attack phases complete uncontained, the penalty drives the composite score to **0**.

### Bonuses ($B_{\text{rapid}}$)
- **Rapid Containment Bonus:** If first detection occurs in under 3,000 ms of the attack initiation and automated containment executes without false positives, a bonus of **+5 points** is granted (capped at 100).

---

## 3. Sub-Metric Derivations

### 3.1 Containment Success ($C_s$)
Let $O_{\text{total}}$ be the total ground-truth attack phases scheduled by the Red Team, and $O_{\text{contained}}$ be the number of phases successfully countered by the Response Commander playbooks:
$$C_s = \left(\frac{O_{\text{contained}}}{O_{\text{total}}}\right) \times 100$$

### 3.2 Detection Speed & Recall ($R_d$)
Let $T_{\text{events}}$ be the generated suspicious telemetry events, and $A_{\text{detected}}$ be the true positive alerts flagged by Blue Team Sentinel:
$$\text{Recall} = \frac{A_{\text{detected}}}{T_{\text{events}}}$$

Let $t_{\text{detect}}$ be the detection latency in milliseconds from scenario start:
$$\text{SpeedFactor} = \max\left(0, 1.0 - \frac{t_{\text{detect}}}{15000}\right)$$

$$R_d = (0.50 \cdot \text{Recall} + 0.50 \cdot \text{SpeedFactor}) \times 100$$

### 3.3 Investigation Triage Quality ($I_q$)
Evaluates the ratio of actionable alerts correlated into real incidents without duplicate noise:
$$I_q = \min\left(100, \left(\frac{N_{\text{corroborated\_incidents}}}{N_{\text{alerts}}} \times 1.25\right) \times 100\right)$$

### 3.4 Damage Limitation ($L_d$)
Evaluates asset health retention across the synthetic topology ($A_{\text{total}} = 5$ assets: `WEB-01`, `API-01`, `AUTH-01`, `DB-01`, `FILE-01`):
$$L_d = \left(\frac{A_{\text{uncompromised}}}{A_{\text{total}}}\right) \times 100$$

---

## 4. Worked Scenario Examples

### Scenario A: Rapid, Full Mitigation (Intermediate Credential Compromise)
- **Adversary Objectives Attempted:** 3 (Reconnaissance, Credential Harvesting, Lateral Movement)
- **Containment Playbooks Executed:** Host isolation on `AUTH-01` + Credential revocation
- **Detection Time:** 2,100 ms ($t_{\text{detect}} \ll 15000$)
- **Calculated Sub-Metrics:**
  - $C_s = 100.0$
  - $R_d = 94.0$
  - $I_q = 90.0$
  - $L_d = 80.0$
  - $P_{\text{uncontained}} = 0$
  - $B_{\text{rapid}} = +5$
- **Raw Calculation:**
  $$0.35(100) + 0.30(94) + 0.20(90) + 0.15(80) + 5 = 35.0 + 28.2 + 18.0 + 12.0 + 5 = 98.2$$
- **Final Result:** **$98 / 100$ (High Cyber-Resilience)**

---

### Scenario B: Uncontained Catastrophe (Ransomware Outbreak Without Response)
- **Adversary Objectives Attempted:** 4 (Phishing, Privilege Escalation, File Enumeration, Ransomware Encryption)
- **Containment Playbooks Executed:** 0 (Defense disabled or delayed)
- **Detection Time:** Never or delayed
- **Calculated Sub-Metrics:**
  - $C_s = 0.0$
  - $R_d = 10.0$
  - $I_q = 0.0$
  - $L_d = 0.0$ (All critical storage encrypted)
  - $P_{\text{uncontained}} = 25 \times 4 = 100$
- **Raw Calculation:**
  $$0.35(0) + 0.30(10) + 0.20(0) + 0.15(0) - 100 = 3.0 - 100 = -97.0$$
- **Bounded Result:** $\max(0, -97.0) =$ **$0 / 100$ (Catastrophic Breach)**

---

## 5. Defense Against Score Gaming

1. **No False-Positive Inflation:** Generating spurious alerts does not boost $R_d$ because $I_q$ penalizes uncorrelated alert noise.
2. **Deterministic Reproducibility:** Every run is seeded with a pseudorandom seed (default `42`) so that identical attacker choices produce identical referee results for viva examiners.
3. **Traceability:** Every metric component links directly to timestamped UUID records in SQLite (`telemetry`, `alerts`, `incidents`, `responses`).
