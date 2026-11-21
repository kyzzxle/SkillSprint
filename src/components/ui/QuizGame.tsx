// Shared setup → (countdown) → play → results flow for quiz-style games.
// Each game provides its own settings UI and a question factory; scoring/recording is uniform.
import type { ComponentChildren } from 'preact';
import { useState } from 'preact/hooks';
import { recordResult, type RecordOutcome } from '../../lib/storage';
import { formatDuration } from '../../lib/date';
import { Countdown, ResultsPanel, ReviewList, SetupPanel } from './index';
import { QuizRunner, type QuizQuestion, type QuizSummary } from './QuizRunner';
import { useBest } from './hooks';

export interface QuizGameProps {
  gameId: string;
  url: string;
  title: string;
  subtitle?: ComponentChildren;
  instructions: ComponentChildren[];
  settings?: ComponentChildren;
  variant: string;
  /** Called at the start of each run; returns the question factory for that run. */
  createRun: () => (index: number) => QuizQuestion;
  timed: boolean;
  timeLimitSec?: number;
  total?: number;
  /** Optional extra content under the results (e.g. tips). */
  resultsExtra?: ComponentChildren;
  /** Pause after each question to show explanations (default: !timed). */
  pauseForFeedback?: boolean;
}

type Phase = 'setup' | 'countdown' | 'play' | 'done';

export function QuizGame(props: QuizGameProps) {
  const { timed, timeLimitSec = 60, total = 10 } = props;
  const [phase, setPhase] = useState<Phase>('setup');
  const [run, setRun] = useState(0);
  const [factory, setFactory] = useState<((i: number) => QuizQuestion) | null>(null);
  const [summary, setSummary] = useState<QuizSummary | null>(null);
  const [outcome, setOutcome] = useState<RecordOutcome>();
  const [ver, setVer] = useState(0);
  const best = useBest(props.gameId, props.variant, ver);

  const start = () => {
    const f = props.createRun();
    setFactory(() => f);
    setRun((r) => r + 1);
    setSummary(null);
    setPhase(timed ? 'countdown' : 'play');
  };

  const onFinish = (s: QuizSummary) => {
    setSummary(s);
    setOutcome(
      recordResult({
        gameId: props.gameId, variant: props.variant, score: s.correct,
        display: timed ? `${s.correct} correct` : `${s.correct}/${total}`, better: 'higher', url: props.url,
      }),
    );
    setVer((v) => v + 1);
    setPhase('done');
  };

  if (phase === 'setup') {
    return (
      <SetupPanel title={props.title} subtitle={props.subtitle} instructions={props.instructions} onStart={start} best={best} bestLabel="Best for these settings">
        {props.settings}
      </SetupPanel>
    );
  }
  if (phase === 'countdown') return <Countdown onDone={() => setPhase('play')} />;
  if (phase === 'play' && factory) {
    return (
      <QuizRunner
        key={run}
        makeQuestion={factory}
        total={timed ? undefined : total}
        timeLimitSec={timed ? timeLimitSec : undefined}
        pauseForFeedback={props.pauseForFeedback}
        onFinish={onFinish}
        onQuit={() => undefined}
      />
    );
  }
  const s = summary ?? { correct: 0, answered: 0, durationMs: 0, review: [], answers: [] };
  const acc = s.answered ? Math.round((s.correct / s.answered) * 100) : 0;
  return (
    <ResultsPanel
      title={props.title}
      score={timed ? s.correct : `${s.correct}/${total}`}
      unit={timed ? 'correct' : undefined}
      subtitle={props.variant}
      outcome={outcome}
      stats={[
        { k: 'Answered', v: s.answered },
        { k: 'Accuracy', v: `${acc}%` },
        { k: 'Time', v: formatDuration(s.durationMs) },
      ]}
      onRestart={start}
      onSettings={() => setPhase('setup')}
    >
      <ReviewList items={s.review} />
      {props.resultsExtra}
    </ResultsPanel>
  );
}

/** Shared "timed vs fixed number of questions" selector values. */
export const MODE_OPTIONS = (total: number, secs: number) => [
  { value: 'count', label: `${total} questions` },
  { value: 'timed', label: `Timed (${secs}s)` },
];
