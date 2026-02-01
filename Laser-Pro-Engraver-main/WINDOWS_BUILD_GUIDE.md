# Windows Build Instructions

## Prerequisites

Before building on Windows, install these required tools:

### 1. Node.js
- Download from: https://nodejs.org/
- Version required: 18 or later
- Verify installation: `node --version`

### 2. Rust
- Download from: https://rustup.rs/
- Run: `rustup-init.exe`
- Accept defaults
- Verify installation: `cargo --version`

### 3. Microsoft C++ Build Tools
Choose ONE of these options:

**Option A: Visual Studio Build Tools (Smaller)**
- Download: https://visualstudio.microsoft.com/visual-cpp-build-tools/
- During installation, select "Desktop development with C++"

**Option B: Visual Studio Community (Full IDE)**
- Download: https://visualstudio.microsoft.com/vs/community/
- During installation, select "Desktop development with C++"

### 4. WebView2 Runtime
- Usually pre-installed on Windows 10/11
- If needed, download: https://developer.microsoft.com/en-us/microsoft-edge/webview2/

## Build Steps

1. **Clone or Open the Project**
   ```cmd
   cd Laser-Pro-Engraver-main
   ```

2. **Install Dependencies**
   ```cmd
   npm install
   ```

3. **Build the Application**
   ```cmd
   npm run tauri build
   ```

   This will take 5-10 minutes on first build (compiling Rust dependencies)

## Build Output

After successful build, you'll find the installers at:

- **MSI Installer**: 
  ```
  src-tauri\target\release\bundle\msi\LaserTrace Pro_1.0.0_x64_en-US.msi
  ```

- **NSIS Installer** (Setup.exe):
  ```
  src-tauri\target\release\bundle\nsis\LaserTrace Pro_1.0.0_x64-setup.exe
  ```

- **Standalone EXE** (no installer):
  ```
  src-tauri\target\release\LaserTrace Pro.exe
  ```

## Quick Build Script

You can also use the provided batch file:

```cmd
build-all.bat
```

This will build both MSI and NSIS installers automatically.

## Troubleshooting

### Error: "link.exe not found"
- Install Microsoft C++ Build Tools
- Restart terminal/cmd after installation

### Error: "WebView2Loader.dll not found"
- Install WebView2 Runtime from Microsoft

### Error: "npm not recognized"
- Add Node.js to PATH
- Restart terminal/cmd

### Build is slow
- First build takes 5-10 minutes (normal)
- Subsequent builds are faster (1-2 minutes)

### MSI/NSIS not created
- Check that `"targets": "all"` is set in `src-tauri/tauri.conf.json`
- Or specify: `npm run tauri build -- --bundles msi nsis`

## Distribution

Both installers (MSI and NSIS) are ready for distribution:

- **MSI**: Standard Windows installer, preferred for enterprise
- **NSIS**: More customizable installer with modern UI

Users simply download and run the installer - no additional setup required.

## Code Signing (Optional)

For production distribution, consider code signing to avoid Windows Defender warnings:

1. Obtain a code signing certificate
2. Add certificate details to `src-tauri/tauri.conf.json`:
   ```json
   "bundle": {
     "windows": {
       "certificateThumbprint": "YOUR_CERT_THUMBPRINT"
     }
   }
   ```

## Need Help?

If you encounter issues:
1. Check that all prerequisites are installed
2. Restart terminal after installing tools
3. Run `cargo clean` and try again
4. Check the build log for specific errors
