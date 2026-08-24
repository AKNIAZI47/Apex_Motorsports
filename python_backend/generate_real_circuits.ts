import https from 'https';
import fs from 'fs';
import path from 'path';

const SVG_W = 850;
const SVG_H = 520;
const PAD = 45;

function fetchUrl(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'NodeJS-App' } }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function extractPathD(svgContent: string): string {
  const match = svgContent.match(/<path[^>]*\bd="([^"]+)"/i);
  return match ? match[1] : '';
}

function tokenizePath(d: string): string[] {
  const tokens: string[] = [];
  // Match commands or numbers (including negative numbers and floats without leading zero like .328 or -.797)
  const regex = /([a-df-z]|[-+]?(?:\d*\.\d+|\d+)(?:[eE][-+]?\d+)?)/gi;
  let match;
  while ((match = regex.exec(d)) !== null) {
    tokens.push(match[0]);
  }
  return tokens;
}

function parseSvgPathToPoints(d: string): [number, number][] {
  const tokens = tokenizePath(d);
  const points: [number, number][] = [];
  
  let currentX = 0;
  let currentY = 0;
  let i = 0;
  let currentCmd = 'M';

  while (i < tokens.length) {
    const token = tokens[i];
    if (/^[a-df-z]$/i.test(token)) {
      currentCmd = token;
      i++;
      continue;
    }

    if (currentCmd === 'M' || currentCmd === 'L') {
      const x = parseFloat(tokens[i]);
      const y = parseFloat(tokens[i + 1]);
      if (!isNaN(x) && !isNaN(y)) {
        currentX = x;
        currentY = y;
        points.push([currentX, currentY]);
      }
      i += 2;
      // Subsequent coordinate pairs after M are treated as L
      if (currentCmd === 'M') currentCmd = 'L';
    } else if (currentCmd === 'm' || currentCmd === 'l') {
      const dx = parseFloat(tokens[i]);
      const dy = parseFloat(tokens[i + 1]);
      if (!isNaN(dx) && !isNaN(dy)) {
        currentX += dx;
        currentY += dy;
        points.push([currentX, currentY]);
      }
      i += 2;
      if (currentCmd === 'm') currentCmd = 'l';
    } else if (currentCmd === 'H') {
      const x = parseFloat(tokens[i]);
      if (!isNaN(x)) {
        currentX = x;
        points.push([currentX, currentY]);
      }
      i += 1;
    } else if (currentCmd === 'h') {
      const dx = parseFloat(tokens[i]);
      if (!isNaN(dx)) {
        currentX += dx;
        points.push([currentX, currentY]);
      }
      i += 1;
    } else if (currentCmd === 'V') {
      const y = parseFloat(tokens[i]);
      if (!isNaN(y)) {
        currentY = y;
        points.push([currentX, currentY]);
      }
      i += 1;
    } else if (currentCmd === 'v') {
      const dy = parseFloat(tokens[i]);
      if (!isNaN(dy)) {
        currentY += dy;
        points.push([currentX, currentY]);
      }
      i += 1;
    } else if (currentCmd === 'C') {
      const x1 = parseFloat(tokens[i]);
      const y1 = parseFloat(tokens[i + 1]);
      const x2 = parseFloat(tokens[i + 2]);
      const y2 = parseFloat(tokens[i + 3]);
      const x = parseFloat(tokens[i + 4]);
      const y = parseFloat(tokens[i + 5]);
      
      if (![x1, y1, x2, y2, x, y].some(isNaN)) {
        for (let t = 0.2; t <= 1.0; t += 0.2) {
          const bx = Math.pow(1 - t, 3) * currentX + 3 * Math.pow(1 - t, 2) * t * x1 + 3 * (1 - t) * Math.pow(t, 2) * x2 + Math.pow(t, 3) * x;
          const by = Math.pow(1 - t, 3) * currentY + 3 * Math.pow(1 - t, 2) * t * y1 + 3 * (1 - t) * Math.pow(t, 2) * y2 + Math.pow(t, 3) * y;
          points.push([bx, by]);
        }
        currentX = x;
        currentY = y;
      }
      i += 6;
    } else if (currentCmd === 'c') {
      const x1 = currentX + parseFloat(tokens[i]);
      const y1 = currentY + parseFloat(tokens[i + 1]);
      const x2 = currentX + parseFloat(tokens[i + 2]);
      const y2 = currentY + parseFloat(tokens[i + 3]);
      const x = currentX + parseFloat(tokens[i + 4]);
      const y = currentY + parseFloat(tokens[i + 5]);
      
      if (![x1, y1, x2, y2, x, y].some(isNaN)) {
        for (let t = 0.2; t <= 1.0; t += 0.2) {
          const bx = Math.pow(1 - t, 3) * currentX + 3 * Math.pow(1 - t, 2) * t * x1 + 3 * (1 - t) * Math.pow(t, 2) * x2 + Math.pow(t, 3) * x;
          const by = Math.pow(1 - t, 3) * currentY + 3 * Math.pow(1 - t, 2) * t * y1 + 3 * (1 - t) * Math.pow(t, 2) * y2 + Math.pow(t, 3) * y;
          points.push([bx, by]);
        }
        currentX = x;
        currentY = y;
      }
      i += 6;
    } else if (currentCmd === 'S' || currentCmd === 's') {
      const isRel = currentCmd === 's';
      const x2 = isRel ? currentX + parseFloat(tokens[i]) : parseFloat(tokens[i]);
      const y2 = isRel ? currentY + parseFloat(tokens[i + 1]) : parseFloat(tokens[i + 1]);
      const x = isRel ? currentX + parseFloat(tokens[i + 2]) : parseFloat(tokens[i + 2]);
      const y = isRel ? currentY + parseFloat(tokens[i + 3]) : parseFloat(tokens[i + 3]);
      
      if (![x2, y2, x, y].some(isNaN)) {
        currentX = x;
        currentY = y;
        points.push([currentX, currentY]);
      }
      i += 4;
    } else if (currentCmd === 'Z' || currentCmd === 'z') {
      i++;
    } else {
      i++;
    }
  }

  return points;
}

