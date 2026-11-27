import { useEffect, useState } from 'preact/hooks';
import { APPS, PLATFORM_NAME, SHORTCUTS, parseCombo, shortcutsFor, type Platform, type Shortcut, type ShortcutApp } from '../../data/shortcuts';
import { defaultRng, pick, shuffle, type Rng } from '../../lib/random';
import { deckOrder, loadWeak, saveWeak, updateShortcutDeck, type MissedShortcut } from '../../lib/weakspots';
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
type Target = Shortcut & { combo: string };

/** Review-deck key for a shortcut on a platform. */
export const deckKey = (id: string, platform: Platform) => `${id}|${platform}`;

/** Builds a question about one specific shortcut, with distractors from the same app and platform. */
export function questionFor(rng: Rng, t: Target, platform: Platform, qtype: QType, key: string): QuizQuestion {
  const app = t.app;
  const list = shortcutsFor(app, platform);
  const others = shuffle(rng, list.filter((s) => s.id !== t.id && s.combo !== t.combo && s.action !== t.action)).slice(0, 3);
  const opts = shuffle(rng, [t, ...others]);
  const where = `${APPS[app].name}${APPS[app].platforms.length > 1 ? ` on ${PLATFORM_NAME[platform]}` : ''}`;
  const explanation = `${t.combo} — ${t.action}. ${t.explanation}`;
  const type = qtype === 'mixed' ? (rng() < 0.6 ? 'combo' : 'action') : qtype;
  const tag = deckKey(t.id, platform);
  if (type === 'combo') {
    return {
      key, tag, kind: 'choice', label: <>Which shortcut does this in <strong>{where}</strong>?</>,
      prompt: <span class="sc-action">{t.action}</span>,
      choices: opts.map((o) => ({ id: o.id, label: <Keys combo={o.combo} />, text: o.combo })), correctId: t.id,
      answerText: t.combo, reviewText: `${where}: ${t.action}`, explanation,
    };
  }
  return {
    key, tag, kind: 'choice', label: <>What does this shortcut do in <strong>{where}</strong>?</>,
    prompt: <Keys combo={t.combo} />,
    choices: opts.map((o) => ({ id: o.id, label: o.action, text: o.action })), correctId: t.id,
    answerText: t.action, reviewText: `${where}: ${t.combo}`, explanation,
  };
}

export function shortcutQuestion(rng: Rng, app: ShortcutApp, platform: Platform, qtype: QType, key: string, avoid?: Set<string>): QuizQuestion {
  const list = shortcutsFor(app, platform);
  const fresh = avoid ? list.filter((s) => !avoid.has(s.id)) : list;
  const t = pick(rng, fresh.length ? fresh : list);
  avoid?.add(t.id);
  return questionFor(rng, t, platform, qtype, key);
}

/** Resolves a review-deck key back to the shortcut it refers to (null if it no longer exists). */
export function resolveDeckKey(k: string): { target: Target; platform: Platform } | null {
  const [id, platform] = k.split('|') as [string, Platform];
  const s = SHORTCUTS.find((x) => x.id === id);
  const combo = s?.[platform];
  return s && combo ? { target: { ...s, combo }, platform } : null;
}

const TOTAL = 10;
const SECS = 60;

