// Colour maths: conversions and perceptual difference (CIEDE2000). Pure functions, unit tested.
import { randInt, type Rng } from '../../lib/random';

export interface RGB { r: number; g: number; b: number }
export interface HSL { h: number; s: number; l: number }
export interface Lab { L: number; a: number; b: number }

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export function rgbToHex({ r, g, b }: RGB): string {
  return '#' + [r, g, b].map((v) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0')).join('').toUpperCase();
}

export function hexToRgb(hex: string): RGB {
  const m = hex.replace('#', '').match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  if (!m) throw new Error(`Invalid hex colour: ${hex}`);
  return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) };
}

export const rgbText = ({ r, g, b }: RGB) => `rgb(${r}, ${g}, ${b})`;

/** HSL (h 0-360, s/l 0-100) to RGB 0-255. */
export function hslToRgb({ h, s, l }: HSL): RGB {
  const S = s / 100, L = l / 100;
  const C = (1 - Math.abs(2 * L - 1)) * S;
  const hh = (((h % 360) + 360) % 360) / 60;
  const X = C * (1 - Math.abs((hh % 2) - 1));
  let r = 0, g = 0, b = 0;
  if (hh < 1) [r, g, b] = [C, X, 0];
  else if (hh < 2) [r, g, b] = [X, C, 0];
  else if (hh < 3) [r, g, b] = [0, C, X];
  else if (hh < 4) [r, g, b] = [0, X, C];
  else if (hh < 5) [r, g, b] = [X, 0, C];
  else [r, g, b] = [C, 0, X];
  const m = L - C / 2;
  return { r: Math.round((r + m) * 255), g: Math.round((g + m) * 255), b: Math.round((b + m) * 255) };
}

