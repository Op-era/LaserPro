import React, { useState, useMemo } from 'react';
import { 
  Type, Trash2, Layers, Sun, Bookmark, Settings, Cpu, Square, Circle, Triangle, RotateCcw, RotateCw, Brush, Activity, Wand2, FileCode, Zap, Wind, FlipHorizontal, MoveVertical, Volume2, VolumeX, Terminal, Mountain, BoxSelect, Sliders, Contrast, Target, AlertCircle, Maximize2, ShieldCheck, Palette, Scissors, SlidersHorizontal
} from 'lucide-react';
import { EngraverSettings, Layer, MaterialPreset, LaserSourceType, BlendingMode, TextFillStyle } from './types';
import { registry } from './utils/registry';
import { dxfToDataUrl } from './utils/vectorProcessor';

interface SidebarProps {
  settings: EngraverSettings;
  setSettings: (s: Partial<EngraverSettings>) => void;
  layers: Layer[];
  setLayers: (l: Layer[]) => void;
  selectedLayerId: string | null;
  setSelectedLayerId: (id: string | null) => void;
  addLayer: (type: LayerType, data?: Partial<Layer>) => void;
  vectorizeLayer: (id: string, options?: { intensity?: number, speed?: number, passes?: number }) => Promise<void>;
  customFonts: string[];
  setCustomFonts: React.Dispatch<React.SetStateAction<string[]>>;
  startJob: () => void;
  frameObject: () => void;
  stopJob: () => void;
  onShowPrepGuide: () => void;
  isEngraving: boolean;
  progress: number;
  connected: boolean;
  triggerConnectPrompt: (action: string) => void;
  userPresets: MaterialPreset[];
  onSavePreset: () => void;
  undoStroke: () => void;
  redoStroke: () => void;
}

const PREDEFINED_PRESETS = (source: LaserSourceType): MaterialPreset[] => {
  const isDiode = source === 'diode';
  return [
    { id: 'wood-etch', name: 'Plywood (Etch)', settings: { feedRate: isDiode ? 3000 : 6000, laserPower: isDiode ? 800 : 200, linesPerMm: 10, passes: 1 } },
    { id: 'stone-etch', name: 'Stone / Slate (Etch)', settings: { feedRate: isDiode ? 2500 : 5000, laserPower: isDiode ? 950 : 300, linesPerMm: 12, contrast: 30, passes: 1 } },
    { id: 'metal-mark', name: 'Metal Marking (Coated)', settings: { feedRate: 800, laserPower: 1000, linesPerMm: 18, passes: 2 } },
    { id: 'leather-cut', name: 'Leather (Cut)', settings: { feedRate: 150, laserPower: 1000, linesPerMm: 5, passes: 2 } },
    { id: 'acrylic-etch', name: 'Acrylic (Etch)', settings: { feedRate: 4000, laserPower: 600, linesPerMm: 12, passes: 1 } }
  ];
};

