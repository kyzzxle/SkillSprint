import { useEffect, useRef, useState } from 'preact/hooks';
import { defaultRng } from '../../lib/random';
import { recordResult, type RecordOutcome } from '../../lib/storage';
import { Icon, Progress, ResultsPanel, SetupPanel, StatInline } from '../../components/ui';
import { useBest, useCountdown } from '../../components/ui/hooks';
import { numberShowTime, randomNumber } from './logic';
import './memory.css';

type Phase = 'setup' | 'show' | 'input' | 'feedback' | 'done';

export default function NumberMemory() {
  const [phase, setPhase] = useState<Phase>('setup');
  const [digits, setDigits] = useState(1);
  const [num, setNum] = useState('');
  const [answer, setAnswer] = useState('');
  const [ok, setOk] = useState(false);
  const [outcome, setOutcome] = useState<RecordOutcome>();
  const [ver, setVer] = useState(0);
  const best = useBest('number-memory', 'classic', ver);
  const inputRef = useRef<HTMLInputElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const showMs = numberShowTime(digits);

  const { remaining } = useCountdown(showMs, phase === 'show', () => setPhase('input'));

  useEffect(() => {
    if (phase === 'input') inputRef.current?.focus();
    if (phase === 'feedback') nextRef.current?.focus();
  }, [phase]);

  const round = (d: number) => {
    setDigits(d);
    setNum(randomNumber(defaultRng, d));
    setAnswer('');
    setPhase('show');
  };

  const start = () => {
    setOutcome(undefined);
    round(1);
  };

  const submit = (e: Event) => {
    e.preventDefault();
    if (phase !== 'input') return;
    const correct = answer.trim() === num;
    setOk(correct);
    setPhase('feedback');
  };

  const next = () => {
    if (ok) {
      round(digits + 1);
    } else {
      const score = digits - 1;
      setOutcome(recordResult({ gameId: 'number-memory', variant: 'classic', score, display: `${score} digits`, better: 'higher', url: '/memory/number-memory/' }));
      setVer((v) => v + 1);
      setPhase('done');
    }
  };

  if (phase === 'setup') {
    return (
      <SetupPanel
        title="Number Memory"
        subtitle="How many digits can you hold in your head?"
        onStart={start}
        best={best}
        bestLabel="Best"
        instructions={[
          'A number appears for a few seconds. Memorise it.',
          'When it disappears, type it in and press Enter.',
          'Each correct answer adds one digit. One mistake ends the game.',
          'Most adults can hold about 7 digits — chunking digits into groups of two or three helps.',
        ]}
      />
    );
  }

  if (phase === 'done') {
    const score = digits - 1;
    return (
      <ResultsPanel
        title="Number Memory"
        score={score}
        unit="digits"
        subtitle={`You correctly recalled numbers up to ${score} digit${score === 1 ? '' : 's'} long.`}
        outcome={outcome}
        onRestart={start}
      >
        <div class="num-compare">
          <div class="muted">Last number</div>
          <div class="mono">{num}</div>
          <div class="muted">Your answer</div>
          <div class="mono">
            <DiffDigits target={num} given={answer} />
          </div>
        </div>
      </ResultsPanel>
    );
  }

  return (
    <div class="mem">
      <div class="mem-top">
        <div style={{ display: 'flex', gap: '1.25rem' }}>
          <StatInline k="Digits" v={digits} accent />
          <StatInline k="Best" v={best ? best.score : '—'} />
        </div>
      </div>

      {phase === 'show' && (
        <>
          <div class="num-display" aria-live="polite">
            {num}
          </div>
          <div class="num-timer">
            <Progress value={remaining} max={showMs} label="Time left to memorise" />
          </div>
        </>
      )}

      {phase === 'input' && (
        <form class="num-form" onSubmit={submit}>
          <label for="num-answer" class="sr-only">
            What was the number?
          </label>
          <input
            id="num-answer"
            ref={inputRef}
            class="input"
            inputMode="numeric"
            autoComplete="off"
            placeholder="What was the number?"
            value={answer}
            onInput={(e) => setAnswer((e.target as HTMLInputElement).value.replace(/\D/g, ''))}
          />
          <button type="submit" class="btn btn-primary" disabled={!answer}>
            Submit
          </button>
        </form>
      )}

      {phase === 'feedback' && (
        <div class="num-compare" role="status">
          <div class={`feedback ${ok ? 'good' : 'bad'}`}>
            <div class="fb-title">
              <Icon name={ok ? 'check' : 'x'} /> {ok ? 'Correct!' : 'Not quite'}
            </div>
          </div>
          <div class="muted">Number</div>
          <div class="mono">{num}</div>
          <div class="muted">Your answer</div>
          <div class="mono">
            <DiffDigits target={num} given={answer} />
          </div>
          <div class="btn-row center" style={{ marginTop: '0.75rem' }}>
            <button type="button" ref={nextRef} class="btn btn-primary" onClick={next}>
              {ok ? `Next: ${digits + 1} digits` : 'See results'} <Icon name="arrow" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function DiffDigits({ target, given }: { target: string; given: string }) {
  if (!given) return <em>no answer</em>;
  return (
    <>
      {given.split('').map((d, i) => (
        <span key={i} class={d === target[i] ? '' : 'bad'}>
          {d}
        </span>
      ))}
    </>
  );
}
