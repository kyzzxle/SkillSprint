import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { getBest, getPrefs, setPrefs, type ScoreRecord } from '../../lib/storage';

/**
 * Countdown timer based on performance.now() (drift-free). Re-renders ~10x per second.
 * `running` starts/stops it; when it reaches zero `onExpire` is called once.
 */
export function useCountdown(durationMs: number, running: boolean, onExpire: () => void) {
  const [remaining, setRemaining] = useState(durationMs);
  const expireRef = useRef(onExpire);
  expireRef.current = onExpire;
  const startRef = useRef(0);

  useEffect(() => {
    if (!running) {
      setRemaining(durationMs);
      return;
    }
    startRef.current = performance.now();
    setRemaining(durationMs);
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      setRemaining(0);
      expireRef.current();
    };
    const interval = window.setInterval(() => {
      const left = durationMs - (performance.now() - startRef.current);
      if (left <= 0) finish();
      else setRemaining(left);
    }, 100);
    const timeout = window.setTimeout(finish, durationMs);
    return () => {
      done = true;
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, [running, durationMs]);

  const elapsed = () => (running ? performance.now() - startRef.current : 0);
  return { remaining, elapsed };
}

/** Count-up stopwatch (ms), updating ~10x per second while running. */
export function useStopwatch(running: boolean) {
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef(0);
  useEffect(() => {
    if (!running) return;
    startRef.current = performance.now();
    setElapsed(0);
    const id = window.setInterval(() => setElapsed(performance.now() - startRef.current), 100);
    return () => window.clearInterval(id);
  }, [running]);
  return { elapsed, read: () => performance.now() - startRef.current };
}

/** Game preferences persisted in localStorage. Values are loaded after mount to keep SSR markup stable. */
export function usePrefs<T extends Record<string, unknown>>(gameId: string, defaults: T, overrides?: Partial<T>) {
  const [prefs, setState] = useState<T>({ ...defaults, ...overrides });
  useEffect(() => {
    // Page presets (e.g. /geography/flags/) take precedence over stored preferences.
    setState({ ...getPrefs(gameId, defaults), ...overrides });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId]);
  const update = useCallback(
    (patch: Partial<T>) => {
      setState((p) => {
        const next = { ...p, ...patch };
        setPrefs(gameId, next);
        return next;
      });
    },
    [gameId],
  );
  return [prefs, update] as const;
}

/** Personal best for a game variant, refreshed whenever the variant or `version` changes. */
export function useBest(gameId: string, variant: string, version = 0): ScoreRecord | undefined {
  const [best, setBest] = useState<ScoreRecord | undefined>(undefined);
  useEffect(() => {
    setBest(getBest(gameId, variant));
  }, [gameId, variant, version]);
  return best;
}

/** Global keydown listener that ignores events while the user types in form fields (unless allowed). */
export function useKeydown(handler: (e: KeyboardEvent) => void, active = true) {
  const ref = useRef(handler);
  ref.current = handler;
  useEffect(() => {
    if (!active) return;
    const fn = (e: KeyboardEvent) => ref.current(e);
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [active]);
}

export function isTypingTarget(t: EventTarget | null): boolean {
  const el = t as HTMLElement | null;
  if (!el) return false;
  return el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable;
}

export function prefersReducedMotion(): boolean {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}
