@echo off
REM ===================================================================
REM LaserTrace Pro - Comprehensive Build Script for Windows
REM Builds all installer types: MSI, EXE, and DMG (if on macOS via WSL)
REM ===================================================================

echo.
echo ============================================
echo   LaserTrace Pro - All-Platform Builder
echo ============================================
echo.

REM Check if Node.js is installed
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if Rust is installed
where cargo >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Rust is not installed
    echo Please install Rust from https://rustup.rs/
    pause
    exit /b 1
)

echo [INFO] Environment Check
echo   Node.js: 
node --version
echo   npm:
npm --version
echo   Rust:
rustc --version
echo   Cargo:
cargo --version
echo.

REM Install npm dependencies if needed
if not exist "node_modules" (
    echo [INFO] Installing npm dependencies...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to install dependencies
        pause
        exit /b 1
    )
    echo.
)

REM Parse command line arguments
set BUILD_TARGET=%1
if "%BUILD_TARGET%"=="" set BUILD_TARGET=all

echo [INFO] Build Target: %BUILD_TARGET%
echo.

if "%BUILD_TARGET%"=="windows" goto BUILD_WINDOWS
if "%BUILD_TARGET%"=="msi" goto BUILD_WINDOWS
if "%BUILD_TARGET%"=="exe" goto BUILD_WINDOWS
if "%BUILD_TARGET%"=="all" goto BUILD_ALL
if "%BUILD_TARGET%"=="help" goto SHOW_HELP

echo [ERROR] Unknown build target: %BUILD_TARGET%
goto SHOW_HELP

:BUILD_ALL
echo ============================================
echo   Building All Installers
echo ============================================
echo.
echo [INFO] This will build Windows installers (MSI)
echo [INFO] Note: DMG can only be built on macOS
echo.
goto BUILD_WINDOWS

:BUILD_WINDOWS
echo [INFO] Building Windows Installers...
echo [INFO] This may take 5-15 minutes depending on your system...
echo.
echo [STEP 1/2] Building frontend...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Frontend build failed
    pause
    exit /b 1
)
echo.

echo [STEP 2/2] Building Tauri application with bundles...
call npm run tauri:build
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Tauri build failed
    pause
    exit /b 1
)

echo.
echo ============================================
echo   Build Complete!
echo ============================================
echo.
echo [SUCCESS] Windows installers created:
echo.
echo   MSI Installer:
if exist "src-tauri\target\release\bundle\msi\" (
    dir /b "src-tauri\target\release\bundle\msi\*.msi"
    echo   Location: src-tauri\target\release\bundle\msi\
) else (
    echo   [WARNING] MSI bundle not found
)
echo.
echo   NSIS Installer (if configured):
if exist "src-tauri\target\release\bundle\nsis\" (
    dir /b "src-tauri\target\release\bundle\nsis\*.exe"
    echo   Location: src-tauri\target\release\bundle\nsis\
) else (
    echo   [INFO] NSIS installer not configured (optional)
)
echo.
echo   Standalone EXE:
if exist "src-tauri\target\release\*.exe" (
    dir /b "src-tauri\target\release\LaserTrace Pro.exe" 2>nul
    echo   Location: src-tauri\target\release\
) else (
    echo   [INFO] Standalone EXE at: src-tauri\target\release\
)
echo.
echo [NOTE] To build DMG for macOS, run this script on a Mac
echo.
goto END

:SHOW_HELP
echo.
echo Usage: build-all.bat [target]
echo.
echo Available targets:
echo   all       - Build all available installers (default)
echo   windows   - Build Windows installers only (MSI)
echo   msi       - Same as 'windows'
echo   help      - Show this help message
echo.
echo Examples:
echo   build-all.bat           - Build all installers
echo   build-all.bat windows   - Build Windows MSI only
echo   build-all.bat help      - Show this help
echo.
echo Output Locations:
echo   Windows MSI:  src-tauri\target\release\bundle\msi\
echo   Windows EXE:  src-tauri\target\release\
echo   macOS DMG:    Can only be built on macOS
echo.
echo Requirements:
echo   - Node.js 18+
echo   - Rust 1.60+
echo   - Windows SDK (for Windows builds)
echo.
exit /b 0

:END
echo [INFO] Build script completed successfully
echo.
pause
exit /b 0
