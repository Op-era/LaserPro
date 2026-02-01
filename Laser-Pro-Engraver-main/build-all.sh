#!/bin/bash
# ===================================================================
# LaserTrace Pro - Comprehensive Build Script for All Platforms
# Builds DMG (macOS), MSI (Windows via Wine), AppImage (Linux)
# ===================================================================

set -e  # Exit on error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo "============================================"
echo "  LaserTrace Pro - All-Platform Builder"
echo "============================================"
echo ""

# Function to print colored messages
info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    error "Node.js is not installed"
    echo "  Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check if Rust is installed
if ! command -v cargo &> /dev/null; then
    error "Rust is not installed"
    echo "  Please install Rust from https://rustup.rs/"
    exit 1
fi

info "Environment Check"
echo "  Node.js: $(node --version)"
echo "  npm: $(npm --version)"
echo "  Rust: $(rustc --version)"
echo "  Cargo: $(cargo --version)"
echo ""

# Detect OS
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS_TYPE="linux"
    info "Detected Linux"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    OS_TYPE="macos"
    info "Detected macOS"
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
    OS_TYPE="windows"
    info "Detected Windows"
else
    OS_TYPE="unknown"
    warning "Unknown OS type: $OSTYPE"
fi
echo ""

# Check for platform-specific dependencies
if [[ "$OS_TYPE" == "linux" ]]; then
    if ! pkg-config --exists glib-2.0; then
        error "Required Linux dependencies not found"
        echo "  Install with:"
        echo "  sudo apt install libwebkit2gtk-4.0-dev build-essential curl wget"
        echo "  sudo apt install libssl-dev libgtk-3-dev libayatana-appindicator3-dev"
        echo "  sudo apt install librsvg2-dev libudev-dev pkg-config"
        exit 1
    fi
elif [[ "$OS_TYPE" == "macos" ]]; then
    if ! xcode-select -p &> /dev/null; then
        error "Xcode Command Line Tools not found"
        echo "  Install with: xcode-select --install"
        exit 1
    fi
fi

# Install npm dependencies if needed
if [ ! -d "node_modules" ]; then
    info "Installing npm dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        error "Failed to install dependencies"
        exit 1
    fi
    echo ""
fi

# Parse command line arguments
BUILD_TARGET="${1:-all}"

info "Build Target: $BUILD_TARGET"
echo ""

show_help() {
    echo ""
    echo "Usage: ./build-all.sh [target]"
    echo ""
    echo "Available targets:"
    echo "  all       - Build all available installers for current platform (default)"
    echo "  macos     - Build macOS installers (DMG) - macOS only"
    echo "  dmg       - Same as 'macos'"
    echo "  linux     - Build Linux installers (AppImage, DEB) - Linux only"
    echo "  windows   - Build Windows installers (MSI) - requires Wine"
    echo "  help      - Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./build-all.sh           - Build all installers for current platform"
    echo "  ./build-all.sh macos     - Build DMG for macOS"
    echo "  ./build-all.sh linux     - Build AppImage and DEB for Linux"
    echo "  ./build-all.sh help      - Show this help"
    echo ""
    echo "Output Locations:"
    echo "  macOS DMG:    src-tauri/target/release/bundle/dmg/"
    echo "  macOS App:    src-tauri/target/release/bundle/macos/"
    echo "  Linux DEB:    src-tauri/target/release/bundle/deb/"
    echo "  Linux AppImage: src-tauri/target/release/bundle/appimage/"
    echo "  Windows MSI:  src-tauri/target/release/bundle/msi/"
    echo ""
    echo "Requirements:"
    echo "  - Node.js 18+"
    echo "  - Rust 1.60+"
    echo "  - Platform-specific build tools"
    echo ""
}

if [ "$BUILD_TARGET" == "help" ] || [ "$BUILD_TARGET" == "--help" ] || [ "$BUILD_TARGET" == "-h" ]; then
    show_help
    exit 0
fi

build_project() {
    local platform=$1
    
    echo ""
    echo "============================================"
    echo "  Building for: $platform"
    echo "============================================"
    echo ""
    
    info "This may take 5-15 minutes depending on your system..."
    echo ""
    
    info "[STEP 1/2] Building frontend..."
    npm run build
    if [ $? -ne 0 ]; then
        error "Frontend build failed"
        exit 1
    fi
    echo ""
    
    info "[STEP 2/2] Building Tauri application with bundles..."
    npm run tauri:build
    if [ $? -ne 0 ]; then
        error "Tauri build failed"
        exit 1
    fi
    
    echo ""
    echo "============================================"
    echo "  Build Complete!"
    echo "============================================"
    echo ""
}

