# SpinUp - Script de demarrage corrige
# Demarre Backend Spring Boot et Frontend React

Write-Host "Park & See - Demarrage de l'application" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green

# Fonction pour tuer les processus sur un port specifique
function Kill-ProcessOnPort {
    param([int]$Port)
    
    try {
        $netstatOutput = netstat -ano | findstr ":$Port "
        if ($netstatOutput) {
            Write-Host "Processus trouve sur le port $Port - arret en cours..." -ForegroundColor Yellow
            
            foreach ($line in $netstatOutput) {
                $parts = $line -split '\s+' | Where-Object { $_ -ne '' }
                if ($parts.Length -ge 5) {
                    $processId = $parts[4]
                    if ($processId -match '^\d+$') {
                        try {
                            Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
                            Write-Host "Processus $processId arrete" -ForegroundColor Green
                        } catch {
                            Write-Host "Impossible d'arreter le processus $processId" -ForegroundColor Yellow
                        }
                    }
                }
            }
        } else {
            Write-Host "Aucun processus trouve sur le port $Port" -ForegroundColor Green
        }
    } catch {
        Write-Host "Erreur lors de la verification du port $Port : $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

# Arret des processus existants sur les ports
Write-Host "`nArret des processus existants..." -ForegroundColor Cyan
Kill-ProcessOnPort -Port 8081  # Backend Spring Boot
Kill-ProcessOnPort -Port 3000  # Frontend React

# Attendre un peu pour que les processus se terminent proprement
Start-Sleep -Seconds 2

$PROJECT_ROOT = Split-Path -Parent $MyInvocation.MyCommand.Path
$BACKEND_DIR = Join-Path $PROJECT_ROOT "backend"
$FRONTEND_DIR = Join-Path $PROJECT_ROOT "frontend-react"

# Verification des repertoires
Write-Host "Verification des prerequis..." -ForegroundColor Cyan

if (-not (Test-Path $BACKEND_DIR)) {
    Write-Host "ERREUR: Dossier backend introuvable: $BACKEND_DIR" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $FRONTEND_DIR)) {
    Write-Host "ERREUR: Dossier frontend-react introuvable: $FRONTEND_DIR" -ForegroundColor Red
    exit 1
}

Write-Host "Tous les repertoires sont presents" -ForegroundColor Green

# Demarrage du Backend
Write-Host "`nDemarrage du Backend Spring Boot..." -ForegroundColor Cyan
Write-Host "Repertoire: $BACKEND_DIR" -ForegroundColor Gray

$backendCmd = "cd '$BACKEND_DIR'; mvn spring-boot:run"
$backendProcess = Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCmd -PassThru

Write-Host "Backend en cours de demarrage (PID: $($backendProcess.Id))" -ForegroundColor Green

# Attendre avant le frontend
Write-Host "`nAttente de 8 secondes pour le backend..." -ForegroundColor Yellow
Start-Sleep -Seconds 8

# Demarrage du Frontend avec CMD pour eviter les problemes npm
Write-Host "Demarrage du Frontend React..." -ForegroundColor Cyan
Write-Host "Repertoire: $FRONTEND_DIR" -ForegroundColor Gray

# Utiliser CMD au lieu de PowerShell pour npm
$frontendCmd = "cd /d `"$FRONTEND_DIR`" & npm start"
$frontendProcess = Start-Process cmd -ArgumentList "/k", $frontendCmd -PassThru

Write-Host "Frontend en cours de demarrage (PID: $($frontendProcess.Id))" -ForegroundColor Green

# Instructions finales
Write-Host "`n" -NoNewline
Write-Host "=== DEMARRAGE EN COURS ===" -ForegroundColor Green
Write-Host "Frontend: http://localhost:3000 (dans 30-60s)" -ForegroundColor Cyan
Write-Host "Backend:  http://localhost:8081 (dans 20-30s)" -ForegroundColor Cyan
Write-Host "`nPID Backend:  $($backendProcess.Id)" -ForegroundColor Gray
Write-Host "PID Frontend: $($frontendProcess.Id)" -ForegroundColor Gray
Write-Host "`nAttendez l'ouverture automatique du navigateur..." -ForegroundColor Yellow
Write-Host "Ou ouvrez manuellement: http://localhost:3000" -ForegroundColor Yellow
Write-Host "`nFermez les fenetres de commande pour arreter les services" -ForegroundColor Magenta
Write-Host "`nApplication Park & See demarree avec succes!" -ForegroundColor Green