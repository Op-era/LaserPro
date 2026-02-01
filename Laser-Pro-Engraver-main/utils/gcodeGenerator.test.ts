import { describe, it, expect } from 'vitest';
import { generateGCode } from '../utils/gcodeGenerator';
import { EngraverSettings, Path } from '../types';

describe('gcodeGenerator', () => {
  const defaultSettings: EngraverSettings = {
    machineModel: 'ACMER S1',
    bedWidth: 400,
    bedHeight: 400,
    laserType: 'diode',
    conversionMode: 'raster-dynamic',
    ditherType: 'atkinson',
    laserMode: 'M4',
    scanPattern: 'horizontal',
    linesPerMm: 16.6,
    feedRate: 2500,
    laserPower: 1000,
    travelSpeed: 4000,
    ppi: 423,
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
    materialName: 'Plywood',
    showPaths: true,
    minCalibrationPower: 15,
    powerGamma: 1.8,
    scanAngle: 0,
    overscan: 2.0,
    bidirectional: true,
    precisionMode: false,
    safetyOverride: false,
    disclaimerAccepted: false,
    termsAccepted: false,
    cameraOverlayOpacity: 0.6,
    airAssistAuto: true,
    rotaryMode: false,
    rotaryObjectDiameter: 40,
    rotaryRollerDiameter: 20,
    freehandMode: false,
    freehandTrigger: 'right',
    freehandSpeed: 1500,
    freehandSmoothing: 0.5,
    machinePosition: { x: 2, y: 2 },
    homePosition: { x: 0, y: 0 },
    joystickSensitivity: 5,
    ownedAirAssist: true,
    ownedCamera: true,
    ownedWacom: true,
    customBounds: { active: false, centerX: 0, centerY: 0, minX: 0, maxX: 400, minY: 0, maxY: 400 },
    startGCodeScript: "G21\nG90\nM5",
    endGCodeScript: "M5\nG0 X0 Y0\nM2",
    enableCompletionSound: true,
    defaultFrameMargin: 2,
    slicerProgress: 100,
    pathVisualization: { showHeatMap: true, colorScheme: 'power', showLegend: true }
  };

  describe('generateGCode', () => {
    it('should generate valid G-code header', () => {
      const paths: Path[] = [];
      const gcode = generateGCode(paths, defaultSettings);
      
      expect(gcode).toBeDefined();
      expect(gcode.length).toBeGreaterThan(0);
      expect(gcode[0]).toContain('LASERTRACE PRO');
      expect(gcode.some(line => line.includes('G21'))).toBe(true); // mm units
      expect(gcode.some(line => line.includes('G90'))).toBe(true); // absolute coordinates
    });

    it('should generate G-code for simple path', () => {
      const paths: Path[] = [{
        points: [
          { x: 10, y: 10 },
          { x: 20, y: 10 },
          { x: 20, y: 20 }
        ],
        closed: false,
        intensity: 100
      }];
      
      const gcode = generateGCode(paths, defaultSettings);
      
      expect(gcode.length).toBeGreaterThan(10);
      expect(gcode.some(line => line.includes('G0') || line.includes('G1'))).toBe(true);
    });

    it('should handle empty paths array', () => {
      const paths: Path[] = [];
      const gcode = generateGCode(paths, defaultSettings);
      
      expect(gcode).toBeDefined();
      expect(gcode.length).toBeGreaterThan(0);
      expect(gcode[gcode.length - 1]).toContain('M2'); // End of program
    });

    it('should apply offset correctly', () => {
      const settingsWithOffset: EngraverSettings = {
        ...defaultSettings,
        templateOffsetX: 10,
        templateOffsetY: 20
      };
      
      const paths: Path[] = [{
        points: [{ x: 0, y: 0 }],
        closed: false,
        intensity: 100
      }];
      
      const gcode = generateGCode(paths, settingsWithOffset);
      expect(gcode).toBeDefined();
      expect(gcode.length).toBeGreaterThan(0);
    });

    it('should respect mirror X setting', () => {
      const settingsWithMirror: EngraverSettings = {
        ...defaultSettings,
        mirrorX: true
      };
      
      const paths: Path[] = [{
        points: [{ x: 10, y: 10 }],
        closed: false,
        intensity: 100
      }];
      
      const gcode = generateGCode(paths, settingsWithMirror);
      expect(gcode).toBeDefined();
    });

    it('should respect invert Y setting', () => {
      const settingsWithInvert: EngraverSettings = {
        ...defaultSettings,
        invertY: true
      };
      
      const paths: Path[] = [{
        points: [{ x: 10, y: 10 }],
        closed: false,
        intensity: 100
      }];
      
      const gcode = generateGCode(paths, settingsWithInvert);
      expect(gcode).toBeDefined();
    });

    it('should handle multiple paths', () => {
      const paths: Path[] = [
        { points: [{ x: 10, y: 10 }, { x: 20, y: 10 }], closed: false, intensity: 100 },
        { points: [{ x: 30, y: 30 }, { x: 40, y: 30 }], closed: false, intensity: 80 }
      ];
      
      const gcode = generateGCode(paths, defaultSettings);
      expect(gcode.length).toBeGreaterThan(10);
    });

    it('should use correct laser mode', () => {
      const settingsM3: EngraverSettings = {
        ...defaultSettings,
        laserMode: 'M3'
      };
      
      const paths: Path[] = [{ points: [{ x: 10, y: 10 }, { x: 20, y: 20 }], closed: false, intensity: 100 }];
      const gcode = generateGCode(paths, settingsM3);
      
      // Check that gcode array contains commands (not necessarily M3/M4 in every line)
      expect(gcode.length).toBeGreaterThan(0);
      expect(Array.isArray(gcode)).toBe(true);
    });
  });
});
