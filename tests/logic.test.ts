import { describe, expect, it } from 'vitest';
import { seededRng } from '../src/lib/random';
import { isCorrect, makeMathQuestion, parseAnswer, type MathDifficulty, type MathOp } from '../src/games/math/generator';
import { compareWord, computeStats, generateWords } from '../src/games/typing/engine';
import { colorDistance, deltaE2000, hexToRgb, hslToRgb, matchAccuracy, rgbToHex, rgbToHsl, distractorColors, BANDS } from '../src/games/color/color';
import { DEDUCTIONS, makePuzzle, type LogicCategory } from '../src/games/logic/puzzles';
import { summarize } from '../src/games/reaction/stats';
import { gridForLevel, extendSequence, randomNumber } from '../src/games/memory/logic';
import { addDays, localDateKey } from '../src/lib/date';
import { dailyStreak, type DailyResult } from '../src/lib/storage';
import { SHORTCUTS, APPS, parseCombo, shortcutsFor, type ShortcutApp } from '../src/data/shortcuts';
import { COUNTRIES } from '../src/data/countries';
import { VOCAB, SPELLING } from '../src/data/vocabulary';
import { PASSAGES, wordCount } from '../src/data/passages';
import { readingWpm } from '../src/games/reading/ReadingTest';

const OPS: MathOp[] = ['add', 'sub', 'mul', 'div', 'frac', 'pct', 'pow'];
const DIFFS: MathDifficulty[] = ['easy', 'medium', 'hard'];

describe('mental math', () => {
  it('parses integers, decimals, fractions, mixed numbers and percentages', () => {
    expect(parseAnswer('12')).toEqual({ n: 12, d: 1 });
    expect(parseAnswer('0.75')).toEqual({ n: 3, d: 4 });
    expect(parseAnswer('6/8')).toEqual({ n: 3, d: 4 });
    expect(parseAnswer('1 1/2')).toEqual({ n: 3, d: 2 });
    expect(parseAnswer('-4')).toEqual({ n: -4, d: 1 });
    expect(parseAnswer('35%')).toEqual({ n: 35, d: 1 });
    expect(parseAnswer('3/0')).toBeNull();
    expect(parseAnswer('abc')).toBeNull();
    expect(parseAnswer('')).toBeNull();
  });

  it('accepts equivalent answers only', () => {
    expect(isCorrect('3/4', { n: 3, d: 4 })).toBe(true);
    expect(isCorrect('0.75', { n: 3, d: 4 })).toBe(true);
    expect(isCorrect('9/12', { n: 3, d: 4 })).toBe(true);
    expect(isCorrect('0.7', { n: 3, d: 4 })).toBe(false);
  });

  it('always generates valid, exactly-answerable questions', () => {
    const rng = seededRng(42);
    for (const op of OPS) {
      for (const diff of DIFFS) {
        for (let i = 0; i < 400; i++) {
          const q = makeMathQuestion(rng, [op], diff);
          expect(q.answer.d).not.toBe(0);
          expect(q.answer.n).toBeGreaterThanOrEqual(0);
          if (q.format === 'integer') expect(q.answer.d).toBe(1);
          // The displayed answer must itself be accepted.
          expect(isCorrect(q.answerText, q.answer)).toBe(true);
          expect(q.text).not.toMatch(/÷ 0\b/);
          expect(q.explanation).toContain(q.answerText.split('/')[0]);
          // Check arithmetic independently for the simple operators.
          const m = q.text.match(/^(\d+) ([+−×÷]) (\d+)$/);
          if (m) {
            const a = Number(m[1]), b = Number(m[3]);
            const expected = m[2] === '+' ? a + b : m[2] === '−' ? a - b : m[2] === '×' ? a * b : a / b;
            expect(q.answer.n / q.answer.d).toBe(expected);
          }
          const pm = q.text.match(/^(\d+)% of (\d+)$/);
          if (pm) expect(q.answer.n).toBe((Number(pm[1]) * Number(pm[2])) / 100);
          const sq = q.text.match(/^√(\d+)$/);
          if (sq) expect(q.answer.n ** 2).toBe(Number(sq[1]));
        }
      }
    }
  });
});

