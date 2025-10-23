# Script PowerShell pour lancer le backend Spring Boot avec Maven
# Usage: .\start-backend.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DÉMARRAGE BACKEND PARK & SEE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Liste de chemins Java 17 possibles (communes + utilisateur local)
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$possibleJavaHomes = @(
    "C:\Program Files\Microsoft\jdk-17.0.16.8-hotspot",
    "$env:USERPROFILE\tools\jdk-17.0.12+7",
    "C:\Program Files\Java\jdk-17",
    "C:\Program Files\Eclipse Adoptium\jdk-17",
    "C:\Program Files\Java\jdk-17.0.12",
    "C:\tools\jdk-17",
    "$env:JAVA_HOME"
)

# Liste de chemins Maven possibles
$possibleMavenHomes = @(
    "$projectRoot\apache-maven-3.9.6",
    "$env:USERPROFILE\tools\apache-maven-3.9.9",
    "C:\Program Files\Apache\Maven",
    "C:\Program Files\Apache\apache-maven",
    "C:\tools\apache-maven",
    "C:\maven"
)

# Chercher Java 17
$javaFound = $false
$javaCmd = $null
$javaHome = $null

foreach ($javaPath in $possibleJavaHomes) {
    if ($javaPath -and (Test-Path "$javaPath\bin\java.exe")) {
        # Vérifier la version
        $versionOutput = & "$javaPath\bin\java.exe" -version 2>&1 | Select-Object -First 1
        if ($versionOutput -match "17") {
            $javaCmd = "$javaPath\bin\java.exe"
            $javaHome = $javaPath
            $javaFound = $true
            Write-Host "✅ Java 17 trouvé : $javaPath" -ForegroundColor Green
            break
        }
    }
}

if (-not $javaFound) {
    Write-Host "❌ Java 17 JDK introuvable !" -ForegroundColor Red
    Write-Host "   Vérifiez que Java 17 est installé dans un des emplacements:" -ForegroundColor Yellow
    Write-Host "   - $env:USERPROFILE\tools\jdk-17.x" -ForegroundColor Yellow
    Write-Host "   - C:\Program Files\Java\jdk-17" -ForegroundColor Yellow
    Write-Host "   - C:\Program Files\Eclipse Adoptium\jdk-17" -ForegroundColor Yellow
    exit 1
}

# Chercher Maven
$mavenFound = $false
$mavenCmd = $null

# D'abord vérifier si mvn est dans le PATH
try {
    $null = mvn -version 2>&1
    $mavenCmd = "mvn"
    $mavenFound = $true
    Write-Host "✅ Maven trouvé dans le PATH" -ForegroundColor Green
} catch {
    # Chercher dans les emplacements locaux
    foreach ($mavenPath in $possibleMavenHomes) {
        if ($mavenPath -and (Test-Path "$mavenPath\bin\mvn.cmd")) {
            $mavenCmd = "$mavenPath\bin\mvn.cmd"
            $mavenFound = $true
            Write-Host "✅ Maven trouvé : $mavenPath" -ForegroundColor Green
            break
        }
    }
}

if (-not $mavenFound) {
    Write-Host "❌ Maven introuvable !" -ForegroundColor Red
    Write-Host "   Installez Maven ou ajoutez-le au PATH" -ForegroundColor Yellow
    Write-Host "   Emplacements vérifiés:" -ForegroundColor Yellow
    foreach ($path in $possibleMavenHomes) {
        Write-Host "   - $path" -ForegroundColor Yellow
    }
    exit 1
}

# Configurer JAVA_HOME pour Maven
$env:JAVA_HOME = $javaHome
$env:PATH = "$javaHome\bin;$env:PATH"

Write-Host ""

# Aller dans le dossier backend
Set-Location backend

Write-Host "🚀 Lancement du backend sur http://localhost:8081" -ForegroundColor Yellow
Write-Host "   Appuyez sur Ctrl+C pour arrêter" -ForegroundColor Magenta
Write-Host ""

# Lancer Spring Boot
& $mavenCmd spring-boot:run "-Dmaven.test.skip=true"
