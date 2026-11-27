// Lane medals: bronze, silver and gold targets for each of the ten lanes.
// Each lane's rule says which results count, so medals compare like with like.
import type { CategoryId } from '../data/catalog';
import type { ScoreRecord } from './storage';

export type MedalLevel = 0 | 1 | 2 | 3;
export const MEDAL_NAMES = ['None', 'Bronze', 'Silver', 'Gold'] as const;

export interface MedalRule {
  cat: CategoryId;
  gameId: string;
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

export const MEDAL_RULES: MedalRule[] = [
  { cat: 'typing', gameId: 'typing', url: '/typing/', better: 'higher', tiers: [40, 60, 80], unit: 'WPM',
    counts: 'your best speed in any typing test (weak-key drills excluded)', qualifies: (v) => !v.includes('weak keys') },
  { cat: 'reaction', gameId: 'reaction', url: '/reaction-time/', better: 'lower', tiers: [300, 250, 215], unit: 'ms',
    counts: 'your best average over 5 or 10 rounds', qualifies: () => true },
  { cat: 'memory', gameId: 'sequence-memory', url: '/memory/', better: 'higher', tiers: [6, 9, 12], unit: 'level',
    counts: 'your best level in Sequence Memory', qualifies: () => true },
  { cat: 'math', gameId: 'math', url: '/math/', better: 'higher', tiers: [15, 25, 35], unit: 'correct',
    counts: 'correct answers in a 60-second timed sprint, any difficulty', qualifies: (v) => v.includes('60s sprint') },
  { cat: 'vocabulary', gameId: 'vocabulary', url: '/vocabulary/', better: 'higher', tiers: [7, 9, 10], unit: '/10',
    counts: 'your score in a 10-question round on Medium or Hard', qualifies: tenQuestions },
  { cat: 'geography', gameId: 'geography', url: '/geography/', better: 'higher', tiers: [7, 9, 10], unit: '/10',
    counts: 'your score in a 10-question round on Medium or Hard', qualifies: tenQuestions },
  { cat: 'shortcuts', gameId: 'shortcuts', url: '/keyboard-shortcuts/', better: 'higher', tiers: [7, 9, 10], unit: '/10',
    counts: 'your score in a 10-question practice round (any app)', qualifies: (v) => v.includes('practice') },
  { cat: 'logic', gameId: 'logic', url: '/logic/', better: 'higher', tiers: [6, 8, 10], unit: '/10',
    counts: 'your score in a 10-puzzle round starting on Medium or Hard', qualifies: (v) => v.includes('10 puzzles') && (v.includes('medium') || v.includes('hard')) },
  { cat: 'color', gameId: 'color-match', url: '/color/color-match/', better: 'higher', tiers: [75, 85, 92], unit: '%',
    counts: 'your best average accuracy in Color Match', qualifies: () => true },
  { cat: 'reading', gameId: 'reading', url: '/reading/', better: 'higher', tiers: [200, 300, 400], unit: 'WPM',
    counts: 'your best reading speed (only saved with 75%+ comprehension)', qualifies: () => true },
];

export const ruleFor = (cat: CategoryId) => MEDAL_RULES.find((r) => r.cat === cat)!;

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
  return (rule.tiers.filter(meets).length as MedalLevel);
}

/** The next medal to aim for and how far away it is (null when gold is already won). */
export function nextMedal(rule: MedalRule, score: number | null): { level: MedalLevel; target: number; gap: number | null } | null {
  const level = medalLevel(rule, score);
  if (level === 3) return null;
  const target = rule.tiers[level];
  const gap = score === null ? null : Math.abs(target - score);
  return { level: (level + 1) as MedalLevel, target, gap };
}

export const formatTarget = (rule: MedalRule, v: number) => (rule.unit.startsWith('/') ? `${v}${rule.unit}` : rule.unit === '%' ? `${v}%` : `${v} ${rule.unit}`);

/** Medal levels for every lane. */
export function allMedals(bests: Record<string, ScoreRecord>): Record<CategoryId, MedalLevel> {
  const out = {} as Record<CategoryId, MedalLevel>;
  for (const r of MEDAL_RULES) out[r.cat] = medalLevel(r, bestFor(r, bests));
  return out;
}
