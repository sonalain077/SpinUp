# SpinUp - Script de démarrage complet
# Démarre Postgres (Docker), Backend (Spring Boot) et Frontend (React)

Write-Host "🚀 SpinUp - Démarrage de l'application complète" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green

# Variables
$PROJECT_ROOT = Split-Path -Parent $MyInvocation.MyCommand.Path
$BACKEND_DIR = Join-Path $PROJECT_ROOT "backend"
$FRONTEND_DIR = Join-Path $PROJECT_ROOT "frontend-react"

# Fonction pour vérifier si un port est utilisé
function Test-Port {
    param([int]$Port)
    try {
        $connection = New-Object System.Net.Sockets.TcpClient
        $connection.Connect("localhost", $Port)
        $connection.Close()
        return $true
    }
    catch {
        return $false
    }
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

# Fonction pour attendre qu'un service soit prêt
function Wait-ForService {
    param([string]$Name, [int]$Port, [int]$TimeoutSeconds = 60)
    
    Write-Host "⏳ Attente de $Name sur le port $Port..." -ForegroundColor Yellow
    $timeout = [DateTime]::Now.AddSeconds($TimeoutSeconds)
    
    while ([DateTime]::Now -lt $timeout) {
        if (Test-Port -Port $Port) {
            Write-Host "✅ $Name est prêt!" -ForegroundColor Green
            return $true
        }
        Start-Sleep -Seconds 2
    }
    
    Write-Host "❌ Timeout: $Name n'a pas démarré dans les temps" -ForegroundColor Red
    return $false
}

# Étape 1: Vérification des prérequis
Write-Host "`n📋 Vérification des prérequis..." -ForegroundColor Cyan

# Vérifier Java
try {
    $javaVersion = java -version 2>&1 | Select-String "version" | Select-Object -First 1
    Write-Host "✅ Java: $javaVersion" -ForegroundColor Green
}
catch {
    Write-Host "❌ Java non trouvé. Installez Java JDK 17+" -ForegroundColor Red
    exit 1
}

# Vérifier Maven
try {
    $mavenVersion = mvn -v 2>&1 | Select-String "Apache Maven" | Select-Object -First 1
    Write-Host "✅ Maven: $mavenVersion" -ForegroundColor Green
}
catch {
    Write-Host "❌ Maven non trouvé. Installez Apache Maven" -ForegroundColor Red
    exit 1
}

# Vérifier Node.js
try {
    $nodeVersion = node -v
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
}
catch {
    Write-Host "❌ Node.js non trouvé. Installez Node.js" -ForegroundColor Red
    exit 1
}

# Vérifier Docker
try {
    $dockerVersion = docker --version
    Write-Host "✅ Docker: $dockerVersion" -ForegroundColor Green
}
catch {
    Write-Host "❌ Docker non trouvé. Installez Docker Desktop" -ForegroundColor Red
    exit 1
}

# Étape 2: Démarrage de Postgres (Docker)
Write-Host "`n🐘 Démarrage de PostgreSQL..." -ForegroundColor Cyan

# Vérifier si Docker daemon est actif
try {
    docker info | Out-Null
}
catch {
    Write-Host "❌ Docker daemon non démarré. Lancez Docker Desktop" -ForegroundColor Red
    Write-Host "   Tentative de démarrage automatique..." -ForegroundColor Yellow
    try {
        Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe" -ErrorAction Stop
        Write-Host "   Attente du démarrage de Docker Desktop (30s)..." -ForegroundColor Yellow
        Start-Sleep -Seconds 30
        docker info | Out-Null
        Write-Host "✅ Docker Desktop démarré" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Impossible de démarrer Docker Desktop automatiquement" -ForegroundColor Red
        Write-Host "   Veuillez démarrer Docker Desktop manuellement puis relancer ce script" -ForegroundColor Yellow
        exit 1
    }
}

# Démarrer les conteneurs
Write-Host "🔄 Démarrage des conteneurs Docker..." -ForegroundColor Yellow
Set-Location $PROJECT_ROOT

try {
    docker compose up -d
    Write-Host "✅ Conteneurs Docker démarrés" -ForegroundColor Green
}
catch {
    Write-Host "❌ Erreur lors du démarrage des conteneurs" -ForegroundColor Red
    exit 1
}

# Vérifier que Postgres est prêt
if (-not (Wait-ForService -Name "PostgreSQL" -Port 5432 -TimeoutSeconds 30)) {
    Write-Host "❌ PostgreSQL n'a pas pu démarrer" -ForegroundColor Red
    exit 1
}

# Étape 3: Compilation et démarrage du Backend
Write-Host "`n⚙️ Compilation et démarrage du Backend..." -ForegroundColor Cyan
Set-Location $BACKEND_DIR

# Définir les variables d'environnement
$env:SPRING_DATASOURCE_URL = "jdbc:postgresql://localhost:5432/parkandsee"
$env:SPRING_DATASOURCE_USERNAME = "postgres"
$env:SPRING_DATASOURCE_PASSWORD = "example"

Write-Host "🔧 Variables d'environnement configurées pour PostgreSQL" -ForegroundColor Green

# Vérifier si le port 8081 est libre
if (Test-Port -Port 8081) {
    Write-Host "⚠️ Port 8081 déjà utilisé. Arrêt du processus existant..." -ForegroundColor Yellow
    # Essayer d'arrêter le processus sur le port 8081
    try {
        $process = Get-NetTCPConnection -LocalPort 8081 -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($process) {
            Stop-Process -Id $process.OwningProcess -Force -ErrorAction SilentlyContinue
            Start-Sleep -Seconds 3
        }
    }
    catch {
        Write-Host "   Impossible d'arrêter automatiquement le processus" -ForegroundColor Yellow
    }
}

# Compiler le backend
Write-Host "🔄 Compilation du backend..." -ForegroundColor Yellow
try {
    mvn clean package -DskipTests -q
    Write-Host "✅ Backend compilé avec succès" -ForegroundColor Green
}
catch {
    Write-Host "❌ Erreur lors de la compilation du backend" -ForegroundColor Red
    exit 1
}

# Démarrer le backend en arrière-plan
Write-Host "🚀 Démarrage du backend..." -ForegroundColor Yellow
$backendJob = Start-Job -ScriptBlock {
    param($BackendDir, $PostgresUrl, $PostgresUser, $PostgresPassword)
    
    Set-Location $BackendDir
    $env:SPRING_DATASOURCE_URL = $PostgresUrl
    $env:SPRING_DATASOURCE_USERNAME = $PostgresUser
    $env:SPRING_DATASOURCE_PASSWORD = $PostgresPassword
    
    mvn spring-boot:run
} -ArgumentList $BACKEND_DIR, $env:SPRING_DATASOURCE_URL, $env:SPRING_DATASOURCE_USERNAME, $env:SPRING_DATASOURCE_PASSWORD

# Attendre que le backend soit prêt
if (-not (Wait-ForService -Name "Backend Spring Boot" -Port 8081 -TimeoutSeconds 60)) {
    Write-Host "❌ Le backend n'a pas pu démarrer" -ForegroundColor Red
    Stop-Job $backendJob -ErrorAction SilentlyContinue
    Remove-Job $backendJob -ErrorAction SilentlyContinue
    exit 1
}

# Test du backend
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8081/api/parking/ping" -TimeoutSec 10
    Write-Host "✅ Backend opérationnel: $response" -ForegroundColor Green
}
catch {
    Write-Host "⚠️ Backend démarré mais ping échoué" -ForegroundColor Yellow
}

