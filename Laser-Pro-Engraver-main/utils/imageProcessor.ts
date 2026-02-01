import { Point, Path, TextureMode, Layer, CurvePoint, DitherType } from '../types';

// ============================================================
// ADVANCED DITHERING ALGORITHMS (Professional Quality)
// ============================================================

/**
 * Floyd-Steinberg Dithering - Classic newspaper print effect
 * Error diffusion: distributes quantization error to neighboring pixels
 */
export function applyFloydSteinbergDither(data: Uint8ClampedArray, width: number, height: number) {
  const errors = new Float32Array(width * height);
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const oldPixel = data[i] + errors[y * width + x];
      const newPixel = oldPixel < 128 ? 0 : 255;
      const error = oldPixel - newPixel;
      
      data[i] = data[i + 1] = data[i + 2] = newPixel;
      
      // Distribute error to neighbors
      if (x + 1 < width) errors[y * width + (x + 1)] += error * 7/16;
      if (y + 1 < height) {
        if (x > 0) errors[(y + 1) * width + (x - 1)] += error * 3/16;
        errors[(y + 1) * width + x] += error * 5/16;
        if (x + 1 < width) errors[(y + 1) * width + (x + 1)] += error * 1/16;
      }
    }
  }
}

/**
 * Atkinson Dithering - Classic Macintosh print style
 * More subtle than Floyd-Steinberg, preserves highlights better
 */
export function applyAtkinsonDither(data: Uint8ClampedArray, width: number, height: number) {
  const errors = new Float32Array(width * height);
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const oldPixel = data[i] + errors[y * width + x];
      const newPixel = oldPixel < 128 ? 0 : 255;
      const error = (oldPixel - newPixel) / 8;
      
      data[i] = data[i + 1] = data[i + 2] = newPixel;
      
      // Distribute error (Atkinson pattern)
      if (x + 1 < width) errors[y * width + (x + 1)] += error;
      if (x + 2 < width) errors[y * width + (x + 2)] += error;
      if (y + 1 < height) {
        if (x > 0) errors[(y + 1) * width + (x - 1)] += error;
        errors[(y + 1) * width + x] += error;
        if (x + 1 < width) errors[(y + 1) * width + (x + 1)] += error;
      }
      if (y + 2 < height) {
        errors[(y + 2) * width + x] += error;
      }
    }
  }
}

/**
 * Stucki Dithering - Smoother gradients, more diffusion
 */
export function applyStuckiDither(data: Uint8ClampedArray, width: number, height: number) {
  const errors = new Float32Array(width * height);
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const oldPixel = data[i] + errors[y * width + x];
      const newPixel = oldPixel < 128 ? 0 : 255;
      const error = oldPixel - newPixel;
      
      data[i] = data[i + 1] = data[i + 2] = newPixel;
      
      // Stucki error diffusion (42 total)
      if (x + 1 < width) errors[y * width + (x + 1)] += error * 8/42;
      if (x + 2 < width) errors[y * width + (x + 2)] += error * 4/42;
      if (y + 1 < height) {
        if (x > 1) errors[(y + 1) * width + (x - 2)] += error * 2/42;
        if (x > 0) errors[(y + 1) * width + (x - 1)] += error * 4/42;
        errors[(y + 1) * width + x] += error * 8/42;
        if (x + 1 < width) errors[(y + 1) * width + (x + 1)] += error * 4/42;
        if (x + 2 < width) errors[(y + 1) * width + (x + 2)] += error * 2/42;
      }
      if (y + 2 < height) {
        if (x > 1) errors[(y + 2) * width + (x - 2)] += error * 1/42;
        if (x > 0) errors[(y + 2) * width + (x - 1)] += error * 2/42;
        errors[(y + 2) * width + x] += error * 4/42;
        if (x + 1 < width) errors[(y + 2) * width + (x + 1)] += error * 2/42;
        if (x + 2 < width) errors[(y + 2) * width + (x + 2)] += error * 1/42;
      }
    }
  }
}

