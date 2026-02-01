import React, { useState } from 'react';
import { X, Search, BookOpen, Zap, Settings, Layers, AlertCircle } from 'lucide-react';

interface GlossaryProps {
  isOpen: boolean;
  onClose: () => void;
}

interface GlossaryEntry {
  term: string;
  category: 'basics' | 'settings' | 'features' | 'safety';
  definition: string;
  example?: string;
}

const glossaryEntries: GlossaryEntry[] = [
  {
    term: "G-code",
    category: "basics",
    definition: "A programming language used to control CNC machines and laser engravers. G-code commands tell the machine where to move, how fast, and when to turn the laser on/off.",
    example: "G0 X10 Y10 (move to position 10,10)"
  },
  {
    term: "Laser Power",
    category: "settings",
    definition: "The intensity of the laser beam, typically measured in percentage (0-100%) or as an S-value. Higher power creates deeper marks but may burn the material.",
    example: "Use 20% power for light engraving on wood, 80% for cutting"
  },
  {
    term: "Feed Rate",
    category: "settings",
    definition: "The speed at which the laser head moves, measured in mm/min. Slower speeds allow more time for the laser to mark the material, creating deeper burns.",
    example: "2500 mm/min for engraving photos, 500 mm/min for cutting"
  },
  {
    term: "Diode Laser",
    category: "basics",
    definition: "A type of laser that uses semiconductor diodes to generate the beam. Common in hobbyist laser engravers. Typically operates in the 405nm-450nm wavelength (blue-violet light).",
  },
  {
    term: "CO2 Laser",
    category: "basics",
    definition: "A gas laser that uses carbon dioxide as the lasing medium. Operates at 10,600nm wavelength (infrared). More powerful than diode lasers and can cut thicker materials.",
  },
  {
    term: "PPI (Pixels Per Inch)",
    category: "settings",
    definition: "Resolution setting that determines how many laser points per inch. Higher PPI creates more detailed images but takes longer to engrave.",
    example: "300-400 PPI is typical for photo engraving"
  },
  {
    term: "Lines Per MM",
    category: "settings",
    definition: "The spacing between scan lines in raster engraving. More lines per millimeter create smoother gradients but increase engraving time.",
    example: "16.6 lines/mm provides good balance of quality and speed"
  },
  {
    term: "M3 Mode",
    category: "settings",
    definition: "Constant power laser mode. The laser maintains the same power level regardless of movement speed. Good for cutting operations.",
  },
  {
    term: "M4 Mode",
    category: "settings",
    definition: "Dynamic power laser mode. Power adjusts based on movement speed to maintain consistent energy delivery. Essential for photo engraving to prevent burning during acceleration/deceleration.",
  },
  {
    term: "Raster Engraving",
    category: "features",
    definition: "Engraving method where the laser scans back and forth in lines, like a printer. Used for photos and filled areas. Creates grayscale images through power variation.",
  },
  {
    term: "Vector Engraving",
    category: "features",
    definition: "Engraving method where the laser follows paths/outlines. Used for cutting or outlining shapes. Produces crisp lines and edges.",
  },
  {
    term: "Dithering",
    category: "features",
    definition: "A technique to simulate grayscale in images by using patterns of on/off dots. Creates the illusion of shading without variable power.",
    example: "Floyd-Steinberg, Atkinson, and Ordered dithering are common algorithms"
  },
  {
    term: "Overscan",
    category: "settings",
    definition: "Extra distance the laser head travels beyond the image boundary before turning. Allows the head to reach full speed before engraving, preventing edge artifacts.",
    example: "2-3mm overscan is typical"
  },
  {
    term: "Power Gamma",
    category: "settings",
    definition: "A curve adjustment for laser power distribution. Compensates for the non-linear response of materials to laser power. Higher gamma brightens midtones.",
    example: "1.8-2.2 gamma works well for wood"
  },
  {
    term: "Spot Size",
    category: "basics",
    definition: "The diameter of the focused laser beam where it hits the material. Smaller spot sizes create finer detail. Typical diode laser spot is 0.06-0.1mm.",
  },
  {
    term: "Layer",
    category: "features",
    definition: "A separate element in your design that can have independent settings for power, speed, and processing. Layers execute in priority order.",
  },
  {
    term: "Material Preset",
    category: "features",
    definition: "Pre-configured settings optimized for specific materials (wood, acrylic, leather, etc.). Saves time and provides known-good starting points.",
  },
  {
    term: "Bidirectional Scanning",
    category: "settings",
    definition: "Engraving in both left-to-right and right-to-left passes. Faster than unidirectional but may show slight alignment artifacts on some machines.",
  },
  {
    term: "Air Assist",
    category: "features",
    definition: "A stream of compressed air directed at the laser focal point. Removes smoke, debris, and heat. Prevents flames and improves cut quality.",
  },
  {
    term: "Safety Goggles",
    category: "safety",
    definition: "Protective eyewear rated for your laser's wavelength (OD rating). Essential for preventing permanent eye damage. Blue diode lasers require OD5+ rated goggles.",
  },
  {
    term: "Scan Angle",
    category: "settings",
    definition: "The direction of raster scan lines in degrees. 0° is horizontal, 90° is vertical, 45° is diagonal. Different angles work better with different material grains.",
    example: "45° diagonal scanning hides scan lines and enhances contrast"
  },
  {
    term: "Path",
    category: "features",
    definition: "A series of points that define where the laser should move. Generated from images or vector data. Each path can have intensity, speed, and pass settings.",
  },
  {
    term: "Serial Port",
    category: "basics",
    definition: "A communication interface (USB-to-Serial) used to send commands from your computer to the laser controller. Appears as a COM port on Windows or /dev/tty on Linux/Mac.",
  },
  {
    term: "GRBL",
    category: "basics",
    definition: "An open-source motion control firmware for CNC machines and laser engravers. Interprets G-code commands and controls the stepper motors and laser.",
  },
  {
    term: "Halftone",
    category: "features",
    definition: "A printing technique that simulates continuous tones using dots of varying size or spacing. Creates newspaper-like photo effects.",
  },
  {
    term: "Passes",
    category: "settings",
    definition: "The number of times the laser repeats the same toolpath. Multiple passes create deeper marks without increasing power, reducing burn risk.",
    example: "Use 2-3 passes for deeper engraving or cutting"
  },
  {
    term: "Contrast",
    category: "settings",
    definition: "Adjustment that increases the difference between light and dark areas. Higher contrast makes shadows darker and highlights brighter.",
  },
  {
    term: "Gamma",
    category: "settings",
    definition: "Non-linear brightness adjustment that affects midtones more than blacks or whites. Used to compensate for how materials respond to laser power.",
  },
  {
    term: "Threshold",
    category: "settings",
    definition: "A value (0-255) that converts grayscale images to pure black and white. Pixels above the threshold become white, below become black.",
  }
];

