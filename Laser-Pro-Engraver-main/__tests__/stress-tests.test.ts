/**
 * STRESS TESTS - Performance and Memory Testing
 * Tests designed to push the limits of the system
 */

import { describe, it, expect } from 'vitest';
import {
  applyFloydSteinbergDither,
  applyAtkinsonDither,
  applyStuckiDither,
  grayscale,
  thresholdFilter,
  applyConvolution,
  applyOilPainting, 
  applyWatercolor, 
  applyCharcoal 
} from '../utils/imageProcessor';
import { generateGCode } from '../utils/gcodeGenerator';
import { traceEdges } from '../utils/pathExtractor';
import { EngraverSettings, Path } from '../types';

describe('Stress Tests - Performance Under Load', () => {
  
  const createTestImage = (width: number, height: number, pattern: 'random' | 'gradient' | 'uniform' = 'uniform'): ImageData => {
    const data = new ImageData(width, height);
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        let value;
        
        switch (pattern) {
          case 'random':
            value = Math.floor(Math.random() * 256);
            break;
          case 'gradient':
            value = Math.floor((x / width) * 255);
            break;
          default:
            value = 128;
        }
        
        data.data[i] = value;
        data.data[i + 1] = value;
        data.data[i + 2] = value;
        data.data[i + 3] = 255;
      }
    }
    
    return data;
  };

  describe('Large Image Processing', () => {
    it('should process 500x500 image in reasonable time', () => {
      const img = createTestImage(500, 500, 'gradient');
      
      const startTime = Date.now();
      grayscale(img.data, img.width, img.height);
      const duration = Date.now() - startTime;
      
      expect(duration).toBeLessThan(1000);
      console.log(`500x500 grayscale: ${duration}ms`);
    });

    it('should process 1000x1000 dithering in under 10 seconds', () => {
      const img = createTestImage(1000, 1000, 'random');
      
      const startTime = Date.now();
      applyFloydSteinbergDither(img.data, img.width, img.height);
      const duration = Date.now() - startTime;
      
      expect(duration).toBeLessThan(10000);
      console.log(`1000x1000 Floyd-Steinberg: ${duration}ms`);
    });

    it('should process 2000x2000 grayscale without memory issues', () => {
      const img = createTestImage(2000, 2000, 'uniform');
      
      const startTime = Date.now();
      grayscale(img.data, img.width, img.height);
      const duration = Date.now() - startTime;
      
      expect(duration).toBeLessThan(5000);
      console.log(`2000x2000 grayscale: ${duration}ms`);
    });
  });

  describe('Multiple Operations Chain', () => {
    it('should handle chain of 10 operations on same image', () => {
      const img = createTestImage(200, 200, 'gradient');
      
      const startTime = Date.now();
      
      grayscale(img.data, img.width, img.height);
      thresholdFilter(img.data, img.width, img.height, 128);
      applyFloydSteinbergDither(img.data, img.width, img.height);
      
      const img2 = createTestImage(200, 200, 'gradient');
      grayscale(img2.data, img2.width, img2.height);
      applyAtkinsonDither(img2.data, img2.width, img2.height);
      
      const img3 = createTestImage(200, 200, 'random');
      grayscale(img3.data, img3.width, img3.height);
      applyStuckiDither(img3.data, img3.width, img3.height);
      
      const duration = Date.now() - startTime;
      
      expect(duration).toBeLessThan(5000);
      console.log(`Chain of 10 operations: ${duration}ms`);
    });

    it('should process 100 small images sequentially', () => {
      const startTime = Date.now();
      
      for (let i = 0; i < 100; i++) {
        const img = createTestImage(50, 50, 'random');
        grayscale(img.data, img.width, img.height);
        applyFloydSteinbergDither(img.data, img.width, img.height);
      }
      
      const duration = Date.now() - startTime;
      
      expect(duration).toBeLessThan(10000);
      console.log(`100 small images: ${duration}ms`);
    });
  });

  describe('Convolution Stress Tests', () => {
    it('should handle large kernel on large image', () => {
      const img = createTestImage(500, 500, 'gradient');
      
      // 7x7 Gaussian blur kernel
      const kernel = [
        1, 2, 3, 4, 3, 2, 1,
        2, 4, 6, 8, 6, 4, 2,
        3, 6, 9, 12, 9, 6, 3,
        4, 8, 12, 16, 12, 8, 4,
        3, 6, 9, 12, 9, 6, 3,
        2, 4, 6, 8, 6, 4, 2,
        1, 2, 3, 4, 3, 2, 1,
      ];
      
      const startTime = Date.now();
      applyConvolution(img.data, img.width, img.height, kernel, 7);
      const duration = Date.now() - startTime;
      
      expect(duration).toBeLessThan(10000);
      console.log(`500x500 7x7 convolution: ${duration}ms`);
    });

    it('should handle multiple convolution passes', () => {
      const img = createTestImage(200, 200, 'random');
      const kernel = [-1, -1, -1, -1, 8, -1, -1, -1, -1];
      
      const startTime = Date.now();
      
      for (let i = 0; i < 5; i++) {
        applyConvolution(img.data, img.width, img.height, kernel, 3);
      }
      
      const duration = Date.now() - startTime;
      
      expect(duration).toBeLessThan(10000);
      console.log(`5 convolution passes: ${duration}ms`);
    });
  });

  describe('Professional Filter Performance', () => {
    it('should process oil painting filter on large image', () => {
      const img = createTestImage(300, 300, 'gradient');
      
      const startTime = Date.now();
      applyOilPainting(img.data, img.width, img.height, { radius: 4, intensity: 20 });
      const duration = Date.now() - startTime;
      
      expect(duration).toBeLessThan(15000);
      console.log(`300x300 oil painting: ${duration}ms`);
    });

    it('should process watercolor filter', () => {
      const img = createTestImage(200, 200, 'gradient');
      
      const startTime = Date.now();
      applyWatercolor(img.data, img.width, img.height, { intensity: 20, wetness: 0.5 });
      const duration = Date.now() - startTime;
      
      expect(duration).toBeLessThan(10000);
      console.log(`200x200 watercolor: ${duration}ms`);
    });

    it('should process charcoal filter', () => {
      const img = createTestImage(200, 200, 'random');
      
      const startTime = Date.now();
      applyCharcoal(img.data, img.width, img.height, { intensity: 20 });
      const duration = Date.now() - startTime;
      
      expect(duration).toBeLessThan(5000);
      console.log(`200x200 charcoal: ${duration}ms`);
    });
  });
});

