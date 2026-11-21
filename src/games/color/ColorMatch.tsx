import { useEffect, useRef, useState } from 'preact/hooks';
import { defaultRng } from '../../lib/random';
import { recordResult, type RecordOutcome } from '../../lib/storage';
import { Icon, Progress, ResultsPanel, Segmented, SetupPanel, StatInline } from '../../components/ui';
import { useBest, useCountdown, usePrefs } from '../../components/ui/hooks';
import { colorDistance, hslToRgb, matchAccuracy, randomColor, rgbText, rgbToHex, type RGB } from './color';
import './color.css';

type Phase = 'setup' | 'play' | 'reveal' | 'done';
const ROUNDS = 5;
const VIEW_MS: Record<string, number> = { easy: 0, medium: 10000, hard: 4000 };

interface RoundResult { target: RGB; guess: RGB; dE: number; acc: number }

export default function ColorMatch() {
  const [p, set] = usePrefs('color-match', { model: 'rgb', level: 'easy' });
  const variant = `${p.model.toUpperCase()} sliders · ${p.level}`;
  const [phase, setPhase] = useState<Phase>('setup');
  const [round, setRound] = useState(0);
  const [target, setTarget] = useState<RGB>({ r: 128, g: 128, b: 128 });
  const [vals, setVals] = useState<[number, number, number]>([128, 128, 128]);
  const [results, setResults] = useState<RoundResult[]>([]);
  const [hidden, setHidden] = useState(false);
  const [outcome, setOutcome] = useState<RecordOutcome>();
  const [ver, setVer] = useState(0);
  const best = useBest('color-match', variant, ver);
  const nextRef = useRef<HTMLButtonElement>(null);

  const viewMs = VIEW_MS[p.level] ?? 0;
  const { remaining } = useCountdown(viewMs || 1, phase === 'play' && viewMs > 0 && !hidden, () => setHidden(true));

  const guess: RGB = p.model === 'rgb' ? { r: vals[0], g: vals[1], b: vals[2] } : hslToRgb({ h: vals[0], s: vals[1], l: vals[2] });

  const newRound = (i: number) => {
    setRound(i);
    setTarget(randomColor(defaultRng));
    setVals(p.model === 'rgb' ? [128, 128, 128] : [180, 50, 50]);
    setHidden(false);
    setPhase('play');
  };

  const start = () => {
    setResults([]);
    setOutcome(undefined);
    newRound(0);
  };

  const submit = () => {
    const dE = colorDistance(target, guess);
    setResults((r) => [...r, { target, guess, dE, acc: matchAccuracy(dE) }]);
    setPhase('reveal');
  };

  useEffect(() => {
    if (phase === 'reveal') nextRef.current?.focus();
  }, [phase]);

  const next = () => {
    if (round + 1 < ROUNDS) newRound(round + 1);
    else {
      const avg = results.reduce((a, r) => a + r.acc, 0) / results.length;
      const score = Math.round(avg * 10) / 10;
      setOutcome(recordResult({ gameId: 'color-match', variant, score, display: `${score.toFixed(1)}%`, better: 'higher', url: '/color/color-match/' }));
      setVer((v) => v + 1);
      setPhase('done');
    }
  };

  if (phase === 'setup') {
    return (
      <SetupPanel
        title="Color Match"
        subtitle="Recreate the target colour as closely as you can."
        onStart={start}
        best={best}
        bestLabel="Best average accuracy"
        instructions={[
          `${ROUNDS} rounds. Move the sliders until your colour matches the target, then press Submit.`,
          'Accuracy uses CIEDE2000, a standard measure of how different two colours look to the human eye: 100% is a perfect match and every ΔE unit costs 2%.',
          'Easy keeps the target on screen. Medium hides it after 10 seconds, Hard after 4 seconds — you have to remember it.',
        ]}
      >
        <Segmented label="Sliders" value={p.model} onChange={(v) => set({ model: v })}
          options={[{ value: 'rgb', label: 'RGB (red, green, blue)' }, { value: 'hsl', label: 'HSL (hue, saturation, lightness)' }]} />
        <Segmented label="Difficulty" value={p.level} onChange={(v) => set({ level: v })}
          options={[{ value: 'easy', label: 'Easy' }, { value: 'medium', label: 'Medium' }, { value: 'hard', label: 'Hard' }]} />
      </SetupPanel>
    );
  }

  if (phase === 'done') {
    const avg = results.reduce((a, r) => a + r.acc, 0) / results.length;
    return (
      <ResultsPanel
        title="Color Match"
        score={avg.toFixed(1)}
        unit="%"
        subtitle={`Average accuracy over ${ROUNDS} rounds · ${variant}`}
        outcome={outcome}
        stats={[
          { k: 'Best round', v: `${Math.max(...results.map((r) => r.acc)).toFixed(1)}%` },
          { k: 'Avg ΔE₀₀', v: (results.reduce((a, r) => a + r.dE, 0) / results.length).toFixed(1) },
        ]}
        onRestart={start}
        onSettings={() => setPhase('setup')}
      >
        <ol class="match-list list-plain">
          {results.map((r, i) => (
            <li key={i}>
              <span class="pair">
                <span class="swatch" style={{ background: rgbToHex(r.target) }} title={`Target ${rgbToHex(r.target)}`} />
                <span class="swatch" style={{ background: rgbToHex(r.guess) }} title={`Yours ${rgbToHex(r.guess)}`} />
              </span>
              <span class="mono">{rgbToHex(r.target)} → {rgbToHex(r.guess)}</span>
              <strong class="mono">{r.acc.toFixed(1)}%</strong>
            </li>
          ))}
        </ol>
      </ResultsPanel>
    );
  }

  const sliders =
    p.model === 'rgb'
      ? [
          { name: 'Red', max: 255, unit: '' },
          { name: 'Green', max: 255, unit: '' },
          { name: 'Blue', max: 255, unit: '' },
        ]
      : [
          { name: 'Hue', max: 359, unit: '°' },
          { name: 'Saturation', max: 100, unit: '%' },
          { name: 'Lightness', max: 100, unit: '%' },
        ];
  const last = results[results.length - 1];

  return (
    <div class="match">
      <div class="game-top">
        <div class="stats-inline">
          <StatInline k="Round" v={`${round + 1}/${ROUNDS}`} accent />
          <StatInline k="Average" v={results.length ? `${(results.reduce((a, r) => a + r.acc, 0) / results.length).toFixed(1)}%` : '—'} />
        </div>
      </div>
      <div class="match-swatches">
        <figure>
          {hidden && phase === 'play' ? (
            <div class="swatch xl hidden-target">
              <Icon name="memory" /> Hidden — from memory!
            </div>
          ) : (
            <div class="swatch xl" style={{ background: rgbToHex(target) }} role="img" aria-label="Target colour" />
          )}
          <figcaption>Target{phase === 'reveal' ? ` · ${rgbToHex(target)}` : ''}</figcaption>
          {phase === 'play' && viewMs > 0 && !hidden && <Progress value={remaining} max={viewMs} label="Time before the target hides" />}
        </figure>
        <figure>
          <div class="swatch xl" style={{ background: rgbToHex(guess) }} role="img" aria-label="Your colour" />
          <figcaption>Yours · <span class="mono">{phase === 'reveal' || p.level === 'easy' ? rgbToHex(guess) : '••••••'}</span></figcaption>
        </figure>
      </div>

      {phase === 'play' && (
        <div class="sliders">
          {sliders.map((s, i) => (
            <label key={s.name} class={`slider s-${p.model}-${i}`}>
              <span class="s-name">{s.name}</span>
              <input
                type="range"
                min={0}
                max={s.max}
                value={vals[i]}
                onInput={(e) => {
                  const v = Number((e.target as HTMLInputElement).value);
                  setVals((old) => {
                    const n = [...old] as [number, number, number];
                    n[i] = v;
                    return n;
                  });
                }}
                aria-valuetext={`${vals[i]}${s.unit}`}
              />
              <span class="mono s-val">{vals[i]}{s.unit}</span>
            </label>
          ))}
          <div class="btn-row center">
            <button type="button" class="btn btn-primary btn-lg" onClick={submit}>
              <Icon name="check" /> Submit match
            </button>
          </div>
        </div>
      )}

      {phase === 'reveal' && last && (
        <div class="feedback good" role="status" style={{ textAlign: 'center' }}>
          <div class="fb-title" style={{ justifyContent: 'center' }}>{last.acc.toFixed(1)}% accurate</div>
          <p>
            Colour difference ΔE₀₀ = {last.dE.toFixed(1)}. Target {rgbText(last.target)}, yours {rgbText(last.guess)}.
            {last.dE < 2 ? ' That is nearly indistinguishable!' : last.dE < 5 ? ' Very close.' : last.dE < 12 ? ' Noticeably different, but in the right area.' : ' Clearly different — check the hue first.'}
          </p>
          <div class="btn-row center">
            <button type="button" ref={nextRef} class="btn btn-primary" onClick={next}>
              {round + 1 < ROUNDS ? 'Next colour' : 'See results'} <Icon name="arrow" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
