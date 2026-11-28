// Tests for quiz question generators (they return JSX, so they are kept separate).
import { describe, expect, it } from 'vitest';
import { seededRng } from '../src/lib/random';
import { vocabQuestion, spellingQuestion, maskWord } from '../src/games/vocabulary/questions';
import { geoQuestion, type GeoMode } from '../src/games/geography/questions';
import { shortcutQuestion } from '../src/games/shortcuts/ShortcutQuiz';
import { colorQuestion } from '../src/games/color/ColorChallenge';
import { buildDaily, DAILY_COUNT } from '../src/games/daily/daily';
import { COUNTRIES } from '../src/data/countries';
import { APPS, type ShortcutApp } from '../src/data/shortcuts';
import type { QuizQuestion } from '../src/components/ui/QuizRunner';

function checkChoice(q: QuizQuestion) {
  expect(q.kind).toBe('choice');
  expect(q.choices).toBeDefined();
  const ids = q.choices!.map((c) => c.id);
  expect(new Set(ids).size).toBe(ids.length);
  expect(ids).toContain(q.correctId);
  const texts = q.choices!.map((c) => c.text);
  expect(new Set(texts).size).toBe(texts.length);
}

describe('vocabulary & spelling questions', () => {
  it('produce valid multiple-choice and typing questions', () => {
    const rng = seededRng(11);
    for (const level of ['easy', 'medium', 'hard'] as const) {
      for (const mode of ['definition', 'synonym', 'antonym', 'mixed'] as const) {
        for (let i = 0; i < 80; i++) checkChoice(vocabQuestion(rng, mode, level, 'choice', `k${i}`));
      }
      for (let i = 0; i < 40; i++) {
        const q = vocabQuestion(rng, 'definition', level, 'typing', `t${i}`);
        expect(q.accept!(q.answerText)).toBe(true);
        expect(q.accept!(q.answerText.toUpperCase())).toBe(true);
        expect(q.accept!('zzz')).toBe(false);
      }
      for (const mode of ['choose', 'missing'] as const) for (let i = 0; i < 60; i++) checkChoice(spellingQuestion(rng, mode, level, 'choice', `s${i}`));
      for (let i = 0; i < 40; i++) {
        const q = spellingQuestion(rng, 'fix', level, 'typing', `f${i}`);
        expect(q.accept!(q.answerText)).toBe(true);
      }
    }
  });
  it('masks the requested number of letters but never the first', () => {
    const rng = seededRng(2);
    for (let i = 0; i < 100; i++) {
      const { masked, positions } = maskWord(rng, 'accommodate', 3);
      expect(positions).toHaveLength(3);
      expect(masked[0]).toBe('a');
      expect(masked.split('').filter((c) => c === '_')).toHaveLength(3);
    }
  });
});

describe('geography questions', () => {
  it('always include the correct country and respect exclusions', () => {
    const rng = seededRng(21);
    const modes: GeoMode[] = ['flags', 'capitals', 'map', 'continents', 'mixed'];
    for (const mode of modes) {
      for (const level of ['easy', 'medium', 'hard'] as const) {
        for (let i = 0; i < 80; i++) {
          const q = geoQuestion(rng, mode, level, `g${i}`);
          checkChoice(q);
          if (q.reviewText.startsWith('Continent of')) {
            const name = q.reviewText.replace('Continent of ', '');
            expect(COUNTRIES.find((c) => c.name === name)?.transcontinental).toBeFalsy();
          }
          if (q.reviewText.startsWith('Capital of')) {
            const name = q.reviewText.replace('Capital of ', '');
            expect(COUNTRIES.find((c) => c.name === name)?.capital).toBe(q.answerText);
          }
        }
      }
    }
  });
});

describe('shortcut and colour questions', () => {
  it('generate valid shortcut questions for every app and platform', () => {
    const rng = seededRng(31);
    for (const app of Object.keys(APPS) as ShortcutApp[]) {
      for (const pf of APPS[app].platforms) {
        for (let i = 0; i < 40; i++) checkChoice(shortcutQuestion(rng, app, pf, 'mixed', `x${i}`));
      }
    }
  });
  it('generate valid colour questions', () => {
    const rng = seededRng(41);
    for (const mode of ['rgb', 'hex', 'complement', 'mixed'] as const) {
      for (const level of ['easy', 'medium', 'hard'] as const) {
        for (let i = 0; i < 25; i++) checkChoice(colorQuestion(rng, mode, level, `c${i}`));
      }
    }
  });
});

describe('daily challenge', () => {
  it('is identical for the same date and different on other dates', () => {
    const a = buildDaily('2026-11-20').map((q) => `${q.reviewText}|${q.answerText}`);
    const b = buildDaily('2026-11-20').map((q) => `${q.reviewText}|${q.answerText}`);
    const c = buildDaily('2026-11-21').map((q) => `${q.reviewText}|${q.answerText}`);
    expect(a).toHaveLength(DAILY_COUNT);
    expect(a).toEqual(b);
    expect(a).not.toEqual(c);
  });
  it('builds valid questions for a whole year of dates', () => {
    const start = new Date(2026, 0, 1);
    for (let i = 0; i < 365; i++) {
      const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const qs = buildDaily(key);
      expect(qs).toHaveLength(DAILY_COUNT);
      for (const q of qs) if (q.kind === 'choice') checkChoice(q);
    }
  });
});

import { comboMessage } from '../src/components/ui/QuizRunner';
describe('combo streaks', () => {
  it('calls out milestones only', () => {
    expect(comboMessage(1)).toBeNull();
    expect(comboMessage(2)).toBeNull();
    expect(comboMessage(3)).toBe('3 in a row!');
    expect(comboMessage(4)).toBeNull();
    expect(comboMessage(5)).toMatch(/^5 in a row/);
    expect(comboMessage(10)).toMatch(/^10 in a row/);
    expect(comboMessage(15)).toMatch(/^15 in a row/);
    expect(comboMessage(20)).toMatch(/^20 in a row/);
    expect(comboMessage(21)).toBeNull();
    expect(comboMessage(25)).toMatch(/^25 in a row/);
  });
});
