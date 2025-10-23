# Script PowerShell pour lancer le backend Spring Boot avec Maven
# Usage: .\start-backend.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DÉMARRAGE BACKEND PARK & SEE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configuration des chemins Java et Maven
$env:JAVA_HOME = "C:\Users\kerie\tools\jdk-17.0.12+7"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"
$MAVEN_CMD = "C:\Users\kerie\tools\apache-maven-3.9.9\bin\mvn.cmd"

# Aller dans le dossier backend
Set-Location backend

Write-Host "✅ Java configuré" -ForegroundColor Green
java -version
Write-Host ""
Write-Host "🚀 Lancement du backend sur http://localhost:8081" -ForegroundColor Yellow
Write-Host "   Appuyez sur Ctrl+C pour arrêter" -ForegroundColor Magenta
Write-Host ""

# Lancer Spring Boot
& $MAVEN_CMD spring-boot:run "-Dmaven.test.skip=true"
