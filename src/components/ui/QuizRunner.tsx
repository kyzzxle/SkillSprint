// Generic question runner used by the quiz-style games (math, vocabulary, geography,
// shortcuts, logic, colour guessing and the daily challenge). Each game supplies its own
// question generator; this component only handles flow, input, feedback, timing and scoring.
import type { ComponentChildren } from 'preact';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { useCountdown, useKeydown, isTypingTarget } from './hooks';
import { Icon, Progress, StatInline, type ReviewItem } from './index';

export interface QuizChoice {
  id: string;
  label: ComponentChildren;
  /** Plain-text version for the review list */
  text: string;
}

export interface QuizQuestion {
  key: string;
  label?: ComponentChildren;
  prompt: ComponentChildren;
  promptClass?: string;
  kind: 'choice' | 'input';
  choices?: QuizChoice[];
  correctId?: string;
  accept?: (raw: string) => boolean;
  inputMode?: 'text' | 'numeric' | 'decimal';
  inputPlaceholder?: string;
  inputLabel?: string;
  answerText: string;
  reviewText: string;
  explanation?: string;
  choiceLayout?: 'list' | 'grid';
}

export interface QuizSummary {
  correct: number;
  answered: number;
  durationMs: number;
  review: ReviewItem[];
  answers: boolean[];
}

export interface QuizRunnerProps {
  makeQuestion: (index: number) => QuizQuestion;
  /** Number of questions (count mode). Ignored when timeLimitSec is set unless both are given. */
  total?: number;
  /** Timed mode: seconds on the clock. */
  timeLimitSec?: number;
  /** Pause after each answer to show the explanation (default: true in count mode). */
  pauseForFeedback?: boolean;
  onFinish: (summary: QuizSummary) => void;
  onQuit?: () => void;
  /** Extra stats to show in the header */
  scoreLabel?: string;
}

type Phase = 'answering' | 'feedback';

