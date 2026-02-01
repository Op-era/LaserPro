import React, { useState, useMemo } from 'react';
import { X, Search, Scissors, Layers, Zap, Flame, CheckCircle } from 'lucide-react';
import { MaterialPreset, LaserSourceType, EngraverSettings } from './types';
import { getMaterialLibrary, searchMaterials, MaterialCategory } from './utils/materialLibrary';

interface MaterialBrowserProps {
  onClose: () => void;
  onSelectMaterial: (material: MaterialPreset) => void;
  laserType: LaserSourceType;
  currentSettings: EngraverSettings;
}

export default function MaterialBrowser({ 
  onClose, 
  onSelectMaterial, 
  laserType,
  currentSettings 
}: MaterialBrowserProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | 'all'>('all');
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialPreset | null>(null);

  const categories = useMemo(() => getMaterialLibrary(laserType), [laserType]);
  
  const filteredMaterials = useMemo(() => {
    if (searchQuery) {
      return searchMaterials(searchQuery, laserType);
    }
    
    if (selectedCategory === 'all') {
      return categories.flatMap(cat => cat.materials);
    }
    
    const category = categories.find(c => c.name === selectedCategory);
    return category?.materials || [];
  }, [searchQuery, selectedCategory, laserType, categories]);

  const handleSelect = (material: MaterialPreset) => {
    setSelectedMaterial(material);
  };

  const handleApply = () => {
    if (selectedMaterial) {
      onSelectMaterial(selectedMaterial);
      onClose();
    }
  };

  const getJobTypeIcon = (jobType?: 'etch' | 'cut') => {
    if (jobType === 'cut') return '✂️';
    if (jobType === 'etch') return '🖊️';
    return '⚡';
  };

  const getJobTypeColor = (jobType?: 'etch' | 'cut') => {
    if (jobType === 'cut') return 'text-red-400';
    if (jobType === 'etch') return 'text-emerald-400';
    return 'text-blue-400';
  };

  return (
    <div className="fixed inset-0 z-[500] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
      <div className="bg-[#0d1218] border border-white/10 rounded-3xl max-w-6xl w-full max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tight text-white flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl">
                <Scissors size={24} className="text-white" />
              </div>
              Material Library
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Select material and thickness for optimized cutting/engraving
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
              placeholder="Search materials by name or type..."
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
              All Materials
            </button>
            {categories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${
                  selectedCategory === cat.name
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Materials Grid */}
        <div className="flex-1 overflow-y-auto p-6 custom-scroll">
          {filteredMaterials.length === 0 ? (
            <div className="text-center py-12">
              <Search size={48} className="mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400 text-lg">No materials found</p>
              <p className="text-gray-500 text-sm mt-2">Try a different search or category</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {filteredMaterials.map((material) => (
                <button
                  key={material.id}
                  onClick={() => handleSelect(material)}
                  className={`group relative bg-gradient-to-br from-white/5 to-white/[0.02] hover:from-emerald-500/20 hover:to-emerald-600/10 border rounded-2xl p-4 transition-all text-left ${
                    selectedMaterial?.id === material.id
                      ? 'border-emerald-500/60 ring-2 ring-emerald-500/30'
                      : 'border-white/10 hover:border-emerald-500/40'
                  }`}
                >
                  {/* Selected Check */}
                  {selectedMaterial?.id === material.id && (
                    <div className="absolute top-3 right-3">
                      <CheckCircle size={20} className="text-emerald-400" fill="currentColor" />
                    </div>
                  )}

                  {/* Material Info */}
                  <div className="space-y-2">
                    {/* Name and Job Type */}
                    <div className="flex items-start justify-between gap-2 pr-6">
                      <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                        {material.name}
                      </h3>
                      <span className={`text-lg ${getJobTypeColor(material.settings.jobType)}`}>
                        {getJobTypeIcon(material.settings.jobType)}
                      </span>
                    </div>

                    {/* Description */}
                    {material.description && (
                      <p className="text-xs text-gray-500 line-clamp-2">
                        {material.description}
                      </p>
                    )}

                    {/* Specs Grid */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
                      {/* Thickness */}
                      {material.thickness && (
                        <div className="flex items-center gap-2">
                          <Layers size={12} className="text-blue-400" />
                          <span className="text-xs text-gray-400">
                            {material.thickness}mm thick
                          </span>
                        </div>
                      )}

                      {/* Power */}
                      {material.settings.laserPower && (
                        <div className="flex items-center gap-2">
                          <Zap size={12} className="text-yellow-400" />
                          <span className="text-xs text-gray-400">
                            {material.settings.laserPower / 10}% power
                          </span>
                        </div>
                      )}

                      {/* Speed */}
                      {material.settings.feedRate && (
                        <div className="flex items-center gap-2">
                          <Flame size={12} className="text-orange-400" />
                          <span className="text-xs text-gray-400">
                            {material.settings.feedRate} mm/min
                          </span>
                        </div>
                      )}

                      {/* Passes */}
                      {material.settings.passes && (
                        <div className="flex items-center gap-2">
                          <Scissors size={12} className="text-red-400" />
                          <span className="text-xs text-gray-400">
                            {material.settings.passes} pass{material.settings.passes > 1 ? 'es' : ''}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer with Selected Material Details */}
        {selectedMaterial && (
          <div className="p-6 border-t border-white/10 bg-gradient-to-t from-[#0a0e13] to-transparent">
            <div className="mb-4 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
              <div className="text-sm font-bold text-emerald-400 mb-2">Selected Material Settings:</div>
              <div className="grid grid-cols-4 gap-4 text-xs">
                <div>
                  <div className="text-gray-500">Job Type</div>
                  <div className="text-white font-bold mt-1">
                    {selectedMaterial.settings.jobType === 'cut' ? '✂️ Cut' : '🖊️ Etch'}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500">Power</div>
                  <div className="text-white font-bold mt-1">
                    {selectedMaterial.settings.laserPower ? `${selectedMaterial.settings.laserPower / 10}%` : 'N/A'}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500">Speed</div>
                  <div className="text-white font-bold mt-1">
                    {selectedMaterial.settings.feedRate ? `${selectedMaterial.settings.feedRate} mm/min` : 'N/A'}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500">Passes</div>
                  <div className="text-white font-bold mt-1">
                    {selectedMaterial.settings.passes || 1}×
                  </div>
                </div>
              </div>
              {selectedMaterial.minPower && selectedMaterial.maxPower && (
                <div className="mt-3 text-xs text-gray-400">
                  Recommended power range: {selectedMaterial.minPower / 10}% - {selectedMaterial.maxPower / 10}%
                </div>
              )}
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">
                {filteredMaterials.length} material{filteredMaterials.length !== 1 ? 's' : ''} available
              </p>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-bold text-gray-300 hover:text-white transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApply}
                  disabled={!selectedMaterial}
                  className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                    selectedMaterial
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg shadow-emerald-500/30'
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Apply Settings
                </button>
              </div>
            </div>
          </div>
        )}

        {!selectedMaterial && (
          <div className="p-6 border-t border-white/10 bg-gradient-to-t from-[#0a0e13] to-transparent">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">
                {filteredMaterials.length} material{filteredMaterials.length !== 1 ? 's' : ''} available
              </p>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-bold text-gray-300 hover:text-white transition-all"
              >
                Close
              </button>
            </div>
          </div>
        )}
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
