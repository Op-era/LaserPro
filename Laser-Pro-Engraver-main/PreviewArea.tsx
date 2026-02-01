import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Zap, Minus, ChevronUp, Activity, RotateCcw, RotateCw, Brush, MousePointer2, Target, Crosshair, Scissors, Move, Play, Pause, FastForward, Rewind, Trash2, Split, Merge, Wand2, Sparkles, Flame, Wind, Gauge } from 'lucide-react';
import { Layer, EngraverSettings, Path, Point } from './types';
import { 
  grayscale, applyFilters, applySaturation, thresholdFilter, applySketchMode, 
  applyTextureMapping, applyPosterization, applyHue, applyConvolution, 
  applyNoiseReduction, applyLevels, applyCurves, applyArtisticFilter,
  applyEnhancedHalftone, applyDithering, applyUnsharpMask
} from './utils/imageProcessor';
import { getPathColor, generateLegend, detectOverlappingPaths } from './utils/pathVisualization';

interface PreviewAreaProps {
  settings: EngraverSettings;
  setSettings: (s: EngraverSettings) => void;
  layers: Layer[];
  selectedLayerId: string | null;
  setSelectedLayerId: (id: string | null) => void;
  updateLayer: (id: string, updates: Partial<Layer>) => void;
  consoleLogs: string[];
  clearLogs: () => void;
  paths: Path[];
  setPaths: React.Dispatch<React.SetStateAction<Path[]>>;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  cameraActive: boolean;
  sendGCode: (cmd: string) => void;
  connected: boolean;
  triggerConnectPrompt: (action: string) => void;
  undoStroke: () => void;
  redoStroke: () => void;
}