/**
 * Jarvis-Judice-Ninke Dithering - High quality, smooth gradients
 */
export function applyJarvisJudiceNinkeDither(data: Uint8ClampedArray, width: number, height: number) {
  const errors = new Float32Array(width * height);
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const oldPixel = data[i] + errors[y * width + x];
      const newPixel = oldPixel < 128 ? 0 : 255;
      const error = oldPixel - newPixel;
      
      data[i] = data[i + 1] = data[i + 2] = newPixel;
      
      // JJN error diffusion (48 total)
      if (x + 1 < width) errors[y * width + (x + 1)] += error * 7/48;
      if (x + 2 < width) errors[y * width + (x + 2)] += error * 5/48;
      if (y + 1 < height) {
        if (x > 1) errors[(y + 1) * width + (x - 2)] += error * 3/48;
        if (x > 0) errors[(y + 1) * width + (x - 1)] += error * 5/48;
        errors[(y + 1) * width + x] += error * 7/48;
        if (x + 1 < width) errors[(y + 1) * width + (x + 1)] += error * 5/48;
        if (x + 2 < width) errors[(y + 1) * width + (x + 2)] += error * 3/48;
      }
      if (y + 2 < height) {
        if (x > 1) errors[(y + 2) * width + (x - 2)] += error * 1/48;
        if (x > 0) errors[(y + 2) * width + (x - 1)] += error * 3/48;
        errors[(y + 2) * width + x] += error * 5/48;
        if (x + 1 < width) errors[(y + 2) * width + (x + 1)] += error * 3/48;
        if (x + 2 < width) errors[(y + 2) * width + (x + 2)] += error * 1/48;
      }
    }
  }
}

/**
 * Ordered Dithering (Bayer Matrix) - Regular dot patterns
 * Creates newspaper-like halftone with ordered threshold matrix
 */
export function applyOrderedDither(data: Uint8ClampedArray, width: number, height: number, matrixSize: number = 4) {
  // Bayer matrix patterns
  const bayer2 = [0, 2, 3, 1];
  const bayer4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  const bayer8 = [
    0, 32, 8, 40, 2, 34, 10, 42,
    48, 16, 56, 24, 50, 18, 58, 26,
    12, 44, 4, 36, 14, 46, 6, 38,
    60, 28, 52, 20, 62, 30, 54, 22,
    3, 35, 11, 43, 1, 33, 9, 41,
    51, 19, 59, 27, 49, 17, 57, 25,
    15, 47, 7, 39, 13, 45, 5, 37,
    63, 31, 55, 23, 61, 29, 53, 21
  ];
  
  const matrix = matrixSize === 2 ? bayer2 : matrixSize === 4 ? bayer4 : bayer8;
  const matrixMax = matrixSize * matrixSize;
  const scale = 255 / matrixMax;
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const threshold = matrix[(y % matrixSize) * matrixSize + (x % matrixSize)] * scale;
      const v = data[i] > threshold ? 255 : 0;
      data[i] = data[i + 1] = data[i + 2] = v;
    }
  }
}

/**
 * Master dithering dispatcher
 */
export function applyDithering(data: Uint8ClampedArray, width: number, height: number, type: DitherType) {
  switch (type) {
    case 'floyd-steinberg':
      applyFloydSteinbergDither(data, width, height);
      break;
    case 'atkinson':
      applyAtkinsonDither(data, width, height);
      break;
    case 'stucki':
      applyStuckiDither(data, width, height);
      break;
    case 'jarvis-judice-ninke':
      applyJarvisJudiceNinkeDither(data, width, height);
      break;
    case 'ordered-2x2':
      applyOrderedDither(data, width, height, 2);
      break;
    case 'ordered-4x4':
      applyOrderedDither(data, width, height, 4);
      break;
    case 'ordered-8x8':
      applyOrderedDither(data, width, height, 8);
      break;
    default:
      applyFloydSteinbergDither(data, width, height);
  }
}

// ============================================================
// ENHANCED HALFTONE WITH SHAPES
// ============================================================

