import { MaterialPreset, LaserSourceType } from '../types';

/**
 * Comprehensive Material Library with Thickness Guidelines
 * Based on industry standards and common laser engraving practices
 */

export interface MaterialCategory {
  name: string;
  materials: MaterialPreset[];
}

/**
 * Calculate recommended cutting passes based on material thickness
 * Supports both signatures for compatibility:
 * - calculateCuttingPasses(thickness, laserType)
 * - calculateCuttingPasses(laserType, materialType, thickness)
 */
export function calculateCuttingPasses(
  thicknessOrLaserType: number | LaserSourceType, 
  laserTypeOrMaterialType?: LaserSourceType | string, 
  thicknessParam?: number
): number {
  let thickness: number;
  let laserType: LaserSourceType;
  
  if (typeof thicknessOrLaserType === 'string' && thicknessParam !== undefined) {
    // Called as calculateCuttingPasses(laserType, materialType, thickness)
    laserType = thicknessOrLaserType as LaserSourceType;
    thickness = thicknessParam;
  } else if (typeof thicknessOrLaserType === 'number') {
    // Called as calculateCuttingPasses(thickness, laserType)
    thickness = thicknessOrLaserType;
    laserType = laserTypeOrMaterialType as LaserSourceType;
  } else {
    // Invalid parameters - return default
    return 1;
  }
  
  if (laserType === 'co2') {
    // CO2 lasers are more powerful for cutting
    if (thickness <= 3) return 1;
    if (thickness <= 6) return 2;
    if (thickness <= 10) return 3;
    return Math.ceil(thickness / 3);
  } else if (laserType === 'fiber') {
    // Fiber lasers are best for metal marking
    return 1; // Typically marking only
  } else {
    // Diode lasers require more passes
    if (thickness <= 1) return 2;
    if (thickness <= 3) return 4;
    if (thickness <= 5) return 6;
    return Math.ceil(thickness * 1.5);
  }
}

/**
 * Get material library for specific laser type
 */
