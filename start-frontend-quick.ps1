#!/usr/bin/env pwsh
# Script pour démarrer rapidement le frontend

Write-Host "🚀 Démarrage du frontend React..." -ForegroundColor Green

Set-Location "frontend-react"

try {
    npm.cmd run dev
} catch {
    Write-Host "❌ Erreur lors du démarrage du frontend" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Yellow
}

Write-Host "✅ Frontend démarré avec succès" -ForegroundColor Green