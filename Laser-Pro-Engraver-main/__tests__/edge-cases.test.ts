/**
 * EDGE CASE TESTS - "Break It" Testing Suite
 * Tests designed to find breaking points, edge cases, and boundary conditions
 */

import { describe, it, expect } from 'vitest';
import {
  applyFloydSteinbergDither,
  applyAtkinsonDither,
  grayscale,
  thresholdFilter,
  applySaturation,
  applyHue,
  applyPosterization,
  applyLevels,
  applyCurves,
  applyConvolution,
} from '../utils/imageProcessor';
import { generateGCode } from '../utils/gcodeGenerator';
import { traceEdges } from '../utils/pathExtractor';
import { EngraverSettings, Path } from '../types';

describe('Edge Case Tests - Image Processing', () => {
  
  // Helper to create test image data
  const createTestImage = (width: number, height: number, fillValue: number = 128): ImageData => {
    const data = new ImageData(width, height);
    for (let i = 0; i < data.data.length; i += 4) {
      data.data[i] = fillValue;
      data.data[i + 1] = fillValue;
      data.data[i + 2] = fillValue;
      data.data[i + 3] = 255;
    }
    return data;
  };

  describe('Extreme Size Tests', () => {
    it('should handle 1x1 pixel images without crashing', () => {
      const img = createTestImage(1, 1, 128);
      expect(() => grayscale(img.data, img.width, img.height)).not.toThrow();
      expect(() => applyFloydSteinbergDither(img.data, img.width, img.height)).not.toThrow();
      expect(() => thresholdFilter(img.data, img.width, img.height, 128)).not.toThrow();
    });

    it('should handle 1xN pixel images (single row)', () => {
      const img = createTestImage(1, 100, 128);
      expect(() => applyFloydSteinbergDither(img.data, img.width, img.height)).not.toThrow();
      expect(() => applyAtkinsonDither(img.data, img.width, img.height)).not.toThrow();
    });

    it('should handle Nx1 pixel images (single column)', () => {
      const img = createTestImage(100, 1, 128);
      expect(() => applyFloydSteinbergDither(img.data, img.width, img.height)).not.toThrow();
      expect(() => applyAtkinsonDither(img.data, img.width, img.height)).not.toThrow();
    });

    it('should handle very large images (1000x1000)', () => {
      const img = createTestImage(1000, 1000, 128);
      const startTime = Date.now();
      grayscale(img.data, img.width, img.height);
      const duration = Date.now() - startTime;
      
      // Should complete in reasonable time (< 5 seconds)
      expect(duration).toBeLessThan(5000);
    });

    it('should handle extreme aspect ratios (1000x2)', () => {
      const img = createTestImage(1000, 2, 128);
      expect(() => applyFloydSteinbergDither(img.data, img.width, img.height)).not.toThrow();
    });
  });

  describe('Extreme Value Tests', () => {
    it('should handle all-black images (value 0)', () => {
      const img = createTestImage(50, 50, 0);
      grayscale(img.data, img.width, img.height);
      expect(img.data[0]).toBe(0);
      
      thresholdFilter(img.data, 128, false);
      expect(img.data[0]).toBe(0);
    });

    it('should handle all-white images (value 255)', () => {
      const img = createTestImage(50, 50, 255);
      grayscale(img.data, img.width, img.height);
      expect(img.data[0]).toBe(255);
      
      thresholdFilter(img.data, 128, false);
      expect(img.data[0]).toBe(255);
    });

    it('should handle extreme saturation values', () => {
      const img = createTestImage(50, 50, 128);
      
      // Test extreme saturation increase
      expect(() => applySaturation(img.data, img.width, img.height, 10.0)).not.toThrow();
      
      // Test extreme saturation decrease
      const img2 = createTestImage(50, 50, 128);
      expect(() => applySaturation(img2.data, img2.width, img2.height, -10.0)).not.toThrow();
    });

    it('should handle extreme hue shifts', () => {
      const img = createTestImage(50, 50, 128);
      
      // Test extreme hue shift
      expect(() => applyHue(img.data, img.width, img.height, 360)).not.toThrow();
      expect(() => applyHue(img.data, img.width, img.height, -360)).not.toThrow();
      expect(() => applyHue(img.data, img.width, img.height, 720)).not.toThrow();
    });

    it('should handle posterization with extreme levels', () => {
      const img = createTestImage(50, 50, 128);
      
      // Test minimum levels
      expect(() => applyPosterization(img.data, img.width, img.height, 2)).not.toThrow();
      
      // Test maximum levels
      expect(() => applyPosterization(img.data, img.width, img.height, 256)).not.toThrow();
    });

    it('should handle threshold at boundary values', () => {
      const img = createTestImage(50, 50, 128);
      
      // Test at 0
      expect(() => thresholdFilter(img.data, 0, false)).not.toThrow();
      
      // Test at 255
      expect(() => thresholdFilter(img.data, 255, false)).not.toThrow();
    });
  });

  describe('Invalid Input Handling', () => {
    it('should handle empty ImageData gracefully', () => {
      const img = createTestImage(0, 0, 128);
      // Should not crash with 0x0 image
      expect(() => grayscale(img.data, 0, 0)).not.toThrow();
    });

    it('should handle mismatched width/height', () => {
      const img = createTestImage(10, 10, 128);
      
      // Width is larger than actual data allows
      expect(() => grayscale(img.data, 100, 10)).not.toThrow();
    });

    it('should handle negative levels in posterization', () => {
      const img = createTestImage(50, 50, 128);
      
      // Should clamp to valid range
      expect(() => applyPosterization(img.data, img.width, img.height, 0)).not.toThrow();
      expect(() => applyPosterization(img.data, img.width, img.height, -1)).not.toThrow();
    });
  });

  describe('Curve and Levels Edge Cases', () => {
    it('should handle empty curve points array', () => {
      const img = createTestImage(50, 50, 128);
      expect(() => applyCurves(img.data, img.width, img.height, [])).not.toThrow();
    });

    it('should handle single curve point', () => {
      const img = createTestImage(50, 50, 128);
      expect(() => applyCurves(img.data, img.width, img.height, [{ x: 128, y: 200 }])).not.toThrow();
    });

    it('should handle extreme curve points', () => {
      const img = createTestImage(50, 50, 128);
      const extremeCurve = [
        { x: 0, y: 255 },
        { x: 255, y: 0 }
      ];
      expect(() => applyCurves(img.data, img.width, img.height, extremeCurve)).not.toThrow();
    });

    it('should handle inverted levels (black > white)', () => {
      const img = createTestImage(50, 50, 128);
      // Black point higher than white point
      expect(() => applyLevels(img.data, img.width, img.height, 200, 100, 255)).not.toThrow();
    });

    it('should handle extreme level values', () => {
      const img = createTestImage(50, 50, 128);
      
      // All at 0
      expect(() => applyLevels(img.data, img.width, img.height, 0, 0, 0)).not.toThrow();
      
      // All at 255
      expect(() => applyLevels(img.data, img.width, img.height, 255, 255, 255)).not.toThrow();
    });
  });

  describe('Convolution Edge Cases', () => {
    it('should handle empty kernel', () => {
      const img = createTestImage(50, 50, 128);
      expect(() => applyConvolution(img.data, img.width, img.height, [], 1)).not.toThrow();
    });

    it('should handle 1x1 kernel', () => {
      const img = createTestImage(50, 50, 128);
      expect(() => applyConvolution(img.data, img.width, img.height, [1], 1)).not.toThrow();
    });

    it('should handle large kernel (9x9)', () => {
      const img = createTestImage(50, 50, 128);
      const kernel = Array(81).fill(1);
      expect(() => applyConvolution(img.data, img.width, img.height, kernel, 9)).not.toThrow();
    });

    it('should handle all-zero kernel', () => {
      const img = createTestImage(50, 50, 128);
      const kernel = [0, 0, 0, 0, 0, 0, 0, 0, 0];
      expect(() => applyConvolution(img.data, img.width, img.height, kernel, 3)).not.toThrow();
    });

    it('should handle negative kernel values', () => {
      const img = createTestImage(50, 50, 128);
      const kernel = [-1, -1, -1, -1, 8, -1, -1, -1, -1]; // Edge detection
      expect(() => applyConvolution(img.data, img.width, img.height, kernel, 3)).not.toThrow();
    });

    it('should handle extreme kernel values', () => {
      const img = createTestImage(50, 50, 128);
      const kernel = [1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000];
      expect(() => applyConvolution(img.data, img.width, img.height, kernel, 3)).not.toThrow();
    });
  });
});

