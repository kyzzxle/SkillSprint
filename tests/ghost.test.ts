import { describe, expect, it } from 'vitest';
import { ghostCharsAt, ghostFromSamples, positionFor } from '../src/lib/ghost';

describe('ghost racer', () => {
  it('turns per-second WPM samples into cumulative characters', () => {
    // 60 WPM for 2 seconds = 60 * 5 / 60 = 5 chars per second.
    const g = ghostFromSamples([{ t: 1, wpm: 60 }, { t: 2, wpm: 60 }, { t: 2.5, wpm: 72 }], 72);
    expect(g.wpm).toBe(72);
    expect(g.points).toEqual([[0, 0], [1000, 5], [2000, 10], [2500, 15]]);
  });

  it('never lets the ghost go backwards', () => {
    // A mistake can make net WPM dip; the ghost holds position instead of reversing.
    const g = ghostFromSamples([{ t: 1, wpm: 60 }, { t: 2, wpm: 10 }], 10);
    expect(g.points[2][1]).toBe(5);
  });

  it('interpolates between samples and holds after the end', () => {
    const pts: [number, number][] = [[0, 0], [1000, 10], [2000, 30]];
    expect(ghostCharsAt(pts, 0)).toBe(0);
    expect(ghostCharsAt(pts, 500)).toBe(5);
    expect(ghostCharsAt(pts, 1500)).toBe(20);
    expect(ghostCharsAt(pts, 9000)).toBe(30);
  });

  it('maps characters onto the current words (each word plus its space)', () => {
    const words = ['the', 'quick', 'fox'];
    expect(positionFor(words, 0)).toEqual({ word: 0, letter: 0 });
    expect(positionFor(words, 2)).toEqual({ word: 0, letter: 2 });
    expect(positionFor(words, 3.9)).toEqual({ word: 0, letter: 3 }); // on the space after "the"
    expect(positionFor(words, 4)).toEqual({ word: 1, letter: 0 });
    expect(positionFor(words, 7.5)).toEqual({ word: 1, letter: 3 });
    expect(positionFor(words, 10)).toEqual({ word: 2, letter: 0 });
    expect(positionFor(words, 100)).toEqual({ word: 3, letter: 0 });
  });
});
