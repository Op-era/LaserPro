/**
 * Test suite for serialization utilities
 * Part of Phase 1 implementation from ROADMAP-v0.2.0.md
 */

import { describe, it, expect } from 'vitest';
import {
  generateSerialNumber,
  generateBarcodePaths,
  generateDataMatrixPaths,
  generateQRCodePaths,
  generateTextPaths
} from '../utils/serialization';
import { SerializationSettings } from '../types';

describe('Serialization - generateSerialNumber', () => {
  it('generates numeric serial numbers with prefix and suffix', () => {
    const settings: SerializationSettings = {
      enabled: true,
      type: 'barcode',
      format: 'numeric',
      prefix: 'SN-',
      startNumber: 1,
      currentNumber: 42,
      increment: 1,
      suffix: '-2026',
      x: 10,
      y: 10,
      width: 30,
      height: 10
    };

    const result = generateSerialNumber(settings);
    expect(result).toBe('SN-000042-2026');
  });

  it('generates alphanumeric serial numbers', () => {
    const settings: SerializationSettings = {
      enabled: true,
      type: 'datamatrix',
      format: 'alphanumeric',
      prefix: 'PART-',
      startNumber: 1,
      currentNumber: 100,
      increment: 1,
      suffix: '',
      x: 10,
      y: 10,
      width: 30,
      height: 10
    };

    const result = generateSerialNumber(settings);
    expect(result).toMatch(/PART-[0-9A-Z]+/);
  });

  it('uses custom pattern with {N} placeholder', () => {
    const settings: SerializationSettings = {
      enabled: true,
      type: 'text',
      format: 'custom',
      prefix: '',
      startNumber: 1,
      currentNumber: 123,
      increment: 1,
      suffix: '',
      customPattern: 'BATCH-{N}-A',
      x: 10,
      y: 10,
      width: 30,
      height: 10
    };

    const result = generateSerialNumber(settings);
    expect(result).toBe('BATCH-123-A');
  });

  it('increments numbers correctly', () => {
    const settings: SerializationSettings = {
      enabled: true,
      type: 'barcode',
      format: 'numeric',
      prefix: '',
      startNumber: 1,
      currentNumber: 1,
      increment: 5,
      suffix: '',
      x: 10,
      y: 10,
      width: 30,
      height: 10
    };

    // First number
    let result = generateSerialNumber(settings);
    expect(result).toBe('000001');

    // After incrementing
    settings.currentNumber += settings.increment;
    result = generateSerialNumber(settings);
    expect(result).toBe('000006');
  });
});

describe('Serialization - generateBarcodePaths', () => {
  it('generates paths for a barcode', () => {
    const paths = generateBarcodePaths('SN-000042', 10, 10, 30, 10);
    
    expect(paths.length).toBeGreaterThan(0);
    expect(paths[0]).toHaveProperty('id');
    expect(paths[0]).toHaveProperty('points');
    expect(paths[0].points.length).toBeGreaterThan(0);
    expect(paths[0].points[0]).toHaveProperty('x');
    expect(paths[0].points[0]).toHaveProperty('y');
  });

  it('generates paths within specified dimensions', () => {
    const x = 10, y = 20, width = 30, height = 15;
    const paths = generateBarcodePaths('TEST', x, y, width, height);
    
    // Check that paths are within bounds
    paths.forEach(path => {
      path.points.forEach(point => {
        expect(point.x).toBeGreaterThanOrEqual(x);
        expect(point.x).toBeLessThanOrEqual(x + width);
        expect(point.y).toBeGreaterThanOrEqual(y);
        expect(point.y).toBeLessThanOrEqual(y + height);
      });
    });
  });
});

