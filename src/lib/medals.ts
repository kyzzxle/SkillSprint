// Medals: bronze, silver and gold targets for every game. Each rule says which results count,
// so medals compare like with like. A lane's medal (shown on the homepage track) is the best
// medal won by any game in that lane.
import type { CategoryId } from '../data/catalog';
import type { ScoreRecord } from './storage';

export type MedalLevel = 0 | 1 | 2 | 3;
export const MEDAL_NAMES = ['None', 'Bronze', 'Silver', 'Gold'] as const;

export interface MedalRule {
  /** storage game id this rule reads; one rule per game */
  gameId: string;
  cat: CategoryId;
  /** game name, for messages */
  name: string;
  /** game page where the medal is earned */
  url: string;
  better: 'higher' | 'lower';
  /** bronze, silver, gold thresholds */
  tiers: [number, number, number];
  unit: string;
  /** which results count, in plain words */
  counts: string;
  qualifies: (variant: string) => boolean;
}

const tenQuestions = (v: string) => v.includes('10 questions') && (v.includes('medium') || v.includes('hard'));
const any = () => true;

export const MEDAL_RULES: MedalRule[] = [
  // Lane 1: Typing
  { gameId: 'typing', cat: 'typing', name: 'Typing Speed Test', url: '/typing/', better: 'higher', tiers: [40, 60, 80], unit: 'WPM',
    counts: 'your best speed in any typing test (weak-key drills excluded)', qualifies: (v) => !v.includes('weak keys') },
  { gameId: 'typing-code', cat: 'typing', name: 'Code Typing Test', url: '/typing/code/', better: 'higher', tiers: [25, 40, 55], unit: 'WPM',
    counts: 'your best speed in a code typing test of any length', qualifies: any },
  // Lane 2: Reaction
  { gameId: 'reaction', cat: 'reaction', name: 'Reaction Time Test', url: '/reaction-time/', better: 'lower', tiers: [300, 250, 215], unit: 'ms',
    counts: 'your best average over 5 or 10 rounds', qualifies: any },
  // Lane 3: Memory
  { gameId: 'sequence-memory', cat: 'memory', name: 'Sequence Memory', url: '/memory/', better: 'higher', tiers: [6, 9, 12], unit: 'level',
    counts: 'the highest level you complete', qualifies: any },
  { gameId: 'number-memory', cat: 'memory', name: 'Number Memory', url: '/memory/number-memory/', better: 'higher', tiers: [7, 9, 11], unit: 'digits',
    counts: 'the longest number you remember correctly', qualifies: any },
  { gameId: 'memory-grid', cat: 'memory', name: 'Memory Grid', url: '/memory/memory-grid/', better: 'higher', tiers: [5, 8, 11], unit: 'level',
    counts: 'the highest level you complete', qualifies: any },
  // Lane 4: Math
  { gameId: 'math', cat: 'math', name: 'Mental Math Sprint', url: '/math/', better: 'higher', tiers: [15, 25, 35], unit: 'correct',
    counts: 'correct answers in a 60-second timed sprint, any difficulty', qualifies: (v) => v.includes('60s sprint') },
  // Lane 5: Vocabulary & spelling
  { gameId: 'vocabulary', cat: 'vocabulary', name: 'Vocabulary Quiz', url: '/vocabulary/', better: 'higher', tiers: [7, 9, 10], unit: '/10',
    counts: 'your score in a 10-question round on Medium or Hard', qualifies: tenQuestions },
  { gameId: 'spelling', cat: 'vocabulary', name: 'Spelling Challenge', url: '/vocabulary/spelling/', better: 'higher', tiers: [7, 9, 10], unit: '/10',
    counts: 'your score in a 10-question round on Medium or Hard', qualifies: tenQuestions },
  // Lane 6: Geography (flags, capitals, map and mixed quizzes share one score)
  { gameId: 'geography', cat: 'geography', name: 'Geography Quiz', url: '/geography/', better: 'higher', tiers: [7, 9, 10], unit: '/10',
    counts: 'your score in a 10-question round on Medium or Hard (any quiz type)', qualifies: tenQuestions },
  // Lane 7: Shortcuts
  { gameId: 'shortcuts', cat: 'shortcuts', name: 'Keyboard Shortcut Quiz', url: '/keyboard-shortcuts/', better: 'higher', tiers: [7, 9, 10], unit: '/10',
    counts: 'your score in a 10-question practice round (any app)', qualifies: (v) => v.includes('practice') },
  // Lane 8: Logic
  { gameId: 'logic', cat: 'logic', name: 'Logic Puzzles', url: '/logic/', better: 'higher', tiers: [6, 8, 10], unit: '/10',
    counts: 'your score in a 10-puzzle round starting on Medium or Hard', qualifies: (v) => v.includes('10 puzzles') && (v.includes('medium') || v.includes('hard')) },
  // Lane 9: Colour
  { gameId: 'color', cat: 'color', name: 'Color Challenge', url: '/color/', better: 'higher', tiers: [7, 9, 10], unit: '/10',
    counts: 'your score in a 10-question round on Medium or Hard', qualifies: tenQuestions },
  { gameId: 'color-match', cat: 'color', name: 'Color Match', url: '/color/color-match/', better: 'higher', tiers: [75, 85, 92], unit: '%',
    counts: 'your best average accuracy over 5 colours', qualifies: any },
  // Lane 10: Reading
  { gameId: 'reading', cat: 'reading', name: 'Reading Speed Test', url: '/reading/', better: 'higher', tiers: [200, 300, 400], unit: 'WPM',
    counts: 'your best reading speed (only saved with 75%+ comprehension)', qualifies: any },
];

