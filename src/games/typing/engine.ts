// Pure typing-test logic (no DOM) so it can be unit tested.
import { WORDS_ADVANCED, WORDS_BEGINNER, WORDS_INTERMEDIATE } from '../../data/typing';
import { pick, randInt, type Rng } from '../../lib/random';

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export interface WordOptions {
  difficulty: Difficulty;
  punctuation: boolean;
  numbers: boolean;
}

const pools: Record<Difficulty, string[]> = {
  beginner: WORDS_BEGINNER,
  intermediate: [...WORDS_INTERMEDIATE, ...WORDS_BEGINNER.filter((w) => w.length > 2)],
  advanced: [...WORDS_ADVANCED, ...WORDS_INTERMEDIATE],
};

/** Generates `count` words. `prev` lets successive batches continue punctuation context. */
export function generateWords(rng: Rng, count: number, opts: WordOptions, prev?: string): string[] {
  const pool = pools[opts.difficulty];
  const out: string[] = [];
  let sentenceStart = !prev || /[.!?]$/.test(prev);
  let last = prev ?? '';
  for (let i = 0; i < count; i++) {
    let w: string;
    if (opts.numbers && rng() < 0.12) {
      w = String(randInt(rng, 0, rng() < 0.5 ? 99 : 9999));
    } else {
      do w = pick(rng, pool);
      while (w === last && pool.length > 1);
    }
    if (opts.punctuation) {
      if (sentenceStart && /^[a-z]/.test(w)) w = w[0].toUpperCase() + w.slice(1);
      const r = rng();
      if (r < 0.1) w += ',';
      else if (r < 0.17) w += '.';
      else if (r < 0.2) w += '?';
      else if (r < 0.22) w += '!';
      else if (r < 0.25) w = `"${w}"`;
      else if (r < 0.27 && /^[a-z]+$/i.test(w)) w += "'s";
      else if (r < 0.29) w += ':';
      sentenceStart = /[.!?]"?$/.test(w);
    }
    out.push(w);
    last = w;
  }
  return out;
}

export interface WordResult {
  target: string;
  typed: string;
}

export interface TypingStats {
  wpm: number;
  rawWpm: number;
  accuracy: number; // keystroke accuracy 0-100
  correctChars: number;
  incorrectChars: number;
  extraChars: number;
  missedChars: number;
  wordsTyped: number;
  correctWords: number;
}

/** Character-level comparison of one word. */
export function compareWord(target: string, typed: string) {
  let correct = 0;
  let incorrect = 0;
  for (let i = 0; i < Math.min(target.length, typed.length); i++) {
    if (target[i] === typed[i]) correct++;
    else incorrect++;
  }
  const extra = Math.max(0, typed.length - target.length);
  const missed = Math.max(0, target.length - typed.length);
  return { correct, incorrect, extra, missed };
}

/**
 * WPM follows the common convention: (characters of correctly typed words + their spaces) / 5 per minute.
 * Raw WPM counts every typed character. Accuracy is the share of correct keystrokes (including corrected mistakes).
 */
export function computeStats(
  committed: WordResult[],
  current: WordResult | null,
  elapsedMs: number,
  keystrokes: { correct: number; total: number },
): TypingStats {
  const minutes = Math.max(elapsedMs, 1) / 60000;
  let correctChars = 0, incorrectChars = 0, extraChars = 0, missedChars = 0, wpmChars = 0, rawChars = 0, correctWords = 0;
  for (const w of committed) {
    const c = compareWord(w.target, w.typed);
    correctChars += c.correct;
    incorrectChars += c.incorrect;
    extraChars += c.extra;
    missedChars += c.missed;
    rawChars += w.typed.length + 1; // + space
    if (w.typed === w.target) {
      correctWords++;
      wpmChars += w.target.length + 1;
    }
  }
  if (current && current.typed.length) {
    const c = compareWord(current.target, current.typed);
    correctChars += c.correct;
    incorrectChars += c.incorrect;
    extraChars += c.extra;
    rawChars += current.typed.length;
    // A partially typed word counts if everything typed so far is correct.
    if (current.target.startsWith(current.typed)) wpmChars += current.typed.length;
  }
  return {
    wpm: wpmChars / 5 / minutes,
    rawWpm: rawChars / 5 / minutes,
    accuracy: keystrokes.total ? (keystrokes.correct / keystrokes.total) * 100 : 100,
    correctChars,
    incorrectChars,
    extraChars,
    missedChars,
    wordsTyped: committed.length,
    correctWords,
  };
}

/** Code mode: per-character comparison over a stream. `auto` marks characters inserted automatically (indentation). */
export function computeCodeStats(target: string, typed: string, auto: boolean[], elapsedMs: number, keystrokes: { correct: number; total: number }): TypingStats {
  const minutes = Math.max(elapsedMs, 1) / 60000;
  let correct = 0, incorrect = 0, manual = 0;
  for (let i = 0; i < typed.length; i++) {
    if (auto[i]) continue;
    manual++;
    if (typed[i] === target[i]) correct++;
    else incorrect++;
  }
  const lines = typed.split('\n').length - 1;
  return {
    wpm: correct / 5 / minutes,
    rawWpm: manual / 5 / minutes,
    accuracy: keystrokes.total ? (keystrokes.correct / keystrokes.total) * 100 : 100,
    correctChars: correct,
    incorrectChars: incorrect,
    extraChars: 0,
    missedChars: 0,
    wordsTyped: typed.trim() ? typed.trim().split(/\s+/).length : 0,
    correctWords: lines,
  };
}