export function getMaterialLibrary(laserType: LaserSourceType): MaterialCategory[] {
  const isDiode = laserType === 'diode';
  const isCO2 = laserType === 'co2';
  const isFiber = laserType === 'fiber';
  
  const categories: MaterialCategory[] = [];
  
  // WOOD MATERIALS
  if (isDiode || isCO2) {
    categories.push({
      name: 'Wood',
      materials: [
        {
          id: 'plywood-3mm-etch',
          name: 'Plywood 3mm (Etch)',
          thickness: 3,
          description: 'Standard plywood for engraving',
          settings: {
            jobType: 'etch',
            feedRate: isDiode ? 3000 : 6000,
            laserPower: isDiode ? 700 : 180,
            linesPerMm: 10,
            passes: 1
          },
          minPower: isDiode ? 500 : 150,
          maxPower: isDiode ? 900 : 250,
          recommendedPasses: 1
        },
        {
          id: 'plywood-3mm-cut',
          name: 'Plywood 3mm (Cut)',
          thickness: 3,
          description: 'Cut through 3mm plywood',
          settings: {
            jobType: 'cut',
            feedRate: isDiode ? 400 : 800,
            laserPower: isDiode ? 1000 : 300,
            linesPerMm: 5,
            passes: isDiode ? 4 : 2
          },
          minPower: isDiode ? 900 : 250,
          maxPower: isDiode ? 1000 : 350,
          recommendedPasses: isDiode ? 4 : 2
        },
        {
          id: 'plywood-5mm-cut',
          name: 'Plywood 5mm (Cut)',
          thickness: 5,
          description: 'Cut through 5mm plywood',
          settings: {
            jobType: 'cut',
            feedRate: isDiode ? 300 : 600,
            laserPower: isDiode ? 1000 : 350,
            linesPerMm: 5,
            passes: isDiode ? 6 : 3
          },
          minPower: isDiode ? 950 : 300,
          maxPower: isDiode ? 1000 : 400,
          recommendedPasses: isDiode ? 6 : 3
        },
        {
          id: 'basswood-etch',
          name: 'Basswood (Etch)',
          thickness: 3,
          description: 'Soft wood, excellent for detailed engraving',
          settings: {
            jobType: 'etch',
            feedRate: isDiode ? 3500 : 7000,
            laserPower: isDiode ? 600 : 150,
            linesPerMm: 12,
            passes: 1
          },
          minPower: isDiode ? 400 : 100,
          maxPower: isDiode ? 800 : 200,
          recommendedPasses: 1
        },
        {
          id: 'mdf-3mm-etch',
          name: 'MDF 3mm (Etch)',
          thickness: 3,
          description: 'Medium density fiberboard',
          settings: {
            jobType: 'etch',
            feedRate: isDiode ? 2800 : 5500,
            laserPower: isDiode ? 750 : 200,
            linesPerMm: 10,
            passes: 1
          },
          minPower: isDiode ? 600 : 150,
          maxPower: isDiode ? 900 : 250,
          recommendedPasses: 1
        }
      ]
    });
  }
  
  // ACRYLIC MATERIALS
  if (isDiode || isCO2) {
    categories.push({
      name: 'Acrylic',
      materials: [
        {
          id: 'acrylic-3mm-etch',
          name: 'Acrylic 3mm (Etch)',
          thickness: 3,
          description: 'Clear or colored acrylic engraving',
          settings: {
            jobType: 'etch',
            feedRate: isDiode ? 4000 : 8000,
            laserPower: isDiode ? 500 : 120,
            linesPerMm: 12,
            passes: 1
          },
          minPower: isDiode ? 300 : 80,
          maxPower: isDiode ? 700 : 180,
          recommendedPasses: 1
        },
        {
          id: 'acrylic-3mm-cut',
          name: 'Acrylic 3mm (Cut)',
          thickness: 3,
          description: 'Cut through 3mm acrylic',
          settings: {
            jobType: 'cut',
            feedRate: isDiode ? 500 : 1000,
            laserPower: isDiode ? 1000 : 280,
            linesPerMm: 5,
            passes: isDiode ? 5 : 2
          },
          minPower: isDiode ? 900 : 250,
          maxPower: isDiode ? 1000 : 320,
          recommendedPasses: isDiode ? 5 : 2
        },
        {
          id: 'acrylic-5mm-cut',
          name: 'Acrylic 5mm (Cut)',
          thickness: 5,
          description: 'Cut through 5mm acrylic',
          settings: {
            jobType: 'cut',
            feedRate: isDiode ? 350 : 800,
            laserPower: isDiode ? 1000 : 320,
            linesPerMm: 5,
            passes: isDiode ? 8 : 3
          },
          minPower: isDiode ? 950 : 300,
          maxPower: isDiode ? 1000 : 380,
          recommendedPasses: isDiode ? 8 : 3
        }
      ]
    });
  }
  
  // LEATHER MATERIALS
  if (isDiode || isCO2) {
    categories.push({
      name: 'Leather',
      materials: [
        {
          id: 'leather-etch',
          name: 'Leather (Etch)',
          thickness: 2,
          description: 'Natural or synthetic leather engraving',
          settings: {
            jobType: 'etch',
            feedRate: isDiode ? 2500 : 5000,
            laserPower: isDiode ? 600 : 150,
            linesPerMm: 10,
            passes: 1
          },
          minPower: isDiode ? 400 : 100,
          maxPower: isDiode ? 800 : 200,
          recommendedPasses: 1
        },
        {
          id: 'leather-cut',
          name: 'Leather (Cut)',
          thickness: 2,
          description: 'Cut through leather',
          settings: {
            jobType: 'cut',
            feedRate: isDiode ? 150 : 300,
            laserPower: isDiode ? 1000 : 250,
            linesPerMm: 5,
            passes: isDiode ? 3 : 2
          },
          minPower: isDiode ? 900 : 200,
          maxPower: isDiode ? 1000 : 300,
          recommendedPasses: isDiode ? 3 : 2
        }
      ]
    });
  }
  
  // STONE & CERAMIC
  if (isDiode || isFiber) {
    categories.push({
      name: 'Stone & Ceramic',
      materials: [
        {
          id: 'slate-etch',
          name: 'Slate (Etch)',
          thickness: 5,
          description: 'Natural slate tile engraving',
          settings: {
            jobType: 'etch',
            feedRate: isDiode ? 2000 : 3000,
            laserPower: isDiode ? 950 : 800,
            linesPerMm: 12,
            passes: 1,
            contrast: 30
          },
          minPower: isDiode ? 800 : 600,
          maxPower: isDiode ? 1000 : 1000,
          recommendedPasses: 1
        },
        {
          id: 'ceramic-etch',
          name: 'Ceramic Tile (Etch)',
          thickness: 6,
          description: 'Glazed ceramic tile',
          settings: {
            jobType: 'etch',
            feedRate: isDiode ? 1800 : 2500,
            laserPower: isDiode ? 1000 : 850,
            linesPerMm: 14,
            passes: 2
          },
          minPower: isDiode ? 900 : 700,
          maxPower: isDiode ? 1000 : 1000,
          recommendedPasses: 2
        }
      ]
    });
  }
  
  // METAL (Marking)
  if (isDiode || isFiber) {
    categories.push({
      name: 'Metal',
      materials: [
        {
          id: 'anodized-aluminum',
          name: 'Anodized Aluminum (Mark)',
          thickness: 1,
          description: 'Anodized aluminum marking',
          settings: {
            jobType: 'etch',
            feedRate: isFiber ? 1500 : 800,
            laserPower: isFiber ? 800 : 1000,
            linesPerMm: 18,
            passes: 1
          },
          minPower: isFiber ? 600 : 900,
          maxPower: isFiber ? 1000 : 1000,
          recommendedPasses: 1
        },
        {
          id: 'stainless-steel-coated',
          name: 'Stainless Steel (Coated)',
          thickness: 1,
          description: 'Cermark or similar coating required',
          settings: {
            jobType: 'etch',
            feedRate: 800,
            laserPower: 1000,
            linesPerMm: 18,
            passes: 2
          },
          minPower: 800,
          maxPower: 1000,
          recommendedPasses: 2
        },
        {
          id: 'brass-mark',
          name: 'Brass (Mark)',
          thickness: 1,
          description: 'Brass surface marking',
          settings: {
            jobType: 'etch',
            feedRate: isFiber ? 1200 : 700,
            laserPower: isFiber ? 900 : 1000,
            linesPerMm: 16,
            passes: 1
          },
          minPower: isFiber ? 700 : 950,
          maxPower: isFiber ? 1000 : 1000,
          recommendedPasses: 1
        }
      ]
    });
  }
  
  // PAPER & CARDBOARD
  if (isDiode || isCO2) {
    categories.push({
      name: 'Paper & Cardboard',
      materials: [
        {
          id: 'cardstock-etch',
          name: 'Cardstock (Etch)',
          thickness: 0.3,
          description: 'Heavy paper/cardstock engraving',
          settings: {
            jobType: 'etch',
            feedRate: isDiode ? 4000 : 8000,
            laserPower: isDiode ? 300 : 80,
            linesPerMm: 12,
            passes: 1
          },
          minPower: isDiode ? 200 : 50,
          maxPower: isDiode ? 500 : 120,
          recommendedPasses: 1
        },
        {
          id: 'cardboard-2mm-cut',
          name: 'Cardboard 2mm (Cut)',
          thickness: 2,
          description: 'Cut through corrugated cardboard',
          settings: {
            jobType: 'cut',
            feedRate: isDiode ? 600 : 1200,
            laserPower: isDiode ? 800 : 200,
            linesPerMm: 5,
            passes: isDiode ? 2 : 1
          },
          minPower: isDiode ? 600 : 150,
          maxPower: isDiode ? 1000 : 250,
          recommendedPasses: isDiode ? 2 : 1
        }
      ]
    });
  }
  
  // FABRIC
  if (isDiode || isCO2) {
    categories.push({
      name: 'Fabric',
      materials: [
        {
          id: 'felt-cut',
          name: 'Felt (Cut)',
          thickness: 3,
          description: 'Synthetic or wool felt',
          settings: {
            jobType: 'cut',
            feedRate: isDiode ? 800 : 1500,
            laserPower: isDiode ? 700 : 180,
            linesPerMm: 5,
            passes: 1
          },
          minPower: isDiode ? 500 : 120,
          maxPower: isDiode ? 900 : 250,
          recommendedPasses: 1
        },
        {
          id: 'denim-etch',
          name: 'Denim (Etch)',
          thickness: 1,
          description: 'Denim fabric engraving',
          settings: {
            jobType: 'etch',
            feedRate: isDiode ? 2000 : 4000,
            laserPower: isDiode ? 600 : 150,
            linesPerMm: 10,
            passes: 1
          },
          minPower: isDiode ? 400 : 100,
          maxPower: isDiode ? 800 : 200,
          recommendedPasses: 1
        }
      ]
    });
  }
  
  return categories;
}

/**
 * Search materials by name or description
 */
export function searchMaterials(
  query: string,
  laserType: LaserSourceType
): MaterialPreset[] {
  const library = getMaterialLibrary(laserType);
  const allMaterials = library.flatMap(cat => cat.materials);
  
  const lowerQuery = query.toLowerCase();
  return allMaterials.filter(mat => 
    mat.name.toLowerCase().includes(lowerQuery) ||
    mat.description?.toLowerCase().includes(lowerQuery) ||
    mat.id.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Get all materials flattened
 */
export function getAllMaterials(laserType: LaserSourceType): MaterialPreset[] {
  const library = getMaterialLibrary(laserType);
  return library.flatMap(cat => cat.materials);
}

/**
 * Get material by ID
 */
export function getMaterialById(
  id: string,
  laserType: LaserSourceType
): MaterialPreset | undefined {
  const allMaterials = getAllMaterials(laserType);
  return allMaterials.find(mat => mat.id === id);
}