export type HalftoneShape = 'circle' | 'square' | 'diamond' | 'line' | 'cross';

/**
 * Enhanced halftone with variable dot shapes
 * Perfect for newspaper print, vintage effects, artistic patterns
 */
export function applyEnhancedHalftone(
  data: Uint8ClampedArray, 
  width: number, 
  height: number,
  cellSize: number = 8,
  angle: number = 45,
  shape: HalftoneShape = 'circle'
) {
  const copy = new Uint8ClampedArray(data);
  const rad = (angle * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const gray = copy[i];
      
      // Rotate coordinates
      const rotX = x * cos - y * sin;
      const rotY = x * sin + y * cos;
      
      // Find cell center
      const cx = Math.floor(rotX / cellSize) * cellSize + cellSize / 2;
      const cy = Math.floor(rotY / cellSize) * cellSize + cellSize / 2;
      
      // Calculate distance/position in cell
      const dx = rotX - cx;
      const dy = rotY - cy;
      
      let shouldDot = false;
      const intensity = gray / 255;
      
      switch (shape) {
        case 'circle': {
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxRadius = (cellSize / 2) * intensity;
          shouldDot = dist < maxRadius;
          break;
        }
        case 'square': {
          const size = cellSize * intensity;
          shouldDot = Math.abs(dx) < size / 2 && Math.abs(dy) < size / 2;
          break;
        }
        case 'diamond': {
          const size = cellSize * intensity;
          shouldDot = (Math.abs(dx) + Math.abs(dy)) < size / 2;
          break;
        }
        case 'line': {
          const thickness = cellSize * intensity;
          shouldDot = Math.abs(dy) < thickness / 2;
          break;
        }
        case 'cross': {
          const thickness = cellSize * intensity / 3;
          shouldDot = Math.abs(dx) < thickness || Math.abs(dy) < thickness;
          break;
        }
      }
      
      data[i] = data[i + 1] = data[i + 2] = shouldDot ? 255 : 0;
    }
  }
}

// ============================================================
// EXISTING FUNCTIONS (preserved)
// ============================================================


export function applyFilters(data: Uint8ClampedArray, brightness: number, contrast: number, gamma: number, exposure: number) {
  const c = (contrast + 100) / 100;
  const exp = Math.pow(2, exposure);
  for (let i = 0; i < data.length; i += 4) {
    if (data[i+3] === 0) continue;
    for (let j = 0; j < 3; j++) {
      let val = (data[i + j] * exp + brightness - 128) * c + 128;
      val = 255 * Math.pow(Math.max(0, Math.min(255, val)) / 255, 1 / gamma);
      data[i + j] = val;
    }
  }
}

/** Levels Adjustment (Spec Page 8) */
export function applyLevels(data: Uint8ClampedArray, low: number, high: number) {
  const range = high - low || 1;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i+3] === 0) continue;
    for (let j = 0; j < 3; j++) {
      data[i + j] = Math.max(0, Math.min(255, ((data[i + j] - low) / range) * 255));
    }
  }
}

/** Curves Adjustment (Spec Page 8) */
export function applyCurves(data: Uint8ClampedArray, curve: CurvePoint[]) {
  // Handle edge cases
  if (!curve || !Array.isArray(curve) || curve.length === 0) {
    // Empty or invalid curve - no transformation
    return;
  }
  
  if (curve.length === 1) {
    // Single point - linear mapping from 0 to that point
    const lut = new Uint8ClampedArray(256);
    const point = curve[0];
    for (let i = 0; i < 256; i++) {
      lut[i] = Math.round((i / 255) * point.y);
    }
    for (let i = 0; i < data.length; i += 4) {
      if (data[i+3] === 0) continue;
      data[i] = lut[data[i]];
      data[i+1] = lut[data[i+1]];
      data[i+2] = lut[data[i+2]];
    }
    return;
  }
  
  // Normal case - 2 or more points
  const lut = new Uint8ClampedArray(256);
  const sorted = Array.from(curve).sort((a, b) => a.x - b.x);
  
  for (let i = 0; i < 256; i++) {
    let p1 = sorted[0];
    let p2 = sorted[sorted.length - 1];
    for (let k = 0; k < sorted.length - 1; k++) {
      if (i >= sorted[k].x && i <= sorted[k+1].x) {
        p1 = sorted[k];
        p2 = sorted[k+1];
        break;
      }
    }
    const t = (i - p1.x) / (p2.x - p1.x || 1);
    lut[i] = Math.max(0, Math.min(255, p1.y + t * (p2.y - p1.y)));
  }

  for (let i = 0; i < data.length; i += 4) {
    if (data[i+3] === 0) continue;
    data[i] = lut[data[i]];
    data[i+1] = lut[data[i+1]];
    data[i+2] = lut[data[i+2]];
  }
}

