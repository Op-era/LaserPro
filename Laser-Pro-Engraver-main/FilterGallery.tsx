import React, { useState } from 'react';
import { X, Search, Sparkles, Grid3x3, Palette, Camera, Zap } from 'lucide-react';
import { Layer } from './types';
import { FILTER_PRESETS, getCategories, applyPreset, FilterPreset } from './filterPresets';

interface FilterGalleryProps {
  onClose: () => void;
  onApplyPreset: (presetId: string) => void;
  selectedLayer: Layer | null;
}

export default function FilterGallery({ onClose, onApplyPreset, selectedLayer }: FilterGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<FilterPreset['category'] | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const categories = getCategories();

  const filteredPresets = FILTER_PRESETS.filter(preset => {
    const matchesCategory = selectedCategory === 'all' || preset.category === selectedCategory;
    const matchesSearch = preset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         preset.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'artistic': return <Sparkles size={16} />;
      case 'halftone': return <Grid3x3 size={16} />;
      case 'pattern': return <Palette size={16} />;
      case 'photo': return <Camera size={16} />;
      case 'adjustment': return <Zap size={16} />;
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[500] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
      <div className="bg-[#0d1218] border border-white/10 rounded-3xl max-w-5xl w-full max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tight text-white flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl">
                <Sparkles size={24} className="text-white" />
              </div>
              Filter Gallery
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              {selectedLayer ? `Applying to: ${selectedLayer.name}` : 'Select a layer first'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors text-gray-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        {/* Search and Category Tabs */}
        <div className="p-6 border-b border-white/10 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
              type="text"
              placeholder="Search filters..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[#151921] border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:border-emerald-500/50 focus:outline-none"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${
                selectedCategory === 'all'
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              All Filters
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all flex items-center gap-2 ${
                  selectedCategory === cat.id
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span>{cat.icon}</span>
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Presets Grid */}
        <div className="flex-1 overflow-y-auto p-6 custom-scroll">
          {!selectedLayer ? (
            <div className="text-center py-12">
              <Sparkles size={48} className="mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400 text-lg">Select a layer first to apply filters</p>
            </div>
          ) : filteredPresets.length === 0 ? (
            <div className="text-center py-12">
              <Search size={48} className="mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400 text-lg">No filters found</p>
              <p className="text-gray-500 text-sm mt-2">Try a different search or category</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {filteredPresets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => {
                    onApplyPreset(preset.id);
                    onClose();
                  }}
                  className="group relative bg-gradient-to-br from-white/5 to-white/[0.02] hover:from-emerald-500/20 hover:to-emerald-600/10 border border-white/10 hover:border-emerald-500/40 rounded-2xl p-4 transition-all text-left"
                >
                  {/* Category Badge */}
                  <div className="absolute top-3 right-3 p-1.5 bg-black/40 rounded-lg text-gray-400">
                    {getCategoryIcon(preset.category)}
                  </div>

                  {/* Preset Icon/Preview */}
                  <div className="mb-3 h-20 bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl flex items-center justify-center border border-white/5">
                    <span className="text-3xl opacity-60 group-hover:opacity-100 transition-opacity">
                      {preset.category === 'artistic' && '🎨'}
                      {preset.category === 'halftone' && '⬤'}
                      {preset.category === 'pattern' && '▦'}
                      {preset.category === 'photo' && '📷'}
                      {preset.category === 'adjustment' && '⚡'}
                    </span>
                  </div>

                  {/* Preset Info */}
                  <div>
                    <h3 className="text-sm font-bold text-white mb-1 group-hover:text-emerald-400 transition-colors">
                      {preset.name}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-2">
                      {preset.description}
                    </p>
                  </div>

                  {/* Hover Effect */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/0 to-emerald-600/0 group-hover:from-emerald-500/10 group-hover:to-emerald-600/5 transition-all pointer-events-none" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 bg-gradient-to-t from-[#0a0e13] to-transparent">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">
              {filteredPresets.length} filter{filteredPresets.length !== 1 ? 's' : ''} available
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-bold text-gray-300 hover:text-white transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scroll::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: #0a0e13;
          border-radius: 4px;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: #1f2937;
          border-radius: 4px;
        }
        .custom-scroll::-webkit-scrollbar-thumb:hover {
          background: #374151;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
