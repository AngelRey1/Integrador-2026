# Iniciar ambos servidores en paralelo
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  SportConnect - Iniciando Servidores   " -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Iniciar ngx-admin en puerto 4200
Write-Host "[1/2] Iniciando ngx-admin en puerto 4200..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\ngx-admin'; npm start" -WindowStyle Normal

Start-Sleep -Seconds 2

# Iniciar sportconnect-admin en puerto 4300
Write-Host "[2/2] Iniciando sportconnect-admin en puerto 4300..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\sportconnect-admin'; npm start" -WindowStyle Normal

Write-Host ""
Write-Host "=========================================" -ForegroundColor Green
Write-Host "  Servidores iniciados correctamente!   " -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Accesos:" -ForegroundColor White
Write-Host "  - Landing Page:    http://localhost:4200" -ForegroundColor Cyan
Write-Host "  - Login:           http://localhost:4200/auth/login" -ForegroundColor Cyan
Write-Host "  - Panel Admin:     http://localhost:4300" -ForegroundColor Magenta
Write-Host ""
Write-Host "Credenciales de Demo:" -ForegroundColor White
Write-Host "  Cliente/Entrenador: cualquier email + password 123456" -ForegroundColor Gray
Write-Host "  Admin:              admin@sportconnect.com / admin123" -ForegroundColor Gray
Write-Host ""
