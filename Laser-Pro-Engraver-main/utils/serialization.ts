/**
 * Serialization utilities for generating barcodes, datamatrix codes, and auto-incrementing text
 * Part of Phase 1 implementation from ROADMAP-v0.2.0.md
 */

import { SerializationSettings, Path, Point } from '../types';

// ID generation counter for unique path IDs
let idCounter = 0;

/**
 * Generate a unique ID for paths
 */
function generateUniqueId(prefix: string): string {
  return `${prefix}-${Date.now()}-${++idCounter}`;
}

/**
 * Generate the next serial number based on settings
 */
export function generateSerialNumber(settings: SerializationSettings): string {
  const { format, prefix, currentNumber, suffix, customPattern } = settings;
  
  if (customPattern) {
    // Replace {N} with the current number
    return customPattern.replace(/\{N\}/g, currentNumber.toString());
  }
  
  let numberStr = '';
  
  switch (format) {
    case 'numeric':
      numberStr = currentNumber.toString().padStart(6, '0');
      break;
    case 'alphanumeric':
      numberStr = currentNumber.toString(36).toUpperCase().padStart(4, '0');
      break;
    case 'custom':
      numberStr = currentNumber.toString();
      break;
    default:
      numberStr = currentNumber.toString();
  }
  
  return `${prefix}${numberStr}${suffix}`;
}

/**
 * Generate paths for a barcode (Code 128 simplified representation)
 * Returns vector paths that can be engraved
 */
export function generateBarcodePaths(
  text: string,
  x: number,
  y: number,
  width: number,
  height: number
): Path[] {
  const paths: Path[] = [];
  
  // Convert text to binary representation (simplified)
  const binaryData = textToBinary(text);
  const barWidth = width / (binaryData.length + 4); // +4 for start/stop patterns
  
  // Start pattern
  let currentX = x;
  paths.push(createBar(currentX, y, barWidth, height));
  currentX += barWidth * 2;
  
  // Data bars
  for (let i = 0; i < binaryData.length; i++) {
    if (binaryData[i] === '1') {
      paths.push(createBar(currentX, y, barWidth, height));
    }
    currentX += barWidth;
  }
  
  // Stop pattern
  paths.push(createBar(currentX, y, barWidth, height));
  
  return paths;
}

/**
 * Generate paths for a DataMatrix code
 * Returns vector paths in a 2D matrix pattern
 */
export function generateDataMatrixPaths(
  text: string,
  x: number,
  y: number,
  size: number
): Path[] {
  const paths: Path[] = [];
  
  // DataMatrix modules (simplified 8x8 grid)
  const moduleCount = 8;
  const moduleSize = size / moduleCount;
  
  // Convert text to matrix data
  const matrixData = textToMatrix(text, moduleCount);
  
  // Generate filled modules
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (matrixData[row][col]) {
        const moduleX = x + col * moduleSize;
        const moduleY = y + row * moduleSize;
        paths.push(createModule(moduleX, moduleY, moduleSize));
      }
    }
  }
  
  // Add finder pattern (border)
  paths.push(createBorder(x, y, size));
  
  return paths;
}

/**
 * Generate paths for a QR code
 * Returns vector paths in a QR code pattern
 */
export function generateQRCodePaths(
  text: string,
  x: number,
  y: number,
  size: number
): Path[] {
  const paths: Path[] = [];
  
  // QR code modules (simplified 16x16 grid for QR version 1)
  const moduleCount = 16;
  const moduleSize = size / moduleCount;
  
  // Convert text to QR matrix data
  const qrData = textToQRMatrix(text, moduleCount);
  
  // Generate filled modules
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (qrData[row][col]) {
        const moduleX = x + col * moduleSize;
        const moduleY = y + row * moduleSize;
        paths.push(createModule(moduleX, moduleY, moduleSize));
      }
    }
  }
  
  // Add position patterns (three corners)
  paths.push(...createPositionPattern(x, y, moduleSize * 3));
  paths.push(...createPositionPattern(x + size - moduleSize * 3, y, moduleSize * 3));
  paths.push(...createPositionPattern(x, y + size - moduleSize * 3, moduleSize * 3));
  
  return paths;
}

/**
 * Generate paths for simple text serialization
 */
export function generateTextPaths(
  text: string,
  x: number,
  y: number,
  height: number
): Path[] {
  const paths: Path[] = [];
  const charWidth = height * 0.6;
  const charSpacing = height * 0.1;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const charX = x + i * (charWidth + charSpacing);
    paths.push(...generateCharacterPaths(char, charX, y, charWidth, height));
  }
  
  return paths;
}

// Helper functions

function createBar(x: number, y: number, width: number, height: number): Path {
  return {
    id: generateUniqueId('bar'),
    points: [
      { x, y },
      { x: x + width, y },
      { x: x + width, y: y + height },
      { x, y: y + height },
      { x, y }
    ],
    intensity: 1000,
    speed: 1500
  };
}

function createModule(x: number, y: number, size: number): Path {
  return {
    id: generateUniqueId('module'),
    points: [
      { x, y },
      { x: x + size, y },
      { x: x + size, y: y + size },
      { x, y: y + size },
      { x, y }
    ],
    intensity: 1000,
    speed: 1500
  };
}

