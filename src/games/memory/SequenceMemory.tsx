import { useEffect, useRef, useState } from 'preact/hooks';
import { defaultRng } from '../../lib/random';
import { recordResult, type RecordOutcome } from '../../lib/storage';
import { ResultsPanel, SetupPanel, StatInline } from '../../components/ui';
import { useBest, useKeydown, isTypingTarget } from '../../components/ui/hooks';
import { extendSequence, flashTiming } from './logic';
import './memory.css';

type Phase = 'setup' | 'show' | 'input' | 'between' | 'done';

export default function SequenceMemory() {
  const [phase, setPhase] = useState<Phase>('setup');
  const [seq, setSeq] = useState<number[]>([]);
  const [pos, setPos] = useState(0);
  const [lit, setLit] = useState<number | null>(null);
  const [wrong, setWrong] = useState<number | null>(null);
  const [outcome, setOutcome] = useState<RecordOutcome>();
  const [ver, setVer] = useState(0);
  const best = useBest('sequence-memory', 'classic', ver);
  const timers = useRef<number[]>([]);

  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };
  useEffect(() => clearTimers, []);
  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));

  const play = (s: number[]) => {
    clearTimers();
    setSeq(s);
    setPos(0);
    setPhase('show');
    const { on, off } = flashTiming(s.length);
    let t = 600;
    s.forEach((tile) => {
      later(() => setLit(tile), t);
      later(() => setLit(null), t + on);
      t += on + off;
    });
    later(() => setPhase('input'), t);
  };

  const start = () => {
    setWrong(null);
    setOutcome(undefined);
    play(extendSequence(defaultRng, []));
  };

  const finish = (s: number[]) => {
    const level = s.length - 1; // levels fully completed
    setOutcome(recordResult({ gameId: 'sequence-memory', variant: 'classic', score: level, display: `Level ${level}`, better: 'higher', url: '/memory/' }));
    setVer((v) => v + 1);
    setPhase('done');
  };

  const press = (tile: number) => {
    if (phase !== 'input') return;
    if (seq[pos] !== tile) {
      setWrong(tile);
      setPhase('between');
      later(() => finish(seq), 900);
      return;
    }
    setLit(tile);
    later(() => setLit((l) => (l === tile ? null : l)), 180);
    if (pos + 1 === seq.length) {
      setPhase('between');
      later(() => play(extendSequence(defaultRng, seq)), 700);
    } else {
      setPos(pos + 1);
    }
  };

  useKeydown((e) => {
    if (phase !== 'input' || isTypingTarget(e.target) || e.ctrlKey || e.metaKey || e.altKey) return;
    const n = Number(e.key);
    if (n >= 1 && n <= 9) {
      e.preventDefault();
      press(n - 1);
    }
  });

  if (phase === 'setup') {
    return (
      <SetupPanel
        title="Sequence Memory"
        subtitle="Memorise the order in which tiles light up, then repeat it."
        onStart={start}
        best={best}
        bestLabel="Best level"
        instructions={[
          'Watch the tiles flash one after another.',
          'Repeat the sequence by clicking the tiles in the same order (or press keys 1–9, left to right, top to bottom).',
          'Each level adds one more step and the flashes get slightly faster.',
          'One mistake ends the game. Your score is the last level you completed.',
        ]}
      />
    );
  }

  if (phase === 'done') {
    const level = seq.length - 1;
    return (
      <ResultsPanel
        title="Sequence Memory"
        score={`Level ${level}`}
        subtitle={level === 0 ? 'Keep practising — it gets easier!' : `You remembered a sequence of ${level} step${level === 1 ? '' : 's'}.`}
        outcome={outcome}
        stats={[
          { k: 'Levels completed', v: level },
          { k: 'Failed at', v: `Step ${pos + 1} of ${seq.length}` },
        ]}
        onRestart={start}
      />
    );
  }

  const status =
    phase === 'show' ? 'Watch carefully…' : phase === 'input' ? `Your turn — ${pos} of ${seq.length}` : wrong !== null ? 'Wrong tile!' : 'Correct!';

  return (
    <div class="mem">
      <div class="mem-top">
        <div class="stats-inline" style={{ display: 'flex', gap: '1.25rem' }}>
          <StatInline k="Level" v={seq.length} accent />
          <StatInline k="Best" v={best ? best.score : '—'} />
        </div>
      </div>
      <div class="mem-status" role="status" aria-live="polite">
        {status}
      </div>
      <div class="tile-grid" style={{ '--n': 3 }} role="group" aria-label="Sequence tiles">
        {Array.from({ length: 9 }, (_, i) => (
          <button
            type="button"
            key={i}
            class={`tile ${lit === i ? 'lit' : ''} ${wrong === i ? 'miss' : ''} ${wrong !== null && seq[pos] === i ? 'reveal' : ''}`}
            aria-label={`Tile ${i + 1}`}
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
        ))}
      </div>
    </div>
  );
}
