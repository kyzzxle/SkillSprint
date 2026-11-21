import { APPS, PLATFORM_NAME, parseCombo, shortcutsFor, type Platform, type ShortcutApp } from '../../data/shortcuts';
import { defaultRng, pick, shuffle, type Rng } from '../../lib/random';
import { Segmented } from '../../components/ui';
import { QuizGame, MODE_OPTIONS } from '../../components/ui/QuizGame';
import type { QuizQuestion } from '../../components/ui/QuizRunner';
import { usePrefs } from '../../components/ui/hooks';
import './shortcuts.css';

export function Keys({ combo }: { combo: string }) {
  const chords = parseCombo(combo);
  return (
    <span class="keys" aria-label={combo.replace(/\+/g, ' plus ').replace(/, /g, ', then ')}>
      {chords.map((keys, ci) => (
        <span class="chord" key={ci}>
          {ci > 0 && <span class="then">then</span>}
          {keys.map((k, i) => (
            <span key={i}>
              {i > 0 && <span class="plus">+</span>}
              <kbd>{k}</kbd>
            </span>
          ))}
        </span>
      ))}
    </span>
  );
}

type QType = 'combo' | 'action' | 'mixed';

export function shortcutQuestion(rng: Rng, app: ShortcutApp, platform: Platform, qtype: QType, key: string, avoid?: Set<string>): QuizQuestion {
  const list = shortcutsFor(app, platform);
  const fresh = avoid ? list.filter((s) => !avoid.has(s.id)) : list;
  const t = pick(rng, fresh.length ? fresh : list);
  avoid?.add(t.id);
  const others = shuffle(rng, list.filter((s) => s.id !== t.id && s.combo !== t.combo && s.action !== t.action)).slice(0, 3);
  const opts = shuffle(rng, [t, ...others]);
  const where = `${APPS[app].name}${APPS[app].platforms.length > 1 ? ` on ${PLATFORM_NAME[platform]}` : ''}`;
  const explanation = `${t.combo} — ${t.action}. ${t.explanation}`;
  const type = qtype === 'mixed' ? (rng() < 0.6 ? 'combo' : 'action') : qtype;
  if (type === 'combo') {
    return {
      key, kind: 'choice', label: <>Which shortcut does this in <strong>{where}</strong>?</>,
      prompt: <span class="sc-action">{t.action}</span>,
      choices: opts.map((o) => ({ id: o.id, label: <Keys combo={o.combo} />, text: o.combo })), correctId: t.id,
      answerText: t.combo, reviewText: `${where}: ${t.action}`, explanation,
    };
  }
  return {
    key, kind: 'choice', label: <>What does this shortcut do in <strong>{where}</strong>?</>,
    prompt: <Keys combo={t.combo} />,
    choices: opts.map((o) => ({ id: o.id, label: o.action, text: o.action })), correctId: t.id,
    answerText: t.action, reviewText: `${where}: ${t.combo}`, explanation,
  };
}

const TOTAL = 10;
const SECS = 60;

export default function ShortcutQuiz() {
  const [p, set] = usePrefs('shortcuts', { app: 'windows', platform: 'win', qtype: 'mixed', run: 'count' });
  const app = p.app as ShortcutApp;
  const platforms = APPS[app].platforms;
  const platform = (platforms.includes(p.platform as Platform) ? p.platform : platforms[0]) as Platform;
  const timed = p.run === 'timed';
  const variant = `${APPS[app].name}${platforms.length > 1 ? ` (${PLATFORM_NAME[platform]})` : ''} · ${timed ? `${SECS}s` : 'practice'}`;
  return (
    <QuizGame
      gameId="shortcuts"
      url="/keyboard-shortcuts/"
      title="Keyboard Shortcut Quiz"
      subtitle="Learn the shortcuts that save you the most time."
      variant={variant}
      timed={timed}
      total={TOTAL}
      timeLimitSec={SECS}
      createRun={() => {
        const seen = new Set<string>();
        return (i) => shortcutQuestion(defaultRng, app, platform, p.qtype as QType, `k${i}`, seen);
      }}
      instructions={[
        'Choose an app and — where it applies — Windows or macOS. Shortcuts always match the platform shown.',
        'Practice mode explains every shortcut after you answer. Timed mode is a 60-second sprint.',
        'Keys shown as “Ctrl+K, Z” are chords: press Ctrl+K, release, then press Z.',
        'Want to study first? Browse the shortcut reference sheets below the game.',
      ]}
      settings={
        <>
          <Segmented label="App" value={app} onChange={(v) => set({ app: v })}
            options={(Object.keys(APPS) as ShortcutApp[]).map((a) => ({ value: a, label: APPS[a].name }))} />
          {platforms.length > 1 && (
            <Segmented label="Platform" value={platform} onChange={(v) => set({ platform: v })}
              options={[{ value: 'win', label: 'Windows' }, { value: 'mac', label: 'macOS' }]} />
          )}
          <Segmented label="Question type" value={p.qtype} onChange={(v) => set({ qtype: v })}
            options={[{ value: 'mixed', label: 'Mixed' }, { value: 'combo', label: 'Guess the keys' }, { value: 'action', label: 'Guess the action' }]} />
          <Segmented label="Mode" value={p.run} onChange={(v) => set({ run: v })}
            options={MODE_OPTIONS(TOTAL, SECS).map((o) => (o.value === 'count' ? { ...o, label: `Practice (${TOTAL})` } : o))} />
        </>
      }
    />
  );
}
