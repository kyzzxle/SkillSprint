// Weak-spot tracking: which keys a player mistypes, which maths operations they get wrong and which
// shortcuts they have missed. Stored only in this browser (cleared by "Reset all data").
import { WEAK_KEY, STORAGE_EVENT } from './storage';

export interface Tally {
  /** attempts (decayed) */
  n: number;
  /** misses (decayed) */
  miss: number;
}

export interface MissedShortcut {
  miss: number;
  /** consecutive correct answers since the last miss; two in a row clears the card */
  streak: number;
}

export interface WeakData {
  v: 1;
  keys: Record<string, Tally>;
  mathOps: Record<string, Tally>;
  shortcuts: Record<string, MissedShortcut>;
}

/** Older sessions count for less, so the drills follow how you type now. */
export const DECAY = 0.85;
export const MASTERED_STREAK = 2;

export const emptyWeak = (): WeakData => ({ v: 1, keys: {}, mathOps: {}, shortcuts: {} });

export function loadWeak(): WeakData {
  try {
    const raw = localStorage.getItem(WEAK_KEY);
    if (!raw) return emptyWeak();
    const d = JSON.parse(raw) as Partial<WeakData>;
    return d && d.v === 1 ? { ...emptyWeak(), ...d } as WeakData : emptyWeak();
  } catch {
    return emptyWeak();
  }
}

export function saveWeak(d: WeakData): void {
  try {
    localStorage.setItem(WEAK_KEY, JSON.stringify(d));
    window.dispatchEvent(new CustomEvent(STORAGE_EVENT));
  } catch {
    /* storage blocked */
  }
}

/** Decays the existing tallies, then adds a new session's counts. Returns a new map. */
export function mergeTallies(existing: Record<string, Tally>, session: Record<string, Tally>, decay = DECAY): Record<string, Tally> {
  const out: Record<string, Tally> = {};
  for (const [k, t] of Object.entries(existing)) {
    const n = t.n * decay;
    if (n >= 0.5) out[k] = { n, miss: t.miss * decay };
  }
  for (const [k, t] of Object.entries(session)) {
    const cur = out[k] ?? { n: 0, miss: 0 };
    out[k] = { n: cur.n + t.n, miss: cur.miss + t.miss };
  }
  return out;
}

export interface Ranked {
  key: string;
  /** miss rate 0-1 */
  rate: number;
  n: number;
  miss: number;
}

/**
 * Keys with the highest miss rate. Needs enough attempts to be meaningful; a light prior
 * (+4 clean attempts) stops one unlucky miss on a rare letter from topping the list.
 */
export function weakestKeys(keys: Record<string, Tally>, limit = 5, minAttempts = 10): Ranked[] {
  return Object.entries(keys)
    .filter(([, t]) => t.n >= minAttempts && t.miss >= 1.5)
    .map(([key, t]) => ({ key, rate: t.miss / t.n, n: t.n, miss: t.miss, score: t.miss / (t.n + 4) }))
    .filter((r) => r.rate >= 0.04)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ key, rate, n, miss }) => ({ key, rate, n, miss }));
}

/** Operations answered at least 4 times (decayed) with accuracy below 85%, weakest first. */
export function weakestOps(ops: Record<string, Tally>, minAttempts = 4): Ranked[] {
  return Object.entries(ops)
    .filter(([, t]) => t.n >= minAttempts)
    .map(([key, t]) => ({ key, rate: t.miss / t.n, n: t.n, miss: t.miss }))
    .filter((r) => r.rate > 0.15)
    .sort((a, b) => b.rate - a.rate);
}

/** Updates the missed-shortcut deck with a round's answers. Keys are "<shortcutId>|<platform>". */
export function updateShortcutDeck(deck: Record<string, MissedShortcut>, answers: { key: string; correct: boolean }[]): Record<string, MissedShortcut> {
  const out = { ...deck };
  for (const a of answers) {
    const cur = out[a.key];
    if (!a.correct) out[a.key] = { miss: (cur?.miss ?? 0) + 1, streak: 0 };
    else if (cur) {
      const streak = cur.streak + 1;
      if (streak >= MASTERED_STREAK) delete out[a.key];
      else out[a.key] = { ...cur, streak };
    }
  }
  return out;
}

/** Deck keys, most-missed first. */
export function deckOrder(deck: Record<string, MissedShortcut>): string[] {
  return Object.entries(deck)
    .sort((a, b) => b[1].miss - a[1].miss || a[1].streak - b[1].streak)
    .map(([k]) => k);
}

/** Converts review items carrying a tag into per-tag tallies. */
export function talliesFromAnswers(answers: { tag?: string; correct: boolean }[]): Record<string, Tally> {
  const out: Record<string, Tally> = {};
  for (const a of answers) {
    if (!a.tag) continue;
    const t = out[a.tag] ?? { n: 0, miss: 0 };
    t.n += 1;
    if (!a.correct) t.miss += 1;
    out[a.tag] = t;
  }
  return out;
}