function createBorder(x: number, y: number, size: number): Path {
  return {
    id: generateUniqueId('border'),
    points: [
      { x, y },
      { x: x + size, y },
      { x: x + size, y: y + size },
      { x, y: y + size },
      { x, y }
    ],
    intensity: 1000,
    speed: 1500
  };
}

function createPositionPattern(x: number, y: number, size: number): Path[] {
  const paths: Path[] = [];
  
  // Outer square
  paths.push(createBorder(x, y, size));
  
  // Inner square
  const innerSize = size * 0.4;
  const innerOffset = (size - innerSize) / 2;
  paths.push(createModule(x + innerOffset, y + innerOffset, innerSize));
  
  return paths;
}

function textToBinary(text: string): string {
  let binary = '';
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);
    binary += charCode.toString(2).padStart(8, '0');
  }
  return binary;
}

/**
 * Helper function to create an empty matrix
 */
function createEmptyMatrix(size: number): boolean[][] {
  return Array(size).fill(null).map(() => Array(size).fill(false));
}

function textToMatrix(text: string, size: number): boolean[][] {
  const matrix = createEmptyMatrix(size);
  const binary = textToBinary(text);
  
  let index = 0;
  for (let row = 0; row < size && index < binary.length; row++) {
    for (let col = 0; col < size && index < binary.length; col++) {
      matrix[row][col] = binary[index] === '1';
      index++;
    }
  }
  
  return matrix;
}

function textToQRMatrix(text: string, size: number): boolean[][] {
  const matrix = createEmptyMatrix(size);
  const binary = textToBinary(text);
  
  // Simplified QR encoding pattern
  let index = 0;
  for (let row = 0; row < size && index < binary.length; row++) {
    const direction = row % 2 === 0 ? 1 : -1;
    const startCol = row % 2 === 0 ? 0 : size - 1;
    
    for (let step = 0; step < size && index < binary.length; step++) {
      const col = startCol + step * direction;
      if (col >= 0 && col < size) {
        matrix[row][col] = binary[index] === '1';
        index++;
      }
    }
  }
  
  return matrix;
}

function generateCharacterPaths(
  char: string,
  x: number,
  y: number,
  width: number,
  height: number
): Path[] {
  // Simplified 7-segment display style characters
  const segments = getSegmentsForChar(char);
  const paths: Path[] = [];
  
  const segmentWidth = width * 0.8;
  const segmentHeight = height * 0.4;
  const segmentThickness = width * 0.15;
  
  // Define segment positions (7-segment display layout)
  const segmentDefs: { [key: string]: Point[] } = {
    'a': [
      { x: x + width * 0.1, y: y },
      { x: x + width * 0.9, y: y }
    ],
    'b': [
      { x: x + width * 0.9, y: y },
      { x: x + width * 0.9, y: y + segmentHeight }
    ],
    'c': [
      { x: x + width * 0.9, y: y + segmentHeight },
      { x: x + width * 0.9, y: y + height }
    ],
    'd': [
      { x: x + width * 0.1, y: y + height },
      { x: x + width * 0.9, y: y + height }
    ],
    'e': [
      { x: x + width * 0.1, y: y + segmentHeight },
      { x: x + width * 0.1, y: y + height }
    ],
    'f': [
      { x: x + width * 0.1, y: y },
      { x: x + width * 0.1, y: y + segmentHeight }
    ],
    'g': [
      { x: x + width * 0.1, y: y + segmentHeight },
      { x: x + width * 0.9, y: y + segmentHeight }
    ]
  };
  
  for (const segment of segments) {
    if (segmentDefs[segment]) {
      paths.push({
        id: generateUniqueId(`char-${char}-${segment}`),
        points: segmentDefs[segment],
        intensity: 1000,
        speed: 1500
      });
    }
  }
  
  return paths;
}

function getSegmentsForChar(char: string): string[] {
  // 7-segment display encoding
  const segmentMap: { [key: string]: string[] } = {
    '0': ['a', 'b', 'c', 'd', 'e', 'f'],
    '1': ['b', 'c'],
    '2': ['a', 'b', 'd', 'e', 'g'],
    '3': ['a', 'b', 'c', 'd', 'g'],
    '4': ['b', 'c', 'f', 'g'],
    '5': ['a', 'c', 'd', 'f', 'g'],
    '6': ['a', 'c', 'd', 'e', 'f', 'g'],
    '7': ['a', 'b', 'c'],
    '8': ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
    '9': ['a', 'b', 'c', 'd', 'f', 'g'],
    'A': ['a', 'b', 'c', 'e', 'f', 'g'],
    'B': ['c', 'd', 'e', 'f', 'g'],
    'C': ['a', 'd', 'e', 'f'],
    'D': ['b', 'c', 'd', 'e', 'g'],
    'E': ['a', 'd', 'e', 'f', 'g'],
    'F': ['a', 'e', 'f', 'g'],
    '-': ['g'],
    ' ': []
  };
  
  return segmentMap[char.toUpperCase()] || [];
}
