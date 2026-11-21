import { CONTINENTS, COUNTRIES, type Country } from '../../data/countries';
import { pick, shuffle, type Rng } from '../../lib/random';
import type { QuizQuestion } from '../../components/ui/QuizRunner';
import { WorldMap } from './WorldMap';
import './geo.css';

export type GeoMode = 'mixed' | 'flags' | 'capitals' | 'map' | 'continents';
export type GeoLevel = 'easy' | 'medium' | 'hard';

/** Countries without a shape in the 1:110m map (reported by scripts/prepare-assets.mjs). */
const NO_MAP_SHAPE = new Set(['702']);

const byLevel = (level: GeoLevel) => (c: Country) => (level === 'easy' ? c.tier === 1 : level === 'medium' ? c.tier <= 2 : true);

function eligible(mode: Exclude<GeoMode, 'mixed'>, c: Country): boolean {
  if (mode === 'capitals') return c.capital !== null;
  if (mode === 'map') return !NO_MAP_SHAPE.has(c.num);
  if (mode === 'continents') return !c.transcontinental;
  return true;
}

/** Distractor countries: on hard, prefer the same continent (closer, harder to tell apart). */
function distractors(rng: Rng, target: Country, level: GeoLevel, filter: (c: Country) => boolean, n = 3): Country[] {
  const pool = COUNTRIES.filter((c) => c.iso2 !== target.iso2 && filter(c));
  const near = shuffle(rng, pool.filter((c) => c.continent === target.continent));
  const far = shuffle(rng, pool.filter((c) => c.continent !== target.continent));
  const ordered = level === 'easy' ? shuffle(rng, pool) : level === 'medium' ? [...near.slice(0, 2), ...far] : [...near, ...far];
  const out: Country[] = [];
  for (const c of ordered) {
    if (out.length >= n) break;
    if (!out.some((o) => o.iso2 === c.iso2)) out.push(c);
  }
  return out;
}

function facts(c: Country): string {
  return `${c.name} is in ${c.continent}${c.transcontinental ? ' (it spans more than one continent)' : ''}.${c.capital ? ` Capital: ${c.capital}.` : ''}${c.capitalNote ? ` ${c.capitalNote}` : ''}`;
}

export function geoQuestion(rng: Rng, mode: GeoMode, level: GeoLevel, key: string, avoid?: Set<string>): QuizQuestion {
  const m: Exclude<GeoMode, 'mixed'> = mode === 'mixed' ? pick(rng, ['flags', 'flags', 'capitals', 'capitals', 'map', 'continents'] as const) : mode;
  const pool = COUNTRIES.filter((c) => byLevel(level)(c) && eligible(m, c));
  const fresh = avoid ? pool.filter((c) => !avoid.has(c.iso2)) : pool;
  const t = pick(rng, fresh.length ? fresh : pool);
  avoid?.add(t.iso2);

  if (m === 'continents') {
    const wrong = shuffle(rng, CONTINENTS.filter((c) => c !== t.continent)).slice(0, 3);
    const opts = shuffle(rng, [t.continent, ...wrong]);
    return {
      key, kind: 'choice', label: 'Which continent is this country in?', prompt: <span>{t.name}</span>,
      choices: opts.map((o) => ({ id: o, label: o, text: o })), correctId: t.continent,
      answerText: t.continent, reviewText: `Continent of ${t.name}`, explanation: facts(t),
    };
  }

  if (m === 'capitals') {
    const others = distractors(rng, t, level, (c) => c.capital !== null);
    if (rng() < 0.65) {
      const opts = shuffle(rng, [t, ...others]);
      return {
        key, kind: 'choice', label: 'What is the capital city of…', prompt: <span>{t.name}</span>,
        choices: opts.map((o) => ({ id: o.iso2, label: o.capital!, text: o.capital! })), correctId: t.iso2,
        answerText: t.capital!, reviewText: `Capital of ${t.name}`, explanation: facts(t),
      };
    }
    const opts = shuffle(rng, [t, ...others]);
    return {
      key, kind: 'choice', label: 'This city is the capital of which country?', prompt: <span>{t.capital}</span>,
      choices: opts.map((o) => ({ id: o.iso2, label: o.name, text: o.name })), correctId: t.iso2,
      answerText: t.name, reviewText: `${t.capital} is the capital of…`, explanation: facts(t),
    };
  }

  const others = distractors(rng, t, level, (c) => eligible(m, c));
  const opts = shuffle(rng, [t, ...others]);
  const choices = opts.map((o) => ({ id: o.iso2, label: o.name, text: o.name }));

  if (m === 'flags') {
    return {
      key, kind: 'choice', label: 'Which country does this flag belong to?',
      prompt: <img class="flag-img" src={`/flags/${t.iso2}.svg`} alt="Flag to identify" width={240} height={180} decoding="async" />,
      choices, correctId: t.iso2, answerText: t.name, reviewText: `Flag of ${t.name}`, explanation: `That is the flag of ${t.name}. ${facts(t)}`,
    };
  }

  return {
    key, kind: 'choice', label: 'Which country is highlighted on the map?', prompt: <WorldMap highlight={t.num} />,
    choices, correctId: t.iso2, answerText: t.name, reviewText: `Map location of ${t.name}`, explanation: facts(t),
  };
}
