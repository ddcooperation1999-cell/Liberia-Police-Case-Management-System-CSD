@echo off
REM Start backend server
cd /d "c:\Users\user\Desktop\LNPMS\backend"
start "LNP Backend Server" cmd /k "node index.js"
timeout /t 3

REM Start frontend server (production build - much faster!)
cd /d "c:\Users\user\Desktop\LNPMS\frontend"
start "LNP Frontend Server" cmd /k "node server.js"

echo.
echo ========================================
echo Both servers starting!
echo.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:3001
echo.
echo Login with:
echo   Username: dortusnimely
echo   Password: dortusnimely
echo ========================================
echo.
pause
