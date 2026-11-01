@echo off
setlocal enabledelayedexpansion

title AVL Price Index Launcher
color 0A

echo ========================================================
echo        AVL Price Index - Starting Full Stack App
echo ========================================================
echo.

:: Get the directory where this bat script resides (handles spaces properly)
set "ROOT_DIR=%~dp0"
if "%ROOT_DIR:~-1%"=="\" set "ROOT_DIR=%ROOT_DIR:~0,-1%"

set "BACKEND_DIR=%ROOT_DIR%\backend"
set "FRONTEND_DIR=%ROOT_DIR%\frontend"
set "PYTHON_EXE=%BACKEND_DIR%\venv\Scripts\python.exe"

echo [1/2] Launching Backend (Flask on port 5000)...
start "AVL Backend - Flask" cmd /k "cd /d "%BACKEND_DIR%" && "%PYTHON_EXE%" app.py"

:: Safe delay across all Windows systems (no input redirection issues)
ping 127.0.0.1 -n 3 >nul

echo [2/2] Launching Frontend (Vite on port 5173)...
start "AVL Frontend - Vite" cmd /k "cd /d "%FRONTEND_DIR%" && npm run dev"

:: Safe delay for Vite server startup
ping 127.0.0.1 -n 4 >nul

echo.
echo Opening browser at http://localhost:5173 ...
start "" "http://localhost:5173"

echo.
echo ========================================================
echo  Both servers are running in their respective windows!
echo  Keep those two windows open while using the application.
echo ========================================================
echo.
pause
