#!/usr/bin/env pwsh
# HavenSec Arena — Start Script (PowerShell)
# Double-click or run from PowerShell terminal

$root = $PSScriptRoot
if (-not $root) { $root = Get-Location }

Write-Host ""
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "  HavenSec Arena — Starting Up" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

$vite = Join-Path $root "node_modules\.bin\vite.cmd"
$tsnodedev = Join-Path $root "node_modules\.bin\ts-node-dev.cmd"
$npmCmd = "C:\Program Files\nodejs\npm.cmd"

# Install if needed
if (-not (Test-Path $vite)) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    & $npmCmd install
    Write-Host "Done." -ForegroundColor Green
    Write-Host ""
}

Write-Host "Starting backend API  →  http://localhost:3001" -ForegroundColor White
Write-Host "Starting frontend     →  http://localhost:5174" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop." -ForegroundColor DarkGray
Write-Host ""

# Start backend as background job
$backendJob = Start-Job -Name "HavenSecBackend" -ScriptBlock {
    Set-Location (Join-Path $using:root "server")
    & $using:tsnodedev --respawn --transpile-only src/index.ts
}

# Give backend 3s to start, show its output
Start-Sleep -Seconds 3

# Launch frontend (blocking — keeps terminal alive)
try {
    Set-Location (Join-Path $root "client")
    & $vite --open
} finally {
    Write-Host ""
    Write-Host "Stopping backend..." -ForegroundColor Yellow
    Stop-Job $backendJob -ErrorAction SilentlyContinue
    Remove-Job $backendJob -ErrorAction SilentlyContinue
    Set-Location $root
    Write-Host "Stopped." -ForegroundColor Green
}
