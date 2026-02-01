/**
 * LightBurn-Style Layer Palette Component
 * Part of Phase 2 of 10 implementation from ROADMAP-v0.2.0.md
 * Professional layer management based on industry-leading LightBurn software
 */

import React, { useState } from 'react';
import {
  Layers, Eye, EyeOff, Lock, Unlock, Trash2, Settings,
  ArrowUp, ArrowDown, Copy, Scissors, GripVertical,
  Zap, Gauge, Repeat, Wind, Clock
} from 'lucide-react';
import { Layer, LayerMode, Path, EngraverSettings } from './types';
import { estimateLayerTime } from './utils/layerGCode';

interface LayerPaletteProps {
  layers: Layer[];
  setLayers: (layers: Layer[]) => void;
  selectedLayerId: string | null;
  setSelectedLayerId: (id: string | null) => void;
  onDeleteLayer: (id: string) => void;
  paths?: Path[];
  settings?: EngraverSettings;
}

export default function LayerPalette({
  layers,
  setLayers,
  selectedLayerId,
  setSelectedLayerId,
  onDeleteLayer,
  paths = [],
  settings
}: LayerPaletteProps) {
  const [expandedLayers, setExpandedLayers] = useState<Set<string>>(new Set());

  // Calculate time estimates
  const getLayerTime = (layer: Layer): string => {
    if (!settings || paths.length === 0) return '--';
    const time = estimateLayerTime(layer, paths, settings);
    if (time < 1) return `${Math.round(time * 60)}s`;
    return `${time.toFixed(1)}m`;
  };

  const toggleExpanded = (layerId: string) => {
    const newExpanded = new Set(expandedLayers);
    if (newExpanded.has(layerId)) {
      newExpanded.delete(layerId);
    } else {
      newExpanded.add(layerId);
    }
    setExpandedLayers(newExpanded);
  };

  const updateLayer = (id: string, updates: Partial<Layer>) => {
    setLayers(layers.map(l => l.id === id ? { ...l, ...updates } : l));
  };

  const moveLayer = (id: string, direction: 'up' | 'down') => {
    const index = layers.findIndex(l => l.id === id);
    if (index === -1) return;
    
    if (direction === 'up' && index > 0) {
      const newLayers = [...layers];
      [newLayers[index - 1], newLayers[index]] = [newLayers[index], newLayers[index - 1]];
      // Update priorities
      newLayers.forEach((layer, idx) => layer.priority = idx);
      setLayers(newLayers);
    } else if (direction === 'down' && index < layers.length - 1) {
      const newLayers = [...layers];
      [newLayers[index], newLayers[index + 1]] = [newLayers[index + 1], newLayers[index]];
      // Update priorities
      newLayers.forEach((layer, idx) => layer.priority = idx);
      setLayers(newLayers);
    }
  };

  const duplicateLayer = (layer: Layer) => {
    const newId = Math.random().toString(36).substring(2, 11);
    const duplicate: Layer = {
      ...layer,
      id: newId,
      name: `${layer.name} Copy`,
      x: layer.x + 10,
      y: layer.y + 10
    };
    setLayers([...layers, duplicate]);
  };

  // Sort layers by priority for display
  const sortedLayers = [...layers].sort((a, b) => a.priority - b.priority);

  return (
    <div className="bg-[#0d1218] rounded-xl border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-[#1a1f2e] to-[#151921] border-b border-white/10">
        <div className="flex items-center gap-2">
          <Layers className="text-emerald-400" size={18} />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Layer Palette</h3>
          <span className="ml-auto text-xs text-gray-500">{layers.length} layers</span>
        </div>
      </div>

      {/* Layer List */}
      <div className="max-h-96 overflow-y-auto custom-scroll">
        {sortedLayers.length === 0 ? (
          <div className="p-6 text-center">
            <Layers size={32} className="mx-auto mb-2 text-gray-600 opacity-30" />
            <p className="text-xs text-gray-500">No layers yet. Add an image or text to start.</p>
          </div>
        ) : (
          sortedLayers.map((layer) => (
            <div
              key={layer.id}
              className={`border-b border-white/5 transition-all ${
                selectedLayerId === layer.id ? 'bg-emerald-500/10' : 'hover:bg-white/5'
              }`}
            >
              {/* Layer Row */}
              <div
                className="px-3 py-2 cursor-pointer"
                onClick={() => setSelectedLayerId(layer.id)}
              >
                <div className="flex items-center gap-2">
                  {/* Color Swatch */}
                  <div
                    className="w-4 h-4 rounded border border-white/20 flex-shrink-0"
                    style={{ backgroundColor: layer.layerColor }}
                    title={layer.layerNumber}
                  />

                  {/* Layer Number */}
                  <span className="text-xs font-mono text-gray-400 w-8">
                    {layer.layerNumber}
                  </span>

                  {/* Layer Name */}
                  <span className="text-xs flex-1 truncate text-gray-300 font-medium">
                    {layer.name}
                  </span>

                  {/* Mode Badge */}
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                      layer.mode === 'line'
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-purple-500/20 text-purple-400'
                    }`}
                  >
                    {layer.mode === 'line' ? 'Cut' : 'Fill'}
                  </span>

                  {/* Quick Controls */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateLayer(layer.id, { visible: !layer.visible });
                      }}
                      className="p-1 hover:bg-white/10 rounded transition-colors"
                      title="Toggle visibility"
                    >
                      {layer.visible ? (
                        <Eye size={14} className="text-emerald-400" />
                      ) : (
                        <EyeOff size={14} className="text-gray-600" />
                      )}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateLayer(layer.id, { locked: !layer.locked });
                      }}
                      className="p-1 hover:bg-white/10 rounded transition-colors"
                      title="Toggle lock"
                    >
                      {layer.locked ? (
                        <Lock size={14} className="text-yellow-400" />
                      ) : (
                        <Unlock size={14} className="text-gray-600" />
                      )}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpanded(layer.id);
                      }}
                      className="p-1 hover:bg-white/10 rounded transition-colors"
                      title="Settings"
                    >
                      <Settings size={14} className="text-gray-400" />
                    </button>
                  </div>
                </div>

                {/* Quick Stats Row */}
                <div className="flex items-center gap-3 mt-1 ml-6 text-[10px] text-gray-500">
                  <span className="flex items-center gap-1">
                    <Gauge size={10} />
                    {layer.speed ? `${layer.speed}mm/s` : 'Auto'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Zap size={10} />
                    {layer.powerMin === layer.powerMax 
                      ? `${layer.powerMax}%`
                      : `${layer.powerMin}-${layer.powerMax}%`
                    }
                  </span>
                  <span className="flex items-center gap-1">
                    <Repeat size={10} />
                    {layer.numPasses}x
                  </span>
                  {layer.airAssist && (
                    <span className="flex items-center gap-1 text-blue-400">
                      <Wind size={10} />
                      Air
                    </span>
                  )}
                  {settings && paths.length > 0 && (
                    <span className="flex items-center gap-1 text-emerald-400">
                      <Clock size={10} />
                      {getLayerTime(layer)}
                    </span>
                  )}
                </div>
              </div>

              {/* Expanded Settings */}
              {expandedLayers.has(layer.id) && (
                <div className="px-4 py-3 bg-black/20 border-t border-white/5 space-y-2">
                  {/* Mode Selection */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => updateLayer(layer.id, { mode: 'line' })}
                      className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                        layer.mode === 'line'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/50'
                      }`}
                    >
                      Line (Cut)
                    </button>
                    <button
                      onClick={() => updateLayer(layer.id, { mode: 'fill' })}
                      className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                        layer.mode === 'fill'
                          ? 'bg-purple-500 text-white'
                          : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/50'
                      }`}
                    >
                      Fill (Scan)
                    </button>
                  </div>

                  {/* Power Range */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-gray-400">
                      <span>Power</span>
                      <span className="text-emerald-400 font-mono">
                        {layer.powerMin === layer.powerMax 
                          ? `${layer.powerMax}%`
                          : `${layer.powerMin}-${layer.powerMax}%`
                        }
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={layer.powerMin}
                        onChange={(e) => updateLayer(layer.id, { powerMin: parseInt(e.target.value) })}
                        className="flex-1 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-emerald"
                        title="Min Power"
                      />
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={layer.powerMax}
                        onChange={(e) => updateLayer(layer.id, { powerMax: parseInt(e.target.value) })}
                        className="flex-1 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-emerald"
                        title="Max Power"
                      />
                    </div>
                  </div>

                  {/* Speed */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-gray-400">
                      <span>Speed (mm/s)</span>
                      <span className="text-emerald-400 font-mono">{layer.speed || 'Auto'}</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="200"
                      value={layer.speed || 100}
                      onChange={(e) => updateLayer(layer.id, { speed: parseInt(e.target.value) })}
                      className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-emerald"
                    />
                  </div>

                  {/* Passes */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-400">Passes</span>
                    <input
                      type="number"
                      min="1"
                      max="99"
                      value={layer.numPasses}
                      onChange={(e) => updateLayer(layer.id, { numPasses: parseInt(e.target.value) || 1 })}
                      className="w-16 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Air Assist */}
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-[10px] text-gray-400">Air Assist</span>
                    <input
                      type="checkbox"
                      checked={layer.airAssist}
                      onChange={(e) => updateLayer(layer.id, { airAssist: e.target.checked })}
                      className="w-3 h-3 rounded border-gray-600 bg-gray-700 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-gray-800"
                    />
                  </label>

                  {/* Actions */}
                  <div className="flex gap-1 pt-2 border-t border-white/5">
                    <button
                      onClick={() => moveLayer(layer.id, 'up')}
                      className="flex-1 px-2 py-1 bg-gray-700/50 hover:bg-gray-600/50 rounded text-gray-400 transition-colors"
                      title="Move up"
                    >
                      <ArrowUp size={12} className="mx-auto" />
                    </button>
                    <button
                      onClick={() => moveLayer(layer.id, 'down')}
                      className="flex-1 px-2 py-1 bg-gray-700/50 hover:bg-gray-600/50 rounded text-gray-400 transition-colors"
                      title="Move down"
                    >
                      <ArrowDown size={12} className="mx-auto" />
                    </button>
                    <button
                      onClick={() => duplicateLayer(layer)}
                      className="flex-1 px-2 py-1 bg-gray-700/50 hover:bg-gray-600/50 rounded text-gray-400 transition-colors"
                      title="Duplicate"
                    >
                      <Copy size={12} className="mx-auto" />
                    </button>
                    <button
                      onClick={() => onDeleteLayer(layer.id)}
                      className="flex-1 px-2 py-1 bg-red-500/20 hover:bg-red-500/30 rounded text-red-400 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={12} className="mx-auto" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
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
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          cursor: pointer;
          box-shadow: 0 0 0 2px #0d1218, 0 0 6px rgba(16, 185, 129, 0.5);
        }
        .slider-emerald::-moz-range-thumb {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          cursor: pointer;
          border: none;
          box-shadow: 0 0 0 2px #0d1218, 0 0 6px rgba(16, 185, 129, 0.5);
        }
      `}</style>
    </div>
  );
}
