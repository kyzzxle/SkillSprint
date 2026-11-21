// Mental-math question generator. Every question is built from its answer (or verified),
// so results are always exact: no division by zero, no non-terminating decimals, no negative surprises.
import { pick, randInt, type Rng } from '../../lib/random';

export type MathOp = 'add' | 'sub' | 'mul' | 'div' | 'frac' | 'pct' | 'pow';
export type MathDifficulty = 'easy' | 'medium' | 'hard';

export const OP_LABELS: Record<MathOp, string> = {
  add: 'Addition', sub: 'Subtraction', mul: 'Multiplication', div: 'Division',
  frac: 'Fractions', pct: 'Percentages', pow: 'Roots & powers',
};
export const OP_SYMBOLS: Record<MathOp, string> = { add: '+', sub: '−', mul: '×', div: '÷', frac: '½', pct: '%', pow: 'x²' };

export interface Rational { n: number; d: number }

export interface MathQuestion {
  op: MathOp;
  text: string;
  answer: Rational;
  answerText: string;
  explanation: string;
  /** Input hint shown to the player */
  format: 'integer' | 'fraction';
}

export const gcd = (a: number, b: number): number => {
  a = Math.abs(a); b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
};

export function simplify(r: Rational): Rational {
  const g = gcd(r.n, r.d);
  const sign = r.d < 0 ? -1 : 1;
  return { n: (sign * r.n) / g, d: (sign * r.d) / g };
}

export function fracText(r: Rational): string {
  const s = simplify(r);
  return s.d === 1 ? String(s.n) : `${s.n}/${s.d}`;
}

/** Parses "12", "-3", "0.75", "3/4", "1 1/2" into a rational. Returns null when invalid. */
export function parseAnswer(raw: string): Rational | null {
  const s = raw.trim().replace(/\s+/g, ' ').replace(/−/g, '-').replace(/,/g, '').replace(/\s*%$/, '');
  let m = s.match(/^(-?)(\d+) (\d+)\/(\d+)$/); // mixed number
  if (m) {
    const whole = Number(m[2]), n = Number(m[3]), d = Number(m[4]);
    if (!d) return null;
    const val = { n: whole * d + n, d };
    return simplify(m[1] ? { n: -val.n, d } : val);
  }
  m = s.match(/^(-?\d+)\s*\/\s*(-?\d+)$/);
  if (m) {
    const d = Number(m[2]);
    if (!d) return null;
    return simplify({ n: Number(m[1]), d });
  }
  m = s.match(/^(-?)(\d*)\.?(\d*)$/);
  if (m && (m[2] || m[3])) {
    const dec = m[3] ?? '';
    const d = 10 ** dec.length;
    const n = Number((m[2] || '0') + dec);
    return simplify({ n: m[1] ? -n : n, d });
  }
  return null;
}

export function isCorrect(raw: string, answer: Rational): boolean {
  const r = parseAnswer(raw);
  if (!r) return false;
  return r.n * answer.d === answer.n * r.d;
}

const int = (n: number): Rational => ({ n, d: 1 });

function addSub(rng: Rng, diff: MathDifficulty, sub: boolean): MathQuestion {
  const [lo, hi] = diff === 'easy' ? [1, 20] : diff === 'medium' ? [10, 99] : [100, 999];
  let a = randInt(rng, lo, hi);
  let b = randInt(rng, lo, hi);
  if (sub) {
    if (b > a) [a, b] = [b, a];
    return { op: 'sub', text: `${a} − ${b}`, answer: int(a - b), answerText: String(a - b), explanation: `${a} − ${b} = ${a - b} (check: ${a - b} + ${b} = ${a}).`, format: 'integer' };
  }
  return { op: 'add', text: `${a} + ${b}`, answer: int(a + b), answerText: String(a + b), explanation: `${a} + ${b} = ${a + b}.`, format: 'integer' };
}

function mul(rng: Rng, diff: MathDifficulty): MathQuestion {
  let a: number, b: number;
  if (diff === 'easy') { a = randInt(rng, 2, 10); b = randInt(rng, 2, 10); }
  else if (diff === 'medium') { a = randInt(rng, 3, 12); b = randInt(rng, 11, 25); }
  else { a = randInt(rng, 11, 49); b = randInt(rng, 11, 29); }
  if (rng() < 0.5) [a, b] = [b, a];
  const p = a * b;
  let exp = `${a} × ${b} = ${p}.`;
  if (Math.max(a, b) > 10) {
    const big = Math.max(a, b), small = Math.min(a, b);
    const tens = Math.floor(big / 10) * 10, ones = big % 10;
    if (ones) exp = `${small} × ${big} = ${small} × ${tens} + ${small} × ${ones} = ${small * tens} + ${small * ones} = ${p}.`;
  }
  return { op: 'mul', text: `${a} × ${b}`, answer: int(p), answerText: String(p), explanation: exp, format: 'integer' };
}

