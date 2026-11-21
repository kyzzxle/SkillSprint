import { useMemo, useState } from 'preact/hooks';
import { PASSAGES, wordCount, type Passage } from '../../data/passages';
import { defaultRng, pick, shuffle } from '../../lib/random';
import { load, recordResult, type RecordOutcome } from '../../lib/storage';
import { formatDuration } from '../../lib/date';
import { Icon, ResultsPanel, ReviewList, Segmented, SetupPanel, StatInline } from '../../components/ui';
import { QuizRunner, type QuizQuestion, type QuizSummary } from '../../components/ui/QuizRunner';
import { useBest, usePrefs, useStopwatch } from '../../components/ui/hooks';
import './reading.css';

type Level = Passage['level'];
type Phase = 'setup' | 'ready' | 'reading' | 'questions' | 'done';
const PASS_MARK = 0.75;

export function readingWpm(words: number, ms: number): number {
  return ms > 0 ? words / (ms / 60000) : 0;
}

export default function ReadingTest() {
  const [p, set] = usePrefs('reading', { level: 'beginner' });
  const level = p.level as Level;
  const [phase, setPhase] = useState<Phase>('setup');
  const [passage, setPassage] = useState<Passage | null>(null);
  const [readMs, setReadMs] = useState(0);
  const [summary, setSummary] = useState<QuizSummary | null>(null);
  const [outcome, setOutcome] = useState<RecordOutcome | undefined>();
  const [ver, setVer] = useState(0);
  const best = useBest('reading', level, ver);
  const sw = useStopwatch(phase === 'reading');

  const choosePassage = () => {
    const pool = PASSAGES.filter((x) => x.level === level);
    const next = passage && pool.length > 1 ? pool.filter((x) => x.id !== passage.id) : pool;
    setPassage(pick(defaultRng, next));
    setSummary(null);
    setOutcome(undefined);
    setPhase('ready');
  };

  const finishReading = () => {
    setReadMs(sw.read());
    setPhase('questions');
    window.scrollTo({ top: (document.querySelector('.game-stage') as HTMLElement | null)?.offsetTop ?? 0, behavior: 'smooth' });
  };

  const questions = useMemo<QuizQuestion[]>(() => {
    if (!passage) return [];
    return passage.questions.map((q, i) => {
      const order = shuffle(defaultRng, q.options.map((text, idx) => ({ text, idx })));
      return {
        key: `${passage.id}-${i}`, kind: 'choice', label: `Question ${i + 1} of ${passage.questions.length}`,
        prompt: <span class="reading-q">{q.q}</span>,
        choices: order.map((o) => ({ id: String(o.idx), label: o.text, text: o.text })),
        correctId: String(q.answer), answerText: q.options[q.answer], reviewText: q.q, explanation: q.explain,
      };
    });
  }, [passage]);

  const words = passage ? wordCount(passage) : 0;

  const onQuizDone = (s: QuizSummary) => {
    setSummary(s);
    const wpm = Math.round(readingWpm(words, readMs));
    const comp = s.correct / s.answered;
    if (comp >= PASS_MARK) {
      setOutcome(recordResult({ gameId: 'reading', variant: level, score: wpm, display: `${wpm} WPM`, better: 'higher', url: '/reading/' }));
      setVer((v) => v + 1);
    }
    setPhase('done');
  };

  if (phase === 'setup') {
    return (
      <SetupPanel
        title="Reading Speed Test"
        subtitle="Measure how fast you read — and check how much you understood."
        onStart={choosePassage}
        startLabel="Choose a passage"
        best={best}
        bestLabel={`Best ${level} WPM`}
        instructions={[
          'Press “Start reading” when you are ready. The timer runs while the passage is visible.',
          'Read at your normal pace — as if you needed to remember it — then press “I’ve finished”.',
          'Answer the comprehension questions without looking back at the text.',
          `Speed is only saved as a personal best when you answer at least ${PASS_MARK * 100}% of questions correctly.`,
        ]}
      >
        <Segmented label="Difficulty" value={level} onChange={(v) => set({ level: v })}
          options={[{ value: 'beginner', label: 'Beginner' }, { value: 'intermediate', label: 'Intermediate' }, { value: 'advanced', label: 'Advanced' }]} />
      </SetupPanel>
    );
  }

  if (!passage) return null;

  if (phase === 'ready') {
    return (
      <div class="reading-ready">
        <span class="chip chip-cat">{level}</span>
        <h2>{passage.title}</h2>
        <p class="muted">
          {words} words, then {passage.questions.length} questions
        </p>
        <div class="btn-row center">
          <button type="button" class="btn btn-primary btn-lg" onClick={() => setPhase('reading')}>
            <Icon name="play" /> Start reading
          </button>
          <button type="button" class="btn btn-ghost" onClick={choosePassage}>
            Different passage
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'reading') {
    return (
      <div class="reading">
        <div class="game-top reading-bar">
          <StatInline k="Time" v={formatDuration(sw.elapsed)} accent />
          <button type="button" class="btn btn-primary" onClick={finishReading}>
            <Icon name="check" /> I’ve finished
          </button>
        </div>
        <article class="passage" aria-label={passage.title}>
          <h2>{passage.title}</h2>
          {passage.paragraphs.map((t, i) => (
            <p key={i}>{t}</p>
          ))}
        </article>
        <div class="btn-row center">
          <button type="button" class="btn btn-primary btn-lg" onClick={finishReading}>
            <Icon name="check" /> I’ve finished reading
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'questions') {
    return (
      <div>
        <p class="muted" style={{ textAlign: 'center' }}>
          Reading time recorded: <strong>{formatDuration(readMs)}</strong>. Now answer from memory.
        </p>
        <QuizRunner makeQuestion={(i) => questions[i]} total={questions.length} onFinish={onQuizDone} />
      </div>
    );
  }

  const s = summary!;
  const wpm = Math.round(readingWpm(words, readMs));
  const comp = Math.round((s.correct / s.answered) * 100);
  const history = load().history.filter((h) => h.gameId === 'reading');
  const avg = history.length ? Math.round(history.reduce((a, h) => a + h.score, 0) / history.length) : null;
  return (
    <ResultsPanel
      title="Reading speed"
      score={wpm}
      unit="WPM"
      subtitle={`“${passage.title}” · ${level}`}
      outcome={comp / 100 >= PASS_MARK ? outcome : undefined}
      stats={[
        { k: 'Comprehension', v: `${s.correct}/${s.answered} (${comp}%)` },
        { k: 'Reading time', v: formatDuration(readMs) },
        { k: 'Words', v: words },
        { k: 'Your average', v: avg !== null ? `${avg} WPM` : '—' },
      ]}
      onRestart={choosePassage}
      restartLabel="Read another passage"
      onSettings={() => setPhase('setup')}
    >
      <div class="notice" role="note">
        <Icon name="info" />
        <span>
          {comp / 100 >= PASS_MARK
            ? 'Saved to your statistics. '
            : `Not saved as a result: comprehension was below ${PASS_MARK * 100}%, so this speed may not reflect real understanding. `}
          Reading speed alone does not measure comprehension — a high WPM only matters if you understood the text.
          {wpm > 800 ? ' Speeds above roughly 800 WPM are far faster than typical reading with good understanding.' : ''}
        </span>
      </div>
      <ReviewList items={s.review} title="Comprehension review" />
    </ResultsPanel>
  );
}