export default function ShortcutQuiz() {
  const [p, set] = usePrefs('shortcuts', { app: 'windows', platform: 'win', qtype: 'mixed', run: 'count' });
  // Missed shortcuts waiting for review (two correct answers in a row clears a card).
  const [deck, setDeck] = useState<Record<string, MissedShortcut>>({});
  useEffect(() => setDeck(loadWeak().shortcuts), []);
  const deckKeys = deckOrder(deck).filter((k) => resolveDeckKey(k));
  const review = p.app === 'review' && deckKeys.length > 0;
  const app = (review || p.app === 'review' ? 'windows' : p.app) as ShortcutApp;
  const platforms = APPS[app].platforms;
  const platform = (platforms.includes(p.platform as Platform) ? p.platform : platforms[0]) as Platform;
  const timed = !review && p.run === 'timed';
  const reviewTotal = Math.min(TOTAL, deckKeys.length);
  const variant = review
    ? 'Missed shortcuts review'
    : `${APPS[app].name}${platforms.length > 1 ? ` (${PLATFORM_NAME[platform]})` : ''} · ${timed ? `${SECS}s` : 'practice'}`;

  return (
    <QuizGame
      gameId="shortcuts"
      url="/keyboard-shortcuts/"
      title="Keyboard Shortcut Quiz"
      subtitle="Learn the shortcuts that save you the most time."
      variant={variant}
      timed={timed}
      total={review ? reviewTotal : TOTAL}
      timeLimitSec={SECS}
      createRun={() => {
        if (review) {
          // Most-missed first; each card appears once per round.
          const order = deckKeys.slice(0, reviewTotal);
          return (i) => {
            const r = resolveDeckKey(order[i % order.length])!;
            return questionFor(defaultRng, r.target, r.platform, p.qtype as QType, `r${i}`);
          };
        }
        const seen = new Set<string>();
        return (i) => shortcutQuestion(defaultRng, app, platform, p.qtype as QType, `k${i}`, seen);
      }}
      onComplete={(s) => {
        const data = loadWeak();
        data.shortcuts = updateShortcutDeck(
          data.shortcuts,
          s.review.filter((r) => r.tag).map((r) => ({ key: r.tag!, correct: r.correct })),
        );
        saveWeak(data);
        setDeck(data.shortcuts);
      }}
      instructions={[
        'Choose an app and, where it applies, Windows or macOS. Shortcuts always match the platform shown.',
        'Every shortcut you miss goes into your review deck. Answer it correctly twice in a row to clear it.',
        'Keys shown as “Ctrl+K, Z” are chords: press Ctrl+K, release, then press Z.',
        'Want to study first? Browse the shortcut reference sheets below the game.',
      ]}
      settings={
        <>
          <Segmented label="App" value={review ? 'review' : app} onChange={(v) => set({ app: v })}
            options={[
              ...(deckKeys.length ? [{ value: 'review', label: `My missed shortcuts (${deckKeys.length})` }] : []),
              ...(Object.keys(APPS) as ShortcutApp[]).map((a) => ({ value: a, label: APPS[a].name })),
            ]} />
          {!review && platforms.length > 1 && (
            <Segmented label="Platform" value={platform} onChange={(v) => set({ platform: v })}
              options={[{ value: 'win', label: 'Windows' }, { value: 'mac', label: 'macOS' }]} />
          )}
          <Segmented label="Question type" value={p.qtype} onChange={(v) => set({ qtype: v })}
            options={[{ value: 'mixed', label: 'Mixed' }, { value: 'combo', label: 'Guess the keys' }, { value: 'action', label: 'Guess the action' }]} />
          {!review && (
            <Segmented label="Mode" value={p.run} onChange={(v) => set({ run: v })}
              options={MODE_OPTIONS(TOTAL, SECS).map((o) => (o.value === 'count' ? { ...o, label: `Practice (${TOTAL})` } : o))} />
          )}
        </>
      }
      setupExtra={
        deckKeys.length > 0 && !review ? (
          <section class="weak-ops compact" aria-label="Your review deck">
            <p>
              <strong>{deckKeys.length} missed shortcut{deckKeys.length === 1 ? '' : 's'}</strong> waiting for review. Clear each one by
              answering it right twice in a row.
            </p>
            <button type="button" class="btn btn-secondary" onClick={() => set({ app: 'review' })}>
              Review my missed shortcuts
            </button>
          </section>
        ) : review ? (
          <p class="muted" style={{ margin: 0 }}>
            Reviewing your {reviewTotal} most-missed shortcut{reviewTotal === 1 ? '' : 's'} across all apps.
          </p>
        ) : null
      }
    />
  );
}
