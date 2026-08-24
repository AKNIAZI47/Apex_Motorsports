import fs from 'fs';
import path from 'path';

const circuitsPath = path.join(process.cwd(), 'python_backend', 'circuit_paths.json');
const data = JSON.parse(fs.readFileSync(circuitsPath, 'utf-8'));

console.log('Available circuits in JSON:', Object.keys(data));
for (const [k, v] of Object.entries(data)) {
  console.log(`\nCircuit [${k}] (points: ${(v as any).pointsCount}):`);
  console.log((v as any).pathData.slice(0, 100) + '...' + (v as any).pathData.slice(-40));
}
