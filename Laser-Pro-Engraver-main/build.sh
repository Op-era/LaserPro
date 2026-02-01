#!/bin/bash
# Build script for LaserTrace Pro
# This script helps build release packages for all platforms

set -e  # Exit on error

echo "🚀 LaserTrace Pro - Build Script"
echo "================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed"
    echo "   Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check if Rust is installed
if ! command -v cargo &> /dev/null; then
    echo "❌ Error: Rust is not installed"
    echo "   Please install Rust from https://rustup.rs/"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"
echo "✅ Rust version: $(rustc --version)"
echo "✅ Cargo version: $(cargo --version)"
echo ""

# Check for platform-specific dependencies
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "🐧 Detected Linux"
    if ! pkg-config --exists glib-2.0; then
        echo "⚠️  Warning: glib-2.0 not found"
        echo "   Install dependencies with:"
        echo "   sudo apt install libwebkit2gtk-4.0-dev build-essential curl wget libssl-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev libudev-dev pkg-config"
        exit 1
    fi
elif [[ "$OSTYPE" == "darwin"* ]]; then
    echo "🍎 Detected macOS"
    if ! xcode-select -p &> /dev/null; then
        echo "⚠️  Warning: Xcode Command Line Tools not found"
        echo "   Install with: xcode-select --install"
        exit 1
    fi
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
    echo "🪟 Detected Windows"
fi
echo ""

# Install npm dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing npm dependencies..."
    npm install
    echo ""
fi

# Build type
BUILD_TYPE="${1:-release}"

if [ "$BUILD_TYPE" == "dev" ]; then
    echo "🔨 Starting development build..."
    echo "   This will launch the app with hot-reload enabled."
    echo ""
    npm run tauri:dev
elif [ "$BUILD_TYPE" == "release" ]; then
    echo "🔨 Building production release..."
    echo "   This may take 5-15 minutes..."
    echo ""
    npm run tauri:build
    
    echo ""
    echo "✅ Build complete!"
    echo ""
    echo "📦 Installers are located in:"
    echo "   src-tauri/target/release/bundle/"
    echo ""
    
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        echo "   - AppImage: src-tauri/target/release/bundle/appimage/"
        echo "   - Debian:   src-tauri/target/release/bundle/deb/"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        echo "   - DMG:      src-tauri/target/release/bundle/dmg/"
        echo "   - App:      src-tauri/target/release/bundle/macos/"
    elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
        echo "   - MSI:      src-tauri/target/release/bundle/msi/"
        echo "   - EXE:      src-tauri/target/release/"
    fi
else
    echo "❌ Unknown build type: $BUILD_TYPE"
    echo "   Usage: ./build.sh [dev|release]"
    echo "   - dev:     Start development server"
    echo "   - release: Build production installers (default)"
    exit 1
fi
