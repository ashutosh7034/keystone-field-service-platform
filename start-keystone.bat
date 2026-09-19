@echo off
title Project KEYSTONE Launcher
echo ============================================================
echo   Starting PROJECT KEYSTONE - Field Service Management
echo ============================================================

REM Check if standard JDK 21 path exists, otherwise use default JAVA_HOME or PATH
if exist "C:\Program Files\Java\jdk-21.0.12" (
    set "JAVA_HOME=C:\Program Files\Java\jdk-21.0.12"
    set "PATH=C:\Program Files\Java\jdk-21.0.12\bin;%PATH%"
)

echo [1/2] Starting Spring Boot Backend on http://localhost:8080 ...
start "Keystone Backend" cmd /k "cd backend && mvnw.cmd spring-boot:run"

echo [2/2] Starting React Vite Frontend on http://localhost:5173 ...
start "Keystone Frontend" cmd /k "cd frontend && npm run dev"

echo ============================================================
echo   Both services are launching in dedicated windows!
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:8080
echo ============================================================

