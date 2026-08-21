@echo off
REM ============================================================
REM  F1 GridScope — Windows Launcher
REM ============================================================
setlocal

set "JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-21.0.11.10-hotspot"
set "JAVA21=%JAVA_HOME%\bin\java.exe"
set "PATH=%JAVA_HOME%\bin;%PATH%"
set "SCRIPT_DIR=%~dp0"
set "JAR=%SCRIPT_DIR%f1-gridscope.jar"

REM Build fat JAR if it doesn't exist yet
if not exist "%JAR%" (
    echo [F1 GridScope] JAR not found — building now...
    cd /d "%SCRIPT_DIR%"
    call mvn package -DskipTests --no-transfer-progress
    if errorlevel 1 (
        echo [ERROR] Maven build failed.
        pause
        exit /b 1
    )
)

echo [F1 GridScope] Starting with Java 21...
"%JAVA21%" -jar "%JAR%"

if errorlevel 1 (
    echo.
    echo [F1 GridScope] Exited with an error.
    pause
)
endlocal
