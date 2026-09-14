# Project KEYSTONE - Unified Local Startup Script
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  Starting PROJECT KEYSTONE - Field Service Management" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

# 1. Environment Detection & Configuration
$jdkPath = "C:\Program Files\Java\jdk-21.0.12"
$mvnPath = "C:\Users\Ashutosh Pandey\Downloads\OneConnect---Web-Application\apache-maven-3.9.6\bin"

if (Test-Path $jdkPath) {
    $env:JAVA_HOME = $jdkPath
    $env:Path = "$jdkPath\bin;$mvnPath;" + $env:Path
    Write-Host "[OK] Configured Java 21 environment." -ForegroundColor Green
} else {
    Write-Host "[INFO] Using default system Java." -ForegroundColor Yellow
}

# 2. Start Backend Server
Write-Host "`n[1/2] Starting Spring Boot Backend (Port 8080)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; `$env:JAVA_HOME='$jdkPath'; `$env:Path='$jdkPath\bin;$mvnPath;' + `$env:Path; mvn spring-boot:run"

# 3. Start Frontend Dev Server
Write-Host "[2/2] Starting Vite Frontend Server (Port 5173)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Write-Host "`n============================================================" -ForegroundColor Green
Write-Host "  KEYSTONE Platform is Launching!" -ForegroundColor Green
Write-Host "  - Frontend Portal: http://localhost:5173" -ForegroundColor White
Write-Host "  - Backend API:     http://localhost:8080" -ForegroundColor White
Write-Host "  - Swagger Docs:    http://localhost:8080/swagger-ui.html" -ForegroundColor White
Write-Host "============================================================" -ForegroundColor Green
