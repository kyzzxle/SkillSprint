// Question generators for the vocabulary and spelling games.
import { SPELLING, VOCAB, type SpellingEntry, type VocabEntry } from '../../data/vocabulary';
import { pick, randInt, shuffle, type Rng } from '../../lib/random';
import type { QuizChoice, QuizQuestion } from '../../components/ui/QuizRunner';
import './vocab.css';

export type VocabMode = 'definition' | 'synonym' | 'antonym' | 'mixed';
export type SpellMode = 'choose' | 'fix' | 'missing';
export type Level = 'easy' | 'medium' | 'hard';
export type AnswerStyle = 'choice' | 'typing';

// Words whose meanings are close enough that they must never appear as each other's distractors.
const GROUPS: string[][] = [
  ['generous', 'benevolent', 'magnanimous', 'lenient', 'benign', 'innocuous', 'sincere'],
  ['cautious', 'prudent', 'vigilant', 'meticulous', 'fastidious', 'diligent', 'accurate'],
  ['candid', 'sincere', 'transparent'],
  ['laconic', 'garrulous', 'concise'],
  ['obstinate', 'tenacious', 'resilient', 'fragile'],
  ['calm', 'equanimity', 'cacophony'],
  ['deteriorate', 'exacerbate', 'ameliorate', 'mitigate', 'expand'],
  ['tedious', 'insipid', 'vivid', 'gloomy'],
  ['ancient', 'obsolete', 'permanent', 'ephemeral'],
  ['ambiguous', 'obfuscate', 'esoteric', 'conceal', 'transparent'],
  ['innocuous', 'benign', 'hostile'],
  ['sagacious', 'pragmatic', 'prudent', 'feasible', 'futile'],
  ['assist', 'advocate'],
  ['reluctant', 'compliant', 'zealous', 'obstinate'],
  ['frequent', 'ubiquitous', 'abundant', 'superfluous', 'enormous'],
  ['hostile', 'gregarious', 'polite', 'humble'],
  ['brave', 'candid'],
];

function related(a: string, b: string): boolean {
  return a === b || GROUPS.some((g) => g.includes(a) && g.includes(b));
}

const levelFilter = (level: Level) => (e: { level: number }) =>
  level === 'easy' ? e.level === 1 : level === 'medium' ? e.level <= 2 : e.level >= 2;

function distractorEntries(rng: Rng, target: VocabEntry, n: number): VocabEntry[] {
  const unrelated = VOCAB.filter((e) => !related(e.word, target.word));
  const samePos = shuffle(rng, unrelated.filter((e) => e.pos === target.pos));
  const others = shuffle(rng, unrelated.filter((e) => e.pos !== target.pos));
  return [...samePos, ...others].slice(0, n);
}

function choices(rng: Rng, correct: string, wrong: string[]): { choices: QuizChoice[]; correctId: string } {
  const all = shuffle(rng, [correct, ...wrong]);
  return { choices: all.map((t) => ({ id: t, label: t, text: t })), correctId: correct };
}

const cap = (s: string) => s[0].toUpperCase() + s.slice(1);

export function vocabQuestion(rng: Rng, mode: VocabMode, level: Level, style: AnswerStyle, key: string, avoid?: Set<string>): QuizQuestion {
  const m: Exclude<VocabMode, 'mixed'> = mode === 'mixed' ? pick(rng, ['definition', 'synonym', 'antonym'] as const) : mode;
  let pool = VOCAB.filter(levelFilter(level));
  if (m === 'antonym') pool = pool.filter((e) => e.antonyms.length > 0);
  const fresh = avoid ? pool.filter((e) => !avoid.has(e.word)) : pool;
  const target = pick(rng, fresh.length ? fresh : pool);
  avoid?.add(target.word);
  const explanation = `${cap(target.word)} (${target.pos}): ${target.definition}. Similar: ${target.synonyms.join(', ')}.${target.antonyms.length ? ` Opposite: ${target.antonyms.join(', ')}.` : ''}`;

  if (m === 'definition') {
    if (style === 'typing') {
      return {
        key, kind: 'input',
        label: `Type the ${target.pos} that matches this definition (${target.word.length} letters, starts with “${target.word[0]}”)`,
        prompt: <span>“{cap(target.definition)}”</span>,
        accept: (raw) => raw.trim().toLowerCase() === target.word,
        answerText: target.word, reviewText: `Definition: ${target.definition}`, explanation,
        inputPlaceholder: `${target.word[0]}${'_'.repeat(target.word.length - 1)}`,
      };
    }
    const c = choices(rng, target.word, distractorEntries(rng, target, 3).map((e) => e.word));
    return {
      key, kind: 'choice', label: `Which ${target.pos} matches this definition?`,
      prompt: <span>“{cap(target.definition)}”</span>, ...c,
      answerText: target.word, reviewText: `Definition: ${target.definition}`, explanation,
    };
  }

  const isSyn = m === 'synonym';
  const correct = pick(rng, isSyn ? target.synonyms : target.antonyms);
  const wrong = distractorEntries(rng, target, 3).map((e) => pick(rng, isSyn ? e.synonyms : e.synonyms.concat(e.word)));
  const c = choices(rng, correct, wrong);
  return {
    key, kind: 'choice',
    label: isSyn ? 'Which word is closest in meaning to…' : 'Which word is most nearly OPPOSITE in meaning to…',
    prompt: <span>{target.word}</span>, ...c,
    answerText: correct,
    reviewText: `${isSyn ? 'Synonym' : 'Antonym'} of “${target.word}”`,
    explanation,
  };
}