function div(rng: Rng, diff: MathDifficulty): MathQuestion {
  const [dlo, dhi, qlo, qhi] = diff === 'easy' ? [2, 10, 1, 10] : diff === 'medium' ? [2, 12, 2, 25] : [3, 25, 5, 50];
  const d = randInt(rng, dlo, dhi); // never zero
  const q = randInt(rng, qlo, qhi);
  const n = d * q;
  return { op: 'div', text: `${n} ÷ ${d}`, answer: int(q), answerText: String(q), explanation: `${n} ÷ ${d} = ${q}, because ${d} × ${q} = ${n}.`, format: 'integer' };
}

function frac(rng: Rng, diff: MathDifficulty): MathQuestion {
  if (diff === 'easy') {
    const d = randInt(rng, 3, 10);
    let a = randInt(rng, 1, d - 1), b = randInt(rng, 1, d - 1);
    const sub = rng() < 0.5;
    if (sub && b > a) [a, b] = [b, a];
    if (sub && a === b) a = Math.min(d - 1, a + 1) === a ? a : a + 1;
    const n = sub ? a - b : a + b;
    const ans = simplify({ n, d });
    const sign = sub ? '−' : '+';
    return {
      op: 'frac', text: `${a}/${d} ${sign} ${b}/${d}`, answer: ans, answerText: fracText(ans), format: 'fraction',
      explanation: `Same denominator: ${a} ${sign} ${b} = ${n}, so ${n}/${d}${fracText(ans) !== `${n}/${d}` ? ` = ${fracText(ans)} in lowest terms` : ''}.`,
    };
  }
  if (diff === 'medium') {
    const dens = [2, 3, 4, 5, 6, 8, 10, 12];
    let d1 = pick(rng, dens), d2 = pick(rng, dens);
    while (d2 === d1) d2 = pick(rng, dens);
    const a = randInt(rng, 1, d1 - 1), b = randInt(rng, 1, d2 - 1);
    const L = (d1 * d2) / gcd(d1, d2);
    const A = a * (L / d1), B = b * (L / d2);
    const sub = rng() < 0.5 && A !== B;
    let [x, y, X, Y, dx, dy] = [a, b, A, B, d1, d2];
    if (sub && B > A) [x, y, X, Y, dx, dy] = [b, a, B, A, d2, d1];
    const n = sub ? X - Y : X + Y;
    const ans = simplify({ n, d: L });
    const sign = sub ? '−' : '+';
    return {
      op: 'frac', text: `${x}/${dx} ${sign} ${y}/${dy}`, answer: ans, answerText: fracText(ans), format: 'fraction',
      explanation: `Common denominator ${L}: ${X}/${L} ${sign} ${Y}/${L} = ${n}/${L}${fracText(ans) !== `${n}/${L}` ? ` = ${fracText(ans)}` : ''}.`,
    };
  }
  const a = randInt(rng, 1, 9), b = randInt(rng, 2, 9), c = randInt(rng, 1, 9), d = randInt(rng, 2, 9);
  if (rng() < 0.5) {
    const ans = simplify({ n: a * c, d: b * d });
    return {
      op: 'frac', text: `${a}/${b} × ${c}/${d}`, answer: ans, answerText: fracText(ans), format: 'fraction',
      explanation: `Multiply tops and bottoms: (${a}×${c})/(${b}×${d}) = ${a * c}/${b * d}${fracText(ans) !== `${a * c}/${b * d}` ? ` = ${fracText(ans)}` : ''}.`,
    };
  }
  const ans = simplify({ n: a * d, d: b * c });
  return {
    op: 'frac', text: `${a}/${b} ÷ ${c}/${d}`, answer: ans, answerText: fracText(ans), format: 'fraction',
    explanation: `Dividing by a fraction means multiplying by its reciprocal: ${a}/${b} × ${d}/${c} = ${a * d}/${b * c}${fracText(ans) !== `${a * d}/${b * c}` ? ` = ${fracText(ans)}` : ''}.`,
  };
}

