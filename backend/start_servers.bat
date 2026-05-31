@echo off
echo Starting Backend Server...
start /B cmd /c "python manage.py runserver 0.0.0.0:8000"
echo Backend started on port 8000
echo.
echo Starting Frontend Server...
cd /d "%~dp0..\frontend"
start /B cmd /c "npm run dev"
echo Frontend started on port 5173
echo.
echo Servers started. Press any key to exit.
pause >nul
