// Full-screen celebration when a lane medal is earned: a big metallic medal with a star,
// a ribbon in the brand colours, and a confetti burst. Respects reduced-motion settings.
import { useEffect, useRef } from 'preact/hooks';
import { launchConfetti } from '../lib/confetti';
import { MEDAL_NAMES, type MedalLevel } from '../lib/medals';
import { prefersReducedMotion } from './ui/hooks';
import './medal-celebration.css';

const TIER = ['', 'bronze', 'silver', 'gold'] as const;
const METAL: Record<1 | 2 | 3, [string, string, string]> = {
  1: ['#f6c08f', '#b8733a', '#7a4416'],
  2: ['#fbfcff', '#b2bacb', '#6b7488'],
  3: ['#fff3b0', '#f2c230', '#b07f05'],
};
const CONFETTI: Record<1 | 2 | 3, string[]> = {
  1: ['#c98445', '#f6c08f', '#ffd23f', '#2d5bd0', '#ffffff', '#e5487f'],
  2: ['#c7cedb', '#ffffff', '#ffd23f', '#2d5bd0', '#8fb0ff', '#0e9c8e'],
  3: ['#ffd23f', '#f2c230', '#fff3b0', '#2d5bd0', '#ffffff', '#e5487f', '#0e9c8e'],
};

