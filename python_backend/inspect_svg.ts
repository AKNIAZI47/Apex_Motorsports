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
  const url = 'https://raw.githubusercontent.com/julesr0y/f1-circuits-svg/main/circuits/minimal/monaco-6.svg';
  const content = await fetchUrl(url);
  console.log('Content for monaco-6.svg:\n', content);
}

inspect();
