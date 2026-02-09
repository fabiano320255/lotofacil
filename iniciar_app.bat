@echo off
echo ==========================================
echo   INICIANDO LOTOFACIL APP
echo ==========================================
echo.
echo 1. Verificando instalacao...
if not exist "node_modules" (
    echo Instalando dependencias - aguarde...
    call npm install
)

echo.
echo 2. Abrindo o navegador...
echo.
echo Pressione CTRL+C para parar o servidor.
echo.

start http://localhost:5173
call npm run dev
pause
