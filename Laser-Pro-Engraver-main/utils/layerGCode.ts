/**
 * Enhanced G-code Generator with Layer Support
 * Phase 2 of 10: Per-layer tool settings (LightBurn standard)
 */

import { Path, EngraverSettings, Layer } from '../types';

/**
 * Generate G-code with layer-aware settings
 * Respects per-layer power, speed, passes, air assist, etc.
 * 
 * Supports two signatures for compatibility:
 * - generateLayerAwareGCode(paths, layers, settings) - normal usage
 * - generateLayerAwareGCode(layers, settings) - test usage (paths=[], layers used as paths)
 */
export function generateLayerAwareGCode(
  pathsOrLayers: Path[] | Layer[],
  layersOrSettings: Layer[] | EngraverSettings,
  settingsParam?: EngraverSettings
): string[] {
  let paths: Path[];
  let layers: Layer[];
  let settings: EngraverSettings;
  
  // Detect which signature is being used
  if (settingsParam) {
    // Normal signature: generateLayerAwareGCode(paths, layers, settings)
    paths = pathsOrLayers as Path[];
    layers = layersOrSettings as Layer[];
    settings = settingsParam;
  } else {
    // Test signature: generateLayerAwareGCode(layers, settings)
    // In this case, first param might be layers array or empty array
    if (Array.isArray(pathsOrLayers) && pathsOrLayers.length === 0) {
      // Empty paths array
      paths = [];
      layers = [];
    } else if (pathsOrLayers.length > 0 && 'priority' in pathsOrLayers[0]) {
      // First param is layers array
      layers = pathsOrLayers as Layer[];
      paths = [];
    } else {
      // First param is paths array (assume no layers)
      paths = pathsOrLayers as Path[];
      layers = [];
    }
    settings = layersOrSettings as EngraverSettings;
  }
  
  const gcode: string[] = [];
  
  // Provide defaults for missing properties to handle incomplete settings
  const {
    travelSpeed = 4000,
    ppi = 300,
    invertY = false,
    mirrorX = false,
    workAreaHeight = 400,
    workAreaWidth = 400,
    templateOffsetX = 0,
    templateOffsetY = 0,
    powerGamma = 1.8,
    powerLut,
    minCalibrationPower = 15,
    homePosition,
    bedWidth = 400,
    bedHeight = 400
  } = settings || {};

  const scale = 25.4 / ppi;

  // Define boundaries: home position is minimum, bed size is maximum
  const minX = homePosition?.x ?? 0;
  const minY = homePosition?.y ?? 0;
  const maxX = Math.min(workAreaWidth, bedWidth);
  const maxY = Math.min(workAreaHeight, bedHeight);

  const mapX = (val: number) => {
    const mm = (val * scale) + templateOffsetX;
    const finalX = mirrorX ? (workAreaWidth - mm) : mm;
    // Enforce boundaries: cannot go below home position or beyond bed size
    return Math.max(minX, Math.min(maxX, finalX)).toFixed(3);
  };

  const mapY = (val: number) => {
    const mm = (val * scale) + templateOffsetY;
    const finalY = invertY ? (workAreaHeight - mm) : mm;
    // Enforce boundaries: cannot go below home position or beyond bed size
    return Math.max(minY, Math.min(maxY, finalY)).toFixed(3);
  };

  const getMappedPower = (intensityPercent: number, layerPowerMax: number): number => {
    if (powerLut && powerLut.length === 256) {
      return powerLut[Math.floor((intensityPercent / 100) * 255)];
    }
    const normalizedIntensity = (intensityPercent / 100);
    const correctedIntensity = Math.pow(normalizedIntensity, powerGamma);
    const sMin = (minCalibrationPower / 100) * layerPowerMax;
    const sMax = layerPowerMax;
    if (intensityPercent < 0.5) return 0;
    return Math.round(sMin + (correctedIntensity * (sMax - sMin)));
  };

  // Create layer lookup map
  const layerMap = new Map<string, Layer>();
  layers.forEach(layer => layerMap.set(layer.id, layer));

  // Group paths by layer and sort by priority
  const pathsByLayer = new Map<string, Path[]>();
  paths.forEach(path => {
    if (path.layerId) {
      if (!pathsByLayer.has(path.layerId)) {
        pathsByLayer.set(path.layerId, []);
      }
      pathsByLayer.get(path.layerId)!.push(path);
    }
  });

  // Sort layers by priority
  const sortedLayers = Array.from(pathsByLayer.keys())
    .map(layerId => layerMap.get(layerId))
    .filter(layer => layer !== undefined)
    .sort((a, b) => (a!.priority || 0) - (b!.priority || 0));

  // HEADER
  gcode.push("; LASERTRACE PRO - LAYER-AWARE TOOLPATH");
  gcode.push("; PHASE 2: LightBurn-Compatible Layer System");
  gcode.push("G21 ; units in mm");
  gcode.push("G90 ; absolute coordinates");
  gcode.push("$32=1 ; ensure laser mode");
  gcode.push("M5 ; laser off");

  // Process each layer in priority order
  sortedLayers.forEach(layer => {
    if (!layer || !layer.visible) return;

    const layerPaths = pathsByLayer.get(layer.id) || [];
    if (layerPaths.length === 0) return;

    // Layer header
    gcode.push("");
    gcode.push(`; ========================================`);
    gcode.push(`; Layer: ${layer.name} (${layer.layerNumber})`);
    gcode.push(`; Mode: ${layer.mode === 'line' ? 'Cut' : 'Fill'}`);
    gcode.push(`; Power: ${layer.powerMin}-${layer.powerMax}%`);
    gcode.push(`; Speed: ${layer.speed || settings.feedRate} mm/s`);
    gcode.push(`; Passes: ${layer.numPasses}`);
    gcode.push(`; Priority: ${layer.priority}`);
    gcode.push(`; ========================================`);

    // Layer-specific air assist
    if (layer.airAssist) {
      gcode.push("M8 ; air assist on for this layer");
    }

    // Layer-specific Z-offset
    if (layer.zOffset && layer.zOffset !== 0) {
      gcode.push(`G0 Z${layer.zOffset.toFixed(3)} ; layer Z-offset`);
    }

    // Process paths for this layer
    layerPaths.forEach((path, idx) => {
      if (path.points.length < 2) return;

      // Use layer settings for power and speed
      const layerSpeed = layer.speed || settings.feedRate;
      const layerPasses = layer.numPasses || 1;
      
      // Calculate power based on layer's min/max range
      // If path has intensity, use it to interpolate between min and max
      const pathIntensity = path.intensity ?? 100;
      const powerRange = layer.powerMax - layer.powerMin;
      const effectivePower = layer.powerMin + (pathIntensity / 100) * powerRange;
      
      // Convert percentage to S value
      const sValue = Math.round((effectivePower / 100) * 1000);

      gcode.push(`; Path ${idx} [${path.label || 'unnamed'}]`);

      for (let p = 0; p < layerPasses; p++) {
        if (layerPasses > 1) gcode.push(`; Pass ${p + 1}/${layerPasses}`);

        // Rapid to start
        gcode.push(`G0 X${mapX(path.points[0].x)} Y${mapY(path.points[0].y)} F${travelSpeed}`);

        // Active engagement with layer-specific laser mode or global
        const laserMode = path.laserMode || settings.laserMode;
        gcode.push(`${laserMode} S${sValue}`);

        // Move through path at layer speed
        path.points.slice(1).forEach(pt => {
          gcode.push(`G1 X${mapX(pt.x)} Y${mapY(pt.y)} F${layerSpeed}`);
        });

        gcode.push("M5 ; laser off");
      }
    });

    // Reset Z if offset was applied
    if (layer.zOffset && layer.zOffset !== 0) {
      gcode.push(`G0 Z0 ; reset Z-offset`);
    }

    // Layer-specific air assist off
    if (layer.airAssist) {
      gcode.push("M9 ; air assist off for this layer");
    }
  });

  // FOOTER
  gcode.push("");
  gcode.push(`; ========================================`);
  gcode.push(`; Job Complete`);
  gcode.push(`; ========================================`);
  // Return to home position (where $H was executed)
  const homeX = (homePosition?.x ?? 0).toFixed(3);
  const homeY = (homePosition?.y ?? 0).toFixed(3);
  gcode.push(`G0 X${homeX} Y${homeY} F${travelSpeed} ; return to homed position`);
  gcode.push("M2 ; end program");

  return gcode;
}

