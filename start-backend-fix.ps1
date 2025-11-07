# Script de lancement du backend - version corrigée
Write-Host "=== Lancement du Backend Park & See ===" -ForegroundColor Green

# Variables d'environnement Java/Maven
$env:JAVA_HOME = "C:\Users\kerie\tools\jdk-17.0.12+7"
$env:MAVEN_HOME = "C:\Users\kerie\tools\apache-maven-3.9.9"
$env:PATH = "$env:JAVA_HOME\bin;$env:MAVEN_HOME\bin;$env:PATH"

# Aller dans le dossier backend
Set-Location -Path "$PSScriptRoot\backend"

Write-Host "`nRépertoire actuel: $PWD" -ForegroundColor Cyan
Write-Host "Démarrage de Spring Boot en mode dev..." -ForegroundColor Yellow
Write-Host "Port: 8081" -ForegroundColor Yellow
Write-Host "`nAppuyez sur Ctrl+C pour arrêter le serveur`n" -ForegroundColor Red

# Lancer Maven
mvn spring-boot:run "-Dspring-boot.run.profiles=dev"
