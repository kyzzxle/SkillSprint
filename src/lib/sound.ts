// Sound effects and haptics, synthesised with the Web Audio API (no audio files to download).
// One switch controls both; the choice is stored in this browser. Every sound follows a user action,
// so browsers' autoplay rules are respected.

export const SOUND_KEY = 'skillsprint:sound';
export const SOUND_EVENT = 'skillsprint:sound-change';

export function soundOn(): boolean {
  try {
    return localStorage.getItem(SOUND_KEY) !== 'off';
  } catch {
    return true;
  }
}

export function setSoundOn(on: boolean): void {
  try {
    localStorage.setItem(SOUND_KEY, on ? 'on' : 'off');
  } catch {
    /* storage blocked */
  }
  window.dispatchEvent(new CustomEvent(SOUND_EVENT));
}

let ctx: AudioContext | null = null;
function audio(): AudioContext | null {
  if (!soundOn() || typeof window === 'undefined') return null;
  try {
    if (!ctx) {
      const C = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!C) return null;
      ctx = new C();
    }
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

interface ToneOpts {
  freq: number;
  /** seconds from now */
  at?: number;
  dur?: number;
  type?: OscillatorType;
  gain?: number;
  /** glide to this frequency */
  to?: number;
}

function tone(a: AudioContext, { freq, at = 0, dur = 0.12, type = 'sine', gain = 0.12, to }: ToneOpts) {
  const t = a.currentTime + at;
  const osc = a.createOscillator();
  const g = a.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (to) osc.frequency.exponentialRampToValueAtTime(to, t + dur);
  // Short attack and exponential release: no clicks.
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g).connect(a.destination);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

function vibrate(pattern: number | number[]) {
  if (!soundOn()) return;
  try {
    // Browsers only allow vibration after the user has tapped the page.
    const activation = (navigator as Navigator & { userActivation?: { hasBeenActive: boolean } }).userActivation;
    if (activation && !activation.hasBeenActive) return;
    navigator.vibrate?.(pattern);
  } catch {
    /* unsupported */
  }
}

// Notes of a C major pentatonic scale, used so every combination sounds pleasant.
const SCALE = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66, 1318.51, 1567.98];

export const sfx = {
  /** right answer: quick rising pair */
  correct() {
    const a = audio();
    if (!a) return;
    tone(a, { freq: 659.25, dur: 0.09, type: 'triangle' });
    tone(a, { freq: 987.77, at: 0.07, dur: 0.14, type: 'triangle' });
  },
  /** wrong answer: short low buzz + a tap on phones */
  wrong() {
    const a = audio();
    vibrate(60);
    if (!a) return;
    tone(a, { freq: 196, dur: 0.18, type: 'square', gain: 0.05, to: 150 });
  },
  /** combo milestone: an arpeggio that climbs higher with bigger streaks */
  combo(streak: number) {
    const a = audio();
    vibrate([30, 40, 30]);
    if (!a) return;
    const steps = Math.min(5, 2 + Math.floor(streak / 5));
    const base = Math.min(3, Math.floor(streak / 5));
    for (let i = 0; i < steps; i++) tone(a, { freq: SCALE[base + i], at: i * 0.07, dur: 0.16, type: 'triangle', gain: 0.1 });
  },
  /** streak broken: falling slide */
  streakLost() {
    const a = audio();
    if (!a) return;
    tone(a, { freq: 440, dur: 0.35, type: 'sawtooth', gain: 0.04, to: 160 });
  },
  /** countdown tick (3, 2, 1) */
  tick() {
    const a = audio();
    if (!a) return;
    tone(a, { freq: 660, dur: 0.1, type: 'square', gain: 0.05 });
  },
  /** countdown "Go" */
  go() {
    const a = audio();
    if (!a) return;
    tone(a, { freq: 1320, dur: 0.28, type: 'square', gain: 0.06 });
  },
  /** a soft blip (tile hits, round results) */
  blip(step = 0) {
    const a = audio();
    if (!a) return;
    tone(a, { freq: SCALE[step % SCALE.length], dur: 0.12, type: 'sine', gain: 0.1 });
  },
  /** each memory tile has its own note */
  tile(i: number) {
    const a = audio();
    if (!a) return;
    tone(a, { freq: SCALE[i % SCALE.length], dur: 0.22, type: 'triangle', gain: 0.11 });
  },
  /** end of a game */
  finish() {
    const a = audio();
    if (!a) return;
    tone(a, { freq: 783.99, dur: 0.12, type: 'triangle' });
    tone(a, { freq: 1046.5, at: 0.1, dur: 0.22, type: 'triangle' });
  },
  /** new personal best */
  pb() {
    const a = audio();
    vibrate([40, 60, 40]);
    if (!a) return;
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(a, { freq: f, at: i * 0.08, dur: 0.18, type: 'triangle', gain: 0.1 }));
  },
  /** medal fanfare: bigger for better medals */
  medal(tier: 1 | 2 | 3) {
    const a = audio();
    vibrate(tier === 3 ? [60, 50, 60, 50, 120] : [60, 50, 100]);
    if (!a) return;
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98].slice(0, 3 + tier);
    notes.forEach((f, i) => tone(a, { freq: f, at: i * 0.09, dur: 0.2, type: 'triangle', gain: 0.1 }));
    const end = notes.length * 0.09;
    // Final chord
    [notes[notes.length - 3], notes[notes.length - 2], notes[notes.length - 1]].forEach((f) =>
      tone(a, { freq: f, at: end, dur: 0.7, type: 'triangle', gain: 0.07 }),
    );
  },
};
