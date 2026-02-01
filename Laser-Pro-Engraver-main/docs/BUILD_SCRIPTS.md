# Build Scripts - Quick Reference

Quick reference for building LaserTrace Pro installers.

## 🚀 Quick Start

### Windows - Build MSI and EXE
```batch
build-all.bat
```
**Output**: `src-tauri\target\release\bundle\msi\` and `src-tauri\target\release\`

### macOS - Build DMG
```bash
./build-all.sh
```
**Output**: `src-tauri/target/release/bundle/dmg/`

### Linux - Build AppImage
```bash
./build-all.sh
```
**Output**: `src-tauri/target/release/bundle/appimage/`

---

## Available Build Scripts

| Script | Platform | What It Builds |
|--------|----------|----------------|
| `build-all.bat` | Windows | **MSI installer + standalone EXE** |
| `build-all.sh` | macOS | **DMG installer** |
| `build-all.sh` | Linux | **AppImage + DEB package** |
| `build.bat` | Windows | Simple build (dev or release) |
| `build.sh` | macOS/Linux | Simple build (dev or release) |

---

## Help

All scripts have built-in help:

```batch
build-all.bat help      # Windows
./build-all.sh help     # macOS/Linux
```

---

## Full Documentation

📖 **[BUILD_GUIDE.md](BUILD_GUIDE.md)** - Comprehensive build guide with:
- Prerequisites for each platform
- Detailed instructions
- Troubleshooting
- CI/CD integration
- Cross-platform notes

📖 **[BUILD.md](BUILD.md)** - Development build guide

---

## Prerequisites

✅ Node.js 18+ - https://nodejs.org/  
✅ Rust 1.60+ - https://rustup.rs/  
✅ Platform-specific tools (see BUILD_GUIDE.md)

---

## Build Time

⏱️ **First build**: 10-15 minutes (compiling Rust dependencies)  
⏱️ **Subsequent builds**: 2-5 minutes (cached)

---

## Important Notes

⚠️ **DMG files can ONLY be built on macOS**  
⚠️ **MSI files are best built on Windows**  
⚠️ **Cross-compilation is not supported by Tauri**

For multi-platform releases, either:
1. Build on each platform natively
2. Use CI/CD (GitHub Actions) with platform runners

---

## Output Sizes

Typical installer sizes:

| Format | Size |
|--------|------|
| Windows MSI | 80-120 MB |
| Windows EXE | 60-80 MB |
| macOS DMG | 80-120 MB |
| Linux AppImage | 80-120 MB |

---

**Questions?** See [BUILD_GUIDE.md](BUILD_GUIDE.md) for comprehensive documentation.
