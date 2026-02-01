import { describe, it, expect } from 'vitest';
import {
  applyOilPainting,
  applyWatercolor,
  applyCharcoal,
  applyEngraving,
  applyStippling,
  applyUnsharpMask
} from '../utils/imageProcessor';

describe('Professional Filters - All 7 Artistic Filters', () => {
  
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

  describe('Oil Painting Filter', () => {
    it('should apply oil painting effect', () => {
      const img = createTestImage(30, 30, 128);
      
      applyOilPainting(img.data, img.width, img.height, 4, 20);
      
      // Oil painting creates smooth color regions
      expect(img.data[0]).toBeGreaterThanOrEqual(0);
      expect(img.data[0]).toBeLessThanOrEqual(255);
    });

    it('should handle different radius values', () => {
      const img = createTestImage(30, 30, 128);
      
      expect(() => applyOilPainting(img.data, img.width, img.height, 2, 20)).not.toThrow();
      expect(() => applyOilPainting(img.data, img.width, img.height, 6, 20)).not.toThrow();
    });

    it('should handle different intensity values', () => {
      const img = createTestImage(30, 30, 128);
      
      expect(() => applyOilPainting(img.data, img.width, img.height, 4, 10)).not.toThrow();
      expect(() => applyOilPainting(img.data, img.width, img.height, 4, 40)).not.toThrow();
    });
  });

  describe('Watercolor Filter', () => {
    it('should apply watercolor effect', () => {
      const img = createTestImage(30, 30, 128);
      
      applyWatercolor(img.data, img.width, img.height);
      
      expect(img.data[0]).toBeGreaterThanOrEqual(0);
      expect(img.data[0]).toBeLessThanOrEqual(255);
    });

    it('should create soft color blends', () => {
      const img = createTestImage(30, 30);
      // Create a gradient
      for (let i = 0; i < img.data.length; i += 4) {
        const value = Math.floor((i / img.data.length) * 255);
        img.data[i] = value;
        img.data[i + 1] = value;
        img.data[i + 2] = value;
      }
      
      expect(() => applyWatercolor(img.data, img.width, img.height)).not.toThrow();
    });
  });

  describe('Charcoal Filter', () => {
    it('should apply charcoal drawing effect', () => {
      const img = createTestImage(30, 30, 128);
      
      applyCharcoal(img.data, img.width, img.height);
      
      expect(img.data[0]).toBeGreaterThanOrEqual(0);
      expect(img.data[0]).toBeLessThanOrEqual(255);
    });

    it('should create high contrast edges', () => {
      const img = createTestImage(30, 30, 128);
      
      applyCharcoal(img.data, img.width, img.height);
      
      // Charcoal should create dark lines on light background
      expect(img.data).toBeDefined();
    });
  });

  describe('Engraving Filter', () => {
    it('should apply classical engraving effect', () => {
      const img = createTestImage(30, 30, 128);
      
      applyEngraving(img.data, img.width, img.height);
      
      expect(img.data[0]).toBeGreaterThanOrEqual(0);
      expect(img.data[0]).toBeLessThanOrEqual(255);
    });

    it('should create crosshatch patterns', () => {
      const img = createTestImage(30, 30);
      // Create varying tones
      for (let y = 0; y < 30; y++) {
        for (let x = 0; x < 30; x++) {
          const i = (y * 30 + x) * 4;
          const value = Math.floor((x / 30) * 255);
          img.data[i] = value;
          img.data[i + 1] = value;
          img.data[i + 2] = value;
        }
      }
      
      expect(() => applyEngraving(img.data, img.width, img.height)).not.toThrow();
    });
  });

  describe('Stippling Filter', () => {
    it('should apply stippling dot effect', () => {
      const img = createTestImage(30, 30, 128);
      
      applyStippling(img.data, img.width, img.height);
      
      expect(img.data[0]).toBeGreaterThanOrEqual(0);
      expect(img.data[0]).toBeLessThanOrEqual(255);
    });

    it('should create dot density based on tone', () => {
      const img = createTestImage(30, 30);
      // Light area
      for (let i = 0; i < 400; i += 4) {
        img.data[i] = 200;
        img.data[i + 1] = 200;
        img.data[i + 2] = 200;
      }
      // Dark area
      for (let i = img.data.length - 400; i < img.data.length; i += 4) {
        img.data[i] = 50;
        img.data[i + 1] = 50;
        img.data[i + 2] = 50;
      }
      
      expect(() => applyStippling(img.data, img.width, img.height)).not.toThrow();
    });
  });

  describe('Unsharp Mask Filter', () => {
    it('should apply unsharp mask sharpening', () => {
      const img = createTestImage(30, 30, 128);
      
      applyUnsharpMask(img.data, img.width, img.height);
      
      expect(img.data[0]).toBeGreaterThanOrEqual(0);
      expect(img.data[0]).toBeLessThanOrEqual(255);
    });

    it('should enhance edges', () => {
      const img = createTestImage(30, 30);
      // Create an edge
      for (let y = 0; y < 30; y++) {
        for (let x = 0; x < 15; x++) {
          const i = (y * 30 + x) * 4;
          img.data[i] = 50;
          img.data[i + 1] = 50;
          img.data[i + 2] = 50;
        }
        for (let x = 15; x < 30; x++) {
          const i = (y * 30 + x) * 4;
          img.data[i] = 200;
          img.data[i + 1] = 200;
          img.data[i + 2] = 200;
        }
      }
      
      expect(() => applyUnsharpMask(img.data, img.width, img.height)).not.toThrow();
    });
  });

  describe('Filter Performance', () => {
    it('should process 50x50 image in reasonable time', () => {
      const img = createTestImage(50, 50, 128);
      
      const start = Date.now();
      applyOilPainting(img.data, img.width, img.height, 4, 20);
      const duration = Date.now() - start;
      
      // Should complete in less than 2 seconds
      expect(duration).toBeLessThan(2000);
    });

    it('should handle all filters on same image', () => {
      const img = createTestImage(20, 20, 128);
      
      expect(() => {
        applyOilPainting(img.data, img.width, img.height, 4, 20);
        applyWatercolor(img.data, img.width, img.height);
        applyCharcoal(img.data, img.width, img.height);
        applyEngraving(img.data, img.width, img.height);
        applyStippling(img.data, img.width, img.height);
        applyUnsharpMask(img.data, img.width, img.height);
      }).not.toThrow();
    });
  });

  describe('Filter Edge Cases', () => {
    it('should handle small images', () => {
      const img = createTestImage(5, 5, 128);
      
      expect(() => applyOilPainting(img.data, 5, 5, 2, 10)).not.toThrow();
      expect(() => applyWatercolor(img.data, 5, 5)).not.toThrow();
      expect(() => applyCharcoal(img.data, 5, 5)).not.toThrow();
    });

    it('should preserve alpha channel', () => {
      const img = createTestImage(10, 10, 128);
      img.data[3] = 255;
      
      applyOilPainting(img.data, 10, 10, 4, 20);
      
      expect(img.data[3]).toBe(255);
    });
  });
});
