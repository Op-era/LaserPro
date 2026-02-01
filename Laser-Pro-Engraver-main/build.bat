@echo off
REM ===================================================================
REM LaserTrace Pro - Build Script (Windows)
REM Simple build script for development and release builds
REM For multi-platform builds, use build-all.bat
REM ===================================================================

echo.
echo ====================================
echo   LaserTrace Pro - Build Script
echo ====================================
echo.

REM Check if Node.js is installed
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed
    echo Please install Node.js from https://nodejs.org/
    exit /b 1
)

REM Check if Rust is installed
where cargo >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Rust is not installed
    echo Please install Rust from https://rustup.rs/
    exit /b 1
)

echo [INFO] Node.js version:
node --version
echo.
echo [INFO] npm version:
npm --version
echo.
echo [INFO] Rust version:
rustc --version
echo.
echo [INFO] Cargo version:
cargo --version
echo.

REM Install npm dependencies if needed
if not exist "node_modules" (
    echo [INFO] Installing npm dependencies...
    call npm install
    echo.
)

REM Check build type
set BUILD_TYPE=%1
if "%BUILD_TYPE%"=="" set BUILD_TYPE=release

if "%BUILD_TYPE%"=="dev" (
    echo [INFO] Starting development build...
    echo This will launch the app with hot-reload enabled.
    echo.
    call npm run tauri:dev
) else if "%BUILD_TYPE%"=="release" (
    echo [INFO] Building production release...
    echo This may take 5-15 minutes...
    echo.
    call npm run tauri:build
    
    echo.
    echo ====================================
    echo   Build Complete!
    echo ====================================
    echo.
    echo [SUCCESS] Installers created:
    echo.
    echo   Windows MSI:
    echo   Location: src-tauri\target\release\bundle\msi\
    if exist "src-tauri\target\release\bundle\msi\" (
        dir /b "src-tauri\target\release\bundle\msi\*.msi"
    )
    echo.
    echo   Standalone EXE:
    echo   Location: src-tauri\target\release\
    echo.
    echo [TIP] For building DMG (macOS) and other formats, use build-all.bat
    echo.
) else (
    echo [ERROR] Unknown build type: %BUILD_TYPE%
    echo.
    echo Usage: build.bat [dev^|release]
    echo   - dev:     Start development server
    echo   - release: Build production installers (default)
    echo.
    echo For multi-platform builds: build-all.bat
    exit /b 1
)
