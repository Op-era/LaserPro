# Installation Guide

This guide covers installing LaserTrace Pro on Windows, macOS, and Linux.

## Quick Install (Recommended)

### Windows

1. Download `LaserTrace-Pro_1.0.0_x64_en-US.msi` from the [Releases](https://github.com/Op-era/Laser-Pro-Engraver/releases) page
2. Double-click the `.msi` file to run the installer
3. Follow the installation wizard
4. Launch from Start Menu or Desktop shortcut

**Note:** Windows may show a SmartScreen warning for unsigned apps. Click "More info" → "Run anyway"

### macOS

1. Download `LaserTrace-Pro_1.0.0_x64.dmg` from the [Releases](https://github.com/Op-era/Laser-Pro-Engraver/releases) page
2. Open the `.dmg` file
3. Drag LaserTrace Pro to your Applications folder
4. Right-click the app and select "Open" (first time only, to bypass Gatekeeper)

**Note:** macOS requires you to allow the app in System Preferences → Security & Privacy on first launch

### Linux

#### AppImage (Universal)

1. Download `laser-trace-pro_1.0.0_amd64.AppImage`
2. Make it executable:
   ```bash
   chmod +x laser-trace-pro_1.0.0_amd64.AppImage
   ```
3. Run it:
   ```bash
   ./laser-trace-pro_1.0.0_amd64.AppImage
   ```

#### Debian/Ubuntu (.deb)

```bash
# Download the .deb file
wget https://github.com/Op-era/Laser-Pro-Engraver/releases/download/v1.0.0/laser-trace-pro_1.0.0_amd64.deb

# Install
sudo dpkg -i laser-trace-pro_1.0.0_amd64.deb

# Fix dependencies if needed
sudo apt-get install -f

# Launch
laser-trace-pro
```

#### Fedora/RHEL (.rpm)

If an RPM package is provided:
```bash
sudo rpm -i laser-trace-pro_1.0.0_x86_64.rpm
```

## System Requirements

### All Platforms
- **RAM:** 4 GB minimum, 8 GB recommended
- **Storage:** 200 MB free space
- **Display:** 1200x700 minimum resolution
- **USB Port:** For laser engraver connection

### Windows
- **OS:** Windows 10 or later (64-bit)
- **Additional:** Microsoft C++ Redistributable (usually pre-installed)

### macOS
- **OS:** macOS 10.15 (Catalina) or later
- **Architecture:** Intel or Apple Silicon (universal binary)

### Linux
- **OS:** Modern distribution (Ubuntu 20.04+, Fedora 34+, Arch, etc.)
- **Dependencies:** webkit2gtk-4.0, GTK 3, OpenSSL
  
  Install on Debian/Ubuntu:
  ```bash
  sudo apt install libwebkit2gtk-4.0-37 libgtk-3-0
  ```

## Serial Port Permissions (Linux only)

To access your laser engraver via serial port, add your user to the `dialout` group:

```bash
sudo usermod -a -G dialout $USER
```

**Important:** Log out and log back in for this change to take effect.

## First Launch

1. Launch LaserTrace Pro
2. Connect your laser engraver via USB
3. Click the **CONNECT** button
4. Select your device from the port list
5. Start creating!

## Troubleshooting

### Windows: "Windows protected your PC"

This warning appears for apps without code signing certificates. To bypass:
1. Click "More info"
2. Click "Run anyway"

### macOS: "App is damaged and can't be opened"

This happens due to Gatekeeper. To fix:
```bash
xattr -cr /Applications/LaserTrace\ Pro.app
```

Then right-click the app and select "Open"

### Linux: "Permission denied" for serial port

Add yourself to the dialout group (see above) and restart your session.

### Linux: Missing libraries

Install required dependencies:
```bash
# Debian/Ubuntu
sudo apt install libwebkit2gtk-4.0-37 libgtk-3-0 libayatana-appindicator3-1

# Fedora
sudo dnf install webkit2gtk3 gtk3

# Arch
sudo pacman -S webkit2gtk gtk3
```

### App won't start

1. Check that your system meets the minimum requirements
2. Try running from terminal to see error messages:
   - Windows: `"C:\Program Files\LaserTrace Pro\LaserTrace Pro.exe"`
   - macOS: `/Applications/LaserTrace\ Pro.app/Contents/MacOS/LaserTrace\ Pro`
   - Linux: `laser-trace-pro` (or run the AppImage)

## Uninstallation

### Windows
1. Open Settings → Apps
2. Find "LaserTrace Pro"
3. Click Uninstall

Or use the uninstaller:
- `C:\Program Files\LaserTrace Pro\uninstall.exe`

### macOS
Drag LaserTrace Pro from Applications to Trash

### Linux

#### AppImage
Simply delete the AppImage file

#### Debian/Ubuntu
```bash
sudo apt remove laser-trace-pro
```

#### Fedora/RHEL
```bash
sudo rpm -e laser-trace-pro
```

## Getting Help

- **Documentation:** See README.md in the app folder
- **Issues:** Report bugs on [GitHub Issues](https://github.com/Op-era/Laser-Pro-Engraver/issues)
- **Build from source:** See BUILD.md for compilation instructions

## Data & Settings

LaserTrace Pro stores settings and projects in:
- **Windows:** `%APPDATA%\com.lasertrace.pro\`
- **macOS:** `~/Library/Application Support/com.lasertrace.pro/`
- **Linux:** `~/.local/share/com.lasertrace.pro/`

These folders are not automatically removed during uninstallation if you want to preserve your settings.
