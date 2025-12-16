@echo off
chcp 65001 >nul
title Desliga AI - Iniciando (Alternativo)

cls
echo.
echo ================================================
echo    DESLIGA AI - Iniciador Alternativo
echo ================================================
echo.

REM Verifica Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] Node.js nao encontrado!
    pause
    exit /b 1
)

REM Verifica arquivos - procura package.json na raiz ou na pasta "Arquivos do  Inicializador"
if not exist "package.json" (
    if exist "Arquivos do  Inicializador\package.json" (
        echo [INFO] package.json encontrado na pasta "Arquivos do  Inicializador"
        echo [INFO] Copiando para a raiz do projeto...
        copy "Arquivos do  Inicializador\package.json" "package.json" >nul
        if exist "Arquivos do  Inicializador\package-lock.json" (
            copy "Arquivos do  Inicializador\package-lock.json" "package-lock.json" >nul
        )
        echo [OK] package.json copiado para a raiz!
    ) else (
        echo [ERRO] package.json nao encontrado!
        echo [INFO] Procurando em: %~dp0
        echo [INFO] E em: %~dp0Arquivos do  Inicializador\
        pause
        exit /b 1
    )
) else (
    echo [OK] package.json encontrado na raiz!
)

if not exist "db.json" (
    echo [ERRO] db.json nao encontrado!
    pause
    exit /b 1
)

REM Instala dependencias se necessario
if not exist "node_modules" (
    echo [INFO] Instalando dependencias...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERRO] Falha ao instalar dependencias!
        pause
        exit /b 1
    )
)

echo.
echo [INFO] Iniciando servidores em janelas separadas...
echo [INFO] JSON-Server: http://localhost:3000
echo [INFO] Site: http://localhost:8080
echo.
echo [IMPORTANTE] Cache COMPLETAMENTE desabilitado!
echo [INFO] O servidor customizado garante que sempre carregue
echo        a versao mais recente do index.html
echo [INFO] Qualquer alteracao sera carregada automaticamente
echo.
echo [INFO] Feche as janelas para parar os servidores
echo.

REM Inicia JSON-Server em janela separada
start "JSON-Server" cmd /k "cd /d %~dp0 && npx json-server --watch db.json --port 3000"

REM Aguarda 3 segundos
timeout /t 3 /nobreak >nul

REM Inicia servidor customizado que DESABILITA cache completamente
REM Este servidor garante que sempre carregue a versao mais recente dos arquivos
start "HTTP Server" cmd /k "cd /d %~dp0 && node server.js"

REM Aguarda 2 segundos para o servidor iniciar
timeout /t 2 /nobreak >nul

REM Abre o index.html local no navegador
start "" "%~dp0index.html"

echo.
echo [OK] Servidores iniciados!
echo [INFO] O arquivo index.html foi aberto automaticamente
echo [INFO] Duas janelas foram abertas com os servidores
echo [INFO] Feche as janelas para parar os servidores
echo.
pause

