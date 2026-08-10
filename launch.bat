@echo off
title Structural Mechanics Course Portal Launch Utility
echo =======================================================
echo    🏗️ Launching Structural Mechanics Course Portal
echo =======================================================
echo.

cd /d "%~dp0"

echo [INFO] Launching Streamlit web application directly...
title Streamlit Server Active (Do Not Close)

:: Run streamlit directly using the explicit path inside the venv
"%~dp0.venv\Scripts\python.exe" -m streamlit run app.py

if %errorlevel% neq 0 (
    echo.
    echo [WARNING] Streamlit server failed to launch or exited with an error.
    pause
)
pause