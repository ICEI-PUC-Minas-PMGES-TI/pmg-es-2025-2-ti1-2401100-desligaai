@echo off
chcp 65001 >nul
title Desliga AI - Parando servidores...

echo.
echo ================================================
echo    DESLIGA AI - Parando Servidores
echo ================================================
echo.

REM Para processos na porta 3000
echo [INFO] Parando JSON-Server (porta 3000)...
set found3000=0
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr :3000 ^| findstr LISTENING') do (
    echo [INFO] Encontrado processo PID: %%a
    taskkill /F /PID %%a >nul 2>&1
    if !errorlevel! equ 0 (
        echo [OK] Processo na porta 3000 parado
        set found3000=1
    )
)
if %found3000% equ 0 (
    echo [INFO] Nenhum processo encontrado na porta 3000
)

echo.
echo [INFO] Parando HTTP Server (porta 8080)...
set found8080=0
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr :8080 ^| findstr LISTENING') do (
    echo [INFO] Encontrado processo PID: %%a
    taskkill /F /PID %%a >nul 2>&1
    if !errorlevel! equ 0 (
        echo [OK] Processo na porta 8080 parado
        set found8080=1
    )
)
if %found8080% equ 0 (
    echo [INFO] Nenhum processo encontrado na porta 8080
)

REM Para processos do node.exe relacionados
echo.
echo [INFO] Verificando processos Node.js...
taskkill /F /IM node.exe >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Processos Node.js parados
) else (
    echo [INFO] Nenhum processo Node.js encontrado
)

echo.
echo [OK] Verificacao concluida!
echo.
timeout /t 2 /nobreak >nul