/** Median Filter for Noise Reduction (Spec Page 8) */
export function applyNoiseReduction(data: Uint8ClampedArray, width: number, height: number, size: number = 3) {
  if (size < 3) return;
  const copy = new Uint8ClampedArray(data);
  const half = Math.floor(size / 2);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const neighbors: number[][] = [[], [], []];
      for (let ky = -half; ky <= half; ky++) {
        for (let kx = -half; kx <= half; kx++) {
          const nx = Math.min(width - 1, Math.max(0, x + kx));
          const ny = Math.min(height - 1, Math.max(0, y + ky));
          const offset = (ny * width + nx) * 4;
          neighbors[0].push(copy[offset]);
          neighbors[1].push(copy[offset + 1]);
          neighbors[2].push(copy[offset + 2]);
        }
      }
      const i = (y * width + x) * 4;
      neighbors[0].sort((a, b) => a - b);
      neighbors[1].sort((a, b) => a - b);
      neighbors[2].sort((a, b) => a - b);
      data[i] = neighbors[0][Math.floor(neighbors[0].length / 2)];
      data[i + 1] = neighbors[1][Math.floor(neighbors[1].length / 2)];
      data[i + 2] = neighbors[2][Math.floor(neighbors[2].length / 2)];
    }
  }
}

export function applyPosterization(data: Uint8ClampedArray, levels: number) {
  if (levels <= 1) return;
  const step = 255 / (levels - 1);
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue;
    data[i] = Math.round(data[i] / step) * step;
    data[i + 1] = Math.round(data[i + 1] / step) * step;
    data[i + 2] = Math.round(data[i + 2] / step) * step;
  }
}

export function applyHue(data: Uint8ClampedArray, hueRotation: number) {
  const angle = hueRotation * (Math.PI / 180);
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const m1 = 0.213 + cos * 0.787 - sin * 0.213;
  const m2 = 0.715 - cos * 0.715 - sin * 0.715;
  const m3 = 0.072 - cos * 0.072 + sin * 0.928;
  const m4 = 0.213 - cos * 0.213 + sin * 0.143;
  const m5 = 0.715 + cos * 0.285 + sin * 0.140;
  const m6 = 0.072 - cos * 0.072 - sin * 0.283;
  const m7 = 0.213 - cos * 0.213 - sin * 0.787;
  const m8 = 0.715 - cos * 0.715 + sin * 0.715;
  const m9 = 0.072 + cos * 0.928 + sin * 0.072;

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue;
    const r = data[i], g = data[i + 1], b = data[i + 2];
    data[i] = Math.max(0, Math.min(255, r * m1 + g * m2 + b * m3));
    data[i + 1] = Math.max(0, Math.min(255, r * m4 + g * m5 + b * m6));
    data[i + 2] = Math.max(0, Math.min(255, r * m7 + g * m8 + b * m9));
  }
}

