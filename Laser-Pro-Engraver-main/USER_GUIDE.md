# LaserTrace Pro User Guide

Complete guide for using LaserTrace Pro laser engraving software.

## Table of Contents
1. [Getting Started](#getting-started)
2. [First Launch Setup](#first-launch-setup)
3. [Basic Workflow](#basic-workflow)
4. [Image Preparation](#image-preparation)
5. [Layer Management](#layer-management)
6. [Settings & Configuration](#settings--configuration)
7. [Running Your First Job](#running-your-first-job)
8. [Troubleshooting](#troubleshooting)
9. [Tips & Best Practices](#tips--best-practices)

---

## Getting Started

### Installation

1. Download the installer for your platform from the [Releases page](https://github.com/Op-era/Laser-Pro-Engraver/releases)
2. Run the installer:
   - **Windows**: Double-click the `.msi` file
   - **macOS**: Open the `.dmg` and drag to Applications
   - **Linux**: Make the `.AppImage` executable and run, or install the `.deb` package

See [INSTALL.md](INSTALL.md) for detailed installation instructions.

### Driver Installation (REQUIRED)

Most diode lasers use CH340/CH341 USB-to-Serial chips. Install the driver before connecting your laser:

**Windows/Linux/macOS:**
- Download from: http://www.wch-ic.com/downloads/CH341SER_EXE.html
- Install and restart your computer
- Verify installation by connecting the laser and checking for a COM port

**Note**: If you've previously used LightBurn or LaserGRBL, drivers are likely already installed.

---

## First Launch Setup

When you first launch LaserTrace Pro, you'll go through the Setup Wizard:

### Step 1: Machine Selection
Choose your laser engraver from the list or select "Custom Setup" for unlisted machines.

**Pre-configured machines:**
- Atomstack A5 Pro
- Ortur Laser Master 2 Pro
- xTool D1 Pro
- NEJE Master 2S Plus
- Two Trees TT5.5

### Step 2: Custom Configuration (if applicable)
For custom machines, enter:
- **Bed Width/Height**: Your work area size in millimeters
- **Max Travel Speed**: Maximum rapid movement speed (typically 4000 mm/min)
- **Max Power Value**: S-max value from your firmware (typically 1000)
- **Laser Mode**: M3 (constant) or M4 (dynamic power)
- **Source Type**: Diode, CO2, or Fiber

**Test Console**: Use the built-in test console to verify settings:
- Click movement arrows to jog the laser
- Click "Pulse" to test fire at low power
- Click "Home" to execute homing cycle

### Step 3: Safety Compliance
Confirm you have proper safety equipment:
- ✓ OD5+ laser safety goggles for your wavelength
- ✓ Active ventilation to outdoors
- ✓ Fire extinguisher or fire blanket within reach
- ✓ Verified materials are safe (no PVC or vinyl)

### Step 4: Legal Agreement
Read and accept the terms of service and liability disclaimer.

### Interactive Tutorial
After setup, an interactive tutorial will guide you through the interface. You can:
- Follow along step-by-step
- Skip the tutorial (press "Skip Tutorial")
- Re-enable it later in settings

---

## Basic Workflow

### 1. Connect Your Laser
1. Power on your laser engraver
2. Connect USB cable to your computer
3. Click **CONNECT** in the top-right corner
4. Select your laser's serial port from the list
5. Status indicator will show "ONLINE" when connected

### 2. Import an Image
1. Click **Add Layer** button in the left sidebar
2. Select **Image** layer type
3. Choose an image file (PNG, JPEG, GIF, BMP, or WebP)
4. Image appears on the canvas

### 3. Position and Resize
- **Drag** the image to position it
- **Drag corner handles** to resize
- **Rotate** using the rotation handle
- Use **layer properties** for precise positioning

### 4. Adjust Settings
1. Select the layer in the layer panel
2. Adjust image processing settings:
   - **Contrast**: Increase for more defined shadows
   - **Gamma**: Adjust midtone brightness (1.8-2.2 for wood)
   - **Brightness**: Overall lightness adjustment
3. Configure laser settings:
   - **Power**: Laser intensity (start with 20-30% for testing)
   - **Speed**: Feed rate (2000-3000 mm/min for engraving)
   - **Passes**: Number of repetitions (1-3 typical)

### 5. Generate Paths
1. Click **Generate Paths** or use the material preset button
2. Wait for path generation to complete
3. Preview paths on canvas (toggle with "Show Paths")

### 6. Execute Job
1. Ensure laser is connected (ONLINE indicator)
2. **Put on safety goggles**
3. Click **Execute Burn Sequence**
4. Monitor progress bar
5. Use **Stop** button if needed for emergency stop

---

## Image Preparation

### Best Practices for Images

**Resolution:**
- 300-600 DPI recommended for photos
- Higher resolution = more detail but longer engraving time
- Scale images to final size before import

**Contrast:**
- High contrast images work best
- Avoid muddy midtones
- Use Levels or Curves to enhance tonal range

**Content:**
- Simple designs are more forgiving for beginners
- Portraits benefit from careful gamma adjustment
- Line art and text should be high contrast

### Using Filters

**Artistic Filters:**
- **Oil Painting**: Smooths detail, good for portraits
- **Pencil Sketch**: Creates sketch-like effect
- **Stippling**: Converts to dot patterns

**Technical Filters:**
- **Unsharp Mask**: Sharpens edges
- **Noise Reduction**: Smooths grainy images

**Halftone:**
- Creates newspaper-like effect
- Adjust cell size for dot spacing
- Try different shapes (circle, square, diamond)

### Dithering

When you can't use variable power, dithering creates the illusion of grayscale:

- **Floyd-Steinberg**: Best general-purpose dithering
- **Atkinson**: Lighter, high-key images
- **Ordered**: Retro computer graphics look

---

## Layer Management

### Working with Multiple Layers

Layers let you organize complex designs and use different settings for each element:

1. **Add Layers**: Click "Add Layer" and choose type
2. **Reorder**: Drag layers to change stacking order
3. **Lock**: Prevent accidental edits
4. **Hide**: Toggle visibility for isolation

### Layer Types

**Image Layers:**
- Import photos and graphics
- Apply filters and adjustments
- Generate raster toolpaths

**Text Layers:**
- Add text directly in the app
- Choose font, size, and spacing
- Outline or filled text
- Variable text with counters

**Vector Layers:**
- Import SVG paths
- Draw shapes (rectangles, circles)
- Line/cut mode engraving

**Template Layers:**
- Alignment guides
- Grid overlays
- Non-engraving reference

### Layer Settings

Each layer has independent settings:

- **Power Min/Max**: Variable power range for grayscale
- **Speed**: Feed rate for this layer
- **Passes**: Number of repetitions
- **Scan Angle**: Direction of raster lines (0°, 45°, 90°)
- **Line Interval**: Spacing between scan lines
- **Priority**: Execution order (lower = first)

---

## Settings & Configuration

### Global Settings

**Machine Tab:**
- Work area size
- Laser type (diode/CO2/fiber)
- Power limits

**G-code Tab:**
- Laser mode (M3/M4)
- Start/end scripts
- Feed rate
- Travel speed

**Processing Tab:**
- PPI (pixels per inch)
- Lines per mm
- Scan pattern
- Overscan distance

### Material Presets

Quick settings for common materials:

| Material | Power | Speed | Passes |
|----------|-------|-------|--------|
| Plywood 3mm | 80% | 2500 | 1 |
| Acrylic 3mm | 100% | 500 | 2 |
| Leather | 60% | 2000 | 1 |
| Slate | 100% | 1000 | 1-2 |

**Note**: These are starting points. Test on scrap material first.

### Custom Presets

Save your own settings:

1. Click **Presets** in the top bar
2. Configure settings for your material
3. Click "New Preset"
4. Name it (e.g., "Oak 5mm Photo")
5. Add optional description
6. Click "Save Preset"

Load saved presets anytime from the Presets Manager.

---

## Running Your First Job

### Test Fire First

Before your first full engraving:

1. Connect laser and position over scrap material
2. Put on safety goggles
3. Click "Pulse" in the Control Panel
4. Laser should briefly fire at low power
5. Adjust focus if beam is too large or dim

### Frame Your Design

1. Click "Frame" to trace the boundary
2. Laser moves around the perimeter (no power)
3. Verify design fits on your material
4. Adjust position if needed

### Start the Job

1. **Safety first**: Goggles on, fire extinguisher ready
2. Material secured flat on bed
3. Lens/mirror clean and properly focused
4. Click "Execute Burn Sequence"
5. **Never leave unattended**

### During Engraving

**Monitor:**
- Progress indicator
- Console for errors
- Smoke/flames (normal light smoke is OK)

**If something goes wrong:**
- Click "Stop" immediately
- Disconnect power if needed
- Check for fire or excessive smoke

---

## Troubleshooting

### Connection Issues

**"No serial ports found"**
- Install CH340 drivers
- Try different USB port
- Check laser is powered on
- Restart computer after driver install

**"Connection failed"**
- Port might be in use (close other software)
- Check baud rate (115200 is standard)
- Try unplugging and reconnecting

### Image Quality Issues

**Too light:**
- Increase power
- Decrease speed
- Increase gamma
- More passes

**Too dark/burnt:**
- Decrease power
- Increase speed
- Decrease gamma
- Check focus

**Uneven tones:**
- Check power gamma setting
- Ensure material is flat
- Verify M4 mode for photos
- Clean lens/mirror

**Blurry or smeared:**
- Check focus distance
- Tighten loose belts
- Reduce speed for sharp detail
- Clean lens

### G-code Errors

**"Error: Alarm"**
- Send `$X` to unlock
- Check limit switches
- Verify homing completed

**"Door open" or safety error**
- Check laser lid/door sensors
- Verify safety interlock

**Machine not moving:**
- Check stepper enable jumper
- Verify G-code format
- Test with simple commands (G0 X10 Y10)

---

## Tips & Best Practices

### Material Preparation
- **Wood**: Sand smooth, wipe clean
- **Acrylic**: Remove protective film
- **Leather**: Natural leather only (not PU leather)
- **Metal**: Apply marking spray or black marker

### Focus
- Proper focus is critical for sharp results
- Test with ramp test for optimal distance
- Re-check focus if changing material thickness

### Power & Speed
- **Cutting**: High power, slow speed
- **Engraving**: Medium power, medium-fast speed
- **Marking**: Low power, fast speed

### Multiple Passes
- Better than single high-power pass
- Reduces burning and warping
- Each pass should be slightly deeper

### Grain Direction
- Diagonal scanning (45°) works with most grains
- Rotate scan angle if lines are too visible
- Cross-grain can enhance contrast

### Ventilation
- Always vent to outdoors
- Inline fan is better than shop vac
- Filter smoke before exhaust (activated carbon)

### Maintenance
- Clean lens before every session
- Check mirror alignment regularly
- Tighten loose belts
- Lubricate linear rails monthly

### Safety Reminders
- **Always wear goggles** (even for "just a test")
- Keep fire extinguisher nearby
- Never engrave PVC, vinyl, or ABS plastic
- Don't leave laser unattended
- Ensure proper ventilation

---

## Getting Help

### In-App Resources
- **Help Guide**: Click "Help" in top bar for quick reference
- **Glossary**: Click "Glossary" to search terminology
- **Tutorial**: Re-enable in settings if you need a refresher

### Online Resources
- **GitHub Issues**: Report bugs or request features
- **Documentation**: Complete docs at GitHub repository
- **Community**: Share tips and get advice

### Support
For technical support:
- Check [INSTALL.md](INSTALL.md) for installation help
- See [FEATURES.md](FEATURES.md) for complete feature list
- Review [BUILD.md](BUILD.md) if building from source

---

## Next Steps

Now that you know the basics:

1. **Practice**: Start with simple images on scrap material
2. **Experiment**: Try different filters and settings
3. **Save Presets**: Build your library of material settings
4. **Advanced Features**: Explore layers, camera mapping, and rotary
5. **Share**: Show off your work and help others learn

**Happy Engraving!** 🔥⚡

---

**LaserTrace Pro User Guide**  
Version 1.0 | January 2026  
Copyright © 2026 Shane Foster. All Rights Reserved.
