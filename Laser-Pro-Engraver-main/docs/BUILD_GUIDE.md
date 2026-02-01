# Building LaserTrace Pro - Comprehensive Guide

This guide explains how to build LaserTrace Pro installers for Windows (.exe/.msi) and macOS (.dmg).

---

## Quick Start

### Windows Users - Build Everything

```batch
build-all.bat
```

This will build Windows installers (MSI and EXE).

### macOS Users - Build DMG

```bash
./build-all.sh
```

This will build macOS installers (DMG and App bundle).

### Linux Users - Build AppImage

```bash
./build-all.sh
```

This will build Linux installers (AppImage and DEB package).

---

## Build Scripts Overview

We provide several build scripts for different needs:

| Script | Platform | Purpose |
|--------|----------|---------|
| `build.bat` | Windows | Simple dev/release builds for Windows |
| `build.sh` | Unix | Simple dev/release builds for current platform |
| `build-all.bat` | Windows | **Comprehensive multi-platform builder** |
| `build-all.sh` | macOS/Linux | **Comprehensive multi-platform builder** |

---

## Prerequisites

### All Platforms

1. **Node.js 18+**
   - Download: https://nodejs.org/
   - Verify: `node --version`

2. **Rust 1.60+**
   - Download: https://rustup.rs/
   - Verify: `cargo --version`

### Windows Specific

- Windows 10 or later
- Visual Studio Build Tools (automatically installed with Rust)
- Windows SDK

### macOS Specific

- macOS 10.15 (Catalina) or later
- Xcode Command Line Tools: `xcode-select --install`

### Linux Specific

Ubuntu/Debian:
```bash
sudo apt update
sudo apt install libwebkit2gtk-4.0-dev \
    build-essential \
    curl \
    wget \
    libssl-dev \
    libgtk-3-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev \
    libudev-dev \
    pkg-config
```

---

## Building for Windows (.exe and .msi)

### Option 1: Using build-all.bat (Recommended)

```batch
build-all.bat
```

This will create:
- **MSI Installer**: `src-tauri\target\release\bundle\msi\LaserTrace Pro_1.0.0_x64.msi`
- **Standalone EXE**: `src-tauri\target\release\LaserTrace Pro.exe`

### Option 2: Using build.bat (Simple)

```batch
build.bat release
```

### Manual Build

```batch
npm install
npm run build
npm run tauri:build
```

### Output Locations

```
src-tauri/target/release/bundle/msi/     - MSI installer
src-tauri/target/release/                - Standalone EXE
```

---

## Building for macOS (.dmg)

**Note**: DMG files can ONLY be built on macOS. You cannot build DMG on Windows or Linux.

### Option 1: Using build-all.sh (Recommended)

```bash
chmod +x build-all.sh
./build-all.sh
```

or specifically:

```bash
./build-all.sh macos
```

This will create:
- **DMG Installer**: `src-tauri/target/release/bundle/dmg/LaserTrace Pro_1.0.0_x64.dmg`
- **App Bundle**: `src-tauri/target/release/bundle/macos/LaserTrace Pro.app`

### Option 2: Using build.sh (Simple)

```bash
chmod +x build.sh
./build.sh release
```

### Manual Build

```bash
npm install
npm run build
npm run tauri:build
```

### Output Locations

```
src-tauri/target/release/bundle/dmg/     - DMG installer
src-tauri/target/release/bundle/macos/   - App bundle
```

---

## Building for Linux (.AppImage and .deb)

### Using build-all.sh

```bash
chmod +x build-all.sh
./build-all.sh
```

or specifically:

```bash
./build-all.sh linux
```

This will create:
- **AppImage**: `src-tauri/target/release/bundle/appimage/laser-trace-pro_1.0.0_amd64.AppImage`
- **DEB Package**: `src-tauri/target/release/bundle/deb/laser-trace-pro_1.0.0_amd64.deb`

### Output Locations

```
src-tauri/target/release/bundle/appimage/  - AppImage
src-tauri/target/release/bundle/deb/       - DEB package
```

---

## Cross-Platform Building

### Can I Build DMG on Windows?

**No.** macOS DMG files require macOS-specific tools (hdiutil, codesign) that only work on macOS.

**Options**:
1. Build on a Mac
2. Use a macOS VM (requires macOS license)
3. Use GitHub Actions or CI/CD with macOS runners

### Can I Build MSI on macOS?

**Not easily.** While technically possible with Wine and special setup, it's not recommended.

**Options**:
1. Build on Windows
2. Use a Windows VM
3. Use GitHub Actions or CI/CD with Windows runners

### Recommended Approach

For distributing to all platforms:

1. **Use GitHub Actions** (Automated CI/CD):
   - Builds on Windows runner → MSI/EXE
   - Builds on macOS runner → DMG
   - Builds on Linux runner → AppImage/DEB

2. **Build on Native Platforms**:
   - Windows machine → build Windows installers
   - Mac → build macOS installers
   - Linux VM → build Linux installers

