# Build Guide

This guide covers building LaserTrace Pro from source for all platforms.

> **🚀 Quick Start**: For comprehensive instructions on building DMG and EXE installers, see [BUILD_GUIDE.md](BUILD_GUIDE.md)

---

## Quick Build Scripts

We provide automated build scripts for convenience:

### Windows - Build MSI and EXE
```batch
build-all.bat          # Build all Windows installers
```

### macOS - Build DMG
```bash
./build-all.sh         # Build macOS installers
```

### Linux - Build AppImage and DEB
```bash
./build-all.sh         # Build Linux packages
```

See [BUILD_GUIDE.md](BUILD_GUIDE.md) for detailed instructions and troubleshooting.

---

## Prerequisites

### All Platforms
- **Node.js** 18 or later: [https://nodejs.org/](https://nodejs.org/)
- **Rust** 1.60 or later: [https://rustup.rs/](https://rustup.rs/)
- **npm** (comes with Node.js)

### Platform-Specific Dependencies

#### Windows
- **Microsoft C++ Build Tools**
  - Download from: [https://visualstudio.microsoft.com/visual-cpp-build-tools/](https://visualstudio.microsoft.com/visual-cpp-build-tools/)
  - Or install Visual Studio with "Desktop development with C++" workload

#### macOS
- **Xcode Command Line Tools**
  ```bash
  xcode-select --install
  ```

#### Linux (Debian/Ubuntu)
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

#### Linux (Fedora)
```bash
sudo dnf install webkit2gtk4.0-devel \
    openssl-devel \
    curl \
    wget \
    libappindicator-gtk3 \
    librsvg2-devel
```

#### Linux (Arch)
```bash
sudo pacman -S webkit2gtk \
    base-devel \
    curl \
    wget \
    openssl \
    appmenu-gtk-module \
    gtk3 \
    libappindicator-gtk3 \
    librsvg \
    libvips
```

## Building

### 1. Clone the Repository
```bash
git clone https://github.com/Op-era/Laser-Pro-Engraver.git
cd Laser-Pro-Engraver
```

### 2. Install Dependencies
```bash
npm install
```

This will install both JavaScript dependencies and the Tauri CLI.

### 3. Development Build
```bash
npm run tauri:dev
```

This starts the app in development mode with hot-reload. The first build will take 5-10 minutes as Rust compiles all dependencies. Subsequent builds are much faster.

### 4. Production Build
```bash
npm run tauri:build
```

**Build time:** 5-15 minutes depending on your system.

**Output locations:**
- **Windows**: `src-tauri/target/release/bundle/msi/LaserTrace Pro_0.1.0_x64_en-US.msi`
- **macOS**: `src-tauri/target/release/bundle/dmg/LaserTrace Pro_0.1.0_x64.dmg`
- **Linux**: 
  - `src-tauri/target/release/bundle/appimage/laser-trace-pro_0.1.0_amd64.AppImage`
  - `src-tauri/target/release/bundle/deb/laser-trace-pro_0.1.0_amd64.deb`

## Build Configuration

### Customize Bundle Settings

Edit `src-tauri/tauri.conf.json`:

```json
{
  "package": {
    "productName": "LaserTrace Pro",
    "version": "0.1.0"
  },
  "tauri": {
    "bundle": {
      "identifier": "com.lasertrace.pro"
    }
  }
}
```

### Change App Icon

Place your icon file (1024x1024 PNG) at the root and run:
```bash
npm run tauri icon path/to/icon.png
```

This generates all required icon formats in `src-tauri/icons/`.

## Troubleshooting

### Build Fails: "webkit2gtk not found" (Linux)
Install webkit2gtk-4.0:
```bash
sudo apt install libwebkit2gtk-4.0-dev
```

### Build Fails: "MSVC not found" (Windows)
Install Visual Studio Build Tools with C++ workload.

### Build Fails: "serialport" compilation error
Install system dependencies:
```bash
# Linux
sudo apt install libudev-dev pkg-config

# macOS - usually no action needed
```

### Serial Port Access Denied (Linux)
Add your user to the `dialout` group:
```bash
sudo usermod -a -G dialout $USER
# Log out and back in for changes to take effect
```

### First Build is Slow
The first Rust compilation takes 5-10 minutes as it builds all dependencies. This is normal. Subsequent builds are much faster (30-60 seconds).

## Cross-Compilation

Tauri does not support cross-compilation. You must build on the target platform:
- Build Windows installers on Windows
- Build macOS installers on macOS  
- Build Linux packages on Linux

For multi-platform releases, use CI/CD (GitHub Actions, etc.) with runners for each platform.

## Development Tips

### Faster Frontend Development
For UI-only changes, use Vite directly (faster than Tauri):
```bash
npm run dev
```

Note: This won't have Rust backend functionality.

### Debug Rust Backend
Add debug logging in `src-tauri/src/`:
```rust
println!("Debug: {:?}", value);
```

View logs in the terminal where you ran `npm run tauri:dev`.

### Debug Frontend
Open DevTools in the app: `Ctrl+Shift+I` (Windows/Linux) or `Cmd+Option+I` (macOS)

### Clean Build
```bash
# Clean Rust artifacts
cd src-tauri
cargo clean

# Clean node modules
cd ..
rm -rf node_modules package-lock.json
npm install
```

## Release Process

1. Update version in `src-tauri/tauri.conf.json`
2. Update version in `src-tauri/Cargo.toml`
3. Build for all platforms: `npm run tauri:build`
4. Test installers on each platform
5. Create GitHub release with installers
6. Update README with download links

## Resources

- [Tauri Documentation](https://tauri.app/v1/guides/)
- [Tauri Prerequisites](https://tauri.app/v1/guides/getting-started/prerequisites)
- [Rust Installation](https://rustup.rs/)
- [Node.js Download](https://nodejs.org/)
