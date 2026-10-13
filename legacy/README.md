# ARCHIVED LEGACY CODE NOTICE

This directory and the historical `client/` and `server/` directories contain early prototype sketches and draft experiments created during the exploratory phase of the minor project.

## Authoritative Active Architecture

In accordance with the **HavenSec Arena Master Engineering Directive**:

1. **Active Frontend:** Located in `frontend/`. Built with **semantic HTML5, modern CSS3 (custom properties, Flexbox/Grid), and Vanilla JavaScript**. Tailwind CSS, React, and build toolchains are explicitly superseded and prohibited in the active application.
2. **Active Backend:** Located in `backend/`. Built with **Python 3.14+, FastAPI, Pydantic, and SQLite3**. Node.js/Express is superseded.
3. **Active Multi-Agent Orchestration:** Located in `backend/simulation/orchestration.py`. Uses a flexible multi-mode architecture with a deterministic Built-in mode (0 API keys required, 100% offline).

The legacy folders (`client/` and `server/`) are preserved only for git archival history and must not be used or deployed.
