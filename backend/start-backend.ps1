# Configuration des outils Java et Maven
$env:JAVA_HOME = "C:\Users\kerie\tools\jdk-17.0.12+7"
$env:MAVEN_HOME = "C:\Users\kerie\tools\apache-maven-3.9.9"
$env:PATH = "$env:JAVA_HOME\bin;$env:MAVEN_HOME\bin;$env:PATH"

Write-Host "Configuration des outils..."
Write-Host "JAVA_HOME: $env:JAVA_HOME"
Write-Host "MAVEN_HOME: $env:MAVEN_HOME"

# Vérifier Java et Maven
Write-Host "`nVérification de Java:"
& java -version

Write-Host "`nVérification de Maven:"
& mvn -version

Write-Host "`nLancement du backend Spring Boot..."
Write-Host "Le serveur sera disponible sur: http://localhost:8081"
Write-Host "Base de données: H2 en mémoire (mode développement)"
Write-Host ""

# Lancer l'application
& mvn spring-boot:run