# Étape 4: Installation des dépendances et démarrage du Frontend
Write-Host "`n🎨 Démarrage du Frontend React..." -ForegroundColor Cyan
Set-Location $FRONTEND_DIR

# Vérifier si node_modules existe
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installation des dépendances npm..." -ForegroundColor Yellow
    try {
        npm install
        Write-Host "✅ Dépendances npm installées" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Erreur lors de l'installation des dépendances" -ForegroundColor Red
        exit 1
    }
}

# Vérifier si le port 3000 est libre
if (Test-Port -Port 3000) {
    Write-Host "⚠️ Port 3000 déjà utilisé. Le navigateur pourrait proposer un autre port." -ForegroundColor Yellow
}

# Démarrer le frontend
Write-Host "🚀 Démarrage du serveur de développement React..." -ForegroundColor Yellow
$frontendJob = Start-Job -ScriptBlock {
    param($FrontendDir)
    Set-Location $FrontendDir
    npm start
} -ArgumentList $FRONTEND_DIR

# Attendre un peu pour que React démarre
Start-Sleep -Seconds 5

# Attendre que le frontend soit prêt
if (Wait-ForService -Name "Frontend React" -Port 3000 -TimeoutSeconds 30) {
    Write-Host "✅ Frontend React opérationnel" -ForegroundColor Green
    
    # Ouvrir le navigateur
    Write-Host "🌐 Ouverture du navigateur..." -ForegroundColor Cyan
    Start-Process "http://localhost:3000"
} else {
    Write-Host "⚠️ Le frontend pourrait être sur un autre port. Vérifiez la console npm." -ForegroundColor Yellow
}

