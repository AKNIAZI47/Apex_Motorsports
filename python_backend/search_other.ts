import https from 'https';

function fetchUrl(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'NodeJS-App' } }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function searchOtherCircuits() {
  const json = await fetchUrl('https://api.github.com/repos/julesr0y/f1-circuits-svg/git/trees/main?recursive=1');
  const tree = JSON.parse(json);
  const targets = ['mugello', 'nurburgring', 'hockenheimring', 'jerez', 'fuji', 'norisring', 'zandvoort', 'barcelona', 'imola', 'spielberg'];
  const matched = tree.tree.filter((f: any) => targets.some(t => f.path.includes(t)) && f.path.includes('black-outline'));
  console.log('Matched circuits:', matched.map((f: any) => f.path));
}

searchOtherCircuits();