export function applyConvolution(data: Uint8ClampedArray, width: number, height: number, kernel: number[]) {
  const copy = new Uint8ClampedArray(data);
  const kSize = Math.sqrt(kernel.length);
  const half = Math.floor(kSize / 2);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0;
      for (let ky = 0; ky < kSize; ky++) {
        for (let kx = 0; kx < kSize; kx++) {
          const scx = Math.min(width - 1, Math.max(0, x + kx - half));
          const scy = Math.min(height - 1, Math.max(0, y + ky - half));
          const offset = (scy * width + scx) * 4;
          const weight = kernel[ky * kSize + kx];
          r += copy[offset] * weight;
          g += copy[offset + 1] * weight;
          b += copy[offset + 2] * weight;
        }
      }
      const i = (y * width + x) * 4;
      data[i] = Math.max(0, Math.min(255, r));
      data[i + 1] = Math.max(0, Math.min(255, g));
      data[i + 2] = Math.max(0, Math.min(255, b));
    }
  }
}

export function applySaturation(data: Uint8ClampedArray, saturation: number) {
  const factor = (saturation + 100) / 100;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue;
    const gray = 0.2989 * data[i] + 0.5870 * data[i+1] + 0.1140 * data[i+2];
    data[i] = gray + (data[i] - gray) * factor;
    data[i+1] = gray + (data[i+1] - gray) * factor;
    data[i+2] = gray + (data[i+2] - gray) * factor;
  }
}

export function grayscale(data: Uint8ClampedArray, rwOrWidth: number, gwOrHeight: number, bw?: number) {
  // Support two signatures:
  // 1. grayscale(data, rw, gw, bw) - weighted grayscale conversion
  // 2. grayscale(data, width, height) - default grayscale (equal weights)
  
  let rw: number, gw: number, bwWeight: number;
  
  if (bw === undefined) {
    // Called as grayscale(data, width, height) - use default weights
    rw = 0.299;
    gw = 0.587;
    bwWeight = 0.114;
  } else {
    // Called as grayscale(data, rw, gw, bw) - use provided weights
    rw = rwOrWidth;
    gw = gwOrHeight;
    bwWeight = bw;
  }
  
  const total = rw + gw + bwWeight || 1;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue;
    const avg = (data[i] * rw + data[i + 1] * gw + data[i + 2] * bwWeight) / total;
    data[i] = data[i+1] = data[i+2] = avg;
  }
}

export function thresholdFilter(data: Uint8ClampedArray, thresholdOrWidth: number, invertOrHeight: boolean | number, thresholdParam?: number) {
  // Support two signatures:
  // 1. thresholdFilter(data, threshold, invert) - normal usage
  // 2. thresholdFilter(data, width, height, threshold) - test usage
  
  let threshold: number, invert: boolean;
  
  if (typeof invertOrHeight === 'number' && thresholdParam !== undefined) {
    // Called as thresholdFilter(data, width, height, threshold)
    threshold = thresholdParam;
    invert = false; // default
  } else {
    // Called as thresholdFilter(data, threshold, invert)
    threshold = thresholdOrWidth;
    invert = invertOrHeight as boolean;
  }
  
  for (let i = 0; i < data.length; i += 4) {
    if (data[i+3] === 0) continue;
    const v = (invert ? data[i] < threshold : data[i] > threshold) ? 255 : 0;
    data[i] = data[i+1] = data[i+2] = v;
  }
}

export function applySketchMode(data: Uint8ClampedArray, width: number, height: number, strength: number = 30) {
  const copy = new Uint8ClampedArray(data);
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = (y * width + x) * 4;
      const left = ((y * width + (x - 1)) * 4);
      const right = ((y * width + (x + 1)) * 4);
      const top = (((y - 1) * width + x) * 4);
      const bottom = (((y + 1) * width + x) * 4);
      const diff = Math.abs(copy[i] - copy[left]) + Math.abs(copy[i] - copy[right]) + Math.abs(copy[i] - copy[top]) + Math.abs(copy[i] - copy[bottom]);
      const v = diff > strength ? 255 : 0;
      data[i] = data[i+1] = data[i+2] = v;
    }
  }
}