/** The big medal: ribbon, rim, face and a five-point star. */
export function BigMedal({ tier, lane }: { tier: 1 | 2 | 3; lane: number }) {
  const [light, mid, dark] = METAL[tier];
  const id = `m${tier}`;
  return (
    <svg class="big-medal" viewBox="0 0 200 250" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-rim`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color={light} />
          <stop offset="0.5" stop-color={mid} />
          <stop offset="1" stop-color={dark} />
        </linearGradient>
        <radialGradient id={`${id}-face`} cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stop-color={light} />
          <stop offset="0.55" stop-color={mid} />
          <stop offset="1" stop-color={dark} />
        </radialGradient>
        <linearGradient id={`${id}-star`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#ffffff" stop-opacity="0.95" />
          <stop offset="1" stop-color={light} />
        </linearGradient>
        <clipPath id={`${id}-clip`}><circle cx="100" cy="150" r="74" /></clipPath>
      </defs>
      {/* Ribbon: two straps in track blue with a start-line yellow stripe */}
      <g class="ribbon">
        <path d="M58 0h40l-14 92H44z" fill="#2d5bd0" />
        <path d="M70 0h14l-14 92H56z" fill="#ffd23f" />
        <path d="M102 0h40l2 92h-40z" fill="#2049b2" />
        <path d="M116 0h14l2 92h-14z" fill="#ffd23f" />
      </g>
      {/* Medal */}
      <circle cx="100" cy="150" r="80" fill={`url(#${id}-rim)`} />
      <circle cx="100" cy="150" r="80" fill="none" stroke={dark} stroke-width="2" />
      <circle cx="100" cy="150" r="66" fill={`url(#${id}-face)`} />
      <circle cx="100" cy="150" r="66" fill="none" stroke={dark} stroke-opacity="0.5" stroke-width="2.5" />
      <circle cx="100" cy="150" r="59" fill="none" stroke={light} stroke-opacity="0.7" stroke-width="1.5" stroke-dasharray="2 5" />
      {/* Star with a bevel: a darker copy offset underneath */}
      <path class="medal-star-shadow" d="M100 103l13.6 27.6 30.4 4.4-22 21.4 5.2 30.3L100 172.4 72.8 186.7l5.2-30.3-22-21.4 30.4-4.4z" fill={dark} transform="translate(0 3)" />
      <path class="medal-star" d="M100 103l13.6 27.6 30.4 4.4-22 21.4 5.2 30.3L100 172.4 72.8 186.7l5.2-30.3-22-21.4 30.4-4.4z" fill={`url(#${id}-star)`} stroke={dark} stroke-width="2" stroke-linejoin="round" />
      <text x="100" y="214" text-anchor="middle" class="medal-lane" fill={dark}>LANE {lane}</text>
      {/* Shine that sweeps across the face */}
      <g clip-path={`url(#${id}-clip)`}>
        <rect class="medal-shine" x="-60" y="60" width="40" height="190" fill="#ffffff" opacity="0.55" transform="rotate(20 100 150)" />
      </g>
    </svg>
  );
}

export interface Celebration {
  /** new medal level */
  level: MedalLevel;
  /** level before this result */
  from: MedalLevel;
  laneName: string;
  lane: number;
  /** the score that earned it, formatted */
  scoreText: string;
  /** next target, formatted (null at gold) */
  nextText: string | null;
  nextLane: { name: string; url: string };
}

export function MedalCelebration({ c, onClose }: { c: Celebration; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const medalRef = useRef<HTMLDivElement>(null);
  const tier = Math.max(1, Math.min(3, c.level)) as 1 | 2 | 3;
  const name = MEDAL_NAMES[tier];
  const unlocked = Array.from({ length: c.level - c.from }, (_, i) => MEDAL_NAMES[c.from + i + 1]);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (!d.open) d.showModal();
    if (prefersReducedMotion()) return;
    let stop: (() => void) | undefined;
    // Fire when the medal lands (after its drop-in animation).
    const t = window.setTimeout(() => {
      const canvas = canvasRef.current;
      const r = medalRef.current?.getBoundingClientRect();
      if (!canvas || !r) return;
      stop = launchConfetti(canvas, {
        x: r.left + r.width / 2,
        y: r.top + r.height * 0.6,
        colors: CONFETTI[tier],
        count: tier === 3 ? 170 : tier === 2 ? 140 : 110,
        bursts: tier === 3 ? 3 : 2,
        shower: tier === 3,
      });
    }, 520);
    return () => {
      window.clearTimeout(t);
      stop?.();
    };
  }, []);

  const close = () => {
    dialogRef.current?.close();
    onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      class={`celebration ${TIER[tier]}`}
      aria-labelledby="celebration-title"
      aria-describedby="celebration-desc"
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
      onClick={(e) => {
        // Clicking the dimmed area outside the card closes it.
        if (e.target === dialogRef.current) close();
      }}
    >
      <canvas ref={canvasRef} class="confetti-canvas" aria-hidden="true" />
      <div class="celebration-card">
        <div class="celebration-medal" ref={medalRef}>
          <div class="medal-glow" aria-hidden="true" />
          <BigMedal tier={tier} lane={c.lane} />
        </div>
        <p class="celebration-kicker">Lane {c.lane}: {c.laneName}</p>
        <h2 id="celebration-title">{name} medal!</h2>
        <p id="celebration-desc" class="celebration-text">
          {unlocked.length > 1
            ? `${unlocked.slice(0, -1).join(', ')} and ${unlocked[unlocked.length - 1]} unlocked in one go with ${c.scoreText}.`
            : `You earned it with ${c.scoreText}.`}{' '}
          {c.nextText ? `Next up: ${MEDAL_NAMES[(tier + 1) as 2 | 3]} at ${c.nextText}.` : 'That’s the top medal in this lane.'}
        </p>
        <div class="celebration-track" role="img" aria-label={`${c.level} of 3 medals won in this lane`}>
          {([1, 2, 3] as const).map((t) => (
            <span key={t} class={`ct-dot ${TIER[t]} ${c.level >= t ? 'on' : ''} ${t > c.from && t <= c.level ? 'new' : ''}`}>
              {MEDAL_NAMES[t]}
            </span>
          ))}
        </div>
        <div class="btn-row center">
          <button type="button" class="btn btn-primary btn-lg" onClick={close} autofocus>
            Keep training
          </button>
          <a class="btn btn-secondary btn-lg" href={c.nextLane.url}>
            Try {c.nextLane.name}
          </a>
        </div>
      </div>
    </dialog>
  );
}
