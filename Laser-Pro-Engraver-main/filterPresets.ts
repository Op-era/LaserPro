import { Layer } from './types';

export interface FilterPreset {
  id: string;
  name: string;
  description: string;
  category: 'artistic' | 'halftone' | 'pattern' | 'adjustment' | 'photo';
  thumbnail?: string;
  settings: Partial<Layer>;
}

/**
 * Professional Filter Presets Library
 * Quick-apply settings for common artistic effects
 */
export const FILTER_PRESETS: FilterPreset[] = [
  // ARTISTIC EFFECTS
  {
    id: 'oil-paint-soft',
    name: 'Soft Oil Painting',
    description: 'Gentle painterly effect, subtle brush strokes',
    category: 'artistic',
    settings: {
      artisticFilter: 'oil-painting',
      artisticStrength: 0.8,
      saturation: 10
    }
  },
  {
    id: 'oil-paint-bold',
    name: 'Bold Oil Painting',
    description: 'Strong painterly effect, dramatic',
    category: 'artistic',
    settings: {
      artisticFilter: 'oil-painting',
      artisticStrength: 1.5,
      contrast: 20,
      saturation: 15
    }
  },
  {
    id: 'watercolor',
    name: 'Watercolor',
    description: 'Soft, flowing watercolor effect',
    category: 'artistic',
    settings: {
      artisticFilter: 'watercolor',
      artisticStrength: 1.2,
      saturation: -10
    }
  },
  {
    id: 'pencil-light',
    name: 'Light Pencil Sketch',
    description: 'Delicate pencil drawing',
    category: 'artistic',
    settings: {
      artisticFilter: 'pencil',
      artisticStrength: 0.5,
      contrast: 10
    }
  },
  {
    id: 'pencil-dark',
    name: 'Dark Pencil Sketch',
    description: 'Bold pencil drawing with strong lines',
    category: 'artistic',
    settings: {
      artisticFilter: 'pencil',
      artisticStrength: 1.0,
      contrast: 30,
      brightness: -10
    }
  },
  {
    id: 'charcoal',
    name: 'Charcoal Drawing',
    description: 'High contrast charcoal effect',
    category: 'artistic',
    settings: {
      artisticFilter: 'charcoal',
      artisticStrength: 1.3,
      contrast: 40
    }
  },
  {
    id: 'engraving-fine',
    name: 'Fine Engraving',
    description: 'Classical book illustration style, fine lines',
    category: 'artistic',
    settings: {
      artisticFilter: 'engraving',
      artisticStrength: 1.5,
      contrast: 25
    }
  },
  {
    id: 'engraving-bold',
    name: 'Bold Engraving',
    description: 'Strong engraving with thick lines',
    category: 'artistic',
    settings: {
      artisticFilter: 'engraving',
      artisticStrength: 0.7,
      contrast: 35
    }
  },
  {
    id: 'stippling-fine',
    name: 'Fine Stippling',
    description: 'Pointillism with small dots',
    category: 'artistic',
    settings: {
      artisticFilter: 'stippling',
      artisticStrength: 1.5,
      contrast: 15
    }
  },
  {
    id: 'stippling-coarse',
    name: 'Coarse Stippling',
    description: 'Pointillism with larger dots',
    category: 'artistic',
    settings: {
      artisticFilter: 'stippling',
      artisticStrength: 0.8,
      contrast: 20
    }
  },

  // HALFTONE PRESETS
  {
    id: 'newspaper-classic',
    name: 'Classic Newspaper',
    description: 'Traditional newspaper halftone, 45° angle',
    category: 'halftone',
    settings: {
      textureMode: 'halftone',
      halftoneShape: 'circle',
      halftoneCellSize: 6,
      halftoneAngle: 45,
      contrast: 15
    }
  },
  {
    id: 'newspaper-fine',
    name: 'Fine Newspaper',
    description: 'High-resolution newspaper dots',
    category: 'halftone',
    settings: {
      textureMode: 'halftone',
      halftoneShape: 'circle',
      halftoneCellSize: 3,
      halftoneAngle: 45,
      contrast: 10
    }
  },
  {
    id: 'halftone-square',
    name: 'Square Halftone',
    description: 'Geometric square dot pattern',
    category: 'halftone',
    settings: {
      textureMode: 'halftone',
      halftoneShape: 'square',
      halftoneCellSize: 8,
      halftoneAngle: 0,
      contrast: 20
    }
  },
  {
    id: 'halftone-diamond',
    name: 'Diamond Pattern',
    description: 'Elegant diamond-shaped dots',
    category: 'halftone',
    settings: {
      textureMode: 'halftone',
      halftoneShape: 'diamond',
      halftoneCellSize: 7,
      halftoneAngle: 45,
      contrast: 15
    }
  },
  {
    id: 'halftone-line',
    name: 'Line Screen',
    description: 'Parallel line halftone effect',
    category: 'halftone',
    settings: {
      textureMode: 'halftone',
      halftoneShape: 'line',
      halftoneCellSize: 4,
      halftoneAngle: 45,
      contrast: 25
    }
  },
  {
    id: 'halftone-cross',
    name: 'Cross Pattern',
    description: 'Cross-shaped halftone dots',
    category: 'halftone',
    settings: {
      textureMode: 'halftone',
      halftoneShape: 'cross',
      halftoneCellSize: 8,
      halftoneAngle: 0,
      contrast: 20
    }
  },

  // PATTERN PRESETS
  {
    id: 'hatch-fine',
    name: 'Fine Hatch',
    description: 'Delicate parallel lines',
    category: 'pattern',
    settings: {
      textureMode: 'hatch',
      textureDensity: 1.5,
      textureAngle: 45,
      contrast: 10
    }
  },
  {
    id: 'crosshatch',
    name: 'Crosshatch',
    description: 'Classic crosshatch pattern',
    category: 'pattern',
    settings: {
      textureMode: 'crosshatch',
      textureDensity: 1.2,
      textureAngle: 45,
      contrast: 15
    }
  },
  {
    id: 'organic-flow',
    name: 'Organic Flow',
    description: 'Natural, flowing patterns',
    category: 'pattern',
    settings: {
      textureMode: 'organic',
      textureDensity: 1.0,
      textureAngle: 30,
      contrast: 10
    }
  },
  {
    id: 'sketchy-lines',
    name: 'Sketchy Lines',
    description: 'Hand-drawn sketch style',
    category: 'pattern',
    settings: {
      textureMode: 'sketchy',
      textureDensity: 1.3,
      textureAngle: 60,
      contrast: 20
    }
  },

  // PHOTO ENHANCEMENTS
  {
    id: 'photo-sharp',
    name: 'Sharp Photo',
    description: 'Enhanced sharpness for detail',
    category: 'photo',
    settings: {
      sharpen: 5,
      contrast: 15,
      gamma: 1.1
    }
  },
  {
    id: 'photo-soft',
    name: 'Soft Photo',
    description: 'Gentle softening effect',
    category: 'photo',
    settings: {
      blur: 2,
      contrast: -5,
      saturation: -10
    }
  },
  {
    id: 'photo-dramatic',
    name: 'Dramatic Photo',
    description: 'High contrast, bold look',
    category: 'photo',
    settings: {
      contrast: 40,
      gamma: 0.9,
      saturation: 20,
      edgeEnhancement: 3
    }
  },
  {
    id: 'vintage-print',
    name: 'Vintage Print',
    description: 'Old newspaper/magazine look',
    category: 'photo',
    settings: {
      contrast: 25,
      gamma: 1.2,
      saturation: -20,
      textureMode: 'halftone',
      halftoneShape: 'circle',
      halftoneCellSize: 8,
      halftoneAngle: 45
    }
  },

  // HIGH QUALITY ADJUSTMENTS
  {
    id: 'bright-clean',
    name: 'Bright & Clean',
    description: 'Light, airy engraving',
    category: 'adjustment',
    settings: {
      brightness: 20,
      contrast: -10,
      gamma: 1.2
    }
  },
  {
    id: 'dark-moody',
    name: 'Dark & Moody',
    description: 'Deep shadows, dramatic',
    category: 'adjustment',
    settings: {
      brightness: -15,
      contrast: 35,
      gamma: 0.8
    }
  },
  {
    id: 'high-key',
    name: 'High Key',
    description: 'Bright tones, minimal shadows',
    category: 'adjustment',
    settings: {
      brightness: 30,
      contrast: -20,
      gamma: 1.3,
      levelsLow: 30
    }
  },
  {
    id: 'low-key',
    name: 'Low Key',
    description: 'Dark tones, dramatic highlights',
    category: 'adjustment',
    settings: {
      brightness: -20,
      contrast: 50,
      gamma: 0.7,
      levelsHigh: 200
    }
  }
];

/**
 * Get presets by category
 */
export function getPresetsByCategory(category: FilterPreset['category']): FilterPreset[] {
  return FILTER_PRESETS.filter(p => p.category === category);
}

/**
 * Apply a preset to a layer
 */
export function applyPreset(layer: Layer, presetId: string): Layer {
  const preset = FILTER_PRESETS.find(p => p.id === presetId);
  if (!preset) return layer;
  
  return {
    ...layer,
    ...preset.settings
  };
}

/**
 * Get all unique categories
 */
export function getCategories(): Array<{
  id: FilterPreset['category'];
  name: string;
  icon: string;
}> {
  return [
    { id: 'artistic', name: 'Artistic Effects', icon: '🎨' },
    { id: 'halftone', name: 'Halftone & Newspaper', icon: '⬤' },
    { id: 'pattern', name: 'Pattern Fills', icon: '▦' },
    { id: 'photo', name: 'Photo Enhancement', icon: '📷' },
    { id: 'adjustment', name: 'Tone Adjustments', icon: '⚡' }
  ];
}
