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

async function debugSuzukaBahrain() {
  const suzuka = await fetchUrl('https://raw.githubusercontent.com/julesr0y/f1-circuits-svg/main/circuits/detailed/black-outline/suzuka-2.svg');
  console.log('Suzuka raw d start:', suzuka.slice(0, 300));
  const bahrain = await fetchUrl('https://raw.githubusercontent.com/julesr0y/f1-circuits-svg/main/circuits/detailed/black-outline/bahrain-1.svg');
  console.log('Bahrain raw d start:', bahrain.slice(0, 300));
}

debugSuzukaBahrain();
