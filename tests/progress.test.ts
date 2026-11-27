import { describe, expect, it } from 'vitest';
import { MEDAL_RULES, allMedals, bestFor, medalLevel, nextMedal, ruleFor } from '../src/lib/medals';
import { deckOrder, mergeTallies, talliesFromAnswers, updateShortcutDeck, weakestKeys, weakestOps } from '../src/lib/weakspots';
import { generateWeakWords } from '../src/games/typing/engine';
import { niceStep } from '../src/components/Progress';
import { seededRng } from '../src/lib/random';
import { CATEGORIES } from '../src/data/catalog';

const rec = (score: number) => ({ score, display: String(score), date: '2026-11-27T00:00:00Z' });

describe('lane medals', () => {
  it('has one rule per lane with tiers in the right order', () => {
    expect(MEDAL_RULES.map((r) => r.cat).sort()).toEqual(CATEGORIES.map((c) => c.id).sort());
    for (const r of MEDAL_RULES) {
      const [b, s, g] = r.tiers;
      if (r.better === 'higher') expect(b < s && s < g).toBe(true);
      else expect(b > s && s > g).toBe(true);
    }
  });

  it('only counts qualifying results', () => {
    const typing = ruleFor('typing');
    const bests = { 'typing|30s · intermediate': rec(55), 'typing|30s · weak keys': rec(90), 'typing-code|30s': rec(99) };
    expect(bestFor(typing, bests)).toBe(55);
    expect(medalLevel(typing, 55)).toBe(1);
    const math = ruleFor('math');
    expect(bestFor(math, { 'math|easy · 20 questions · + −': rec(20), 'math|hard · 60s sprint · ×': rec(26) })).toBe(26);
    const geo = ruleFor('geography');
    expect(bestFor(geo, { 'geography|Flags · easy · 10 questions': rec(10), 'geography|Map · hard · 10 questions': rec(8) })).toBe(8);
  });

  it('handles lower-is-better lanes', () => {
    const r = ruleFor('reaction');
    expect(medalLevel(r, 320)).toBe(0);
    expect(medalLevel(r, 300)).toBe(1);
    expect(medalLevel(r, 240)).toBe(2);
    expect(medalLevel(r, 200)).toBe(3);
    expect(bestFor(r, { 'reaction|5 rounds': rec(260), 'reaction|10 rounds': rec(240) })).toBe(240);
    expect(nextMedal(r, 260)).toEqual({ level: 2, target: 250, gap: 10 });
  });

  it('reports the next target and stops at gold', () => {
    const t = ruleFor('typing');
    expect(nextMedal(t, null)).toEqual({ level: 1, target: 40, gap: null });
    expect(nextMedal(t, 52)).toEqual({ level: 2, target: 60, gap: 8 });
    expect(nextMedal(t, 85)).toBeNull();
    expect(allMedals({}).typing).toBe(0);
  });
});

describe('weak spots', () => {
  it('decays old tallies and adds new ones', () => {
    const merged = mergeTallies({ a: { n: 100, miss: 20 } }, { a: { n: 10, miss: 0 }, b: { n: 5, miss: 1 } }, 0.5);
    expect(merged.a).toEqual({ n: 60, miss: 10 });
    expect(merged.b).toEqual({ n: 5, miss: 1 });
  });

  it('ranks keys by miss rate and ignores rare or clean keys', () => {
    const keys = { e: { n: 200, miss: 4 }, t: { n: 80, miss: 12 }, q: { n: 3, miss: 2 }, r: { n: 60, miss: 9 }, a: { n: 90, miss: 0 } };
    const weak = weakestKeys(keys);
    expect(weak.map((w) => w.key)).toEqual(['t', 'r']);
    expect(weak[0].rate).toBeCloseTo(0.15);
  });

  it('finds weak maths operations from tagged answers', () => {
    const t = talliesFromAnswers([
      { tag: 'frac', correct: false }, { tag: 'frac', correct: false }, { tag: 'frac', correct: true }, { tag: 'frac', correct: false },
      { tag: 'add', correct: true }, { tag: 'add', correct: true }, { tag: 'add', correct: true }, { tag: 'add', correct: true },
      { correct: false },
    ]);
    expect(t.frac).toEqual({ n: 4, miss: 3 });
    expect(weakestOps(t).map((o) => o.key)).toEqual(['frac']);
  });

  it('clears a missed shortcut after two correct answers in a row', () => {
    let deck = updateShortcutDeck({}, [{ key: 'v-zen|win', correct: false }, { key: 'w-lock|win', correct: false }, { key: 'w-lock|win', correct: false }]);
    expect(deckOrder(deck)).toEqual(['w-lock|win', 'v-zen|win']);
    deck = updateShortcutDeck(deck, [{ key: 'v-zen|win', correct: true }]);
    expect(deck['v-zen|win'].streak).toBe(1);
    deck = updateShortcutDeck(deck, [{ key: 'v-zen|win', correct: true }, { key: 'x-other|win', correct: true }]);
    expect(deck['v-zen|win']).toBeUndefined();
    expect(deck['x-other|win']).toBeUndefined();
    deck = updateShortcutDeck(deck, [{ key: 'w-lock|win', correct: true }, { key: 'w-lock|win', correct: false }]);
    expect(deck['w-lock|win']).toEqual({ miss: 3, streak: 0 });
  });

  it('builds drill words that contain the weak keys', () => {
    const words = generateWeakWords(seededRng(4), 200, ['q', 'z']);
    expect(words).toHaveLength(200);
    for (const w of words) expect(/[qz]/.test(w)).toBe(true);
  });
});

describe('progress chart axis', () => {
  it('picks round tick steps', () => {
    expect(niceStep(40, 4)).toBe(10);
    expect(niceStep(7, 4)).toBe(2);
    expect(niceStep(120, 4)).toBe(50);
    expect(niceStep(0.9, 4)).toBe(0.25);
  });
});
