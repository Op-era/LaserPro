
import { Point, Path } from '../types';

/**
 * Traces edges in a binarized ImageData array to generate vector paths.
 * Optimized for "Sketch Mode" and "Threshold" results.
 */
export function traceEdges(imageData: ImageData, scale: number): Point[][] {
  const { width, height, data } = imageData;
  const visited = new Uint8Array(width * height);
  const paths: Point[][] = [];

  // Helper to check if pixel is "ink" (thresholded/white in sketch mode)
  const isInk = (x: number, y: number) => {
    if (x < 0 || x >= width || y < 0 || y >= height) return false;
    const i = (y * width + x) * 4;
    return data[i] > 128; // Use R channel as proxy for binarized data
  };

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (isInk(x, y) && !visited[idx]) {
        // Start a new path
        const currentPath: Point[] = [];
        let cx = x;
        let cy = y;
        
        // Simple greedy neighbor search
        while (true) {
          visited[cy * width + cx] = 1;
          currentPath.push({ x: cx / scale, y: cy / scale });

          let found = false;
          // Look in 8 directions
          const neighbors = [
            [1, 0], [1, 1], [0, 1], [-1, 1],
            [-1, 0], [-1, -1], [0, -1], [1, -1]
          ];

          for (const [dx, dy] of neighbors) {
            const nx = cx + dx;
            const ny = cy + dy;
            if (isInk(nx, ny) && !visited[ny * width + nx]) {
              cx = nx;
              cy = ny;
              found = true;
              break;
            }
          }

          if (!found) break;
          if (currentPath.length > 5000) break; // Safety break
        }

        if (currentPath.length > 2) {
          paths.push(simplifyPath(currentPath, 0.5));
        }
      }
    }
  }

  return paths;
}

/**
 * Ramer-Douglas-Peucker simplification for path data reduction
 */
function simplifyPath(points: Point[], tolerance: number): Point[] {
  if (points.length <= 2) return points;

  let maxDist = 0;
  let index = 0;

  for (let i = 1; i < points.length - 1; i++) {
    const d = distToSegment(points[i], points[0], points[points.length - 1]);
    if (d > maxDist) {
      index = i;
      maxDist = d;
    }
  }

  if (maxDist > tolerance) {
    const res1 = simplifyPath(points.slice(0, index + 1), tolerance);
    const res2 = simplifyPath(points.slice(index), tolerance);
    return res1.concat(res2.slice(1));
  } else {
    return [points[0], points[points.length - 1]];
  }
}

function distToSegment(p: Point, v: Point, w: Point) {
  const l2 = Math.pow(v.x - w.x, 2) + Math.pow(v.y - w.y, 2);
  if (l2 === 0) return Math.sqrt(Math.pow(p.x - v.x, 2) + Math.pow(p.y - v.y, 2));
  let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.sqrt(Math.pow(p.x - (v.x + t * (w.x - v.x)), 2) + Math.pow(p.y - (v.y + t * (w.y - v.y)), 2));
}
