import https from 'https';

function fetchUrl(url: string): Promise<{ status: number, body: string }> {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode || 0, body: data }));
    }).on('error', (err) => resolve({ status: 500, body: err.message }));
  });
}

async function testUrls() {
  const tests = [
    'https://raw.githubusercontent.com/julesr0y/f1-circuits-svg/master/circuits/minimal/monaco-6.svg',
    'https://raw.githubusercontent.com/julesr0y/f1-circuits-svg/main/circuits/minimal/monaco-6.svg',
    'https://raw.githubusercontent.com/julesr0y/f1-circuits-svg/main/svg/minimal/monaco-6.svg',
    'https://raw.githubusercontent.com/julesr0y/f1-circuits-svg/master/svg/minimal/monaco-6.svg',
    'https://raw.githubusercontent.com/julesr0y/f1-circuits-svg/main/circuits/monaco-6.svg',
  ];

  for (const url of tests) {
    const res = await fetchUrl(url);
    console.log(`[${res.status}] ${url}`);
    if (res.status === 200) {
      console.log('Sample body:', res.body.slice(0, 150));
    }
  }
}

testUrls();
