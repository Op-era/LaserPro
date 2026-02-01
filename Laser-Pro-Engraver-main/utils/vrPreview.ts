/**
 * VR/AR Preview - Phase 3 Feature
 * Virtual and augmented reality preview capabilities
 */

export interface VRScene {
  workpiece: {
    width: number;
    height: number;
    thickness: number;
    material: string;
  };
  paths: Array<{ x: number; y: number; z: number }[]>;
  camera: {
    position: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number };
  };
}

export interface ARPreviewSettings {
  showGrid: boolean;
  showDimensions: boolean;
  showToolPath: boolean;
  transparency: number; // 0-1
  scale: number;
}

export interface PreviewFrame {
  timestamp: number;
  laserPosition: { x: number; y: number };
  progress: number; // 0-1
  currentPath: number;
}

/**
 * Generate VR scene data for WebXR preview
 */
export function generateVRScene(
  workpiece: { width: number; height: number; thickness: number; material: string },
  paths: Array<{ x: number; y: number }[]>
): VRScene {
  // Convert 2D paths to 3D scene
  const paths3D = paths.map(path =>
    path.map(point => ({
      x: point.x,
      y: point.y,
      z: 0, // On workpiece surface
    }))
  );
  
  return {
    workpiece,
    paths: paths3D,
    camera: {
      position: { x: workpiece.width / 2, y: workpiece.height / 2, z: 300 },
      rotation: { x: -30, y: 0, z: 0 },
    },
  };
}

/**
 * Generate AR marker data for physical alignment
 */
export function generateARMarkers(
  workpieceCorners: Array<{ x: number; y: number }>
): Array<{ id: string; position: { x: number; y: number }; size: number }> {
  return workpieceCorners.map((corner, index) => ({
    id: `marker-${index}`,
    position: corner,
    size: 20, // mm
  }));
}

/**
 * Simulate laser path animation for preview
 */
export function* animateLaserPath(
  paths: Array<{ x: number; y: number }[]>,
  speed: number // mm/s
): Generator<PreviewFrame> {
  let totalTime = 0;
  const totalLength = calculateTotalPathLength(paths);
  
  for (let pathIndex = 0; pathIndex < paths.length; pathIndex++) {
    const path = paths[pathIndex];
    
    for (let i = 1; i < path.length; i++) {
      const segment = {
        start: path[i - 1],
        end: path[i],
      };
      
      const segmentLength = Math.sqrt(
        Math.pow(segment.end.x - segment.start.x, 2) +
        Math.pow(segment.end.y - segment.start.y, 2)
      );
      
      const segmentTime = segmentLength / speed;
      const steps = Math.max(10, Math.floor(segmentTime * 10)); // 10 fps
      
      for (let step = 0; step <= steps; step++) {
        const t = step / steps;
        const position = {
          x: segment.start.x + (segment.end.x - segment.start.x) * t,
          y: segment.start.y + (segment.end.y - segment.start.y) * t,
        };
        
        totalTime += segmentTime / steps;
        const progress = totalTime / (totalLength / speed);
        
        yield {
          timestamp: totalTime * 1000, // Convert to ms
          laserPosition: position,
          progress: Math.min(1, progress),
          currentPath: pathIndex,
        };
      }
    }
  }
}

/**
 * Export scene for WebXR viewer
 */
export function exportForWebXR(scene: VRScene): string {
  // Generate basic glTF-like JSON structure
  const webxrData = {
    scene: 0,
    scenes: [
      {
        name: 'Laser Preview Scene',
        nodes: [0, 1],
      },
    ],
    nodes: [
      {
        name: 'Workpiece',
        mesh: 0,
        translation: [0, 0, 0],
      },
      {
        name: 'Laser Paths',
        mesh: 1,
        translation: [0, 0, 0.1], // Slightly above workpiece
      },
    ],
    meshes: [
      {
        name: 'Workpiece',
        primitives: [
          {
            attributes: {
              POSITION: 0,
            },
            material: 0,
          },
        ],
      },
      {
        name: 'Paths',
        primitives: [
          {
            attributes: {
              POSITION: 1,
            },
            mode: 1, // LINES
            material: 1,
          },
        ],
      },
    ],
    materials: [
      {
        name: 'Wood Material',
        pbrMetallicRoughness: {
          baseColorFactor: [0.6, 0.4, 0.2, 1.0],
          metallicFactor: 0.0,
          roughnessFactor: 0.8,
        },
      },
      {
        name: 'Laser Path Material',
        pbrMetallicRoughness: {
          baseColorFactor: [1.0, 0.0, 0.0, 1.0],
          metallicFactor: 0.0,
          roughnessFactor: 0.5,
        },
        emissiveFactor: [1.0, 0.3, 0.0],
      },
    ],
  };
  
  return JSON.stringify(webxrData, null, 2);
}

/**
 * Calculate optimal camera position for preview
 */
export function calculateOptimalCameraPosition(
  workpiece: { width: number; height: number; thickness: number }
): { position: { x: number; y: number; z: number }; target: { x: number; y: number; z: number } } {
  const maxDim = Math.max(workpiece.width, workpiece.height);
  const distance = maxDim * 1.5;
  
  return {
    position: {
      x: workpiece.width / 2,
      y: workpiece.height / 2 + distance * 0.5,
      z: distance,
    },
    target: {
      x: workpiece.width / 2,
      y: workpiece.height / 2,
      z: workpiece.thickness / 2,
    },
  };
}

/**
 * Generate preview texture from burn simulation
 */
export function generateBurnPreviewTexture(
  paths: Array<{ x: number; y: number }[]>,
  width: number,
  height: number,
  resolution: number = 1 // pixels per mm
): ImageData | null {
  if (typeof document === 'undefined') {
    // Not in browser environment
    return null;
  }
  
  const canvas = document.createElement('canvas');
  canvas.width = width * resolution;
  canvas.height = height * resolution;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) return null;
  
  // Fill with wood texture color
  ctx.fillStyle = '#D2B48C';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw burned paths
  ctx.strokeStyle = '#2C1810';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  paths.forEach(path => {
    ctx.beginPath();
    path.forEach((point, i) => {
      const x = point.x * resolution;
      const y = point.y * resolution;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();
  });
  
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

// Helper function
function calculateTotalPathLength(paths: Array<{ x: number; y: number }[]>): number {
  let total = 0;
  for (const path of paths) {
    for (let i = 1; i < path.length; i++) {
      const dx = path[i].x - path[i - 1].x;
      const dy = path[i].y - path[i - 1].y;
      total += Math.sqrt(dx * dx + dy * dy);
    }
  }
  return total;
}
