import { defaultRng } from '../../lib/random';
import { Segmented } from '../../components/ui';
import { QuizGame, MODE_OPTIONS } from '../../components/ui/QuizGame';
import { usePrefs } from '../../components/ui/hooks';
import { geoQuestion, type GeoLevel, type GeoMode } from './questions';
import { loadWorld } from './WorldMap';
import './geo.css';

const TOTAL = 10;
const SECS = 60;
const MODE_LABEL: Record<GeoMode, string> = { mixed: 'Mixed', flags: 'Flags', capitals: 'Capitals', map: 'Map', continents: 'Continents' };

export default function GeographyQuiz({ preset }: { preset?: { mode?: GeoMode } }) {
  const [p, set] = usePrefs(preset?.mode ? `geography-${preset.mode}` : 'geography', {
    mode: preset?.mode ?? 'mixed', level: 'easy', run: 'count',
  });
  const mode = p.mode as GeoMode;
  const timed = p.run === 'timed';
  const variant = `${MODE_LABEL[mode]} · ${p.level} · ${timed ? `${SECS}s` : `${TOTAL} questions`}`;
  return (
    <QuizGame
      gameId="geography"
      url={preset?.mode ? `/geography/${preset.mode}/` : '/geography/'}
      title={preset?.mode ? `${MODE_LABEL[mode]} Quiz` : 'Geography Quiz'}
      subtitle="Flags, capitals, continents and map locations from around the world."
      variant={variant}
      timed={timed}
      total={TOTAL}
      timeLimitSec={SECS}
      createRun={() => {
        if (mode === 'map' || mode === 'mixed') loadWorld().catch(() => undefined);
        const seen = new Set<string>();
        return (i) => geoQuestion(defaultRng, mode, p.level as GeoLevel, `g${i}`, seen);
      }}
      instructions={[
        'Pick the right answer from four options (press 1–4 for speed).',
        'Easy uses well-known countries; Hard adds more countries and picks look-alike options from the same continent.',
        'Countries that span two continents are left out of continent questions, and countries with disputed or transitioning capitals are left out of capital questions.',
      ]}
      settings={
        <>
          <Segmented label="Question type" value={mode} onChange={(v) => set({ mode: v })}
            options={(Object.keys(MODE_LABEL) as GeoMode[]).map((k) => ({ value: k, label: MODE_LABEL[k] }))} />
          <Segmented label="Difficulty" value={p.level} onChange={(v) => set({ level: v })}
            options={[{ value: 'easy', label: 'Easy' }, { value: 'medium', label: 'Medium' }, { value: 'hard', label: 'Hard' }]} />
          <Segmented label="Length" value={p.run} onChange={(v) => set({ run: v })} options={MODE_OPTIONS(TOTAL, SECS)} />
        </>
      }
    />
  );
}