describe('Edge Case Tests - G-code Generation', () => {
  const baseSettings: EngraverSettings = {
    machineModel: 'test',
    bedWidth: 400,
    bedHeight: 400,
    laserType: 'diode',
    conversionMode: 'raster-dynamic',
    ditherType: 'atkinson',
    laserMode: 'M4',
    scanPattern: 'horizontal',
    linesPerMm: 10,
    feedRate: 1000,
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
    materialName: 'test',
    showPaths: true,
    minCalibrationPower: 15,
    powerGamma: 1.0,
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
    freehandTrigger: 'right',
    freehandSpeed: 1500,
    freehandSmoothing: 0.5,
    machinePosition: { x: 0, y: 0 },
    homePosition: { x: 0, y: 0 },
    joystickSensitivity: 5,
    ownedAirAssist: false,
    ownedCamera: false,
    ownedWacom: false,
    customBounds: {
      active: false,
      centerX: 0,
      centerY: 0,
      minX: 0,
      maxX: 400,
      minY: 0,
      maxY: 400,
    },
    startGCodeScript: 'G21\nG90',
    endGCodeScript: 'M5',
    enableCompletionSound: false,
    defaultFrameMargin: 2,
    slicerProgress: 100,
    pathVisualization: {
      showHeatMap: false,
      colorScheme: 'power',
      showLegend: false,
    },
    serialization: {
      enabled: false,
      type: 'barcode',
      format: 'numeric',
      prefix: '',
      startNumber: 1,
      currentNumber: 1,
      increment: 1,
      suffix: '',
      x: 0,
      y: 0,
      width: 50,
      height: 10,
    },
  };

  describe('Empty and Invalid Paths', () => {
    it('should handle empty paths array', () => {
      const gcode = generateGCode([], baseSettings);
      expect(gcode).toBeDefined();
      expect(Array.isArray(gcode)).toBe(true);
      // Should have header and footer at minimum
      expect(gcode.length).toBeGreaterThan(0);
    });

    it('should handle paths with empty points array', () => {
      const paths: Path[] = [{
        id: 'test',
        points: [],
        intensity: 100,
      }];
      const gcode = generateGCode(paths, baseSettings);
      expect(gcode).toBeDefined();
      expect(Array.isArray(gcode)).toBe(true);
    });

    it('should handle paths with single point', () => {
      const paths: Path[] = [{
        id: 'test',
        points: [{ x: 100, y: 100 }],
        intensity: 100,
      }];
      const gcode = generateGCode(paths, baseSettings);
      expect(gcode).toBeDefined();
      expect(Array.isArray(gcode)).toBe(true);
    });

    it('should handle very large number of paths (1000 paths)', () => {
      const paths: Path[] = Array(1000).fill(null).map((_, i) => ({
        id: `path-${i}`,
        points: [
          { x: 0, y: 0 },
          { x: 10, y: 10 },
        ],
        intensity: 100,
      }));
      
      const startTime = Date.now();
      const gcode = generateGCode(paths, baseSettings);
      const duration = Date.now() - startTime;
      
      expect(gcode).toBeDefined();
      // Should complete in reasonable time (< 5 seconds)
      expect(duration).toBeLessThan(5000);
    });

    it('should handle paths with extremely long point arrays (10000 points)', () => {
      const points = Array(10000).fill(null).map((_, i) => ({
        x: i % 400,
        y: Math.floor(i / 400),
      }));
      
      const paths: Path[] = [{
        id: 'long-path',
        points,
        intensity: 100,
      }];
      
      const startTime = Date.now();
      const gcode = generateGCode(paths, baseSettings);
      const duration = Date.now() - startTime;
      
      expect(gcode).toBeDefined();
      expect(duration).toBeLessThan(10000);
    });
  });

  describe('Extreme Coordinate Values', () => {
    it('should handle negative coordinates', () => {
      const paths: Path[] = [{
        id: 'negative',
        points: [
          { x: -100, y: -100 },
          { x: -50, y: -50 },
        ],
        intensity: 100,
      }];
      
      const gcode = generateGCode(paths, baseSettings);
      expect(gcode).toBeDefined();
      
      // Should clamp to valid range (0, 0)
      const hasNegative = gcode.some(line => 
        line.includes('X-') || line.includes('Y-')
      );
      expect(hasNegative).toBe(false);
    });

    it('should handle coordinates beyond work area', () => {
      const paths: Path[] = [{
        id: 'beyond',
        points: [
          { x: 10000, y: 10000 },
          { x: 20000, y: 20000 },
        ],
        intensity: 100,
      }];
      
      const gcode = generateGCode(paths, baseSettings);
      expect(gcode).toBeDefined();
      
      // Should clamp to work area bounds (400, 400)
      const lines = gcode.filter(line => line.includes('X') || line.includes('Y'));
      lines.forEach(line => {
        const xMatch = line.match(/X([0-9.]+)/);
        const yMatch = line.match(/Y([0-9.]+)/);
        if (xMatch) expect(parseFloat(xMatch[1])).toBeLessThanOrEqual(baseSettings.workAreaWidth);
        if (yMatch) expect(parseFloat(yMatch[1])).toBeLessThanOrEqual(baseSettings.workAreaHeight);
      });
    });

    it('should handle zero-size work area', () => {
      const settings = { ...baseSettings, workAreaWidth: 0, workAreaHeight: 0 };
      const paths: Path[] = [{
        id: 'test',
        points: [{ x: 10, y: 10 }, { x: 20, y: 20 }],
        intensity: 100,
      }];
      
      expect(() => generateGCode(paths, settings)).not.toThrow();
    });
  });

  describe('Extreme Power and Speed Values', () => {
    it('should handle zero power', () => {
      const settings = { ...baseSettings, laserPower: 0 };
      const paths: Path[] = [{
        id: 'test',
        points: [{ x: 0, y: 0 }, { x: 100, y: 100 }],
        intensity: 100,
      }];
      
      const gcode = generateGCode(paths, settings);
      expect(gcode).toBeDefined();
    });

    it('should handle maximum power (10000)', () => {
      const settings = { ...baseSettings, laserPower: 10000 };
      const paths: Path[] = [{
        id: 'test',
        points: [{ x: 0, y: 0 }, { x: 100, y: 100 }],
        intensity: 100,
      }];
      
      const gcode = generateGCode(paths, settings);
      expect(gcode).toBeDefined();
      
      // Power should be in valid S command range
      const powerLines = gcode.filter(line => line.includes('S'));
      powerLines.forEach(line => {
        const match = line.match(/S([0-9]+)/);
        if (match) {
          const power = parseInt(match[1]);
          expect(power).toBeGreaterThanOrEqual(0);
          expect(power).toBeLessThanOrEqual(10000);
        }
      });
    });

    it('should handle zero feed rate', () => {
      const settings = { ...baseSettings, feedRate: 0 };
      const paths: Path[] = [{
        id: 'test',
        points: [{ x: 0, y: 0 }, { x: 100, y: 100 }],
        intensity: 100,
      }];
      
      expect(() => generateGCode(paths, settings)).not.toThrow();
    });

    it('should handle extreme feed rate (100000)', () => {
      const settings = { ...baseSettings, feedRate: 100000 };
      const paths: Path[] = [{
        id: 'test',
        points: [{ x: 0, y: 0 }, { x: 100, y: 100 }],
        intensity: 100,
      }];
      
      const gcode = generateGCode(paths, settings);
      expect(gcode).toBeDefined();
    });
  });

  describe('Mirror and Invert Edge Cases', () => {
    it('should handle mirror X with negative coordinates', () => {
      const settings = { ...baseSettings, mirrorX: true };
      const paths: Path[] = [{
        id: 'test',
        points: [{ x: -50, y: 50 }, { x: -100, y: 100 }],
        intensity: 100,
      }];
      
      const gcode = generateGCode(paths, settings);
      expect(gcode).toBeDefined();
    });

    it('should handle invert Y with coordinates beyond bounds', () => {
      const settings = { ...baseSettings, invertY: true };
      const paths: Path[] = [{
        id: 'test',
        points: [{ x: 500, y: 500 }, { x: 1000, y: 1000 }],
        intensity: 100,
      }];
      
      const gcode = generateGCode(paths, settings);
      expect(gcode).toBeDefined();
    });

    it('should handle both mirror and invert simultaneously', () => {
      const settings = { ...baseSettings, mirrorX: true, invertY: true };
      const paths: Path[] = [{
        id: 'test',
        points: [{ x: 200, y: 200 }, { x: 300, y: 300 }],
        intensity: 100,
      }];
      
      const gcode = generateGCode(paths, settings);
      expect(gcode).toBeDefined();
    });
  });
});