export default function Sidebar({ 
  settings, setSettings, layers, setLayers, selectedLayerId, setSelectedLayerId, addLayer, vectorizeLayer,
  startJob, progress, connected
}: SidebarProps) {
  const [activeTab, setActiveTab] = useState<'layers' | 'design' | 'material'>('layers');
  const selectedLayer = layers.find(l => l.id === selectedLayerId);
  const presets = useMemo(() => PREDEFINED_PRESETS(settings.laserType), [settings.laserType]);

  const updateSelectedLayer = (updates: Partial<Layer>) => {
    if (!selectedLayerId) return;
    setLayers(layers.map(l => l.id === selectedLayerId ? { ...l, ...updates } : l));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const r = new FileReader();
    r.onload = async (ev) => {
      const dataURL = ev.target?.result as string;
      
      // Load image to get natural dimensions and preserve aspect ratio
      if (settings.preserveAspectRatio) {
        const img = new Image();
        img.src = dataURL;
        await new Promise<void>((resolve) => {
          img.onload = () => {
            const aspectRatio = img.naturalWidth / img.naturalHeight;
            const targetWidth = Math.min(80, Math.min(settings.bedWidth, settings.bedHeight) * 0.5);
            const targetHeight = targetWidth / aspectRatio;
            
            // Add layer with proper dimensions
            addLayer('image', {
              imageData: dataURL,
              width: targetWidth,
              height: targetHeight
            });
            resolve();
          };
        });
      } else {
        // Legacy behavior: use default dimensions (may squish image)
        addLayer('image', dataURL);
      }
    };
    r.readAsDataURL(file);
  };

  const applyMaterialPreset = async (preset: MaterialPreset) => {
    // 1. Update global engraver settings
    setSettings(preset.settings);
    
    // 2. If an image layer is currently selected, trigger auto-vectorization
    if (selectedLayer && selectedLayer.type === 'image') {
      const powerIntensity = preset.settings.laserPower ? (preset.settings.laserPower / settings.laserPower) * 100 : 100;
      await vectorizeLayer(selectedLayer.id, {
        intensity: Math.min(100, powerIntensity),
        speed: preset.settings.feedRate,
        passes: preset.settings.passes
      });
    }
  };

  return (
    <aside className="w-80 bg-[#0d1218] border border-white/5 rounded-2xl flex flex-col overflow-hidden shadow-2xl shrink-0">
      <div className="flex bg-black/20 border-b border-white/5">
        {['layers', 'design', 'material'].map((tab) => (
          <button 
            key={tab} onClick={() => setActiveTab(tab as any)} 
            className={`flex-1 py-4 flex flex-col items-center gap-1 transition-all border-b-2 ${activeTab === tab ? 'text-emerald-500 border-emerald-500 bg-emerald-500/5' : 'text-gray-500 border-transparent hover:text-gray-300'}`}
          >
            <span className="text-[7px] font-black tracking-widest uppercase">{tab}</span>
          </button>
        ))}
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scroll">
        {activeTab === 'layers' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => addLayer('text')} className="p-3 bg-white/5 rounded-xl text-gray-400 hover:text-emerald-500 flex flex-col items-center gap-1"><Type size={14}/><span className="text-[7px] uppercase">Text</span></button>
              <label className="p-3 bg-white/5 rounded-xl text-gray-400 hover:text-orange-500 flex flex-col items-center gap-1 cursor-pointer"><FileCode size={14}/><span className="text-[7px] uppercase">Image</span><input type="file" className="hidden" onChange={handleFileUpload} /></label>
            </div>
            <div className="space-y-2">
              {layers.map(l => (
                <div key={l.id} onClick={() => setSelectedLayerId(l.id)} className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${selectedLayerId === l.id ? 'bg-emerald-500/10 border-emerald-500/50' : 'bg-black/40 border-white/5'}`}>
                  <span className="text-[10px] font-black uppercase text-gray-300">{l.name}</span>
                  <button onClick={() => setLayers(layers.filter(layer => layer.id !== l.id))} className="text-gray-700 hover:text-red-500"><Trash2 size={12}/></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'design' && selectedLayer && (
          <div className="space-y-6">
            {/* Text Layer Controls */}
            {selectedLayer.type === 'text' && (
               <section className="space-y-3 p-4 bg-blue-500/5 rounded-2xl border border-blue-500/20">
                  <h4 className="text-[8px] font-black uppercase text-blue-500 tracking-widest flex items-center gap-2"><Type size={12}/> Text Properties</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-[8px] text-gray-500 uppercase">Text Content</label>
                      <input
                        type="text"
                        value={selectedLayer.text || ''}
                        onChange={e => updateSelectedLayer({ text: e.target.value })}
                        className="w-full bg-black border border-white/5 rounded p-2 text-[12px] text-white"
                        placeholder="Enter text..."
                      />
                    </div>
                    <div>
                      <label className="text-[8px] text-gray-500 uppercase">Font Family</label>
                      <select 
                        value={selectedLayer.fontFamily} 
                        onChange={e => updateSelectedLayer({ fontFamily: e.target.value })} 
                        className="w-full bg-black border border-white/5 rounded p-2 text-[10px]"
                      >
                        <option value="Arial">Arial</option>
                        <option value="Impact">Impact</option>
                        <option value="Times New Roman">Times New Roman</option>
                        <option value="Courier New">Courier New</option>
                        <option value="Georgia">Georgia</option>
                        <option value="Verdana">Verdana</option>
                        <option value="Comic Sans MS">Comic Sans MS</option>
                      </select>
                    </div>
                    <div>
                      <label className="flex justify-between text-[8px] text-gray-500 uppercase">Font Size <span>{selectedLayer.fontSize}px</span></label>
                      <input 
                        type="range" 
                        min="8" 
                        max="120" 
                        value={selectedLayer.fontSize} 
                        onChange={e => updateSelectedLayer({ fontSize: parseInt(e.target.value) })} 
                        className="w-full accent-blue-500" 
                      />
                    </div>
                    <div>
                      <label className="flex justify-between text-[8px] text-gray-500 uppercase">Letter Spacing <span>{selectedLayer.letterSpacing}px</span></label>
                      <input 
                        type="range" 
                        min="-5" 
                        max="20" 
                        value={selectedLayer.letterSpacing} 
                        onChange={e => updateSelectedLayer({ letterSpacing: parseInt(e.target.value) })} 
                        className="w-full accent-blue-500" 
                      />
                    </div>
                    <div>
                      <label className="flex justify-between text-[8px] text-gray-500 uppercase">Line Height <span>{selectedLayer.lineHeight?.toFixed(1)}</span></label>
                      <input 
                        type="range" 
                        min="0.5" 
                        max="3.0" 
                        step="0.1"
                        value={selectedLayer.lineHeight} 
                        onChange={e => updateSelectedLayer({ lineHeight: parseFloat(e.target.value) })} 
                        className="w-full accent-blue-500" 
                      />
                    </div>
                    <div>
                      <label className="text-[8px] text-gray-500 uppercase">Text Style</label>
                      <select 
                        value={selectedLayer.textFillStyle} 
                        onChange={e => updateSelectedLayer({ textFillStyle: e.target.value as TextFillStyle })} 
                        className="w-full bg-black border border-white/5 rounded p-2 text-[10px]"
                      >
                        <option value="outline">Outline</option>
                        <option value="hatch">Hatch</option>
                        <option value="crosshatch">Crosshatch</option>
                        <option value="dots">Dots</option>
                        <option value="lines">Lines</option>
                        <option value="patterns">Patterns</option>
                      </select>
                    </div>
                  </div>
               </section>
            )}

            {/* Vectorization Engine Trigger */}
            {(selectedLayer.type === 'image' || selectedLayer.type === 'text') && (
               <section className="space-y-3 p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/20">
                  <h4 className="text-[8px] font-black uppercase text-emerald-500 tracking-widest flex items-center gap-2"><Scissors size={12}/> Vector Slicing Engine</h4>
                  <p className="text-[9px] text-gray-500 italic uppercase">
                    {selectedLayer.type === 'text' 
                      ? 'Convert text to laser paths for engraving.'
                      : 'Manual path generation with current settings.'}
                  </p>
                  <button 
                    onClick={() => vectorizeLayer(selectedLayer.id)}
                    className="w-full py-3 bg-emerald-500 text-black rounded-xl font-black uppercase text-[10px] hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10"
                  >
                    <Zap size={14} fill="currentColor"/> Generate Line Path
                  </button>
               </section>
            )}

            <section className="space-y-4">
              <h4 className="text-[8px] font-black uppercase text-emerald-500 tracking-widest flex items-center gap-2"><Sliders size={12}/> Adjustment & Filters</h4>
              <div className="space-y-3">
                 <div>
                    <label className="text-[8px] text-gray-500 uppercase">Blending Mode</label>
                    <select value={selectedLayer.blendingMode} onChange={e => updateSelectedLayer({ blendingMode: e.target.value as BlendingMode })} className="w-full bg-black border border-white/5 rounded p-2 text-[10px]">
                       {['normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten', 'difference'].map(m => <option key={m} value={m}>{m.toUpperCase()}</option>)}
                    </select>
                 </div>
                 {[
                   { label: 'Brightness', key: 'brightness', min: -100, max: 100 },
                   { label: 'Contrast', key: 'contrast', min: -100, max: 100 },
                   { label: 'Hue', key: 'hue', min: -180, max: 180 },
                   { label: 'Gamma', key: 'gamma', min: 0.1, max: 4.0, step: 0.1 },
                   { label: 'Posterize', key: 'posterization', min: 0, max: 20 },
                   { label: 'Noise Reduction', key: 'noiseReduction', min: 0, max: 10 },
                   { label: 'Edge Enhance', key: 'edgeEnhancement', min: 0, max: 10 }
                 ].map(f => (
                   <div key={f.key} className="mb-2">
                      <Slider
                        label={f.label}
                        value={(selectedLayer as any)[f.key]}
                        min={f.min}
                        max={f.max}
                        step={f.step || 1}
                        onChange={v => updateSelectedLayer({ [f.key]: v })}
                        debounce={100}
                        className="w-full"
                      />
                   </div>
                 ))}
                 <label className="flex items-center gap-3 p-3 bg-white/5 rounded-xl cursor-pointer">
                    <input type="checkbox" checked={selectedLayer.sketchMode} onChange={e => updateSelectedLayer({ sketchMode: e.target.checked })} />
                    <span className="text-[9px] font-black uppercase text-gray-400">Sketch Line Detection</span>
                 </label>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'material' && (
          <div className="space-y-4">
            <h4 className="text-[8px] font-black uppercase text-emerald-500 tracking-widest">Substrate Presets</h4>
            <p className="text-[9px] text-gray-500 italic uppercase -mt-2">Selecting a material will automatically generate toolpaths for the active layer.</p>
            {presets.map(p => (
              <button 
                key={p.id} 
                onClick={() => applyMaterialPreset(p)} 
                className="w-full p-4 bg-white/5 border border-white/5 rounded-2xl text-left hover:border-emerald-500/30 transition-all flex items-center justify-between group"
              >
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase text-gray-400 group-hover:text-emerald-400">{p.name}</span>
                  <span className="text-[8px] text-gray-600 font-bold uppercase">{p.settings.feedRate} mm/min • S{p.settings.laserPower}</span>
                </div>
                <Zap size={14} className="text-gray-600 group-hover:text-emerald-500" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 bg-black/40 border-t border-white/5 space-y-4">
        {progress > 0 && <div className="h-1 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${progress}%` }} /></div>}
        <button onClick={startJob} disabled={layers.length === 0} className="w-full py-4 bg-emerald-500 text-black rounded-xl font-black uppercase text-[10px] shadow-lg shadow-emerald-500/20 active:scale-95 transition-all">Execute Burn Sequence</button>
      </div>
    </aside>
  );
}