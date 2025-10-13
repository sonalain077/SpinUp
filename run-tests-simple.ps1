# Script simple pour lancer les tests unitaires du projet SpinUp
param(
    [string]$TestClass = ""
)

Write-Host "🧪 Tests Unitaires SpinUp - Park & See Backend" -ForegroundColor Green

# Verifier que nous sommes dans le bon repertoire
if (-not (Test-Path "backend\pom.xml")) {
    Write-Host "❌ Erreur: Veuillez executer ce script depuis le repertoire racine du projet SpinUp" -ForegroundColor Red
    exit 1
}

# Aller dans le dossier backend
Set-Location "backend"

# Construction de la commande Maven
$mavenCommand = "mvn test"

if ($TestClass) {
    $mavenCommand += " -Dtest=$TestClass"
    Write-Host "🎯 Lancement du test specifique: $TestClass" -ForegroundColor Cyan
} else {
    Write-Host "🌟 Lancement de tous les tests" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "Commande Maven: $mavenCommand" -ForegroundColor Yellow
Write-Host ""

# Execution de la commande Maven
Write-Host "🚀 Demarrage des tests..." -ForegroundColor Cyan
$startTime = Get-Date

Invoke-Expression $mavenCommand

$exitCode = $LASTEXITCODE
$endTime = Get-Date
$duration = $endTime - $startTime

Write-Host ""
Write-Host "==================================================" -ForegroundColor Green

if ($exitCode -eq 0) {
    Write-Host "✅ TOUS LES TESTS ONT REUSSI!" -ForegroundColor Green
} else {
    Write-Host "❌ CERTAINS TESTS ONT ECHOUE" -ForegroundColor Red
}

Write-Host "⏱️ Duree: $($duration.TotalSeconds.ToString('F2')) secondes" -ForegroundColor Cyan

Write-Host ""
Write-Host "💡 Exemples d'utilisation:" -ForegroundColor Cyan
Write-Host "   .\run-tests.ps1                              # Tous les tests" -ForegroundColor Yellow
Write-Host "   .\run-tests.ps1 -TestClass ParkingControllerTest  # Test specifique" -ForegroundColor Yellow

# Retour au repertoire initial
Set-Location ".."

exit $exitCode