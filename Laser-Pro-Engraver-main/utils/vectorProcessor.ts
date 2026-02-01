import { Point } from '../types';

/**
 * Basic DXF parser for LINE and LWPOLYLINE entities.
 * Converts vector data into a rasterized data URL to fit the existing image pipeline.
 */
export async function dxfToDataUrl(dxfText: string, width: number = 1000, height: number = 1000): Promise<string> {
  const lines = dxfText.split(/\r?\n/);
  const entities: { type: string; points: Point[] }[] = [];
  
  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();
    if (line === '0') {
      const type = lines[i + 1]?.trim();
      if (type === 'LINE') {
        const p: Point[] = [{ x: 0, y: 0 }, { x: 0, y: 0 }];
        i += 2;
        while (i < lines.length && lines[i].trim() !== '0') {
          const code = lines[i].trim();
          const val = parseFloat(lines[i + 1]);
          if (code === '10') p[0].x = val;
          if (code === '20') p[0].y = val;
          if (code === '11') p[1].x = val;
          if (code === '21') p[1].y = val;
          i += 2;
        }
        entities.push({ type: 'LINE', points: p });
        continue;
      } else if (type === 'LWPOLYLINE') {
        const pts: Point[] = [];
        let currentPt: Partial<Point> = {};
        i += 2;
        while (i < lines.length && lines[i].trim() !== '0') {
          const code = lines[i].trim();
          const val = parseFloat(lines[i + 1]);
          if (code === '10') currentPt.x = val;
          if (code === '20') {
            currentPt.y = val;
            pts.push({ x: currentPt.x!, y: currentPt.y! });
          }
          i += 2;
        }
        entities.push({ type: 'LWPOLYLINE', points: pts });
        continue;
      }
    }
    i++;
  }

  if (entities.length === 0) throw new Error("No supported DXF entities found (LINE, LWPOLYLINE).");

  // Calculate Bounds
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  entities.forEach(e => e.points.forEach(p => {
    minX = Math.min(minX, p.x); minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x); maxY = Math.max(maxY, p.y);
  }));

  const dxfW = maxX - minX || 1;
  const dxfH = maxY - minY || 1;
  const aspect = dxfW / dxfH;
  
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, width, height);
  
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const scale = Math.min(width / dxfW, height / dxfH) * 0.9;
  const offX = (width - dxfW * scale) / 2;
  const offY = (height - dxfH * scale) / 2;

  entities.forEach(e => {
    ctx.beginPath();
    e.points.forEach((p, idx) => {
      const px = (p.x - minX) * scale + offX;
      const py = height - ((p.y - minY) * scale + offY); // DXF Y is usually up
      if (idx === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.stroke();
  });

  return canvas.toDataURL('image/png');
}
