# Script simple pour lancer les tests unitaires du projet SpinUp
param(
    [string]$TestClass = ""
)

Write-Host "🧪 Tests Unitaires SpinUp - Park & See Backend" -ForegroundColor Green

# Déterminer le répertoire racine du projet (deux niveaux au-dessus)
$PROJECT_ROOT = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$BACKEND_DIR = Join-Path $PROJECT_ROOT "backend"

# Vérifier que nous avons accès au backend
if (-not (Test-Path (Join-Path $BACKEND_DIR "pom.xml"))) {
    Write-Host "❌ Erreur: Impossible de trouver le fichier pom.xml dans $BACKEND_DIR" -ForegroundColor Red
    Write-Host "Répertoire racine du projet: $PROJECT_ROOT" -ForegroundColor Yellow
    exit 1
}

# Aller dans le dossier backend
Push-Location $BACKEND_DIR

try {
    # Construction de la commande Maven
    $mavenCommand = "mvn test"

    if ($TestClass) {
        $mavenCommand += " -Dtest=$TestClass"
        Write-Host "🎯 Lancement du test spécifique: $TestClass" -ForegroundColor Cyan
    } else {
        Write-Host "🌟 Lancement de tous les tests" -ForegroundColor Cyan
    }

    Write-Host ""
    Write-Host "Répertoire de travail: $BACKEND_DIR" -ForegroundColor Yellow
    Write-Host "Commande Maven: $mavenCommand" -ForegroundColor Yellow
    Write-Host ""

    # Exécution de la commande Maven
    Write-Host "🚀 Démarrage des tests..." -ForegroundColor Cyan
    $startTime = Get-Date

    Invoke-Expression $mavenCommand

    $exitCode = $LASTEXITCODE
    $endTime = Get-Date
    $duration = $endTime - $startTime

    Write-Host ""
    Write-Host "==================================================" -ForegroundColor Green

    if ($exitCode -eq 0) {
        Write-Host "✅ TOUS LES TESTS ONT RÉUSSI!" -ForegroundColor Green
    } else {
        Write-Host "❌ CERTAINS TESTS ONT ÉCHOUÉ" -ForegroundColor Red
    }

    Write-Host "⏱️ Durée: $($duration.TotalSeconds.ToString('F2')) secondes" -ForegroundColor Cyan

    Write-Host ""
    Write-Host "💡 Exemples d'utilisation:" -ForegroundColor Cyan
    Write-Host "   .\run-tests-simple.ps1                              # Tous les tests" -ForegroundColor Yellow
    Write-Host "   .\run-tests-simple.ps1 -TestClass ParkingControllerTest  # Test spécifique" -ForegroundColor Yellow
    
    exit $exitCode
    
} catch {
    Write-Host "❌ Erreur lors de l'exécution des tests:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
} finally {
    # Retour au répertoire initial
    Pop-Location
}