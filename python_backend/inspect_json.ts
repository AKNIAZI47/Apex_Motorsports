import https from 'https';

function fetchUrl(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function inspect() {
  const json = await fetchUrl('https://raw.githubusercontent.com/julesr0y/f1-circuits-svg/main/circuits.json');
  const list = JSON.parse(json);
  const monaco = list.find((c: any) => c.id === 'monaco');
  console.log('Monaco entry:', JSON.stringify(monaco, null, 2));
  const silverstone = list.find((c: any) => c.id === 'silverstone');
  console.log('Silverstone entry:', JSON.stringify(silverstone, null, 2));
}

inspect();
