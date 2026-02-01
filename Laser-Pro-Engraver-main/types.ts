export interface Point {
  x: number;
  y: number;
}

export interface Path {
  id: string;
  points: Point[];
  intensity?: number; 
  speed?: number;
  passes?: number;
  laserMode?: LaserMode;
  color?: string; // Multi-color encoding (Spec Page 11)
  angle?: number;     
  label?: string; 
  locked?: boolean;
  layerId?: string; // Reference to parent layer (Phase 2 of 10)
}

export type TextureMode = 'none' | 'hatch' | 'crosshatch' | 'noise' | 'sketchy' | 'organic' | 'halftone' | 'segmented';
export type LayerType = 'image' | 'text' | 'shape' | 'vector' | 'template';
export type LayerMode = 'line' | 'fill'; // LightBurn: Line (cut/vector) or Fill (scan/raster)
export type ShapeType = 'rect' | 'circle' | 'polygon';
export type ScanPattern = 'horizontal' | 'vertical' | 'diagonal' | 'crosshatch';
export type LaserSourceType = 'diode' | 'co2' | 'fiber';
export type BlendingMode = 'normal' | 'multiply' | 'screen' | 'overlay' | 'darken' | 'lighten' | 'difference';
export type TextFillStyle = 'outline' | 'hatch' | 'crosshatch' | 'dots' | 'lines' | 'patterns';
export type HalftoneShape = 'circle' | 'square' | 'diamond' | 'line' | 'cross';
export type ArtisticFilter = 'none' | 'oil-painting' | 'watercolor' | 'pencil' | 'charcoal' | 'engraving' | 'stippling';
export type DitherType = 'atkinson' | 'floyd-steinberg' | 'stucki' | 'jarvis-judice-ninke' | 'ordered-2x2' | 'ordered-4x4' | 'ordered-8x8';

export interface CurvePoint {
  x: number; // Input 0-255
  y: number; // Output 0-255
}

export interface Layer {
  id: string;
  type: LayerType;
  shapeType?: ShapeType;
  visible: boolean;
  locked: boolean;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  blendingMode: BlendingMode;
  imageData?: string;
  vectorData?: Point[][]; 
  text?: string;
  fontFamily?: string;
  fontSize?: number;
  letterSpacing?: number;
  lineHeight?: number;
  textFillStyle: TextFillStyle;
  isVariableText?: boolean;     // LightBurn: Text contains ${variables}
  variableTextState?: {          // LightBurn: Counter state for this text
    counter: number;
    counterStart: number;
    counterStep: number;
  };
  
  // LightBurn-Style Layer Settings (Phase 2 of 10)
  layerColor: string;        // Color identifier (e.g., #ff0000 for C00)
  layerNumber?: string;      // LightBurn format: C00, C01, etc.
  mode: LayerMode;           // 'line' for cut/vector, 'fill' for scan/raster
  speed?: number;            // mm/s - Layer-specific speed
  powerMin: number;          // Min power (0-100%) for variable power
  powerMax: number;          // Max power (0-100%)
  numPasses: number;         // Number of passes for this layer
  zOffset?: number;          // Z-axis offset for focus (mm)
  priority: number;          // Execution order (lower = first)
  
  // Advanced LightBurn Settings
  lineInterval?: number;     // For fill mode: spacing between scan lines (mm)
  scanAngle?: number;        // Fill scan angle in degrees
  overscan?: number;         // Overscan distance (mm)
  airAssist?: boolean;       // Air assist for this layer
  enablePerforations?: boolean; // Perforation mode
  tabCount?: number;         // Number of tabs for holding parts
  
  // Image Adjustment (Spec Page 8)
  brightness: number;
  contrast: number;
  gamma: number;
  exposure: number;
  saturation: number; 
  hue: number;
  posterization: number;
  blur: number;
  sharpen: number;
  edgeEnhancement: number;
  noiseReduction: number;
  invert: boolean;
  
  // Advanced Adjustment (Spec Page 8)
  levelsLow: number;
  levelsHigh: number;
  curves: CurvePoint[];
  
  // Processing
  useThreshold: boolean;
  thresholdValue: number;
  sketchMode: boolean; 
  sketchStrength: number;
  redWeight: number;
  greenWeight: number;
  blueWeight: number;
  
  // Artistic Filters
  artisticFilter: ArtisticFilter;
  artisticStrength: number;
  
  // Halftone Settings
  halftoneShape: HalftoneShape;
  halftoneCellSize: number;
  halftoneAngle: number;
  
  // Texture Logic
  textureMode: TextureMode;
  textureDensity: number;
  textureAngle: number;
  lowZoneMode: TextureMode;
  midZoneMode: TextureMode;
  highZoneMode: TextureMode;
  zoneThreshold1: number;
  zoneThreshold2: number;
  gridRows: number;
  gridCols: number;
  gridSpacingX: number;
  gridSpacingY: number;
  dotScale: number;
}

