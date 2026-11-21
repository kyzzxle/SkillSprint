import { useEffect, useMemo, useState } from 'preact/hooks';
import { localDateKey, formatDateKey, formatDuration, addDays } from '../../lib/date';
import { dailyStreak, getDaily, load, recordResult, saveDaily, onStorageChange, type DailyResult } from '../../lib/storage';
import { Icon, ResultsPanel, ReviewList, SetupPanel, StatGrid } from '../../components/ui';
import { QuizRunner, type QuizSummary } from '../../components/ui/QuizRunner';
import { buildDaily, DAILY_COUNT } from './daily';

type Phase = 'loading' | 'intro' | 'play' | 'done' | 'completed';

export default function DailyChallenge() {
  // Captured once: the challenge never changes during a visit, even across midnight.
  const [dateKey] = useState(() => localDateKey());
  const questions = useMemo(() => buildDaily(dateKey), [dateKey]);
  const [phase, setPhase] = useState<Phase>('loading');
  const [practice, setPractice] = useState(false);
  const [result, setResult] = useState<DailyResult | undefined>();
  const [summary, setSummary] = useState<QuizSummary | null>(null);
  const [streak, setStreak] = useState({ current: 0, best: 0 });
  const [run, setRun] = useState(0);

  useEffect(() => {
    const refresh = () => {
      const r = getDaily(dateKey);
      setResult(r);
      setStreak(dailyStreak(load().daily, dateKey));
      return r;
    };
    const r = refresh();
    setPhase(r ? 'completed' : 'intro');
    return onStorageChange(refresh);
  }, [dateKey]);

  const begin = (asPractice: boolean) => {
    setPractice(asPractice);
    setSummary(null);
    setRun((x) => x + 1);
    setPhase('play');
  };

  const onFinish = (s: QuizSummary) => {
    setSummary(s);
    if (!practice) {
      const saved = saveDaily(dateKey, { score: s.correct, total: DAILY_COUNT, durationMs: Math.round(s.durationMs), completedAt: new Date().toISOString(), answers: s.answers });
      if (saved) {
        recordResult({ gameId: 'daily', variant: 'daily', score: s.correct, display: `${s.correct}/${DAILY_COUNT}`, better: 'higher', url: '/daily/' });
      }
    }
    setPhase('done');
  };

  const dateLabel = formatDateKey(dateKey);

  if (phase === 'loading') return <div class="countdown" style={{ fontSize: '1rem' }}>Loading today’s challenge…</div>;

  if (phase === 'intro') {
    return (
      <SetupPanel
        title={`Daily Challenge · ${dateLabel}`}
        subtitle="Ten mixed questions — the same set for everyone today."
        onStart={() => begin(false)}
        startLabel="Start today’s challenge"
        instructions={[
          'Questions cover maths, logic, vocabulary, geography, colour and keyboard shortcuts.',
          'There is no time limit, but your time is recorded. An explanation follows every answer.',
          'Only your first attempt each day counts. Complete a challenge every day to build a streak.',
          'A new challenge starts at midnight in your local time zone. Reload the page after midnight to get it.',
        ]}
        footer={streak.current > 0 ? <p class="muted" style={{ textAlign: 'center' }}>Current streak: <strong>{streak.current} day{streak.current === 1 ? '' : 's'}</strong> — keep it going!</p> : undefined}
      />
    );
  }

  if (phase === 'play') {
    return (
      <QuizRunner key={run} makeQuestion={(i) => questions[i]} total={DAILY_COUNT} onFinish={onFinish} />
    );
  }

  if (phase === 'done' && summary) {
    const r = result ?? getDaily(dateKey);
    return (
      <ResultsPanel
        title={practice ? 'Practice run (not saved)' : `Daily Challenge · ${dateLabel}`}
        score={`${summary.correct}/${DAILY_COUNT}`}
        subtitle={practice && r ? `Your saved result for today is still ${r.score}/${r.total}.` : `Completed in ${formatDuration(summary.durationMs)}`}
        stats={practice ? undefined : [
          { k: 'Current streak', v: `${streak.current} day${streak.current === 1 ? '' : 's'}` },
          { k: 'Best streak', v: `${streak.best} day${streak.best === 1 ? '' : 's'}` },
          { k: 'Time', v: formatDuration(summary.durationMs) },
        ]}
        onRestart={() => begin(true)}
        restartLabel="Practise again"
        extraActions={<a class="btn btn-secondary btn-lg" href="/games/"><Icon name="arrow" /> More games</a>}
      >
        <AnswerStrip answers={summary.answers} />
        <ReviewList items={summary.review} />
      </ResultsPanel>
    );
  }

  // Already completed today.
  const r = result!;
  const tomorrow = formatDateKey(addDays(dateKey, 1), { weekday: 'long' });
  return (
    <div class="results">
      <div class="results-head">
        <p class="eyebrow">Today’s result · {dateLabel}</p>
        <div class="big-score">{r.score}/{r.total}</div>
        <p class="muted">
          <Icon name="check" /> Completed at {new Date(r.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} in {formatDuration(r.durationMs)}. A new challenge arrives {tomorrow}.
        </p>
      </div>
      <AnswerStrip answers={r.answers} />
      <StatGrid stats={[
        { k: 'Current streak', v: `${streak.current} day${streak.current === 1 ? '' : 's'}` },
        { k: 'Best streak', v: `${streak.best} day${streak.best === 1 ? '' : 's'}` },
      ]} />
      <div class="btn-row center">
        <button type="button" class="btn btn-secondary btn-lg" onClick={() => begin(true)}>
          <Icon name="restart" /> Practise today’s questions
        </button>
        <a class="btn btn-primary btn-lg" href="/games/">Play other games</a>
      </div>
    </div>
  );
}

function AnswerStrip({ answers }: { answers: boolean[] }) {
  return (
    <div class="answer-strip" role="img" aria-label={`${answers.filter(Boolean).length} of ${answers.length} correct`}>
      {answers.map((a, i) => (
        <span key={i} class={a ? 'ok' : 'no'} />
      ))}
    </div>
  );
}