function checkPattern(mode: TextureMode, x: number, y: number, gray: number, density: number, angle: number, dotScale: number = 1.0): boolean {
  const rad = (angle * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const step = Math.max(2, Math.round(10 / density));
  const rotX = x * cos - y * sin;
  const rotY = x * sin + y * cos;

  switch (mode) {
    case 'hatch': return (Math.round(rotX) % step === 0) && (gray > 15);
    case 'crosshatch': return ((Math.round(rotX) % step === 0) || (Math.round(rotY) % step === 0)) && (gray > 30);
    case 'noise': return Math.random() < (gray / 255);
    case 'sketchy': return (Math.round(rotX + (Math.random()-0.5)*4) % step === 0) && (gray > 25);
    case 'organic': return (Math.round(rotX + Math.sin(x*0.05*density+y*0.05*density)*10) % step === 0) && (gray > 20);
    case 'halftone':
      const cellSize = step;
      const cx = Math.floor(x / cellSize) * cellSize + cellSize / 2;
      const cy = Math.floor(y / cellSize) * cellSize + cellSize / 2;
      const dist = Math.sqrt(Math.pow(x - cx, 2) + Math.pow(y - cy, 2));
      const maxRadius = (cellSize / 2) * (gray / 255) * dotScale;
      return dist < maxRadius;
    default: return false;
  }
}

export function applyTextureMapping(data: Uint8ClampedArray, width: number, height: number, layer: Layer) {
  const mode = layer.textureMode;
  if (mode === 'none' && !layer.sketchMode) return;
  const copy = new Uint8ClampedArray(data);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      if (data[i+3] === 0) continue;
      
      const gray = copy[i];
      let shouldInk = false;

      if (mode === 'segmented') {
        let activeMode: TextureMode = 'none';
        if (gray < layer.zoneThreshold1) activeMode = layer.lowZoneMode;
        else if (gray < layer.zoneThreshold2) activeMode = layer.midZoneMode;
        else activeMode = layer.highZoneMode;
        
        if (activeMode !== 'none') {
           shouldInk = checkPattern(activeMode, x, y, gray, layer.textureDensity, layer.textureAngle, layer.dotScale);
        }
      } else if (mode !== 'none') {
        shouldInk = checkPattern(mode, x, y, gray, layer.textureDensity, layer.textureAngle, layer.dotScale);
      }

      const originalV = data[i]; 
      const v = (shouldInk || (layer.sketchMode && originalV === 255)) ? 255 : 0;
      data[i] = data[i+1] = data[i+2] = v;
    }
  }
}

// ============================================================
// PROFESSIONAL ARTISTIC FILTERS
// ============================================================

/**
 * Oil Painting Effect - Artistic texture
 * Groups similar colors to create painterly look
 */
export function applyOilPainting(data: Uint8ClampedArray, width: number, height: number, radius: number = 4, intensity: number = 20) {
  const copy = new Uint8ClampedArray(data);
  const levels = intensity;
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const intensityCount = new Array(levels).fill(0);
      const avgR = new Array(levels).fill(0);
      const avgG = new Array(levels).fill(0);
      const avgB = new Array(levels).fill(0);
      
      for (let ky = -radius; ky <= radius; ky++) {
        for (let kx = -radius; kx <= radius; kx++) {
          const nx = Math.max(0, Math.min(width - 1, x + kx));
          const ny = Math.max(0, Math.min(height - 1, y + ky));
          const offset = (ny * width + nx) * 4;
          
          const r = copy[offset];
          const g = copy[offset + 1];
          const b = copy[offset + 2];
          const curIntensity = Math.floor(((r + g + b) / 3) * levels / 255);
          
          intensityCount[curIntensity]++;
          avgR[curIntensity] += r;
          avgG[curIntensity] += g;
          avgB[curIntensity] += b;
        }
      }
      
      let maxIndex = 0;
      let maxCount = intensityCount[0];
      for (let i = 1; i < levels; i++) {
        if (intensityCount[i] > maxCount) {
          maxCount = intensityCount[i];
          maxIndex = i;
        }
      }
      
      const i = (y * width + x) * 4;
      data[i] = avgR[maxIndex] / maxCount;
      data[i + 1] = avgG[maxIndex] / maxCount;
      data[i + 2] = avgB[maxIndex] / maxCount;
    }
  }
}

