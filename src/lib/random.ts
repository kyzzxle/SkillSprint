// Random helpers. Every generator accepts an `Rng` so games can be seeded (e.g. the Daily Challenge).

export type Rng = () => number;

export const defaultRng: Rng = () => Math.random();

/** Mulberry32: small, fast, deterministic PRNG. */
export function seededRng(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Hash a string into a 32-bit seed (FNV-1a). */
export function hashString(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Integer in [min, max] inclusive. */
export function randInt(rng: Rng, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

export function pick<T>(rng: Rng, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

export function shuffle<T>(rng: Rng, arr: readonly T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Pick `n` distinct items. */
export function sample<T>(rng: Rng, arr: readonly T[], n: number): T[] {
  return shuffle(rng, arr).slice(0, n);
}

/**
 * Builds a shuffled list of options containing `answer` plus distinct distractors.
 * Distractors equal to the answer (by key) are skipped.
 */
export function buildOptions<T>(rng: Rng, answer: T, pool: readonly T[], count: number, key: (x: T) => string = String): T[] {
  const seen = new Set([key(answer)]);
  const out: T[] = [answer];
  for (const item of shuffle(rng, pool)) {
    if (out.length >= count) break;
    const k = key(item);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(item);
  }
  return shuffle(rng, out);
}
