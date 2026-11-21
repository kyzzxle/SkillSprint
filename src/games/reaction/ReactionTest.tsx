import { useEffect, useRef, useState } from 'preact/hooks';
import { recordResult, type RecordOutcome } from '../../lib/storage';
import { Icon, PersonalBest, ResultsPanel, Segmented, Instructions } from '../../components/ui';
import { useBest, usePrefs } from '../../components/ui/hooks';
import { randomDelay, summarize } from './stats';
import './reaction.css';

type State = 'idle' | 'waiting' | 'go' | 'early' | 'shown' | 'done';

export default function ReactionTest() {
  const [prefs, setPrefs] = usePrefs('reaction', { rounds: 5 });
  const variant = `${prefs.rounds} rounds`;
  const [state, setState] = useState<State>('idle');
  const [times, setTimes] = useState<number[]>([]);
  const [last, setLast] = useState<number | null>(null);
  const [early, setEarly] = useState(0);
  const [outcome, setOutcome] = useState<RecordOutcome | undefined>();
  const [ver, setVer] = useState(0);
  const best = useBest('reaction', variant, ver);
  const stageRef = useRef<HTMLDivElement>(null);
  const timer = useRef<number | undefined>(undefined);
  const shownAt = useRef(0);
  const stateRef = useRef<State>('idle');
  const timesRef = useRef<number[]>([]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const go = (s: State) => {
    stateRef.current = s;
    setState(s);
  };

  const arm = () => {
    window.clearTimeout(timer.current);
    shownAt.current = 0;
    go('waiting');
    timer.current = window.setTimeout(() => {
      // Change the colour directly on the DOM for minimum latency, then timestamp the frame that paints it.
      const el = stageRef.current;
      if (el) el.dataset.state = 'go';
      go('go');
      requestAnimationFrame((ts) => {
        shownAt.current = ts;
      });
    }, randomDelay());
  };

  const startGame = () => {
    timesRef.current = [];
    setTimes([]);
    setEarly(0);
    setLast(null);
    setOutcome(undefined);
    arm();
    requestAnimationFrame(() => stageRef.current?.focus({ preventScroll: true }));
  };

  const respond = (eventTime: number) => {
    const s = stateRef.current;
    if (s === 'idle') return startGame();
    if (s === 'waiting') {
      window.clearTimeout(timer.current);
      setEarly((n) => n + 1);
      go('early');
      return;
    }
    if (s === 'early' || s === 'shown') return arm();
    if (s === 'go') {
      // If the click lands before the paint callback ran, fall back to the event time (conservative).
      const t0 = shownAt.current || eventTime;
      const rt = Math.max(0, Math.round(eventTime - t0));
      const next = [...timesRef.current, rt];
      timesRef.current = next;
      setTimes(next);
      setLast(rt);
      if (next.length >= prefs.rounds) {
        const avg = Math.round(summarize(next).average);
        setOutcome(recordResult({ gameId: 'reaction', variant, score: avg, display: `${avg} ms`, better: 'lower', url: '/reaction-time/' }));
        setVer((v) => v + 1);
        go('done');
      } else {
        go('shown');
      }
    }
  };

  const onPointerDown = (e: PointerEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();
    respond(e.timeStamp);
  };
  const onKeyDown = (e: KeyboardEvent) => {
    if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
      e.preventDefault();
      respond(e.timeStamp);
    }
  };

  if (state === 'done') {
    const s = summarize(times);
    const max = Math.max(...times, 1);
    return (
      <ResultsPanel
        title="Average reaction time"
        score={Math.round(s.average)}
        unit="ms"
        subtitle={`${prefs.rounds} rounds${early ? ` · ${early} early click${early > 1 ? 's' : ''} (rounds repeated)` : ''}`}
        outcome={outcome}
        stats={[
          { k: 'Fastest', v: `${Math.round(s.fastest)} ms` },
          { k: 'Slowest', v: `${Math.round(s.slowest)} ms` },
          { k: 'Median', v: `${Math.round(s.median)} ms` },
          { k: 'Early clicks', v: early },
        ]}
        onRestart={startGame}
        onSettings={() => go('idle')}
      >
        <div>
          <h3>Round by round</h3>
          <ol class="rt-bars list-plain">
            {times.map((t, i) => (
              <li key={i}>
                <span class="muted">#{i + 1}</span>
                <span class="bar" style={{ width: `${Math.max(2, (t / max) * 100)}%` }} />
                <span class="mono">{t} ms</span>
              </li>
            ))}
          </ol>
          <p class="muted" style={{ fontSize: '0.85rem', marginTop: '0.75rem' }}>
            Measured from the frame in which the green screen was drawn to your click, tap or key press. Your display, browser and input
            device add some latency of their own, so compare results on the same device.
          </p>
        </div>
      </ResultsPanel>
    );
  }

  const labels: Record<Exclude<State, 'done'>, { title: string; sub: string; icon: string }> = {
    idle: { title: 'Reaction Time Test', sub: 'Click, tap or press Space to start.', icon: 'reaction' },
    waiting: { title: 'Wait for green…', sub: 'Do not click yet.', icon: 'clock' },
    go: { title: 'Click!', sub: 'Now!', icon: 'reaction' },
    early: { title: 'Too soon!', sub: 'You clicked before the screen turned green. Click to retry this round.', icon: 'x' },
    shown: { title: `${last ?? 0} ms`, sub: 'Click to continue.', icon: 'check' },
  };
  const l = labels[state];

  return (
    <div class="reaction">
      <div class="reaction-top">
        {state === 'idle' ? (
          <Segmented
            label="Rounds"
            hideLabel
            value={prefs.rounds}
            onChange={(v) => setPrefs({ rounds: v })}
            options={[{ value: 5, label: '5 rounds' }, { value: 10, label: '10 rounds' }]}
          />
        ) : (
          <span class="chip">
            Round {Math.min(times.length + 1, prefs.rounds)} of {prefs.rounds}
          </span>
        )}
        <PersonalBest best={best} label="Best average" />
      </div>
      <div
        ref={stageRef}
        class="reaction-stage"
        data-state={state}
        role="button"
        tabIndex={0}
        aria-label={`${l.title}. ${l.sub}`}
        onPointerDown={onPointerDown}
        onKeyDown={onKeyDown}
      >
        <Icon name={l.icon} class="rs-icon" />
        <div class="rs-title" aria-live="assertive">
          {l.title}
        </div>
        <div class="rs-sub">{l.sub}</div>
        {times.length > 0 && state !== 'idle' && <div class="rs-times mono">{times.join(' · ')}</div>}
      </div>
      {state === 'idle' && (
        <Instructions
          items={[
            'Click or tap the box (or press Space) to start. The box turns red.',
            'After a random delay it turns green — react as fast as you can.',
            'Clicking while it is red is an early click; that round is repeated.',
            'Your score is the average of all rounds. Lower is better.',
          ]}
        />
      )}
    </div>
  );
}
