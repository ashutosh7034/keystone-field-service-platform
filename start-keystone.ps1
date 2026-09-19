# Project KEYSTONE - Unified Local Startup Script
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  Starting PROJECT KEYSTONE - Field Service Management" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

# 1. Environment Detection & Configuration
$jdkPaths = @(
    "C:\Program Files\Java\jdk-21.0.12",
    "C:\Program Files\Java\jdk-21",
    $env:JAVA_HOME
)

$detectedJdk = $null
foreach ($path in $jdkPaths) {
    if ($path -and (Test-Path $path)) {
        $detectedJdk = $path
        break
    }
}

if ($detectedJdk) {
    $env:JAVA_HOME = $detectedJdk
    $env:Path = "$detectedJdk\bin;" + $env:Path
    Write-Host "[OK] Using Java at: $detectedJdk" -ForegroundColor Green
} else {
    Write-Host "[INFO] Using default system Java from PATH." -ForegroundColor Yellow
}

# 2. Start Backend Server using Maven Wrapper
Write-Host "`n[1/2] Starting Spring Boot Backend (Port 8080)..." -ForegroundColor Yellow
$backendCmd = "cd backend; if ('$detectedJdk') { `$env:JAVA_HOME='$detectedJdk'; `$env:Path='$detectedJdk\bin;' + `$env:Path }; .\mvnw.cmd spring-boot:run"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCmd

# 3. Start Frontend Dev Server
Write-Host "[2/2] Starting Vite Frontend Server (Port 5173)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Write-Host "`n============================================================" -ForegroundColor Green
Write-Host "  KEYSTONE Platform is Launching!" -ForegroundColor Green
Write-Host "  - Frontend Portal: http://localhost:5173" -ForegroundColor White
Write-Host "  - Backend API:     http://localhost:8080" -ForegroundColor White
Write-Host "  - Swagger Docs:    http://localhost:8080/swagger-ui.html" -ForegroundColor White
Write-Host "============================================================" -ForegroundColor Green

