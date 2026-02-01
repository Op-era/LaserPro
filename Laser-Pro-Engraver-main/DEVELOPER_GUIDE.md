# LaserTrace Pro Developer Guide

Complete guide for developers working on LaserTrace Pro.

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Getting Started](#getting-started)
3. [Project Structure](#project-structure)
4. [Development Workflow](#development-workflow)
5. [Testing](#testing)
6. [Building & Distribution](#building--distribution)
7. [Contributing Guidelines](#contributing-guidelines)
8. [API Reference](#api-reference)

---

## Architecture Overview

### Tech Stack

**Frontend:**
- **React 19**: UI framework
- **TypeScript**: Type-safe JavaScript
- **Vite**: Build tool and dev server
- **Lucide React**: Icon library

**Backend:**
- **Tauri**: Native desktop app framework (Rust)
- **Rust**: System programming for serial communication
- **Native APIs**: File system, serial ports, system dialogs

**Testing:**
- **Vitest**: Unit and integration testing
- **Testing Library**: React component testing
- **Happy-DOM**: Lightweight DOM implementation

### Application Structure

```
LaserTrace Pro
├── Frontend (React/TypeScript)
│   ├── UI Components
│   ├── Image Processing
│   ├── G-code Generation
│   └── State Management
│
└── Backend (Tauri/Rust)
    ├── Serial Communication
    ├── File System Operations
    ├── Native Dialogs
    └── System Integration
```

---

## Getting Started

### Prerequisites

**Required:**
- Node.js 18 or later
- Rust 1.60 or later (with cargo)
- Git

**Platform-specific:**
- **Windows**: Visual Studio Build Tools, WebView2
- **macOS**: Xcode Command Line Tools
- **Linux**: webkit2gtk-4.0, build-essential

### Initial Setup

```bash
# Clone repository
git clone https://github.com/Op-era/Laser-Pro-Engraver.git
cd Laser-Pro-Engraver

# Install dependencies
npm install

# Run development server
npm run tauri:dev
```

### Development Commands

```bash
# Start dev server with hot reload
npm run tauri:dev

# Build frontend only (faster iteration)
npm run dev

# Run tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Build production app
npm run tauri:build

# Type checking
npx tsc --noEmit
```

---

## Project Structure

```
Laser-Pro-Engraver/
├── src-tauri/              # Rust backend
│   ├── src/
│   │   ├── main.rs         # Main Rust entry point
│   │   ├── serial.rs       # Serial communication
│   │   └── commands.rs     # Tauri commands
│   ├── Cargo.toml          # Rust dependencies
│   └── tauri.conf.json     # Tauri configuration
│
├── __tests__/              # Test files
│   ├── all-features.test.ts
│   ├── edge-cases.test.ts
│   ├── layerGCode.test.ts
│   └── ...
│
├── utils/                  # Utility modules
│   ├── gcodeGenerator.ts   # G-code generation
│   ├── imageProcessor.ts   # Image filters
│   ├── pathExtractor.ts    # Path tracing
│   ├── serialTauri.ts      # Serial controller
│   ├── fileIO.ts           # File operations
│   └── ...
│
├── Components              # React components (root level)
│   ├── App.tsx             # Main application
│   ├── SetupWizard.tsx     # Initial setup
│   ├── HelpGuide.tsx       # Help system
│   ├── Tutorial.tsx        # Interactive tutorial
│   ├── Glossary.tsx        # Terminology reference
│   ├── Sidebar.tsx         # Left sidebar
│   ├── ControlPanel.tsx    # Right controls
│   ├── PreviewArea.tsx     # Canvas area
│   ├── LayerPalette.tsx    # Layer management
│   └── ...
│
├── types.ts                # TypeScript type definitions
├── index.tsx               # React entry point
├── index.html              # HTML template
├── vite.config.ts          # Vite configuration
├── vitest.config.ts        # Test configuration
├── package.json            # Node dependencies
└── tsconfig.json           # TypeScript config
```

### Key Files

**App.tsx**: Main application component, manages global state and orchestrates all features.

**types.ts**: TypeScript interfaces for Settings, Layers, Paths, Materials, etc.

**utils/gcodeGenerator.ts**: Converts paths to G-code commands.

**utils/imageProcessor.ts**: Image manipulation algorithms (filters, dithering, halftone).

**utils/pathExtractor.ts**: Edge detection and path tracing.

**src-tauri/src/serial.rs**: Native serial port communication.

---

## Development Workflow

### Component Development

1. **Create Component**: Add new `.tsx` file in root or logical subdirectory
2. **Define Props**: Create interface for component props
3. **Implement**: Build component with TypeScript and React hooks
4. **Style**: Use Tailwind CSS classes (already configured)
5. **Test**: Add tests in `__tests__/` directory

Example component structure:

```tsx
import React, { useState } from 'react';
import { Icon } from 'lucide-react';

interface MyComponentProps {
  value: string;
  onChange: (value: string) => void;
}

export default function MyComponent({ value, onChange }: MyComponentProps) {
  return (
    <div className="p-4 bg-white/5 rounded-xl">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-black border border-white/10 rounded-xl px-4 py-2"
      />
    </div>
  );
}
```

### State Management

LaserTrace Pro uses React state and props (no Redux/Zustand). State flows:

```
App (root state)
  ├── settings: EngraverSettings
  ├── layers: Layer[]
  ├── paths: Path[]
  └── updateSettings()
      │
      ├──> Sidebar (props)
      ├──> ControlPanel (props)
      ├──> PreviewArea (props)
      └──> Child components
```

**Best Practices:**
- Keep state in App.tsx for global data
- Use local state for component-specific UI state
- Pass update functions as props
- Use `useCallback` for event handlers passed to children

### Adding New Features

1. **Update types.ts**: Add new interfaces/types if needed
2. **Create UI component**: Build the interface
3. **Add state**: Extend `EngraverSettings` or add new state
4. **Implement logic**: Add utility functions or integrate existing
5. **Wire up**: Connect component to App.tsx
6. **Test**: Write tests for new functionality
7. **Document**: Update relevant .md files

### Image Processing Pipeline

Image processing follows this pipeline:

```
1. Load Image → ImageData
2. Grayscale conversion (configurable channel weights)
3. Basic adjustments (brightness, contrast, gamma, exposure)
4. Levels/Curves adjustments
5. Artistic filters (oil painting, sketch, etc.)
6. Halftone/Dithering (if enabled)
7. Texture mapping (if enabled)
8. Threshold/Binary conversion
9. Path extraction (edge tracing)
10. G-code generation
```

Add new filters in `utils/imageProcessor.ts`.

### G-code Generation

G-code generation supports:
- Raster scanning (horizontal, vertical, diagonal)
- Vector paths (line following)
- Layer-aware generation (per-layer settings)
- M3/M4 modes
- Variable power (S-value ramping)

Add new G-code features in `utils/gcodeGenerator.ts` or `utils/layerGCode.ts`.

---

## Testing

### Running Tests

```bash
# Watch mode (recommended during development)
npm test

# Single run (CI/CD)
npm run test:run

# With UI (interactive)
npm run test:ui

# Coverage report
npm run test:coverage
```

### Test Structure

Tests are organized by feature area:

- `all-features.test.ts`: Core feature integration tests
- `edge-cases.test.ts`: Edge case and boundary testing
- `layerGCode.test.ts`: G-code generation tests
- `material-library.test.ts`: Material preset tests
- `professional-filters.test.ts`: Image filter tests
- `robustness-tests.test.ts`: Error handling and resilience
- `serialization.test.ts`: Serialization feature tests
- `stress-tests.test.ts`: Performance and load tests
- `variableText.test.ts`: Variable text feature tests

### Writing Tests

Example test:

```typescript
import { describe, it, expect } from 'vitest';
import { generateGCode } from '../utils/gcodeGenerator';
import { EngraverSettings, Path } from '../types';

describe('G-code Generation', () => {
  it('generates correct G-code for simple path', () => {
    const settings: EngraverSettings = {
      // ... settings
    };
    
    const paths: Path[] = [{
      id: '1',
      points: [{ x: 0, y: 0 }, { x: 10, y: 10 }],
      intensity: 100
    }];
    
    const gcode = generateGCode(paths, settings);
    
    expect(gcode).toContain('G0 X0 Y0');
    expect(gcode).toContain('G1 X10 Y10');
  });
});
```

### Component Testing

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import MyComponent from '../MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent value="test" onChange={() => {}} />);
    expect(screen.getByDisplayValue('test')).toBeInTheDocument();
  });
  
  it('calls onChange when input changes', () => {
    const onChange = vi.fn();
    render(<MyComponent value="test" onChange={onChange} />);
    
    fireEvent.change(screen.getByDisplayValue('test'), {
      target: { value: 'new value' }
    });
    
    expect(onChange).toHaveBeenCalledWith('new value');
  });
});
```

---

## Building & Distribution

### Development Build

```bash
# Start dev server
npm run tauri:dev
```

This opens the app with hot-reload enabled. Changes to React code reload instantly.

### Production Build

```bash
# Build for your platform
npm run tauri:build

# Or use platform-specific scripts
./build.sh       # Linux/macOS
build.bat        # Windows
```

**Output locations:**
- Windows: `src-tauri/target/release/bundle/msi/`
- macOS: `src-tauri/target/release/bundle/dmg/`
- Linux: `src-tauri/target/release/bundle/appimage/` or `deb/`

### Cross-Platform Builds

Tauri doesn't support cross-compilation easily. Build on the target platform:

- **Windows**: Use Windows machine or VM
- **macOS**: Use Mac machine (code signing requires Mac)
- **Linux**: Use Linux machine or WSL2/VM

### Build Scripts

```bash
# Build all installers (current platform)
./build-all.sh    # Linux/macOS
build-all.bat     # Windows
```

See [BUILD.md](BUILD.md) for detailed build instructions.

### Release Process

1. Update version in `package.json` and `src-tauri/Cargo.toml`
2. Update [CHANGELOG.md](CHANGELOG.md)
3. Build for all platforms
4. Test installers on clean systems
5. Create GitHub release
6. Upload installers as release assets
7. Update documentation if needed

See [RELEASE.md](RELEASE.md) for complete release checklist.

---

## Contributing Guidelines

### Code Style

**TypeScript/React:**
- Use functional components with hooks
- Prefer `const` over `let`
- Use descriptive variable names
- Add TypeScript types for all props and functions
- Use template literals for strings with variables

**Formatting:**
- 2-space indentation
- Single quotes for strings
- Semicolons required
- Trailing commas in objects/arrays

**Naming:**
- PascalCase for components: `MyComponent.tsx`
- camelCase for functions and variables: `myFunction`
- UPPER_CASE for constants: `MAX_VALUE`
- Descriptive names: `generateGCode` not `genGC`

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes and commit
git add .
git commit -m "feat: add my feature"

# Push to remote
git push origin feature/my-feature

# Create pull request on GitHub
```

**Commit messages:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `test:` Test additions/changes
- `chore:` Build process, dependencies

### Pull Request Process

1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Ensure tests pass: `npm run test:run`
5. Update documentation if needed
6. Submit pull request with clear description
7. Address review feedback

---

## API Reference

### Core Types

#### EngraverSettings
```typescript
interface EngraverSettings {
  machineModel: string;
  bedWidth: number;
  bedHeight: number;
  laserType: LaserSourceType;
  laserMode: LaserMode;
  feedRate: number;
  laserPower: number;
  // ... see types.ts for complete definition
}
```

#### Layer
```typescript
interface Layer {
  id: string;
  type: LayerType;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  powerMin: number;
  powerMax: number;
  // ... see types.ts for complete definition
}
```

#### Path
```typescript
interface Path {
  id: string;
  points: Point[];
  intensity?: number;
  speed?: number;
  passes?: number;
  // ... see types.ts for complete definition
}
```

### Utility Functions

#### Image Processing

```typescript
// Grayscale conversion
grayscale(data: Uint8ClampedArray, rWeight: number, gWeight: number, bWeight: number): void

// Apply filters
applyFilters(data: Uint8ClampedArray, brightness: number, contrast: number, gamma: number, exposure: number): void

// Dithering
applyDithering(data: Uint8ClampedArray, width: number, height: number, algorithm: DitherType): void
```

#### G-code Generation

```typescript
// Generate G-code from paths
generateGCode(paths: Path[], settings: EngraverSettings): string[]

// Layer-aware G-code
generateLayerAwareGCode(paths: Path[], layers: Layer[], settings: EngraverSettings): string[]
```

#### Path Extraction

```typescript
// Trace edges to paths
traceEdges(imageData: ImageData, scale: number): Point[][]
```

### Tauri Commands

Rust backend provides these commands:

```typescript
// Serial port operations
TauriSerialController.listPorts(): Promise<SerialPortInfo[]>
TauriSerialController.connect(port: string, baudRate: number): Promise<string>
TauriSerialController.disconnect(): Promise<void>
TauriSerialController.sendGCode(command: string): Promise<void>
TauriSerialController.isConnected(): Promise<boolean>

// File operations
saveProject(settings, layers, paths): Promise<boolean>
loadProject(): Promise<ProjectData | null>
exportGCode(gcode: string): Promise<boolean>
```

See `src-tauri/src/main.rs` for Rust implementation details.

---

## Debugging

### Frontend Debugging

**Browser DevTools:**
```bash
# Dev mode opens with DevTools
npm run tauri:dev
```
- Press F12 or Cmd+Option+I to open DevTools
- Use Console, Network, and React DevTools tabs

**Logging:**
```typescript
console.log('Debug info:', variable);
console.error('Error:', error);
```

### Rust Debugging

**Print debugging:**
```rust
println!("Debug: {:?}", variable);
eprintln!("Error: {:?}", error);
```

**Run with logging:**
```bash
RUST_LOG=debug npm run tauri:dev
```

### Common Issues

**"Module not found"**: Run `npm install`

**"Rust compilation failed"**: Update Rust with `rustup update`

**"WebView2 missing" (Windows)**: Install WebView2 Runtime

**Serial port access denied**: Check permissions, close other apps using the port

---

## Resources

### Documentation
- [Tauri Documentation](https://tauri.app)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Vitest Documentation](https://vitest.dev)

### Community
- GitHub Issues: Bug reports and feature requests
- GitHub Discussions: Q&A and community help

### License
See [LICENSE](LICENSE) file for commercial license terms.

---

**LaserTrace Pro Developer Guide**  
Version 1.0 | January 2026  
Copyright © 2026 Shane Foster. All Rights Reserved.
