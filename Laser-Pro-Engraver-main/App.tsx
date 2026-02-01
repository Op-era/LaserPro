import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Zap, HelpCircle, AlertCircle, X, ShieldAlert, Eye, Wind, Flame, Check, Save, FolderOpen, BookOpen, Settings as SettingsIcon } from 'lucide-react';
import { EngraverSettings, Layer, MaterialPreset, Path, Point, LayerType, SerializationSettings } from './types';
import Sidebar from './Sidebar';
import ProfessionalSidebar from './ProfessionalSidebar';
import ControlPanel from './ControlPanel';
import PreviewArea from './PreviewArea';
import HelpGuide from './HelpGuide';
import SetupWizard from './SetupWizard';
import SerializationPanel from './SerializationPanel';
import Tutorial from './Tutorial';
import Glossary from './Glossary';
import CustomPresetsManager from './CustomPresetsManager';
import TextEditor from './components/TextEditor';
import { generateGCode } from './utils/gcodeGenerator';
import { generateLayerAwareGCode, estimateTotalJobTime } from './utils/layerGCode';
import { traceEdges } from './utils/pathExtractor';
import { grayscale, applyFilters, applySaturation, thresholdFilter, applySketchMode, applyTextureMapping, applyPosterization, applyHue, applyConvolution, applyNoiseReduction, applyLevels, applyCurves } from './utils/imageProcessor';
import { TauriSerialController, SerialPortInfo } from './utils/serialTauri';
import { saveProject, loadProject, exportGCode } from './utils/fileIO';
import { 
  generateSerialNumber, 
  generateBarcodePaths, 
  generateDataMatrixPaths, 
  generateQRCodePaths, 
  generateTextPaths 
} from './utils/serialization';

const SPOT_SIZE = 0.06;
const ULTRA_DPI = Math.round(25.4 / SPOT_SIZE);

const INITIAL_SETTINGS: EngraverSettings = {
  machineModel: '', 
  bedWidth: 400, bedHeight: 400, laserType: 'diode',
  conversionMode: 'raster-dynamic', ditherType: 'atkinson', laserMode: 'M4', 
  scanPattern: 'horizontal', linesPerMm: 16.6, feedRate: 2500, laserPower: 1000, 
  travelSpeed: 4000, ppi: ULTRA_DPI, resolution: 5, invertY: false, mirrorX: false, 
  threshold: 128, contrast: 0, testFirePower: 15, workAreaWidth: 400, workAreaHeight: 400,
  templateWidth: 400, templateHeight: 400, templateOffsetX: 0, templateOffsetY: 0,
  templateShape: 'rect', tonePoints: [], jobType: 'etch', passes: 1, 
  materialName: 'Plywood', showPaths: true, minCalibrationPower: 15,
  powerGamma: 1.8, scanAngle: 0, overscan: 2.0, bidirectional: true,
  precisionMode: false, safetyOverride: false, disclaimerAccepted: false, 
  termsAccepted: false, cameraOverlayOpacity: 0.6, airAssistAuto: true,
  rotaryMode: false, rotaryObjectDiameter: 40, rotaryRollerDiameter: 20,
  freehandMode: false, freehandTrigger: 'right', freehandSpeed: 1500, 
  freehandSmoothing: 0.5, machinePosition: { x: 2, y: 2 }, homePosition: { x: 0, y: 0 }, isHomed: false, joystickSensitivity: 5, joystickInvertY: false,
  ownedAirAssist: true, ownedCamera: true, ownedWacom: true,
  customBounds: { active: false, centerX: 0, centerY: 0, minX: 0, maxX: 400, minY: 0, maxY: 400 },
  startGCodeScript: "G21\nG90\nM5",
  endGCodeScript: "M5\nG0 X0 Y0\nM2",
  enableCompletionSound: true,
  defaultFrameMargin: 2,
  slicerProgress: 100,
  preserveAspectRatio: true,
  setupComplete: false,
  pathVisualization: {
    showHeatMap: true,
    colorScheme: 'power',
    showLegend: true
  },
  serialization: {
    enabled: false,
    type: 'barcode',
    format: 'numeric',
    prefix: 'SN-',
    startNumber: 1,
    currentNumber: 1,
    increment: 1,
    suffix: '',
    x: 10,
    y: 10,
    width: 30,
    height: 10
  },
  tutorialEnabled: true,
  tutorialCompleted: false,
  customPresets: []
};

