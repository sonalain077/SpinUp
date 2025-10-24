#!/usr/bin/env pwsh
# Script de demarrage en mode developpement pour Park & See
# Lance le backend (avec hot reload) et le frontend en parallele

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PARK & SEE - MODE DEVELOPPEMENT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Fonction pour tuer les processus existants
function Stop-ExistingProcesses {
    Write-Host "Nettoyage des processus existants..." -ForegroundColor Yellow
    
    # Arreter les processus Java (backend)
    Get-Process -Name "java" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    
    # Arreter les processus Node (frontend)
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    
    Start-Sleep -Seconds 1
    Write-Host "Processus nettoyes" -ForegroundColor Green
    Write-Host ""
}

Stop-ExistingProcesses

Write-Host "Demarrage du mode developpement..." -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend: http://localhost:8081 (Spring Boot DevTools actif)" -ForegroundColor Green
Write-Host "Frontend: http://localhost:3000 (Hot Module Replacement actif)" -ForegroundColor Green
Write-Host ""
Write-Host "Les modifications seront automatiquement rechargees !" -ForegroundColor Yellow
Write-Host "   - Java: Recompilation automatique (quelques secondes)" -ForegroundColor Gray
Write-Host "   - React: Rechargement instantane (HMR)" -ForegroundColor Gray
Write-Host ""
Write-Host "Appuyez sur Ctrl+C pour tout arreter" -ForegroundColor Yellow
Write-Host ""

# Lancement du backend en arriere-plan
Write-Host "Demarrage du backend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; mvn spring-boot:run"

Start-Sleep -Seconds 3

# Lancement du frontend en arriere-plan  
Write-Host "Demarrage du frontend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend-react'; `$env:BROWSER='none'; npm start"

Start-Sleep -Seconds 2

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  SERVEURS DEMARRES" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Ouvrez votre navigateur sur:" -ForegroundColor Cyan
Write-Host "   http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "Les logs apparaissent dans les fenetres separees" -ForegroundColor Yellow
Write-Host ""
Write-Host "Pour arreter : fermez les fenetres PowerShell" -ForegroundColor Yellow

