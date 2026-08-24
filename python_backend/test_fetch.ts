import https from 'https';
import fs from 'fs';
import path from 'path';

const SVG_W = 850;
const SVG_H = 520;
const PAD = 45;

function fetchUrl(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function run() {
  try {
    const circuitsJson = await fetchUrl('https://raw.githubusercontent.com/julesr0y/f1-circuits-svg/main/circuits.json');
    console.log('circuits.json fetched length:', circuitsJson.length);
    const parsed = JSON.parse(circuitsJson);
    console.log('Circuits count:', parsed.length);
    console.log('Sample:', parsed.slice(0, 5).map((c: any) => ({ id: c.id, name: c.name, layouts: c.layouts?.length })));
  } catch (e) {
    console.error('Error:', e);
  }
}

run();
