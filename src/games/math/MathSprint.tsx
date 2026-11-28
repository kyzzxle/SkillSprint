import { useEffect, useState } from 'preact/hooks';
import { loadWeak, mergeTallies, saveWeak, talliesFromAnswers, weakestOps, type Ranked } from '../../lib/weakspots';
import { defaultRng, type Rng } from '../../lib/random';
import { recordResult, type RecordOutcome } from '../../lib/storage';
import { Countdown, ResultsPanel, ReviewList, Segmented, SetupPanel } from '../../components/ui';
import { QuizRunner, type QuizQuestion, type QuizSummary } from '../../components/ui/QuizRunner';
import { useBest, usePrefs } from '../../components/ui/hooks';
import { formatDuration } from '../../lib/date';
import { OP_LABELS, OP_SYMBOLS, isCorrect, makeMathQuestion, type MathDifficulty, type MathOp } from './generator';

const ALL_OPS: MathOp[] = ['add', 'sub', 'mul', 'div', 'frac', 'pct', 'pow'];
const QUESTION_COUNT = 20;
const TIME_LIMIT = 60;

export function mathToQuiz(rng: Rng, ops: MathOp[], diff: MathDifficulty, key: string): QuizQuestion {
  const q = makeMathQuestion(rng, ops, diff);
  return {
    key,
    label: q.format === 'fraction' ? 'Answer as a fraction (e.g. 3/4) or whole number' : OP_LABELS[q.op],
    prompt: <span class="math-q">{q.text}{q.op === 'pct' && q.text.includes('what %') ? '' : ' = ?'}</span>,
    promptClass: 'mono',
    kind: 'input',
    inputMode: q.format === 'fraction' ? 'text' : 'numeric',
    inputPlaceholder: q.format === 'fraction' ? 'e.g. 5/6' : 'Your answer',
    inputLabel: `Answer for ${q.text}`,
    accept: (raw) => isCorrect(raw, q.answer),
    answerText: q.answerText,
    reviewText: q.text,
    explanation: q.explanation,
    tag: q.op,
  };
}

type Phase = 'setup' | 'countdown' | 'play' | 'done';