---

## Build Script Options

### build-all.bat (Windows)

```batch
build-all.bat [target]
```

**Targets**:
- `all` - Build all available installers (default)
- `windows` - Build Windows installers
- `msi` - Same as windows
- `help` - Show help

**Examples**:
```batch
build-all.bat              # Build everything
build-all.bat windows      # Build Windows only
build-all.bat help         # Show help
```

### build-all.sh (macOS/Linux)

```bash
./build-all.sh [target]
```

**Targets**:
- `all` - Build all for current platform (default)
- `macos` or `dmg` - Build macOS installers (macOS only)
- `linux` - Build Linux installers (Linux only)
- `windows` - Build Windows installers (experimental)
- `help` - Show help

**Examples**:
```bash
./build-all.sh              # Build for current platform
./build-all.sh macos        # Build DMG (macOS only)
./build-all.sh linux        # Build AppImage/DEB (Linux only)
./build-all.sh help         # Show help
```

---

## Troubleshooting

### Build Fails with "cargo not found"

**Solution**: Install Rust from https://rustup.rs/

### Build Fails with "node not found"

**Solution**: Install Node.js from https://nodejs.org/

### Windows: "MSI not found"

**Cause**: Build may have failed or WiX toolset not installed

**Solution**: 
1. Check error messages in build output
2. Ensure Rust is up to date: `rustup update`
3. Retry: `build-all.bat`

### macOS: "xcode-select not found"

**Solution**: Install Xcode Command Line Tools:
```bash
xcode-select --install
```

### Linux: "webkit2gtk not found"

**Solution**: Install dependencies:
```bash
sudo apt install libwebkit2gtk-4.0-dev build-essential
```

### Build Takes Too Long

**Normal**: First build takes 10-15 minutes
**Subsequent**: 2-5 minutes (cached dependencies)

### Cannot Build DMG on Windows

**This is expected.** DMG is a macOS-specific format.

**Options**:
1. Use a Mac
2. Use macOS VM (requires license)
3. Use CI/CD with macOS runner

---

## CI/CD Integration

### GitHub Actions Example

Create `.github/workflows/build.yml`:

```yaml
name: Build Installers

on:
  push:
    tags:
      - 'v*'

jobs:
  build-windows:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - uses: actions-rs/toolchain@v1
        with:
          toolchain: stable
      - run: npm install
      - run: npm run tauri:build
      - uses: actions/upload-artifact@v3
        with:
          name: windows-msi
          path: src-tauri/target/release/bundle/msi/*.msi

  build-macos:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - uses: actions-rs/toolchain@v1
        with:
          toolchain: stable
      - run: npm install
      - run: npm run tauri:build
      - uses: actions/upload-artifact@v3
        with:
          name: macos-dmg
          path: src-tauri/target/release/bundle/dmg/*.dmg

  build-linux:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - uses: actions-rs/toolchain@v1
        with:
          toolchain: stable
      - run: |
          sudo apt update
          sudo apt install libwebkit2gtk-4.0-dev build-essential curl wget libssl-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev libudev-dev pkg-config
      - run: npm install
      - run: npm run tauri:build
      - uses: actions/upload-artifact@v3
        with:
          name: linux-appimage
          path: src-tauri/target/release/bundle/appimage/*.AppImage
```

---

## Advanced Configuration

### Customizing Build Output

Edit `src-tauri/tauri.conf.json`:

```json
{
  "tauri": {
    "bundle": {
      "targets": ["msi", "nsis"],  // Add/remove targets
      "windows": {
        "wix": {
          "language": "en-US"
        }
      },
      "macOS": {
        "minimumSystemVersion": "10.15"
      }
    }
  }
}
```

### Available Bundle Targets

- **Windows**: `msi`, `nsis`, `exe`
- **macOS**: `dmg`, `app`
- **Linux**: `deb`, `appimage`, `rpm`

---

## Output File Sizes

Typical installer sizes:

| Platform | Format | Size |
|----------|--------|------|
| Windows | MSI | ~80-120 MB |
| Windows | EXE | ~60-80 MB |
| macOS | DMG | ~80-120 MB |
| Linux | AppImage | ~80-120 MB |
| Linux | DEB | ~60-80 MB |

*Sizes vary based on dependencies and included assets*

---

## Summary

### To Build Windows Installers (.msi/.exe):
```batch
build-all.bat
```
Output: `src-tauri\target\release\bundle\msi\`

### To Build macOS Installers (.dmg):
```bash
./build-all.sh macos
```
Output: `src-tauri/target/release/bundle/dmg/`

### To Build All for Current Platform:
```bash
./build-all.sh      # macOS/Linux
build-all.bat       # Windows
```

---

## Support

For build issues:
1. Check this documentation
2. Verify prerequisites are installed
3. Check Tauri documentation: https://tauri.app/
4. Review error messages carefully

---

**Happy Building!** 🚀
