# Script PowerShell complet pour lancer les tests unitaires du projet SpinUp
param(
    [string]$TestClass = "",
    [string]$TestMethod = "",
    [switch]$Verbose,
    [switch]$Coverage,
    [switch]$Integration,
    [switch]$Unit,
    [switch]$Quick,
    [switch]$FailFast
)

Write-Host "🧪 Tests Unitaires SpinUp - Park & See Backend" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green

# Configuration des couleurs
$successColor = "Green"
$errorColor = "Red"
$infoColor = "Cyan"
$warningColor = "Yellow"

# Déterminer le répertoire racine du projet (deux niveaux au-dessus)
$PROJECT_ROOT = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$BACKEND_DIR = Join-Path $PROJECT_ROOT "backend"

# Vérifier que nous avons accès au backend
if (-not (Test-Path (Join-Path $BACKEND_DIR "pom.xml"))) {
    Write-Host "❌ Erreur: Impossible de trouver le fichier pom.xml dans $BACKEND_DIR" -ForegroundColor $errorColor
    Write-Host "Répertoire racine du projet: $PROJECT_ROOT" -ForegroundColor $warningColor
    exit 1
}

# Aller dans le dossier backend
Push-Location $BACKEND_DIR

try {
    Write-Host "📂 Répertoire de travail: $BACKEND_DIR" -ForegroundColor $infoColor
    
    # Construction de la commande Maven
    $mavenCommand = "mvn test"
    
    # Options spécifiques selon les paramètres
    if ($TestClass) {
        $mavenCommand += " -Dtest=$TestClass"
        if ($TestMethod) {
            $mavenCommand += "#$TestMethod"
        }
        Write-Host "🎯 Lancement du test spécifique: $TestClass" -ForegroundColor $infoColor
    }
    elseif ($Integration) {
        $mavenCommand += " -Dtest=IntegrationTest"
        Write-Host "🔗 Lancement des tests d'intégration" -ForegroundColor $infoColor
    }
    elseif ($Unit) {
        $mavenCommand += " -Dtest=!IntegrationTest"
        Write-Host "⚡ Lancement des tests unitaires uniquement" -ForegroundColor $infoColor
    }
    elseif ($Quick) {
        $mavenCommand += " -Dtest=*ControllerTest,*ServiceTest"
        Write-Host "🏃 Lancement rapide: Controllers et Services" -ForegroundColor $infoColor
    }
    else {
        Write-Host "🌟 Lancement de tous les tests" -ForegroundColor $infoColor
    }

    # Options additionnelles
    if ($Verbose) {
        $mavenCommand += " -X"
        Write-Host "📊 Mode verbeux activé" -ForegroundColor $infoColor
    }

    if ($Coverage) {
        $mavenCommand += " jacoco:report"
        Write-Host "📈 Génération du rapport de couverture activée" -ForegroundColor $infoColor
    }

    if ($FailFast) {
        $mavenCommand += " -Dmaven.test.failure.ignore=false"
        Write-Host "⚡ Mode échec rapide activé" -ForegroundColor $infoColor
    }
    else {
        $mavenCommand += " -Dmaven.test.failure.ignore=true"
    }

    # Affichage de la commande qui sera exécutée
    Write-Host ""
    Write-Host "Commande Maven:" -ForegroundColor $infoColor
    Write-Host "$mavenCommand" -ForegroundColor $warningColor
    Write-Host ""

    # Affichage du début des tests
    Write-Host "🚀 Démarrage des tests..." -ForegroundColor $infoColor
    $startTime = Get-Date

    # Exécution de la commande Maven
    Invoke-Expression $mavenCommand

    # Capture du code de sortie
    $exitCode = $LASTEXITCODE
    $endTime = Get-Date
    $duration = $endTime - $startTime

    Write-Host ""
    Write-Host "=" * 50 -ForegroundColor Green

    # Affichage des résultats
    if ($exitCode -eq 0) {
        Write-Host "✅ TOUS LES TESTS ONT RÉUSSI!" -ForegroundColor $successColor
        Write-Host "⏱️ Durée: $($duration.TotalSeconds.ToString('F2')) secondes" -ForegroundColor $infoColor
    }
    else {
        Write-Host "❌ CERTAINS TESTS ONT ÉCHOUÉ" -ForegroundColor $errorColor
        Write-Host "⏱️ Durée: $($duration.TotalSeconds.ToString('F2')) secondes" -ForegroundColor $infoColor
        Write-Host ""
        Write-Host "📋 Pour voir les détails des échecs:" -ForegroundColor $warningColor
        Write-Host "   - Consultez les logs ci-dessus" -ForegroundColor $warningColor
        Write-Host "   - Ou exécutez: .\run-tests.ps1 -Verbose" -ForegroundColor $warningColor
    }

    # Informations sur les rapports
    Write-Host ""
    Write-Host "📊 Rapports générés:" -ForegroundColor $infoColor
    Write-Host "   - Surefire: target\surefire-reports\" -ForegroundColor $infoColor
    
    if ($Coverage) {
        Write-Host "   - Couverture: target\site\jacoco\index.html" -ForegroundColor $infoColor
    }

    # Statistiques rapides des tests
    Write-Host ""
    Write-Host "📈 Résumé rapide:" -ForegroundColor $infoColor
    $surefireReports = Get-ChildItem "target\surefire-reports\TEST-*.xml" -ErrorAction SilentlyContinue
    if ($surefireReports) {
        $totalTests = 0
        $failedTests = 0
        $skippedTests = 0
        
        foreach ($report in $surefireReports) {
            [xml]$xml = Get-Content $report.FullName
            $testSuite = $xml.testsuite
            $totalTests += [int]$testSuite.tests
            $failedTests += [int]$testSuite.failures + [int]$testSuite.errors
            $skippedTests += [int]$testSuite.skipped
        }
        
        $passedTests = $totalTests - $failedTests - $skippedTests
        
        Write-Host "   ✅ Réussis: $passedTests" -ForegroundColor $successColor
        if ($failedTests -gt 0) {
            Write-Host "   ❌ Échoués: $failedTests" -ForegroundColor $errorColor
        }
        if ($skippedTests -gt 0) {
            Write-Host "   ⏭️ Ignorés: $skippedTests" -ForegroundColor $warningColor
        }
        Write-Host "   📊 Total: $totalTests tests" -ForegroundColor $infoColor
    }

    Write-Host ""
    Write-Host "💡 Conseils d'utilisation:" -ForegroundColor $infoColor
    Write-Host "   .\run-tests.ps1                    # Tous les tests" -ForegroundColor $warningColor
    Write-Host "   .\run-tests.ps1 -Quick             # Tests rapides" -ForegroundColor $warningColor
    Write-Host "   .\run-tests.ps1 -Unit              # Tests unitaires seulement" -ForegroundColor $warningColor
    Write-Host "   .\run-tests.ps1 -Integration       # Tests d'intégration seulement" -ForegroundColor $warningColor
    Write-Host "   .\run-tests.ps1 -TestClass ParkingControllerTest" -ForegroundColor $warningColor
    Write-Host "   .\run-tests.ps1 -Coverage          # Avec couverture de code" -ForegroundColor $warningColor

    # Sortie avec le code d'erreur approprié
    exit $exitCode

} catch {
    Write-Host "❌ Erreur lors de l'exécution des tests:" -ForegroundColor $errorColor
    Write-Host $_.Exception.Message -ForegroundColor $errorColor
    exit 1
} finally {
    # Retour au répertoire initial
    Pop-Location
}