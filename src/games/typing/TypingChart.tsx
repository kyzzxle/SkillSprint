// Results chart for the typing test: WPM over time on one WPM axis, with a separate error strip
// that shares the time axis. Hover/tap shows exact values; a data table is available for every point.
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import './typing-chart.css';

export interface Sample {
  /** seconds since the test started */
  t: number;
  /** net WPM so far (correct words only) */
  wpm: number;
  /** raw WPM during this interval (every keystroke) */
  raw: number;
  /** incorrect keystrokes during this interval */
  errors: number;
}

/** "Nice" axis maximum and step so ticks land on round numbers. */
export function niceScale(max: number, targetTicks = 5): { max: number; step: number } {
  const safe = Math.max(max, 10);
  const rough = safe / targetTicks;
  const steps = [5, 10, 20, 25, 50, 100, 200];
  const step = steps.find((s) => s >= rough) ?? 250;
  return { max: Math.ceil(safe / step) * step, step };
}

function timeStep(total: number): number {
  if (total <= 15) return 3;
  if (total <= 30) return 5;
  if (total <= 60) return 10;
  return 20;
}

const H_MAIN = 220;
const H_ERR = 46;
const GAP = 22;
const M = { top: 14, right: 70, bottom: 30, left: 46 };

export function TypingChart({ samples }: { samples: Sample[] }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(640);
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const update = () => setWidth(Math.max(280, el.clientWidth));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const data = useMemo(() => samples.map((s) => ({ ...s, wpm: Math.round(s.wpm), raw: Math.round(s.raw) })), [samples]);
  if (data.length < 2) return null;

  const tMax = data[data.length - 1].t;
  const y = niceScale(Math.max(...data.map((d) => Math.max(d.wpm, d.raw))));
  const errMax = Math.max(1, ...data.map((d) => d.errors));
  const totalErrors = data.reduce((a, d) => a + d.errors, 0);
  const peak = data.reduce((a, d) => (d.raw > a.raw ? d : a), data[0]);

  const innerW = width - M.left - M.right;
  const x = (t: number) => M.left + (t / tMax) * innerW;
  const yMain = (v: number) => M.top + H_MAIN - (v / y.max) * H_MAIN;
  const errTop = M.top + H_MAIN + GAP;
  const totalH = errTop + H_ERR + M.bottom;

  const path = (key: 'wpm' | 'raw') => data.map((d, i) => `${i ? 'L' : 'M'}${x(d.t).toFixed(1)} ${yMain(d[key]).toFixed(1)}`).join('');
  const yTicks = Array.from({ length: y.max / y.step + 1 }, (_, i) => i * y.step);
  const tStep = timeStep(tMax);
  const xTicks = Array.from({ length: Math.floor(tMax / tStep) + 1 }, (_, i) => i * tStep);

  // Direct end labels; nudge apart when the two lines finish close together.
  const last = data[data.length - 1];
  let wpmY = yMain(last.wpm);
  let rawY = yMain(last.raw);
  if (Math.abs(wpmY - rawY) < 16) {
    const mid = (wpmY + rawY) / 2;
    wpmY = last.wpm >= last.raw ? mid - 8 : mid + 8;
    rawY = last.wpm >= last.raw ? mid + 8 : mid - 8;
  }

  const barW = Math.max(3, Math.min(14, (innerW / data.length) * 0.5));

  const pick = (clientX: number) => {
    const svg = boxRef.current?.querySelector('svg');
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const px = ((clientX - rect.left) / rect.width) * width;
    let best = 0;
    for (let i = 1; i < data.length; i++) if (Math.abs(x(data[i].t) - px) < Math.abs(x(data[best].t) - px)) best = i;
    setHover(best);
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      setHover((h) => {
        const cur = h ?? (e.key === 'ArrowRight' ? -1 : data.length);
        return Math.min(data.length - 1, Math.max(0, cur + (e.key === 'ArrowRight' ? 1 : -1)));
      });
    } else if (e.key === 'Escape') setHover(null);
  };

  const h = hover !== null ? data[hover] : null;
  // Place the tooltip beside the crosshair (never on top of the points it describes).
  const tipOnLeft = h ? x(h.t) > width * 0.6 : false;
  const tipLeft = h ? (tipOnLeft ? x(h.t) - 14 : x(h.t) + 14) : 0;
  const isLast = (i: number) => i === data.length - 1;
  const fmtT = (d: Sample, i: number) => (isLast(i) && d.t % 1 > 0.05 ? `${d.t.toFixed(1)} s` : `${Math.round(d.t)} s`);
  const summary = `WPM over ${Math.round(tMax)} seconds. Final speed ${last.wpm} WPM. Fastest one-second burst ${peak.raw} raw WPM at ${Math.round(peak.t)} seconds. ${totalErrors} mistyped key${totalErrors === 1 ? '' : 's'}.`;

  return (
    <figure class="tchart">
      <figcaption class="tchart-head">
        <span class="tchart-title">Speed over time</span>
        <span class="tchart-legend" aria-hidden="true">
          <span><i class="sw wpm" /> WPM (correct words)</span>
          <span><i class="sw raw" /> Raw WPM (all keystrokes)</span>
          <span><i class="sw err">×</i> Mistyped keys</span>
        </span>
      </figcaption>
      <div
        class="tchart-box"
        ref={boxRef}
        tabIndex={0}
        role="img"
        aria-label={`${summary} Use the left and right arrow keys to read each second.`}
        onPointerMove={(e) => pick(e.clientX)}
        onPointerDown={(e) => pick(e.clientX)}
        onPointerLeave={(e) => e.pointerType === 'mouse' && setHover(null)}
        onKeyDown={onKey}
        onBlur={() => setHover(null)}
      >
        <svg width={width} height={totalH} viewBox={`0 0 ${width} ${totalH}`} aria-hidden="true">
          {/* WPM grid + axis */}
          {yTicks.map((v) => (
            <g key={v}>
              <line class={v === 0 ? 'axis' : 'grid'} x1={M.left} x2={M.left + innerW} y1={yMain(v)} y2={yMain(v)} />
              <text class="tick" x={M.left - 8} y={yMain(v) + 4} text-anchor="end">{v}</text>
            </g>
          ))}
          <text class="axis-label" x={12} y={M.top + H_MAIN / 2} transform={`rotate(-90 12 ${M.top + H_MAIN / 2})`} text-anchor="middle">Words per minute</text>

          {/* Lines */}
          <path class="line raw" d={path('raw')} />
          <path class="line wpm" d={path('wpm')} />
          <circle class="end wpm" cx={x(last.t)} cy={yMain(last.wpm)} r={4} />
          <circle class="end raw" cx={x(last.t)} cy={yMain(last.raw)} r={4} />
          <text class="end-label" x={x(last.t) + 9} y={wpmY + 4}>{last.wpm} WPM</text>
          <text class="end-label muted" x={x(last.t) + 9} y={rawY + 4}>{last.raw} raw</text>

          {/* Error strip (own small scale, shares the time axis) */}
          <text class="tick" x={M.left - 8} y={errTop + 10} text-anchor="end">{errMax}</text>
          <text class="tick" x={M.left - 8} y={errTop + H_ERR + 4} text-anchor="end">0</text>
          <text class="strip-label" x={M.left + innerW + 8} y={errTop + H_ERR / 2 + 4}>{totalErrors} mistyped</text>
          <line class="axis" x1={M.left} x2={M.left + innerW} y1={errTop + H_ERR} y2={errTop + H_ERR} />
          {data.map((d, i) =>
            d.errors > 0 ? (
              <g key={i}>
                <rect class="err-bar" x={x(d.t) - barW / 2} y={errTop + H_ERR - (d.errors / errMax) * H_ERR} width={barW} height={(d.errors / errMax) * H_ERR} rx={2} />
                <text class="err-x" x={x(d.t)} y={errTop - 4} text-anchor="middle">×</text>
              </g>
            ) : null,
          )}

          {/* Time axis */}
          {xTicks.map((t) => (
            <text key={t} class="tick" x={x(t)} y={errTop + H_ERR + 18} text-anchor="middle">{t}s</text>
          ))}

          {/* Crosshair */}
          {h && (
            <g class="cross">
              <line x1={x(h.t)} x2={x(h.t)} y1={M.top} y2={errTop + H_ERR} />
              <circle class="dot wpm" cx={x(h.t)} cy={yMain(h.wpm)} r={5} />
              <circle class="dot raw" cx={x(h.t)} cy={yMain(h.raw)} r={5} />
            </g>
          )}
        </svg>
        {h && (
          <div class="tchart-tip" style={{ left: `${tipLeft}px`, transform: tipOnLeft ? 'translateX(-100%)' : 'none' }} role="status">
            <strong>{fmtT(h, hover!)}</strong>
            <span><i class="sw wpm" /> {h.wpm} WPM</span>
            <span><i class="sw raw" /> {h.raw} raw</span>
            <span><i class="sw err">×</i> {h.errors} mistyped key{h.errors === 1 ? '' : 's'}</span>
          </div>
        )}
      </div>
      <p class="tchart-note">
        <strong>WPM</strong> is your average speed so far, counting only correctly typed words. <strong>Raw</strong> is how fast you typed during
        each second, mistakes included. <strong>Mistyped keys</strong> counts every wrong keystroke, including ones you fixed and the space after a misspelled word. Hover over or tap the chart to read any second.
      </p>
      <details class="tchart-table">
        <summary>Show the numbers</summary>
        <div class="table-wrap">
          <table class="data">
            <thead>
              <tr><th scope="col">Time</th><th scope="col">WPM</th><th scope="col">Raw WPM</th><th scope="col">Mistyped keys</th></tr>
            </thead>
            <tbody>
              {data.map((d, i) => (
                <tr key={i}>
                  <td>{fmtT(d, i)}</td>
                  <td class="num">{d.wpm}</td>
                  <td class="num">{d.raw}</td>
                  <td class="num">{d.errors}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  );
}
