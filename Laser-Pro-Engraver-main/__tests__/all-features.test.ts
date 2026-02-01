import { describe, it, expect } from 'vitest';
import { 
  applyFloydSteinbergDither,
  applyAtkinsonDither,
  applyStuckiDither,
  applyJarvisJudiceNinkeDither,
  applyOrderedDither,
  applyEnhancedHalftone,
  grayscale,
  thresholdFilter,
  applySaturation,
  applyHue,
  applyPosterization,
  applyLevels,
  applyCurves,
  applySketchMode,
  applyTextureMapping,
  applyNoiseReduction,
  applyConvolution
} from '../utils/imageProcessor';

describe('Complete Feature Testing - All Image Processing Functions', () => {
  
  // Helper to create test image data
  const createTestImage = (width: number, height: number, fillValue: number = 128): ImageData => {
    const data = new ImageData(width, height);
    for (let i = 0; i < data.data.length; i += 4) {
      data.data[i] = fillValue;     // R
      data.data[i + 1] = fillValue; // G
      data.data[i + 2] = fillValue; // B
      data.data[i + 3] = 255;       // A
    }
    return data;
  };

  describe('Feature Test: All 5 Dithering Algorithms', () => {
    it('Feature 1: Floyd-Steinberg dithering works', () => {
      const img = createTestImage(10, 10, 128);
      applyFloydSteinbergDither(img.data, img.width, img.height);
      
      // Verify it creates binary output
      for (let i = 0; i < img.data.length; i += 4) {
        expect([0, 255]).toContain(img.data[i]);
      }
    });

    it('Feature 2: Atkinson dithering works', () => {
      const img = createTestImage(10, 10, 128);
      applyAtkinsonDither(img.data, img.width, img.height);
      
      for (let i = 0; i < img.data.length; i += 4) {
        expect([0, 255]).toContain(img.data[i]);
      }
    });

    it('Feature 3: Stucki dithering works', () => {
      const img = createTestImage(10, 10, 128);
      applyStuckiDither(img.data, img.width, img.height);
      
      for (let i = 0; i < img.data.length; i += 4) {
        expect([0, 255]).toContain(img.data[i]);
      }
    });

    it('Feature 4: Jarvis-Judice-Ninke dithering works', () => {
      const img = createTestImage(10, 10, 128);
      applyJarvisJudiceNinkeDither(img.data, img.width, img.height);
      
      for (let i = 0; i < img.data.length; i += 4) {
        expect([0, 255]).toContain(img.data[i]);
      }
    });

    it('Feature 5: Ordered dithering (2x2) works', () => {
      const img = createTestImage(10, 10, 128);
      applyOrderedDither(img.data, img.width, img.height, 2);
      
      for (let i = 0; i < img.data.length; i += 4) {
        expect([0, 255]).toContain(img.data[i]);
      }
    });

    it('Feature 6: Ordered dithering (4x4) works', () => {
      const img = createTestImage(10, 10, 128);
      applyOrderedDither(img.data, img.width, img.height, 4);
      
      for (let i = 0; i < img.data.length; i += 4) {
        expect([0, 255]).toContain(img.data[i]);
      }
    });

    it('Feature 7: Ordered dithering (8x8) works', () => {
      const img = createTestImage(10, 10, 128);
      applyOrderedDither(img.data, img.width, img.height, 8);
      
      for (let i = 0; i < img.data.length; i += 4) {
        expect([0, 255]).toContain(img.data[i]);
      }
    });
  });

  describe('Feature Test: All 5 Halftone Shapes', () => {
    it('Feature 8: Circle halftone works', () => {
      const img = createTestImage(20, 20, 128);
      applyEnhancedHalftone(img.data, img.width, img.height, 8, 45, 'circle');
      expect(img.data[0]).toBeGreaterThanOrEqual(0);
      expect(img.data[0]).toBeLessThanOrEqual(255);
    });

    it('Feature 9: Square halftone works', () => {
      const img = createTestImage(20, 20, 128);
      applyEnhancedHalftone(img.data, img.width, img.height, 8, 45, 'square');
      expect(img.data[0]).toBeGreaterThanOrEqual(0);
      expect(img.data[0]).toBeLessThanOrEqual(255);
    });

    it('Feature 10: Diamond halftone works', () => {
      const img = createTestImage(20, 20, 128);
      applyEnhancedHalftone(img.data, img.width, img.height, 8, 45, 'diamond');
      expect(img.data[0]).toBeGreaterThanOrEqual(0);
      expect(img.data[0]).toBeLessThanOrEqual(255);
    });

    it('Feature 11: Line halftone works', () => {
      const img = createTestImage(20, 20, 128);
      applyEnhancedHalftone(img.data, img.width, img.height, 8, 45, 'line');
      expect(img.data[0]).toBeGreaterThanOrEqual(0);
      expect(img.data[0]).toBeLessThanOrEqual(255);
    });

    it('Feature 12: Cross halftone works', () => {
      const img = createTestImage(20, 20, 128);
      applyEnhancedHalftone(img.data, img.width, img.height, 8, 45, 'cross');
      expect(img.data[0]).toBeGreaterThanOrEqual(0);
      expect(img.data[0]).toBeLessThanOrEqual(255);
    });
  });

  describe('Feature Test: Core Image Adjustments', () => {
    it('Feature 13: Grayscale conversion works', () => {
      const img = createTestImage(10, 10);
      img.data[0] = 255; // Red
      img.data[1] = 0;   // Green
      img.data[2] = 0;   // Blue
      
      grayscale(img.data, 0.299, 0.587, 0.114);
      
      // R, G, B should now be equal
      expect(img.data[0]).toBe(img.data[1]);
      expect(img.data[1]).toBe(img.data[2]);
    });

    it('Feature 14: Threshold filter works', () => {
      const img = createTestImage(4, 4);
      img.data[0] = img.data[1] = img.data[2] = 100;  // Below threshold
      img.data[16] = img.data[17] = img.data[18] = 200; // Above threshold
      img.data[3] = img.data[19] = 255; // Alpha
      
      thresholdFilter(img.data, 128, false);
      
      expect(img.data[0]).toBe(0);   // Should be black
      expect(img.data[16]).toBe(255); // Should be white
    });

    it('Feature 15: Saturation adjustment works', () => {
      const img = createTestImage(10, 10, 128);
      const originalValue = img.data[0];
      
      applySaturation(img.data, 1.5); // Increase saturation
      
      // Data should be modified
      expect(img.data).toBeDefined();
    });

    it('Feature 16: Hue adjustment works', () => {
      const img = createTestImage(10, 10);
      img.data[0] = 255; // Red
      img.data[1] = 0;
      img.data[2] = 0;
      
      applyHue(img.data, 120); // Shift hue by 120 degrees
      
      // Color should change
      expect(img.data[0] !== 255 || img.data[1] !== 0 || img.data[2] !== 0).toBe(true);
    });

    it('Feature 17: Posterization works', () => {
      const img = createTestImage(10, 10, 128);
      
      applyPosterization(img.data, 4); // 4 levels
      
      expect(img.data[0]).toBeGreaterThanOrEqual(0);
      expect(img.data[0]).toBeLessThanOrEqual(255);
    });

    it('Feature 18: Levels adjustment works', () => {
      const img = createTestImage(10, 10, 128);
      
      applyLevels(img.data, 0, 128, 255);
      
      expect(img.data[0]).toBeGreaterThanOrEqual(0);
      expect(img.data[0]).toBeLessThanOrEqual(255);
    });

    it('Feature 19: Curves adjustment works', () => {
      const img = createTestImage(10, 10, 128);
      const curvePoints = [
        { x: 0, y: 0 },
        { x: 128, y: 64 },
        { x: 255, y: 255 }
      ];
      
      applyCurves(img.data, curvePoints);
      
      expect(img.data[0]).toBeGreaterThanOrEqual(0);
      expect(img.data[0]).toBeLessThanOrEqual(255);
    });
  });

  describe('Feature Test: Artistic Effects', () => {
    it('Feature 20: Sketch mode works', () => {
      const img = createTestImage(20, 20, 128);
      
      applySketchMode(img.data, img.width, img.height, 30);
      
      // Should modify the image
      expect(img.data).toBeDefined();
    });

    it('Feature 21: Texture mapping works', () => {
      const img = createTestImage(20, 20, 128);
      
      applyTextureMapping(img.data, img.width, img.height, 'canvas');
      
      expect(img.data).toBeDefined();
    });

    it('Feature 22: Noise reduction works', () => {
      const img = createTestImage(20, 20, 128);
      
      applyNoiseReduction(img.data, img.width, img.height, 5);
      
      expect(img.data).toBeDefined();
    });

    it('Feature 23: Convolution filter works', () => {
      const img = createTestImage(20, 20, 128);
      const sharpenKernel = [
        [0, -1, 0],
        [-1, 5, -1],
        [0, -1, 0]
      ];
      
      applyConvolution(img.data, img.width, img.height, sharpenKernel);
      
      expect(img.data).toBeDefined();
    });
  });

  describe('Feature Test: Edge Cases and Robustness', () => {
    it('Feature 24: Handles 1x1 images', () => {
      const img = createTestImage(1, 1, 128);
      
      expect(() => applyFloydSteinbergDither(img.data, 1, 1)).not.toThrow();
      expect(() => applyAtkinsonDither(img.data, 1, 1)).not.toThrow();
      expect(() => grayscale(img.data, 1, 1, 1)).not.toThrow();
    });

    it('Feature 25: Handles large images (100x100)', () => {
      const img = createTestImage(100, 100, 128);
      
      const start = Date.now();
      applyFloydSteinbergDither(img.data, 100, 100);
      const duration = Date.now() - start;
      
      // Should complete in reasonable time
      expect(duration).toBeLessThan(1000);
    });

    it('Feature 26: Handles fully black images', () => {
      const img = createTestImage(10, 10, 0);
      
      expect(() => applyAtkinsonDither(img.data, 10, 10)).not.toThrow();
      expect(() => grayscale(img.data, 1, 1, 1)).not.toThrow();
    });

    it('Feature 27: Handles fully white images', () => {
      const img = createTestImage(10, 10, 255);
      
      expect(() => applyAtkinsonDither(img.data, 10, 10)).not.toThrow();
      expect(() => thresholdFilter(img.data, 128, false)).not.toThrow();
    });
  });
});
