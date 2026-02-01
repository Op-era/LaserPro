/**
 * HOMING BOUNDARY TESTS
 * Verifies that homing establishes proper minimum boundaries
 * and that coordinates cannot exceed bed dimensions
 */

import { describe, it, expect } from 'vitest';
import { generateGCode } from '../utils/gcodeGenerator';
import { generateLayerAwareGCode } from '../utils/layerGCode';
import { EngraverSettings, Path, Layer } from '../types';

describe('Homing Boundary Tests', () => {
  
  const createTestSettings = (homeX: number = 0, homeY: number = 0): EngraverSettings => ({
    machineModel: 'Test Machine',
    bedWidth: 400,
    bedHeight: 400,
    laserType: 'diode',
    conversionMode: 'vector',
    ditherType: 'atkinson',
    laserMode: 'M4',
    scanPattern: 'horizontal',
    linesPerMm: 10,
    feedRate: 2000,
    laserPower: 1000,
    travelSpeed: 4000,
    ppi: 254,
    resolution: 5,
    invertY: false,
    mirrorX: false,
    threshold: 128,
    contrast: 0,
    testFirePower: 15,
    workAreaWidth: 400,
    workAreaHeight: 400,
    templateWidth: 400,
    templateHeight: 400,
    templateOffsetX: 0,
    templateOffsetY: 0,
    templateShape: 'rect',
    tonePoints: [],
    jobType: 'etch',
    passes: 1,
    materialName: 'Wood',
    showPaths: true,
    minCalibrationPower: 15,
    powerGamma: 1.8,
    scanAngle: 0,
    overscan: 0,
    bidirectional: false,
    precisionMode: false,
    safetyOverride: false,
    disclaimerAccepted: true,
    termsAccepted: true,
    cameraOverlayOpacity: 0.5,
    airAssistAuto: false,
    rotaryMode: false,
    rotaryObjectDiameter: 40,
    rotaryRollerDiameter: 20,
    freehandMode: false,
    freehandTrigger: 'left',
    freehandSpeed: 1500,
    freehandSmoothing: 0.5,
    machinePosition: { x: homeX, y: homeY },
    homePosition: { x: homeX, y: homeY },
    joystickSensitivity: 5,
    ownedAirAssist: false,
    ownedCamera: false,
    ownedWacom: false,
    customBounds: {
      active: false,
      centerX: 200,
      centerY: 200,
      minX: 0,
      maxX: 400,
      minY: 0,
      maxY: 400,
    },
    startGCodeScript: 'G21\nG90',
    endGCodeScript: 'M5\nM2',
    enableCompletionSound: false,
    defaultFrameMargin: 2,
    slicerProgress: 0,
    pathVisualization: {
      showHeatMap: false,
      colorScheme: 'power',
      showLegend: false,
    },
  });

  describe('Home Position as Minimum Boundary', () => {
    
    it('should enforce home position (0,0) as minimum when homed at origin', () => {
      const settings = createTestSettings(0, 0);
      
      // Create paths that try to go negative
      const paths: Path[] = [{
        id: 'negative-test',
        points: [
          { x: -10, y: -10 },  // Should clamp to (0, 0)
          { x: 50, y: 50 },
        ],
        intensity: 100,
      }];

      const gcode = generateGCode(paths, settings);
      
      // Find coordinate lines
      const coordLines = gcode.filter(line => 
        (line.includes('G0') || line.includes('G1')) && 
        (line.includes('X') || line.includes('Y'))
      );

      // Check that no coordinates are below home position (0,0)
      coordLines.forEach(line => {
        const xMatch = line.match(/X([0-9.-]+)/);
        const yMatch = line.match(/Y([0-9.-]+)/);
        
        if (xMatch) {
          const x = parseFloat(xMatch[1]);
          expect(x).toBeGreaterThanOrEqual(0);
        }
        if (yMatch) {
          const y = parseFloat(yMatch[1]);
          expect(y).toBeGreaterThanOrEqual(0);
        }
      });
    });

    it('should enforce custom home position (50,50) as minimum', () => {
      const settings = createTestSettings(50, 50);
      
      // Create paths that try to go below home position
      const paths: Path[] = [{
        id: 'below-home-test',
        points: [
          { x: 10, y: 10 },   // Should clamp to (50, 50)
          { x: 100, y: 100 },
        ],
        intensity: 100,
      }];

      const gcode = generateGCode(paths, settings);
      
      const coordLines = gcode.filter(line => 
        (line.includes('G0') || line.includes('G1')) && 
        (line.includes('X') || line.includes('Y'))
      );

      coordLines.forEach(line => {
        const xMatch = line.match(/X([0-9.-]+)/);
        const yMatch = line.match(/Y([0-9.-]+)/);
        
        if (xMatch) {
          const x = parseFloat(xMatch[1]);
          expect(x).toBeGreaterThanOrEqual(50);
        }
        if (yMatch) {
          const y = parseFloat(yMatch[1]);
          expect(y).toBeGreaterThanOrEqual(50);
        }
      });
    });

    it('should return to home position at end of job', () => {
      const settings = createTestSettings(25, 25);
      
      const paths: Path[] = [{
        id: 'return-home-test',
        points: [
          { x: 100, y: 100 },
          { x: 200, y: 200 },
        ],
        intensity: 100,
      }];

      const gcode = generateGCode(paths, settings);
      
      // Find the return home command
      const returnHomeLines = gcode.filter(line => 
        line.includes('return to homed position') || 
        line.includes('return home')
      );
      
      expect(returnHomeLines.length).toBeGreaterThan(0);
      
      // Check that the previous line has the correct home coordinates
      const lastMoveIndex = gcode.length - 2; // Line before M2
      const lastMove = gcode[lastMoveIndex];
      
      expect(lastMove).toContain('X25.000');
      expect(lastMove).toContain('Y25.000');
    });
  });

  describe('Maximum Bed Size Boundary', () => {
    
    it('should enforce bedWidth and bedHeight as maximum boundaries', () => {
      const settings = createTestSettings(0, 0);
      
      // Create paths that exceed bed dimensions
      const paths: Path[] = [{
        id: 'exceed-bed-test',
        points: [
          { x: 500, y: 500 },  // Exceeds 400x400 bed, should clamp
          { x: 600, y: 600 },
        ],
        intensity: 100,
      }];

      const gcode = generateGCode(paths, settings);
      
      const coordLines = gcode.filter(line => 
        (line.includes('G0') || line.includes('G1')) && 
        (line.includes('X') || line.includes('Y'))
      );

      coordLines.forEach(line => {
        const xMatch = line.match(/X([0-9.-]+)/);
        const yMatch = line.match(/Y([0-9.-]+)/);
        
        if (xMatch) {
          const x = parseFloat(xMatch[1]);
          expect(x).toBeLessThanOrEqual(400);
        }
        if (yMatch) {
          const y = parseFloat(yMatch[1]);
          expect(y).toBeLessThanOrEqual(400);
        }
      });
    });

    it('should constrain to smaller of workArea and bed dimensions', () => {
      const settings = createTestSettings(0, 0);
      // Make workArea smaller than bed
      settings.workAreaWidth = 300;
      settings.workAreaHeight = 300;
      
      const paths: Path[] = [{
        id: 'constrain-test',
        points: [
          { x: 350, y: 350 },  // Between workArea (300) and bed (400)
          { x: 400, y: 400 },
        ],
        intensity: 100,
      }];

      const gcode = generateGCode(paths, settings);
      
      const coordLines = gcode.filter(line => 
        (line.includes('G0') || line.includes('G1')) && 
        (line.includes('X') || line.includes('Y'))
      );

      coordLines.forEach(line => {
        const xMatch = line.match(/X([0-9.-]+)/);
        const yMatch = line.match(/Y([0-9.-]+)/);
        
        if (xMatch) {
          const x = parseFloat(xMatch[1]);
          expect(x).toBeLessThanOrEqual(300);
        }
        if (yMatch) {
          const y = parseFloat(yMatch[1]);
          expect(y).toBeLessThanOrEqual(300);
        }
      });
    });
  });

  describe('Layer G-code Boundaries', () => {
    
    it('should enforce boundaries in layer-aware G-code generation', () => {
      const settings = createTestSettings(10, 10);
      
      const layers: Layer[] = [{
        id: 'layer-1',
        name: 'Test Layer',
        visible: true,
        locked: false,
        paths: [{
          id: 'path-1',
          points: [
            { x: -5, y: -5 },   // Below home, should clamp to (10, 10)
            { x: 500, y: 500 }, // Above bed, should clamp to (400, 400)
          ],
          intensity: 100,
        }],
        opacity: 1,
        blendMode: 'normal',
        color: '#ffffff',
        laserPower: 1000,
        feedRate: 2000,
        passes: 1,
        zOffset: 0,
        airAssist: false,
      }];

      const gcode = generateLayerAwareGCode(layers, settings);
      
      const coordLines = gcode.filter(line => 
        (line.includes('G0') || line.includes('G1')) && 
        (line.includes('X') || line.includes('Y'))
      );

      coordLines.forEach(line => {
        const xMatch = line.match(/X([0-9.-]+)/);
        const yMatch = line.match(/Y([0-9.-]+)/);
        
        if (xMatch) {
          const x = parseFloat(xMatch[1]);
          expect(x).toBeGreaterThanOrEqual(10);  // Home position
          expect(x).toBeLessThanOrEqual(400);    // Bed limit
        }
        if (yMatch) {
          const y = parseFloat(yMatch[1]);
          expect(y).toBeGreaterThanOrEqual(10);  // Home position
          expect(y).toBeLessThanOrEqual(400);    // Bed limit
        }
      });
    });

    it('should return to home position after layer completion', () => {
      const settings = createTestSettings(30, 30);
      
      const layers: Layer[] = [{
        id: 'layer-1',
        name: 'Test Layer',
        visible: true,
        locked: false,
        paths: [{
          id: 'path-1',
          points: [{ x: 100, y: 100 }, { x: 200, y: 200 }],
          intensity: 100,
        }],
        opacity: 1,
        blendMode: 'normal',
        color: '#ffffff',
        laserPower: 1000,
        feedRate: 2000,
        passes: 1,
        zOffset: 0,
        airAssist: false,
      }];

      const gcode = generateLayerAwareGCode(layers, settings);
      
      // Find final movement command before M2
      const m2Index = gcode.findIndex(line => line.includes('M2'));
      expect(m2Index).toBeGreaterThan(0);
      
      // Look backwards for the last G0 command
      for (let i = m2Index - 1; i >= 0; i--) {
        if (gcode[i].includes('G0') && gcode[i].includes('X') && gcode[i].includes('Y')) {
          expect(gcode[i]).toContain('X30.000');
          expect(gcode[i]).toContain('Y30.000');
          break;
        }
      }
    });
  });

  describe('Edge Cases', () => {
    
    it('should handle when home position equals bed size (no valid area)', () => {
      const settings = createTestSettings(400, 400);
      
      const paths: Path[] = [{
        id: 'no-area-test',
        points: [{ x: 100, y: 100 }, { x: 200, y: 200 }],
        intensity: 100,
      }];

      // Should not crash, but will clamp everything to home position
      expect(() => generateGCode(paths, settings)).not.toThrow();
    });

    it('should handle missing home position (default to origin)', () => {
      const settings = createTestSettings(0, 0);
      delete (settings as any).homePosition; // Remove homePosition
      
      const paths: Path[] = [{
        id: 'default-home-test',
        points: [{ x: -10, y: -10 }, { x: 100, y: 100 }],
        intensity: 100,
      }];

      const gcode = generateGCode(paths, settings);
      
      // Should default to (0, 0) as minimum
      const coordLines = gcode.filter(line => 
        (line.includes('G0') || line.includes('G1')) && 
        (line.includes('X') || line.includes('Y'))
      );

      coordLines.forEach(line => {
        const xMatch = line.match(/X([0-9.-]+)/);
        const yMatch = line.match(/Y([0-9.-]+)/);
        
        if (xMatch) expect(parseFloat(xMatch[1])).toBeGreaterThanOrEqual(0);
        if (yMatch) expect(parseFloat(yMatch[1])).toBeGreaterThanOrEqual(0);
      });
    });
  });
});
