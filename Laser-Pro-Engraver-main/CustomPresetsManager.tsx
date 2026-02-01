import React, { useState } from 'react';
import { X, Save, FolderOpen, Trash2, Copy, Settings, Plus } from 'lucide-react';
import { MaterialPreset } from './types';

interface CustomPresetsManagerProps {
  isOpen: boolean;
  onClose: () => void;
  presets: MaterialPreset[];
  onSavePreset: (preset: MaterialPreset) => void;
  onLoadPreset: (preset: MaterialPreset) => void;
  onDeletePreset: (id: string) => void;
  currentSettings: any;
}

export default function CustomPresetsManager({
  isOpen,
  onClose,
  presets,
  onSavePreset,
  onLoadPreset,
  onDeletePreset,
  currentSettings
}: CustomPresetsManagerProps) {
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [presetDescription, setPresetDescription] = useState('');

  if (!isOpen) return null;

  const handleSaveNewPreset = () => {
    if (!presetName.trim()) return;

    const newPreset: MaterialPreset = {
      id: `custom-${Date.now()}`,
      name: presetName,
      description: presetDescription,
      settings: {
        laserPower: currentSettings.laserPower,
        feedRate: currentSettings.feedRate,
        travelSpeed: currentSettings.travelSpeed,
        laserMode: currentSettings.laserMode,
        linesPerMm: currentSettings.linesPerMm,
        passes: currentSettings.passes,
        powerGamma: currentSettings.powerGamma,
        scanAngle: currentSettings.scanAngle,
        overscan: currentSettings.overscan,
        bidirectional: currentSettings.bidirectional,
        threshold: currentSettings.threshold,
        contrast: currentSettings.contrast
      }
    };

    onSavePreset(newPreset);
    setPresetName('');
    setPresetDescription('');
    setShowSaveDialog(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-[#0d1218] border border-white/10 w-full max-w-4xl max-h-[90vh] rounded-3xl flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <header className="p-6 border-b border-white/5 flex items-center justify-between bg-emerald-500/5">
          <div className="flex items-center gap-3">
            <Settings className="text-emerald-500" size={24} />
            <div>
              <h2 className="text-lg font-black uppercase tracking-tighter italic">Custom Settings Presets</h2>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Save and load your configurations</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
            <X size={24} />
          </button>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scroll">
          {/* Save New Preset */}
          <div className="p-5 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black uppercase text-emerald-400">Save Current Settings</h3>
              <button
                onClick={() => setShowSaveDialog(!showSaveDialog)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-black rounded-xl text-[10px] font-black uppercase hover:bg-emerald-400 transition-all"
              >
                <Plus size={14} />
                New Preset
              </button>
            </div>

            {showSaveDialog && (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <input
                  type="text"
                  placeholder="Preset name (e.g., 'Oak Wood 3mm')"
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-gray-500 focus:border-emerald-500 outline-none"
                />
                <textarea
                  placeholder="Description (optional)"
                  value={presetDescription}
                  onChange={(e) => setPresetDescription(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-gray-500 focus:border-emerald-500 outline-none resize-none"
                  rows={2}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveNewPreset}
                    disabled={!presetName.trim()}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500 disabled:bg-gray-700 disabled:opacity-50 text-black rounded-xl text-[10px] font-black uppercase hover:bg-emerald-400 transition-all"
                  >
                    <Save size={14} />
                    Save Preset
                  </button>
                  <button
                    onClick={() => setShowSaveDialog(false)}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-400 rounded-xl text-[10px] font-black uppercase transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Saved Presets List */}
          <div className="space-y-3">
            <h3 className="text-sm font-black uppercase text-gray-400">Your Saved Presets</h3>
            {presets.length > 0 ? (
              <div className="grid grid-cols-1 gap-3">
                {presets.map((preset) => (
                  <div
                    key={preset.id}
                    className="p-5 bg-white/5 border border-white/5 rounded-2xl hover:border-emerald-500/20 transition-all group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <h4 className="text-lg font-black uppercase tracking-tight text-white">
                          {preset.name}
                        </h4>
                        {preset.description && (
                          <p className="text-xs text-gray-400">{preset.description}</p>
                        )}
                        <div className="flex flex-wrap gap-2 mt-2">
                          {preset.settings.laserPower && (
                            <span className="px-2 py-1 bg-black/40 rounded text-[9px] text-gray-400 font-mono">
                              Power: {preset.settings.laserPower}
                            </span>
                          )}
                          {preset.settings.feedRate && (
                            <span className="px-2 py-1 bg-black/40 rounded text-[9px] text-gray-400 font-mono">
                              Feed: {preset.settings.feedRate} mm/min
                            </span>
                          )}
                          {preset.settings.passes && (
                            <span className="px-2 py-1 bg-black/40 rounded text-[9px] text-gray-400 font-mono">
                              Passes: {preset.settings.passes}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => onLoadPreset(preset)}
                          className="p-2 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-black border border-emerald-500/20 rounded-xl transition-all"
                          title="Load Preset"
                        >
                          <FolderOpen size={16} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete preset "${preset.name}"?`)) {
                              onDeletePreset(preset.id);
                            }
                          }}
                          className="p-2 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 rounded-xl transition-all"
                          title="Delete Preset"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 space-y-2">
                <Settings size={48} className="mx-auto text-gray-700" />
                <p className="text-gray-500 text-sm">No custom presets saved yet</p>
                <p className="text-gray-600 text-xs">Configure your settings and save them as a preset</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="p-6 border-t border-white/5 bg-black/40 flex items-center justify-between">
          <p className="text-[10px] text-gray-500">
            {presets.length} custom preset{presets.length !== 1 ? 's' : ''}
          </p>
          <button
            onClick={onClose}
            className="px-8 py-3 bg-emerald-500 text-black font-black uppercase text-[11px] rounded-2xl shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all active:scale-95"
          >
            Close
          </button>
        </footer>
      </div>
    </div>
  );
}
