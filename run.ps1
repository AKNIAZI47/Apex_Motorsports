# ============================================================
#  F1 GridScope — PowerShell Launcher
#  Run with:  .\run.ps1
#  Or right-click → "Run with PowerShell"
# ============================================================

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$jar = Join-Path $scriptDir "f1-gridscope.jar"
$javaHome = 'C:\Program Files\Eclipse Adoptium\jdk-21.0.11.10-hotspot'
$java21 = Join-Path $javaHome 'bin\java.exe'
$env:JAVA_HOME = $javaHome
$env:Path = "$javaHome\bin;$env:Path"

# Build the fat JAR if it doesn't exist, or if the source changed
if (-not (Test-Path $jar)) {
    Write-Host "[F1 GridScope] JAR not found — building now..." -ForegroundColor Cyan
    Push-Location $scriptDir
    try {
        & $java21 -version
        mvn package -DskipTests --no-transfer-progress
        if ($LASTEXITCODE -ne 0) {
            Write-Host "[ERROR] Maven build failed." -ForegroundColor Red
            Read-Host "Press Enter to exit"
            exit 1
        }
    } finally {
        Pop-Location
    }
}

Write-Host "[F1 GridScope] Starting with Java 21..." -ForegroundColor Green
& $java21 -jar $jar

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n[F1 GridScope] Exited with an error." -ForegroundColor Red
    Read-Host "Press Enter to exit"
}
