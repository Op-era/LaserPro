import { Path } from '../types';

/**
 * CURA-Style Heat Map Path Visualization
 * Converts laser parameters to color coding similar to 3D printing slicers
 */

export interface HeatMapColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

/**
 * Generate heat map color based on power level
 * Red = High power (hot), Yellow = Medium, Green = Low power (cool)
 */
export function getPowerHeatMapColor(power: number, maxPower: number = 1000): HeatMapColor {
  const normalized = Math.min(1, power / maxPower);
  
  if (normalized > 0.7) {
    // High power: Red to Orange
    const t = (normalized - 0.7) / 0.3;
    return {
      r: 255,
      g: Math.floor(100 - t * 100),
      b: 0,
      a: 0.9
    };
  } else if (normalized > 0.4) {
    // Medium power: Yellow to Orange
    const t = (normalized - 0.4) / 0.3;
    return {
      r: Math.floor(255),
      g: Math.floor(200 - t * 100),
      b: 0,
      a: 0.85
    };
  } else {
    // Low power: Green to Yellow
    const t = normalized / 0.4;
    return {
      r: Math.floor(t * 255),
      g: 255,
      b: 0,
      a: 0.8
    };
  }
}

/**
 * Generate heat map color based on speed
 * Red = Slow (intense), Yellow = Medium, Green = Fast (light)
 */
export function getSpeedHeatMapColor(speed: number, maxSpeed: number = 6000): HeatMapColor {
  const normalized = Math.min(1, speed / maxSpeed);
  
  // Inverse: slower = hotter
  const inverseNormalized = 1 - normalized;
  
  if (inverseNormalized > 0.7) {
    // Very slow: Bright red
    return {
      r: 255,
      g: 50,
      b: 50,
      a: 0.95
    };
  } else if (inverseNormalized > 0.4) {
    // Medium slow: Orange to Yellow
    const t = (inverseNormalized - 0.4) / 0.3;
    return {
      r: 255,
      g: Math.floor(150 + t * 105),
      b: 0,
      a: 0.85
    };
  } else {
    // Fast: Green to Yellow-green
    const t = inverseNormalized / 0.4;
    return {
      r: Math.floor(t * 200),
      g: 255,
      b: Math.floor((1 - t) * 100),
      a: 0.8
    };
  }
}

/**
 * Generate heat map color based on number of passes
 * More passes = brighter/more intense color
 */
export function getPassesHeatMapColor(passes: number, maxPasses: number = 5): HeatMapColor {
  const normalized = Math.min(1, passes / maxPasses);
  
  if (normalized > 0.6) {
    // Many passes: Bright red (cutting)
    return {
      r: 255,
      g: Math.floor((1 - normalized) * 100),
      b: 0,
      a: 0.9 + normalized * 0.1
    };
  } else if (normalized > 0.3) {
    // Multiple passes: Orange
    const t = (normalized - 0.3) / 0.3;
    return {
      r: 255,
      g: Math.floor(165 - t * 65),
      b: 0,
      a: 0.8
    };
  } else {
    // Single pass: Green-yellow (etching)
    return {
      r: Math.floor(normalized * 255 * 2),
      g: 255,
      b: 0,
      a: 0.7
    };
  }
}

/**
 * Convert HeatMapColor to CSS rgba string
 */
export function colorToRgba(color: HeatMapColor): string {
  return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
}

/**
 * Get path color based on visualization mode
 */
export function getPathColor(
  path: Path,
  mode: 'power' | 'speed' | 'passes',
  settings: { maxPower: number; maxSpeed: number }
): string {
  // Use path-specific values or defaults
  const power = path.intensity || 100;
  const speed = path.speed || 3000;
  const passes = path.passes || 1;
  
  let color: HeatMapColor;
  
  switch (mode) {
    case 'power':
      color = getPowerHeatMapColor(power, settings.maxPower);
      break;
    case 'speed':
      color = getSpeedHeatMapColor(speed, settings.maxSpeed);
      break;
    case 'passes':
      color = getPassesHeatMapColor(passes, 5);
      break;
    default:
      color = { r: 16, g: 185, b: 129, a: 0.8 }; // Default emerald
  }
  
  return colorToRgba(color);
}

