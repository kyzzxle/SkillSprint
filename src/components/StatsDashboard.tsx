// Personal statistics page: everything here comes from this browser's localStorage.
import { useEffect, useState } from 'preact/hooks';
import { SCORE_RULES, pageForGameId } from '../data/catalog';
import { addDays, formatDateKey, localDateKey, timeAgo } from '../lib/date';
import { dailyStreak, load, onStorageChange, resetAll, storageAvailable, type StoreData } from '../lib/storage';
import { ConfirmDialog, EmptyState, Icon, StatGrid } from './ui';
import { prettyVariant } from '../lib/format';

export default function StatsDashboard() {
  const [data, setData] = useState<StoreData | null>(null);
  const [available, setAvailable] = useState(true);
  const [confirm, setConfirm] = useState(false);
  const [done, setDone] = useState(false);
  const [today] = useState(() => localDateKey());

  useEffect(() => {
    setAvailable(storageAvailable());
    const refresh = () => setData(load());
    refresh();
    return onStorageChange(refresh);
  }, []);

  if (!data) return <div class="card" aria-busy="true" style={{ minHeight: 240 }} />;

  const plays = Object.values(data.plays).reduce((a, b) => a + b, 0);
  const streak = dailyStreak(data.daily, today);
  const bests = Object.entries(data.bests)
    .map(([key, rec]) => {
      const [gameId, variant] = key.split('|');
      return { gameId, variant, ...rec };
    })
    .sort((a, b) => (SCORE_RULES[a.gameId]?.label ?? a.gameId).localeCompare(SCORE_RULES[b.gameId]?.label ?? b.gameId) || a.variant.localeCompare(b.variant));
  const last30 = Array.from({ length: 30 }, (_, i) => addDays(today, i - 29));

  return (
    <div class="grid" style={{ gap: '2rem' }}>
      {!available && (
        <div class="notice" role="alert">
          <Icon name="info" />
          <span>Your browser is blocking local storage (for example in a private window), so results cannot be saved on this device.</span>
        </div>
      )}
      {done && (
        <div class="notice" role="status">
          <Icon name="check" />
          <span>All SkillSprint data on this device has been deleted.</span>
        </div>
      )}

      <section aria-labelledby="overview">
        <h2 id="overview">Overview</h2>
        <StatGrid stats={[
          { k: 'Games played', v: plays },
          { k: 'Personal bests', v: bests.length },
          { k: 'Daily streak', v: `${streak.current} day${streak.current === 1 ? '' : 's'}` },
          { k: 'Best streak', v: `${streak.best} day${streak.best === 1 ? '' : 's'}` },
        ]} />
      </section>

      <section aria-labelledby="daily-history">
        <h2 id="daily-history">Daily Challenge — last 30 days</h2>
        <div class="day-grid" role="list">
          {last30.map((d) => {
            const r = data.daily[d];
            return (
              <span key={d} role="listitem" class={`day ${r ? 'done' : ''} ${d === today ? 'today' : ''}`} title={`${formatDateKey(d, { month: 'short', day: 'numeric' })}: ${r ? `${r.score}/${r.total}` : 'not played'}`}>
                <span class="sr-only">{formatDateKey(d, { month: 'long', day: 'numeric' })}: {r ? `${r.score} of ${r.total}` : 'not played'}</span>
                {r ? r.score : ''}
              </span>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="pbs">
        <h2 id="pbs">Personal bests</h2>
        {bests.length ? (
          <div class="table-wrap card" style={{ padding: '0.5rem 1rem' }}>
            <table class="data">
              <thead>
                <tr><th scope="col">Game</th><th scope="col">Settings</th><th scope="col">Best</th><th scope="col">Set</th></tr>
              </thead>
              <tbody>
                {bests.map((b) => (
                  <tr key={b.gameId + b.variant}>
                    <td><a href={pageForGameId(b.gameId)?.url ?? (b.gameId === 'daily' ? '/daily/' : '/')}>{SCORE_RULES[b.gameId]?.label ?? b.gameId}</a></td>
                    <td class="muted">{prettyVariant(b.variant)}</td>
                    <td class="num">{b.display}</td>
                    <td class="muted">{timeAgo(b.date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState icon="trophy" title="No personal bests yet">
            <p>Finish any game to set your first record.</p>
            <a class="btn btn-secondary btn-sm" href="/games/">Browse games</a>
          </EmptyState>
        )}
      </section>

      <section aria-labelledby="history">
        <h2 id="history">Recent activity</h2>
        {data.history.length ? (
          <div class="table-wrap card" style={{ padding: '0.5rem 1rem' }}>
            <table class="data">
              <thead>
                <tr><th scope="col">Game</th><th scope="col">Settings</th><th scope="col">Result</th><th scope="col">When</th></tr>
              </thead>
              <tbody>
                {data.history.slice(0, 50).map((h, i) => (
                  <tr key={i}>
                    <td><a href={h.url}>{SCORE_RULES[h.gameId]?.label ?? h.gameId}</a></td>
                    <td class="muted">{prettyVariant(h.variant)}</td>
                    <td class="num">{h.display}</td>
                    <td class="muted">{timeAgo(h.date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.history.length > 50 && <p class="muted" style={{ fontSize: '0.85rem' }}>Showing the latest 50 of {data.history.length} saved results.</p>}
          </div>
        ) : (
          <EmptyState icon="history" title="No activity yet">
            <p>Your last 300 results will be listed here.</p>
          </EmptyState>
        )}
      </section>

      <section aria-labelledby="reset" class="card">
        <h2 id="reset" style={{ fontSize: '1.2rem' }}>Reset your data</h2>
        <p class="muted">
          This permanently deletes your personal bests, history, daily challenge results, streaks and game preferences from this browser.
          Your light/dark theme choice is kept.
        </p>
        <button type="button" class="btn btn-danger" onClick={() => setConfirm(true)} disabled={!plays && !Object.keys(data.daily).length && !Object.keys(data.prefs).length}>
          <Icon name="trash" /> Reset all data
        </button>
      </section>

      <ConfirmDialog
        open={confirm}
        title="Delete all your SkillSprint data?"
        confirmLabel="Yes, delete everything"
        danger
        onCancel={() => setConfirm(false)}
        onConfirm={() => {
          resetAll();
          setConfirm(false);
          setDone(true);
        }}
      >
        <p>
          {plays} game result{plays === 1 ? '' : 's'}, {bests.length} personal best{bests.length === 1 ? '' : 's'} and {Object.keys(data.daily).length} daily challenge
          result{Object.keys(data.daily).length === 1 ? '' : 's'} will be removed from this browser. This cannot be undone.
        </p>
      </ConfirmDialog>
    </div>
  );
}
