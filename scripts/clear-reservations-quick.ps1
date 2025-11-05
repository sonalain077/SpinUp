# ============================================================================
# Script rapide pour vider la base de données des réservations (SANS CONFIRMATION)
# ============================================================================
# Usage: .\scripts\clear-reservations-quick.ps1
# ⚠️  ATTENTION: Ce script supprime IMMÉDIATEMENT toutes les réservations !
# ============================================================================

Write-Host ""
Write-Host "🗑️  Nettoyage rapide de la base de données..." -ForegroundColor Cyan

# Vérifier que Docker est en cours d'exécution
$dockerStatus = docker ps 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker n'est pas en cours d'exécution" -ForegroundColor Red
    exit 1
}

# Vérifier que le conteneur existe
$dbContainer = docker ps --filter "name=parkandsee-db" --format "{{.Names}}"
if (-not $dbContainer) {
    Write-Host "❌ Le conteneur 'parkandsee-db' n'est pas en cours d'exécution" -ForegroundColor Red
    exit 1
}

# Supprimer toutes les réservations
docker exec parkandsee-db psql -U postgres -d parkandsee -c "DELETE FROM reservations;" 2>&1 | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Base de données vidée avec succès !" -ForegroundColor Green
    
    # Compter pour vérifier
    $count = docker exec parkandsee-db psql -U postgres -d parkandsee -t -c "SELECT COUNT(*) FROM reservations;" 2>&1 | Where-Object { $_ -match '^\s*\d+' }
    Write-Host "📊 Réservations restantes: $($count.Trim())" -ForegroundColor Cyan
} else {
    Write-Host "❌ Erreur lors du nettoyage" -ForegroundColor Red
    exit 1
}

Write-Host ""
