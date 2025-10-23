# SpinUp - Script de démarrage complet
# Démarre Postgres (Docker), Backend (Spring Boot) et Frontend (React)
# Exécuter depuis le dossier scripts/ : .\start-app.ps1

Write-Host "🚀 SpinUp - Démarrage de l'application complète" -ForegroundColor Green
Write-Host "==============================================" -ForegroundColor Green

# Répertoire racine du projet (parent du dossier scripts)
$PROJECT_ROOT = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
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
    
    Write-Host "⚠️ Timeout: $Name n'a pas répondu dans les $TimeoutSeconds secondes" -ForegroundColor Yellow
    return $false
}

# Vérifications préalables
Write-Host "🔍 Vérifications préalables..." -ForegroundColor Cyan

# Vérifier Docker
try {
    docker --version | Out-Null
    Write-Host "✅ Docker détecté" -ForegroundColor Green
}
catch {
    Write-Host "❌ Docker non trouvé. Veuillez installer Docker Desktop." -ForegroundColor Red
    exit 1
}

# Vérifier Java
try {
    java -version 2>&1 | Out-Null
    Write-Host "✅ Java détecté" -ForegroundColor Green
}
catch {
    Write-Host "❌ Java non trouvé. Veuillez installer Java JDK 17+." -ForegroundColor Red
    exit 1
}

# Vérifier Maven
try {
    mvn -version | Out-Null
    Write-Host "✅ Maven détecté" -ForegroundColor Green
}
catch {
    Write-Host "❌ Maven non trouvé. Veuillez installer Apache Maven." -ForegroundColor Red
    exit 1
}

# Vérifier Node.js
try {
    node --version | Out-Null
    Write-Host "✅ Node.js détecté" -ForegroundColor Green
}
catch {
    Write-Host "❌ Node.js non trouvé. Veuillez installer Node.js." -ForegroundColor Red
    exit 1
}

# Déterminer le port backend
$backendPort = 8081
if (Test-Port $backendPort) {
    Write-Host "⚠️ Port $backendPort occupé, recherche d'un port libre..." -ForegroundColor Yellow
    $backendPort = Find-FreePort -StartPort 8081
    Write-Host "✅ Port libre trouvé: $backendPort" -ForegroundColor Green
}

Write-Host "`n🚀 Démarrage des services..." -ForegroundColor Green

# 1. Démarrer PostgreSQL
Write-Host "🐘 Démarrage de PostgreSQL..." -ForegroundColor Cyan
Set-Location $PROJECT_ROOT
docker compose up -d

# Attendre que PostgreSQL soit prêt
if (Wait-ForService -Name "PostgreSQL" -Port 5432 -TimeoutSeconds 30) {
    Write-Host "✅ PostgreSQL opérationnel" -ForegroundColor Green
} else {
    Write-Host "⚠️ PostgreSQL peut prendre plus de temps. Continuons..." -ForegroundColor Yellow
}

# 2. Démarrer le Backend
Write-Host "`n⚙️ Démarrage du Backend sur le port $backendPort..." -ForegroundColor Cyan
$env:SPRING_DATASOURCE_URL = "jdbc:postgresql://localhost:5432/parkandsee"
$env:SPRING_DATASOURCE_USERNAME = "postgres" 
$env:SPRING_DATASOURCE_PASSWORD = "example"
$env:SERVER_PORT = $backendPort

Set-Location $BACKEND_DIR
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Push-Location '$BACKEND_DIR'; mvn spring-boot:run" -WindowStyle Normal

# Attendre que le Backend soit prêt
if (Wait-ForService -Name "Backend Spring Boot" -Port $backendPort -TimeoutSeconds 60) {
    Write-Host "✅ Backend opérationnel sur le port $backendPort" -ForegroundColor Green
} else {
    Write-Host "⚠️ Le Backend peut prendre plus de temps. Continuons..." -ForegroundColor Yellow
}

# 3. Démarrer le Frontend
Write-Host "`n🎨 Démarrage du Frontend..." -ForegroundColor Cyan
Set-Location $FRONTEND_DIR

# Vérifier si node_modules existe
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installation des dépendances npm..." -ForegroundColor Yellow
    npm install
}

Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm start" -WindowStyle Normal

# Attendre que le Frontend soit prêt
if (Wait-ForService -Name "Frontend React" -Port 3000 -TimeoutSeconds 60) {
    Write-Host "✅ Frontend opérationnel" -ForegroundColor Green
} else {
    Write-Host "⚠️ Le Frontend peut prendre plus de temps. Continuons..." -ForegroundColor Yellow
}

# Résumé final
Write-Host "`n🎉 Démarrage terminé!" -ForegroundColor Green
Write-Host "=====================" -ForegroundColor Green
Write-Host "📱 Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "⚙️ Backend:  http://localhost:$backendPort" -ForegroundColor Cyan
Write-Host "🐘 Database: PostgreSQL sur localhost:5432" -ForegroundColor Cyan

if ($backendPort -ne 8081) {
    Write-Host "`n⚠️ IMPORTANT: Le backend utilise le port $backendPort" -ForegroundColor Yellow
    Write-Host "💡 Mettez à jour vos appels API si nécessaire" -ForegroundColor Yellow
}

Write-Host "`n💡 Commandes utiles:" -ForegroundColor Cyan
Write-Host "  .\stop-app.ps1     - Arrêter l'application" -ForegroundColor Yellow
Write-Host "  .\free-port.ps1    - Gérer les conflits de ports" -ForegroundColor Yellow
Write-Host "  .\run-tests.ps1    - Lancer les tests unitaires" -ForegroundColor Yellow

# Ouvrir le navigateur
Write-Host "`n🌐 Ouverture du navigateur..." -ForegroundColor Cyan
Start-Process "http://localhost:3000"

Write-Host "`n✅ Application SpinUp prête à l'emploi!" -ForegroundColor Green