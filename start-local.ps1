# Hostel Grievance System - Local Runner Script (Runs without Docker)
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  Starting Hostel Grievance System in Local Dev Mode" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$ROOT_DIR = $PSScriptRoot

# 1. Start Backend in background process or separate window
Write-Host "[1/2] Launching Spring Boot Backend on http://localhost:8080..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$ROOT_DIR\backend'; .\mvnw.cmd spring-boot:run '-Dspring-boot.run.profiles=local'"

# 2. Start Frontend
Write-Host "[2/2] Launching React Frontend on http://localhost:3000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$ROOT_DIR\frontend'; npm run dev"

Write-Host "`nServices are starting in separate terminal windows:" -ForegroundColor Yellow
Write-Host " - Frontend UI: http://localhost:3000" -ForegroundColor White
Write-Host " - Backend API: http://localhost:8080/api" -ForegroundColor White
Write-Host " - Default Admin: admin / Admin@Hgs2026!" -ForegroundColor White
