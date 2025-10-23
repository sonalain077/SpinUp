# Script PowerShell pour lancer le backend Spring Boot avec Maven
# Usage: .\start-backend.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DÉMARRAGE BACKEND PARK & SEE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier que Java est disponible
try {
    $javaVersion = java -version 2>&1 | Select-Object -First 1
    Write-Host "✅ Java détecté : $javaVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Java non trouvé !" -ForegroundColor Red
    Write-Host "   Installez Java 17 JDK et ajoutez-le au PATH" -ForegroundColor Yellow
    exit 1
}

# Vérifier que Maven est disponible
try {
    $mavenVersion = mvn -version 2>&1 | Select-Object -First 1
    Write-Host "✅ Maven détecté : $mavenVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Maven non trouvé !" -ForegroundColor Red
    Write-Host "   Installez Maven et ajoutez-le au PATH" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Aller dans le dossier backend
Set-Location backend

Write-Host "🚀 Lancement du backend sur http://localhost:8081" -ForegroundColor Yellow
Write-Host "   Appuyez sur Ctrl+C pour arrêter" -ForegroundColor Magenta
Write-Host ""

# Lancer Spring Boot
mvn spring-boot:run "-Dmaven.test.skip=true"