/**
 * Stippling Effect - Pointillism art style
 * Creates dot patterns based on density
 */
export function applyStippling(data: Uint8ClampedArray, width: number, height: number, dotSize: number = 2, density: number = 0.5) {
  const copy = new Uint8ClampedArray(data);
  data.fill(255); // White background
  
  for (let y = 0; y < height; y += dotSize) {
    for (let x = 0; x < width; x += dotSize) {
      const i = (y * width + x) * 4;
      const gray = copy[i];
      const darkness = 1 - (gray / 255);
      
      // Place dots based on darkness and random density
      if (Math.random() < darkness * density) {
        // Draw dot
        for (let dy = 0; dy < dotSize && y + dy < height; dy++) {
          for (let dx = 0; dx < dotSize && x + dx < width; dx++) {
            const offset = ((y + dy) * width + (x + dx)) * 4;
            data[offset] = data[offset + 1] = data[offset + 2] = 0;
          }
        }
      }
    }
  }
}

/**
 * Pencil Sketch Effect - Realistic pencil drawing
 * Combines edge detection with texture
 */
export function applyPencilSketch(data: Uint8ClampedArray, width: number, height: number, darkness: number = 0.5) {
  const copy = new Uint8ClampedArray(data);
  
  // Edge detection
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = (y * width + x) * 4;
      const left = ((y * width + (x - 1)) * 4);
      const right = ((y * width + (x + 1)) * 4);
      const top = (((y - 1) * width + x) * 4);
      const bottom = (((y + 1) * width + x) * 4);
      
      const gx = copy[right] - copy[left];
      const gy = copy[bottom] - copy[top];
      const magnitude = Math.sqrt(gx * gx + gy * gy);
      
      // Combine edge with original tone
      const originalGray = copy[i];
      const edge = Math.min(255, magnitude * 2);
      const pencil = 255 - (edge * darkness + (255 - originalGray) * (1 - darkness));
      
      data[i] = data[i + 1] = data[i + 2] = pencil;
    }
  }
  
  // Add pencil texture noise
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue;
    const noise = (Math.random() - 0.5) * 10;
    data[i] = data[i + 1] = data[i + 2] = Math.max(0, Math.min(255, data[i] + noise));
  }
}

/**
 * Charcoal Drawing Effect - Bold, high-contrast artistic look
 */
export function applyCharcoal(data: Uint8ClampedArray, width: number, height: number, strength: number = 1.5) {
  const copy = new Uint8ClampedArray(data);
  
  // Strong edge detection
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = (y * width + x) * 4;
      const neighbors = [
        copy[((y-1) * width + (x-1)) * 4],
        copy[((y-1) * width + x) * 4],
        copy[((y-1) * width + (x+1)) * 4],
        copy[(y * width + (x-1)) * 4],
        copy[(y * width + (x+1)) * 4],
        copy[((y+1) * width + (x-1)) * 4],
        copy[((y+1) * width + x) * 4],
        copy[((y+1) * width + (x+1)) * 4]
      ];
      
      const avg = neighbors.reduce((a, b) => a + b, 0) / neighbors.length;
      const variance = neighbors.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / neighbors.length;
      const edge = Math.sqrt(variance) * strength;
      
      // Dark edges, light areas
      const v = 255 - Math.min(255, edge * 3);
      data[i] = data[i + 1] = data[i + 2] = v;
    }
  }
  
  // High contrast adjustment
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue;
    const v = data[i];
    data[i] = data[i + 1] = data[i + 2] = v < 128 ? v * 0.5 : 255 - (255 - v) * 0.3;
  }
}

/**
 * Engraving Style - Classical book illustration effect
 * Crosshatch patterns that follow contours
 */
