import fs from 'fs';
import path from 'path';

// Parse SVG path to array of points [x, y]
function getPathPoints(d: string): [number, number][] {
  const pts: [number, number][] = [];
  const matches = d.matchAll(/([0-9.]+),([0-9.]+)/g);
  for (const m of matches) {
    pts.push([parseFloat(m[1]), parseFloat(m[2])]);
  }
  return pts;
}

// Calculate curvature along path to detect natural corners
function detectKeyCorners(points: [number, number][], numCorners = 8) {
  const n = points.length;
  const curvatures: { index: number, angleChange: number, x: number, y: number, distancePct: number }[] = [];

  for (let i = 2; i < n - 2; i++) {
    const pPrev = points[i - 2];
    const pCurr = points[i];
    const pNext = points[i + 2];

    const v1x = pCurr[0] - pPrev[0];
    const v1y = pCurr[1] - pPrev[1];
    const v2x = pNext[0] - pCurr[0];
    const v2y = pNext[1] - pCurr[1];

    const dot = v1x * v2x + v1y * v2y;
    const mag1 = Math.sqrt(v1x * v1x + v1y * v1y);
    const mag2 = Math.sqrt(v2x * v2x + v2y * v2y);

    if (mag1 > 0 && mag2 > 0) {
      const cosAngle = Math.max(-1, Math.min(1, dot / (mag1 * mag2)));
      const angleChange = Math.acos(cosAngle);
      curvatures.push({
        index: i,
        angleChange,
        x: pCurr[0],
        y: pCurr[1],
        distancePct: parseFloat((i / (n - 1)).toFixed(2)),
      });
    }
  }

  // Sort by highest curvature, pick top corners spaced apart
  curvatures.sort((a, b) => b.angleChange - a.angleChange);
  const selected: typeof curvatures = [];
  for (const c of curvatures) {
    if (selected.length >= numCorners) break;
    const tooClose = selected.some(s => Math.abs(s.index - c.index) < 8);
    if (!tooClose) {
      selected.push(c);
    }
  }

  // Sort back by distancePct around lap
  selected.sort((a, b) => a.distancePct - b.distancePct);
  return selected.map((s, idx) => ({
    x: s.x,
    y: s.y,
    speed: Math.round(90 + (idx % 2 === 0 ? 30 : 120)), // realistic corner speeds
    distancePct: s.distancePct,
  }));
}

const circuitsJsonPath = path.join(process.cwd(), 'python_backend', 'circuit_paths.json');
const realPaths = JSON.parse(fs.readFileSync(circuitsJsonPath, 'utf-8'));

for (const [id, data] of Object.entries(realPaths)) {
  const pts = getPathPoints((data as any).pathData);
  (data as any).keyCoordinates = detectKeyCorners(pts, 8);
}

fs.writeFileSync(circuitsJsonPath, JSON.stringify(realPaths, null, 2), 'utf-8');
console.log('Enriched circuit_paths.json with keyCoordinates for all tracks.');