export function QuizRunner(props: QuizRunnerProps) {
  const timed = !!props.timeLimitSec;
  const pause = props.pauseForFeedback ?? !timed;
  const [index, setIndex] = useState(0);
  const question = useMemo(() => props.makeQuestion(index), [index]);
  const [phase, setPhase] = useState<Phase>('answering');
  const [selected, setSelected] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [lastCorrect, setLastCorrect] = useState(false);
  const [correct, setCorrect] = useState(0);
  const reviewRef = useRef<ReviewItem[]>([]);
  const answersRef = useRef<boolean[]>([]);
  const startRef = useRef(performance.now());
  const finishedRef = useRef(false);
  const advanceTimer = useRef<number | undefined>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);
  const regionRef = useRef<HTMLDivElement>(null);
  const nextBtnRef = useRef<HTMLButtonElement>(null);

  const finish = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    window.clearTimeout(advanceTimer.current);
    const answers = answersRef.current;
    props.onFinish({
      correct: answers.filter(Boolean).length,
      answered: answers.length,
      durationMs: performance.now() - startRef.current,
      review: reviewRef.current,
      answers,
    });
  };

  const { remaining } = useCountdown((props.timeLimitSec ?? 0) * 1000, timed, finish);

  useEffect(() => () => window.clearTimeout(advanceTimer.current), []);

  // Focus management for each new question.
  useEffect(() => {
    if (phase !== 'answering') return;
    if (question.kind === 'input') inputRef.current?.focus({ preventScroll: true });
    else regionRef.current?.focus({ preventScroll: true });
  }, [question, phase]);

  useEffect(() => {
    if (phase === 'feedback' && pause) nextBtnRef.current?.focus({ preventScroll: true });
  }, [phase]);

  const goNext = () => {
    if (finishedRef.current) return;
    const done = props.total !== undefined && index + 1 >= props.total;
    if (done) {
      finish();
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
    setInput('');
    setPhase('answering');
  };

  const submit = (given: string, ok: boolean, givenText: string) => {
    if (phase !== 'answering' || finishedRef.current) return;
    setSelected(given);
    setLastCorrect(ok);
    if (ok) setCorrect((c) => c + 1);
    answersRef.current.push(ok);
    reviewRef.current.push({
      correct: ok,
      question: question.reviewText,
      given: givenText,
      answer: question.answerText,
      explanation: question.explanation,
    });
    setPhase('feedback');
    if (!pause) {
      advanceTimer.current = window.setTimeout(goNext, ok ? 450 : 1300);
    }
  };

  const choose = (c: QuizChoice) => submit(c.id, c.id === question.correctId, c.text);

  const submitInput = (e?: Event) => {
    e?.preventDefault();
    const raw = input.trim();
    if (!raw) return;
    const ok = question.accept ? question.accept(raw) : raw.toLowerCase() === question.answerText.toLowerCase();
    submit(raw, ok, raw);
  };

  const skip = () => submit('', false, '');

  useKeydown((e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (phase === 'answering' && question.kind === 'choice' && question.choices && !isTypingTarget(e.target)) {
      const n = Number(e.key);
      if (Number.isInteger(n) && n >= 1 && n <= question.choices.length) {
        e.preventDefault();
        choose(question.choices[n - 1]);
      }
    } else if (phase === 'feedback' && pause && e.key === 'Enter' && e.target !== nextBtnRef.current) {
      e.preventDefault();
      goNext();
    }
  });

  const answered = answersRef.current.length;
  const secondsLeft = Math.ceil(remaining / 1000);

  return (
    <div class="quiz">
      <div class="game-top">
        <div class="stats-inline">
          {timed ? (
            <StatInline k="Time" v={`${secondsLeft}s`} accent />
          ) : (
            <StatInline k="Question" v={`${Math.min(index + 1, props.total ?? index + 1)}/${props.total ?? '∞'}`} accent />
          )}
          <StatInline k={props.scoreLabel ?? 'Score'} v={correct} />
          <StatInline k="Accuracy" v={answered ? `${Math.round((correct / answered) * 100)}%` : '—'} />
        </div>
        <div class="btn-row">
          {question.kind === 'input' && phase === 'answering' && (
            <button type="button" class="btn btn-ghost btn-sm" onClick={skip}>
              Skip
            </button>
          )}
          {props.onQuit && (
            <button type="button" class="btn btn-ghost btn-sm" onClick={finish}>
              End
            </button>
          )}
        </div>
      </div>
      {timed ? (
        <Progress value={remaining} max={(props.timeLimitSec ?? 1) * 1000} label="Time remaining" />
      ) : (
        <Progress value={index + (phase === 'feedback' ? 1 : 0)} max={props.total ?? 1} label="Quiz progress" />
      )}

      <div class="quiz-prompt" ref={regionRef} tabIndex={-1} aria-live="polite" style={{ outline: 'none' }}>
        {question.label && <div class="q-label">{question.label}</div>}
        <div class={`q-main ${question.promptClass ?? ''}`}>{question.prompt}</div>
      </div>

      {question.kind === 'choice' && question.choices && (
        <div class="choices" role="group" aria-label="Answer options">
          {question.choices.map((c, i) => {
            let cls = 'choice';
            if (phase === 'feedback') {
              if (c.id === question.correctId) cls += ' correct';
              else if (c.id === selected) cls += ' wrong';
              else cls += ' dim';
            }
            return (
              <button type="button" class={cls} key={c.id} disabled={phase !== 'answering'} onClick={() => choose(c)}>
                <span class="key" aria-hidden="true">
                  {i + 1}
                </span>
                <span>{c.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {question.kind === 'input' && (
        <form class="answer-form" onSubmit={submitInput}>
          <label class="sr-only" for="quiz-answer">
            {question.inputLabel ?? 'Your answer'}
          </label>
          <input
            id="quiz-answer"
            ref={inputRef}
            class="input"
            value={input}
            onInput={(e) => setInput((e.target as HTMLInputElement).value)}
            inputMode={question.inputMode ?? 'text'}
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellcheck={false}
            placeholder={question.inputPlaceholder ?? 'Type your answer'}
            readOnly={phase !== 'answering'}
          />
          <button type="submit" class="btn btn-primary" disabled={phase !== 'answering' || !input.trim()}>
            Submit
          </button>
        </form>
      )}

      <div role="status" aria-live="polite">
        {phase === 'feedback' && (
          <div class={`feedback ${lastCorrect ? 'good' : 'bad'}`}>
            <div class="fb-title">
              <Icon name={lastCorrect ? 'check' : 'x'} /> {lastCorrect ? 'Correct!' : selected === '' ? 'Skipped' : 'Not quite'}
            </div>
            {!lastCorrect && (
              <p>
                Correct answer: <strong>{question.answerText}</strong>
              </p>
            )}
            {pause && question.explanation && <p>{question.explanation}</p>}
          </div>
        )}
      </div>

      {phase === 'feedback' && pause && (
        <div class="btn-row center">
          <button type="button" class="btn btn-primary" ref={nextBtnRef} onClick={goNext}>
            {props.total !== undefined && index + 1 >= props.total ? 'See results' : 'Next question'}
          </button>
          <span class="muted" style={{ fontSize: '0.85rem' }}>
            or press <kbd>Enter</kbd>
          </span>
        </div>
      )}
    </div>
  );
}
