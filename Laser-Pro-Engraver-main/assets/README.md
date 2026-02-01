# Assets Directory

## Logo Files

### Main Logo
- **File:** `logo.png`
- **Source:** https://havencommand.com/images/HavenIcon.png
- **Usage:** Application icon, website header, marketing materials

### Installation Instructions

1. Download the logo from: https://havencommand.com/images/HavenIcon.png
2. Save it as `logo.png` in this directory
3. The logo will automatically be used in:
   - Application icon (after icon generation)
   - Website header
   - Marketing materials
   - Documentation

### Generate Application Icons

After placing logo.png here, run:

```bash
# Install icon generator (if not already installed)
npm install -g @tauri-apps/cli

# Generate icons for all platforms
cd ..
npm run tauri icon assets/logo.png
```

This will create:
- Windows .ico file
- macOS .icns file
- Linux PNG files (various sizes)
- All placed in `src-tauri/icons/`

### Logo Usage in Code

The logo is referenced in:
- `src-tauri/tauri.conf.json` - App icon
- `website/index.html` - Website header
- `index.html` - Web app icon
- Marketing materials - All ad copy

### Copyright

Logo provided by Haven Command
© 2026 Shane Foster