describe('typing engine', () => {
  it('compares words character by character', () => {
    expect(compareWord('hello', 'hello')).toEqual({ correct: 5, incorrect: 0, extra: 0, missed: 0 });
    expect(compareWord('hello', 'helo')).toEqual({ correct: 3, incorrect: 1, extra: 0, missed: 1 });
    expect(compareWord('hi', 'hiya')).toEqual({ correct: 2, incorrect: 0, extra: 2, missed: 0 });
  });

  it('computes WPM from correct words over elapsed time', () => {
    // 10 correct 4-letter words = 10 * (4 + 1) = 50 chars = 10 words in 1 minute => 10 WPM
    const words = Array.from({ length: 10 }, () => ({ target: 'test', typed: 'test' }));
    const s = computeStats(words, null, 60000, { correct: 50, total: 50 });
    expect(s.wpm).toBeCloseTo(10);
    expect(s.accuracy).toBe(100);
    expect(s.correctWords).toBe(10);
    // An incorrect word does not count towards WPM but does count towards raw WPM.
    const s2 = computeStats([{ target: 'test', typed: 'tset' }], null, 60000, { correct: 3, total: 5 });
    expect(s2.wpm).toBe(0);
    expect(s2.rawWpm).toBeCloseTo(1);
    expect(s2.accuracy).toBeCloseTo(60);
  });

  it('generates the requested number of words with optional numbers', () => {
    const rng = seededRng(1);
    const w = generateWords(rng, 200, { difficulty: 'beginner', punctuation: false, numbers: true });
    expect(w).toHaveLength(200);
    expect(w.some((x) => /^\d+$/.test(x))).toBe(true);
    expect(w.every((x) => !/\s/.test(x))).toBe(true);
  });
});

describe('colour maths', () => {
  it('converts between hex, rgb and hsl', () => {
    expect(rgbToHex({ r: 255, g: 136, b: 0 })).toBe('#FF8800');
    expect(hexToRgb('#3a7bd5')).toEqual({ r: 58, g: 123, b: 213 });
    expect(hslToRgb({ h: 0, s: 100, l: 50 })).toEqual({ r: 255, g: 0, b: 0 });
    expect(hslToRgb({ h: 120, s: 100, l: 25 })).toEqual({ r: 0, g: 128, b: 0 });
    expect(rgbToHsl({ r: 0, g: 0, b: 255 })).toEqual({ h: 240, s: 100, l: 50 });
  });

  it('matches published CIEDE2000 test data (Sharma et al. 2005)', () => {
    const pairs: [number[], number[], number][] = [
      [[50, 2.6772, -79.7751], [50, 0, -82.7485], 2.0425],
      [[50, 3.1571, -77.2803], [50, 0, -82.7485], 2.8615],
      [[50, -1.3802, -84.2814], [50, 0, -82.7485], 1.0],
      [[50, 0, 0], [50, -1, 2], 2.3669],
      [[60.2574, -34.0099, 36.2677], [60.4626, -34.1751, 39.4387], 1.2644],
      [[22.7233, 20.0904, -46.694], [23.0331, 14.973, -42.5619], 2.0373],
    ];
    for (const [a, b, expected] of pairs) {
      const d = deltaE2000({ L: a[0], a: a[1], b: a[2] }, { L: b[0], a: b[1], b: b[2] });
      expect(d).toBeCloseTo(expected, 3);
    }
  });

  it('scores identical colours as 100% and very different ones as 0%', () => {
    expect(matchAccuracy(colorDistance({ r: 10, g: 20, b: 30 }, { r: 10, g: 20, b: 30 }))).toBe(100);
    expect(matchAccuracy(colorDistance({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 }))).toBe(0);
  });

  it('creates distractors inside the difficulty band', () => {
    const rng = seededRng(7);
    for (const level of ['easy', 'medium', 'hard'] as const) {
      const [lo, hi] = BANDS[level];
      for (let i = 0; i < 30; i++) {
        const target = hslToRgb({ h: i * 12, s: 70, l: 50 });
        const ds = distractorColors(rng, target, 3, lo, hi);
        expect(ds).toHaveLength(3);
        for (const d of ds) expect(colorDistance(d, target)).toBeGreaterThanOrEqual(6);
      }
    }
  });
});

describe('logic puzzles', () => {
  it('always has exactly one listed correct answer among 4 distinct options', () => {
    const rng = seededRng(99);
    const cats: LogicCategory[] = ['mixed', 'sequences', 'patterns', 'reasoning', 'deduction'];
    for (const c of cats) {
      for (let lvl = 1; lvl <= 5; lvl++) {
        for (let i = 0; i < 150; i++) {
          const p = makePuzzle(rng, c, lvl);
          expect(p.options).toHaveLength(4);
          expect(new Set(p.options).size).toBe(4);
          expect(p.options).toContain(p.answer);
          expect(p.explanation.length).toBeGreaterThan(10);
        }
      }
    }
  });

  it('sequence answers follow the explained rule', () => {
    const rng = seededRng(5);
    for (let i = 0; i < 2000; i++) {
      const p = makePuzzle(rng, 'sequences', 1 + (i % 5));
      if (p.type !== 'Number sequence') continue;
      // The explanation always ends with "= <answer>." for next-term sequences.
      expect(p.explanation).toMatch(new RegExp(`= ${p.answer}\\.$`));
    }
  });

  it('hand-written deductions are well formed', () => {
    for (const d of DEDUCTIONS) {
      expect(d.wrong).not.toContain(d.answer);
      expect(new Set(d.wrong).size).toBe(3);
    }
  });
});

