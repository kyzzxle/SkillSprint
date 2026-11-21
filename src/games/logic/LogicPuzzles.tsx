import { defaultRng, type Rng } from '../../lib/random';
import { Segmented } from '../../components/ui';
import { QuizGame, MODE_OPTIONS } from '../../components/ui/QuizGame';
import type { QuizQuestion } from '../../components/ui/QuizRunner';
import { usePrefs } from '../../components/ui/hooks';
import { makePuzzle, type LogicCategory } from './puzzles';
import './logic.css';

const BASE: Record<string, number> = { easy: 1, medium: 2, hard: 3 };
const TOTAL = 10;
const SECS = 90;

export function logicQuestion(rng: Rng, category: LogicCategory, level: number, key: string, avoid?: Set<string>): QuizQuestion {
  const p = makePuzzle(rng, category, level, avoid);
  return {
    key,
    kind: 'choice',
    label: <span class="chip">{p.type}</span>,
    prompt: (
      <div class="logic-prompt">
        <p>{p.prompt}</p>
        {p.display && <pre class="logic-display">{p.display}</pre>}
      </div>
    ),
    choices: p.options.map((o) => ({ id: o, label: o, text: o })),
    correctId: p.answer,
    answerText: p.answer,
    reviewText: p.display ? `${p.prompt} ${p.display.replace(/\n/g, ' / ')}` : p.prompt,
    explanation: p.explanation,
  };
}

export default function LogicPuzzles() {
  const [p, set] = usePrefs('logic', { category: 'mixed', level: 'easy', run: 'count' });
  const timed = p.run === 'timed';
  const catLabel: Record<LogicCategory, string> = { mixed: 'Mixed', sequences: 'Sequences', patterns: 'Patterns', reasoning: 'Reasoning', deduction: 'Deduction' };
  const variant = `${catLabel[p.category as LogicCategory]} · ${p.level} · ${timed ? `${SECS}s` : `${TOTAL} puzzles`}`;
  return (
    <QuizGame
      gameId="logic"
      url="/logic/"
      title="Logic Puzzles"
      subtitle="Sequences, missing numbers, patterns and deduction — each with an explanation."
      variant={variant}
      timed={timed}
      total={TOTAL}
      timeLimitSec={SECS}
      createRun={() => {
        const seen = new Set<string>();
        const base = BASE[p.level] ?? 1;
        // Difficulty rises every three puzzles.
        return (i) => logicQuestion(defaultRng, p.category as LogicCategory, base + Math.floor(i / 3), `l${i}`, seen);
      }}
      instructions={[
        'Find the rule, then choose the answer that follows it.',
        'Puzzles get harder as you progress through a round.',
        'After each answer you will see the reasoning behind it — read it even when you are right; there may be a faster method.',
      ]}
      settings={
        <>
          <Segmented label="Puzzle type" value={p.category} onChange={(v) => set({ category: v })}
            options={(Object.keys(catLabel) as LogicCategory[]).map((k) => ({ value: k, label: catLabel[k] }))} />
          <Segmented label="Starting difficulty" value={p.level} onChange={(v) => set({ level: v })}
            options={[{ value: 'easy', label: 'Easy' }, { value: 'medium', label: 'Medium' }, { value: 'hard', label: 'Hard' }]} />
          <Segmented label="Mode" value={p.run} onChange={(v) => set({ run: v })} options={MODE_OPTIONS(TOTAL, SECS).map((o) => (o.value === 'count' ? { ...o, label: `${TOTAL} puzzles` } : o))} />
        </>
      }
    />
  );
}
