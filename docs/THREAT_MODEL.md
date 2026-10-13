# HavenSec Arena — Threat Model & Cyber-Range Safety Boundary

## 1. Safety Boundary & Synthetic Confinement Principle
HavenSec Arena is an educational and enterprise simulation platform. **At no point does the application generate live malware, execute destructive binaries, scan external networks, or interact with real production credentials.**

### Confinement Controls
1. **Synthetic Assets Only:** All attacks are directed at simulated entities (`WEB-01`, `API-01`, `AUTH-01`, `DB-01`, `FILE-01`).
2. **Metadata-Only Operations:** Ransomware scenarios emit simulated encryption-intent events and file entropy telemetry; no physical file encryption occurs on the host machine.
3. **Internal Loopback / Container Isolation:** All networking is confined to loopback (`127.0.0.1`) or the Docker Compose internal bridge network.
4. **Simulated Containment:** Response actions (e.g. account lockout, IP blocking, endpoint quarantine) update in-memory and database state records; no host OS user accounts or physical network interfaces are modified.

## 2. Threat Analysis of the Simulation Platform Itself

| Threat | Risk | Mitigation |
|---|---|---|
| **Malicious Payload Injection via API** | Medium | Strict Pydantic model validation on all incoming JSON payloads; rejection of unexpected fields. |
| **Cross-Site Scripting (XSS) in SOC UI** | Medium | Mandatory `escapeHtml()` sanitization on all telemetry strings, actor names, and payloads before DOM rendering. |
| **SQL Injection (SQLi)** | High | Parameterized queries used across all SQLite database transactions in `backend/database.py`. |
| **Orphaned Asynchronous Tasks** | Low | Orchestrator maintains an `active_simulation_tasks` registry with cancellation hooks and auto-cleanup in `finally` blocks. |
| **Denial of Service via Infinite Loops** | Low | Simulation ticks are bounded by explicit timeline limits (15 seconds) and lifecycle state guards. |
