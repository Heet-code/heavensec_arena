# Threat Model

## Assumptions
- HavenSec Arena is a simulated environment intended for training and evaluation.
- All "attacks" are entirely synthetic. No actual network traffic or exploit payloads are sent to real infrastructure.

## Assets
- **Simulation Data:** Exercise results, historical scores, incident logs.
- **Application Availability:** The ability for users to start and run simulations.
- **API Keys (Optional AI Integration):** OpenAI/IBM Watsonx API keys.

## Threats
1. **Simulation Tampering:** A user could modify the database (`database.sqlite`) directly to cheat on an exercise score.
   - *Mitigation:* In an academic context, local SQLite tampering is out-of-scope for product defense but can be mitigated by moving the database to a secured server in production.
2. **API Abuse:** The REST API does not have rate-limiting.
   - *Mitigation:* The product is meant to be run locally or within an isolated network.
3. **Cross-Site Scripting (XSS):** If user input is reflected in the simulation reports.
   - *Mitigation:* React's default DOM escaping protects against XSS in the UI.
4. **Credential Leakage:** Hardcoded API keys in source code.
   - *Mitigation:* The `.env` file should never be committed, and fallback deterministic mechanisms ensure the application functions safely without external AI services.
