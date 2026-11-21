// Lightweight world map renderer for map questions. Geometry is pre-projected at build time
// (scripts/prepare-assets.mjs, Natural Earth 1:110m data) and fetched once on demand.
import { useEffect, useState } from 'preact/hooks';

interface MapFeature { id: string | null; name: string; d: string; cx?: number; cy?: number; size?: number }
interface MapData { width: number; height: number; features: MapFeature[] }

let cache: Promise<MapData> | null = null;
export function loadWorld(): Promise<MapData> {
  if (!cache) {
    cache = fetch('/data/world-110m.json').then((r) => {
      if (!r.ok) throw new Error(`Map data failed to load (${r.status})`);
      return r.json() as Promise<MapData>;
    });
    cache.catch(() => (cache = null));
  }
  return cache;
}

export function WorldMap({ highlight }: { highlight: string }) {
  const [data, setData] = useState<MapData | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    let alive = true;
    loadWorld().then((d) => alive && setData(d)).catch(() => alive && setError(true));
    return () => {
      alive = false;
    };
  }, []);

  if (error) return <div class="map-box map-error">The map could not be loaded. Check your connection and try again.</div>;
  if (!data) return <div class="map-box map-loading" aria-busy="true">Loading map…</div>;

  const target = data.features.find((f) => f.id === highlight);
  // Frame the view around the highlighted country so small countries stay visible.
  const size = target?.size ?? 100;
  const w = Math.min(data.width, Math.max(280, size * 4.5));
  const h = Math.min(data.height, w / 2);
  const cx = target?.cx ?? data.width / 2;
  const cy = target?.cy ?? data.height / 2;
  const x = Math.min(Math.max(0, cx - w / 2), data.width - w);
  const y = Math.min(Math.max(0, cy - h / 2), data.height - h);
  const markerR = Math.max(w / 40, 6);

  return (
    <div class="map-box">
      <svg viewBox={`${x} ${y} ${w} ${h}`} role="img" aria-label="World map with one country highlighted" preserveAspectRatio="xMidYMid meet">
        <rect x={0} y={0} width={data.width} height={data.height} class="map-sea" />
        {data.features.map((f, i) => (
          <path key={i} d={f.d} class={f.id === highlight ? 'map-target' : 'map-land'} vector-effect="non-scaling-stroke" />
        ))}
        {target && size < 25 && (
          <circle cx={target.cx} cy={target.cy} r={markerR + size / 2} class="map-marker" vector-effect="non-scaling-stroke" />
        )}
      </svg>
    </div>
  );
}
