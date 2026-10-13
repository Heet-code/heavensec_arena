@echo off
title HavenSec Arena - Launch Controller
color 0B

echo.
echo  ======================================================
echo    HavenSec Arena - Cyber-Resilience Simulation Platform
echo  ======================================================
echo.

cd /d %~dp0

echo  [1/2] Launching Python FastAPI Backend on http://127.0.0.1:9002 ...
start "HavenSec - FastAPI Backend" cmd /k "cd /d %~dp0\backend && python -m uvicorn api:app --host 127.0.0.1 --port 9002"

timeout /t 2 /nobreak >nul

echo  [2/2] Launching Vanilla JS Frontend on http://127.0.0.1:8080 ...
start "HavenSec - Web UI" cmd /k "cd /d %~dp0\frontend && python -m http.server 8080"

timeout /t 1 /nobreak >nul

echo.
echo  Platform is online!
echo  Access Web Interface at: http://127.0.0.1:8080
echo  API Documentation at:    http://127.0.0.1:9002/docs
echo.
start http://127.0.0.1:8080
pause