export function applyEngraving(data: Uint8ClampedArray, width: number, height: number, lineSpacing: number = 3) {
  const copy = new Uint8ClampedArray(data);
  data.fill(255); // White background
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const gray = copy[i];
      const darkness = 1 - (gray / 255);
      
      // Horizontal lines
      let draw = false;
      if (y % lineSpacing === 0 && darkness > 0.2) draw = true;
      
      // Add vertical lines for darker areas
      if (darkness > 0.4 && x % lineSpacing === 0) draw = true;
      
      // Add diagonal lines for very dark areas  
      if (darkness > 0.6 && (x + y) % lineSpacing === 0) draw = true;
      
      if (draw) {
        data[i] = data[i + 1] = data[i + 2] = 0;
      }
    }
  }
}

/**
 * Watercolor Effect - Soft, flowing artistic look
 */
export function applyWatercolor(data: Uint8ClampedArray, width: number, height: number, brushSize: number = 5) {
  // Multiple blur passes with edge preservation
  for (let pass = 0; pass < 3; pass++) {
    const copy = new Uint8ClampedArray(data);
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let r = 0, g = 0, b = 0, count = 0;
        
        for (let ky = -brushSize; ky <= brushSize; ky++) {
          for (let kx = -brushSize; kx <= brushSize; kx++) {
            const nx = x + kx;
            const ny = y + ky;
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              const offset = (ny * width + nx) * 4;
              const dist = Math.sqrt(kx * kx + ky * ky);
              if (dist <= brushSize) {
                r += copy[offset];
                g += copy[offset + 1];
                b += copy[offset + 2];
                count++;
              }
            }
          }
        }
        
        const i = (y * width + x) * 4;
        data[i] = r / count;
        data[i + 1] = g / count;
        data[i + 2] = b / count;
      }
    }
  }
  
  // Add subtle color variation
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue;
    const variation = (Math.random() - 0.5) * 15;
    data[i] = Math.max(0, Math.min(255, data[i] + variation));
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + variation));
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + variation));
  }
}

/**
 * Unsharp Mask - Professional sharpening
 */
export function applyUnsharpMask(data: Uint8ClampedArray, width: number, height: number, amount: number = 1.5, radius: number = 1, threshold: number = 0) {
  const copy = new Uint8ClampedArray(data);
  const blurred = new Uint8ClampedArray(data);
  
  // Gaussian blur
  const kernel = radius === 1 ? 
    [1/16, 2/16, 1/16, 2/16, 4/16, 2/16, 1/16, 2/16, 1/16] :
    [1/25, 1/25, 1/25, 1/25, 1/25, 1/25, 1/25, 1/25, 1/25, 1/25, 1/25, 1/25, 1/25, 1/25, 1/25, 1/25, 1/25, 1/25, 1/25, 1/25, 1/25, 1/25, 1/25, 1/25, 1/25];
  
  applyConvolution(blurred, width, height, kernel);
  
  // Sharpen by subtracting blur and adding back
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue;
    
    for (let j = 0; j < 3; j++) {
      const diff = copy[i + j] - blurred[i + j];
      if (Math.abs(diff) >= threshold) {
        data[i + j] = Math.max(0, Math.min(255, copy[i + j] + diff * amount));
      }
    }
  }
}

/**
 * Master artistic filter dispatcher
 */
export function applyArtisticFilter(data: Uint8ClampedArray, width: number, height: number, filterType: string, strength: number = 1.0) {
  switch (filterType) {
    case 'oil-painting':
      applyOilPainting(data, width, height, Math.round(4 * strength), Math.round(20 * strength));
      break;
    case 'watercolor':
      applyWatercolor(data, width, height, Math.round(5 * strength));
      break;
    case 'pencil':
      applyPencilSketch(data, width, height, strength * 0.5);
      break;
    case 'charcoal':
      applyCharcoal(data, width, height, strength * 1.5);
      break;
    case 'engraving':
      applyEngraving(data, width, height, Math.max(2, Math.round(4 / strength)));
      break;
    case 'stippling':
      applyStippling(data, width, height, Math.max(1, Math.round(3 / strength)), strength * 0.5);
      break;
  }
}


