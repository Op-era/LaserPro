# LaserTrace Pro - Complete Feature List

## Table of Contents
- [Core Features](#core-features)
- [Image Processing](#image-processing)
- [Layer Management](#layer-management)
- [Hardware Control](#hardware-control)
- [File Operations](#file-operations)
- [User Interface](#user-interface)
- [Safety Features](#safety-features)
- [Advanced Features](#advanced-features)

---

## Core Features

### Laser Engraving Modes
- **Raster Engraving**: Photo-quality engraving with grayscale support
- **Vector Engraving**: Precise line and path following for cuts and outlines
- **Dithering**: Multiple dithering algorithms for black and white conversion
- **Tone Mapping**: Advanced tonal range compression for optimal results

### Supported Laser Types
- **Diode Lasers**: Optimized for common blue diode laser systems (405nm-450nm)
- **CO2 Lasers**: Support for CO2 laser systems (10,600nm)
- **Fiber Lasers**: Configuration options for fiber laser systems

### Machine Profiles
- Pre-configured profiles for popular laser engravers:
  - Atomstack A5 Pro (410 x 400mm)
  - Ortur Laser Master 2 Pro (400 x 430mm)
  - xTool D1 Pro (430 x 400mm)
  - NEJE Master 2S Plus (450 x 440mm)
  - Two Trees TT5.5 (400 x 400mm)
- Custom machine setup wizard for unlisted hardware
- Live testing console during custom setup

---

## Image Processing

### Basic Adjustments
- **Brightness**: Adjust overall image lightness/darkness (-100 to +100)
- **Contrast**: Enhance or reduce contrast (-100 to +100)
- **Gamma**: Non-linear tonal curve adjustment (0.1 to 5.0)
- **Exposure**: Simulated exposure adjustment
- **Saturation**: Control color intensity before grayscale conversion
- **Hue**: Rotate colors before grayscale conversion

### Advanced Adjustments
- **Levels**: Precise control of black point, white point, and midtones
- **Curves**: Custom tonal curve editing with control points
- **Threshold**: Binary black/white conversion with adjustable cutoff
- **Invert**: Negative image conversion
- **Color Channel Weights**: Custom RGB to grayscale conversion ratios

### Professional Artistic Filters
1. **Oil Painting**: Smooth, painterly effect with adjustable brush size
2. **Watercolor**: Soft, flowing watercolor simulation
3. **Pencil Sketch**: Graphite pencil drawing effect
4. **Charcoal**: Bold charcoal drawing simulation
5. **Classical Engraving**: Traditional engraving line work
6. **Stippling**: Dot-based shading technique
7. **Unsharp Mask**: Professional sharpening filter

### Dithering Algorithms
- **Floyd-Steinberg**: High-quality error diffusion dithering
- **Atkinson**: Apple-style dithering with light distribution
- **Stucki**: Large kernel error diffusion
- **Jarvis-Judice-Ninke**: Very large kernel for smooth gradients
- **Ordered Dithering**: Pattern-based dithering (2x2, 4x4, 8x8 matrices)

### Halftone Effects
- **5 Dot Shapes**: Circle, Square, Diamond, Line, Cross
- **Adjustable Cell Size**: Control halftone dot spacing (2-32 pixels)
- **Rotation**: Any angle from 0-360 degrees
- **Intensity Control**: Adjust overall halftone intensity

### Texture Modes
- None, Hatch, Crosshatch, Noise, Sketchy, Organic, Halftone, Segmented
- Zone-based texture application (low/mid/high tones)
- Adjustable texture density and angle

---

## Layer Management

### Layer Types
- **Image Layers**: Import and process photos and graphics
- **Text Layers**: Editable text with custom fonts and styling
- **Shape Layers**: Rectangles, circles, and polygons
- **Vector Layers**: SVG-style vector paths
- **Template Layers**: Alignment guides and grids

### Layer Properties
- **Position & Transform**: X, Y, Width, Height, Rotation
- **Visibility**: Show/hide individual layers
- **Lock**: Prevent accidental modifications
- **Opacity**: Layer transparency (0-100%)
- **Blending Modes**: Normal, Multiply, Screen, Overlay, Darken, Lighten, Difference

### LightBurn-Style Layer Settings
- **Color Coding**: 64 layer colors (C00-C63)
- **Mode**: Line (cut/vector) or Fill (raster/scan)
- **Power Range**: Min/Max power for variable power engraving
- **Speed**: Layer-specific feed rate
- **Passes**: Multiple pass support per layer
- **Priority**: Execution order control
- **Line Interval**: Spacing between scan lines for fill mode
- **Scan Angle**: Direction of raster scanning (0-360°)
- **Overscan**: Extra travel distance at edges
- **Air Assist**: Per-layer air assist control

### Variable Text
- Counter variables with start, step, and current value
- Automatic incrementing for serialization
- Template variable substitution

---

## Hardware Control

### Serial Communication
- **Native Tauri Serial**: Rust-based reliable serial communication
- **Port Detection**: Automatic USB serial port discovery
- **Connection Management**: Connect, disconnect, and reconnect
- **Real-time Monitoring**: TX/RX logging in console

### G-code Generation
- **Multi-mode Support**: M3 (constant power) and M4 (dynamic power)
- **Scan Patterns**: Horizontal, vertical, diagonal, crosshatch
- **Bidirectional Scanning**: Optional for faster engraving
- **Overscan**: Configurable overscan distance
- **Custom Scripts**: User-defined start and end G-code
- **Layer-aware Generation**: Separate G-code per layer with power/speed settings

### Movement Control
- **Feed Rate**: 100-10000 mm/min engraving speed
- **Travel Speed**: Rapid movement speed for non-marking moves
- **Jogging**: Manual positioning with adjustable sensitivity
- **Homing**: $H home command support
- **Position Tracking**: Real-time machine position display

### Power Control
- **Power Range**: 0-100% or 0-1000 S-value
- **Power Gamma**: Compensation curve (0.5-3.0)
- **Min/Max Power**: Variable power for grayscale
- **Test Fire**: Pulse laser at low power for alignment

---

## File Operations

### Project Files
- **Save Projects**: Complete project state (settings, layers, paths)
- **Load Projects**: Restore saved projects
- **Auto-versioning**: Project format versioning for compatibility

### G-code Export
- **Export G-code**: Save generated toolpaths as .gcode or .nc files
- **Include Scripts**: Automatically includes start/end G-code
- **Comments**: Human-readable comments in G-code

### Image Import
- **Supported Formats**: PNG, JPEG, GIF, BMP, WebP
- **Drag & Drop**: Easy image import
- **Base64 Encoding**: Efficient image storage

---

## User Interface

### Modern Design
- Dark theme optimized for low-light workshops
- High-contrast professional styling
- Smooth animations and transitions
- Responsive layout

### Interactive Canvas
- **Pan & Zoom**: Navigate large work areas
- **Multi-select**: Select and manipulate multiple layers
- **Handles**: Visual resize and rotate handles
- **Grid**: Optional alignment grid
- **Rulers**: Position measurement aids

### Real-time Preview
- **Path Visualization**: View generated toolpaths
- **Heat Map**: Color-coded power visualization
- **Layer Preview**: See final composite before engraving
- **Console**: Real-time G-code and status logging

### Help System
- **Interactive Tutorial**: Step-by-step guided tour (skippable)
- **Help Guide**: In-app documentation
- **Searchable Glossary**: 30+ terminology definitions with examples
- **Contextual Help**: Tool-tips and descriptions

### Settings Management
- **Custom Presets**: Save/load custom machine settings
- **Material Presets**: Quick settings for common materials
- **Persistent Settings**: Automatic save to localStorage
- **Import/Export**: Share settings between installations

---

## Safety Features

### Setup Wizard
- **Safety Compliance Checklist**:
  - Laser safety goggles verification
  - Ventilation confirmation
  - Fire extinguisher availability
  - Material safety confirmation (no PVC/vinyl)
- **Legal Agreement**: Liability disclaimer and terms of service
- **Cannot bypass**: Required on first launch

### Material Safety
- **Material Database**: Safe materials list
- **Warnings**: Toxic material warnings (PVC, vinyl, etc.)
- **Bare Metal Protocol**: Special instructions for copper/aluminum

### Operational Safety
- **Connection Required**: Cannot start jobs without laser connection
- **Emergency Stop**: Stop button available during engraving
- **Connection Monitoring**: Detects and alerts on disconnect
- **Power Limits**: Configurable max power limits

---

## Advanced Features

### Vision System (Camera Mapping)
- **Bed Mapping**: 4-point camera calibration
- **Real-time Overlay**: See design projected on work area
- **Opacity Control**: Adjustable overlay transparency
- **Material Positioning**: Place designs on irregular materials

### Rotary Axis Support
- **Rotary Mode**: Enable cylindrical object engraving
- **Diameter Compensation**: Object and roller diameter settings
- **Y-axis Mapping**: Automatic coordinate transformation

### Serialization System
- **Barcode Generation**: Standard 1D barcodes
- **Data Matrix**: 2D data matrix codes
- **QR Codes**: QR code generation with data encoding
- **Text Serial Numbers**: Sequential text numbering
- **Auto-increment**: Automatic counter after each job
- **Custom Patterns**: User-defined serial number formats

### Freehand Drawing
- **Drawing Mode**: Direct laser control for freehand art
- **Trigger Options**: Left click, right click, or spacebar
- **Speed Control**: Adjustable drawing speed
- **Smoothing**: Path smoothing for steady lines

### Material Library
Pre-configured settings for common materials:
- **Wood**: Plywood, oak, maple, walnut, bamboo
- **Acrylic**: Clear and colored cast acrylic
- **Leather**: Natural and faux leather
- **Metals**: Anodized aluminum, coated metals
- **Stone**: Slate, marble, granite
- **Other**: Cork, cardboard, fabric, rubber

### Filter Gallery
- **40+ Presets**: One-click professional filter combinations
- **Organized Categories**: Photo, artistic, technical presets
- **Preview**: Real-time filter preview
- **Favorites**: Save frequently used presets

### Performance Optimization
- **Multi-threading**: Parallel image processing
- **Efficient Algorithms**: Optimized path generation
- **Memory Management**: Handles large images efficiently
- **Incremental Updates**: Smooth UI during processing

### Cloud Features (Planned)
- **Cloud Collaboration**: Share designs and settings
- **Analytics Dashboard**: Job statistics and insights
- **Remote Monitoring**: Check job status from anywhere
- **Design Library**: Cloud storage for projects

---

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Save Project | Ctrl/Cmd + S |
| Load Project | Ctrl/Cmd + O |
| Undo | Ctrl/Cmd + Z |
| Redo | Ctrl/Cmd + Y |
| Delete Layer | Delete/Backspace |
| Help | F1 |

---

## System Requirements

### Minimum Requirements
- **OS**: Windows 10, macOS 10.15, or modern Linux
- **CPU**: Dual-core processor
- **RAM**: 4GB
- **Storage**: 500MB available space
- **Display**: 1280x720 resolution

### Recommended Requirements
- **OS**: Windows 11, macOS 12+, or Ubuntu 20.04+
- **CPU**: Quad-core processor or better
- **RAM**: 8GB or more
- **Storage**: 1GB available space
- **Display**: 1920x1080 resolution or higher

### Hardware Requirements
- USB port for laser connection
- CH340/CH341 USB-to-Serial drivers installed
- Compatible laser engraver with GRBL firmware

---

## License & Support

LaserTrace Pro is commercial software with a free trial version.

**Free Version** includes:
- Basic image editing
- Limited filters (3 of 7)
- G-code export
- Single layer support

**Premium License** unlocks:
- All 7 professional artistic filters
- Complete dithering suite (5 algorithms)
- 40+ filter presets
- Multi-layer support with LightBurn-style controls
- Material library (20+ materials)
- Project save/load
- Serial control
- Camera mapping
- Rotary support
- Serialization features
- Premium support

For licensing inquiries and support, visit: [https://github.com/Op-era/Laser-Pro-Engraver](https://github.com/Op-era/Laser-Pro-Engraver)

---

**Last Updated**: January 2026  
**Version**: 1.0.0  
**Copyright © 2026 Shane Foster. All Rights Reserved.**
