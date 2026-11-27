// "Your progress" panel shown under every game: lane medals, a chart of results over time,
// and a toast when a new medal is earned. Everything comes from this browser's saved results.
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { SCORE_RULES, categoryById, type CategoryId } from '../data/catalog';
import { load, onStorageChange, type HistoryEntry, type StoreData } from '../lib/storage';
import { MEDAL_NAMES, bestFor, formatTarget, medalLevel, nextMedal, ruleFor, type MedalLevel } from '../lib/medals';
import { prettyVariant } from '../lib/format';
import './progress.css';

export function MedalDisc({ level, tier, size = 40 }: { level: MedalLevel; tier: 1 | 2 | 3; size?: number }) {
  const won = level >= tier;
  const cls = ['', 'bronze', 'silver', 'gold'][tier];
  return (
    <svg class={`medal-disc ${cls} ${won ? 'won' : 'open'}`} width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      <circle cx="20" cy="20" r="17" />
      <path d="M20 10.5l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5-5.8-3.1-5.8 3.1 1.1-6.5-4.7-4.6 6.5-.9z" />
    </svg>
  );
}

/** Nice round tick step for an axis covering `range` with about `count` ticks. */
export function niceStep(range: number, count = 4): number {
  const raw = Math.max(range, 1e-9) / count;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const norm = raw / mag;
  const step = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 5 ? 5 : 10;
  return step * mag;
}

function useStore(): StoreData | null {
  const [data, setData] = useState<StoreData | null>(null);
  useEffect(() => {
    const refresh = () => setData(load());
    refresh();
    return onStorageChange(refresh);
  }, []);
  return data;
}

export default function ProgressPanel({ gameId, cat, lane }: { gameId: string; cat: CategoryId; lane: number }) {
  const data = useStore();
  const rule = ruleFor(cat);
  const catName = categoryById(cat).name;
  const medalScore = data ? bestFor(rule, data.bests) : null;
  const level = medalLevel(rule, medalScore);

  // Toast when the lane medal goes up while the page is open.
  const prevLevel = useRef<MedalLevel | null>(null);
  const [toast, setToast] = useState<MedalLevel | null>(null);
  useEffect(() => {
    if (!data) return;
    if (prevLevel.current !== null && level > prevLevel.current) {
      setToast(level);
      const t = window.setTimeout(() => setToast(null), 7000);
      prevLevel.current = level;
      return () => window.clearTimeout(t);
    }
    prevLevel.current = level;
  }, [data, level]);

  const next = nextMedal(rule, medalScore);

  return (
    <section class="progress-panel" data-cat={cat} aria-labelledby="progress-title">
      <h2 id="progress-title">Your progress</h2>
      <div class="medals" aria-label={`Lane ${lane} medals`}>
        <div class="medal-row">
          {([1, 2, 3] as const).map((tier) => (
            <div class={`medal ${level >= tier ? 'won' : ''}`} key={tier}>
              <MedalDisc level={level} tier={tier} />
              <div>
                <strong>{MEDAL_NAMES[tier]}</strong>
                <span>{rule.better === 'lower' ? 'Under ' : ''}{formatTarget(rule, rule.tiers[tier - 1])}{rule.better === 'lower' ? '' : '+'}</span>
                <span class="medal-state">{level >= tier ? 'Won' : 'Not yet'}</span>
              </div>
            </div>
          ))}
        </div>
        <p class="medal-note">
          {!data
            ? ''
            : next === null
              ? `Gold won in ${catName}. Keep pushing your personal best. `
              : next.gap === null
                ? `Play to start earning ${catName} medals. `
                : `${MEDAL_NAMES[next.level]} is ${formatTarget(rule, Math.round(next.gap * 10) / 10)} away (you're at ${formatTarget(rule, medalScore!)}). `}
          Medals count {rule.counts}.
          {rule.gameId !== gameId && (
            <>
              {' '}They're earned in <a href={rule.url}>{SCORE_RULES[rule.gameId]?.label}</a>.
            </>
          )}
        </p>
      </div>

      <ProgressChart gameId={gameId} history={data?.history ?? null} />

      {toast !== null && (
        <div class={`medal-toast ${['', 'bronze', 'silver', 'gold'][toast]}`} role="status">
          <MedalDisc level={toast} tier={toast as 1 | 2 | 3} size={44} />
          <div>
            <strong>{MEDAL_NAMES[toast]} medal in {catName}!</strong>
            <span>{toast < 3 ? `Next: ${MEDAL_NAMES[toast + 1]} at ${formatTarget(rule, rule.tiers[toast as 1 | 2])}.` : 'That’s the top medal in this lane.'}</span>
          </div>
          <button type="button" class="icon-btn" aria-label="Dismiss" onClick={() => setToast(null)}>×</button>
        </div>
      )}
    </section>
  );
}

