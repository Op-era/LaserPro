/**
 * ROBUSTNESS TESTS - Error Handling and Recovery
 * Tests designed to verify error handling and system resilience
 */

import { describe, it, expect } from 'vitest';
import {
  grayscale,
  thresholdFilter,
  applyFloydSteinbergDither,
  applySaturation,
  applyConvolution,
} from '../utils/imageProcessor';
import { generateGCode } from '../utils/gcodeGenerator';
import { calculateCuttingPasses, getMaterialLibrary } from '../utils/materialLibrary';
import { 
  generateSerialNumber,
  parseVariableText,
  evaluateVariable,
} from '../utils/variableText';
import { generateLayerAwareGCode } from '../utils/layerGCode';
import { Layer, EngraverSettings, Path } from '../types';

describe('Robustness Tests - Error Handling', () => {
  
  describe('Corrupted Data Handling', () => {
    it('should handle partially corrupted ImageData', () => {
      const data = new Uint8ClampedArray(100 * 100 * 4);
      
      // Fill with valid data
      for (let i = 0; i < data.length; i += 4) {
        data[i] = 128;
        data[i + 1] = 128;
        data[i + 2] = 128;
        data[i + 3] = 255;
      }
      
      // Corrupt some values (set to NaN-like values)
      for (let i = 0; i < 100; i++) {
        data[Math.floor(Math.random() * (data.length / 4)) * 4] = 300; // Out of range
      }
      
      // Should clamp values and not crash
      expect(() => grayscale(data, 100, 100)).not.toThrow();
    });

    it('should handle ImageData with wrong alpha values', () => {
      const data = new Uint8ClampedArray(50 * 50 * 4);
      
      // Set all alpha to 0 (transparent)
      for (let i = 0; i < data.length; i += 4) {
        data[i] = 128;
        data[i + 1] = 128;
        data[i + 2] = 128;
        data[i + 3] = 0; // All transparent
      }
      
      expect(() => grayscale(data, 50, 50)).not.toThrow();
      expect(() => applyFloydSteinbergDither(data, 50, 50)).not.toThrow();
    });

    it('should handle data with length mismatch', () => {
      // Data length doesn't match width * height * 4
      const data = new Uint8ClampedArray(100);
      
      // Should handle gracefully
      expect(() => grayscale(data, 10, 10)).not.toThrow();
    });
  });

  describe('Invalid Parameter Combinations', () => {
    it('should handle conflicting G-code settings', () => {
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
        invertY: true,
        mirrorX: true,
        threshold: 128,
        contrast: 0,
        testFirePower: 15,
        workAreaWidth: 400,
        workAreaHeight: 400,
        templateWidth: 400,
        templateHeight: 400,
        templateOffsetX: 200, // Offset larger than work area
        templateOffsetY: 200,
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
      
      const paths: Path[] = [{
        id: 'test',
        points: [{ x: 100, y: 100 }, { x: 200, y: 200 }],
        intensity: 100,
      }];
      
      // Should handle conflicting settings without crashing
      expect(() => generateGCode(paths, baseSettings)).not.toThrow();
    });

    it('should handle power settings exceeding limits', () => {
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
        laserPower: 50000, // Extremely high
        travelSpeed: 4000,
        ppi: 254,
        resolution: 5,
        invertY: false,
        mirrorX: false,
        threshold: 128,
        contrast: 0,
        testFirePower: 5000, // Also high
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
        minCalibrationPower: 100, // Very high
        powerGamma: 10.0, // Extreme gamma
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
      
      const paths: Path[] = [{
        id: 'test',
        points: [{ x: 100, y: 100 }, { x: 200, y: 200 }],
        intensity: 150, // Over 100%
      }];
      
      expect(() => generateGCode(paths, baseSettings)).not.toThrow();
    });
  });

  describe('Material Library Edge Cases', () => {
    it('should handle unknown material types', () => {
      expect(() => calculateCuttingPasses('diode', 'unknown-material', 5)).not.toThrow();
    });

    it('should handle extreme material thickness', () => {
      expect(() => calculateCuttingPasses('diode', 'wood', 100)).not.toThrow();
      expect(() => calculateCuttingPasses('diode', 'wood', 0.001)).not.toThrow();
      expect(() => calculateCuttingPasses('diode', 'wood', -1)).not.toThrow();
    });

    it('should handle all laser types', () => {
      expect(() => getMaterialLibrary('diode')).not.toThrow();
      expect(() => getMaterialLibrary('co2')).not.toThrow();
      expect(() => getMaterialLibrary('fiber')).not.toThrow();
    });

    it('should return valid pass counts for extreme cases', () => {
      const passes1 = calculateCuttingPasses('diode', 'wood', 50);
      expect(passes1).toBeGreaterThan(0);
      expect(passes1).toBeLessThan(100);
      
      const passes2 = calculateCuttingPasses('fiber', 'metal', 20);
      expect(passes2).toBeGreaterThan(0);
      expect(passes2).toBeLessThan(100);
    });
  });

  describe('Variable Text Edge Cases', () => {
    it('should handle empty variable text', () => {
      const result = parseVariableText('');
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle malformed variable syntax', () => {
      expect(() => parseVariableText('${invalid')).not.toThrow();
      expect(() => parseVariableText('$missing}')).not.toThrow();
      expect(() => parseVariableText('${}')).not.toThrow();
    });

    it('should handle unknown variable types', () => {
      expect(() => parseVariableText('${UnknownVar}')).not.toThrow();
      expect(() => parseVariableText('${Invalid:format}')).not.toThrow();
    });

    it('should handle extremely long serial numbers', () => {
      const result = generateSerialNumber(
        'PREFIX-',
        999999999,
        1,
        '-SUFFIX',
        'numeric'
      );
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should handle negative serial numbers', () => {
      expect(() => generateSerialNumber('', -100, 1, '', 'numeric')).not.toThrow();
    });

    it('should handle all date formats', () => {
      const formats = [
        'YYYY-MM-DD',
        'MM/DD/YYYY',
        'DD.MM.YYYY',
        'YYYY/MM/DD',
      ];
      
      formats.forEach(format => {
        expect(() => evaluateVariable('Date', format, 1)).not.toThrow();
      });
    });

    it('should handle invalid date formats', () => {
      expect(() => evaluateVariable('Date', 'INVALID', 1)).not.toThrow();
      expect(() => evaluateVariable('Date', '', 1)).not.toThrow();
    });
  });

  describe('Layer G-code Edge Cases', () => {
    it('should handle empty layers array', () => {
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
      
      expect(() => generateLayerAwareGCode([], baseSettings)).not.toThrow();
    });

    it('should handle layers with no paths', () => {
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
      
      const layers: Layer[] = [{
        id: 'empty-layer',
        type: 'image',
        visible: true,
        locked: false,
        name: 'Empty Layer',
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        rotation: 0,
        opacity: 1,
        blendingMode: 'normal',
        data: '',
        paths: [],
        power: 80,
        speed: 1000,
        passes: 1,
        zOffset: 0,
        mode: 'fill',
        scanAngle: 0,
        color: 'C00',
        priority: 1,
      }];
      
      expect(() => generateLayerAwareGCode(layers, baseSettings)).not.toThrow();
    });

    it('should handle layers with extreme settings', () => {
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
      
      const layers: Layer[] = [{
        id: 'extreme-layer',
        type: 'image',
        visible: true,
        locked: false,
        name: 'Extreme Settings',
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        rotation: 0,
        opacity: 1,
        blendingMode: 'normal',
        data: '',
        paths: [{
          id: 'path1',
          points: [{ x: 0, y: 0 }, { x: 100, y: 100 }],
          intensity: 100,
        }],
        power: 10000, // Extreme
        speed: 100000, // Extreme
        passes: 100, // Many passes
        zOffset: 50, // Large offset
        mode: 'fill',
        scanAngle: 360, // Full rotation
        color: 'C63',
        priority: 100,
      }];
      
      expect(() => generateLayerAwareGCode(layers, baseSettings)).not.toThrow();
    });
  });

  describe('Saturation Edge Cases', () => {
    it('should handle saturation on grayscale images', () => {
      const data = new Uint8ClampedArray(100 * 100 * 4);
      
      // Create pure grayscale (R=G=B)
      for (let i = 0; i < data.length; i += 4) {
        data[i] = 128;
        data[i + 1] = 128;
        data[i + 2] = 128;
        data[i + 3] = 255;
      }
      
      // Saturation on grayscale should not crash
      expect(() => applySaturation(data, 100, 100, 5.0)).not.toThrow();
    });

    it('should handle extreme negative saturation', () => {
      const data = new Uint8ClampedArray(50 * 50 * 4);
      
      for (let i = 0; i < data.length; i += 4) {
        data[i] = 255;
        data[i + 1] = 0;
        data[i + 2] = 0;
        data[i + 3] = 255;
      }
      
      expect(() => applySaturation(data, 50, 50, -100)).not.toThrow();
    });
  });

  describe('Convolution Robustness', () => {
    it('should handle non-square kernels gracefully', () => {
      const data = new Uint8ClampedArray(50 * 50 * 4);
      data.fill(128);
      
      // Kernel that doesn't match kernel size
      const kernel = [1, 2, 3, 4, 5];
      
      // Should handle mismatch gracefully
      expect(() => applyConvolution(data, 50, 50, kernel, 3)).not.toThrow();
    });

    it('should handle kernel with wrong size parameter', () => {
      const data = new Uint8ClampedArray(50 * 50 * 4);
      data.fill(128);
      
      // 9 element kernel but size says 5
      const kernel = [1, 1, 1, 1, 1, 1, 1, 1, 1];
      
      expect(() => applyConvolution(data, 50, 50, kernel, 5)).not.toThrow();
    });
  });
});

describe('Robustness Tests - Concurrent Operations', () => {
  it('should handle multiple simultaneous image processing operations', () => {
    const operations = Array(10).fill(null).map((_, i) => {
      const data = new Uint8ClampedArray(100 * 100 * 4);
      for (let j = 0; j < data.length; j += 4) {
        data[j] = (i * 25) % 256;
        data[j + 1] = (i * 25) % 256;
        data[j + 2] = (i * 25) % 256;
        data[j + 3] = 255;
      }
      
      return () => {
        grayscale(data, 100, 100);
        thresholdFilter(data, 100, 100, 128);
      };
    });
    
    // Execute all operations
    operations.forEach(op => {
      expect(() => op()).not.toThrow();
    });
  });

  it('should handle rapid sequential operations', () => {
    const data = new Uint8ClampedArray(100 * 100 * 4);
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 128;
      data[i + 1] = 128;
      data[i + 2] = 128;
      data[i + 3] = 255;
    }
    
    // Rapid fire 100 operations
    for (let i = 0; i < 100; i++) {
      grayscale(data, 100, 100);
      thresholdFilter(data, 100, 100, i % 255);
    }
    
    expect(true).toBe(true); // If we got here, no crashes occurred
  });
});
