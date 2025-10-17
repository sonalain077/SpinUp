# Script pour libérer le port 8081 (et autres ports communs)
# Utile quand les processus restent bloqués après un arrêt incorrect

param(
    [int]$Port = 8081,
    [switch]$Force
)

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

# Ports communs à vérifier
$commonPorts = @(3000, 5432, 8080, 8081, 8082, 9000)
Write-Host "`n🔍 Vérification des ports communs..." -ForegroundColor Cyan

foreach ($commonPort in $commonPorts) {
    $connections = Get-NetTCPConnection -LocalPort $commonPort -ErrorAction SilentlyContinue
    if ($connections) {
        $processIds = $connections | Select-Object -ExpandProperty OwningProcess -Unique
        $processNames = @()
        foreach ($processId in $processIds) {
            $proc = Get-Process -Id $processId -ErrorAction SilentlyContinue
            if ($proc) {
                $processNames += $proc.ProcessName
            }
        }
        Write-Host "  Port $commonPort : UTILISÉ par $($processNames -join ', ')" -ForegroundColor Red
    } else {
        Write-Host "  Port $commonPort : LIBRE" -ForegroundColor Green
    }
}

Write-Host "`n💡 Exemples d'utilisation:" -ForegroundColor Cyan
Write-Host "  .\free-port.ps1                    # Vérifier le port 8081" -ForegroundColor Yellow
Write-Host "  .\free-port.ps1 -Port 3000         # Vérifier un port spécifique" -ForegroundColor Yellow
Write-Host "  .\free-port.ps1 -Port 8081 -Force  # Arrêter les processus utilisant le port" -ForegroundColor Yellow