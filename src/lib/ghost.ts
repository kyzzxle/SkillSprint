// Ghost racer for the typing test: replays the pace of your best run (for the same settings)
// as a second caret moving through the current words. Stored only in this browser.

export const GHOST_KEY = 'skillsprint:ghost:v1';

export interface Ghost {
  wpm: number;
  /** [elapsed ms, correctly typed characters so far] — rises over time */
  points: [number, number][];
  date: string;
}

type GhostStore = Record<string, Ghost>;

function readAll(): GhostStore {
  try {
    const raw = localStorage.getItem(GHOST_KEY);
    const d = raw ? (JSON.parse(raw) as GhostStore) : {};
    return d && typeof d === 'object' ? d : {};
  } catch {
    return {};
  }
}

export function loadGhost(key: string): Ghost | null {
  const g = readAll()[key];
  return g && Array.isArray(g.points) && g.points.length >= 2 ? g : null;
}

export function saveGhost(key: string, g: Ghost): void {
  try {
    const all = readAll();
    all[key] = g;
    localStorage.setItem(GHOST_KEY, JSON.stringify(all));
  } catch {
    /* storage blocked: the race still works, it just isn't saved */
  }
}

/**
 * Builds a ghost from the per-second chart samples of a finished test.
 * Net WPM × 5 × minutes = characters of correctly typed words (the same measure as WPM).
 */
export function ghostFromSamples(samples: { t: number; wpm: number }[], finalWpm: number): Ghost {
  const points: [number, number][] = [[0, 0]];
  let last = 0;
  for (const s of samples) {
    const chars = Math.max(last, (s.wpm * 5 * s.t) / 60);
    points.push([Math.round(s.t * 1000), Math.round(chars * 10) / 10]);
    last = chars;
  }
  return { wpm: Math.round(finalWpm), points, date: new Date().toISOString() };
}

/** Characters the ghost has typed after `ms` (linear between samples, holds after the end). */
export function ghostCharsAt(points: [number, number][], ms: number): number {
  if (!points.length || ms <= 0) return 0;
  for (let i = 1; i < points.length; i++) {
    const [t1, c1] = points[i];
    if (ms <= t1) {
      const [t0, c0] = points[i - 1];
      return t1 === t0 ? c1 : c0 + ((c1 - c0) * (ms - t0)) / (t1 - t0);
    }
  }
  return points[points.length - 1][1];
}

/** Where `chars` correctly typed characters (including the space after each word) land in a word list. */
export function positionFor(words: string[], chars: number): { word: number; letter: number } {
  let left = Math.max(0, chars);
  for (let i = 0; i < words.length; i++) {
    const len = words[i].length + 1; // word + space
    if (left < len) return { word: i, letter: Math.min(Math.floor(left), words[i].length) };
    left -= len;
  }
  return { word: words.length, letter: 0 };
}
