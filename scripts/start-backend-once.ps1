# ==========================================
# start-backend-once.ps1
# Démarre le backend Spring Boot UNE SEULE FOIS
# Si déjà lancé (port 8081 occupé), ne fait rien
# ==========================================

$PORT = 8081
$PROFILE = "dev"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  BACKEND SPRING BOOT - MODE DEV" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier si le port 8081 est déjà occupé
$portCheck = netstat -ano | Select-String ":$PORT " | Select-String "LISTENING"

if ($portCheck) {
    # Extraire le PID (renamed to avoid conflict with automatic $PID variable)
    $line = $portCheck.ToString().Trim()
    $parts = $line -split '\s+'
    $processPid = $parts[-1]
    
    Write-Host "✅ Backend already running on port $PORT (PID $processPid)" -ForegroundColor Green
    Write-Host "   No need to start again." -ForegroundColor Gray
    Write-Host ""
    Write-Host "   To stop it: taskkill /PID $processPid /F" -ForegroundColor Yellow
    Write-Host ""
    exit 0
}

Write-Host "🚀 Starting backend on port $PORT with profile '$PROFILE'..." -ForegroundColor Yellow
Write-Host ""

# Auto-detect Java 17 and Maven (same logic as start-backend.ps1)
$projectRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$possibleJavaHomes = @(
    "C:\Program Files\Microsoft\jdk-17.0.16.8-hotspot",
    "$env:USERPROFILE\tools\jdk-17.0.12+7",
    "C:\Program Files\Java\jdk-17",
    "C:\Program Files\Eclipse Adoptium\jdk-17",
    "C:\Program Files\Java\jdk-17.0.12",
    "C:\tools\jdk-17",
    "$env:JAVA_HOME"
)

$possibleMavenHomes = @(
    "$projectRoot\apache-maven-3.9.6",
    "$env:USERPROFILE\tools\apache-maven-3.9.9",
    "C:\Program Files\Apache\Maven",
    "C:\Program Files\Apache\apache-maven",
    "C:\tools\apache-maven",
    "C:\maven"
)

# Find Java 17
$javaFound = $false
$javaHome = $null
foreach ($javaPath in $possibleJavaHomes) {
    if ($javaPath -and (Test-Path "$javaPath\bin\java.exe")) {
        $versionOutput = & "$javaPath\bin\java.exe" -version 2>&1 | Select-Object -First 1
        if ($versionOutput -match "17") {
            $javaHome = $javaPath
            $javaFound = $true
            Write-Host "✅ Java 17 found: $javaPath" -ForegroundColor Green
            break
        }
    }
}

if (-not $javaFound) {
    Write-Host "❌ Java 17 not found!" -ForegroundColor Red
    exit 1
}

# Find Maven
$mavenFound = $false
$mavenCmd = $null

# Check if mvn is in PATH (same logic as start-backend.ps1)
try {
    $null = mvn -version 2>&1
    $mavenCmd = "mvn"
    $mavenFound = $true
    Write-Host "✅ Maven found in PATH" -ForegroundColor Green
} catch {
    # Search in local paths
    foreach ($mavenPath in $possibleMavenHomes) {
        if ($mavenPath -and (Test-Path "$mavenPath\bin\mvn.cmd")) {
            $mavenCmd = "$mavenPath\bin\mvn.cmd"
            $mavenFound = $true
            Write-Host "✅ Maven found: $mavenPath" -ForegroundColor Green
            break
        }
    }
}

if (-not $mavenFound) {
    Write-Host "❌ Maven not found!" -ForegroundColor Red
    exit 1
}

# Set JAVA_HOME for Maven
$env:JAVA_HOME = $javaHome
$env:PATH = "$javaHome\bin;$env:PATH"

Write-Host ""

# Start backend
Push-Location "$projectRoot\backend"

try {
    & $mavenCmd spring-boot:run "-Dspring-boot.run.profiles=$PROFILE" "-Dmaven.test.skip=true"
} finally {
    Pop-Location
}
