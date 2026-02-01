/**
 * Serialization Panel Component
 * Batch production feature with auto-increment barcodes/datamatrix
 * Part of Phase 1 implementation from ROADMAP-v0.2.0.md
 */

import React, { useState } from 'react';
import { Hash, Plus, Minus, RotateCcw, Play, ChevronDown, ChevronUp } from 'lucide-react';
import { SerializationSettings, SerializationType, SerializationFormat } from './types';
import { generateSerialNumber } from './utils/serialization';

interface SerializationPanelProps {
  settings: SerializationSettings;
  onUpdate: (settings: Partial<SerializationSettings>) => void;
  onGenerate: () => void;
  isConnected: boolean;
}

export default function SerializationPanel({ 
  settings, 
  onUpdate, 
  onGenerate,
  isConnected 
}: SerializationPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [previewText, setPreviewText] = useState('');

  React.useEffect(() => {
    if (settings.enabled) {
      setPreviewText(generateSerialNumber(settings));
    }
  }, [settings]);

  const handleTypeChange = (type: SerializationType) => {
    onUpdate({ type });
  };

  const handleFormatChange = (format: SerializationFormat) => {
    onUpdate({ format });
  };

  const incrementNumber = () => {
    onUpdate({ 
      currentNumber: settings.currentNumber + settings.increment 
    });
  };

  const decrementNumber = () => {
    onUpdate({ 
      currentNumber: Math.max(settings.startNumber, settings.currentNumber - settings.increment)
    });
  };

  const resetNumber = () => {
    onUpdate({ currentNumber: settings.startNumber });
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl border border-white/10 shadow-2xl overflow-hidden">
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <Hash className="text-emerald-400" size={20} />
          <div>
            <h3 className="text-white font-semibold">Batch Serialization</h3>
            <p className="text-xs text-gray-400">
              {settings.enabled ? `Current: ${previewText}` : 'Disabled'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.enabled}
              onChange={(e) => {
                e.stopPropagation();
                onUpdate({ enabled: e.target.checked });
              }}
              className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-gray-800"
            />
            <span className="text-sm text-gray-300">Enable</span>
          </label>
          {isExpanded ? (
            <ChevronUp size={20} className="text-gray-400" />
          ) : (
            <ChevronDown size={20} className="text-gray-400" />
          )}
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && settings.enabled && (
        <div className="p-4 pt-0 space-y-4 border-t border-white/5">
          {/* Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['barcode', 'datamatrix', 'qrcode', 'text'] as SerializationType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => handleTypeChange(type)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    settings.type === type
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Format
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['numeric', 'alphanumeric', 'custom'] as SerializationFormat[]).map((format) => (
                <button
                  key={format}
                  onClick={() => handleFormatChange(format)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    settings.format === format
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {format.charAt(0).toUpperCase() + format.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Prefix and Suffix */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Prefix
              </label>
              <input
                type="text"
                value={settings.prefix}
                onChange={(e) => onUpdate({ prefix: e.target.value })}
                placeholder="e.g., SN-"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Suffix
              </label>
              <input
                type="text"
                value={settings.suffix}
                onChange={(e) => onUpdate({ suffix: e.target.value })}
                placeholder="e.g., -2026"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Number Controls */}
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Start Number
              </label>
              <input
                type="number"
                value={settings.startNumber}
                onChange={(e) => onUpdate({ startNumber: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Current Number
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={settings.currentNumber}
                  onChange={(e) => onUpdate({ currentNumber: parseInt(e.target.value) || 0 })}
                  className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  onClick={decrementNumber}
                  className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors"
                  title="Decrement"
                >
                  <Minus size={16} />
                </button>
                <button
                  onClick={incrementNumber}
                  className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors"
                  title="Increment"
                >
                  <Plus size={16} />
                </button>
                <button
                  onClick={resetNumber}
                  className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors"
                  title="Reset to start"
                >
                  <RotateCcw size={16} />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Increment By
              </label>
              <input
                type="number"
                value={settings.increment}
                onChange={(e) => onUpdate({ increment: parseInt(e.target.value) || 1 })}
                min="1"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Custom Pattern (if format is custom) */}
          {settings.format === 'custom' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Custom Pattern
              </label>
              <input
                type="text"
                value={settings.customPattern || ''}
                onChange={(e) => onUpdate({ customPattern: e.target.value })}
                placeholder="Use {N} for number, e.g., BATCH-{N}-A"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <p className="text-xs text-gray-400 mt-1">
                Use {'{N}'} as placeholder for the number
              </p>
            </div>
          )}

          {/* Position and Size */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                X Position (mm)
              </label>
              <input
                type="number"
                value={settings.x}
                onChange={(e) => onUpdate({ x: parseFloat(e.target.value) || 0 })}
                step="0.1"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Y Position (mm)
              </label>
              <input
                type="number"
                value={settings.y}
                onChange={(e) => onUpdate({ y: parseFloat(e.target.value) || 0 })}
                step="0.1"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Width (mm)
              </label>
              <input
                type="number"
                value={settings.width}
                onChange={(e) => onUpdate({ width: parseFloat(e.target.value) || 10 })}
                step="0.1"
                min="5"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Height (mm)
              </label>
              <input
                type="number"
                value={settings.height}
                onChange={(e) => onUpdate({ height: parseFloat(e.target.value) || 10 })}
                step="0.1"
                min="5"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Preview */}
          <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
            <p className="text-xs text-gray-400 mb-1">Preview:</p>
            <p className="text-lg font-mono text-emerald-400 font-bold">{previewText}</p>
          </div>

          {/* Generate Button */}
          <button
            onClick={onGenerate}
            disabled={!isConnected}
            className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all ${
              isConnected
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Play size={18} />
            Generate & Engrave
          </button>
          
          {!isConnected && (
            <p className="text-xs text-center text-red-400">
              Connect to machine to generate serialization
            </p>
          )}
        </div>
      )}
    </div>
  );
}
