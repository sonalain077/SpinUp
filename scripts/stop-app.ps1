# SpinUp - Script d'arrêt
# Arrête tous les services de l'application
# Exécuter depuis le dossier scripts/ : .\stop-app.ps1

Write-Host "🛑 SpinUp - Arrêt de l'application" -ForegroundColor Red

# Répertoire racine du projet (parent du dossier scripts)
$PROJECT_ROOT = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)

# Arrêter les processus Java (Backend)
Write-Host "⚙️ Arrêt du Backend..." -ForegroundColor Yellow
$javaProcesses = Get-Process -Name "java" -ErrorAction SilentlyContinue
foreach ($process in $javaProcesses) {
    try {
        # Vérifier si c'est bien notre backend (ports 8081-8090)
        $connections = Get-NetTCPConnection -OwningProcess $process.Id -ErrorAction SilentlyContinue | Where-Object { $_.LocalPort -ge 8081 -and $_.LocalPort -le 8090 }
        if ($connections) {
            Stop-Process -Id $process.Id -Force
            Write-Host "  ✅ Backend arrêté (PID: $($process.Id), Port: $($connections[0].LocalPort))" -ForegroundColor Green
        }
    }
    catch {
        # Ignorer les erreurs
    }
}

# Arrêter les processus Node.js (Frontend)
Write-Host "🎨 Arrêt du Frontend..." -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
foreach ($process in $nodeProcesses) {
    try {
        # Vérifier si c'est bien notre frontend sur le port 3000
        $connections = Get-NetTCPConnection -OwningProcess $process.Id -LocalPort 3000 -ErrorAction SilentlyContinue
        if ($connections) {
            Stop-Process -Id $process.Id -Force
            Write-Host "  ✅ Frontend arrêté (PID: $($process.Id))" -ForegroundColor Green
        }
    }
    catch {
        # Ignorer les erreurs
    }
}

# Arrêter les conteneurs Docker
Write-Host "🐘 Arrêt de PostgreSQL..." -ForegroundColor Yellow
Set-Location $PROJECT_ROOT
try {
    docker compose down
    Write-Host "  ✅ Conteneurs Docker arrêtés" -ForegroundColor Green
}
catch {
    Write-Host "  ⚠️ Erreur lors de l'arrêt des conteneurs Docker" -ForegroundColor Yellow
}

# Nettoyage final des ports
Write-Host "🔍 Nettoyage final des ports..." -ForegroundColor Yellow

# Ports Backend (8081-8090)
for ($port = 8081; $port -le 8090; $port++) {
    try {
        $processPort = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($processPort) {
            Stop-Process -Id $processPort.OwningProcess -Force -ErrorAction SilentlyContinue
            Write-Host "  ✅ Processus sur port $port arrêté" -ForegroundColor Green
        }
    }
    catch { }
}

# Port Frontend (3000)
try {
    $process3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($process3000) {
        Stop-Process -Id $process3000.OwningProcess -Force -ErrorAction SilentlyContinue
        Write-Host "  ✅ Processus sur port 3000 arrêté" -ForegroundColor Green
    }
}
catch { }

Write-Host "`n✅ Application SpinUp complètement arrêtée" -ForegroundColor Green
Write-Host "📂 Tous les scripts sont dans le dossier scripts/" -ForegroundColor Cyan
Write-Host "👋 À bientôt!" -ForegroundColor Cyan