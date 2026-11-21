// Logic puzzle generators. Each generator builds the puzzle from a single rule, so the answer
// and explanation always match. Hand-written deduction puzzles are checked by tests/logic.test.mjs.
import { pick, randInt, shuffle, type Rng } from '../../lib/random';

export interface Puzzle {
  type: string;
  prompt: string;
  /** Optional preformatted display (e.g. a grid) shown in a monospace block */
  display?: string;
  answer: string;
  options: string[];
  explanation: string;
}

/** Builds 4 numeric options: the answer plus plausible near-misses. */
function numericOptions(rng: Rng, answer: number, nearby: number[]): string[] {
  const set = new Set<number>([answer]);
  for (const n of shuffle(rng, nearby)) {
    if (set.size >= 4) break;
    if (n !== answer && Number.isFinite(n) && n >= 0) set.add(n);
  }
  let k = 1;
  while (set.size < 4) {
    const cand = answer + (rng() < 0.5 ? -k : k) * Math.max(1, Math.round(Math.abs(answer) * 0.1));
    if (cand >= 0) set.add(cand);
    k++;
  }
  return shuffle(rng, [...set].map(String));
}

const seq = (xs: (number | string)[]) => xs.join(', ');

// ---------- Number sequences ----------
function arithmetic(rng: Rng, lvl: number): Puzzle {
  const a = randInt(rng, 1, 10 * lvl);
  const d = randInt(rng, 2, 3 + lvl * 3) * (lvl >= 3 && rng() < 0.3 ? -1 : 1);
  const start = d < 0 ? a + Math.abs(d) * 8 : a;
  const terms = Array.from({ length: 5 }, (_, i) => start + d * i);
  const ans = start + d * 5;
  return {
    type: 'Number sequence', prompt: 'What number comes next?', display: `${seq(terms)}, ?`, answer: String(ans),
    options: numericOptions(rng, ans, [ans + d, ans - 1, ans + 1, ans + 2 * d, terms[4] + d * 2]),
    explanation: `Each term ${d > 0 ? 'increases' : 'decreases'} by ${Math.abs(d)}: ${terms[4]} ${d > 0 ? '+' : '−'} ${Math.abs(d)} = ${ans}.`,
  };
}

function geometric(rng: Rng, lvl: number): Puzzle {
  const r = lvl <= 2 ? 2 : pick(rng, [2, 3]);
  const a = randInt(rng, 1, lvl <= 2 ? 5 : 4);
  const terms = Array.from({ length: 5 }, (_, i) => a * r ** i);
  const ans = a * r ** 5;
  return {
    type: 'Number sequence', prompt: 'What number comes next?', display: `${seq(terms)}, ?`, answer: String(ans),
    options: numericOptions(rng, ans, [terms[4] + (terms[4] - terms[3]), ans + r, ans - a, terms[4] * (r + 1)]),
    explanation: `Each term is multiplied by ${r}: ${terms[4]} × ${r} = ${ans}.`,
  };
}

function growingDiff(rng: Rng, lvl: number): Puzzle {
  const a = randInt(rng, 1, 10);
  const d0 = randInt(rng, 1, 3);
  const step = lvl >= 4 ? 2 : 1;
  const terms = [a];
  for (let i = 0; i < 4; i++) terms.push(terms[i] + d0 + step * i);
  const nextDiff = d0 + step * 4;
  const ans = terms[4] + nextDiff;
  const diffs = terms.slice(1).map((t, i) => t - terms[i]);
  return {
    type: 'Number sequence', prompt: 'What number comes next?', display: `${seq(terms)}, ?`, answer: String(ans),
    options: numericOptions(rng, ans, [terms[4] + diffs[3], ans + 1, ans - 1, ans + step]),
    explanation: `The gaps grow by ${step} each time (${diffs.join(', ')}), so the next gap is ${nextDiff}: ${terms[4]} + ${nextDiff} = ${ans}.`,
  };
}

