$raiz = Split-Path -Parent $MyInvocation.MyCommand.Path
$env:JAVA_HOME = "C:\Users\usuario\.jdks\corretto-17.0.17"
$mvn = "C:\Program Files\JetBrains\IntelliJ IDEA Community Edition 2024.1\plugins\maven\lib\maven3\bin\mvn.cmd"

Write-Host "Iniciando Backend (Spring Boot)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$env:JAVA_HOME='$env:JAVA_HOME'; Set-Location '$raiz\backend'; & '$mvn' spring-boot:run" -WindowStyle Normal

Write-Host "Iniciando Frontend (Angular)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$raiz\frontend'; if (-not (Test-Path node_modules)) { Write-Host 'Instalando dependencias...'; npm install --legacy-peer-deps }; npm start" -WindowStyle Normal

Write-Host ""
Write-Host "Ambos servicios en marcha:" -ForegroundColor Yellow
Write-Host "  Backend  -> http://localhost:8080"
Write-Host "  Frontend -> http://localhost:4200"
