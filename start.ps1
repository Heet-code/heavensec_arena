#!/usr/bin/env pwsh
# HavenSec Arena — Start Script (PowerShell)

$root = $PSScriptRoot
if (-not $root) { $root = Get-Location }

Write-Host ""
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "  HavenSec Arena — Cyber-Resilience Platform Startup" -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/2] Starting Python FastAPI Backend on http://127.0.0.1:9002 ..." -ForegroundColor Yellow
$backendJob = Start-Job -Name "HavenSecBackend" -ScriptBlock {
    Set-Location (Join-Path $using:root "backend")
    python -m uvicorn api:app --host 127.0.0.1 --port 9002
}

Start-Sleep -Seconds 2

Write-Host "[2/2] Starting Vanilla HTML5/JS Frontend on http://127.0.0.1:8080 ..." -ForegroundColor Yellow
$frontendJob = Start-Job -Name "HavenSecFrontend" -ScriptBlock {
    Set-Location (Join-Path $using:root "frontend")
    python -m http.server 8080
}

Start-Sleep -Seconds 1

Write-Host ""
Write-Host "  Platform is online!" -ForegroundColor Green
Write-Host "  Web Dashboard:     http://127.0.0.1:8080" -ForegroundColor White
Write-Host "  API Docs (Swagger): http://127.0.0.1:9002/docs" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop services." -ForegroundColor DarkGray

# Open default browser
Start-Process "http://127.0.0.1:8080"

try {
    while ($true) {
        Start-Sleep -Seconds 1
    }
} finally {
    Write-Host "`nStopping services..." -ForegroundColor Yellow
    Stop-Job $backendJob, $frontendJob -ErrorAction SilentlyContinue
    Remove-Job $backendJob, $frontendJob -ErrorAction SilentlyContinue
    Write-Host "HavenSec Arena stopped." -ForegroundColor Green
}
