@echo off
set "JAVA_HOME=C:\Users\usuario\.jdks\corretto-17.0.17"
set "MVN=C:\Program Files\JetBrains\IntelliJ IDEA Community Edition 2024.1\plugins\maven\lib\maven3\bin\mvn.cmd"
set "RAIZ=%~dp0"

echo Iniciando Backend (Spring Boot)...
start "Backend - Spring Boot :8080" cmd /k cd /d "%RAIZ%backend" ^&^& "%MVN%" spring-boot:run

echo Iniciando Frontend (Angular)...
start "Frontend - Angular :4200" cmd /k cd /d "%RAIZ%frontend" ^&^& npm start

echo.
echo Ambos servicios en marcha:
echo   Backend  ^-^> http://localhost:8080
echo   Frontend ^-^> http://localhost:4200