function squares(rng: Rng): Puzzle {
  const off = pick(rng, [0, 0, 1, -1]);
  const s = randInt(rng, 1, 5);
  const terms = Array.from({ length: 5 }, (_, i) => (s + i) ** 2 + off);
  const n = s + 5;
  const ans = n * n + off;
  const rule = off === 0 ? 'square numbers' : `square numbers ${off > 0 ? 'plus' : 'minus'} 1`;
  return {
    type: 'Number sequence', prompt: 'What number comes next?', display: `${seq(terms)}, ?`, answer: String(ans),
    options: numericOptions(rng, ans, [ans + 1, ans - 1, terms[4] + (terms[4] - terms[3]), ans + 2]),
    explanation: `These are ${rule}: ${s}²${off ? (off > 0 ? '+1' : '−1') : ''}, ${s + 1}²${off ? (off > 0 ? '+1' : '−1') : ''}, … so next is ${n}²${off ? (off > 0 ? ' + 1' : ' − 1') : ''} = ${ans}.`,
  };
}

function fibonacciLike(rng: Rng): Puzzle {
  const a = randInt(rng, 1, 5), b = randInt(rng, a, a + 5);
  const t = [a, b];
  for (let i = 2; i < 6; i++) t.push(t[i - 1] + t[i - 2]);
  const ans = t[4] + t[5];
  return {
    type: 'Number sequence', prompt: 'What number comes next?', display: `${seq(t)}, ?`, answer: String(ans),
    options: numericOptions(rng, ans, [t[5] + (t[5] - t[4]), ans + 1, ans - 2, t[5] * 2]),
    explanation: `Each term is the sum of the two before it: ${t[4]} + ${t[5]} = ${ans}.`,
  };
}

function alternating(rng: Rng): Puzzle {
  const add = randInt(rng, 2, 6);
  const mul = 2;
  const t = [randInt(rng, 1, 5)];
  for (let i = 0; i < 5; i++) t.push(i % 2 === 0 ? t[i] + add : t[i] * mul);
  // Steps used: +add, ×2, +add, ×2, +add (5 steps for 6 terms). The next step is therefore ×2.
  const ans = t[5] * mul;
  return {
    type: 'Number sequence', prompt: 'What number comes next?', display: `${seq(t)}, ?`, answer: String(ans),
    options: numericOptions(rng, ans, [t[5] + add, ans + 1, ans - add, ans + add]),
    explanation: `The rule alternates: +${add}, ×2, +${add}, ×2, … The last step was +${add}, so now multiply by 2: ${t[5]} × 2 = ${ans}.`,
  };
}

function interleaved(rng: Rng): Puzzle {
  const a = randInt(rng, 1, 9), da = randInt(rng, 2, 5);
  const b = randInt(rng, 20, 40), db = randInt(rng, 1, 4);
  const t: number[] = [];
  for (let i = 0; i < 7; i++) t.push(i % 2 === 0 ? a + da * (i / 2) : b - db * ((i - 1) / 2));
  // next index 7 is odd → second sequence
  const ans = b - db * 3;
  return {
    type: 'Number sequence', prompt: 'What number comes next?', display: `${seq(t)}, ?`, answer: String(ans),
    options: numericOptions(rng, ans, [t[6] + da, ans - db, ans + db, t[6] - db]),
    explanation: `Two sequences are interleaved: odd positions go ${a}, ${a + da}, ${a + 2 * da}, … (+${da}); even positions go ${b}, ${b - db}, ${b - 2 * db}, … (−${db}). The next term belongs to the second one: ${b - 2 * db} − ${db} = ${ans}.`,
  };
}

function missingMiddle(rng: Rng, lvl: number): Puzzle {
  const geo = lvl >= 3 && rng() < 0.5;
  const a = randInt(rng, 2, 9);
  const d = randInt(rng, 3, 9);
  const terms = Array.from({ length: 6 }, (_, i) => (geo ? a * 2 ** i : a + d * i));
  const idx = randInt(rng, 1, 4);
  const ans = terms[idx];
  const shown = terms.map((t, i) => (i === idx ? '?' : t));
  return {
    type: 'Missing number', prompt: 'Which number is missing?', display: seq(shown), answer: String(ans),
    options: numericOptions(rng, ans, [ans + 1, ans - 1, ans + (geo ? a : d), ans - (geo ? a : 1) * 2]),
    explanation: geo
      ? `Each term doubles: ${terms[idx - 1]} × 2 = ${ans}, and ${ans} × 2 = ${terms[idx + 1]}.`
      : `Each term increases by ${d}: ${terms[idx - 1]} + ${d} = ${ans}, and ${ans} + ${d} = ${terms[idx + 1]}.`,
  };
}

