# SpinUp - Script de démarrage rapide
# Version simplifiée pour développement quotidien
# Exécuter depuis le dossier scripts/ : .\start-quick.ps1

Write-Host "🚀 SpinUp - Démarrage rapide" -ForegroundColor Green

# Répertoire racine du projet (parent du dossier scripts)
$PROJECT_ROOT = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)

# Fonction pour vérifier si un port est utilisé
function Test-Port {
    param([int]$Port)
    $connection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    return $connection -ne $null
}

# Fonction pour trouver un port libre
function Find-FreePort {
    param([int]$StartPort = 8081)
    $port = $StartPort
    while (Test-Port $port) {
        $port++
        if ($port -gt 9000) {
            throw "Aucun port libre trouvé entre $StartPort et 9000"
        }
    }
    return $port
}

# Vérifier que nous sommes dans le bon répertoire
if (-not (Test-Path "$PROJECT_ROOT\docker-compose.yml")) {
    Write-Host "❌ Erreur: docker-compose.yml non trouvé dans $PROJECT_ROOT" -ForegroundColor Red
    Write-Host "💡 Assurez-vous d'exécuter ce script depuis le dossier scripts/" -ForegroundColor Yellow
    exit 1
}

# 1. Démarrer Postgres
Write-Host "🐘 Démarrage PostgreSQL..." -ForegroundColor Cyan
Set-Location $PROJECT_ROOT
docker compose up -d

# 2. Vérifier et choisir un port pour le backend
$backendPort = 8081
if (Test-Port $backendPort) {
    Write-Host "⚠️ Port $backendPort déjà utilisé, recherche d'un port libre..." -ForegroundColor Yellow
    $backendPort = Find-FreePort -StartPort 8081
    Write-Host "✅ Port libre trouvé: $backendPort" -ForegroundColor Green
}

# 3. Démarrer Backend (en arrière-plan)
Write-Host "⚙️ Démarrage Backend sur le port $backendPort..." -ForegroundColor Cyan
$env:SPRING_DATASOURCE_URL = "jdbc:postgresql://localhost:5432/parkandsee"
$env:SPRING_DATASOURCE_USERNAME = "postgres"
$env:SPRING_DATASOURCE_PASSWORD = "example"
$env:SERVER_PORT = $backendPort

Set-Location "$PROJECT_ROOT\backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "mvn spring-boot:run -Dspring-boot.run.jvmArguments='-Dserver.port=$backendPort'" -WindowStyle Minimized

# 4. Démarrer Frontend (en arrière-plan)  
Write-Host "🎨 Démarrage Frontend..." -ForegroundColor Cyan
Set-Location "$PROJECT_ROOT\frontend-react"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm start" -WindowStyle Minimized

Write-Host "`n✅ Démarrage en cours..." -ForegroundColor Green
Write-Host "📱 Frontend: http://localhost:3000 (dans ~30s)" -ForegroundColor Cyan
Write-Host "⚙️ Backend: http://localhost:$backendPort (dans ~20s)" -ForegroundColor Cyan

if ($backendPort -ne 8081) {
    Write-Host "`n⚠️ IMPORTANT: Le backend utilise le port $backendPort au lieu de 8081" -ForegroundColor Yellow
    Write-Host "💡 Mettez à jour vos appels API frontend si nécessaire" -ForegroundColor Yellow
}

Write-Host "`n💡 Utilisez .\stop-app.ps1 pour arrêter l'application" -ForegroundColor Yellow
Write-Host "📂 Tous les scripts sont dans le dossier scripts/" -ForegroundColor Cyan