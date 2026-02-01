import '@testing-library/jest-dom';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock Tauri API
global.window = global.window || {};
(global.window as any).__TAURI__ = {
  invoke: async (cmd: string, args?: any) => {
    console.log(`Mock Tauri invoke: ${cmd}`, args);
    return null;
  },
  tauri: {
    invoke: async (cmd: string, args?: any) => {
      console.log(`Mock Tauri invoke: ${cmd}`, args);
      return null;
    }
  }
};

// Polyfill ImageData for tests (jsdom doesn't include canvas APIs)
if (typeof ImageData === 'undefined') {
  global.ImageData = class ImageData {
    data: Uint8ClampedArray;
    width: number;
    height: number;

    constructor(width: number, height: number);
    constructor(data: Uint8ClampedArray, width: number, height?: number);
    constructor(
      dataOrWidth: Uint8ClampedArray | number,
      widthOrHeight: number,
      height?: number
    ) {
      if (dataOrWidth instanceof Uint8ClampedArray) {
        this.data = dataOrWidth;
        this.width = widthOrHeight;
        this.height = height || dataOrWidth.length / (4 * widthOrHeight);
      } else {
        this.width = dataOrWidth;
        this.height = widthOrHeight;
        this.data = new Uint8ClampedArray(dataOrWidth * widthOrHeight * 4);
      }
    }
  } as any;
}
