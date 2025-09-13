@echo off
title Crop Recommendation System
color 0A

echo.
echo ========================================
echo   🌱 CROP RECOMMENDATION SYSTEM 🌱
echo ========================================
echo.
echo Starting the application...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed or not in PATH
    echo Please install Python from https://python.org
    pause
    exit /b 1   
)

REM Check if required files exist
if not exist "launch_app.py" (
    echo ❌ launch_app.py not found
    echo Please make sure you're in the correct directory
    pause
    exit /b 1
)

if not exist "simple_app.py" (
    echo ❌ simple_app.py not found
    echo Please make sure you're in the correct directory
    pause
    exit /b 1
)

if not exist "Crop_Project.html" (
    echo ❌ Crop_Project.html not found
    echo Please make sure you're in the correct directory
    pause
    exit /b 1
)

echo ✅ All required files found
echo.
echo 🚀 Launching Crop Recommendation System...
echo.

REM Start the application
python launch_app.py

echo.
echo 👋 Thank you for using Crop Recommendation System!
pause