export default function PreviewArea({ 
  settings, setSettings, layers, selectedLayerId, setSelectedLayerId, updateLayer, 
  consoleLogs, clearLogs, paths, setPaths, videoRef, cameraActive, sendGCode, connected, 
  triggerConnectPrompt, undoStroke, redoStroke 
}: PreviewAreaProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const layerCanvasCache = useRef<Map<string, { canvas: HTMLCanvasElement, hash: string }>>(new Map());
  const [isConsoleMinimized, setIsConsoleMinimized] = useState(false);
  const [currentPath, setCurrentPath] = useState<Point[] | null>(null);
  const [mousePos, setMousePos] = useState<Point | null>(null);
  const [editMode, setEditMode] = useState<'select' | 'node'>('select');
  const [selectedPathId, setSelectedPathId] = useState<string | null>(null);
  const [selectedNodeIndex, setSelectedNodeIndex] = useState<number | null>(null);
  const [showLegend, setShowLegend] = useState(true);
  const [overlappingPaths, setOverlappingPaths] = useState<Array<{ path1Id: string; path2Id: string; severity: 'low' | 'medium' | 'high' }>>([]);

  const SCALE = Math.min(800 / settings.bedWidth, 4.0);

  const renderLayerToCache = useCallback(async (layer: Layer) => {
    const hash = JSON.stringify({ 
      d: layer.imageData?.substring(0, 100), t: layer.text, s: layer.shapeType, 
      f: [layer.brightness, layer.contrast, layer.gamma, layer.exposure, layer.saturation, layer.hue, layer.posterization, layer.blur, layer.sharpen, layer.edgeEnhancement, layer.noiseReduction, layer.levelsLow, layer.levelsHigh, layer.curves, layer.invert, layer.sketchMode, layer.sketchStrength, layer.textureMode, layer.artisticFilter, layer.artisticStrength, layer.halftoneShape, layer.halftoneCellSize, layer.halftoneAngle],
      dim: [layer.width, layer.height]
    });
    
    if (layerCanvasCache.current.get(layer.id)?.hash === hash) return;

    const lCanvas = document.createElement('canvas');
    lCanvas.width = layer.width * SCALE;
    lCanvas.height = layer.height * SCALE;
    const lCtx = lCanvas.getContext('2d', { willReadFrequently: true })!;

    if ((layer.type === 'image' || layer.type === 'vector') && layer.imageData) {
      const img = new Image();
      img.src = layer.imageData;
      await new Promise(resolve => img.onload = resolve);
      lCtx.drawImage(img, 0, 0, lCanvas.width, lCanvas.height);
      const imgData = lCtx.getImageData(0, 0, lCanvas.width, lCanvas.height);
      
      // 1. Basic adjustments
      grayscale(imgData.data, layer.redWeight, layer.greenWeight, layer.blueWeight);
      applyFilters(imgData.data, layer.brightness, layer.contrast, layer.gamma, layer.exposure);
      applySaturation(imgData.data, layer.saturation);
      if (layer.hue !== 0) applyHue(imgData.data, layer.hue);
      if (layer.posterization > 0) applyPosterization(imgData.data, layer.posterization);
      if (layer.levelsLow > 0 || layer.levelsHigh < 255) applyLevels(imgData.data, layer.levelsLow, layer.levelsHigh);
      if (layer.curves.length > 1) applyCurves(imgData.data, layer.curves);
      
      // 2. Noise reduction (before sharpening)
      if (layer.noiseReduction > 0) applyNoiseReduction(imgData.data, lCanvas.width, lCanvas.height, layer.noiseReduction % 2 === 0 ? layer.noiseReduction + 1 : layer.noiseReduction);
      
      // 3. Blur, sharpen, edge enhancement
      if (layer.blur > 0) {
        for (let i = 0; i < layer.blur; i++) {
          applyConvolution(imgData.data, lCanvas.width, lCanvas.height, [1/9,1/9,1/9, 1/9,1/9,1/9, 1/9,1/9,1/9]);
        }
      }
      if (layer.sharpen > 0) {
        applyUnsharpMask(imgData.data, lCanvas.width, lCanvas.height, 1 + layer.sharpen * 0.3, 1, 0);
      }
      if (layer.edgeEnhancement > 0) applyConvolution(imgData.data, lCanvas.width, lCanvas.height, [-1, -1, -1, -1, 9, -1, -1, -1, -1]);
      
      // 4. Artistic filters (applied before patterns)
      if (layer.artisticFilter !== 'none') {
        applyArtisticFilter(imgData.data, lCanvas.width, lCanvas.height, layer.artisticFilter, layer.artisticStrength);
      }
      
      // 5. Invert if needed
      if (layer.invert) thresholdFilter(imgData.data, 255, true);
      
      // 6. Sketch mode
      if (layer.sketchMode) applySketchMode(imgData.data, lCanvas.width, lCanvas.height, layer.sketchStrength);
      
      // 7. Halftone with enhanced shapes
      if (layer.textureMode === 'halftone') {
        applyEnhancedHalftone(imgData.data, lCanvas.width, lCanvas.height, layer.halftoneCellSize, layer.halftoneAngle, layer.halftoneShape);
      } else if (layer.textureMode !== 'none') {
        // Other texture patterns
        applyTextureMapping(imgData.data, lCanvas.width, lCanvas.height, layer);
      }
      
      lCtx.putImageData(imgData, 0, 0);
    } else if (layer.type === 'text') {
      lCtx.fillStyle = 'white';
      lCtx.font = `bold ${layer.fontSize! * SCALE}px ${layer.fontFamily}`;
      lCtx.textAlign = 'center';
      lCtx.textBaseline = 'middle';
      lCtx.letterSpacing = `${(layer.letterSpacing || 0) * SCALE}px`;
      
      // Handle multi-line text
      const lines = (layer.text || '').split('\n');
      const lineHeightPx = layer.fontSize! * (layer.lineHeight || 1.2) * SCALE;
      const totalHeight = lines.length * lineHeightPx;
      const startY = (lCanvas.height - totalHeight) / 2 + lineHeightPx / 2;
      
      lines.forEach((line, i) => {
        // Apply text fill style
        if (layer.textFillStyle === 'outline') {
          lCtx.strokeStyle = 'white';
          lCtx.lineWidth = 2;
          lCtx.strokeText(line, lCanvas.width / 2, startY + i * lineHeightPx);
        } else {
          // For now, render filled for all other styles (hatch, crosshatch, etc. require post-processing)
          lCtx.fillText(line, lCanvas.width / 2, startY + i * lineHeightPx);
        }
      });
    } else if (layer.type === 'shape' || layer.type === 'template') {
      lCtx.strokeStyle = layer.type === 'template' ? '#f59e0b' : 'white';
      lCtx.lineWidth = 2 * SCALE;
      if (layer.type === 'template') lCtx.setLineDash([5, 5]);
      lCtx.beginPath();
      if (layer.shapeType === 'rect') lCtx.rect(2*SCALE, 2*SCALE, lCanvas.width-4*SCALE, lCanvas.height-4*SCALE);
      else if (layer.shapeType === 'circle') lCtx.arc(lCanvas.width/2, lCanvas.height/2, Math.min(lCanvas.width, lCanvas.height)/2 - 2*SCALE, 0, Math.PI*2);
      lCtx.stroke();
    }
    layerCanvasCache.current.set(layer.id, { canvas: lCanvas, hash });
  }, [SCALE]);

  useEffect(() => {
    layers.forEach(renderLayerToCache);
  }, [layers, renderLayerToCache]);

  useEffect(() => {
    const ctx = canvasRef.current!.getContext('2d')!;
    const w = settings.bedWidth * SCALE;
    const h = settings.bedHeight * SCALE;
    canvasRef.current!.width = w; canvasRef.current!.height = h;

    const templateLayers = layers.filter(l => l.type === 'template' && l.visible);

    const draw = () => {
      ctx.fillStyle = '#030508'; ctx.fillRect(0, 0, w, h);
      
      ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 0.5;
      const gridStep = settings.bedWidth > 200 ? 50 : 10;
      for (let i = 0; i <= settings.bedWidth; i += gridStep) { ctx.beginPath(); ctx.moveTo(i*SCALE, 0); ctx.lineTo(i*SCALE, h); ctx.stroke(); }
      for (let j = 0; j <= settings.bedHeight; j += gridStep) { ctx.beginPath(); ctx.moveTo(0, j*SCALE); ctx.lineTo(w, j*SCALE); ctx.stroke(); }
      
      if (templateLayers.length > 0) {
        ctx.save(); ctx.beginPath();
        templateLayers.forEach(tl => ctx.rect(tl.x * SCALE, tl.y * SCALE, tl.width * SCALE, tl.height * SCALE));
        ctx.clip();
      }

      layers.forEach(l => {
        if (!l.visible || l.type === 'template') return;
        const cache = layerCanvasCache.current.get(l.id);
        if (cache) {
          ctx.save();
          ctx.globalAlpha = l.opacity / 100;
          ctx.globalCompositeOperation = l.blendingMode === 'normal' ? 'source-over' : l.blendingMode as any;
          ctx.translate(l.x*SCALE, l.y*SCALE); ctx.rotate((l.rotation * Math.PI) / 180);
          ctx.drawImage(cache.canvas, 0, 0); ctx.restore();
        }
      });

      if (templateLayers.length > 0) ctx.restore();

      // Detect overlapping paths for warning
      if (paths.length > 1 && settings.pathVisualization.showHeatMap) {
        const overlaps = detectOverlappingPaths(paths);
        setOverlappingPaths(overlaps);
      }

      const pathLimit = Math.floor((settings.slicerProgress / 100) * paths.length);
      
      paths.forEach((p, idx) => {
        if (idx > pathLimit) return;
        const isSelected = selectedPathId === p.id;
        
        // CURA-style heat map visualization
        let pathColor: string;
        if (settings.pathVisualization.showHeatMap && !isSelected) {
          pathColor = getPathColor(p, settings.pathVisualization.colorScheme, {
            maxPower: 1000,
            maxSpeed: 6000
          });
        } else if (isSelected) {
          pathColor = 'rgba(59, 130, 246, 1.0)'; // Blue when selected
        } else {
          // Default visualization: Red for high power (firing), Yellow for medium (light), Green for low/travel
          const intensity = p.intensity || 50;
          const passes = p.passes || 1;
          
          if (intensity > 70) {
            // High power = Red (firing)
            pathColor = `rgba(239, 68, 68, ${Math.min(1.0, 0.7 + (intensity / 300) + (passes - 1) * 0.1)})`;
          } else if (intensity > 30) {
            // Medium power = Yellow/Orange (light)
            pathColor = `rgba(251, 191, 36, ${Math.min(1.0, 0.6 + (intensity / 200) + (passes - 1) * 0.1)})`;
          } else {
            // Low power/travel = Green
            pathColor = `rgba(16, 185, 129, ${Math.min(1.0, 0.5 + (intensity / 150) + (passes - 1) * 0.1)})`;
          }
        }
        
        ctx.strokeStyle = pathColor;
        ctx.lineWidth = isSelected ? 3 : 2;
        
        // Add glow for high-energy paths
        if (settings.pathVisualization.showHeatMap && !isSelected) {
          const passes = p.passes || 1;
          const power = p.intensity || 50;
          if (passes > 2 || power > 70) {
            ctx.shadowBlur = passes * 3 + power / 20;
            ctx.shadowColor = pathColor;
          } else {
            ctx.shadowBlur = 0;
          }
        } else {
          ctx.shadowBlur = 0;
        }

        ctx.beginPath();
        p.points.forEach((pt, i) => i === 0 ? ctx.moveTo(pt.x*SCALE, pt.y*SCALE) : ctx.lineTo(pt.x*SCALE, pt.y*SCALE));
        ctx.stroke();

        // Draw overlap warning
        const isOverlapping = overlappingPaths.some(o => o.path1Id === p.id || o.path2Id === p.id);
        if (isOverlapping && settings.pathVisualization.showHeatMap) {
          ctx.strokeStyle = 'rgba(255, 100, 100, 0.6)';
          ctx.lineWidth = 4;
          ctx.setLineDash([5, 5]);
          ctx.beginPath();
          p.points.forEach((pt, i) => i === 0 ? ctx.moveTo(pt.x*SCALE, pt.y*SCALE) : ctx.lineTo(pt.x*SCALE, pt.y*SCALE));
          ctx.stroke();
          ctx.setLineDash([]);
        }

        if (editMode === 'node' && isSelected) {
          p.points.forEach((pt, ni) => {
            ctx.fillStyle = selectedNodeIndex === ni ? '#f59e0b' : '#3b82f6';
            ctx.fillRect(pt.x*SCALE - 3, pt.y*SCALE - 3, 6, 6);
          });
        }
      });

      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(settings.machinePosition.x * SCALE, settings.machinePosition.y * SCALE, 3, 0, Math.PI * 2); ctx.stroke();
    };
    
    const anim = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(anim);
  }, [layers, paths, SCALE, settings, selectedPathId, selectedNodeIndex, editMode]);

  const handlePointerDown = (e: React.PointerEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = (e.clientX - rect.left) / SCALE;
    const y = (e.clientY - rect.top) / SCALE;

    if (editMode === 'node') {
      const foundPath = paths.find(p => p.points.some(pt => Math.abs(pt.x - x) < 5/SCALE && Math.abs(pt.y - y) < 5/SCALE));
      if (foundPath) {
        setSelectedPathId(foundPath.id);
        const nodeIdx = foundPath.points.findIndex(pt => Math.abs(pt.x - x) < 5/SCALE && Math.abs(pt.y - y) < 5/SCALE);
        setSelectedNodeIndex(nodeIdx);
        return;
      }
    }

    if (settings.freehandMode) {
      const id = Math.random().toString(36).substring(2, 11);
      setCurrentPath([{ x, y }]);
      setSelectedPathId(id);
    } else if (connected) {
      sendGCode(`G0 X${x.toFixed(2)} Y${y.toFixed(2)} F${settings.travelSpeed}`);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = (e.clientX - rect.left) / SCALE;
    const y = (e.clientY - rect.top) / SCALE;
    setMousePos({ x, y });

    if (editMode === 'node' && selectedPathId && selectedNodeIndex !== null) {
      setPaths(prev => prev.map(p => p.id === selectedPathId ? {
        ...p, points: p.points.map((pt, i) => i === selectedNodeIndex ? { x, y } : pt)
      } : p));
    } else if (currentPath) {
      setCurrentPath(prev => [...prev!, { x, y }]);
    }
  };

  const handlePointerUp = () => {
    if (currentPath && currentPath.length > 1) {
      const newPath: Path = { id: selectedPathId!, points: currentPath, intensity: 100 };
      setPaths(prev => [...prev, newPath]);
    }
    setCurrentPath(null);
    setSelectedNodeIndex(null);
  };

  const reversePath = () => {
    if (!selectedPathId) return;
    setPaths(prev => prev.map(p => p.id === selectedPathId ? { ...p, points: [...p.points].reverse() } : p));
  };

  const simplifyPath = () => {
    if (!selectedPathId) return;
    setPaths(prev => prev.map(p => {
      if (p.id !== selectedPathId) return p;
      const simplified = p.points.filter((pt, i, arr) => {
        if (i === 0 || i === arr.length - 1) return true;
        const prev = arr[i-1];
        const dist = Math.sqrt(Math.pow(pt.x - prev.x, 2) + Math.pow(pt.y - prev.y, 2));
        return dist > 0.5;
      });
      return { ...p, points: simplified };
    }));
  };

  /** Smooth Path Laplacian Algorithm (Spec Page 11) */
  const smoothPath = () => {
    if (!selectedPathId) return;
    setPaths(prev => prev.map(p => {
      if (p.id !== selectedPathId || p.points.length < 3) return p;
      const smoothed = [...p.points];
      // Simple 1D Laplacian smoothing
      for (let i = 1; i < p.points.length - 1; i++) {
        smoothed[i] = {
          x: (p.points[i-1].x + p.points[i+1].x) / 2,
          y: (p.points[i-1].y + p.points[i+1].y) / 2
        };
      }
      return { ...p, points: smoothed };
    }));
  };

  const deletePath = () => {
    if (!selectedPathId) return;
    setPaths(prev => prev.filter(p => p.id !== selectedPathId));
    setSelectedPathId(null);
  };

  return (
    <div className="flex-1 flex flex-col gap-2 min-w-0">
      <div className="flex bg-[#0a0f14] p-2 gap-2 border border-white/5 rounded-2xl shrink-0 items-center justify-between">
          <div className="flex gap-2">
            <button onClick={() => setEditMode('select')} className={`p-2 rounded-lg transition-all ${editMode === 'select' ? 'bg-emerald-500 text-black' : 'hover:bg-white/5 text-gray-500'}`} title="Select Tool"><MousePointer2 size={16}/></button>
            <button onClick={() => setEditMode('node')} className={`p-2 rounded-lg transition-all ${editMode === 'node' ? 'bg-emerald-500 text-black' : 'hover:bg-white/5 text-gray-500'}`} title="Node Editor"><Move size={16}/></button>
            {selectedPathId && (
              <>
                <div className="w-px h-6 bg-white/10 mx-1" />
                <button onClick={reversePath} className="p-2 hover:bg-white/5 text-gray-400 rounded-lg" title="Reverse Path"><RotateCcw size={16}/></button>
                <button onClick={smoothPath} className="p-2 hover:bg-white/5 text-emerald-500 rounded-lg" title="Smooth Path"><Sparkles size={16}/></button>
                <button onClick={simplifyPath} className="p-2 hover:bg-white/5 text-emerald-500 rounded-lg" title="Simplify Path"><Wand2 size={16}/></button>
                <button onClick={deletePath} className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg" title="Delete Path"><Trash2 size={16}/></button>
              </>
            )}
            <div className="w-px h-6 bg-white/10 mx-1" />
            <button 
              onClick={() => setSettings({ ...settings, pathVisualization: { ...settings.pathVisualization, showHeatMap: !settings.pathVisualization.showHeatMap } })}
              className={`p-2 rounded-lg transition-all ${settings.pathVisualization.showHeatMap ? 'bg-orange-500 text-black' : 'hover:bg-white/5 text-gray-500'}`} 
              title="Toggle Heat Map"
            >
              <Flame size={16}/>
            </button>
            {settings.pathVisualization.showHeatMap && (
              <>
                <button 
                  onClick={() => setSettings({ ...settings, pathVisualization: { ...settings.pathVisualization, colorScheme: 'power' } })}
                  className={`p-2 rounded-lg text-xs font-bold transition-all ${settings.pathVisualization.colorScheme === 'power' ? 'bg-red-500 text-white' : 'hover:bg-white/5 text-gray-500'}`}
                  title="Color by Power"
                >
                  PWR
                </button>
                <button 
                  onClick={() => setSettings({ ...settings, pathVisualization: { ...settings.pathVisualization, colorScheme: 'speed' } })}
                  className={`p-2 rounded-lg text-xs font-bold transition-all ${settings.pathVisualization.colorScheme === 'speed' ? 'bg-yellow-500 text-black' : 'hover:bg-white/5 text-gray-500'}`}
                  title="Color by Speed"
                >
                  SPD
                </button>
                <button 
                  onClick={() => setSettings({ ...settings, pathVisualization: { ...settings.pathVisualization, colorScheme: 'passes' } })}
                  className={`p-2 rounded-lg text-xs font-bold transition-all ${settings.pathVisualization.colorScheme === 'passes' ? 'bg-orange-500 text-black' : 'hover:bg-white/5 text-gray-500'}`}
                  title="Color by Passes"
                >
                  PASS
                </button>
                <button 
                  onClick={() => setShowLegend(!showLegend)}
                  className={`p-2 rounded-lg transition-all ${showLegend ? 'bg-blue-500 text-white' : 'hover:bg-white/5 text-gray-500'}`}
                  title="Toggle Legend"
                >
                  <Gauge size={16}/>
                </button>
              </>
            )}
          </div>

          <div className="flex items-center gap-3 bg-black/40 px-4 py-1 rounded-xl border border-white/5">
            <span className="text-[8px] font-black uppercase text-emerald-500">Path Slicer</span>
            <input 
              type="range" min="0" max="100" 
              value={settings.slicerProgress} 
              onChange={e => setSettings({ ...settings, slicerProgress: parseInt(e.target.value) })}
              className="w-48 h-1 accent-emerald-500 bg-white/10 rounded-full"
            />
            <span className="text-[8px] font-mono text-gray-500">{settings.slicerProgress}%</span>
          </div>
       </div>

      <div 
        className="flex-1 bg-[#030508] rounded-3xl overflow-hidden relative border border-white/5 flex items-center justify-center p-4 transition-all touch-none"
        onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp}
        onContextMenu={e => e.preventDefault()}
      >
        <canvas ref={canvasRef} className="max-w-full max-h-full shadow-2xl rounded-sm object-contain" />
        
        {/* Heat Map Legend */}
        {showLegend && settings.pathVisualization.showHeatMap && paths.length > 0 && (
          <div className="absolute top-4 right-4 bg-black/90 backdrop-blur-md border border-white/20 rounded-xl p-3 shadow-2xl">
            <div className="text-[8px] font-black uppercase text-gray-400 mb-2 flex items-center gap-2">
              <Flame size={12} className="text-orange-500" />
              Heat Map: {settings.pathVisualization.colorScheme}
            </div>
            <div className="space-y-1.5">
              {generateLegend(settings.pathVisualization.colorScheme).map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div 
                    className="w-8 h-2 rounded-full border border-white/20" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-[9px] text-gray-300 font-mono">{item.label}</span>
                  <span className="text-[8px] text-gray-500">{item.value}</span>
                </div>
              ))}
            </div>
            {overlappingPaths.length > 0 && (
              <div className="mt-3 pt-3 border-t border-white/20">
                <div className="text-[8px] font-black uppercase text-red-400 mb-1 flex items-center gap-1">
                  ⚠️ {overlappingPaths.length} Overlap{overlappingPaths.length > 1 ? 's' : ''}
                </div>
                <div className="text-[8px] text-gray-400">May burn through!</div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className={`transition-all duration-300 flex flex-col bg-[#0a0f14] rounded-2xl border border-white/5 overflow-hidden ${isConsoleMinimized ? 'h-10' : 'h-48'}`}>
         <div className="px-4 py-2 bg-white/5 border-b border-white/5 flex items-center justify-between text-[9px] font-black uppercase text-gray-500 h-10 shrink-0">
            <div className="flex items-center gap-2"><Activity size={14} className="text-emerald-500/50" /><span>Controller Stream</span></div>
            <button onClick={() => setIsConsoleMinimized(!isConsoleMinimized)} className="p-1 hover:text-emerald-500 transition-colors">
              {isConsoleMinimized ? <ChevronUp size={14}/> : <Minus size={14}/>}
            </button>
         </div>
         {!isConsoleMinimized && (
           <div className="flex-1 p-3 font-mono text-[10px] overflow-y-auto custom-scroll space-y-1 bg-black/20">
              {consoleLogs.map((log, i) => (
                <div key={i} className={`whitespace-pre-wrap ${log.includes('TX') ? 'text-emerald-400/80' : 'text-gray-500'}`}>{log}</div>
              ))}
           </div>
         )}
      </div>
    </div>
  );
}