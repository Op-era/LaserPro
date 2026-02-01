import { describe, it, expect } from 'vitest';
import { 
  applyFloydSteinbergDither, 
  applyAtkinsonDither,
  grayscale,
  thresholdFilter
} from '../utils/imageProcessor';

describe('imageProcessor', () => {
  describe('grayscale', () => {
    it('should convert RGB to grayscale', () => {
      const imageData = new ImageData(2, 2);
      // Set first pixel to red
      imageData.data[0] = 255;
      imageData.data[1] = 0;
      imageData.data[2] = 0;
      imageData.data[3] = 255;
      
      grayscale(imageData.data, 0.299, 0.587, 0.114);
      
      // Check that R, G, B are now equal (grayscale)
      expect(imageData.data[0]).toBe(imageData.data[1]);
      expect(imageData.data[1]).toBe(imageData.data[2]);
      expect(imageData.data[3]).toBe(255); // Alpha unchanged
    });

    it('should handle empty image data', () => {
      const imageData = new ImageData(1, 1);
      expect(() => grayscale(imageData.data, 1, 1, 1)).not.toThrow();
    });
  });

  describe('thresholdFilter', () => {
    it('should apply threshold correctly', () => {
      const imageData = new ImageData(2, 2);
      // Set pixels to different gray values
      imageData.data[0] = imageData.data[1] = imageData.data[2] = 100; // Below 128
      imageData.data[3] = 255;
      imageData.data[4] = imageData.data[5] = imageData.data[6] = 200; // Above 128
      imageData.data[7] = 255;
      
      thresholdFilter(imageData.data, 128, false);
      
      // First pixel should be black (0)
      expect(imageData.data[0]).toBe(0);
      expect(imageData.data[1]).toBe(0);
      expect(imageData.data[2]).toBe(0);
      
      // Second pixel should be white (255)
      expect(imageData.data[4]).toBe(255);
      expect(imageData.data[5]).toBe(255);
      expect(imageData.data[6]).toBe(255);
    });

    it('should handle edge threshold values', () => {
      const imageData = new ImageData(1, 1);
      imageData.data[0] = imageData.data[1] = imageData.data[2] = 128;
      imageData.data[3] = 255;
      
      expect(() => thresholdFilter(imageData.data, 0, false)).not.toThrow();
      expect(() => thresholdFilter(imageData.data, 255, false)).not.toThrow();
    });
  });

  describe('applyFloydSteinbergDither', () => {
    it('should apply dithering without errors', () => {
      const imageData = new ImageData(10, 10);
      // Fill with gray values
      for (let i = 0; i < imageData.data.length; i += 4) {
        imageData.data[i] = imageData.data[i + 1] = imageData.data[i + 2] = 128;
        imageData.data[i + 3] = 255;
      }
      
      expect(() => applyFloydSteinbergDither(imageData.data, 10, 10)).not.toThrow();
      
      // After dithering, pixels should be either 0 or 255
      for (let i = 0; i < imageData.data.length; i += 4) {
        expect([0, 255]).toContain(imageData.data[i]);
      }
    });

    it('should handle small images', () => {
      const imageData = new ImageData(2, 2);
      for (let i = 0; i < imageData.data.length; i += 4) {
        imageData.data[i] = imageData.data[i + 1] = imageData.data[i + 2] = 128;
        imageData.data[i + 3] = 255;
      }
      
      expect(() => applyFloydSteinbergDither(imageData.data, 2, 2)).not.toThrow();
    });
  });

  describe('applyAtkinsonDither', () => {
    it('should apply Atkinson dithering without errors', () => {
      const imageData = new ImageData(10, 10);
      // Fill with gray values
      for (let i = 0; i < imageData.data.length; i += 4) {
        imageData.data[i] = imageData.data[i + 1] = imageData.data[i + 2] = 128;
        imageData.data[i + 3] = 255;
      }
      
      expect(() => applyAtkinsonDither(imageData.data, 10, 10)).not.toThrow();
      
      // After dithering, pixels should be either 0 or 255
      for (let i = 0; i < imageData.data.length; i += 4) {
        expect([0, 255]).toContain(imageData.data[i]);
      }
    });

    it('should handle edge cases', () => {
      const imageData = new ImageData(1, 1);
      imageData.data[0] = imageData.data[1] = imageData.data[2] = 128;
      imageData.data[3] = 255;
      
      expect(() => applyAtkinsonDither(imageData.data, 1, 1)).not.toThrow();
    });
  });
});