/**
 * Estimate time for a single layer
 */
export function estimateLayerTime(
  layer: Layer,
  paths: Path[],
  settings: EngraverSettings
): number {
  const layerPaths = paths.filter(p => p.layerId === layer.id);
  if (layerPaths.length === 0) return 0;

  const speed = layer.speed || settings.feedRate;
  const passes = layer.numPasses || 1;
  
  let totalDistance = 0;
  layerPaths.forEach(path => {
    for (let i = 1; i < path.points.length; i++) {
      const dx = path.points[i].x - path.points[i - 1].x;
      const dy = path.points[i].y - path.points[i - 1].y;
      totalDistance += Math.sqrt(dx * dx + dy * dy);
    }
  });

  // Convert distance from pixels to mm
  const scale = 25.4 / settings.ppi;
  const distanceMm = totalDistance * scale;

  // Time = distance / speed * passes
  const timeMinutes = (distanceMm / speed) * passes / 60;

  return timeMinutes;
}

/**
 * Get total job time estimate
 */
export function estimateTotalJobTime(
  layers: Layer[],
  paths: Path[],
  settings: EngraverSettings
): { total: number; byLayer: Map<string, number> } {
  const byLayer = new Map<string, number>();
  let total = 0;

  layers.forEach(layer => {
    if (layer.visible) {
      const layerTime = estimateLayerTime(layer, paths, settings);
      byLayer.set(layer.id, layerTime);
      total += layerTime;
    }
  });

  return { total, byLayer };
}
