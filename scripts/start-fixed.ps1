# SpinUp - Script de démarrage avec gestion des conflits de port
# Démarre Backend Spring Boot et Frontend React avec arrêt propre des processus existants

Write-Host "Park & See - Démarrage de l'application (Mode corrigé)" -ForegroundColor Green
Write-Host "=======================================================" -ForegroundColor Green

# Déterminer le répertoire racine du projet (deux niveaux au-dessus)
$PROJECT_ROOT = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$BACKEND_DIR = Join-Path $PROJECT_ROOT "backend"
$FRONTEND_DIR = Join-Path $PROJECT_ROOT "frontend-react"

Write-Host "📂 Répertoire racine du projet: $PROJECT_ROOT" -ForegroundColor Cyan

# Fonction pour tuer les processus sur un port spécifique
function Kill-ProcessOnPort {
    param([int]$Port)
    
    try {
        $netstatOutput = netstat -ano | findstr ":$Port "
        if ($netstatOutput) {
            Write-Host "Processus trouvé sur le port $Port - arrêt en cours..." -ForegroundColor Yellow
            
            foreach ($line in $netstatOutput) {
                $parts = $line -split '\s+' | Where-Object { $_ -ne '' }
                if ($parts.Length -ge 5) {
                    $processId = $parts[4]
                    if ($processId -match '^\d+$') {
                        try {
                            Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
                            Write-Host "Processus $processId arrêté" -ForegroundColor Green
                        } catch {
                            Write-Host "Impossible d'arrêter le processus $processId" -ForegroundColor Yellow
                        }
                    }
                }
            }
        } else {
            Write-Host "Aucun processus trouvé sur le port $Port" -ForegroundColor Green
        }
    } catch {
        Write-Host "Erreur lors de la vérification du port $Port : $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

# Arrêt des processus existants sur les ports
Write-Host "`nArrêt des processus existants..." -ForegroundColor Cyan
Kill-ProcessOnPort -Port 8081  # Backend Spring Boot
Kill-ProcessOnPort -Port 3000  # Frontend React

# Attendre un peu pour que les processus se terminent proprement
Start-Sleep -Seconds 2

# Vérification des répertoires
Write-Host "Vérification des prérequis..." -ForegroundColor Cyan

if (-not (Test-Path $BACKEND_DIR)) {
    Write-Host "ERREUR: Dossier backend introuvable: $BACKEND_DIR" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $FRONTEND_DIR)) {
    Write-Host "ERREUR: Dossier frontend-react introuvable: $FRONTEND_DIR" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path (Join-Path $BACKEND_DIR "pom.xml"))) {
    Write-Host "ERREUR: Fichier pom.xml introuvable dans le backend" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path (Join-Path $FRONTEND_DIR "package.json"))) {
    Write-Host "ERREUR: Fichier package.json introuvable dans le frontend" -ForegroundColor Red
    exit 1
}

Write-Host "Tous les répertoires et fichiers sont présents ✅" -ForegroundColor Green

# Démarrage du Backend
Write-Host "`nDémarrage du Backend Spring Boot..." -ForegroundColor Cyan
Write-Host "Répertoire: $BACKEND_DIR" -ForegroundColor Gray

$backendCmd = "cd '$BACKEND_DIR'; mvn spring-boot:run"
$backendProcess = Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCmd -PassThru

Write-Host "Backend en cours de démarrage (PID: $($backendProcess.Id))" -ForegroundColor Green

# Attendre avant le frontend
Write-Host "`nAttente de 8 secondes pour le backend..." -ForegroundColor Yellow
Start-Sleep -Seconds 8

# Démarrage du Frontend avec CMD pour éviter les problèmes npm
Write-Host "Démarrage du Frontend React..." -ForegroundColor Cyan
Write-Host "Répertoire: $FRONTEND_DIR" -ForegroundColor Gray

# Utiliser CMD au lieu de PowerShell pour npm
$frontendCmd = "cd /d `"$FRONTEND_DIR`" & npm start"
$frontendProcess = Start-Process cmd -ArgumentList "/k", $frontendCmd -PassThru

Write-Host "Frontend en cours de démarrage (PID: $($frontendProcess.Id))" -ForegroundColor Green

# Instructions finales
Write-Host "`n" -NoNewline
Write-Host "=== DÉMARRAGE EN COURS ===" -ForegroundColor Green
Write-Host "Frontend: http://localhost:3000 (dans 30-60s)" -ForegroundColor Cyan
Write-Host "Backend:  http://localhost:8081 (dans 20-30s)" -ForegroundColor Cyan
Write-Host "`nPID Backend:  $($backendProcess.Id)" -ForegroundColor Gray
Write-Host "PID Frontend: $($frontendProcess.Id)" -ForegroundColor Gray
Write-Host "`nAttendez l'ouverture automatique du navigateur..." -ForegroundColor Yellow
Write-Host "Ou ouvrez manuellement: http://localhost:3000" -ForegroundColor Yellow
Write-Host "`n💡 Conseil: Utilisez .\stop-app.ps1 pour un arrêt propre" -ForegroundColor Magenta
Write-Host "Ou fermez les fenêtres de commande pour arrêter les services" -ForegroundColor Magenta
Write-Host "`nApplication Park & See démarrée avec succès! 🚀" -ForegroundColor Green