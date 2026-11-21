import { defaultRng, pick, shuffle, type Rng } from '../../lib/random';
import { Segmented } from '../../components/ui';
import { QuizGame, MODE_OPTIONS } from '../../components/ui/QuizGame';
import type { QuizQuestion } from '../../components/ui/QuizRunner';
import { usePrefs } from '../../components/ui/hooks';
import { BANDS, distractorColors, hslToRgb, randomColor, rgbText, rgbToHex, rgbToHsl, type RGB } from './color';
import './color.css';

export type ColorMode = 'mixed' | 'rgb' | 'hex' | 'complement';
type Level = 'easy' | 'medium' | 'hard';

const LETTERS = ['A', 'B', 'C', 'D'];
const Swatch = ({ c, big, label }: { c: RGB; big?: boolean; label?: string }) => (
  <span class={`swatch ${big ? 'big' : ''}`} style={{ background: rgbToHex(c) }} role="img" aria-label={label ?? 'Colour swatch'} />
);

export function colorQuestion(rng: Rng, mode: ColorMode, level: Level, key: string): QuizQuestion {
  const m = mode === 'mixed' ? pick(rng, ['rgb', 'hex', 'complement'] as const) : mode;
  const [lo, hi] = BANDS[level];

  if (m === 'complement') {
    const h = Math.floor(rng() * 360), s = 55 + Math.floor(rng() * 35), l = 42 + Math.floor(rng() * 16);
    const target = hslToRgb({ h, s, l });
    const comp = hslToRgb({ h: h + 180, s, l });
    const offsets = level === 'easy' ? [0, 90, 270] : level === 'medium' ? [60, 120, 240] : [140, 220, 90];
    const opts = shuffle(rng, [
      { id: 'c', c: comp },
      ...offsets.map((o, i) => ({ id: `d${i}`, c: hslToRgb({ h: h + o, s, l }) })),
    ]);
    return {
      key, kind: 'choice', label: 'Which colour is the complement (opposite on the colour wheel)?',
      prompt: <Swatch c={target} big label="Target colour" />,
      choices: opts.map((o, i) => ({ id: o.id, label: <span class="swatch-choice"><Swatch c={o.c} label={`Option ${LETTERS[i]}`} /><span class="mono sw-code">{LETTERS[i]}</span></span>, text: rgbToHex(o.c) })),
      correctId: 'c',
      answerText: rgbToHex(comp),
      reviewText: `Complement of ${rgbToHex(target)}`,
      explanation: `The target has hue ${h}° (HSL). Its complement sits 180° away on the colour wheel, at hue ${(h + 180) % 360}°, with the same saturation and lightness: ${rgbToHex(comp)}.`,
    };
  }

  const target = randomColor(rng);
  const others = distractorColors(rng, target, 3, lo, hi);
  const all = shuffle(rng, [target, ...others].map((c, i) => ({ id: i === 0 ? 't' : `d${i}`, c })));
  const hsl = rgbToHsl(target);
  const explain = `${rgbToHex(target)} = ${rgbText(target)} (hue ${hsl.h}°, saturation ${hsl.s}%, lightness ${hsl.l}%). In hex, each pair of digits is one channel from 00 (none) to FF (255).`;

  if (m === 'rgb') {
    return {
      key, kind: 'choice', label: 'Which RGB value matches this colour?',
      prompt: <Swatch c={target} big label="Colour to identify" />,
      choices: all.map((o) => ({ id: o.id, label: <span class="mono">{rgbText(o.c)}</span>, text: rgbText(o.c) })),
      correctId: 't', answerText: rgbText(target), reviewText: `RGB of the swatch ${rgbToHex(target)}`, explanation: explain,
    };
  }
  return {
    key, kind: 'choice', label: 'Which swatch is this HEX colour?',
    prompt: <span class="mono hex-prompt">{rgbToHex(target)}</span>,
    choices: all.map((o, i) => ({ id: o.id, label: <span class="swatch-choice"><Swatch c={o.c} label={`Option ${LETTERS[i]}`} /><span class="mono sw-code">{LETTERS[i]}</span></span>, text: rgbToHex(o.c) })),
    correctId: 't', answerText: rgbToHex(target), reviewText: `Swatch for ${rgbToHex(target)}`, explanation: explain,
  };
}

const TOTAL = 10;
const SECS = 60;

export default function ColorChallenge() {
  const [p, set] = usePrefs('color', { mode: 'mixed', level: 'easy', run: 'count' });
  const timed = p.run === 'timed';
  const labels: Record<ColorMode, string> = { mixed: 'Mixed', rgb: 'Guess the RGB', hex: 'Find the HEX', complement: 'Complementary' };
  const variant = `${labels[p.mode as ColorMode]} · ${p.level} · ${timed ? `${SECS}s` : `${TOTAL} questions`}`;
  return (
    <QuizGame
      gameId="color"
      url="/color/"
      title="Color Challenge"
      subtitle="How well can you read a colour code — or see the colour behind it?"
      variant={variant}
      timed={timed}
      total={TOTAL}
      timeLimitSec={SECS}
      createRun={() => (i) => colorQuestion(defaultRng, p.mode as ColorMode, p.level as Level, `c${i}`)}
      instructions={[
        'Guess the RGB: see a swatch, pick its rgb() value.',
        'Find the HEX: see a code like #3A7BD5, pick the matching swatch.',
        'Complementary: pick the colour opposite the target on the colour wheel (hue + 180°).',
        'Harder levels use options that are closer together (measured with the CIEDE2000 colour-difference formula).',
      ]}
      settings={
        <>
          <Segmented label="Challenge" value={p.mode} onChange={(v) => set({ mode: v })}
            options={(Object.keys(labels) as ColorMode[]).map((k) => ({ value: k, label: labels[k] }))} />
          <Segmented label="Difficulty" value={p.level} onChange={(v) => set({ level: v })}
            options={[{ value: 'easy', label: 'Easy' }, { value: 'medium', label: 'Medium' }, { value: 'hard', label: 'Hard' }]} />
          <Segmented label="Length" value={p.run} onChange={(v) => set({ run: v })} options={MODE_OPTIONS(TOTAL, SECS)} />
        </>
      }
    />
  );
}
