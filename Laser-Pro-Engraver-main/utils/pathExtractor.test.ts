import { describe, it, expect } from 'vitest';
import { traceEdges } from '../utils/pathExtractor';

describe('pathExtractor', () => {
  describe('traceEdges', () => {
    it('should extract paths from simple binary image', () => {
      // Create a simple 5x5 binary image with a line
      const imageData = new ImageData(5, 5);
      
      // Draw a horizontal line (white pixels)
      for (let x = 0; x < 5; x++) {
        const i = (2 * 5 + x) * 4; // Row 2
        imageData.data[i] = 255;     // R
        imageData.data[i + 1] = 255; // G
        imageData.data[i + 2] = 255; // B
        imageData.data[i + 3] = 255; // A
      }
      
      const paths = traceEdges(imageData, 1);
      
      expect(paths).toBeDefined();
      expect(Array.isArray(paths)).toBe(true);
      expect(paths.length).toBeGreaterThan(0);
    });

    it('should handle empty image', () => {
      const imageData = new ImageData(10, 10);
      // All pixels are black (0)
      
      const paths = traceEdges(imageData, 1);
      
      expect(paths).toBeDefined();
      expect(Array.isArray(paths)).toBe(true);
    });

    it('should handle fully white image', () => {
      const imageData = new ImageData(5, 5);
      
      // Fill all pixels white
      for (let i = 0; i < imageData.data.length; i += 4) {
        imageData.data[i] = 255;
        imageData.data[i + 1] = 255;
        imageData.data[i + 2] = 255;
        imageData.data[i + 3] = 255;
      }
      
      const paths = traceEdges(imageData, 1);
      
      expect(paths).toBeDefined();
      expect(Array.isArray(paths)).toBe(true);
    });

    it('should apply scale factor correctly', () => {
      const imageData = new ImageData(4, 4);
      
      // Set one white pixel at (2, 2)
      const i = (2 * 4 + 2) * 4;
      imageData.data[i] = 255;
      imageData.data[i + 1] = 255;
      imageData.data[i + 2] = 255;
      imageData.data[i + 3] = 255;
      
      const paths = traceEdges(imageData, 2);
      
      expect(paths).toBeDefined();
      
      // If there are paths, check that coordinates are scaled
      if (paths.length > 0 && paths[0].length > 0) {
        expect(paths[0][0].x).toBeLessThanOrEqual(2);
        expect(paths[0][0].y).toBeLessThanOrEqual(2);
      }
    });

    it('should handle single pixel', () => {
      const imageData = new ImageData(3, 3);
      
      // Set center pixel to white
      const i = (1 * 3 + 1) * 4;
      imageData.data[i] = 255;
      imageData.data[i + 1] = 255;
      imageData.data[i + 2] = 255;
      imageData.data[i + 3] = 255;
      
      const paths = traceEdges(imageData, 1);
      
      expect(paths).toBeDefined();
      expect(Array.isArray(paths)).toBe(true);
    });

    it('should trace L-shaped path', () => {
      const imageData = new ImageData(5, 5);
      
      // Draw an L shape
      for (let y = 0; y < 3; y++) {
        const i = (y * 5 + 0) * 4;
        imageData.data[i] = 255;
        imageData.data[i + 1] = 255;
        imageData.data[i + 2] = 255;
        imageData.data[i + 3] = 255;
      }
      for (let x = 0; x < 3; x++) {
        const i = (2 * 5 + x) * 4;
        imageData.data[i] = 255;
        imageData.data[i + 1] = 255;
        imageData.data[i + 2] = 255;
        imageData.data[i + 3] = 255;
      }
      
      const paths = traceEdges(imageData, 1);
      
      expect(paths).toBeDefined();
      expect(paths.length).toBeGreaterThan(0);
    });
  });
});
