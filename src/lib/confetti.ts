// Tiny canvas confetti engine (no dependencies). Launches bursts of paper pieces and stars from a point,
// lets them fall with gravity, drag and flutter, then stops and clears itself.

export interface ConfettiOptions {
  /** burst origin in CSS pixels, relative to the viewport */
  x: number;
  y: number;
  colors: string[];
  /** pieces per burst */
  count?: number;
  /** number of bursts, spaced 220ms apart */
  bursts?: number;
  /** also drop a light shower from the top of the screen */
  shower?: boolean;
}

interface Piece {
  x: number; y: number; vx: number; vy: number;
  w: number; h: number; rot: number; vr: number;
  flip: number; vflip: number;
  color: string; shape: 'rect' | 'star' | 'ribbon';
  life: number;
}

const GRAVITY = 1400; // px/s²
const DRAG = 1.6; // per second

function makeBurst(o: ConfettiOptions, n: number): Piece[] {
  const out: Piece[] = [];
  for (let i = 0; i < n; i++) {
    // Mostly upward and outward, like a party popper.
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.25;
    const speed = 450 + Math.random() * 650;
    const r = Math.random();
    out.push({
      x: o.x, y: o.y,
      vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
      w: 7 + Math.random() * 6, h: 10 + Math.random() * 8,
      rot: Math.random() * Math.PI * 2, vr: (Math.random() - 0.5) * 12,
      flip: Math.random() * Math.PI * 2, vflip: 6 + Math.random() * 8,
      color: o.colors[Math.floor(Math.random() * o.colors.length)],
      shape: r < 0.18 ? 'star' : r < 0.32 ? 'ribbon' : 'rect',
      life: 0,
    });
  }
  return out;
}

function makeShower(o: ConfettiOptions, width: number, n: number): Piece[] {
  const out: Piece[] = [];
  for (let i = 0; i < n; i++) {
    out.push({
      x: Math.random() * width, y: -20 - Math.random() * 300,
      vx: (Math.random() - 0.5) * 80, vy: 80 + Math.random() * 120,
      w: 7 + Math.random() * 5, h: 10 + Math.random() * 7,
      rot: Math.random() * Math.PI * 2, vr: (Math.random() - 0.5) * 8,
      flip: Math.random() * Math.PI * 2, vflip: 5 + Math.random() * 6,
      color: o.colors[Math.floor(Math.random() * o.colors.length)],
      shape: Math.random() < 0.2 ? 'star' : 'rect',
      life: 0,
    });
  }
  return out;
}

function star(ctx: CanvasRenderingContext2D, r: number) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 ? r * 0.45 : r;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    ctx.lineTo(Math.cos(a) * rad, Math.sin(a) * rad);
  }
  ctx.closePath();
  ctx.fill();
}

/** Starts the confetti on `canvas` (sized to the viewport). Returns a function that stops it early. */
export function launchConfetti(canvas: HTMLCanvasElement, o: ConfettiOptions): () => void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => undefined;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const resize = () => {
    canvas.width = Math.round(window.innerWidth * dpr);
    canvas.height = Math.round(window.innerHeight * dpr);
  };
  resize();
  window.addEventListener('resize', resize);

  const count = o.count ?? 140;
  let pieces: Piece[] = makeBurst(o, count);
  if (o.shower) pieces = pieces.concat(makeShower(o, window.innerWidth, Math.round(count * 0.6)));
  const timers: number[] = [];
  for (let b = 1; b < (o.bursts ?? 1); b++) {
    timers.push(window.setTimeout(() => (pieces = pieces.concat(makeBurst(o, Math.round(count * 0.6)))), b * 220));
  }

  let raf = 0;
  let last = performance.now();
  let stopped = false;
  const stop = () => {
    if (stopped) return;
    stopped = true;
    cancelAnimationFrame(raf);
    timers.forEach((t) => window.clearTimeout(t));
    window.removeEventListener('resize', resize);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const frame = (now: number) => {
    const dt = Math.min(0.033, (now - last) / 1000);
    last = now;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const h = window.innerHeight;
    pieces = pieces.filter((p) => p.y < h + 40 && p.life < 6);
    for (const p of pieces) {
      p.life += dt;
      p.vx -= p.vx * DRAG * dt;
      p.vy += GRAVITY * dt * 0.55;
      p.vy -= p.vy * DRAG * dt * 0.6;
      // Flutter: pieces sway as they fall.
      p.x += (p.vx + Math.sin(p.life * 3 + p.flip) * 40) * dt;
      p.y += p.vy * dt;
      p.rot += p.vr * dt;
      p.flip += p.vflip * dt;
      const fade = p.life > 4.5 ? Math.max(0, 1 - (p.life - 4.5) / 1.5) : 1;
      ctx.save();
      ctx.globalAlpha = fade;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      if (p.shape === 'star') {
        star(ctx, p.w * 0.8);
      } else {
        // Flip around one axis to fake a 3D tumble.
        ctx.scale(1, Math.cos(p.flip));
        if (p.shape === 'ribbon') ctx.fillRect(-p.w * 0.25, -p.h, p.w * 0.5, p.h * 2);
        else ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      }
      ctx.restore();
    }
    if (pieces.length) raf = requestAnimationFrame(frame);
    else stop();
  };
  raf = requestAnimationFrame(frame);
  return stop;
}
