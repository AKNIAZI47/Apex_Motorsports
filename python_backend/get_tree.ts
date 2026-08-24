import https from 'https';

function fetchUrl(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'NodeJS-App'
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function getTree() {
  const json = await fetchUrl('https://api.github.com/repos/julesr0y/f1-circuits-svg/git/trees/main?recursive=1');
  const tree = JSON.parse(json);
  if (tree.tree) {
    const svgFiles = tree.tree.filter((f: any) => f.path.endsWith('.svg')).slice(0, 30);
    console.log('Sample SVG files in repo:', svgFiles.map((f: any) => f.path));
  } else {
    console.log('Tree response:', json.slice(0, 300));
  }
}

getTree();
