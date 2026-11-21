// Prepares static game assets from properly licensed sources:
//  - Country flags: flag-icons (MIT) -> public/flags/<iso2>.svg
//  - World map:     world-atlas 110m (Natural Earth, public domain) -> public/data/world-110m.json
// Run with: npm run assets   (outputs are committed, so this only needs re-running when data changes)
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { feature } from 'topojson-client';
import { COUNTRIES } from '../src/data/countries.ts';

const require = createRequire(import.meta.url);
const root = join(dirname(fileURLToPath(import.meta.url)), '..');

// ---- Flags ----
const flagSrc = join(dirname(require.resolve('flag-icons/package.json')), 'flags', '4x3');
const flagOut = join(root, 'public', 'flags');
mkdirSync(flagOut, { recursive: true });
for (const c of COUNTRIES) {
  const src = join(flagSrc, `${c.iso2}.svg`);
  if (!existsSync(src)) throw new Error(`Missing flag for ${c.name} (${c.iso2})`);
  copyFileSync(src, join(flagOut, `${c.iso2}.svg`));
}
console.log(`Copied ${COUNTRIES.length} flags.`);

// ---- World map ----
const topo = JSON.parse(readFileSync(require.resolve('world-atlas/countries-110m.json'), 'utf8'));
const geo = feature(topo, topo.objects.countries);
const W = 1000;
const LAT_TOP = 84, LAT_BOTTOM = -58;
const k = W / 360;
const H = Math.round((LAT_TOP - LAT_BOTTOM) * k);
const px = (lon) => +((lon + 180) * k).toFixed(1);
const py = (lat) => +((LAT_TOP - lat) * k).toFixed(1);

function ringToPath(ring) {
  let d = '';
  let prev = '';
  ring.forEach(([lon, lat], i) => {
    const pt = `${px(lon)} ${py(lat)}`;
    if (pt === prev) return;
    d += (i === 0 ? 'M' : 'L') + pt;
    prev = pt;
  });
  return d + 'Z';
}
function polygons(geom) {
  if (!geom) return [];
  return geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates;
}
function ringArea(ring) {
  let a = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) a += (ring[j][0] + ring[i][0]) * (ring[j][1] - ring[i][1]);
  return Math.abs(a / 2);
}

const wanted = new Map(COUNTRIES.map((c) => [c.num, c]));
const features = [];
const found = new Set();
for (const f of geo.features) {
  if (f.properties?.name === 'Antarctica') continue;
  const polys = polygons(f.geometry);
  if (!polys.length) continue;
  const d = polys.map((p) => p.map(ringToPath).join('')).join('');
  const item = { id: f.id ?? null, name: f.properties?.name ?? '', d };
  if (f.id && wanted.has(f.id)) {
    // Marker: centre of the bounding box of the largest polygon (keeps markers on the mainland).
    const largest = polys.reduce((a, b) => (ringArea(b[0]) > ringArea(a[0]) ? b : a));
    const xs = largest[0].map((p) => px(p[0]));
    const ys = largest[0].map((p) => py(p[1]));
    const [minX, maxX, minY, maxY] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
    item.cx = +((minX + maxX) / 2).toFixed(1);
    item.cy = +((minY + maxY) / 2).toFixed(1);
    item.size = +Math.max(maxX - minX, maxY - minY).toFixed(1);
    found.add(f.id);
    console.log(`  ${f.id} ${wanted.get(f.id).name.padEnd(24)} <- map name: ${item.name}`);
  }
  features.push(item);
}
const missing = COUNTRIES.filter((c) => !found.has(c.num)).map((c) => c.name);
console.log(`Map features: ${features.length}. Countries without a 110m shape (excluded from map questions): ${missing.join(', ') || 'none'}`);
mkdirSync(join(root, 'public', 'data'), { recursive: true });
writeFileSync(join(root, 'public', 'data', 'world-110m.json'), JSON.stringify({ width: W, height: H, features }));
console.log('Wrote public/data/world-110m.json');
