@echo off
REM Start backend server
cd /d "c:\Users\user\Desktop\LNPMS\backend"
start "LNP Backend Server" cmd /k "node index.js"
timeout /t 3

REM Start frontend server from root directory
cd /d "c:\Users\user\Desktop\LNPMS"
start "LNP Frontend Server" cmd /k "node frontend-server.js"

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
echo.
echo Press ENTER to continue...
pause
echo ========================================
echo.
pause
