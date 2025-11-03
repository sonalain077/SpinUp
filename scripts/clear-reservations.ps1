# ============================================================================
# Script pour vider la base de données des réservations
# ============================================================================
# Usage: .\scripts\clear-reservations.ps1
# ============================================================================

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  🗑️  NETTOYAGE DE LA BASE DE DONNÉES - RÉSERVATIONS" -ForegroundColor Yellow
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Vérifier que Docker est en cours d'exécution
$dockerStatus = docker ps 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur: Docker n'est pas en cours d'exécution" -ForegroundColor Red
    exit 1
}

# Vérifier que le conteneur de base de données existe
$dbContainer = docker ps --filter "name=parkandsee-db" --format "{{.Names}}"
if (-not $dbContainer) {
    Write-Host "❌ Erreur: Le conteneur 'parkandsee-db' n'est pas en cours d'exécution" -ForegroundColor Red
    Write-Host "💡 Démarrez l'application avec: docker-compose up -d" -ForegroundColor Yellow
    exit 1
}

# Compter les réservations actuelles
Write-Host "📊 Comptage des réservations actuelles..." -ForegroundColor Cyan
$countQuery = "SELECT COUNT(*) FROM reservations;"
$currentCount = docker exec parkandsee-db psql -U postgres -d parkandsee -t -c $countQuery 2>&1 | Where-Object { $_ -match '^\s*\d+' }
$currentCount = $currentCount.Trim()

Write-Host "   Nombre de réservations: $currentCount" -ForegroundColor White
Write-Host ""

if ($currentCount -eq "0") {
    Write-Host "ℹ️  La base de données est déjà vide !" -ForegroundColor Green
    Write-Host ""
    exit 0
}

# Demander confirmation
Write-Host "⚠️  ATTENTION: Cette action va supprimer TOUTES les réservations !" -ForegroundColor Yellow
Write-Host ""
$confirmation = Read-Host "Voulez-vous continuer ? (Oui/Non)"

if ($confirmation -ne "Oui" -and $confirmation -ne "oui" -and $confirmation -ne "O" -and $confirmation -ne "o") {
    Write-Host ""
    Write-Host "❌ Opération annulée" -ForegroundColor Yellow
    Write-Host ""
    exit 0
}

Write-Host ""
Write-Host "🗑️  Suppression de toutes les réservations..." -ForegroundColor Cyan

# Exécuter la commande SQL pour vider la table
$deleteQuery = "DELETE FROM reservations;"
docker exec parkandsee-db psql -U postgres -d parkandsee -c $deleteQuery 2>&1 | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Toutes les réservations ont été supprimées avec succès !" -ForegroundColor Green
    Write-Host ""
    
    # Vérifier le résultat
    $newCount = docker exec parkandsee-db psql -U postgres -d parkandsee -t -c $countQuery 2>&1 | Where-Object { $_ -match '^\s*\d+' }
    $newCount = $newCount.Trim()
    Write-Host "📊 Nombre de réservations restantes: $newCount" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "💡 Conseil: Vous pouvez maintenant créer de nouvelles réservations" -ForegroundColor Yellow
    Write-Host "   depuis l'interface: http://localhost:5173/" -ForegroundColor White
} else {
    Write-Host "❌ Erreur lors de la suppression des réservations" -ForegroundColor Red
    Write-Host ""
    exit 1
}

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
