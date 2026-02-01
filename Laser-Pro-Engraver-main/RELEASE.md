# Release Checklist

Use this checklist when preparing a new release of LaserTrace Pro.

## Pre-Release

### Version Updates
- [ ] Update version in `src-tauri/tauri.conf.json`
- [ ] Update version in `src-tauri/Cargo.toml`
- [ ] Update version in `package.json` (if needed)
- [ ] Update version references in documentation

### Code Quality
- [ ] All tests pass (if tests exist)
- [ ] No TypeScript compilation errors
- [ ] Rust code compiles without warnings
- [ ] Run linter/formatter if configured
- [ ] Update CHANGELOG.md with changes

### Documentation
- [ ] README.md is up to date
- [ ] BUILD.md has accurate instructions
- [ ] INSTALL.md reflects current installers
- [ ] Any new features are documented

## Building

### Windows Build
Platform: Windows 10/11

- [ ] Install dependencies (if first time)
  - Node.js 18+
  - Rust
  - Microsoft C++ Build Tools
- [ ] Clean build: `npm run tauri:build`
- [ ] Test installer: `src-tauri/target/release/bundle/msi/*.msi`
- [ ] Verify app launches and basic functionality works
- [ ] Check file size is reasonable (~10-20 MB)

**Output files:**
- `LaserTrace-Pro_1.0.0_x64_en-US.msi`

### macOS Build
Platform: macOS 10.15+

- [ ] Install dependencies (if first time)
  - Node.js 18+
  - Rust
  - Xcode Command Line Tools
- [ ] Clean build: `npm run tauri:build`
- [ ] Test DMG: `src-tauri/target/release/bundle/dmg/*.dmg`
- [ ] Verify app launches and basic functionality works
- [ ] Test on both Intel and Apple Silicon (if possible)
- [ ] Check code signing (optional but recommended)

**Output files:**
- `LaserTrace-Pro_1.0.0_x64.dmg`
- `LaserTrace-Pro_1.0.0_aarch64.dmg` (Apple Silicon)

### Linux Build
Platform: Ubuntu 22.04+ (or similar)

- [ ] Install system dependencies
  ```bash
  sudo apt install libwebkit2gtk-4.0-dev \
      build-essential curl wget libssl-dev \
      libgtk-3-dev libayatana-appindicator3-dev \
      librsvg2-dev libudev-dev pkg-config
  ```
- [ ] Install Node.js 18+ and Rust
- [ ] Clean build: `npm run tauri:build`
- [ ] Test AppImage: `src-tauri/target/release/bundle/appimage/*.AppImage`
- [ ] Test .deb package: `src-tauri/target/release/bundle/deb/*.deb`
- [ ] Verify app launches and basic functionality works
- [ ] Test serial port access with dialout group

**Output files:**
- `laser-trace-pro_1.0.0_amd64.AppImage`
- `laser-trace-pro_1.0.0_amd64.deb`

## Testing

### Functional Testing
Test these features on each platform:

- [ ] App launches successfully
- [ ] Window displays correctly (1600x900 default)
- [ ] Can resize window (minimum 1200x700)
- [ ] Can load an image file
- [ ] Filters can be applied
- [ ] Filter Gallery opens and works
- [ ] Serial port connection works
  - [ ] Lists available ports
  - [ ] Can connect to device
  - [ ] Can send G-code commands
  - [ ] Can disconnect
- [ ] Can save project (.ltp file)
- [ ] Can load project
- [ ] Can export G-code
- [ ] Path generation works
- [ ] Preview renders correctly

### Installation Testing

#### Windows
- [ ] MSI installer runs without errors
- [ ] Creates Start Menu shortcut
- [ ] Creates Desktop shortcut (if selected)
- [ ] Uninstaller works

#### macOS
- [ ] DMG mounts correctly
- [ ] Can drag to Applications
- [ ] App runs from Applications folder
- [ ] No Gatekeeper issues (or documented workaround works)

#### Linux
- [ ] AppImage runs without additional setup
- [ ] .deb installs correctly
- [ ] Desktop entry created
- [ ] Uninstall works

## GitHub Release

### Prepare Release
- [ ] Create git tag: `git tag v1.0.0`
- [ ] Push tag: `git push origin v1.0.0`
- [ ] Create release notes (copy from CHANGELOG.md)
- [ ] Prepare screenshots of new features

### Upload Assets
- [ ] Windows: `LaserTrace-Pro_1.0.0_x64_en-US.msi`
- [ ] macOS Intel: `LaserTrace-Pro_1.0.0_x64.dmg`
- [ ] macOS Apple Silicon: `LaserTrace-Pro_1.0.0_aarch64.dmg`
- [ ] Linux AppImage: `laser-trace-pro_1.0.0_amd64.AppImage`
- [ ] Linux Debian: `laser-trace-pro_1.0.0_amd64.deb`
- [ ] Include checksums (SHA256)

### Release Notes Template
```markdown
## LaserTrace Pro v1.0.0

### New Features
- Feature 1
- Feature 2

### Improvements
- Improvement 1
- Improvement 2

### Bug Fixes
- Fix 1
- Fix 2

### Downloads
- **Windows:** [LaserTrace-Pro_1.0.0_x64_en-US.msi](#)
- **macOS:** [LaserTrace-Pro_1.0.0_x64.dmg](#)
- **Linux:** [laser-trace-pro_1.0.0_amd64.AppImage](#)

See [INSTALL.md](INSTALL.md) for installation instructions.

### Checksums (SHA256)
```
[Include checksums here]
```
```

## Post-Release

- [ ] Update README.md with new download links
- [ ] Announce on relevant channels
- [ ] Monitor for issues
- [ ] Respond to user feedback

## Notes

### Build Times
- First build: 10-20 minutes (compiles all Rust dependencies)
- Subsequent builds: 2-5 minutes
- Frontend only: 30 seconds

### File Sizes
Expected installer sizes:
- Windows MSI: ~15-25 MB
- macOS DMG: ~15-25 MB  
- Linux AppImage: ~20-30 MB
- Linux .deb: ~15-25 MB

### Common Issues

**Rust compilation fails:**
- Ensure all system dependencies are installed
- Try `cargo clean` and rebuild

**Icons missing in package:**
- Verify `src-tauri/icons/` contains all required files
- Regenerate with `npm run tauri icon app-icon.png`

**App won't start after install:**
- Check for missing system libraries
- Run from terminal to see error messages
- Verify minimum OS version requirements

## Automation (Future)

Consider setting up GitHub Actions to automate builds:
- Create `.github/workflows/release.yml`
- Build on Windows, macOS, and Linux runners
- Automatically upload release artifacts
- Generate checksums
- Create draft release