function gridRule(rng: Rng, lvl: number): Puzzle {
  const rule = lvl >= 3 ? pick(rng, ['sum', 'product', 'diff2'] as const) : 'sum';
  const rules = {
    sum: (x: number, y: number) => x + y,
    product: (x: number, y: number) => x * y,
    diff2: (x: number, y: number) => (x + y) * 2,
  };
  let rows: [number, number, number][];
  // Regenerate if another rule also fits the two complete rows but would give a different answer.
  do {
    rows = [];
    for (let i = 0; i < 3; i++) {
      const x = randInt(rng, 2, 9), y = randInt(rng, 2, 9);
      rows.push([x, y, rules[rule](x, y)]);
    }
  } while (
    (Object.keys(rules) as (keyof typeof rules)[]).some(
      (r) => r !== rule && rows.slice(0, 2).every(([x, y, z]) => rules[r](x, y) === z) && rules[r](rows[2][0], rows[2][1]) !== rows[2][2],
    )
  );
  const ans = rows[2][2];
  const display = rows.map((r, i) => (i === 2 ? `${r[0]}  ${r[1]}  ?` : r.join('  '))).join('\n');
  const desc = rule === 'sum' ? 'the sum of the first two' : rule === 'product' ? 'the product of the first two' : 'double the sum of the first two';
  const calc = rule === 'sum' ? `${rows[2][0]} + ${rows[2][1]}` : rule === 'product' ? `${rows[2][0]} × ${rows[2][1]}` : `(${rows[2][0]} + ${rows[2][1]}) × 2`;
  return {
    type: 'Missing number', prompt: 'Each row follows the same rule. What replaces the question mark?', display, answer: String(ans),
    options: numericOptions(rng, ans, [rows[2][0] + rows[2][1], rows[2][0] * rows[2][1], (rows[2][0] + rows[2][1]) * 2, ans + 1].filter((n) => n !== ans)),
    explanation: `In every row the third number is ${desc}: ${calc} = ${ans}.`,
  };
}

// ---------- Pattern recognition ----------
const SHAPES = ['▲', '●', '■', '◆', '★', '⬟'];
function symbolPattern(rng: Rng, lvl: number): Puzzle {
  const unitLen = lvl <= 2 ? 3 : 4;
  const unit = shuffle(rng, SHAPES).slice(0, unitLen);
  const reps = 3;
  const full = Array.from({ length: unitLen * reps }, (_, i) => unit[i % unitLen]);
  const cut = randInt(rng, unitLen * 2, full.length - 1);
  const shown = full.slice(0, cut);
  const ans = full[cut];
  return {
    type: 'Pattern', prompt: 'Which symbol continues the pattern?', display: `${shown.join(' ')} ?`, answer: ans,
    options: shuffle(rng, [ans, ...shuffle(rng, SHAPES.filter((s) => s !== ans)).slice(0, 3)]),
    explanation: `The pattern repeats every ${unitLen} symbols: ${unit.join(' ')}. Position ${cut + 1} is “${ans}”.`,
  };
}

const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
function letterPattern(rng: Rng, lvl: number): Puzzle {
  const step = randInt(rng, 2, lvl >= 3 ? 4 : 3);
  const start = randInt(rng, 0, 25 - step * 5);
  const letters = Array.from({ length: 5 }, (_, i) => ALPHA[start + step * i]);
  const ans = ALPHA[start + step * 5];
  const near = [ALPHA[start + step * 5 - 1], ALPHA[start + step * 5 + 1], ALPHA[start + step * 4 + 1], ALPHA[start + step * 5 + step]].filter(
    (x): x is string => !!x && x !== ans,
  );
  const opts = new Set([ans, ...near]);
  for (const l of shuffle(rng, ALPHA.split(''))) {
    if (opts.size >= 4) break;
    opts.add(l);
  }
  return {
    type: 'Pattern', prompt: 'Which letter comes next?', display: `${letters.join(', ')}, ?`, answer: ans,
    options: shuffle(rng, [...opts].slice(0, 4)),
    explanation: `Each letter moves ${step} places forward in the alphabet (skipping ${step - 1}): ${letters[4]} → ${ans}.`,
  };
}