export default function App() {
  const [layers, setLayers] = useState<Layer[]>([]);
  const [paths, setPaths] = useState<Path[]>([]);
  const [redoStack, setRedoStack] = useState<Path[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [settings, setSettings] = useState<EngraverSettings>(INITIAL_SETTINGS);
  const [userPresets, setUserPresets] = useState<MaterialPreset[]>([]);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [showHelp, setShowHelp] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showGlossary, setShowGlossary] = useState(false);
  const [showPresetsManager, setShowPresetsManager] = useState(false);
  const [showTextEditor, setShowTextEditor] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [serialStatus, setSerialStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'lost'>('disconnected');
  const [customFonts, setCustomFonts] = useState<string[]>([]);
  const [showDeviceLostModal, setShowDeviceLostModal] = useState(false);
  const [availablePorts, setAvailablePorts] = useState<SerialPortInfo[]>([]);
  const [showPortSelector, setShowPortSelector] = useState(false);

  const portRef = useRef<TauriSerialController | null>(null);
  const writerRef = useRef<WritableStreamDefaultWriter | null>(null);
  const stopSignalRef = useRef<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const savedConfig = localStorage.getItem('laser-machine-config-v3');
    if (savedConfig) {
      const parsed = JSON.parse(savedConfig);
      setSettings(prev => ({ ...prev, ...parsed }));
      
      // Load custom presets if they exist
      if (parsed.customPresets) {
        setUserPresets(parsed.customPresets);
      }
      
      // Show tutorial on first launch if not completed
      if (parsed.tutorialEnabled && !parsed.tutorialCompleted && parsed.disclaimerAccepted) {
        setShowTutorial(true);
      }
    }
  }, []);

  const log = useCallback((msg: string, type: 'info' | 'error' | 'rx' | 'tx' = 'info') => {
    const timestamp = new Date().toLocaleTimeString([], { hour12: false });
    setConsoleLogs(prev => [...prev.slice(-49), `[${timestamp}] ${type.toUpperCase()}: ${msg}`]);
  }, []);

  // List available serial ports (Tauri)
  const listPorts = async () => {
    try {
      const ports = await TauriSerialController.listPorts();
      setAvailablePorts(ports);
      if (ports.length > 0) {
        setShowPortSelector(true);
      } else {
        log('No serial ports found', 'error');
      }
    } catch (err) {
      log(`Failed to list ports: ${err}`, 'error');
    }
  };

  // Connect to serial port (Tauri)
  const connectSerial = async (portName?: string) => {
    try {
      setSerialStatus('connecting');
      
      // If no port specified, list ports first
      if (!portName) {
        await listPorts();
        return;
      }

      const result = await TauriSerialController.connect(portName, 115200);
      setSerialStatus('connected');
      setShowDeviceLostModal(false);
      setShowPortSelector(false);
      log(result, 'info');
    } catch (err) {
      log(`Connection failed: ${err}`, 'error');
      setSerialStatus('disconnected');
    }
  };

  const disconnectSerial = async () => {
    try {
      await TauriSerialController.disconnect();
      setSerialStatus('disconnected');
      log('Disconnected from serial port', 'info');
    } catch (err) {
      log(`Disconnect failed: ${err}`, 'error');
    }
  };

  const handleDeviceLost = useCallback(() => {
    setSerialStatus('lost');
    setShowDeviceLostModal(true);
    log('Connection terminated.', 'error');
  }, [log]);

  const sendGCode = async (cmd: string) => {
    try {
      const isConnected = await TauriSerialController.isConnected();
      if (!isConnected) {
        log('Not connected to serial port', 'error');
        return;
      }
      
      log(cmd, 'tx');
      await TauriSerialController.sendGCode(cmd);
    } catch (err: unknown) {
      log(`Send failed: ${err}`, 'error');
      const errMsg = err instanceof Error ? err.message : String(err);
      if (errMsg.includes('not connected')) {
        handleDeviceLost();
      }
    }
  };

  const updateSettings = (updates: Partial<EngraverSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    localStorage.setItem('laser-machine-config-v3', JSON.stringify(newSettings));
  };

  // Custom preset handlers
  const handleSavePreset = (preset: MaterialPreset) => {
    const updatedPresets = [...userPresets, preset];
    setUserPresets(updatedPresets);
    updateSettings({ customPresets: updatedPresets });
    log(`Preset "${preset.name}" saved successfully`, 'info');
  };

  const handleLoadPreset = (preset: MaterialPreset) => {
    if (preset.settings) {
      updateSettings(preset.settings);
      log(`Preset "${preset.name}" loaded successfully`, 'info');
    }
  };

  const handleDeletePreset = (id: string) => {
    const updatedPresets = userPresets.filter(p => p.id !== id);
    setUserPresets(updatedPresets);
    updateSettings({ customPresets: updatedPresets });
    log('Preset deleted successfully', 'info');
  };

  const handleTutorialComplete = () => {
    updateSettings({ tutorialCompleted: true });
  };

  const handleTutorialSkip = () => {
    updateSettings({ tutorialCompleted: true, tutorialEnabled: false });
  };

  // File I/O handlers (Tauri)
  const handleSaveProject = async () => {
    try {
      const success = await saveProject(settings, layers, paths);
      if (success) {
        log('Project saved successfully', 'info');
      } else {
        log('Save cancelled', 'info');
      }
    } catch (err) {
      log(`Save failed: ${err}`, 'error');
    }
  };

  const handleLoadProject = async () => {
    try {
      const project = await loadProject();
      if (project) {
        setSettings(project.settings);
        setLayers(project.layers);
        setPaths(project.paths);
        log(`Project loaded (version ${project.version})`, 'info');
      } else {
        log('Load cancelled', 'info');
      }
    } catch (err) {
      log(`Load failed: ${err}`, 'error');
    }
  };

  const handleExportGCode = async () => {
    try {
      const gcode = generateGCode(paths, settings);
      const gcodeText = [
        ...settings.startGCodeScript.split('\n'),
        ...gcode,
        'M5',
        ...settings.endGCodeScript.split('\n')
      ].join('\n');
      
      const success = await exportGCode(gcodeText);
      if (success) {
        log('G-code exported successfully', 'info');
      } else {
        log('Export cancelled', 'info');
      }
    } catch (err) {
      log(`Export failed: ${err}`, 'error');
    }
  };

  const startJob = async () => {
    if (serialStatus !== 'connected') { alert("Please connect your laser hardware."); return; }
    stopSignalRef.current = false;
    
    // Use layer-aware G-code generation if layers have paths
    const hasLayerPaths = paths.some(p => p.layerId);
    const gcode = hasLayerPaths 
      ? generateLayerAwareGCode(paths, layers, settings)
      : generateGCode(paths, settings);
    
    log(`Starting job with ${gcode.length} G-code lines`, 'info');
    
    for (const line of settings.startGCodeScript.split('\n')) await sendGCode(line);
    for (let i = 0; i < gcode.length; i++) {
      if (stopSignalRef.current) break;
      await sendGCode(gcode[i]);
      setProgress(Math.round((i / gcode.length) * 100));
    }
    await sendGCode("M5");
    for (const line of settings.endGCodeScript.split('\n')) await sendGCode(line);
    setProgress(0);
    
    log('Job completed successfully', 'info');
  };

  const generateSerializationJob = async () => {
    if (!settings.serialization || !settings.serialization.enabled) {
      log('Serialization is not enabled', 'error');
      return;
    }
    
    const serial = settings.serialization;
    const serialNumber = generateSerialNumber(serial);
    
    log(`Generating serialization: ${serialNumber}`, 'info');
    
    // Generate paths based on serialization type
    let newPaths: Path[] = [];
    
    switch (serial.type) {
      case 'barcode':
        newPaths = generateBarcodePaths(serialNumber, serial.x, serial.y, serial.width, serial.height);
        break;
      case 'datamatrix':
        newPaths = generateDataMatrixPaths(serialNumber, serial.x, serial.y, Math.min(serial.width, serial.height));
        break;
      case 'qrcode':
        newPaths = generateQRCodePaths(serialNumber, serial.x, serial.y, Math.min(serial.width, serial.height));
        break;
      case 'text':
        newPaths = generateTextPaths(serialNumber, serial.x, serial.y, serial.height);
        break;
    }
    
    // Add the new paths to existing paths
    setPaths(prevPaths => [...prevPaths, ...newPaths]);
    
    log(`Generated ${newPaths.length} paths for ${serial.type}`, 'info');
    
    // Generate G-code and execute
    const gcode = generateGCode(newPaths, settings);
    
    if (serialStatus === 'connected') {
      stopSignalRef.current = false;
      for (const line of settings.startGCodeScript.split('\n')) await sendGCode(line);
      for (let i = 0; i < gcode.length; i++) {
        if (stopSignalRef.current) break;
        await sendGCode(gcode[i]);
        setProgress(Math.round((i / gcode.length) * 100));
      }
      await sendGCode("M5");
      for (const line of settings.endGCodeScript.split('\n')) await sendGCode(line);
      setProgress(0);
      
      // Auto-increment the serial number after successful engraving
      updateSettings({ 
        serialization: { 
          ...serial, 
          currentNumber: serial.currentNumber + serial.increment 
        } 
      });
      
      log(`Serialization complete. Next number: ${serial.currentNumber + serial.increment}`, 'info');
    } else {
      log('Not connected to laser. Paths generated but not engraved.', 'info');
    }
  };

  const addLayer = (type: LayerType, data?: any) => {
    const id = Math.random().toString(36).substring(2, 11);
    const layerIndex = layers.length;
    const layerColor = getLightBurnColor(layerIndex);
    const layerNumber = `C${layerIndex.toString().padStart(2, '0')}`;
    
    // Handle data parameter: can be string (imageData) or object with properties
    let imageData: string | undefined;
    let layerWidth = 80;
    let layerHeight = 50;
    
    if (typeof data === 'string') {
      imageData = data;
    } else if (typeof data === 'object' && data !== null) {
      imageData = data.imageData;
      if (data.width !== undefined) layerWidth = data.width;
      if (data.height !== undefined) layerHeight = data.height;
    }
    
    const newLayer: Layer = {
      id, type, visible: true, locked: false,
      name: `${layerNumber} ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      x: 10, y: 10, width: layerWidth, height: layerHeight, rotation: 0, 
      opacity: 100, blendingMode: 'normal',
      imageData: imageData, text: type === 'text' ? 'LASERPRO' : undefined,
      shapeType: 'rect', fontFamily: 'Impact', fontSize: 32, letterSpacing: 0, lineHeight: 1.2, textFillStyle: 'outline',
      isVariableText: false,
      variableTextState: {
        counter: 1,
        counterStart: 1,
        counterStep: 1
      },
      
      // LightBurn-style layer settings (Phase 2 of 10)
      layerColor: layerColor,
      layerNumber: layerNumber,
      mode: type === 'vector' ? 'line' : 'fill', // Line for vectors, Fill for images/text
      powerMin: 80,              // Default 80% min power
      powerMax: 100,             // Default 100% max power
      numPasses: 1,              // Single pass by default
      priority: layerIndex,      // Execution order matches layer order
      lineInterval: 0.1,         // 0.1mm line spacing for fill mode
      scanAngle: 0,              // Horizontal scan
      overscan: 2.0,             // 2mm overscan
      airAssist: true,           // Air assist on by default
      
      brightness: 0, contrast: 0, gamma: 1.0, exposure: 0, saturation: 0, hue: 0, posterization: 0, blur: 0, sharpen: 0, edgeEnhancement: 0, noiseReduction: 0, invert: false,
      levelsLow: 0, levelsHigh: 255, curves: [{x:0,y:0}, {x:255,y:255}],
      useThreshold: false, thresholdValue: 128, sketchMode: false, sketchStrength: 30,
      redWeight: 0.299, greenWeight: 0.587, blueWeight: 0.114,
      artisticFilter: 'none', artisticStrength: 1.0,
      halftoneShape: 'circle', halftoneCellSize: 8, halftoneAngle: 45,
      textureMode: 'none', textureDensity: 1.0, textureAngle: 45,
      lowZoneMode: 'hatch', midZoneMode: 'crosshatch', highZoneMode: 'halftone',
      zoneThreshold1: 85, zoneThreshold2: 170, gridRows: 1, gridCols: 1, gridSpacingX: 10, gridSpacingY: 10, dotScale: 1.0
    };
    setLayers([...layers, newLayer]);
    setSelectedLayerId(id);
    
    // Auto-open text editor for new text layers
    if (type === 'text') {
      setTimeout(() => setShowTextEditor(true), 100);
    }
  };

  // LightBurn-style color palette for layers (C00-C63)
  const getLightBurnColor = (index: number): string => {
    const colors = [
      '#000000', '#ff0000', '#00ff00', '#0000ff', // C00-C03: Black, Red, Green, Blue
      '#ffff00', '#ff00ff', '#00ffff', '#ffffff', // C04-C07: Yellow, Magenta, Cyan, White
      '#800000', '#008000', '#000080', '#808000', // C08-C11: Dark colors
      '#800080', '#008080', '#808080', '#c00000', // C12-C15
      '#00c000', '#0000c0', '#c0c000', '#c000c0', // C16-C19
      '#00c0c0', '#c0c0c0', '#400000', '#004000', // C20-C23
      '#000040', '#404000', '#400040', '#004040', // C24-C27
      '#404040', '#200000', '#002000', '#000020', // C28-C31
      // Continue pattern for C32-C63
      '#ff8080', '#80ff80', '#8080ff', '#ffff80', // C32-C35
      '#ff80ff', '#80ffff', '#ff0080', '#80ff00', // C36-C39
      '#0080ff', '#ff8000', '#00ff80', '#8000ff', // C40-C43
      '#ff4040', '#40ff40', '#4040ff', '#ffff40', // C44-C47
      '#ff40ff', '#40ffff', '#ff4000', '#40ff00', // C48-C51
      '#0040ff', '#ff0040', '#00ff40', '#4000ff', // C52-C55
      '#c04000', '#40c000', '#0040c0', '#c0c040', // C56-C59
      '#c040c0', '#40c0c0', '#606060', '#a0a0a0'  // C60-C63
    ];
    return colors[index % colors.length];
  };

  /**
   * Generates Laser Paths from an Image or Text Layer by processing filters
   * and running the pixel tracing engine.
   */
  const vectorizeLayer = async (layerId: string, options?: { intensity?: number, speed?: number, passes?: number }) => {
    const layer = layers.find(l => l.id === layerId);
    if (!layer) return;

    log(`Initializing Vector Slicing [${options?.intensity || 100}% Power]...`, 'info');
    
    // Clear existing paths if we are doing a fresh material-based generation
    if (options) setPaths([]);

    // Process raster data using a temporary canvas to get current filtered result
    const tempCanvas = document.createElement('canvas');
    const scale = 2.0; // Higher resolution for tracing
    tempCanvas.width = layer.width * scale;
    tempCanvas.height = layer.height * scale;
    const ctx = tempCanvas.getContext('2d')!;

    // Handle text layers by rendering them first
    if (layer.type === 'text') {
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
      ctx.fillStyle = 'white';
      ctx.strokeStyle = 'white';
      ctx.font = `${layer.fontSize! * scale}px ${layer.fontFamily}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.letterSpacing = `${(layer.letterSpacing || 0) * scale}px`;
      
      // Handle multi-line text
      const lines = (layer.text || '').split('\n');
      const lineHeightPx = layer.fontSize! * (layer.lineHeight || 1.2) * scale;
      const totalHeight = lines.length * lineHeightPx;
      const startY = (tempCanvas.height - totalHeight) / 2 + lineHeightPx / 2;
      
      lines.forEach((line, i) => {
        const y = startY + i * lineHeightPx;
        // Apply text fill style
        if (layer.textFillStyle === 'outline') {
          ctx.lineWidth = 3;
          ctx.strokeText(line, tempCanvas.width / 2, y);
        } else {
          // For vectorization, render filled (edge tracing will extract outlines)
          ctx.fillText(line, tempCanvas.width / 2, y);
        }
      });
    } else if (layer.imageData) {
      // Handle image layers
      const img = new Image();
      img.src = layer.imageData;
      await new Promise(r => img.onload = r);
      ctx.drawImage(img, 0, 0, tempCanvas.width, tempCanvas.height);
    } else {
      log('Layer has no processable content', 'error');
      return;
    }
    
    const imgData = ctx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    grayscale(imgData.data, layer.redWeight, layer.greenWeight, layer.blueWeight);
    applyFilters(imgData.data, layer.brightness, layer.contrast, layer.gamma, layer.exposure);
    
    if (layer.sketchMode) {
      applySketchMode(imgData.data, tempCanvas.width, tempCanvas.height, layer.sketchStrength);
    } else {
      thresholdFilter(imgData.data, layer.thresholdValue, layer.invert);
    }
    
    // Now run edge tracing
    const rawPaths = traceEdges(imgData, scale);
    const offsetPaths = rawPaths.map(pts => pts.map(p => ({ x: p.x + layer.x, y: p.y + layer.y })));
    
    const newPaths: Path[] = offsetPaths.map(pts => ({
      id: Math.random().toString(36).substring(2, 11),
      points: pts,
      intensity: options?.intensity !== undefined ? options.intensity : 100,
      speed: options?.speed,
      passes: options?.passes || 1
    }));

    setPaths(prev => options ? newPaths : [...prev, ...newPaths]);
    log(`Generated ${newPaths.length} path segments for ${layer.name}.`, 'info');
  };

  const undoStroke = () => {
    if (paths.length > 0) {
      const last = paths[paths.length - 1];
      setRedoStack(p => [...p, last]);
      setPaths(p => p.slice(0, -1));
    }
  };

  const redoStroke = () => {
    if (redoStack.length > 0) {
      const last = redoStack[redoStack.length - 1];
      setPaths(p => [...p, last]);
      setRedoStack(p => p.slice(0, -1));
    }
  };

  if (!settings.machineModel || !settings.disclaimerAccepted || !settings.termsAccepted) {
    return <SetupWizard onComplete={(updates) => updateSettings({...updates, disclaimerAccepted: true, termsAccepted: true})} />;
  }

  return (
    <div className="h-screen flex flex-col bg-[#05070a] text-gray-100 overflow-hidden font-sans">
      {/* Port Selector Modal */}
      {showPortSelector && (
        <div className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-[#0d1218] border border-emerald-500/20 rounded-[40px] p-10 max-w-md w-full space-y-6 shadow-2xl">
            <h2 className="text-2xl font-black uppercase italic tracking-tighter text-center">Select Serial Port</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {availablePorts.length > 0 ? (
                availablePorts.map((port) => (
                  <button
                    key={port.port_name}
                    onClick={() => connectSerial(port.port_name)}
                    className="w-full p-4 bg-white/5 hover:bg-emerald-500/10 border border-white/10 hover:border-emerald-500/30 rounded-2xl text-left transition-all group"
                  >
                    <div className="font-bold text-sm">{port.port_name}</div>
                    <div className="text-xs text-gray-500 uppercase">{port.port_type}</div>
                  </button>
                ))
              ) : (
                <p className="text-center text-gray-500 py-8">No serial ports found</p>
              )}
            </div>
            <button
              onClick={() => setShowPortSelector(false)}
              className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-2xl font-black uppercase text-xs tracking-widest transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {showDeviceLostModal && (
        <div className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
           <div className="bg-[#0d1218] border border-red-500/20 rounded-[40px] p-10 max-w-md w-full text-center space-y-6 shadow-2xl">
              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/30"><AlertCircle className="text-red-500" size={40} /></div>
              <h2 className="text-2xl font-black uppercase italic tracking-tighter">Connection Lost</h2>
              <p className="text-gray-400 text-sm leading-relaxed uppercase font-bold">The laser has been disconnected.</p>
              <button onClick={() => connectSerial()} className="w-full py-4 bg-emerald-500 text-black rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all">Reconnect Device</button>
           </div>
        </div>
      )}

      <header className="h-16 border-b border-white/5 bg-[#0a0f14] flex items-center justify-between px-8 z-20 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-emerald-500 rounded-xl"><Zap className="text-black" size={18} fill="currentColor" /></div>
          <div className="flex flex-col">
            <span className="font-black italic text-xl uppercase tracking-tighter leading-none">LASERPRO <span className="text-emerald-500">TRACER</span></span>
            <span className="text-[8px] text-gray-500 font-black uppercase tracking-[0.2em]">{settings.machineModel}</span>
          </div>
        </div>
        <div className="flex gap-4 items-center">
           <button onClick={handleSaveProject} className="flex items-center gap-2 p-2 px-4 hover:bg-white/5 rounded-xl text-gray-400 hover:text-white transition-all group" title="Save Project">
             <Save size={18} className="group-hover:text-emerald-500 transition-colors" />
             <span className="text-[9px] font-black uppercase tracking-widest">Save</span>
           </button>
           <button onClick={handleLoadProject} className="flex items-center gap-2 p-2 px-4 hover:bg-white/5 rounded-xl text-gray-400 hover:text-white transition-all group" title="Load Project">
             <FolderOpen size={18} className="group-hover:text-emerald-500 transition-colors" />
             <span className="text-[9px] font-black uppercase tracking-widest">Load</span>
           </button>
           <button onClick={() => setShowPresetsManager(true)} className="flex items-center gap-2 p-2 px-4 hover:bg-white/5 rounded-xl text-gray-400 hover:text-white transition-all group" title="Custom Presets">
             <SettingsIcon size={18} className="group-hover:text-emerald-500 transition-colors" />
             <span className="text-[9px] font-black uppercase tracking-widest">Presets</span>
           </button>
           <button onClick={() => setShowGlossary(true)} className="flex items-center gap-2 p-2 px-4 hover:bg-white/5 rounded-xl text-gray-400 hover:text-white transition-all group" title="Glossary">
             <BookOpen size={18} className="group-hover:text-emerald-500 transition-colors" />
             <span className="text-[9px] font-black uppercase tracking-widest">Glossary</span>
           </button>
           <button onClick={() => setShowHelp(true)} className="flex items-center gap-2 p-2 px-4 hover:bg-white/5 rounded-xl text-gray-400 hover:text-white transition-all group">
             <span className="text-[9px] font-black uppercase tracking-widest">Help</span>
             <HelpCircle size={18} className="group-hover:text-emerald-500 transition-colors" />
           </button>
           {serialStatus === 'connected' ? (
             <button onClick={disconnectSerial} className="px-8 py-3 rounded-2xl text-[11px] font-black uppercase transition-all flex items-center gap-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20">
               <Zap size={14} fill="currentColor"/>
               ONLINE
             </button>
           ) : (
             <button onClick={() => connectSerial()} className="px-8 py-3 rounded-2xl text-[11px] font-black uppercase transition-all flex items-center gap-3 bg-emerald-500 text-black hover:bg-emerald-400 shadow-lg shadow-emerald-500/20">
               <Zap size={14}/>
               CONNECT
             </button>
           )}
        </div>
      </header>
      <main className="flex-1 flex overflow-hidden gap-0">
        <ProfessionalSidebar
          layers={layers}
          setLayers={setLayers}
          selectedLayerId={selectedLayerId}
          setSelectedLayerId={setSelectedLayerId}
          addLayer={addLayer}
          onStartJob={startJob}
          onStopJob={() => { stopSignalRef.current = true; }}
          isEngraving={serialStatus === 'connected' && progress > 0}
          progress={progress}
          connected={serialStatus === 'connected'}
          settings={settings}
          setSettings={updateSettings}
          paths={paths}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <PreviewArea 
            settings={settings} setSettings={updateSettings} layers={layers} 
            selectedLayerId={selectedLayerId} setSelectedLayerId={setSelectedLayerId} 
            updateLayer={(id, u) => setLayers(layers.map(l => l.id === id ? {...l, ...u} : l))} 
            consoleLogs={consoleLogs} clearLogs={() => setConsoleLogs([])} 
            paths={paths} setPaths={setPaths}
            videoRef={videoRef} cameraActive={cameraActive}
            sendGCode={sendGCode} connected={serialStatus === 'connected'} triggerConnectPrompt={() => {}}
            undoStroke={undoStroke} redoStroke={redoStroke}
          />
          {settings.serialization && (
            <div className="p-3 border-t border-white/10 bg-[#0d1218]">
              <SerializationPanel
                settings={settings.serialization}
                onUpdate={(updates) => updateSettings({ serialization: { ...settings.serialization!, ...updates } })}
                onGenerate={generateSerializationJob}
                isConnected={serialStatus === 'connected'}
              />
            </div>
          )}
        </div>
        <ControlPanel settings={settings} setSettings={updateSettings} sendGCode={sendGCode} pulseLaser={() => {}} connected={serialStatus === 'connected'} videoRef={videoRef} cameraActive={cameraActive} setCameraActive={setCameraActive} triggerConnectPrompt={() => {}} />
      </main>
      <HelpGuide isOpen={showHelp} onClose={() => setShowHelp(false)} />
      <Tutorial 
        isOpen={showTutorial} 
        onClose={() => setShowTutorial(false)} 
        onComplete={handleTutorialComplete}
        onSkip={handleTutorialSkip}
      />
      <Glossary isOpen={showGlossary} onClose={() => setShowGlossary(false)} />
      <CustomPresetsManager
        isOpen={showPresetsManager}
        onClose={() => setShowPresetsManager(false)}
        presets={userPresets}
        onSavePreset={handleSavePreset}
        onLoadPreset={handleLoadPreset}
        onDeletePreset={handleDeletePreset}
        currentSettings={settings}
      />
      {showTextEditor && selectedLayerId && layers.find(l => l.id === selectedLayerId && l.type === 'text') && (
        <TextEditor
          layer={layers.find(l => l.id === selectedLayerId)!}
          onUpdate={(updates) => setLayers(layers.map(l => l.id === selectedLayerId ? {...l, ...updates} : l))}
          onClose={() => setShowTextEditor(false)}
        />
      )}
    </div>
  );
}