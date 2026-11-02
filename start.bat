@echo off
title Doremon's Learning World
echo ================================================================
echo    Doremon's Learning World - AI-Powered Learning Platform
echo ================================================================
echo Starting the full-stack server...

cd /d "%~dp0"
if exist "backend\venv\Scripts\python.exe" (
    backend\venv\Scripts\python.exe run.py
) else (
    python run.py
)
pause