// ---------- Odd one out (explicit property, so the answer is unambiguous) ----------
const isPrime = (n: number) => {
  if (n < 2) return false;
  for (let i = 2; i * i <= n; i++) if (n % i === 0) return false;
  return true;
};
function oddOneOut(rng: Rng, lvl: number): Puzzle {
  const kind = pick(rng, lvl <= 2 ? (['mult', 'square'] as const) : (['mult', 'square', 'prime'] as const));
  let members: number[] = [];
  let odd = 0;
  let prop = '';
  if (kind === 'mult') {
    const k = randInt(rng, 3, lvl <= 2 ? 6 : 9);
    prop = `multiples of ${k}`;
    members = shuffle(rng, Array.from({ length: 12 }, (_, i) => k * (i + 2))).slice(0, 3);
    do odd = randInt(rng, k * 2, k * 13);
    while (odd % k === 0);
  } else if (kind === 'square') {
    prop = 'perfect squares';
    members = shuffle(rng, [16, 25, 36, 49, 64, 81, 100, 121, 144]).slice(0, 3);
    do odd = randInt(rng, 15, 145);
    while (Number.isInteger(Math.sqrt(odd)));
  } else {
    prop = 'prime numbers';
    members = shuffle(rng, [11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53]).slice(0, 3);
    do odd = randInt(rng, 2, 30) * 2 + 1;
    while (isPrime(odd));
  }
  const options = shuffle(rng, [...members, odd].map(String));
  return {
    type: 'Odd one out', prompt: `Three of these numbers are ${prop}. Which one is not?`, answer: String(odd), options,
    explanation: `${members.join(', ')} are all ${prop}; ${odd} is not${kind === 'prime' ? ` (it can be divided by ${[3, 5, 7, 11, 13].find((p) => odd % p === 0) ?? 'a smaller number'})` : ''}.`,
  };
}

// ---------- Mathematical reasoning (word problems) ----------
function wordProblem(rng: Rng, lvl: number): Puzzle {
  const v = randInt(rng, 0, lvl <= 2 ? 2 : 4);
  if (v === 0) {
    const price = randInt(rng, 2, 9), n = randInt(rng, 3, 9), paid = Math.ceil((price * n + 1) / 10) * 10;
    const ans = paid - price * n;
    return {
      type: 'Reasoning', prompt: `Notebooks cost $${price} each. Sam buys ${n} and pays with $${paid}. How much change does Sam get, in dollars?`,
      answer: String(ans), options: numericOptions(rng, ans, [ans + price, ans - 1, price * n, ans + 2]),
      explanation: `${n} × $${price} = $${price * n}; $${paid} − $${price * n} = $${ans}.`,
    };
  }
  if (v === 1) {
    const speed = pick(rng, [40, 50, 60, 80]), hours = pick(rng, [1.5, 2, 2.5, 3]);
    const ans = speed * hours;
    return {
      type: 'Reasoning', prompt: `A train travels at a steady ${speed} km/h. How many kilometres does it travel in ${hours} hours?`,
      answer: String(ans), options: numericOptions(rng, ans, [speed * Math.floor(hours), ans + speed / 2, ans - 10, speed * (hours + 1)]),
      explanation: `Distance = speed × time = ${speed} × ${hours} = ${ans} km.`,
    };
  }
  if (v === 2) {
    const age = randInt(rng, 5, 15), k = randInt(rng, 2, 4);
    const parent = age * k;
    const ans = parent + age;
    return {
      type: 'Reasoning', prompt: `Mia is ${age}. Her aunt is ${k} times as old as Mia. What is the sum of their ages?`,
      answer: String(ans), options: numericOptions(rng, ans, [parent, ans + age, ans - 1, age * (k + 2)]),
      explanation: `Aunt: ${age} × ${k} = ${parent}. Sum: ${parent} + ${age} = ${ans}.`,
    };
  }
  if (v === 3) {
    const workers = pick(rng, [2, 3, 4, 6]), days = pick(rng, [6, 8, 12]);
    const total = workers * days;
    const newW = pick(rng, [2, 3, 4, 6, 8, 12].filter((w) => w !== workers && total % w === 0));
    const ans = total / newW;
    return {
      type: 'Reasoning', prompt: `${workers} painters take ${days} days to paint a house, all working at the same rate. How many days would ${newW} painters take?`,
      answer: String(ans), options: numericOptions(rng, ans, [Math.round((days * newW) / workers), days, ans + 1, ans + 2]),
      explanation: `The job takes ${workers} × ${days} = ${total} painter-days. With ${newW} painters: ${total} ÷ ${newW} = ${ans} days.`,
    };
  }
  const total = pick(rng, [20, 24, 30, 36, 40]);
  const ratioA = randInt(rng, 1, 3), ratioB = randInt(rng, 1, 4);
  const parts = ratioA + ratioB;
  const t = total - (total % parts);
  const ans = (t / parts) * ratioA;
  return {
    type: 'Reasoning', prompt: `${t} marbles are shared between Ana and Ben in the ratio ${ratioA}:${ratioB}. How many marbles does Ana get?`,
    answer: String(ans), options: numericOptions(rng, ans, [(t / parts) * ratioB, ans + 1, t / parts, ans * 2]),
    explanation: `${ratioA} + ${ratioB} = ${parts} parts, so one part is ${t} ÷ ${parts} = ${t / parts}. Ana gets ${ratioA} × ${t / parts} = ${ans}.`,
  };
}

