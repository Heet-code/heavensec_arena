@echo off
title HavenSec Arena
color 0B

echo.
echo  =========================================
echo    HavenSec Arena - Starting...
echo  =========================================
echo.

cd /d %~dp0

REM Install if node_modules missing
if not exist "node_modules" (
    echo  Installing dependencies...
    call npm install
    echo  Done.
    echo.
)

REM Build server if dist missing
if not exist "server\dist\index.js" (
    echo  Building server...
    call node_modules\.bin\tsc.cmd -p server\tsconfig.json
    echo  Done.
    echo.
)

echo  Starting backend on http://localhost:3001 ...
start "HavenSec - Backend" cmd /k "cd /d %~dp0 && node server/dist/index.js"

timeout /t 2 /nobreak >nul

echo  Starting frontend on http://localhost:5174 ...
echo.
echo  App will open at: http://localhost:5174
echo.
echo  Close this window to stop the frontend.
echo  Close the Backend window to stop the API.
echo.

cd client
..\node_modules\.bin\vite.cmd --open