describe('Stress Tests - G-code Generation', () => {
  const baseSettings: EngraverSettings = {
    machineModel: 'stress-test',
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

  describe('Large Path Datasets', () => {
    it('should generate G-code for 5000 paths', () => {
      const paths: Path[] = Array(5000).fill(null).map((_, i) => ({
        id: `path-${i}`,
        points: [
          { x: i % 400, y: Math.floor(i / 400) },
          { x: (i + 1) % 400, y: Math.floor((i + 1) / 400) },
        ],
        intensity: 100,
      }));
      
      const startTime = Date.now();
      const gcode = generateGCode(paths, baseSettings);
      const duration = Date.now() - startTime;
      
      expect(gcode).toBeDefined();
      expect(gcode.length).toBeGreaterThan(5000);
      expect(duration).toBeLessThan(10000);
      console.log(`5000 paths G-code: ${duration}ms, ${gcode.length} lines`);
    });

    it('should generate G-code for path with 50000 points', () => {
      const points = Array(50000).fill(null).map((_, i) => ({
        x: (i % 1000) / 10,
        y: Math.floor(i / 1000) / 10,
      }));
      
      const paths: Path[] = [{
        id: 'mega-path',
        points,
        intensity: 100,
      }];
      
      const startTime = Date.now();
      const gcode = generateGCode(paths, baseSettings);
      const duration = Date.now() - startTime;
      
      expect(gcode).toBeDefined();
      expect(duration).toBeLessThan(15000);
      console.log(`50000 point path G-code: ${duration}ms, ${gcode.length} lines`);
    });

    it('should handle complex path with varying intensities', () => {
      const points = Array(10000).fill(null).map((_, i) => ({
        x: (i % 400),
        y: Math.floor(i / 400),
      }));
      
      const paths: Path[] = Array(100).fill(null).map((_, i) => ({
        id: `var-path-${i}`,
        points: points.slice(i * 100, (i + 1) * 100),
        intensity: (i % 10) * 10 + 10,
        speed: 1000 + (i % 20) * 100,
      }));
      
      const startTime = Date.now();
      const gcode = generateGCode(paths, baseSettings);
      const duration = Date.now() - startTime;
      
      expect(gcode).toBeDefined();
      expect(duration).toBeLessThan(10000);
      console.log(`Complex varying intensity: ${duration}ms`);
    });
  });

  describe('Memory Pressure Tests', () => {
    it('should handle generating G-code 100 times in a row', () => {
      const paths: Path[] = [{
        id: 'test',
        points: [
          { x: 0, y: 0 },
          { x: 100, y: 100 },
          { x: 200, y: 200 },
        ],
        intensity: 100,
      }];
      
      const startTime = Date.now();
      
      for (let i = 0; i < 100; i++) {
        const gcode = generateGCode(paths, baseSettings);
        expect(gcode).toBeDefined();
      }
      
      const duration = Date.now() - startTime;
      
      expect(duration).toBeLessThan(5000);
      console.log(`100 G-code generations: ${duration}ms`);
    });

    it('should handle multiple settings variations', () => {
      const paths: Path[] = [{
        id: 'test',
        points: [{ x: 0, y: 0 }, { x: 100, y: 100 }],
        intensity: 100,
      }];
      
      const startTime = Date.now();
      
      for (let power = 100; power <= 1000; power += 100) {
        for (let speed = 500; speed <= 5000; speed += 500) {
          const settings = {
            ...baseSettings,
            laserPower: power,
            feedRate: speed,
          };
          const gcode = generateGCode(paths, settings);
          expect(gcode).toBeDefined();
        }
      }
      
      const duration = Date.now() - startTime;
      
      expect(duration).toBeLessThan(10000);
      console.log(`100 settings variations: ${duration}ms`);
    });
  });
});

describe('Stress Tests - Path Extraction', () => {
  describe('Complex Image Patterns', () => {
    it('should extract paths from 500x500 complex pattern', () => {
      const size = 500;
      const data = new Uint8ClampedArray(size * size * 4);
      
      // Create complex pattern with many edges
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const i = (y * size + x) * 4;
          const value = ((x % 20 < 10) !== (y % 20 < 10)) ? 0 : 255;
          data[i] = data[i + 1] = data[i + 2] = value;
          data[i + 3] = 255;
        }
      }
      
      const startTime = Date.now();
      const paths = traceEdges(data, size, size, 1.0);
      const duration = Date.now() - startTime;
      
      expect(paths).toBeDefined();
      expect(duration).toBeLessThan(15000);
      console.log(`500x500 complex pattern extraction: ${duration}ms`);
    });

    it('should extract paths from gradient image', () => {
      const size = 400;
      const data = new Uint8ClampedArray(size * size * 4);
      
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const i = (y * size + x) * 4;
          const value = Math.floor((x / size) * 255);
          data[i] = data[i + 1] = data[i + 2] = value;
          data[i + 3] = 255;
        }
      }
      
      const startTime = Date.now();
      const paths = traceEdges(data, size, size, 1.0);
      const duration = Date.now() - startTime;
      
      expect(paths).toBeDefined();
      expect(duration).toBeLessThan(10000);
      console.log(`400x400 gradient extraction: ${duration}ms`);
    });

    it('should handle noise pattern extraction', () => {
      const size = 300;
      const data = new Uint8ClampedArray(size * size * 4);
      
      // Random noise pattern
      for (let i = 0; i < data.length; i += 4) {
        const value = Math.random() > 0.5 ? 255 : 0;
        data[i] = data[i + 1] = data[i + 2] = value;
        data[i + 3] = 255;
      }
      
      const startTime = Date.now();
      const paths = traceEdges(data, size, size, 1.0);
      const duration = Date.now() - startTime;
      
      expect(paths).toBeDefined();
      expect(duration).toBeLessThan(20000);
      console.log(`300x300 noise pattern extraction: ${duration}ms`);
    });
  });

  describe('Multiple Extraction Operations', () => {
    it('should handle 50 extractions in sequence', () => {
      const startTime = Date.now();
      
      for (let i = 0; i < 50; i++) {
        const size = 50;
        const data = new Uint8ClampedArray(size * size * 4);
        
        for (let j = 0; j < data.length; j += 4) {
          data[j] = data[j + 1] = data[j + 2] = (i + j) % 2 ? 255 : 0;
          data[j + 3] = 255;
        }
        
        const paths = traceEdges(data, size, size, 1.0);
        expect(paths).toBeDefined();
      }
      
      const duration = Date.now() - startTime;
      
      expect(duration).toBeLessThan(10000);
      console.log(`50 sequential extractions: ${duration}ms`);
    });
  });
});

describe('Integration Stress Tests - Full Workflow', () => {
  it('should handle complete image-to-gcode pipeline', () => {
    const baseSettings: EngraverSettings = {
      machineModel: 'integration-test',
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
    
    // Create test image
    const size = 200;
    const img = new ImageData(size, size);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const i = (y * size + x) * 4;
        const value = (x < size / 2) ? 0 : 255;
        img.data[i] = img.data[i + 1] = img.data[i + 2] = value;
        img.data[i + 3] = 255;
      }
    }
    
    const startTime = Date.now();
    
    // Step 1: Process image
    grayscale(img.data, img.width, img.height);
    applyFloydSteinbergDither(img.data, img.width, img.height);
    
    // Step 2: Extract paths
    const paths = traceEdges(img.data, img.width, img.height, 1.0);
    expect(paths).toBeDefined();
    
    // Step 3: Generate G-code
    const gcode = generateGCode(paths, baseSettings);
    expect(gcode).toBeDefined();
    expect(gcode.length).toBeGreaterThan(0);
    
    const duration = Date.now() - startTime;
    
    expect(duration).toBeLessThan(15000);
    console.log(`Complete pipeline: ${duration}ms`);
  });
});