export default function MathSprint() {
  const [prefs, setPrefs] = usePrefs('math', { ops: 'add,sub,mul,div', difficulty: 'easy', timed: true });
  const ops = prefs.ops.split(',').filter((o): o is MathOp => (ALL_OPS as string[]).includes(o));
  const diff = prefs.difficulty as MathDifficulty;
  const opsKey = ALL_OPS.filter((o) => ops.includes(o)).map((o) => OP_SYMBOLS[o]).join(' ');
  const variant = `${diff} · ${prefs.timed ? `${TIME_LIMIT}s sprint` : `${QUESTION_COUNT} questions`} · ${opsKey}`;
  const [phase, setPhase] = useState<Phase>('setup');
  const [summary, setSummary] = useState<QuizSummary | null>(null);
  const [outcome, setOutcome] = useState<RecordOutcome>();
  const [ver, setVer] = useState(0);
  const [run, setRun] = useState(0);
  const best = useBest('math', variant, ver);
  // Operations this player gets wrong most often (across rounds; newer rounds count more).
  const [weak, setWeak] = useState<Ranked[]>([]);
  useEffect(() => setWeak(weakestOps(loadWeak().mathOps)), []);

  /** Untimed practice on the (up to two) weakest operations. */
  const drill = () => {
    const target = weak.slice(0, 2).map((w) => w.key);
    if (!target.length) return;
    setPrefs({ ops: target.join(','), timed: false });
    setSummary(null);
    setRun((r) => r + 1);
    setPhase('play');
  };

  const toggleOp = (op: MathOp) => {
    const next = ops.includes(op) ? ops.filter((o) => o !== op) : [...ops, op];
    if (next.length) setPrefs({ ops: next.join(',') });
  };

  const start = () => {
    setSummary(null);
    setRun((r) => r + 1);
    setPhase(prefs.timed ? 'countdown' : 'play');
  };

  const onFinish = (s: QuizSummary) => {
    setSummary(s);
    const data = loadWeak();
    data.mathOps = mergeTallies(data.mathOps, talliesFromAnswers(s.review));
    saveWeak(data);
    setWeak(weakestOps(data.mathOps));
    setOutcome(recordResult({ gameId: 'math', variant, score: s.correct, display: `${s.correct} correct`, better: 'higher', url: '/math/' }));
    setVer((v) => v + 1);
    setPhase('done');
  };

  if (phase === 'setup') {
    return (
      <SetupPanel
        title="Mental Math Sprint"
        subtitle="Choose your operations and difficulty."
        onStart={start}
        best={best}
        bestLabel="Best for these settings"
        instructions={[
          prefs.timed ? `Answer as many questions as you can in ${TIME_LIMIT} seconds.` : `Answer ${QUESTION_COUNT} questions at your own pace, with an explanation after each one.`,
          'Type your answer and press Enter. Fractions can be typed as 3/4, 0.75 or 1 1/2 — any equivalent value is accepted.',
          'Use Skip if you are stuck (it counts as incorrect).',
        ]}
      >
        <div class="option-group" style={{ justifyItems: 'center' }}>
          <span class="label">Operations</span>
          <div class="segmented" role="group" aria-label="Operations">
            {ALL_OPS.map((op) => (
              <button type="button" key={op} aria-pressed={ops.includes(op)} onClick={() => toggleOp(op)}>
                <span aria-hidden="true">{OP_SYMBOLS[op]}</span> {OP_LABELS[op]}
              </button>
            ))}
          </div>
        </div>
        <Segmented label="Difficulty" value={diff} onChange={(v) => setPrefs({ difficulty: v })}
          options={[{ value: 'easy', label: 'Easy' }, { value: 'medium', label: 'Medium' }, { value: 'hard', label: 'Hard' }]} />
        <Segmented label="Mode" value={prefs.timed ? 'timed' : 'practice'} onChange={(v) => setPrefs({ timed: v === 'timed' })}
          options={[{ value: 'timed', label: `Timed (${TIME_LIMIT}s)` }, { value: 'practice', label: `Untimed (${QUESTION_COUNT} questions)` }]} />
        {weak.length > 0 && <WeakOps weak={weak} onDrill={drill} compact />}
      </SetupPanel>
    );
  }

  if (phase === 'countdown') return <Countdown onDone={() => setPhase('play')} />;

  if (phase === 'play') {
    return (
      <QuizRunner
        key={run}
        makeQuestion={(i) => mathToQuiz(defaultRng, ops, diff, `${run}-${i}`)}
        total={prefs.timed ? undefined : QUESTION_COUNT}
        timeLimitSec={prefs.timed ? TIME_LIMIT : undefined}
        onFinish={onFinish}
        onQuit={() => undefined}
        scoreLabel="Correct"
      />
    );
  }

  const s = summary!;
  const acc = s.answered ? Math.round((s.correct / s.answered) * 100) : 0;
  return (
    <ResultsPanel
      title="Mental Math Sprint"
      score={s.correct}
      unit="correct"
      subtitle={variant}
      outcome={outcome}
      stats={[
        { k: 'Answered', v: s.answered },
        { k: 'Accuracy', v: `${acc}%` },
        { k: 'Time', v: formatDuration(s.durationMs) },
        { k: 'Best streak', v: s.bestStreak },
        { k: 'Avg / question', v: s.answered ? `${(s.durationMs / s.answered / 1000).toFixed(1)}s` : '—' },
      ]}
      onRestart={start}
      onSettings={() => setPhase('setup')}
    >
      <RoundByOp review={s.review} />
      {weak.length > 0 && <WeakOps weak={weak} onDrill={drill} />}
      <ReviewList items={s.review} />
    </ResultsPanel>
  );
}

/** Accuracy for each operation in the round just played. */
function RoundByOp({ review }: { review: { tag?: string; correct: boolean }[] }) {
  const t = talliesFromAnswers(review);
  const rows = ALL_OPS.filter((op) => t[op]).map((op) => ({ op, n: t[op].n, right: t[op].n - t[op].miss }));
  if (rows.length < 2) return null;
  return (
    <section class="op-table" aria-labelledby="by-op">
      <h3 id="by-op">This round by operation</h3>
      <ul>
        {rows.map((r) => (
          <li key={r.op}>
            <span>{OP_LABELS[r.op]}</span>
            <span class="op-bar" aria-hidden="true"><span style={{ width: `${(r.right / r.n) * 100}%` }} /></span>
            <span class="op-val">{r.right} of {r.n} right</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** The player's weakest operations overall, with a one-click drill. */
function WeakOps({ weak, onDrill, compact }: { weak: Ranked[]; onDrill: () => void; compact?: boolean }) {
  const names = weak.slice(0, 2).map((w) => OP_LABELS[w.key as MathOp]).join(' and ');
  return (
    <section class={`weak-ops ${compact ? 'compact' : ''}`} aria-label="Your weak spots">
      <p>
        <strong>Your weak spots:</strong>{' '}
        {weak.slice(0, 3).map((w, i) => (
          <span key={w.key}>{i ? ', ' : ''}{OP_LABELS[w.key as MathOp]} ({Math.round(w.rate * 100)}% wrong)</span>
        ))}
      </p>
      <button type="button" class="btn btn-secondary" onClick={onDrill}>
        Practise {names}
      </button>
    </section>
  );
}
