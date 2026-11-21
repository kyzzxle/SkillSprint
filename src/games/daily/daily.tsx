// Daily Challenge: 10 mixed questions generated from a seed derived from the visitor's local date.
// Everyone playing on the same calendar date gets the same set; the date is captured once per page load.
import { hashString, seededRng, shuffle, type Rng } from '../../lib/random';
import type { QuizQuestion } from '../../components/ui/QuizRunner';
import { mathToQuiz } from '../math/MathSprint';
import { logicQuestion } from '../logic/LogicPuzzles';
import { vocabQuestion } from '../vocabulary/questions';
import { geoQuestion } from '../geography/questions';
import { colorQuestion } from '../color/ColorChallenge';
import { shortcutQuestion } from '../shortcuts/ShortcutQuiz';

export const DAILY_COUNT = 10;

type Maker = (rng: Rng, key: string) => QuizQuestion;

const MAKERS: { cat: string; make: Maker }[] = [
  { cat: 'math', make: (rng, k) => mathToQuiz(rng, ['add', 'sub', 'mul', 'div'], 'medium', k) },
  { cat: 'math', make: (rng, k) => mathToQuiz(rng, ['pct', 'pow', 'frac'], 'easy', k) },
  { cat: 'logic', make: (rng, k) => logicQuestion(rng, 'sequences', 2, k) },
  { cat: 'logic', make: (rng, k) => logicQuestion(rng, 'deduction', 3, k) },
  { cat: 'vocabulary', make: (rng, k) => vocabQuestion(rng, 'mixed', 'medium', 'choice', k) },
  { cat: 'vocabulary', make: (rng, k) => vocabQuestion(rng, 'definition', 'hard', 'choice', k) },
  { cat: 'geography', make: (rng, k) => geoQuestion(rng, 'flags', 'medium', k) },
  { cat: 'geography', make: (rng, k) => geoQuestion(rng, 'capitals', 'medium', k) },
  { cat: 'color', make: (rng, k) => colorQuestion(rng, 'mixed', 'medium', k) },
  {
    cat: 'shortcuts',
    make: (rng, k) => {
      const app = rng() < 0.5 ? 'windows' : 'macos';
      return shortcutQuestion(rng, app, app === 'windows' ? 'win' : 'mac', 'mixed', k);
    },
  },
];

export function dailySeed(dateKey: string): number {
  return hashString(`skillsprint-daily-${dateKey}`);
}

/** Builds the day's question list. Deterministic for a given date key. */
export function buildDaily(dateKey: string): QuizQuestion[] {
  const rng = seededRng(dailySeed(dateKey));
  const order = shuffle(rng, MAKERS);
  return order.map((m, i) => {
    // Give each slot its own sub-seed so one generator's random draws never shift another's.
    const sub = seededRng(dailySeed(`${dateKey}#${i}`));
    return m.make(sub, `daily-${dateKey}-${i}`);
  });
}

export const DAILY_CATEGORIES = MAKERS.map((m) => m.cat);
