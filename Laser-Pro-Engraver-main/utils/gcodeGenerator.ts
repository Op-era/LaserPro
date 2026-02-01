import { Path, EngraverSettings } from '../types';

/**
 * Technical G-Code Engine for LaserTrace Pro
 * Optimized for ACMER S1 and general GRBL hardware.
 */
export function generateGCode(
  paths: Path[], 
  settings: EngraverSettings
): string[] {
  const gcode: string[] = [];
  const { 
    feedRate, laserPower, travelSpeed, ppi, 
    invertY, mirrorX, workAreaHeight, workAreaWidth, 
    templateOffsetX, templateOffsetY, 
    laserMode, powerGamma, powerLut,
    minCalibrationPower, airAssistAuto, homePosition, bedWidth, bedHeight
  } = settings;
  
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

  const getMappedPower = (intensityPercent: number): number => {
    if (powerLut && powerLut.length === 256) {
      return powerLut[Math.floor((intensityPercent / 100) * 255)];
    }
    const normalizedIntensity = (intensityPercent / 100);
    const correctedIntensity = Math.pow(normalizedIntensity, powerGamma);
    const sMin = (minCalibrationPower / 100) * laserPower;
    const sMax = laserPower;
    if (intensityPercent < 0.5) return 0;
    return Math.round(sMin + (correctedIntensity * (sMax - sMin)));
  };

  // HEADER (Spec Page 14)
  gcode.push("; LASERTRACE PRO GENERATED TOOLPATH");
  gcode.push("; COMPLIANCE: CANONICAL SPEC V2");
  gcode.push("G21 ; units in mm");
  gcode.push("G90 ; absolute coordinates");
  gcode.push("$32=1 ; ensure laser mode");
  gcode.push("M5 ; laser off");
  
  if (airAssistAuto) gcode.push("M8 ; air assist on");

  // PATH PROCESSING (Spec Page 15)
  paths.forEach((path, idx) => {
    if (path.points.length < 2) return;
    
    // Use path-specific parameters if available (from material selection), else global
    const intensity = path.intensity ?? 100;
    const speed = path.speed ?? feedRate;
    const passes = path.passes ?? 1;
    const power = getMappedPower(intensity);

    gcode.push(`; --- Segment ${idx} [Passes: ${passes}, Power: S${power}, Speed: F${speed}] ---`);

    for (let p = 0; p < passes; p++) {
      if (passes > 1) gcode.push(`; Pass ${p + 1}`);
      
      // Rapid to start
      gcode.push(`G0 X${mapX(path.points[0].x)} Y${mapY(path.points[0].y)} F${travelSpeed}`);
      
      // Active engagement
      gcode.push(`${laserMode} S${power}`);
      
      path.points.slice(1).forEach(pt => {
        gcode.push(`G1 X${mapX(pt.x)} Y${mapY(pt.y)} F${speed}`);
      });
      
      gcode.push("M5"); // Inter-pass safety
    }
  });

  // FOOTER (Spec Page 16)
  if (airAssistAuto) gcode.push("M9 ; air assist off");
  // Return to home position (where $H was executed)
  const homeX = (homePosition?.x ?? 0).toFixed(3);
  const homeY = (homePosition?.y ?? 0).toFixed(3);
  gcode.push(`G0 X${homeX} Y${homeY} F${travelSpeed} ; return to homed position`);
  gcode.push("M2 ; end program");
  
  return gcode;
}