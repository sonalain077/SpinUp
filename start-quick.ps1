# SpinUp - Script de démarrage rapide
# Version simplifiée pour développement quotidien

Write-Host "🚀 SpinUp - Démarrage rapide" -ForegroundColor Green

$PROJECT_ROOT = Split-Path -Parent $MyInvocation.MyCommand.Path

# 1. Démarrer Postgres
Write-Host "🐘 Démarrage PostgreSQL..." -ForegroundColor Cyan
Set-Location $PROJECT_ROOT
docker compose up -d

# 2. Démarrer Backend (en arrière-plan)
Write-Host "⚙️ Démarrage Backend..." -ForegroundColor Cyan
$env:SPRING_DATASOURCE_URL = "jdbc:postgresql://localhost:5432/parkandsee"
$env:SPRING_DATASOURCE_USERNAME = "postgres"
$env:SPRING_DATASOURCE_PASSWORD = "example"

Set-Location "$PROJECT_ROOT\backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "mvn spring-boot:run" -WindowStyle Minimized

# 3. Démarrer Frontend (en arrière-plan)  
Write-Host "🎨 Démarrage Frontend..." -ForegroundColor Cyan
Set-Location "$PROJECT_ROOT\frontend-react"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm start" -WindowStyle Minimized

Write-Host "`n✅ Démarrage en cours..." -ForegroundColor Green
Write-Host "📱 Frontend: http://localhost:3000 (dans ~30s)" -ForegroundColor Cyan
Write-Host "⚙️ Backend: http://localhost:8081 (dans ~20s)" -ForegroundColor Cyan
Write-Host "`n💡 Utilisez stop-app.ps1 pour arrêter l'application" -ForegroundColor Yellow