@echo off
REM Chronicles Desktop App — Local Server Launcher (Windows)

echo Starting Chronicles Desktop App...
echo.
echo Opening http://localhost:8000 in your browser...
echo Press Ctrl+C to stop the server.
echo.

python -m http.server 8000

pause