/** Total medals available across all games (three per game). */
export const TOTAL_MEDALS = MEDAL_RULES.length * 3;

export const ruleForGame = (gameId: string): MedalRule | undefined => MEDAL_RULES.find((r) => r.gameId === gameId);
export const rulesForLane = (cat: CategoryId): MedalRule[] => MEDAL_RULES.filter((r) => r.cat === cat);

/** Best qualifying score for a rule, from the stored personal bests ("gameId|variant" keys). */
export function bestFor(rule: MedalRule, bests: Record<string, ScoreRecord>): number | null {
  let best: number | null = null;
  for (const [key, rec] of Object.entries(bests)) {
    const sep = key.indexOf('|');
    if (key.slice(0, sep) !== rule.gameId || !rule.qualifies(key.slice(sep + 1))) continue;
    if (best === null || (rule.better === 'lower' ? rec.score < best : rec.score > best)) best = rec.score;
  }
  return best;
}

export function medalLevel(rule: MedalRule, score: number | null): MedalLevel {
  if (score === null) return 0;
  const meets = (t: number) => (rule.better === 'lower' ? score <= t : score >= t);
  return rule.tiers.filter(meets).length as MedalLevel;
}

/** The next medal to aim for and how far away it is (null when gold is already won). */
export function nextMedal(rule: MedalRule, score: number | null): { level: MedalLevel; target: number; gap: number | null } | null {
  const level = medalLevel(rule, score);
  if (level === 3) return null;
  const target = rule.tiers[level];
  const gap = score === null ? null : Math.abs(target - score);
  return { level: (level + 1) as MedalLevel, target, gap };
}

const plural = (n: number, one: string, many: string) => (n === 1 ? one : many);

/** A score or target in words: "60 WPM", "level 6", "7 digits", "9/10", "85%". */
export function formatTarget(rule: MedalRule, v: number): string {
  if (rule.unit.startsWith('/')) return `${v}${rule.unit}`;
  if (rule.unit === '%') return `${v}%`;
  if (rule.unit === 'level') return `level ${v}`;
  if (rule.unit === 'digits') return `${v} ${plural(v, 'digit', 'digits')}`;
  return `${v} ${rule.unit}`;
}

/** A distance to the next target in words: "8 WPM", "2 levels", "1 digit", "1 point". */
export function formatGap(rule: MedalRule, gap: number): string {
  const g = Math.round(gap * 10) / 10;
  if (rule.unit.startsWith('/') || rule.unit === 'correct') return `${g} ${plural(g, 'point', 'points')}`;
  if (rule.unit === '%') return `${g} percentage ${plural(g, 'point', 'points')}`;
  if (rule.unit === 'level') return `${g} ${plural(g, 'level', 'levels')}`;
  if (rule.unit === 'digits') return `${g} ${plural(g, 'digit', 'digits')}`;
  return `${g} ${rule.unit}`;
}

/** Medal level for every game, keyed by storage game id. */
export function allMedals(bests: Record<string, ScoreRecord>): Record<string, MedalLevel> {
  const out: Record<string, MedalLevel> = {};
  for (const r of MEDAL_RULES) out[r.gameId] = medalLevel(r, bestFor(r, bests));
  return out;
}

/** Best medal won by any game in each lane. */
export function laneMedals(bests: Record<string, ScoreRecord>): Record<CategoryId, MedalLevel> {
  const per = allMedals(bests);
  const out = {} as Record<CategoryId, MedalLevel>;
  for (const r of MEDAL_RULES) out[r.cat] = Math.max(out[r.cat] ?? 0, per[r.gameId]) as MedalLevel;
  return out;
}
