@echo off
REM Start LNPMS System
REM This script starts both the backend and frontend servers

echo.
echo ====================================================
echo   LNPMS - Liberia National Police Case Management
echo ====================================================
echo.

echo Starting Backend Server on Port 3001...
start "LNPMS Backend" cmd /k "cd backend && node index.js"

timeout /t 3 /nobreak

echo Starting Frontend Dashboard on Port 3000...
start "LNPMS Dashboard" cmd /k "cd frontend && node functional-dashboard.js"

timeout /t 3 /nobreak

echo.
echo ====================================================
echo   ✅ SYSTEM STARTED SUCCESSFULLY
echo ====================================================
echo.
echo 📊 Dashboard:   http://localhost:3000
echo 🔌 Backend API:  http://localhost:3001
echo.
echo Login Credentials:
echo   Username: dortusnimely
echo   Password: dortusnimely
echo.
echo ====================================================
echo.
echo Servers will continue running in separate windows.
echo Close the windows to stop the servers.
echo.
pause