function normaliseAndResample(points: [number, number][], nPoints = 150): { pathData: string, rawPoints: [number, number][] } {
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
  if (rx === 0 || ry === 0) return { pathData: '', rawPoints: [] };
  const scale = Math.min((SVG_W - 2 * PAD) / rx, (SVG_H - 2 * PAD) / ry);

  const nx = points.map(([x]) => PAD + (x - minX) * scale);
  const ny = points.map(([, y]) => PAD + (y - minY) * scale);

  const currentNxMin = Math.min(...nx);
  const currentNxMax = Math.max(...nx);
  const currentNyMin = Math.min(...ny);
  const currentNyMax = Math.max(...ny);

  const xOffset = (SVG_W - (currentNxMax - currentNxMin)) / 2 - currentNxMin;
  const yOffset = (SVG_H - (currentNyMax - currentNyMin)) / 2 - currentNyMin;

  const finalX = nx.map(x => x + xOffset);
  const finalY = ny.map(y => y + yOffset);

  const resampled: [number, number][] = [];
  for (let i = 0; i < nPoints; i++) {
    const idx = Math.round((i / (nPoints - 1)) * (points.length - 1));
    resampled.push([parseFloat(finalX[idx].toFixed(1)), parseFloat(finalY[idx].toFixed(1))]);
  }

  const pathString = 'M ' + resampled.map(([x, y]) => `${x},${y}`).join(' L ') + ' Z';
  return { pathData: pathString, rawPoints: resampled };
}

const ALL_TRACKS: { appKey: string, file: string }[] = [
  { appKey: 'silverstone', file: 'circuits/detailed/black-outline/silverstone-8.svg' },
  { appKey: 'monaco', file: 'circuits/detailed/black-outline/monaco-6.svg' },
  { appKey: 'spa', file: 'circuits/detailed/black-outline/spa-francorchamps-4.svg' },
  { appKey: 'spa_wec', file: 'circuits/detailed/black-outline/spa-francorchamps-4.svg' },
  { appKey: 'monza', file: 'circuits/detailed/black-outline/monza-7.svg' },
  { appKey: 'suzuka', file: 'circuits/detailed/black-outline/suzuka-2.svg' },
  { appKey: 'interlagos', file: 'circuits/detailed/black-outline/interlagos-2.svg' },
  { appKey: 'bahrain', file: 'circuits/detailed/black-outline/bahrain-1.svg' },
  { appKey: 'cota_f1', file: 'circuits/detailed/black-outline/austin-1.svg' },
  { appKey: 'albertpark_supercars', file: 'circuits/detailed/black-outline/melbourne-2.svg' },
  { appKey: 'mugello', file: 'circuits/minimal/black-outline/mugello-1.svg' },
  { appKey: 'jerez_motogp', file: 'circuits/minimal/black-outline/jerez-2.svg' },
  { appKey: 'fuji_wec', file: 'circuits/minimal/black-outline/fuji-2.svg' },
  { appKey: 'nurburgring', file: 'circuits/minimal/black-outline/nurburgring-4.svg' },
  { appKey: 'nurburgring_dtm', file: 'circuits/minimal/black-outline/nurburgring-4.svg' },
  { appKey: 'hockenheimring_dtm', file: 'circuits/minimal/black-outline/hockenheimring-3.svg' },
];

async function main() {
  const output: Record<string, any> = {};

  for (const track of ALL_TRACKS) {
    try {
      const url = `https://raw.githubusercontent.com/julesr0y/f1-circuits-svg/main/${track.file}`;
      const svg = await fetchUrl(url);
      const d = extractPathD(svg);
      const points = parseSvgPathToPoints(d);
      const { pathData, rawPoints } = normaliseAndResample(points, 150);
      output[track.appKey] = {
        pathData,
        pointsCount: rawPoints.length,
      };
      console.log(`  SUCCESS: ${rawPoints.length} points generated for ${track.appKey}`);
    } catch (e: any) {
      console.error(`  ERROR for ${track.appKey}:`, e.message);
    }
  }

  const outPath = path.join(process.cwd(), 'python_backend', 'circuit_paths.json');
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`\nWritten ${Object.keys(output).length} accurate circuit paths to ${outPath}`);
}

main();