describe('Edge Case Tests - Path Extraction', () => {
  describe('Empty and Invalid Images', () => {
    it('should handle all-white image (no edges)', () => {
      const data = new Uint8ClampedArray(100 * 100 * 4);
      data.fill(255);
      
      const paths = traceEdges(data, 100, 100, 1.0);
      expect(paths).toBeDefined();
      expect(Array.isArray(paths)).toBe(true);
      // All white should have no paths or empty paths
    });

    it('should handle all-black image', () => {
      const data = new Uint8ClampedArray(100 * 100 * 4);
      data.fill(0);
      
      const paths = traceEdges(data, 100, 100, 1.0);
      expect(paths).toBeDefined();
      expect(Array.isArray(paths)).toBe(true);
    });

    it('should handle 1x1 image', () => {
      const data = new Uint8ClampedArray(4);
      data[0] = 0; data[1] = 0; data[2] = 0; data[3] = 255;
      
      expect(() => traceEdges(data, 1, 1, 1.0)).not.toThrow();
    });

    it('should handle extremely large scale factor', () => {
      const data = new Uint8ClampedArray(10 * 10 * 4);
      data.fill(0);
      
      expect(() => traceEdges(data, 10, 10, 1000.0)).not.toThrow();
    });

    it('should handle zero scale factor', () => {
      const data = new Uint8ClampedArray(10 * 10 * 4);
      data.fill(0);
      
      expect(() => traceEdges(data, 10, 10, 0)).not.toThrow();
    });

    it('should handle negative scale factor', () => {
      const data = new Uint8ClampedArray(10 * 10 * 4);
      data.fill(0);
      
      expect(() => traceEdges(data, 10, 10, -1.0)).not.toThrow();
    });
  });

  describe('Complex Pattern Tests', () => {
    it('should handle checkerboard pattern', () => {
      const size = 100;
      const data = new Uint8ClampedArray(size * size * 4);
      
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const i = (y * size + x) * 4;
          const value = ((x + y) % 2 === 0) ? 255 : 0;
          data[i] = data[i + 1] = data[i + 2] = value;
          data[i + 3] = 255;
        }
      }
      
      const startTime = Date.now();
      const paths = traceEdges(data, size, size, 1.0);
      const duration = Date.now() - startTime;
      
      expect(paths).toBeDefined();
      // Should complete in reasonable time
      expect(duration).toBeLessThan(5000);
    });

    it('should handle single pixel in corner', () => {
      const size = 100;
      const data = new Uint8ClampedArray(size * size * 4);
      data.fill(255);
      
      // Set single black pixel in corner
      data[0] = data[1] = data[2] = 0;
      data[3] = 255;
      
      const paths = traceEdges(data, size, size, 1.0);
      expect(paths).toBeDefined();
    });

    it('should handle diagonal line pattern', () => {
      const size = 100;
      const data = new Uint8ClampedArray(size * size * 4);
      data.fill(255);
      
      // Draw diagonal line
      for (let i = 0; i < size; i++) {
        const idx = (i * size + i) * 4;
        data[idx] = data[idx + 1] = data[idx + 2] = 0;
        data[idx + 3] = 255;
      }
      
      const paths = traceEdges(data, size, size, 1.0);
      expect(paths).toBeDefined();
      expect(Array.isArray(paths)).toBe(true);
    });
  });
});
