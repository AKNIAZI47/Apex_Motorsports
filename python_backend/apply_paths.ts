import fs from 'fs';
import path from 'path';

const circuitsJsonPath = path.join(process.cwd(), 'python_backend', 'circuit_paths.json');
const realPaths = JSON.parse(fs.readFileSync(circuitsJsonPath, 'utf-8'));
const circuitDataPath = path.join(process.cwd(), 'src', 'data', 'circuitData.ts');
let content = fs.readFileSync(circuitDataPath, 'utf-8');

// Update each circuit in circuitData.ts
for (const [id, data] of Object.entries(realPaths)) {
  const pathData = (data as any).pathData;
  const keyCoordinates = (data as any).keyCoordinates;

  // Regex to match pathData inside this circuit object
  // Find id: '${id}', then find pathData: '...', and keyCoordinates: [...]
  const circuitRegex = new RegExp(`(${id}:\\s*\\{[\\s\\S]*?pathData:\\s*['"])([^'"]+)(['"][\\s\\S]*?keyCoordinates:\\s*\\[)([\\s\\S]*?)(\\])`, 'm');
  
  if (circuitRegex.test(content)) {
    const formattedCoords = JSON.stringify(keyCoordinates, null, 6)
      .replace(/^\[\s*/, '')
      .replace(/\s*\]$/, '');

    content = content.replace(circuitRegex, (match, p1, pOldPath, p3, pOldCoords, p5) => {
      console.log(`Updated circuit ${id}`);
      return `${p1}${pathData}${p3}\n      ${formattedCoords}\n    ${p5}`;
    });
  } else {
    console.warn(`Could not match regex for ${id}`);
  }
}

fs.writeFileSync(circuitDataPath, content, 'utf-8');
console.log('Successfully updated circuitData.ts with real GPS geometry!');