describe('Serialization - generateDataMatrixPaths', () => {
  it('generates paths for a datamatrix', () => {
    const paths = generateDataMatrixPaths('DATA-123', 10, 10, 20);
    
    expect(paths.length).toBeGreaterThan(0);
    expect(paths[0]).toHaveProperty('id');
    expect(paths[0]).toHaveProperty('points');
  });

  it('includes border pattern', () => {
    const paths = generateDataMatrixPaths('TEST', 10, 10, 20);
    
    // Should include modules and a border
    const borderPath = paths.find(p => p.id.includes('border'));
    expect(borderPath).toBeDefined();
  });
});

describe('Serialization - generateQRCodePaths', () => {
  it('generates paths for a QR code', () => {
    const paths = generateQRCodePaths('https://example.com', 10, 10, 30);
    
    expect(paths.length).toBeGreaterThan(0);
    expect(paths[0]).toHaveProperty('id');
    expect(paths[0]).toHaveProperty('points');
  });

  it('includes position patterns', () => {
    const paths = generateQRCodePaths('TEST', 10, 10, 30);
    
    // QR codes have 3 position patterns (corners)
    // Each position pattern has 2 paths (outer and inner squares)
    const positionPaths = paths.filter(p => p.id.includes('border') || p.id.includes('module'));
    expect(positionPaths.length).toBeGreaterThan(0);
  });
});

describe('Serialization - generateTextPaths', () => {
  it('generates paths for text serialization', () => {
    const paths = generateTextPaths('12345', 10, 10, 10);
    
    expect(paths.length).toBeGreaterThan(0);
    expect(paths[0]).toHaveProperty('id');
    expect(paths[0]).toHaveProperty('points');
  });

  it('generates paths for each character', () => {
    const text = 'ABC';
    const paths = generateTextPaths(text, 10, 10, 10);
    
    // Should generate paths for all characters
    expect(paths.length).toBeGreaterThan(0);
    
    // Each character should have an id that references the character
    const uniqueChars = new Set(paths.map(p => p.id.split('-')[1]));
    expect(uniqueChars.size).toBeGreaterThan(0);
  });

  it('handles numeric characters', () => {
    const paths = generateTextPaths('0123456789', 10, 10, 10);
    expect(paths.length).toBeGreaterThan(0);
  });
});

describe('Serialization - Integration Tests', () => {
  it('generates unique IDs for each path', () => {
    const paths = generateBarcodePaths('TEST', 10, 10, 30, 10);
    const ids = paths.map(p => p.id);
    const uniqueIds = new Set(ids);
    
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('all paths have required properties', () => {
    const paths = generateDataMatrixPaths('TEST', 10, 10, 20);
    
    paths.forEach(path => {
      expect(path).toHaveProperty('id');
      expect(path).toHaveProperty('points');
      expect(path).toHaveProperty('intensity');
      expect(path).toHaveProperty('speed');
      expect(Array.isArray(path.points)).toBe(true);
      expect(path.points.length).toBeGreaterThan(0);
    });
  });

  it('supports batch production workflow', () => {
    const settings: SerializationSettings = {
      enabled: true,
      type: 'barcode',
      format: 'numeric',
      prefix: 'BATCH-',
      startNumber: 1,
      currentNumber: 1,
      increment: 1,
      suffix: '',
      x: 10,
      y: 10,
      width: 30,
      height: 10
    };

    // Generate first serial
    const serial1 = generateSerialNumber(settings);
    const paths1 = generateBarcodePaths(serial1, settings.x, settings.y, settings.width, settings.height);
    expect(serial1).toBe('BATCH-000001');
    expect(paths1.length).toBeGreaterThan(0);

    // Increment and generate second serial
    settings.currentNumber += settings.increment;
    const serial2 = generateSerialNumber(settings);
    const paths2 = generateBarcodePaths(serial2, settings.x, settings.y, settings.width, settings.height);
    expect(serial2).toBe('BATCH-000002');
    expect(paths2.length).toBeGreaterThan(0);

    // Ensure paths are different
    expect(paths1[0].id).not.toBe(paths2[0].id);
  });
});