export function rgbToHsl({ r, g, b }: RGB): HSL {
  const R = r / 255, G = g / 255, B = b / 255;
  const max = Math.max(R, G, B), min = Math.min(R, G, B);
  const l = (max + min) / 2;
  let h = 0, s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === R) h = (G - B) / d + (G < B ? 6 : 0);
    else if (max === G) h = (B - R) / d + 2;
    else h = (R - G) / d + 4;
    h *= 60;
  }
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function rgbToLab({ r, g, b }: RGB): Lab {
  const lin = (c: number) => {
    const v = c / 255;
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  const R = lin(r), G = lin(g), B = lin(b);
  const X = (0.4124564 * R + 0.3575761 * G + 0.1804375 * B) / 0.95047;
  const Y = 0.2126729 * R + 0.7151522 * G + 0.072175 * B;
  const Z = (0.0193339 * R + 0.119192 * G + 0.9503041 * B) / 1.08883;
  const f = (t: number) => (t > 216 / 24389 ? Math.cbrt(t) : (24389 / 27 * t + 16) / 116);
  const fx = f(X), fy = f(Y), fz = f(Z);
  return { L: 116 * fy - 16, a: 500 * (fx - fy), b: 200 * (fy - fz) };
}

const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;

/** CIEDE2000 colour difference (kL = kC = kH = 1). */
export function deltaE2000(x: Lab, y: Lab): number {
  const { L: L1, a: a1, b: b1 } = x;
  const { L: L2, a: a2, b: b2 } = y;
  const C1 = Math.hypot(a1, b1), C2 = Math.hypot(a2, b2);
  const Cbar = (C1 + C2) / 2;
  const G = 0.5 * (1 - Math.sqrt(Cbar ** 7 / (Cbar ** 7 + 25 ** 7)));
  const a1p = (1 + G) * a1, a2p = (1 + G) * a2;
  const C1p = Math.hypot(a1p, b1), C2p = Math.hypot(a2p, b2);
  const hp = (b: number, a: number) => {
    if (a === 0 && b === 0) return 0;
    const h = deg(Math.atan2(b, a));
    return h >= 0 ? h : h + 360;
  };
  const h1p = hp(b1, a1p), h2p = hp(b2, a2p);
  const dLp = L2 - L1;
  const dCp = C2p - C1p;
  let dhp = 0;
  if (C1p * C2p !== 0) {
    dhp = h2p - h1p;
    if (dhp > 180) dhp -= 360;
    else if (dhp < -180) dhp += 360;
  }
  const dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin(rad(dhp / 2));
  const Lbarp = (L1 + L2) / 2;
  const Cbarp = (C1p + C2p) / 2;
  let hbarp = h1p + h2p;
  if (C1p * C2p !== 0) {
    if (Math.abs(h1p - h2p) <= 180) hbarp = (h1p + h2p) / 2;
    else hbarp = h1p + h2p < 360 ? (h1p + h2p + 360) / 2 : (h1p + h2p - 360) / 2;
  }
  const T = 1 - 0.17 * Math.cos(rad(hbarp - 30)) + 0.24 * Math.cos(rad(2 * hbarp)) + 0.32 * Math.cos(rad(3 * hbarp + 6)) - 0.2 * Math.cos(rad(4 * hbarp - 63));
  const dTheta = 30 * Math.exp(-(((hbarp - 275) / 25) ** 2));
  const Rc = 2 * Math.sqrt(Cbarp ** 7 / (Cbarp ** 7 + 25 ** 7));
  const Sl = 1 + (0.015 * (Lbarp - 50) ** 2) / Math.sqrt(20 + (Lbarp - 50) ** 2);
  const Sc = 1 + 0.045 * Cbarp;
  const Sh = 1 + 0.015 * Cbarp * T;
  const Rt = -Math.sin(rad(2 * dTheta)) * Rc;
  return Math.sqrt((dLp / Sl) ** 2 + (dCp / Sc) ** 2 + (dHp / Sh) ** 2 + Rt * (dCp / Sc) * (dHp / Sh));
}

export const colorDistance = (a: RGB, b: RGB) => deltaE2000(rgbToLab(a), rgbToLab(b));

/**
 * Match accuracy in percent from CIEDE2000: 100% for an exact match, falling 2 points per ΔE unit
 * (ΔE ≈ 1–2 is barely noticeable; ΔE 10 = 80%; ΔE ≥ 50 = 0%).
 */
export const matchAccuracy = (dE: number) => Math.max(0, Math.min(100, 100 - 2 * dE));

export function randomColor(rng: Rng): RGB {
  // Avoid near-black/near-white extremes so colours are easy to perceive.
  const h = randInt(rng, 0, 359), s = randInt(rng, 35, 95), l = randInt(rng, 25, 75);
  return hslToRgb({ h, s, l });
}

/** Distractor colours whose difference from `target` lies in [minDE, maxDE] and from each other ≥ minDE/2. */
export function distractorColors(rng: Rng, target: RGB, n: number, minDE: number, maxDE: number): RGB[] {
  const out: RGB[] = [];
  let tries = 0;
  let lo = minDE, hi = maxDE;
  while (out.length < n) {
    tries++;
    if (tries % 400 === 0) { lo = Math.max(6, lo * 0.85); hi *= 1.15; } // relax gradually if needed
    const spread = Math.max(20, hi * 2.5);
    const c = {
      r: clamp(Math.round(target.r + (rng() * 2 - 1) * spread), 0, 255),
      g: clamp(Math.round(target.g + (rng() * 2 - 1) * spread), 0, 255),
      b: clamp(Math.round(target.b + (rng() * 2 - 1) * spread), 0, 255),
    };
    const d = colorDistance(c, target);
    if (d < lo || d > hi) continue;
    if (out.some((o) => colorDistance(o, c) < lo / 2)) continue;
    out.push(c);
  }
  return out;
}

export const BANDS: Record<'easy' | 'medium' | 'hard', [number, number]> = {
  easy: [30, 60],
  medium: [16, 30],
  hard: [8, 16],
};
