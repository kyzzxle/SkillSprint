// Local, browser-only persistence for SkillSprint. Nothing here is sent to a server.
// All access is wrapped in try/catch so the site keeps working when storage is blocked.

import { addDays } from './date';

const KEY = 'skillsprint:data:v1';
export const THEME_KEY = 'skillsprint:theme';
export const STORAGE_EVENT = 'skillsprint:storage';
const HISTORY_LIMIT = 300;

export interface ScoreRecord {
  score: number;
  display: string;
  date: string; // ISO timestamp
}

export interface HistoryEntry {
  gameId: string;
  variant: string;
  score: number;
  display: string;
  url: string;
  date: string;
}

export interface DailyResult {
  score: number;
  total: number;
  durationMs: number;
  completedAt: string;
  answers: boolean[];
}

export interface StoreData {
  v: 1;
  bests: Record<string, ScoreRecord>; // key: `${gameId}|${variant}`
  history: HistoryEntry[];
  plays: Record<string, number>;
  daily: Record<string, DailyResult>; // key: YYYY-MM-DD
  prefs: Record<string, Record<string, unknown>>;
}

const empty = (): StoreData => ({ v: 1, bests: {}, history: [], plays: {}, daily: {}, prefs: {} });

export function storageAvailable(): boolean {
  try {
    const t = '__ss_test__';
    localStorage.setItem(t, t);
    localStorage.removeItem(t);
    return true;
  } catch {
    return false;
  }
}

export function load(): StoreData {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty();
    const data = JSON.parse(raw) as Partial<StoreData>;
    if (!data || data.v !== 1) return empty();
    return { ...empty(), ...data } as StoreData;
  } catch {
    return empty();
  }
}

function save(data: StoreData): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* storage full or blocked — fail silently, the game still works */
  }
  try {
    window.dispatchEvent(new CustomEvent(STORAGE_EVENT));
  } catch {
    /* non-browser */
  }
}

export const bestKey = (gameId: string, variant: string) => `${gameId}|${variant}`;

export function getBest(gameId: string, variant: string): ScoreRecord | undefined {
  return load().bests[bestKey(gameId, variant)];
}

export interface RecordInput {
  gameId: string;
  variant: string;
  score: number;
  display: string;
  better: 'higher' | 'lower';
  url: string;
}

export interface RecordOutcome {
  isBest: boolean;
  previous?: ScoreRecord;
}

/** Saves a finished game: updates history, play count and personal best. */
export function recordResult(input: RecordInput): RecordOutcome {
  const data = load();
  const k = bestKey(input.gameId, input.variant);
  const previous = data.bests[k];
  const date = new Date().toISOString();
  const isBest =
    !previous || (input.better === 'higher' ? input.score > previous.score : input.score < previous.score);
  if (isBest) data.bests[k] = { score: input.score, display: input.display, date };
  data.history.unshift({
    gameId: input.gameId, variant: input.variant, score: input.score, display: input.display, url: input.url, date,
  });
  if (data.history.length > HISTORY_LIMIT) data.history.length = HISTORY_LIMIT;
  data.plays[input.gameId] = (data.plays[input.gameId] ?? 0) + 1;
  save(data);
  return { isBest, previous };
}

export function getPrefs<T extends Record<string, unknown>>(gameId: string, defaults: T): T {
  const stored = load().prefs[gameId] ?? {};
  const out = { ...defaults };
  for (const k of Object.keys(defaults) as (keyof T)[]) {
    const v = stored[k as string];
    if (v !== undefined && typeof v === typeof defaults[k]) out[k] = v as T[keyof T];
  }
  return out;
}

export function setPrefs(gameId: string, prefs: Record<string, unknown>): void {
  const data = load();
  data.prefs[gameId] = { ...(data.prefs[gameId] ?? {}), ...prefs };
  save(data);
}

export function getDaily(dateKey: string): DailyResult | undefined {
  return load().daily[dateKey];
}

export function saveDaily(dateKey: string, result: DailyResult): boolean {
  const data = load();
  if (data.daily[dateKey]) return false; // first attempt counts
  data.daily[dateKey] = result;
  save(data);
  return true;
}

/** Consecutive days with a completed daily challenge, ending today (or yesterday if today is not done yet). */
export function dailyStreak(daily: Record<string, DailyResult>, today: string): { current: number; best: number } {
  let start = daily[today] ? today : addDays(today, -1);
  let current = 0;
  while (daily[start]) {
    current++;
    start = addDays(start, -1);
  }
  const keys = Object.keys(daily).sort();
  let best = 0;
  let run = 0;
  let prev = '';
  for (const k of keys) {
    run = prev && addDays(prev, 1) === k ? run + 1 : 1;
    best = Math.max(best, run);
    prev = k;
  }
  return { current, best: Math.max(best, current) };
}

export function resetAll(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
  save(empty());
}

/** Subscribe to storage changes from this tab and other tabs. Returns an unsubscribe function. */
export function onStorageChange(cb: () => void): () => void {
  const onStorage = (e: StorageEvent) => {
    if (e.key === null || e.key === KEY) cb();
  };
  window.addEventListener(STORAGE_EVENT, cb);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(STORAGE_EVENT, cb);
    window.removeEventListener('storage', onStorage);
  };
}