export interface CustomBounds {
  active: boolean;
  centerX: number;
  centerY: number;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export type ConversionMode = 'raster-dynamic' | 'vector' | 'dither' | 'tone-map' | 'calibration' | 'pierce-test';
export type DitherType = 'atkinson' | 'floyd-steinberg' | 'stucki' | 'jarvis-judice-ninke' | 'ordered-2x2' | 'ordered-4x4' | 'ordered-8x8';
export type LaserMode = 'M3' | 'M4';
export type TemplateShape = 'rect' | 'circle';
export type JobType = 'etch' | 'cut';
export type FreehandTrigger = 'left' | 'right' | 'space';

export interface EngraverSettings {
  machineModel: string;
  bedWidth: number;
  bedHeight: number;
  laserType: LaserSourceType;
  conversionMode: ConversionMode;
  ditherType: DitherType;
  laserMode: LaserMode;
  scanPattern: ScanPattern;
  linesPerMm: number;    
  feedRate: number;      
  laserPower: number;    
  travelSpeed: number;   
  ppi: number;           
  resolution: number;     
  invertY: boolean;       
  mirrorX: boolean; 
  threshold: number;
  contrast: number;
  testFirePower: number; 
  workAreaWidth: number;  
  workAreaHeight: number; 
  templateWidth: number;
  templateHeight: number;
  templateOffsetX: number;
  templateOffsetY: number;
  templateShape: TemplateShape;
  tonePoints: Point[];
  powerLut?: number[];
  jobType: JobType;
  passes: number;
  materialName: string;
  showPaths: boolean;
  minCalibrationPower: number; 
  powerGamma: number;
  scanAngle: number;
  overscan: number; 
  bidirectional: boolean;
  precisionMode: boolean;
  safetyOverride: boolean;
  disclaimerAccepted: boolean;
  termsAccepted: boolean;
  surfaceCoatedConfirmed?: boolean;
  cameraOverlayOpacity: number;
  airAssistAuto: boolean;
  rotaryMode: boolean;
  rotaryObjectDiameter: number; 
  rotaryRollerDiameter: number; 
  freehandMode: boolean;
  freehandTrigger: FreehandTrigger;
  freehandSpeed: number;
  freehandSmoothing: number;
  machinePosition: Point;
  homePosition: Point;  // Tracks where homing was performed (minimum boundary)
  isHomed: boolean;  // Tracks if machine has been homed
  joystickSensitivity: number;
  joystickInvertY: boolean;  // Allow user to invert joystick Y-axis
  ownedAirAssist: boolean;
  ownedCamera: boolean;
  ownedWacom: boolean;
  customBounds: CustomBounds;
  isCustomMachine?: boolean;
  startGCodeScript: string;
  endGCodeScript: string;
  enableCompletionSound: boolean;
  defaultFrameMargin: number;
  slicerProgress: number;
  preserveAspectRatio: boolean;  // Preserve image aspect ratio when importing
  setupComplete: boolean;  // Track if initial setup wizard was completed
  pathVisualization: PathVisualizationSettings;
  serialization?: SerializationSettings;
  tutorialEnabled: boolean;
  tutorialCompleted: boolean;
  customPresets?: MaterialPreset[];
}

export interface MaterialPreset {
  id: string;
  name: string;
  thickness?: number; // mm
  settings: Partial<EngraverSettings>;
  icon?: string;
  description?: string;
  minPower?: number;
  maxPower?: number;
  recommendedPasses?: number;
}

export interface PathVisualizationSettings {
  showHeatMap: boolean;
  colorScheme: 'power' | 'speed' | 'passes';
  showLegend: boolean;
}

export type SerializationType = 'barcode' | 'datamatrix' | 'qrcode' | 'text';
export type SerializationFormat = 'numeric' | 'alphanumeric' | 'custom';

export interface SerializationSettings {
  enabled: boolean;
  type: SerializationType;
  format: SerializationFormat;
  prefix: string;
  startNumber: number;
  currentNumber: number;
  increment: number;
  suffix: string;
  x: number;
  y: number;
  width: number;
  height: number;
  customPattern?: string;
}

export type PluginStatus = 'active' | 'deprecated' | 'eol';

export interface MachineProfile {
  id: string;
  brand: string;
  name: string;
  width: number;
  height: number;
  type: LaserSourceType;
  version: string;
  status: PluginStatus;
}

export interface ProductPlugin {
  id: string;
  name: string;
  brand: string;
  targetBrand: string; 
  desc: string;
  status: PluginStatus;
}

export const USER_AFFILIATE_ID = "laserpro-20";
