/**
 * Generates accurate real-world GPS-derived centerline SVG paths for circuits.
 * Matches the 850x520 canvas with 45px padding.
 */
import fs from 'fs';
import path from 'path';

const SVG_W = 850;
const SVG_H = 520;
const PAD = 45;

function normaliseAndPath(points: [number, number][], nPoints = 150): string {
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  for (const [x, y] of points) {
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  const rx = maxX - minX;
  const ry = maxY - minY;
  if (rx === 0 || ry === 0) return '';
  const scale = Math.min((SVG_W - 2 * PAD) / rx, (SVG_H - 2 * PAD) / ry);

  const nx = points.map(([x]) => PAD + (x - minX) * scale);
  const ny = points.map(([, y]) => PAD + (maxY - y) * scale);

  const currentNxMin = Math.min(...nx);
  const currentNxMax = Math.max(...nx);
  const currentNyMin = Math.min(...ny);
  const currentNyMax = Math.max(...ny);

  const xOffset = (SVG_W - (currentNxMax - currentNxMin)) / 2 - currentNxMin;
  const yOffset = (SVG_H - (currentNyMax - currentNyMin)) / 2 - currentNyMin;

  const finalX = nx.map(x => x + xOffset);
  const finalY = ny.map(y => y + yOffset);

  // Interpolate / downsample to nPoints
  const resultPts: string[] = [];
  for (let i = 0; i < nPoints; i++) {
    const idx = Math.round((i / (nPoints - 1)) * (points.length - 1));
    resultPts.push(`${finalX[idx].toFixed(1)},${finalY[idx].toFixed(1)}`);
  }
  return 'M ' + resultPts.join(' L ') + ' Z';
}

console.log('Generating accurate circuit paths...');
