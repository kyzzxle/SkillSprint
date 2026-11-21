// Pure logic for the memory games (unit tested).
import { randInt, shuffle, type Rng } from '../../lib/random';

/** Sequence memory: append one random tile (0-8) per level; avoid repeating the previous tile. */
export function extendSequence(rng: Rng, seq: number[], tiles = 9): number[] {
  let next = randInt(rng, 0, tiles - 1);
  if (seq.length && next === seq[seq.length - 1]) next = (next + 1 + randInt(rng, 0, tiles - 2)) % tiles;
  return [...seq, next];
}

/** Flash timing speeds up gradually so later levels stay challenging. */
export function flashTiming(level: number): { on: number; off: number } {
  const on = Math.max(260, 520 - level * 18);
  return { on, off: Math.max(110, 220 - level * 6) };
}

/** Number memory: a random number with exactly `digits` digits (no leading zero). */
export function randomNumber(rng: Rng, digits: number): string {
  let s = String(randInt(rng, 1, 9));
  for (let i = 1; i < digits; i++) s += String(randInt(rng, 0, 9));
  return s;
}

/** How long the number stays visible: grows with length. */
export function numberShowTime(digits: number): number {
  return 1000 + digits * 600;
}

/** Memory grid: grid size and number of highlighted tiles for a level (level starts at 1). */
export function gridForLevel(level: number): { size: number; count: number } {
  const count = level + 2;
  const size = level <= 2 ? 3 : level <= 5 ? 4 : level <= 8 ? 5 : level <= 12 ? 6 : 7;
  return { size, count: Math.min(count, size * size - 1) };
}

export function pickTiles(rng: Rng, size: number, count: number): number[] {
  return shuffle(rng, Array.from({ length: size * size }, (_, i) => i)).slice(0, count);
}