/**
 * Check if two paths overlap (simple bounding box check)
 */
export function pathsOverlap(path1: Path, path2: Path, threshold: number = 2): boolean {
  // Get bounding boxes
  const bbox1 = getPathBoundingBox(path1);
  const bbox2 = getPathBoundingBox(path2);
  
  // Check if bounding boxes overlap
  return !(bbox1.maxX < bbox2.minX - threshold || 
           bbox1.minX > bbox2.maxX + threshold ||
           bbox1.maxY < bbox2.minY - threshold || 
           bbox1.minY > bbox2.maxY + threshold);
}

/**
 * Get bounding box of a path
 */
export function getPathBoundingBox(path: Path): { 
  minX: number; 
  maxX: number; 
  minY: number; 
  maxY: number 
} {
  if (path.points.length === 0) {
    return { minX: 0, maxX: 0, minY: 0, maxY: 0 };
  }
  
  let minX = path.points[0].x;
  let maxX = path.points[0].x;
  let minY = path.points[0].y;
  let maxY = path.points[0].y;
  
  for (const point of path.points) {
    if (point.x < minX) minX = point.x;
    if (point.x > maxX) maxX = point.x;
    if (point.y < minY) minY = point.y;
    if (point.y > maxY) maxY = point.y;
  }
  
  return { minX, maxX, minY, maxY };
}

/**
 * Detect overlapping paths that might burn through material
 */
export function detectOverlappingPaths(paths: Path[], threshold: number = 5): Array<{
  path1Id: string;
  path2Id: string;
  severity: 'low' | 'medium' | 'high';
}> {
  const overlaps: Array<{ path1Id: string; path2Id: string; severity: 'low' | 'medium' | 'high' }> = [];
  
  for (let i = 0; i < paths.length; i++) {
    for (let j = i + 1; j < paths.length; j++) {
      if (pathsOverlap(paths[i], paths[j], threshold)) {
        // Determine severity based on combined power
        const power1 = paths[i].intensity || 50;
        const power2 = paths[j].intensity || 50;
        const combinedPower = power1 + power2;
        
        let severity: 'low' | 'medium' | 'high';
        if (combinedPower > 150) {
          severity = 'high';
        } else if (combinedPower > 100) {
          severity = 'medium';
        } else {
          severity = 'low';
        }
        
        overlaps.push({
          path1Id: paths[i].id,
          path2Id: paths[j].id,
          severity
        });
      }
    }
  }
  
  return overlaps;
}

/**
 * Generate legend data for heat map display
 */
export function generateLegend(mode: 'power' | 'speed' | 'passes'): Array<{
  label: string;
  color: string;
  value: string;
}> {
  switch (mode) {
    case 'power':
      return [
        { label: 'High', color: colorToRgba({ r: 255, g: 0, b: 0, a: 0.9 }), value: '70-100%' },
        { label: 'Medium', color: colorToRgba({ r: 255, g: 165, b: 0, a: 0.85 }), value: '40-70%' },
        { label: 'Low', color: colorToRgba({ r: 0, g: 255, b: 0, a: 0.8 }), value: '0-40%' }
      ];
    case 'speed':
      return [
        { label: 'Slow', color: colorToRgba({ r: 255, g: 50, b: 50, a: 0.95 }), value: '0-30%' },
        { label: 'Medium', color: colorToRgba({ r: 255, g: 200, b: 0, a: 0.85 }), value: '30-60%' },
        { label: 'Fast', color: colorToRgba({ r: 0, g: 255, b: 0, a: 0.8 }), value: '60-100%' }
      ];
    case 'passes':
      return [
        { label: 'Cut', color: colorToRgba({ r: 255, g: 0, b: 0, a: 0.95 }), value: '3+ passes' },
        { label: 'Deep', color: colorToRgba({ r: 255, g: 140, b: 0, a: 0.85 }), value: '2 passes' },
        { label: 'Etch', color: colorToRgba({ r: 100, g: 255, b: 0, a: 0.75 }), value: '1 pass' }
      ];
    default:
      return [];
  }
}