# Étape 5: Résumé et instructions
Write-Host "`n🎉 Application SpinUp démarrée avec succès!" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green
Write-Host "📱 Frontend React : http://localhost:3000" -ForegroundColor Cyan
Write-Host "⚙️ Backend API    : http://localhost:8081" -ForegroundColor Cyan
Write-Host "🐘 PostgreSQL     : localhost:5432 (via Docker)" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔍 URLs utiles:" -ForegroundColor White
Write-Host "   • Status API: http://localhost:8081/api/parking/status" -ForegroundColor Gray
Write-Host "   • Réservations: http://localhost:8081/api/parking/reservations" -ForegroundColor Gray
Write-Host ""
Write-Host "🛑 Pour arrêter l'application:" -ForegroundColor Yellow
Write-Host "   1. Appuyez sur Ctrl+C dans cette console" -ForegroundColor Gray
Write-Host "   2. Ou exécutez: docker compose down" -ForegroundColor Gray
Write-Host ""
Write-Host "📊 Vérifier la base de données:" -ForegroundColor White
Write-Host "   docker exec -it spinup-db-1 psql -U postgres -d parkandsee -c `"SELECT * FROM reservations;`"" -ForegroundColor Gray

# Attendre une entrée utilisateur pour arrêter
Write-Host "`n⏸️ Appuyez sur Entrée pour arrêter l'application..." -ForegroundColor Yellow
Read-Host

# Nettoyage
Write-Host "`n🧹 Arrêt de l'application..." -ForegroundColor Cyan

# Arrêter les jobs PowerShell
if ($backendJob) {
    Stop-Job $backendJob -ErrorAction SilentlyContinue
    Remove-Job $backendJob -ErrorAction SilentlyContinue
    Write-Host "✅ Backend arrêté" -ForegroundColor Green
}

if ($frontendJob) {
    Stop-Job $frontendJob -ErrorAction SilentlyContinue  
    Remove-Job $frontendJob -ErrorAction SilentlyContinue
    Write-Host "✅ Frontend arrêté" -ForegroundColor Green
}

# Arrêter les conteneurs Docker
Set-Location $PROJECT_ROOT
try {
    docker compose down
    Write-Host "✅ Conteneurs Docker arrêtés" -ForegroundColor Green
}
catch {
    Write-Host "⚠️ Erreur lors de l'arrêt des conteneurs" -ForegroundColor Yellow
}

Write-Host "`n👋 Application SpinUp arrêtée. À bientôt!" -ForegroundColor Green