# LaserTrace Pro

A professional-grade native desktop application for laser engraving, built with Rust and React. Control your diode laser engraver with advanced image processing, artistic filters, and direct serial communication.

## 🌟 Highlights

- **40+ Professional Presets**: One-click filter combinations for instant results
- **7 Artistic Filters**: Oil painting, watercolor, pencil, charcoal, engraving, stippling, unsharp mask
- **5 Dithering Algorithms**: Floyd-Steinberg, Atkinson, Stucki, Jarvis-Judice-Ninke, ordered
- **LightBurn-Style Layers**: Multi-layer design with per-layer power, speed, and priority
- **Native Serial Control**: Reliable Rust-based communication with GRBL firmware
- **Interactive Tutorial**: Guided walkthrough for first-time users (skippable)
- **Searchable Glossary**: 30+ terminology definitions with examples
- **Custom Presets**: Save and load your own machine configurations

## 📦 Quick Start

### Installation

Download the latest installer for your platform from the **[Releases](https://github.com/Op-era/Laser-Pro-Engraver/releases)** page:
- **Windows**: `.msi` installer  
- **macOS**: `.dmg` disk image  
- **Linux**: `.AppImage` or `.deb` package

**Important**: Install CH340/CH341 USB drivers before connecting your laser. See **[USER_GUIDE.md](USER_GUIDE.md)** for driver links and installation help.

### First-Time Setup

1. Launch the application
2. Complete the Setup Wizard (choose your machine or configure custom)
3. Confirm safety equipment and accept terms
4. Follow the interactive tutorial (or skip if experienced)
5. Connect your laser via USB and start creating!

## 📚 Documentation

- **[USER_GUIDE.md](USER_GUIDE.md)** - Complete user manual with tutorials and troubleshooting
- **[FEATURES.md](FEATURES.md)** - Detailed feature list with descriptions
- **[DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md)** - Development setup and contribution guide
- **[INSTALL.md](INSTALL.md)** - Platform-specific installation instructions
- **[BUILD.md](BUILD.md)** - Build from source guide for developers

## 🚀 Basic Workflow

1. **Connect** your laser (click CONNECT → select port)
2. **Import** an image (Add Layer → Image)
3. **Adjust** settings (contrast, gamma, power, speed)
4. **Generate** paths (click Generate or use material preset)
5. **Engrave** (wear goggles! → Execute Burn Sequence)

## 🎨 Key Features

### Image Processing
- Professional artistic filters (oil painting, watercolor, sketch)
- Advanced dithering and halftone effects
- Levels, curves, and channel-specific adjustments
- Real-time preview with undo/redo

### Layer Management
- Multi-layer design with independent settings
- LightBurn-compatible color-coded layers (C00-C63)
- Per-layer power, speed, passes, and priority
- Variable text with auto-incrementing counters

### Hardware Control
- Native serial communication (Tauri/Rust)
- M3/M4 laser mode support
- Multiple scan patterns and angles
- Material presets for wood, acrylic, leather, metal, stone

### Advanced Features
- Camera bed mapping for precise positioning
- Rotary axis support for cylindrical objects
- Serialization (barcodes, QR codes, data matrix, text)
- Custom preset management
- Freehand drawing mode

## 🛠️ Development

### Build from Source

```bash
# Prerequisites: Node.js 18+, Rust 1.60+

# Clone and install
git clone https://github.com/Op-era/Laser-Pro-Engraver.git
cd Laser-Pro-Engraver
npm install

# Development mode (hot reload)
npm run tauri:dev

# Build production
npm run tauri:build
```

See **[DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md)** for complete development documentation.

### Run Tests

```bash
npm test              # Watch mode
npm run test:run      # Single run
npm run test:coverage # With coverage
```

## 📋 System Requirements

**Minimum:**
- Windows 10, macOS 10.15, or modern Linux
- 4GB RAM, dual-core CPU
- 1280x720 display

**Recommended:**
- Windows 11, macOS 12+, or Ubuntu 20.04+
- 8GB+ RAM, quad-core+ CPU
- 1920x1080+ display

**Hardware:**
- USB port for laser connection
- CH340/CH341 USB-to-Serial drivers
- Compatible GRBL-based laser engraver

## 🤝 Support & Community

- **Issues**: Report bugs or request features on [GitHub Issues](https://github.com/Op-era/Laser-Pro-Engraver/issues)
- **Documentation**: Complete guides in this repository
- **In-App Help**: Tutorial, help guide, and searchable glossary included

## 💰 License & Pricing

This is commercial software. See [LICENSE](LICENSE) for full terms.

**Free Version:**
- Basic image editing
- 3 of 7 filters
- G-code export
- Single layer

**Premium License ($[TBD]):**
- All 7 professional filters
- Complete dithering suite
- 40+ presets
- Multi-layer support
- Material library
- Project save/load
- Serial control
- Camera mapping
- Rotary & serialization
- Premium support

Purchase at: [Website TBD]

## 📄 License

Commercial and proprietary software. Copyright © 2026 Shane Foster. All Rights Reserved.

See [LICENSE](LICENSE) file for complete terms.

---

**Built with:** [Tauri](https://tauri.app) • [React](https://react.dev) • [Rust](https://www.rust-lang.org) • [TypeScript](https://www.typescriptlang.org)

**Version 1.0** | January 2026