// ---------- Logical deduction (hand-written, verified in tests) ----------
export interface Deduction {
  level: 1 | 2 | 3;
  prompt: string;
  answer: string;
  wrong: [string, string, string];
  explanation: string;
}

export const DEDUCTIONS: Deduction[] = [
  { level: 1, prompt: 'Ava is taller than Ben. Ben is taller than Cara. Who is the shortest?', answer: 'Cara', wrong: ['Ava', 'Ben', 'It cannot be determined'],
    explanation: 'Ava > Ben > Cara in height, so Cara is the shortest.' },
  { level: 1, prompt: 'Every rose in the garden is red. This flower is a rose from the garden. What colour is it?', answer: 'Red', wrong: ['White', 'Pink', 'It cannot be determined'],
    explanation: 'Every rose in the garden is red and this flower is one of them, so it must be red.' },
  { level: 1, prompt: 'If today is Wednesday, what day of the week will it be 10 days from now?', answer: 'Saturday', wrong: ['Friday', 'Sunday', 'Thursday'],
    explanation: '10 days is 1 week plus 3 days. Three days after Wednesday is Saturday.' },
  { level: 1, prompt: 'A clock shows exactly 3:00. What is the smaller angle between the hour hand and the minute hand?', answer: '90°', wrong: ['45°', '60°', '120°'],
    explanation: 'Neighbouring hour marks are 360° ÷ 12 = 30° apart. At 3:00 the hands are 3 marks apart: 3 × 30° = 90°.' },
  { level: 1, prompt: 'Tom has twice as many apples as Lily. Lily has 4 apples. How many apples do they have altogether?', answer: '12', wrong: ['8', '6', '10'],
    explanation: 'Tom has 2 × 4 = 8 apples. Together: 8 + 4 = 12.' },
  { level: 1, prompt: 'A farmer has 17 sheep. All but 9 run away. How many sheep are left?', answer: '9', wrong: ['8', '17', '0'],
    explanation: '“All but 9” means every sheep except 9 ran away, so 9 remain.' },
  { level: 1, prompt: 'A number is doubled and then 6 is added. The result is 20. What was the number?', answer: '7', wrong: ['13', '10', '8'],
    explanation: 'Work backwards: 20 − 6 = 14, then 14 ÷ 2 = 7.' },
  { level: 1, prompt: 'Three of these are fruits. Which one is not a fruit (in everyday cooking terms)? Apple, Banana, Carrot, Mango', answer: 'Carrot', wrong: ['Apple', 'Banana', 'Mango'],
    explanation: 'Apple, banana and mango are fruits; a carrot is a root vegetable.' },
  { level: 2, prompt: 'In a code, CAT is written as DBU. Using the same code, how is DOG written?', answer: 'EPH', wrong: ['EOH', 'DPH', 'FQI'],
    explanation: 'Each letter moves one place forward: C→D, A→B, T→U. So D→E, O→P, G→H gives EPH.' },
  { level: 2, prompt: 'A is the brother of B. B is the sister of C. C is the son of D. How is A related to D?', answer: 'A is D’s son', wrong: ['A is D’s father', 'A is D’s nephew', 'A is D’s brother'],
    explanation: 'A, B and C are siblings, and C is D’s child, so all three are D’s children. A is a brother, so A is D’s son.' },
  { level: 2, prompt: 'Five runners finish a race. Gus finishes last. Hal beats everyone else. Fay finishes directly after Dan. Eli beats Dan. Who finishes 3rd?', answer: 'Dan', wrong: ['Eli', 'Fay', 'Hal'],
    explanation: 'Hal is 1st and Gus is 5th. Eli, Dan and Fay fill places 2–4, with Eli before Dan and Fay right after Dan: Eli 2nd, Dan 3rd, Fay 4th.' },
  { level: 2, prompt: 'All black animals in the house sleep on the sofa. Milo is a black cat who lives in the house. Based only on these statements, which must be true?', answer: 'Milo sleeps on the sofa', wrong: ['All cats sleep on the sofa', 'Only black animals sleep on the sofa', 'Milo is the only black animal in the house'],
    explanation: 'Milo is a black animal in the house, and every such animal sleeps on the sofa. The statements say nothing about other cats or other animals.' },
  { level: 2, prompt: 'No reptiles have fur. All snakes are reptiles. Based only on these statements, which must be true?', answer: 'No snakes have fur', wrong: ['Some snakes have fur', 'Every animal without fur is a reptile', 'Some reptiles are not snakes'],
    explanation: 'Snakes are reptiles, and no reptile has fur, so no snake has fur. The other statements do not follow from the two premises.' },
  { level: 2, prompt: 'If it rains, the match is cancelled. The match was NOT cancelled. What can you conclude?', answer: 'It did not rain', wrong: ['It rained', 'The match was cancelled', 'Nothing can be concluded'],
    explanation: 'Rain would have forced a cancellation. Since there was no cancellation, it cannot have rained.' },
  { level: 2, prompt: 'A bat and a ball cost $1.10 in total. The bat costs $1.00 more than the ball. How much does the ball cost?', answer: '5 cents', wrong: ['10 cents', '15 cents', '1 cent'],
    explanation: 'If the ball costs x, the bat costs x + 1.00. Then 2x + 1.00 = 1.10, so x = 0.05: the ball costs 5 cents (and the bat $1.05).' },
  { level: 2, prompt: 'It takes 5 machines 5 minutes to make 5 widgets. How long would it take 100 machines to make 100 widgets?', answer: '5 minutes', wrong: ['100 minutes', '20 minutes', '1 minute'],
    explanation: 'Each machine makes one widget in 5 minutes. 100 machines working at once make 100 widgets in the same 5 minutes.' },
  { level: 2, prompt: 'In a row of children, Kim is 7th from the left and 5th from the right. How many children are in the row?', answer: '11', wrong: ['12', '13', '10'],
    explanation: '6 children are to Kim’s left and 4 to her right: 6 + 1 + 4 = 11.' },
  { level: 2, prompt: 'Anna is older than Beth. Carl is younger than Beth. Dana is older than Anna. Who is the second oldest?', answer: 'Anna', wrong: ['Beth', 'Dana', 'Carl'],
    explanation: 'Ordering by age: Dana > Anna > Beth > Carl. The second oldest is Anna.' },
  { level: 3, prompt: 'Lily is three times as old as Jack. In 10 years, Lily will be twice as old as Jack. How old is Jack now?', answer: '10', wrong: ['5', '15', '20'],
    explanation: 'Let Jack be J, so Lily is 3J. Then 3J + 10 = 2(J + 10), which gives J = 10 (Lily is 30; in 10 years 40 = 2 × 20).' },
  { level: 3, prompt: 'Three boxes are labelled “Apples”, “Oranges” and “Mixed”. Every label is wrong. You may take one fruit from one box without looking inside. Which box should you choose to work out all the contents?', answer: 'The box labelled “Mixed”', wrong: ['The box labelled “Apples”', 'The box labelled “Oranges”', 'It is impossible with one fruit'],
    explanation: 'The “Mixed” box is labelled wrongly, so it holds only one kind of fruit — the fruit you draw tells you which. The box labelled with that fruit cannot hold only that fruit and is not the one you found, so it is mixed; the last box holds the remaining fruit.' },
  { level: 3, prompt: 'On an island, knights always tell the truth and knaves always lie. A says: “B and I are both knaves.” What are A and B?', answer: 'A is a knave, B is a knight', wrong: ['Both are knights', 'Both are knaves', 'A is a knight, B is a knave'],
    explanation: 'A knight could never claim to be a knave, so A is a knave and the statement is false. “Both are knaves” being false means B is not a knave: B is a knight.' },
  { level: 3, prompt: 'A snail at the bottom of a 10 m wall climbs 3 m every day and slips back 2 m every night. On which day does it first reach the top?', answer: 'Day 8', wrong: ['Day 10', 'Day 7', 'Day 9'],
    explanation: 'After 7 days and nights it has gained 7 m. On day 8 it climbs 3 m more, reaching 10 m before it can slip back.' },
  { level: 3, prompt: 'If 3 cats catch 3 mice in 3 minutes, how many cats are needed to catch 100 mice in 100 minutes, working at the same rate?', answer: '3', wrong: ['100', '33', '1'],
    explanation: 'Three cats together catch one mouse per minute (3 mice in 3 minutes). In 100 minutes the same 3 cats catch 100 mice.' },
  { level: 3, prompt: 'The day before yesterday was Thursday. What day will it be the day after tomorrow?', answer: 'Monday', wrong: ['Sunday', 'Tuesday', 'Saturday'],
    explanation: 'If the day before yesterday was Thursday, today is Saturday. The day after tomorrow is Monday.' },
  { level: 3, prompt: 'All Zips are Zaps. Some Zaps are Zops. Based only on these statements, which must be true?', answer: 'None of the other three statements', wrong: ['All Zips are Zops', 'Some Zips are Zops', 'Some Zops are Zips'],
    explanation: 'The Zaps that are Zops might all be Zaps that are not Zips, so nothing definite follows about Zips and Zops.' },
];

