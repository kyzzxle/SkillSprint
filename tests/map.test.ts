import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { COUNTRIES } from '../src/data/countries';

interface MapData { width: number; height: number; features: { id: string | null; name: string; d: string; cx?: number; cy?: number }[] }
const map: MapData = JSON.parse(readFileSync(new URL('../public/data/world-110m.json', import.meta.url), 'utf8'));

describe('world map data', () => {
  it('has no segments that jump across the map (180° meridian artefacts)', () => {
    const offenders: string[] = [];
    for (const f of map.features) {
      for (const sub of f.d.split('M').slice(1)) {
        const xs = sub.replace('Z', '').split('L').map((p) => Number(p.trim().split(' ')[0]));
        for (let i = 1; i < xs.length; i++) {
          if (Math.abs(xs[i] - xs[i - 1]) > map.width / 4) offenders.push(`${f.name}: ${xs[i - 1]} -> ${xs[i]}`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });

  it('places every quiz country marker inside the map', () => {
    for (const c of COUNTRIES) {
      const f = map.features.find((x) => x.id === c.num);
      if (!f) continue; // too small for the 1:110m dataset (excluded from map questions)
      expect(f.cx).toBeGreaterThanOrEqual(0);
      expect(f.cx).toBeLessThanOrEqual(map.width);
      expect(f.cy).toBeGreaterThanOrEqual(0);
      expect(f.cy).toBeLessThanOrEqual(map.height);
    }
  });
});