/** Masks `count` letters of a word, avoiding the first letter. Returns the masked word and the hidden letters in order. */
export function maskWord(rng: Rng, word: string, count: number): { masked: string; positions: number[] } {
  const candidates = shuffle(rng, Array.from({ length: word.length - 1 }, (_, i) => i + 1));
  const positions = candidates.slice(0, Math.min(count, word.length - 2)).sort((a, b) => a - b);
  const masked = word.split('').map((ch, i) => (positions.includes(i) ? '_' : ch)).join('');
  return { masked, positions };
}

const LETTERS = 'abcdefghijklmnopqrstuvwxyz';

export function spellingQuestion(rng: Rng, mode: SpellMode, level: Level, style: AnswerStyle, key: string, avoid?: Set<string>): QuizQuestion {
  if (mode === 'missing') return missingLetterQuestion(rng, level, style, key, avoid);
  const pool = SPELLING.filter(levelFilter(level));
  const fresh = avoid ? pool.filter((e) => !avoid.has(e.word)) : pool;
  const e: SpellingEntry = pick(rng, fresh.length ? fresh : pool);
  avoid?.add(e.word);
  const explanation = `${cap(e.word)} — ${e.hint}. Tip: ${e.tip}`;
  if (mode === 'fix') {
    const bad = pick(rng, e.wrong);
    return {
      key, kind: 'input', label: `Fix the spelling (meaning: ${e.hint})`,
      prompt: <span class="misspelled">{bad}</span>,
      accept: (raw) => raw.trim().toLowerCase() === e.word,
      answerText: e.word, reviewText: `Correct spelling of “${bad}”`, explanation,
      inputPlaceholder: 'Type the correct spelling',
    };
  }
  const c = choices(rng, e.word, [...e.wrong]);
  return {
    key, kind: 'choice', label: 'Which spelling is correct?',
    prompt: <span style={{ fontSize: '0.75em' }}>{cap(e.hint)}</span>, ...c,
    answerText: e.word, reviewText: `Spelling of the word meaning “${e.hint}”`, explanation,
  };
}

function missingLetterQuestion(rng: Rng, level: Level, style: AnswerStyle, key: string, avoid?: Set<string>): QuizQuestion {
  const words: { word: string; hint: string }[] = [
    ...VOCAB.filter(levelFilter(level)).map((v) => ({ word: v.word, hint: v.definition })),
    ...SPELLING.filter(levelFilter(level)).map((s) => ({ word: s.word, hint: s.hint })),
  ].filter((w) => w.word.length >= 6 && /^[a-z]+$/.test(w.word));
  const fresh = avoid ? words.filter((w) => !avoid.has(w.word)) : words;
  const t = pick(rng, fresh.length ? fresh : words);
  avoid?.add(t.word);
  const count = level === 'easy' ? 1 : level === 'medium' ? 2 : 3;
  const { masked, positions } = maskWord(rng, t.word, count);
  const missing = positions.map((p) => t.word[p]).join('');
  const explanation = `${cap(t.word)}: ${t.hint}. The missing letter${missing.length > 1 ? 's are' : ' is'} “${missing.split('').join(', ')}”.`;
  const prompt = <span class="masked">{masked.split('').map((ch, i) => (ch === '_' ? <span class="gap" key={i}>_</span> : ch))}</span>;
  if (style === 'typing') {
    return {
      key, kind: 'input', label: `Complete the word (meaning: ${t.hint})`, prompt,
      accept: (raw) => raw.trim().toLowerCase() === t.word,
      answerText: t.word, reviewText: `Complete “${masked}”`, explanation,
      inputPlaceholder: 'Type the whole word',
    };
  }
  const wrong = new Set<string>();
  while (wrong.size < 3) {
    const fill = Array.from({ length: missing.length }, () => LETTERS[randInt(rng, 0, 25)]).join('');
    // Bias towards plausible letters by sometimes swapping in vowels.
    const alt = rng() < 0.5 ? fill : fill.replace(/[^aeiou]/, pick(rng, ['a', 'e', 'i', 'o', 'u']));
    if (alt !== missing) wrong.add(alt);
  }
  const fmt = (s: string) => s.split('').join(' · ');
  const all = shuffle(rng, [missing, ...wrong]);
  return {
    key, kind: 'choice', label: `Which letters complete the word? (meaning: ${t.hint})`, prompt,
    choices: all.map((s) => ({ id: s, label: <span class="mono">{fmt(s)}</span>, text: s })),
    correctId: missing,
    answerText: `${missing} (${t.word})`, reviewText: `Complete “${masked}”`, explanation,
  };
}
