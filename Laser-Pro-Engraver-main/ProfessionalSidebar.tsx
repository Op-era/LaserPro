import React, { useState } from 'react';
import { 
  Layers, Image, Type, Box, Sliders, Sparkles, Palette, Grid3x3, 
  ChevronDown, ChevronRight, Eye, EyeOff, Lock, Unlock, Trash2,
  Plus, Settings, Zap, Play, Square, Wand2, Scissors
} from 'lucide-react';
import { Layer, ArtisticFilter, DitherType, HalftoneShape, TextureMode, BlendingMode, MaterialPreset, EngraverSettings, Path } from './types';
import FilterGallery from './FilterGallery';
import MaterialBrowser from './MaterialBrowser';
import LayerPalette from './LayerPalette';
import { applyPreset } from './filterPresets';
import Slider from './components/Slider';

interface ProfessionalSidebarProps {
  layers: Layer[];
  setLayers: (layers: Layer[]) => void;
  selectedLayerId: string | null;
  setSelectedLayerId: (id: string | null) => void;
  addLayer: (type: LayerType, data?: Partial<Layer>) => void;
  onStartJob: () => void;
  onStopJob: () => void;
  isEngraving: boolean;
  progress: number;
  connected: boolean;
  settings: EngraverSettings;
  setSettings: (s: Partial<EngraverSettings>) => void;
  paths?: Path[];
}