const MAX_POINTS = 30;
const CH = 190;
const M = { top: 16, right: 18, bottom: 34, left: 52 };

function ProgressChart({ gameId, history }: { gameId: string; history: HistoryEntry[] | null }) {
  const entries = useMemo(() => (history ?? []).filter((h) => h.gameId === gameId), [history, gameId]);
  // Only results with the same settings are comparable: chart one settings group at a time.
  const variants = useMemo(() => {
    const counts = new Map<string, number>();
    for (const e of entries) counts.set(e.variant, (counts.get(e.variant) ?? 0) + 1);
    return [...counts.entries()].filter(([, n]) => n >= 2).map(([v]) => v);
  }, [entries]);
  const [variant, setVariant] = useState<string | null>(null);
  const active = variant && variants.includes(variant) ? variant : (entries.find((e) => variants.includes(e.variant))?.variant ?? null);
  const boxRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(640);
  const [hover, setHover] = useState<number | null>(null);
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const update = () => setWidth(Math.max(260, el.clientWidth));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [active]);

  if (history === null) return <div class="pchart" aria-busy="true" style={{ minHeight: 120 }} />;
  if (!active) {
    return (
      <div class="pchart-empty">
        <strong>Your progress chart appears after two results with the same settings.</strong>
        <span>{entries.length === 1 ? 'One down, one to go.' : 'Play a round above to start.'} Each result is saved in this browser.</span>
      </div>
    );
  }

  const lower = SCORE_RULES[gameId]?.better === 'lower';
  const unit = SCORE_RULES[gameId]?.unit ?? '';
  const pts = entries.filter((e) => e.variant === active).slice(0, MAX_POINTS).reverse();
  const scores = pts.map((p) => p.score);
  const bestScore = lower ? Math.min(...scores) : Math.max(...scores);
  const bestIdx = scores.lastIndexOf(bestScore);
  const lo = Math.min(...scores), hi = Math.max(...scores);
  // Keep a sensible minimum range so tiny differences are not blown up, and use whole-number
  // steps when every score is a whole number.
  const span = Math.max(hi - lo, Math.abs(hi) * 0.2, 4);
  const integer = scores.every((v) => Number.isInteger(v));
  const step = Math.max(niceStep(span, 4), integer ? 1 : 0);
  const yMin = Math.max(0, Math.floor((lo - step * 0.5) / step) * step);
  const yMax = Math.ceil((hi + step * 0.5) / step) * step;
  const innerW = width - M.left - M.right;
  const x = (i: number) => M.left + (pts.length === 1 ? innerW / 2 : (i / (pts.length - 1)) * innerW);
  const y = (v: number) => M.top + CH - ((v - yMin) / (yMax - yMin)) * CH;
  const ticks: number[] = [];
  for (let v = yMin; v <= yMax + 1e-9; v += step) ticks.push(Math.round(v * 100) / 100);
  const xEvery = Math.max(1, Math.ceil(pts.length / 8));
  const path = pts.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(p.score).toFixed(1)}`).join('');

  const first = scores[0], latest = scores[scores.length - 1];
  const delta = latest - first;
  const improved = lower ? delta < 0 : delta > 0;
  const recent = scores.slice(-5), before = scores.slice(-10, -5);
  const avg = (a: number[]) => Math.round((a.reduce((s, v) => s + v, 0) / a.length) * 10) / 10;
  const fmt = (v: number) => `${Math.round(v * 10) / 10}${unit.startsWith('%') ? '%' : ` ${unit}`}`;

  const pick = (clientX: number) => {
    const svg = boxRef.current?.querySelector('svg');
    if (!svg) return;
    const r = svg.getBoundingClientRect();
    const px = ((clientX - r.left) / r.width) * width;
    let best = 0;
    for (let i = 1; i < pts.length; i++) if (Math.abs(x(i) - px) < Math.abs(x(best) - px)) best = i;
    setHover(best);
  };
  const h = hover !== null ? pts[hover] : null;
  const tipRight = hover !== null && x(hover) > width * 0.6;

  return (
    <div class="pchart">
      <div class="pchart-head">
        {variants.length > 1 ? (
          <label class="pchart-select">
            <span>Settings</span>
            <select value={active} onChange={(e) => setVariant((e.target as HTMLSelectElement).value)}>
              {variants.map((v) => <option value={v} key={v}>{prettyVariant(v)}</option>)}
            </select>
          </label>
        ) : (
          <span class="muted">{prettyVariant(active)}</span>
        )}
        <dl class="pchart-stats">
          <div><dt>Best</dt><dd>{fmt(bestScore)}</dd></div>
          <div><dt>Latest</dt><dd>{fmt(latest)}</dd></div>
          <div>
            <dt>Since your first</dt>
            <dd class={delta === 0 ? '' : improved ? 'up' : 'down'}>
              {delta === 0 ? 'No change' : `${delta > 0 ? '+' : '−'}${fmt(Math.abs(delta))}`}
              {delta !== 0 && <small>{improved ? ' better' : ' worse'}</small>}
            </dd>
          </div>
          {before.length >= 3 && (
            <div><dt>Last 5 avg</dt><dd>{fmt(avg(recent))} <small>vs {fmt(avg(before))}</small></dd></div>
          )}
        </dl>
      </div>
      <div
        class="pchart-box"
        ref={boxRef}
        tabIndex={0}
        role="img"
        aria-label={`Your last ${pts.length} results with these settings, oldest to newest: ${scores.join(', ')} ${unit}. Best ${fmt(bestScore)}. Use the arrow keys to read each result.`}
        onPointerMove={(e) => pick(e.clientX)}
        onPointerDown={(e) => pick(e.clientX)}
        onPointerLeave={(e) => e.pointerType === 'mouse' && setHover(null)}
        onBlur={() => setHover(null)}
        onKeyDown={(e) => {
          if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
          e.preventDefault();
          setHover((cur) => Math.min(pts.length - 1, Math.max(0, (cur ?? (e.key === 'ArrowRight' ? -1 : pts.length)) + (e.key === 'ArrowRight' ? 1 : -1))));
        }}
      >
        <svg width={width} height={M.top + CH + M.bottom} viewBox={`0 0 ${width} ${M.top + CH + M.bottom}`} aria-hidden="true">
          {ticks.map((v) => (
            <g key={v}>
              <line class={v === yMin ? 'axis' : 'grid'} x1={M.left} x2={M.left + innerW} y1={y(v)} y2={y(v)} />
              <text class="tick" x={M.left - 8} y={y(v) + 4} text-anchor="end">{v}</text>
            </g>
          ))}
          <text class="axis-label" x={12} y={M.top + CH / 2} transform={`rotate(-90 12 ${M.top + CH / 2})`} text-anchor="middle">{unit}{lower ? ' (lower is better)' : ''}</text>
          {pts.map((_, i) => (i % xEvery === 0 || i === pts.length - 1 ? (
            <text key={i} class="tick" x={x(i)} y={M.top + CH + 18} text-anchor="middle">{i + 1}</text>
          ) : null))}
          <text class="axis-label" x={M.left + innerW / 2} y={M.top + CH + 32} text-anchor="middle">Result number (oldest to newest)</text>
          <path class="pline" d={path} />
          {pts.map((p, i) => (
            <circle key={i} class={`pdot ${i === bestIdx ? 'best' : ''}`} cx={x(i)} cy={y(p.score)} r={i === bestIdx ? 6 : 3.5} />
          ))}
          <text class="pb-label" x={x(bestIdx)} y={y(bestScore) + (lower ? 20 : -11)} text-anchor="middle">PB</text>
          {h && <line class="cross" x1={x(hover!)} x2={x(hover!)} y1={M.top} y2={M.top + CH} />}
        </svg>
        {h && (
          <div class="pchart-tip" style={{ left: `${x(hover!) + (tipRight ? -12 : 12)}px`, transform: tipRight ? 'translateX(-100%)' : 'none' }} role="status">
            <strong>Result {hover! + 1}: {h.display}</strong>
            <span>{new Date(h.date).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</span>
            {hover === bestIdx && <span class="pb-flag">PB</span>}
          </div>
        )}
      </div>
    </div>
  );
}
