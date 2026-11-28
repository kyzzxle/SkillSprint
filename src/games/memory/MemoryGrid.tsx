import { useEffect, useRef, useState } from 'preact/hooks';
import { defaultRng } from '../../lib/random';
import { recordResult, type RecordOutcome } from '../../lib/storage';
import { ResultsPanel, SetupPanel, StatInline } from '../../components/ui';
import { useBest } from '../../components/ui/hooks';
import { gridForLevel, pickTiles } from './logic';
import { sfx } from '../../lib/sound';
import './memory.css';

type Phase = 'setup' | 'show' | 'input' | 'pause' | 'done';
const LIVES = 3;
const MISSES_PER_LEVEL = 3;

export default function MemoryGrid() {
  const [phase, setPhase] = useState<Phase>('setup');
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(LIVES);
  const [targets, setTargets] = useState<number[]>([]);
  const [hits, setHits] = useState<number[]>([]);
  const [misses, setMisses] = useState<number[]>([]);
  const [reveal, setReveal] = useState(false);
  const [message, setMessage] = useState('');
  const [outcome, setOutcome] = useState<RecordOutcome>();
  const [ver, setVer] = useState(0);
  const best = useBest('memory-grid', 'classic', ver);
  const timers = useRef<number[]>([]);
  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));
  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const { size, count } = gridForLevel(level);

  const begin = (lvl: number) => {
    const g = gridForLevel(lvl);
    setLevel(lvl);
    setTargets(pickTiles(defaultRng, g.size, g.count));
    setHits([]);
    setMisses([]);
    setReveal(false);
    setMessage('Memorise the highlighted tiles…');
    setPhase('show');
    later(() => {
      setPhase('input');
      setMessage(`Find all ${g.count} tiles`);
    }, 1000 + g.count * 120);
  };

  const start = () => {
    setLives(LIVES);
    setOutcome(undefined);
    begin(1);
  };

  const finish = (completed: number) => {
    setOutcome(recordResult({ gameId: 'memory-grid', variant: 'classic', score: completed, display: `Level ${completed}`, better: 'higher', url: '/memory/memory-grid/' }));
    setVer((v) => v + 1);
    setPhase('done');
  };

  const press = (i: number) => {
    if (phase !== 'input' || hits.includes(i) || misses.includes(i)) return;
    if (targets.includes(i)) {
      const h = [...hits, i];
      sfx.blip(h.length - 1);
      setHits(h);
      if (h.length === targets.length) {
        setPhase('pause');
        setMessage('Level complete!');
        later(() => begin(level + 1), 700);
      }
    } else {
      const m = [...misses, i];
      sfx.wrong();
      setMisses(m);
      if (m.length >= MISSES_PER_LEVEL) {
        const left = lives - 1;
        setLives(left);
        setReveal(true);
        setPhase('pause');
        setMessage(left > 0 ? `Too many misses — ${left} ${left === 1 ? 'life' : 'lives'} left` : 'Out of lives!');
        later(() => (left > 0 ? begin(level) : finish(level - 1)), 1500);
      }
    }
  };

  if (phase === 'setup') {
    return (
      <SetupPanel
        title="Memory Grid"
        subtitle="Remember where the tiles light up."
        onStart={start}
        best={best}
        bestLabel="Best level"
        instructions={[
          'Some tiles light up briefly. Memorise their positions.',
          'Click every tile that was lit. Order does not matter.',
          'Each level adds a tile, and the grid grows from 3×3 up to 7×7.',
          `Three wrong clicks in a level costs a life. You have ${LIVES} lives.`,
        ]}
      />
    );
  }

  if (phase === 'done') {
    const completed = level - 1;
    return (
      <ResultsPanel
        title="Memory Grid"
        score={`Level ${completed}`}
        subtitle={`Highest pattern remembered: ${completed > 0 ? gridForLevel(completed).count : 0} tiles`}
        outcome={outcome}
        stats={[
          { k: 'Levels completed', v: completed },
          { k: 'Final grid', v: `${size}×${size}` },
        ]}
        onRestart={start}
      />
    );
  }

  return (
    <div class="mem">
      <div class="mem-top">
        <div style={{ display: 'flex', gap: '1.25rem' }}>
          <StatInline k="Level" v={level} accent />
          <StatInline k="Tiles" v={`${hits.length}/${count}`} />
          <StatInline k="Misses" v={`${misses.length}/${MISSES_PER_LEVEL}`} />
        </div>
        <span class="lives" aria-label={`${lives} of ${LIVES} lives left`} role="img">
          {Array.from({ length: LIVES }, (_, i) => (
            <span key={i} class={i < lives ? '' : 'lost'} />
          ))}
        </span>
      </div>
      <div class="mem-status" role="status" aria-live="polite">
        {message}
      </div>
      <div class="tile-grid" style={{ '--n': size }} role="group" aria-label={`${size} by ${size} grid`}>
        {Array.from({ length: size * size }, (_, i) => {
          const isTarget = targets.includes(i);
          let cls = 'tile';
          if (phase === 'show' && isTarget) cls += ' lit';
          if (hits.includes(i)) cls += ' hit';
          if (misses.includes(i)) cls += ' miss';
          if (reveal && isTarget && !hits.includes(i)) cls += ' reveal';
          return (
            <button
              type="button"
              key={`${level}-${i}`}
              class={cls}
              aria-label={`Row ${Math.floor(i / size) + 1}, column ${(i % size) + 1}`}
              disabled={phase !== 'input'}
              onPointerDown={(e) => {
                e.preventDefault();
                press(i);
              }}
              onClick={(e) => {
                // Keyboard and assistive-technology activation (pointer input is handled on pointerdown).
                if (e.detail === 0) press(i);
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