describe('memory, reaction and reading helpers', () => {
  it('summarises reaction times', () => {
    expect(summarize([200, 300, 250])).toEqual({ average: 250, fastest: 200, slowest: 300, median: 250 });
    expect(summarize([200, 300]).median).toBe(250);
  });
  it('grows memory difficulty monotonically', () => {
    let prev = gridForLevel(1);
    for (let l = 2; l < 20; l++) {
      const g = gridForLevel(l);
      expect(g.size).toBeGreaterThanOrEqual(prev.size);
      expect(g.count).toBeGreaterThanOrEqual(prev.count);
      expect(g.count).toBeLessThan(g.size * g.size);
      prev = g;
    }
  });
  it('extends sequences one step at a time and creates numbers of exact length', () => {
    const rng = seededRng(3);
    let seq: number[] = [];
    for (let i = 0; i < 30; i++) {
      seq = extendSequence(rng, seq);
      expect(seq).toHaveLength(i + 1);
      expect(seq[i]).toBeGreaterThanOrEqual(0);
      expect(seq[i]).toBeLessThan(9);
    }
    for (let d = 1; d < 20; d++) expect(randomNumber(rng, d)).toMatch(new RegExp(`^[1-9]\\d{${d - 1}}$`));
  });
  it('computes reading WPM from word count and time', () => {
    expect(readingWpm(300, 60000)).toBe(300);
    expect(readingWpm(250, 30000)).toBe(500);
    for (const p of PASSAGES) {
      expect(wordCount(p)).toBeGreaterThan(100);
      for (const q of p.questions) expect(q.answer).toBeLessThan(q.options.length);
    }
  });
});

describe('dates and streaks', () => {
  it('does calendar arithmetic across months and years', () => {
    expect(addDays('2026-01-31', 1)).toBe('2026-02-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(localDateKey(new Date(2026, 10, 5, 23, 59))).toBe('2026-11-05');
  });
  it('counts current and best daily streaks', () => {
    const r: DailyResult = { score: 5, total: 10, durationMs: 1, completedAt: '', answers: [] };
    const daily = { '2026-11-15': r, '2026-11-16': r, '2026-11-17': r, '2026-11-19': r, '2026-11-20': r };
    expect(dailyStreak(daily, '2026-11-20')).toEqual({ current: 2, best: 3 });
    expect(dailyStreak(daily, '2026-11-21')).toEqual({ current: 2, best: 3 }); // today not yet played
    expect(dailyStreak(daily, '2026-11-23').current).toBe(0);
  });
});

describe('reference data', () => {
  it('has enough shortcuts per app/platform and no duplicate combos', () => {
    for (const app of Object.keys(APPS) as ShortcutApp[]) {
      for (const pf of APPS[app].platforms) {
        const list = shortcutsFor(app, pf);
        expect(list.length).toBeGreaterThanOrEqual(8);
        expect(new Set(list.map((s) => s.combo)).size).toBe(list.length);
        expect(new Set(list.map((s) => s.action)).size).toBe(list.length);
      }
    }
    expect(new Set(SHORTCUTS.map((s) => s.id)).size).toBe(SHORTCUTS.length);
    expect(parseCombo('Ctrl+K, Z')).toEqual([['Ctrl', 'K'], ['Z']]);
    expect(parseCombo('Win+.')).toEqual([['Win', '.']]);
  });
  it('has unique countries and complete capital data', () => {
    expect(new Set(COUNTRIES.map((c) => c.iso2)).size).toBe(COUNTRIES.length);
    expect(new Set(COUNTRIES.map((c) => c.num)).size).toBe(COUNTRIES.length);
    for (const c of COUNTRIES) if (c.capital !== null) expect(c.capital.length).toBeGreaterThan(1);
  });
  it('has well-formed vocabulary and spelling entries', () => {
    expect(new Set(VOCAB.map((v) => v.word)).size).toBe(VOCAB.length);
    for (const v of VOCAB) {
      expect(v.synonyms).not.toContain(v.word);
      for (const a of v.antonyms) expect(v.synonyms).not.toContain(a);
    }
    for (const s of SPELLING) {
      expect(s.wrong).not.toContain(s.word);
      expect(new Set(s.wrong).size).toBe(3);
    }
  });
});