export default function ProfessionalSidebar({
  layers,
  setLayers,
  selectedLayerId,
  setSelectedLayerId,
  addLayer,
  onStartJob,
  onStopJob,
  isEngraving,
  progress,
  connected,
  settings,
  setSettings,
  paths = []
}: ProfessionalSidebarProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['layers', 'adjustments', 'artistic'])
  );
  const [showFilterGallery, setShowFilterGallery] = useState(false);
  const [showMaterialBrowser, setShowMaterialBrowser] = useState(false);
  
  const selectedLayer = layers.find(l => l.id === selectedLayerId);

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const updateLayer = (updates: Partial<Layer>) => {
    if (!selectedLayerId) return;
    setLayers(layers.map(l => l.id === selectedLayerId ? { ...l, ...updates } : l));
  };

  const handleApplyPreset = (presetId: string) => {
    if (!selectedLayerId) return;
    const layer = layers.find(l => l.id === selectedLayerId);
    if (!layer) return;
    
    const updatedLayer = applyPreset(layer, presetId);
    setLayers(layers.map(l => l.id === selectedLayerId ? updatedLayer : l));
  };

  const handleSelectMaterial = (material: MaterialPreset) => {
    // Apply material settings to global settings
    setSettings(material.settings);
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

  const SectionHeader = ({ title, icon: Icon, section }: { title: string; icon: React.ComponentType<{ size?: number; className?: string }>; section: string }) => (
    <button
      onClick={() => toggleSection(section)}
      className="w-full flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-[#1a1f2e] to-[#151921] hover:from-[#1f2433] hover:to-[#1a1f2e] rounded-lg transition-all group border border-white/5"
    >
      {expandedSections.has(section) ? (
        <ChevronDown size={14} className="text-emerald-400" />
      ) : (
        <ChevronRight size={14} className="text-gray-500 group-hover:text-emerald-400" />
      )}
      <Icon size={14} className="text-emerald-400" />
      <span className="text-xs font-bold uppercase tracking-wider text-gray-300">{title}</span>
    </button>
  );

  // Using imported Slider component with debouncing to prevent freezing

  return (
    <div className="w-80 bg-[#0d1218] flex flex-col h-full border-r border-white/10">
      {/* Filter Gallery Modal */}
      {showFilterGallery && (
        <FilterGallery
          onClose={() => setShowFilterGallery(false)}
          onApplyPreset={handleApplyPreset}
          selectedLayer={selectedLayer || null}
        />
      )}

      {/* Material Browser Modal */}
      {showMaterialBrowser && (
        <MaterialBrowser
          onClose={() => setShowMaterialBrowser(false)}
          onSelectMaterial={handleSelectMaterial}
          laserType={settings.laserType}
          currentSettings={settings}
        />
      )}

      {/* Top Toolbar */}
      <div className="p-3 border-b border-white/10 bg-gradient-to-b from-[#111419] to-[#0d1218]">
        <div className="flex gap-2 mb-2">
          <label className="flex-1 py-2 px-3 bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 hover:from-emerald-500/30 hover:to-emerald-600/20 rounded-lg cursor-pointer transition-all border border-emerald-500/20 hover:border-emerald-500/40 group">
            <div className="flex items-center gap-2 justify-center">
              <Image size={16} className="text-emerald-400" />
              <span className="text-xs font-bold text-emerald-300">Add Image</span>
            </div>
            <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
          </label>
          <button
            onClick={() => addLayer('text')}
            className="flex-1 py-2 px-3 bg-gradient-to-br from-blue-500/20 to-blue-600/10 hover:from-blue-500/30 hover:to-blue-600/20 rounded-lg transition-all border border-blue-500/20 hover:border-blue-500/40"
          >
            <div className="flex items-center gap-2 justify-center">
              <Type size={16} className="text-blue-400" />
              <span className="text-xs font-bold text-blue-300">Add Text</span>
            </div>
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilterGallery(true)}
            disabled={!selectedLayer}
            className={`flex-1 py-2 px-3 rounded-lg transition-all border flex items-center gap-2 justify-center ${
              selectedLayer
                ? 'bg-gradient-to-br from-purple-500/20 to-purple-600/10 hover:from-purple-500/30 hover:to-purple-600/20 border-purple-500/20 hover:border-purple-500/40'
                : 'bg-white/5 border-white/5 cursor-not-allowed opacity-50'
            }`}
          >
            <Wand2 size={16} className="text-purple-400" />
            <span className="text-xs font-bold text-purple-300">Filters</span>
          </button>
          <button
            onClick={() => setShowMaterialBrowser(true)}
            className="flex-1 py-2 px-3 bg-gradient-to-br from-red-500/20 to-orange-600/10 hover:from-red-500/30 hover:to-orange-600/20 rounded-lg transition-all border border-red-500/20 hover:border-red-500/40 flex items-center gap-2 justify-center"
          >
            <Scissors size={16} className="text-red-400" />
            <span className="text-xs font-bold text-red-300">Materials</span>
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto custom-scroll p-3 space-y-3">
        
        {/* LIGHTBURN-STYLE LAYER PALETTE */}
        <LayerPalette
          layers={layers}
          setLayers={setLayers}
          selectedLayerId={selectedLayerId}
          setSelectedLayerId={setSelectedLayerId}
          onDeleteLayer={(id) => {
            setLayers(layers.filter(l => l.id !== id));
            if (selectedLayerId === id) setSelectedLayerId(null);
          }}
          paths={paths}
          settings={settings}
        />

        {/* PROPERTIES - Only show if layer selected */}
        {selectedLayer && (
          <>
            {/* IMAGE ADJUSTMENTS */}
            <div className="space-y-2">
              <SectionHeader title="Image Adjustments" icon={Sliders} section="adjustments" />
              {expandedSections.has('adjustments') && (
                <div className="space-y-3 pl-1 bg-[#0a0e13] p-3 rounded-lg border border-white/5">
                  <Slider
                    label="Brightness"
                    value={selectedLayer.brightness}
                    min={-100}
                    max={100}
                    onChange={(v) => updateLayer({ brightness: v })}
                  />
                  <Slider
                    label="Contrast"
                    value={selectedLayer.contrast}
                    min={-100}
                    max={100}
                    onChange={(v) => updateLayer({ contrast: v })}
                  />
                  <Slider
                    label="Gamma"
                    value={selectedLayer.gamma}
                    min={0.1}
                    max={3.0}
                    step={0.1}
                    onChange={(v) => updateLayer({ gamma: v })}
                  />
                  <Slider
                    label="Exposure"
                    value={selectedLayer.exposure}
                    min={-2}
                    max={2}
                    step={0.1}
                    onChange={(v) => updateLayer({ exposure: v })}
                  />
                  <Slider
                    label="Saturation"
                    value={selectedLayer.saturation}
                    min={-100}
                    max={100}
                    onChange={(v) => updateLayer({ saturation: v })}
                  />
                </div>
              )}
            </div>

            {/* ARTISTIC FILTERS */}
            <div className="space-y-2">
              <SectionHeader title="Artistic Filters" icon={Sparkles} section="artistic" />
              {expandedSections.has('artistic') && (
                <div className="space-y-3 pl-1 bg-[#0a0e13] p-3 rounded-lg border border-white/5">
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400">Filter Type</label>
                    <select
                      value={selectedLayer.artisticFilter}
                      onChange={(e) => updateLayer({ artisticFilter: e.target.value as ArtisticFilter })}
                      className="w-full px-3 py-2 bg-[#151921] border border-white/10 rounded-lg text-xs text-gray-300 focus:border-emerald-500/50 focus:outline-none"
                    >
                      <option value="none">None</option>
                      <option value="oil-painting">🎨 Oil Painting</option>
                      <option value="watercolor">💧 Watercolor</option>
                      <option value="pencil">✏️ Pencil Sketch</option>
                      <option value="charcoal">🖌️ Charcoal</option>
                      <option value="engraving">📜 Engraving</option>
                      <option value="stippling">⚫ Stippling</option>
                    </select>
                  </div>
                  {selectedLayer.artisticFilter !== 'none' && (
                    <Slider
                      label="Filter Strength"
                      value={selectedLayer.artisticStrength}
                      min={0.1}
                      max={2.0}
                      step={0.1}
                      onChange={(v) => updateLayer({ artisticStrength: v })}
                    />
                  )}
                </div>
              )}
            </div>

            {/* HALFTONE & PATTERNS */}
            <div className="space-y-2">
              <SectionHeader title="Patterns & Halftone" icon={Grid3x3} section="patterns" />
              {expandedSections.has('patterns') && (
                <div className="space-y-3 pl-1 bg-[#0a0e13] p-3 rounded-lg border border-white/5">
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400">Pattern Mode</label>
                    <select
                      value={selectedLayer.textureMode}
                      onChange={(e) => updateLayer({ textureMode: e.target.value as TextureMode })}
                      className="w-full px-3 py-2 bg-[#151921] border border-white/10 rounded-lg text-xs text-gray-300 focus:border-emerald-500/50 focus:outline-none"
                    >
                      <option value="none">None</option>
                      <option value="halftone">⬤ Halftone (Newspaper)</option>
                      <option value="hatch">═ Hatch Lines</option>
                      <option value="crosshatch">╬ Crosshatch</option>
                      <option value="noise">▒ Noise/Stipple</option>
                      <option value="sketchy">～ Sketchy</option>
                      <option value="organic">⚘ Organic</option>
                    </select>
                  </div>
                  
                  {selectedLayer.textureMode === 'halftone' && (
                    <>
                      <div className="space-y-1">
                        <label className="text-xs text-gray-400">Dot Shape</label>
                        <select
                          value={selectedLayer.halftoneShape}
                          onChange={(e) => updateLayer({ halftoneShape: e.target.value as HalftoneShape })}
                          className="w-full px-3 py-2 bg-[#151921] border border-white/10 rounded-lg text-xs text-gray-300 focus:border-emerald-500/50 focus:outline-none"
                        >
                          <option value="circle">● Circle</option>
                          <option value="square">■ Square</option>
                          <option value="diamond">◆ Diamond</option>
                          <option value="line">▬ Line</option>
                          <option value="cross">✚ Cross</option>
                        </select>
                      </div>
                      <Slider
                        label="Cell Size"
                        value={selectedLayer.halftoneCellSize}
                        min={2}
                        max={20}
                        onChange={(v) => updateLayer({ halftoneCellSize: v })}
                        unit="px"
                      />
                      <Slider
                        label="Angle"
                        value={selectedLayer.halftoneAngle}
                        min={0}
                        max={90}
                        onChange={(v) => updateLayer({ halftoneAngle: v })}
                        unit="°"
                      />
                    </>
                  )}
                  
                  {selectedLayer.textureMode !== 'none' && selectedLayer.textureMode !== 'halftone' && (
                    <>
                      <Slider
                        label="Pattern Density"
                        value={selectedLayer.textureDensity}
                        min={0.2}
                        max={3.0}
                        step={0.1}
                        onChange={(v) => updateLayer({ textureDensity: v })}
                      />
                      <Slider
                        label="Angle"
                        value={selectedLayer.textureAngle}
                        min={0}
                        max={180}
                        onChange={(v) => updateLayer({ textureAngle: v })}
                        unit="°"
                      />
                    </>
                  )}
                </div>
              )}
            </div>

            {/* ADVANCED */}
            <div className="space-y-2">
              <SectionHeader title="Advanced" icon={Settings} section="advanced" />
              {expandedSections.has('advanced') && (
                <div className="space-y-3 pl-1 bg-[#0a0e13] p-3 rounded-lg border border-white/5">
                  <Slider
                    label="Blur"
                    value={selectedLayer.blur}
                    min={0}
                    max={10}
                    onChange={(v) => updateLayer({ blur: v })}
                  />
                  <Slider
                    label="Sharpen"
                    value={selectedLayer.sharpen}
                    min={0}
                    max={10}
                    onChange={(v) => updateLayer({ sharpen: v })}
                  />
                  <Slider
                    label="Edge Enhancement"
                    value={selectedLayer.edgeEnhancement}
                    min={0}
                    max={10}
                    onChange={(v) => updateLayer({ edgeEnhancement: v })}
                  />
                  <Slider
                    label="Noise Reduction"
                    value={selectedLayer.noiseReduction}
                    min={0}
                    max={10}
                    onChange={(v) => updateLayer({ noiseReduction: v })}
                  />
                  
                  <div className="pt-2 border-t border-white/10">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedLayer.invert}
                        onChange={(e) => updateLayer({ invert: e.target.checked })}
                        className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-emerald-500 focus:ring-emerald-500"
                      />
                      <span className="text-xs text-gray-300">Invert Colors</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Bottom Action Bar */}
      <div className="p-3 border-t border-white/10 bg-gradient-to-t from-[#111419] to-[#0d1218]">
        {isEngraving ? (
          <>
            <div className="mb-2">
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="text-xs text-center mt-1 text-emerald-400 font-mono">{progress}%</div>
            </div>
            <button
              onClick={onStopJob}
              className="w-full py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 rounded-lg font-bold text-sm text-white shadow-lg shadow-red-500/30 transition-all flex items-center justify-center gap-2"
            >
              <Square size={16} fill="currentColor" />
              STOP ENGRAVING
            </button>
          </>
        ) : (
          <button
            onClick={onStartJob}
            disabled={!connected || layers.length === 0}
            className={`w-full py-3 rounded-lg font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 ${
              connected && layers.length > 0
                ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-emerald-500/30'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Play size={16} fill={connected && layers.length > 0 ? 'currentColor' : 'none'} />
            {connected ? 'START ENGRAVING' : 'CONNECT LASER FIRST'}
          </button>
        )}
      </div>

      <style jsx>{`
        .custom-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: #0a0e13;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: #1f2937;
          border-radius: 3px;
        }
        .custom-scroll::-webkit-scrollbar-thumb:hover {
          background: #374151;
        }
        .slider-emerald::-webkit-slider-thumb {
          appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          cursor: pointer;
          box-shadow: 0 0 0 2px #0d1218, 0 0 8px rgba(16, 185, 129, 0.5);
        }
        .slider-emerald::-moz-range-thumb {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          cursor: pointer;
          border: none;
          box-shadow: 0 0 0 2px #0d1218, 0 0 8px rgba(16, 185, 129, 0.5);
        }
      `}</style>
    </div>
  );
}