function pct(rng: Rng, diff: MathDifficulty): MathQuestion {
  if (diff === 'hard' && rng() < 0.5) {
    // "X is what percent of Y?"
    const y = pick(rng, [20, 25, 40, 50, 80, 120, 160, 200, 250, 400, 500]);
    let p: number, x: number;
    do {
      p = randInt(rng, 1, 99);
      x = (y * p) / 100;
    } while (!Number.isInteger(x));
    return {
      op: 'pct', text: `${x} is what % of ${y}?`, answer: int(p), answerText: `${p}`, format: 'integer',
      explanation: `${x} ÷ ${y} = ${x / y}, and ${x / y} × 100 = ${p}%.`,
    };
  }
  const percents = diff === 'easy' ? [10, 20, 25, 50] : diff === 'medium' ? [5, 15, 30, 40, 60, 75] : [12, 35, 45, 65, 85, 120, 150];
  const p = pick(rng, percents);
  let base: number, result: number;
  do {
    base = diff === 'easy' ? randInt(rng, 2, 40) * 10 : diff === 'medium' ? randInt(rng, 2, 60) * 10 : randInt(rng, 4, 100) * 5;
    result = (p * base) / 100;
  } while (!Number.isInteger(result));
  return {
    op: 'pct', text: `${p}% of ${base}`, answer: int(result), answerText: String(result), format: 'integer',
    explanation: `${p}% means ${p}/100, so ${base} × ${p} ÷ 100 = ${result}.`,
  };
}

function pow(rng: Rng, diff: MathDifficulty): MathQuestion {
  const r = rng();
  if (diff === 'easy') {
    const n = randInt(rng, 2, 12);
    return r < 0.5
      ? { op: 'pow', text: `√${n * n}`, answer: int(n), answerText: String(n), format: 'integer', explanation: `${n} × ${n} = ${n * n}, so √${n * n} = ${n}.` }
      : { op: 'pow', text: `${n}²`, answer: int(n * n), answerText: String(n * n), format: 'integer', explanation: `${n}² = ${n} × ${n} = ${n * n}.` };
  }
  if (diff === 'medium') {
    if (r < 0.35) {
      const n = randInt(rng, 11, 20);
      return { op: 'pow', text: `√${n * n}`, answer: int(n), answerText: String(n), format: 'integer', explanation: `${n} × ${n} = ${n * n}, so √${n * n} = ${n}.` };
    }
    if (r < 0.7) {
      const n = randInt(rng, 2, 6);
      return { op: 'pow', text: `${n}³`, answer: int(n ** 3), answerText: String(n ** 3), format: 'integer', explanation: `${n}³ = ${n} × ${n} × ${n} = ${n ** 3}.` };
    }
    const e = randInt(rng, 3, 10);
    return { op: 'pow', text: `2^${e}`, answer: int(2 ** e), answerText: String(2 ** e), format: 'integer', explanation: `2^${e} means ${e} twos multiplied together: ${2 ** e}.` };
  }
  if (r < 0.35) {
    const n = randInt(rng, 2, 10);
    return { op: 'pow', text: `∛${n ** 3}`, answer: int(n), answerText: String(n), format: 'integer', explanation: `${n} × ${n} × ${n} = ${n ** 3}, so ∛${n ** 3} = ${n}.` };
  }
  if (r < 0.65) {
    const n = randInt(rng, 15, 30);
    return { op: 'pow', text: `√${n * n}`, answer: int(n), answerText: String(n), format: 'integer', explanation: `${n} × ${n} = ${n * n}, so √${n * n} = ${n}.` };
  }
  const [b, e] = pick(rng, [[3, 4], [3, 5], [4, 4], [5, 3], [5, 4], [6, 3], [7, 3], [8, 3], [9, 3], [2, 12], [11, 3], [12, 3]] as const);
  return { op: 'pow', text: `${b}^${e}`, answer: int(b ** e), answerText: String(b ** e), format: 'integer', explanation: `${b}^${e} = ${Array(e).fill(b).join(' × ')} = ${b ** e}.` };
}

export function makeMathQuestion(rng: Rng, ops: MathOp[], diff: MathDifficulty): MathQuestion {
  const op = pick(rng, ops.length ? ops : (['add'] as MathOp[]));
  switch (op) {
    case 'add': return addSub(rng, diff, false);
    case 'sub': return addSub(rng, diff, true);
    case 'mul': return mul(rng, diff);
    case 'div': return div(rng, diff);
    case 'frac': return frac(rng, diff);
    case 'pct': return pct(rng, diff);
    case 'pow': return pow(rng, diff);
  }
}