function deduction(rng: Rng, lvl: number, avoid?: Set<string>): Puzzle {
  const maxLevel = lvl <= 1 ? 1 : lvl <= 3 ? 2 : 3;
  const minLevel = lvl >= 4 ? 2 : 1;
  const pool = DEDUCTIONS.filter((d) => d.level <= maxLevel && d.level >= minLevel);
  const fresh = avoid ? pool.filter((d) => !avoid.has(d.prompt)) : pool;
  const d = pick(rng, fresh.length ? fresh : pool);
  avoid?.add(d.prompt);
  return { type: 'Deduction', prompt: d.prompt, answer: d.answer, options: shuffle(rng, [d.answer, ...d.wrong]), explanation: d.explanation };
}

export type LogicCategory = 'mixed' | 'sequences' | 'patterns' | 'reasoning' | 'deduction';

/** level 1-5: rises during a session for difficulty progression. */
export function makePuzzle(rng: Rng, category: LogicCategory, level: number, avoid?: Set<string>): Puzzle {
  const lvl = Math.max(1, Math.min(5, Math.round(level)));
  const seqGens = [
    () => arithmetic(rng, lvl),
    () => (lvl >= 2 ? geometric(rng, lvl) : arithmetic(rng, lvl)),
    () => (lvl >= 2 ? growingDiff(rng, lvl) : missingMiddle(rng, lvl)),
    () => (lvl >= 3 ? squares(rng) : missingMiddle(rng, lvl)),
    () => (lvl >= 3 ? fibonacciLike(rng) : geometric(rng, lvl)),
    () => (lvl >= 4 ? alternating(rng) : missingMiddle(rng, lvl)),
    () => (lvl >= 5 ? interleaved(rng) : growingDiff(rng, lvl)),
  ];
  const patGens = [() => symbolPattern(rng, lvl), () => letterPattern(rng, lvl), () => gridRule(rng, lvl), () => oddOneOut(rng, lvl)];
  switch (category) {
    case 'sequences': return pick(rng, seqGens)();
    case 'patterns': return pick(rng, patGens)();
    case 'reasoning': return rng() < 0.7 ? wordProblem(rng, lvl) : gridRule(rng, lvl);
    case 'deduction': return deduction(rng, lvl, avoid);
    default: {
      const r = rng();
      if (r < 0.35) return pick(rng, seqGens)();
      if (r < 0.6) return pick(rng, patGens)();
      if (r < 0.75) return wordProblem(rng, lvl);
      return deduction(rng, lvl, avoid);
    }
  }
}

