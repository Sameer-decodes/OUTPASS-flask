@echo off
echo ========================================================
echo Starting College Leave & Out-Pass Management System
echo ========================================================

echo.
echo [1/2] Starting Flask Backend on http://127.0.0.1:5000 ...
start "Out-Pass Flask Backend" cmd /k "cd backend && py -3.12 app.py"

echo.
echo [2/2] Starting React Vite Frontend on http://localhost:5173 ...
start "Out-Pass React Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Waiting for servers to initialize...
timeout /t 3 /nobreak >nul

echo.
echo Opening Web Application in your default browser...
start http://localhost:5173

echo.
echo ========================================================
echo Application is running!
echo Frontend: http://localhost:5173
echo Backend API: http://127.0.0.1:5000
echo ========================================================
pause
