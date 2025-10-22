# SpinUp - Script d'arrêt
# Arrête tous les services de l'application

Write-Host "🛑 SpinUp - Arrêt de l'application" -ForegroundColor Red

$PROJECT_ROOT = Split-Path -Parent $MyInvocation.MyCommand.Path

# Arrêter les processus Java (Backend)
Write-Host "⚙️ Arrêt du Backend..." -ForegroundColor Yellow
$javaProcesses = Get-Process -Name "java" -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowTitle -like "*spring-boot*" -or $_.ProcessName -eq "java" }
foreach ($process in $javaProcesses) {
    try {
        # Vérifier si c'est bien notre backend sur le port 8081
        $connections = Get-NetTCPConnection -OwningProcess $process.Id -LocalPort 8081 -ErrorAction SilentlyContinue
        if ($connections) {
            Stop-Process -Id $process.Id -Force
            Write-Host "  ✅ Backend arrêté (PID: $($process.Id))" -ForegroundColor Green
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
    Write-Host "  ⚠️ Erreur lors de l'arrêt des conteneurs" -ForegroundColor Yellow
}

# Force kill des processus sur les ports si nécessaire
Write-Host "🔍 Vérification des ports..." -ForegroundColor Yellow

# Port 8081 (Backend)
try {
    $process8081 = Get-NetTCPConnection -LocalPort 8081 -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($process8081) {
        Stop-Process -Id $process8081.OwningProcess -Force -ErrorAction SilentlyContinue
        Write-Host "  ✅ Processus sur port 8081 arrêté" -ForegroundColor Green
    }
}
catch { }

# Port 3000 (Frontend)
try {
    $process3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($process3000) {
        Stop-Process -Id $process3000.OwningProcess -Force -ErrorAction SilentlyContinue
        Write-Host "  ✅ Processus sur port 3000 arrêté" -ForegroundColor Green
    }
}
catch { }

Write-Host "`n✅ Application SpinUp arrêtée" -ForegroundColor Green
Write-Host "👋 À bientôt!" -ForegroundColor Cyan