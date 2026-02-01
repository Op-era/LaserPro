/**
 * Test suite for layer-aware G-code generation
 * Phase 2 of 10: LightBurn-compatible layer system
 */

import { describe, it, expect } from 'vitest';
import {
  generateLayerAwareGCode,
  estimateLayerTime,
  estimateTotalJobTime
} from '../utils/layerGCode';
import { Layer, Path, EngraverSettings } from '../types';

describe('Layer-Aware G-code Generation', () => {
  const baseSettings: EngraverSettings = {
    machineModel: 'Test',
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
    startGCodeScript: 'G21\nG90\nM5',
    endGCodeScript: 'M5\nG0 X0 Y0\nM2',
    enableCompletionSound: true,
    defaultFrameMargin: 2,
    slicerProgress: 100,
    pathVisualization: { showHeatMap: true, colorScheme: 'power', showLegend: true }
  };

  const createTestLayer = (overrides: Partial<Layer>): Layer => ({
    id: 'layer-1',
    type: 'vector',
    visible: true,
    locked: false,
    name: 'Test Layer',
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    rotation: 0,
    opacity: 100,
    blendingMode: 'normal',
    textFillStyle: 'outline',
    layerColor: '#ff0000',
    layerNumber: 'C00',
    mode: 'line',
    powerMin: 80,
    powerMax: 100,
    numPasses: 1,
    priority: 0,
    brightness: 0,
    contrast: 0,
    gamma: 1.0,
    exposure: 0,
    saturation: 0,
    hue: 0,
    posterization: 0,
    blur: 0,
    sharpen: 0,
    edgeEnhancement: 0,
    noiseReduction: 0,
    invert: false,
    levelsLow: 0,
    levelsHigh: 255,
    curves: [{ x: 0, y: 0 }, { x: 255, y: 255 }],
    useThreshold: false,
    thresholdValue: 128,
    sketchMode: false,
    sketchStrength: 30,
    redWeight: 0.299,
    greenWeight: 0.587,
    blueWeight: 0.114,
    artisticFilter: 'none',
    artisticStrength: 1.0,
    halftoneShape: 'circle',
    halftoneCellSize: 8,
    halftoneAngle: 45,
    textureMode: 'none',
    textureDensity: 1.0,
    textureAngle: 45,
    lowZoneMode: 'hatch',
    midZoneMode: 'crosshatch',
    highZoneMode: 'halftone',
    zoneThreshold1: 85,
    zoneThreshold2: 170,
    gridRows: 1,
    gridCols: 1,
    gridSpacingX: 10,
    gridSpacingY: 10,
    dotScale: 1.0,
    ...overrides
  });

  const createTestPath = (layerId: string, overrides: Partial<Path> = {}): Path => ({
    id: 'path-1',
    points: [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 100 },
      { x: 0, y: 100 },
      { x: 0, y: 0 }
    ],
    layerId,
    ...overrides
  });

  describe('Basic Layer Processing', () => {
    it('generates G-code for single layer', () => {
      const layer = createTestLayer({ id: 'layer-1' });
      const path = createTestPath('layer-1');
      
      const gcode = generateLayerAwareGCode([path], [layer], baseSettings);
      
      expect(gcode.length).toBeGreaterThan(0);
      expect(gcode.join('\n')).toContain('LAYER-AWARE TOOLPATH');
      expect(gcode.join('\n')).toContain(layer.name);
    });

    it('respects layer visibility', () => {
      const visibleLayer = createTestLayer({ id: 'layer-1', visible: true, name: 'Visible Layer' });
      const invisibleLayer = createTestLayer({ id: 'layer-2', visible: false, name: 'Invisible Layer' });
      const path1 = createTestPath('layer-1');
      const path2 = createTestPath('layer-2');
      
      const gcode = generateLayerAwareGCode([path1, path2], [visibleLayer, invisibleLayer], baseSettings);
      
      expect(gcode.join('\n')).toContain('Visible Layer');
      expect(gcode.join('\n')).not.toContain('Invisible Layer');
    });

    it('processes layers in priority order', () => {
      const layer1 = createTestLayer({ id: 'layer-1', priority: 10, name: 'Second' });
      const layer2 = createTestLayer({ id: 'layer-2', priority: 0, name: 'First' });
      const path1 = createTestPath('layer-1');
      const path2 = createTestPath('layer-2');
      
      const gcode = generateLayerAwareGCode([path1, path2], [layer1, layer2], baseSettings);
      const gcodeStr = gcode.join('\n');
      
      const firstIndex = gcodeStr.indexOf('First');
      const secondIndex = gcodeStr.indexOf('Second');
      
      expect(firstIndex).toBeLessThan(secondIndex);
    });
  });

  describe('Layer-Specific Settings', () => {
    it('applies layer-specific speed', () => {
      const layer = createTestLayer({ speed: 1000 });
      const path = createTestPath('layer-1');
      
      const gcode = generateLayerAwareGCode([path], [layer], baseSettings);
      const gcodeStr = gcode.join('\n');
      
      expect(gcodeStr).toContain('Speed: 1000');
      expect(gcodeStr).toContain('F1000');
    });

    it('applies layer-specific power range', () => {
      const layer = createTestLayer({ powerMin: 60, powerMax: 90 });
      const path = createTestPath('layer-1', { intensity: 100 });
      
      const gcode = generateLayerAwareGCode([path], [layer], baseSettings);
      const gcodeStr = gcode.join('\n');
      
      expect(gcodeStr).toContain('Power: 60-90%');
      // S value should be around 900 (90% of 1000)
      expect(gcodeStr).toMatch(/S[89]\d{2}/);
    });

    it('applies layer-specific passes', () => {
      const layer = createTestLayer({ numPasses: 3 });
      const path = createTestPath('layer-1');
      
      const gcode = generateLayerAwareGCode([path], [layer], baseSettings);
      const gcodeStr = gcode.join('\n');
      
      expect(gcodeStr).toContain('Passes: 3');
      expect(gcodeStr).toContain('Pass 1/3');
      expect(gcodeStr).toContain('Pass 2/3');
      expect(gcodeStr).toContain('Pass 3/3');
    });

    it('handles air assist per layer', () => {
      const layer = createTestLayer({ airAssist: true });
      const path = createTestPath('layer-1');
      
      const gcode = generateLayerAwareGCode([path], [layer], baseSettings);
      const gcodeStr = gcode.join('\n');
      
      expect(gcodeStr).toContain('M8 ; air assist on');
      expect(gcodeStr).toContain('M9 ; air assist off');
    });

    it('handles Z-offset per layer', () => {
      const layer = createTestLayer({ zOffset: 2.5 });
      const path = createTestPath('layer-1');
      
      const gcode = generateLayerAwareGCode([path], [layer], baseSettings);
      const gcodeStr = gcode.join('\n');
      
      expect(gcodeStr).toContain('G0 Z2.500');
      expect(gcodeStr).toContain('G0 Z0 ; reset Z-offset');
    });
  });

  describe('Cut vs Fill Modes', () => {
    it('indicates cut mode in comments', () => {
      const layer = createTestLayer({ mode: 'line' });
      const path = createTestPath('layer-1');
      
      const gcode = generateLayerAwareGCode([path], [layer], baseSettings);
      
      expect(gcode.join('\n')).toContain('Mode: Cut');
    });

    it('indicates fill mode in comments', () => {
      const layer = createTestLayer({ mode: 'fill' });
      const path = createTestPath('layer-1');
      
      const gcode = generateLayerAwareGCode([path], [layer], baseSettings);
      
      expect(gcode.join('\n')).toContain('Mode: Fill');
    });
  });

  describe('Time Estimation', () => {
    it('estimates time for single layer', () => {
      const layer = createTestLayer({ speed: 1000 });
      const path = createTestPath('layer-1');
      
      const time = estimateLayerTime(layer, [path], baseSettings);
      
      expect(time).toBeGreaterThan(0);
      expect(typeof time).toBe('number');
    });

    it('accounts for multiple passes in time estimation', () => {
      const layer1 = createTestLayer({ id: 'layer-1', numPasses: 1 });
      const layer2 = createTestLayer({ id: 'layer-2', numPasses: 3 });
      const path1 = createTestPath('layer-1');
      const path2 = createTestPath('layer-2');
      
      const time1 = estimateLayerTime(layer1, [path1], baseSettings);
      const time2 = estimateLayerTime(layer2, [path2], baseSettings);
      
      expect(time2).toBeCloseTo(time1 * 3, 1);
    });

    it('estimates total job time', () => {
      const layer1 = createTestLayer({ id: 'layer-1' });
      const layer2 = createTestLayer({ id: 'layer-2' });
      const path1 = createTestPath('layer-1');
      const path2 = createTestPath('layer-2');
      
      const estimate = estimateTotalJobTime([layer1, layer2], [path1, path2], baseSettings);
      
      expect(estimate.total).toBeGreaterThan(0);
      expect(estimate.byLayer.size).toBe(2);
      expect(estimate.byLayer.get('layer-1')).toBeGreaterThan(0);
      expect(estimate.byLayer.get('layer-2')).toBeGreaterThan(0);
    });

    it('excludes invisible layers from time estimate', () => {
      const visible = createTestLayer({ id: 'layer-1', visible: true });
      const invisible = createTestLayer({ id: 'layer-2', visible: false });
      const path1 = createTestPath('layer-1');
      const path2 = createTestPath('layer-2');
      
      const estimate = estimateTotalJobTime([visible, invisible], [path1, path2], baseSettings);
      
      expect(estimate.byLayer.has('layer-1')).toBe(true);
      expect(estimate.byLayer.has('layer-2')).toBe(false);
    });
  });

  describe('Multi-Layer Jobs', () => {
    it('generates G-code for multiple layers', () => {
      const layers = [
        createTestLayer({ id: 'layer-1', priority: 0, name: 'First Layer' }),
        createTestLayer({ id: 'layer-2', priority: 1, name: 'Second Layer' }),
        createTestLayer({ id: 'layer-3', priority: 2, name: 'Third Layer' })
      ];
      const paths = [
        createTestPath('layer-1'),
        createTestPath('layer-2'),
        createTestPath('layer-3')
      ];
      
      const gcode = generateLayerAwareGCode(paths, layers, baseSettings);
      const gcodeStr = gcode.join('\n');
      
      expect(gcodeStr).toContain('First Layer');
      expect(gcodeStr).toContain('Second Layer');
      expect(gcodeStr).toContain('Third Layer');
    });

    it('handles layers with different settings', () => {
      const layers = [
        createTestLayer({ 
          id: 'cut', 
          mode: 'line', 
          powerMin: 80, 
          powerMax: 100, 
          speed: 50,
          numPasses: 1,
          priority: 0
        }),
        createTestLayer({ 
          id: 'engrave', 
          mode: 'fill', 
          powerMin: 40, 
          powerMax: 60, 
          speed: 200,
          numPasses: 2,
          priority: 1
        })
      ];
      const paths = [
        createTestPath('cut'),
        createTestPath('engrave')
      ];
      
      const gcode = generateLayerAwareGCode(paths, layers, baseSettings);
      const gcodeStr = gcode.join('\n');
      
      expect(gcodeStr).toContain('Mode: Cut');
      expect(gcodeStr).toContain('Mode: Fill');
      expect(gcodeStr).toContain('Speed: 50');
      expect(gcodeStr).toContain('Speed: 200');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty paths array', () => {
      const layer = createTestLayer({});
      
      const gcode = generateLayerAwareGCode([], [layer], baseSettings);
      
      expect(gcode.length).toBeGreaterThan(0);
      expect(gcode.join('\n')).toContain('LAYER-AWARE');
    });

    it('handles paths without layer reference', () => {
      const layer = createTestLayer({ id: 'layer-1' });
      const pathWithLayer = createTestPath('layer-1');
      const pathWithoutLayer = createTestPath('');
      
      const gcode = generateLayerAwareGCode([pathWithLayer, pathWithoutLayer], [layer], baseSettings);
      
      expect(gcode.length).toBeGreaterThan(0);
    });

    it('handles layer with no paths', () => {
      const layer = createTestLayer({ id: 'layer-1' });
      
      const time = estimateLayerTime(layer, [], baseSettings);
      
      expect(time).toBe(0);
    });
  });
});