show_results() {
    local platform=$1
    
    success "Build completed successfully!"
    echo ""
    info "Installers created:"
    echo ""
    
    if [[ "$platform" == "macos" ]] || [[ "$platform" == "all" && "$OS_TYPE" == "macos" ]]; then
        echo "  📦 macOS DMG:"
        if [ -d "src-tauri/target/release/bundle/dmg" ]; then
            ls -lh src-tauri/target/release/bundle/dmg/*.dmg 2>/dev/null || echo "     [Not found]"
            echo "     Location: src-tauri/target/release/bundle/dmg/"
        else
            warning "DMG bundle not found"
        fi
        echo ""
        echo "  📦 macOS App Bundle:"
        if [ -d "src-tauri/target/release/bundle/macos" ]; then
            ls -d src-tauri/target/release/bundle/macos/*.app 2>/dev/null || echo "     [Not found]"
            echo "     Location: src-tauri/target/release/bundle/macos/"
        fi
        echo ""
    fi
    
    if [[ "$platform" == "linux" ]] || [[ "$platform" == "all" && "$OS_TYPE" == "linux" ]]; then
        echo "  📦 Linux AppImage:"
        if [ -d "src-tauri/target/release/bundle/appimage" ]; then
            ls -lh src-tauri/target/release/bundle/appimage/*.AppImage 2>/dev/null || echo "     [Not found]"
            echo "     Location: src-tauri/target/release/bundle/appimage/"
        else
            warning "AppImage bundle not found"
        fi
        echo ""
        echo "  📦 Debian Package (DEB):"
        if [ -d "src-tauri/target/release/bundle/deb" ]; then
            ls -lh src-tauri/target/release/bundle/deb/*.deb 2>/dev/null || echo "     [Not found]"
            echo "     Location: src-tauri/target/release/bundle/deb/"
        else
            warning "DEB package not found"
        fi
        echo ""
    fi
    
    if [[ "$platform" == "windows" ]] || [[ "$platform" == "all" && "$OS_TYPE" == "windows" ]]; then
        echo "  📦 Windows MSI:"
        if [ -d "src-tauri/target/release/bundle/msi" ]; then
            ls -lh src-tauri/target/release/bundle/msi/*.msi 2>/dev/null || echo "     [Not found]"
            echo "     Location: src-tauri/target/release/bundle/msi/"
        else
            warning "MSI bundle not found"
        fi
        echo ""
        echo "  📦 Windows EXE:"
        if [ -f "src-tauri/target/release/LaserTrace Pro.exe" ]; then
            ls -lh "src-tauri/target/release/LaserTrace Pro.exe" 2>/dev/null
            echo "     Location: src-tauri/target/release/"
        else
            info "Standalone EXE location: src-tauri/target/release/"
        fi
        echo ""
    fi
}

# Main build logic
case "$BUILD_TARGET" in
    "all")
        build_project "$OS_TYPE"
        show_results "all"
        ;;
    "macos"|"dmg")
        if [[ "$OS_TYPE" != "macos" ]]; then
            error "macOS builds (DMG) can only be created on macOS"
            echo "  Current OS: $OS_TYPE"
            exit 1
        fi
        build_project "macos"
        show_results "macos"
        ;;
    "linux"|"appimage"|"deb")
        if [[ "$OS_TYPE" != "linux" ]]; then
            error "Linux builds can only be created on Linux"
            echo "  Current OS: $OS_TYPE"
            echo "  Tip: Use a Linux VM or CI/CD system"
            exit 1
        fi
        build_project "linux"
        show_results "linux"
        ;;
    "windows"|"msi"|"exe")
        if [[ "$OS_TYPE" != "windows" ]]; then
            warning "Windows builds are best created on Windows"
            echo "  Current OS: $OS_TYPE"
            echo "  Note: Cross-compilation may require additional setup"
        fi
        build_project "windows"
        show_results "windows"
        ;;
    *)
        error "Unknown build target: $BUILD_TARGET"
        show_help
        exit 1
        ;;
esac

info "Build script completed successfully"
echo ""
exit 0
