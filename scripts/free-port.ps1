# Script pour libérer des ports (utile pour résoudre les conflits)
# Exécuter depuis le dossier scripts/ : .\free-port.ps1

param(
    [int]$Port = 8081,
    [switch]$Force,
    [switch]$All
)

Write-Host "🔍 SpinUp - Gestion des ports" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan

if ($All) {
    Write-Host "🧹 Nettoyage de tous les ports SpinUp..." -ForegroundColor Yellow
    $portsToClean = @(3000, 8081, 8082, 8083, 8084, 5432)
    
    foreach ($portToClean in $portsToClean) {
        $connections = Get-NetTCPConnection -LocalPort $portToClean -ErrorAction SilentlyContinue
        if ($connections) {
            Write-Host "🔧 Libération du port $portToClean..." -ForegroundColor Yellow
            foreach ($conn in $connections) {
                try {
                    Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
                    Write-Host "  ✅ Processus sur port $portToClean arrêté" -ForegroundColor Green
                }
                catch {
                    Write-Host "  ⚠️ Erreur sur port $portToClean" -ForegroundColor Yellow
                }
            }
        }
    }
    Write-Host "✅ Nettoyage terminé" -ForegroundColor Green
    return
}

Write-Host "🔍 Recherche des processus utilisant le port $Port..." -ForegroundColor Cyan

# Trouver les processus utilisant le port
$processes = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue

if ($processes) {
    Write-Host "📋 Processus trouvés:" -ForegroundColor Yellow
    
    foreach ($process in $processes) {
        $processId = $process.OwningProcess
        $processInfo = Get-Process -Id $processId -ErrorAction SilentlyContinue
        
        if ($processInfo) {
            Write-Host "  - PID: $processId | Nom: $($processInfo.ProcessName) | Port: $($process.LocalPort)" -ForegroundColor White
            
            if ($Force) {
                try {
                    Stop-Process -Id $processId -Force
                    Write-Host "    ✅ Processus $processId arrêté" -ForegroundColor Green
                }
                catch {
                    Write-Host "    ❌ Erreur lors de l'arrêt du processus $processId : $($_.Exception.Message)" -ForegroundColor Red
                }
            }
        }
    }
    
    if (-not $Force) {
        Write-Host "`n💡 Utilisez -Force pour arrêter automatiquement ces processus" -ForegroundColor Yellow
        Write-Host "   Exemple: .\free-port.ps1 -Port $Port -Force" -ForegroundColor Yellow
    }
} else {
    Write-Host "✅ Aucun processus trouvé utilisant le port $Port" -ForegroundColor Green
}

# Ports SpinUp à vérifier
$spinUpPorts = @(
    @{Port=3000; Service="Frontend React"},
    @{Port=8081; Service="Backend Spring Boot"},
    @{Port=8082; Service="Backend (port alternatif)"},
    @{Port=8083; Service="Backend (port alternatif)"},
    @{Port=5432; Service="PostgreSQL"},
    @{Port=8080; Service="Port commun"},
    @{Port=9000; Service="Port commun"}
)

Write-Host "`n🔍 État des ports SpinUp..." -ForegroundColor Cyan

foreach ($portInfo in $spinUpPorts) {
    $connections = Get-NetTCPConnection -LocalPort $portInfo.Port -ErrorAction SilentlyContinue
    if ($connections) {
        $processIds = $connections | Select-Object -ExpandProperty OwningProcess -Unique
        $processNames = @()
        foreach ($processId in $processIds) {
            $proc = Get-Process -Id $processId -ErrorAction SilentlyContinue
            if ($proc) {
                $processNames += $proc.ProcessName
            }
        }
        Write-Host "  Port $($portInfo.Port) ($($portInfo.Service)) : UTILISÉ par $($processNames -join ', ')" -ForegroundColor Red
    } else {
        Write-Host "  Port $($portInfo.Port) ($($portInfo.Service)) : LIBRE" -ForegroundColor Green
    }
}

Write-Host "`n💡 Exemples d'utilisation:" -ForegroundColor Cyan
Write-Host "  .\free-port.ps1                    # Vérifier le port 8081" -ForegroundColor Yellow
Write-Host "  .\free-port.ps1 -Port 3000         # Vérifier un port spécifique" -ForegroundColor Yellow
Write-Host "  .\free-port.ps1 -Port 8081 -Force  # Arrêter les processus utilisant le port" -ForegroundColor Yellow
Write-Host "  .\free-port.ps1 -All -Force        # Nettoyer tous les ports SpinUp" -ForegroundColor Yellow

Write-Host "`n🛠️ Scripts disponibles dans le dossier scripts/:" -ForegroundColor Cyan
Write-Host "  .\start-quick.ps1   # Démarrage rapide" -ForegroundColor Yellow
Write-Host "  .\start-app.ps1     # Démarrage complet" -ForegroundColor Yellow  
Write-Host "  .\stop-app.ps1      # Arrêt de l'application" -ForegroundColor Yellow