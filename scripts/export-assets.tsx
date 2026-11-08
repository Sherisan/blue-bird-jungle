/**
 * Renders the React art components to standalone SVG files in public/assets.
 * Run with: npm run export:assets
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { BirdArt } from '../src/art/Bird';
import { KeyArt } from '../src/art/KeyArt';
import { PoacherArt } from '../src/art/Poacher';
import { Chip, Coin, Feather, Logo } from '../src/art/Tokens';

const OUT = 'public/assets';
mkdirSync(OUT, { recursive: true });

const files: [string, ReactElement][] = [
  ['poacher-idle.svg', <PoacherArt mood="idle" />],
  ['poacher-aim.svg', <PoacherArt mood="aim" />],
  ['poacher-cheer.svg', <PoacherArt mood="cheer" aim={-34} />],
  ['poacher-annoyed.svg', <PoacherArt mood="annoyed" />],
  ['bird-perch.svg', <BirdArt state="perch" />],
  ['bird-fly.svg', <BirdArt state="fly" />],
  ['bird-caught.svg', <BirdArt state="caught" />],
  ['chip-10.svg', <Chip value={10} size={88} />],
  ['chip-50.svg', <Chip value={50} size={88} />],
  ['chip-100.svg', <Chip value={100} size={88} />],
  ['chip-500.svg', <Chip value={500} size={88} />],
  ['coin.svg', <Coin size={96} />],
  ['feather.svg', <Feather size={96} />],
  ['logo.svg', <Logo size={128} />],
  ['key-art.svg', <KeyArt width={1600} />],
];

for (const [name, el] of files) {
  let svg = renderToStaticMarkup(el);
  if (!svg.includes('xmlns=')) svg = svg.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
  writeFileSync(`${OUT}/${name}`, '<?xml version="1.0" encoding="UTF-8"?>\n' + svg);
  console.log('wrote', `${OUT}/${name}`);
}
writeFileSync('public/favicon.svg', renderToStaticMarkup(<Logo size={64} />));
console.log('wrote public/favicon.svg');