export default function Glossary({ isOpen, onClose }: GlossaryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  if (!isOpen) return null;

  const filteredEntries = glossaryEntries.filter(entry => {
    const matchesSearch = entry.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.definition.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || entry.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categoryIcons = {
    basics: <BookOpen size={14} />,
    settings: <Settings size={14} />,
    features: <Layers size={14} />,
    safety: <AlertCircle size={14} />
  };

  const categoryColors = {
    basics: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    settings: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    features: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    safety: 'text-red-400 bg-red-500/10 border-red-500/20'
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-[#0d1218] border border-white/10 w-full max-w-5xl max-h-[90vh] rounded-3xl flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <header className="p-6 border-b border-white/5 flex items-center justify-between bg-emerald-500/5">
          <div className="flex items-center gap-3">
            <BookOpen className="text-emerald-500" size={24} />
            <div>
              <h2 className="text-lg font-black uppercase tracking-tighter italic">Terminology & Features</h2>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Searchable Reference Guide</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
            <X size={24} />
          </button>
        </header>

        {/* Search and Filter */}
        <div className="p-6 border-b border-white/5 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
              type="text"
              placeholder="Search terms, features, or definitions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:border-emerald-500 outline-none transition-all"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                selectedCategory === 'all' ? 'bg-emerald-500 text-black' : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              All Terms
            </button>
            {Object.entries(categoryIcons).map(([cat, icon]) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  selectedCategory === cat ? categoryColors[cat as keyof typeof categoryColors] : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                {icon}
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scroll">
          {filteredEntries.length > 0 ? (
            filteredEntries.map((entry, idx) => (
              <div key={idx} className="p-5 bg-white/5 rounded-2xl border border-white/5 space-y-3 hover:border-emerald-500/20 transition-all">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-lg font-black uppercase tracking-tight text-white">
                    {entry.term}
                  </h3>
                  <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase border ${categoryColors[entry.category]}`}>
                    {entry.category}
                  </span>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed">
                  {entry.definition}
                </p>
                {entry.example && (
                  <div className="p-3 bg-black/40 rounded-xl border border-white/5">
                    <p className="text-[10px] font-black text-emerald-400 uppercase mb-1">Example:</p>
                    <p className="text-xs text-gray-400 font-mono">{entry.example}</p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-20 space-y-2">
              <Search size={48} className="mx-auto text-gray-700" />
              <p className="text-gray-500 text-sm">No terms found matching your search</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="p-6 border-t border-white/5 bg-black/40 flex items-center justify-between">
          <p className="text-[10px] text-gray-500">
            {filteredEntries.length} of {glossaryEntries.length} terms
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
