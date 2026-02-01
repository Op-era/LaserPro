# GitHub Actions Build Guide

This guide explains how to use GitHub Actions to automatically build both macOS DMG and Windows EXE installers for Laser Pro Engraver.

## Setup Instructions

### 1. Push Your Code to GitHub

If you haven't already, initialize git and push to GitHub:

```bash
cd /Users/shanefoster/Laser-Pro-Engraver-main
git init
git add .
git commit -m "Add Laser Pro Engraver with all bug fixes"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/Laser-Pro-Engraver.git
git push -u origin main
```

### 2. Enable GitHub Actions

The workflow file is already configured at `.github/workflows/release.yml`. GitHub Actions will automatically detect it.

### 3. Trigger a Build

You have three options to trigger builds:

#### Option A: Push to Main Branch (Recommended for testing)
```bash
git add .
git commit -m "Your commit message"
git push origin main
```

This will build both macOS and Windows versions automatically.

#### Option B: Manual Workflow Dispatch
1. Go to your repository on GitHub
2. Click the "Actions" tab
3. Select "Build Release" workflow
4. Click "Run workflow" button
5. Select the branch (main)
6. Click "Run workflow"

#### Option C: Create a Release Tag (For official releases)
```bash
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
```

This creates a GitHub Release with the installers attached.

## Downloading Built Installers

### For Main Branch Builds:
1. Go to the "Actions" tab in your GitHub repository
2. Click on the latest workflow run
3. Scroll down to "Artifacts" section
4. Download:
   - `laser-pro-engraver-macos-latest` - Contains the DMG file
   - `laser-pro-engraver-windows-latest` - Contains the MSI installer

### For Tagged Releases:
1. Go to the "Releases" tab in your GitHub repository
2. Click on the release
3. Download from the "Assets" section

## Build Configuration

The workflow builds:
- **macOS**: Universal DMG installer (x86_64)
- **Windows**: MSI installer (x86_64)

### Build Times:
- macOS: ~15-20 minutes
- Windows: ~10-15 minutes

### Features Included:
- ✅ Homing boundary enforcement
- ✅ Test fire laser with proper mode toggling
- ✅ Configurable joystick Y-inversion
- ✅ Image aspect ratio preservation
- ✅ Debounced sliders (no freezing)
- ✅ Full text editor with font selection
- ✅ All critical bug fixes

## Workflow Details

The workflow automatically:
1. Checks out your code
2. Sets up Node.js and Rust
3. Installs all dependencies
4. Builds the frontend (Vite)
5. Builds the backend (Rust/Tauri)
6. Creates platform-specific installers
7. Uploads artifacts for download

## Troubleshooting

### If the workflow fails:
1. Check the "Actions" tab for error logs
2. Look for red X marks on failed steps
3. Click on the failed step to see detailed logs

### Common issues:
- **Rust compilation errors**: Check `src-tauri/Cargo.toml` dependencies
- **Frontend build errors**: Run `npm run build` locally to test
- **Missing dependencies**: Workflow auto-installs, but check versions

### Local Testing Before Push:
```bash
# Test frontend build
npm run build

# Test full Tauri build (takes 20-40 minutes on macOS)
npm run tauri build
```

## Repository Structure Required

Ensure these files exist in your repository:
- `package.json` - Frontend dependencies
- `src-tauri/Cargo.toml` - Rust dependencies
- `src-tauri/tauri.conf.json` - Tauri configuration
- `.github/workflows/release.yml` - Workflow configuration

## Next Steps

1. **Push your code** to trigger the first build
2. **Wait 30-35 minutes** for both builds to complete
3. **Download artifacts** from the Actions tab
4. **Test installers** on both platforms
5. **Create releases** using git tags for distribution

## Support

For GitHub Actions issues:
- Check the [Actions tab](https://github.com/YOUR_USERNAME/Laser-Pro-Engraver/actions)
- View [GitHub Actions documentation](https://docs.github.com/en/actions)
- Check [Tauri GitHub Actions guide](https://tauri.app/v1/guides/building/cross-platform)
