// Homepage widgets that read local statistics. They render neutral placeholders on the server
// and fill in from localStorage after hydration — statistics are never invented.
import { useEffect, useState } from 'preact/hooks';
import { CATEGORIES, GAMES, SCORE_RULES, pageForGameId, type CategoryId } from '../data/catalog';
import { iconSvg } from '../data/icons';
import { localDateKey, formatDateKey, timeAgo } from '../lib/date';
import { dailyStreak, load, onStorageChange, type StoreData } from '../lib/storage';
import { prettyVariant } from '../lib/format';
import { allMedals, TOTAL_MEDALS } from '../lib/medals';
import { EmptyState } from './ui';

function useStore(): StoreData | null {
  const [data, setData] = useState<StoreData | null>(null);
  useEffect(() => {
    const refresh = () => setData(load());
    refresh();
    return onStorageChange(refresh);
  }, []);
  return data;
}

const catOfGame = (gameId: string): CategoryId | null =>
  gameId === 'daily' ? null : (GAMES.find((g) => g.gameId === gameId)?.category ?? null);

/** Best score across all variants of a storage game id. */
export function bestOverall(data: StoreData, gameId: string) {
  const rule = SCORE_RULES[gameId];
  let best: { score: number; display: string } | null = null;
  for (const [key, rec] of Object.entries(data.bests)) {
    if (key.split('|')[0] !== gameId) continue;
    if (!best || (rule?.better === 'lower' ? rec.score < best.score : rec.score > best.score)) best = rec;
  }
  return best;
}

/** The daily challenge, presented as today's race bib. */
export function DailyBib() {
  const data = useStore();
  const [today] = useState(() => localDateKey());
  const result = data?.daily[today];
  const streak = data ? dailyStreak(data.daily, today) : null;
  const dayMonth = data ? formatDateKey(today, { day: 'numeric', month: 'short' }) : 'Today';
  const weekday = data ? formatDateKey(today, { weekday: 'long' }) : '';
  return (
    <div class="bib" role="region" aria-label="Daily challenge">
      <span class="bib-pin tl" /><span class="bib-pin tr" /><span class="bib-pin bl" /><span class="bib-pin br" />
      <div class="bib-band">
        <span>Daily challenge</span>
        <span>{weekday}</span>
      </div>
      <div class="bib-body">
        <div class="bib-number">{dayMonth}</div>
        <p class="bib-status">
          {!data
            ? 'Loading today’s challenge…'
            : result
              ? `You scored ${result.score} out of ${result.total} today. A new set arrives tomorrow.`
              : 'Ten mixed questions, about three minutes. Everyone gets the same set today.'}
        </p>
        <div class="bib-meta">
          <div>
            <b>{streak ? streak.current : '–'}</b>
            <span>day streak</span>
          </div>
          <div>
            <b>{streak ? streak.best : '–'}</b>
            <span>best streak</span>
          </div>
          <div>
            <b>{data ? Object.keys(data.daily).length : '–'}</b>
            <span>days played</span>
          </div>
        </div>
        <a class="btn btn-primary btn-lg" href="/daily/">
          {result ? 'See today’s result' : 'Play today’s challenge'}
        </a>
      </div>
    </div>
  );
}

/** Which of the ten lanes you have run, plus personal bests. */
export function SeasonBoard() {
  const data = useStore();
  const tried = new Set<CategoryId>();
  if (data) {
    for (const gameId of Object.keys(data.plays)) {
      const c = catOfGame(gameId);
      if (c) tried.add(c);
    }
  }
  const pbs = data
    ? CATEGORIES.map((c, i) => {
        const flagship = GAMES.find((g) => g.category === c.id && g.flagship)!;
        const best = bestOverall(data, flagship.gameId);
        return best ? { lane: i + 1, cat: c, game: flagship, best } : null;
      }).filter((x) => x !== null)
    : [];
  return (
    <div>
      <div class="season-count" aria-live="polite">
        {data ? tried.size : '–'}
        <small> of 10 lanes run</small>
      </div>
      <nav class="season-lanes" aria-label="Lanes you have run">
        {CATEGORIES.map((c, i) => (
          <a
            key={c.id}
            href={c.url}
            data-cat={c.id}
            class={tried.has(c.id) ? 'done' : ''}
            title={`Lane ${i + 1}: ${c.name}${tried.has(c.id) ? ' (played)' : ''}`}
            aria-label={`Lane ${i + 1}, ${c.name}${tried.has(c.id) ? ', played' : ', not played yet'}`}
          >
            {i + 1}
          </a>
        ))}
      </nav>
      <p class="muted" style={{ margin: '0 0 1.5rem', fontSize: '0.95rem' }}>
        {!data ? '' : tried.size === 10 ? 'Every lane run. Now beat your personal bests.' : tried.size === 0 ? 'Run any lane to start your season.' : `Next up: ${CATEGORIES.find((c) => !tried.has(c.id))?.name}.`}
      </p>
      {data && (() => {
        const levels = Object.values(allMedals(data.bests));
        const count = (l: number) => levels.filter((x) => x >= l).length;
        return (
          <p class="season-medals" aria-label="Medals won">
            <strong>{count(1) + count(2) + count(3)} of {TOTAL_MEDALS} medals</strong>
            <span><i style={{ background: '#e2ad16' }} /> {count(3)} gold</span>
            <span><i style={{ background: '#9aa4b7' }} /> {count(2)} silver</span>
            <span><i style={{ background: '#b06d36' }} /> {count(1)} bronze</span>

          </p>
        );
      })()}
      {data && pbs.length > 0 && (
        <table class="data">
          <caption class="sr-only">Personal bests by lane</caption>
          <thead>
            <tr>
              <th scope="col">Lane</th>
              <th scope="col">Game</th>
              <th scope="col" style={{ textAlign: 'right' }}>PB</th>
            </tr>
          </thead>
          <tbody>
            {pbs.map((p) => (
              <tr key={p!.cat.id}>
                <td class="num">{p!.lane}</td>
                <td><a href={p!.game.url}>{p!.game.name}</a></td>
                <td class="num" style={{ textAlign: 'right' }}>{p!.best.display}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export function RecentlyPlayed() {
  const data = useStore();
  if (!data) return <div aria-busy="true" style={{ minHeight: 180 }} />;
  const recent = data.history.slice(0, 6);
  if (!recent.length) {
    return (
      <EmptyState title="No results yet">
        <p>Finish any game and it shows up here, with your score and settings.</p>
        <a class="btn btn-secondary btn-sm" href="/reaction-time/">Try the reaction test</a>
      </EmptyState>
    );
  }
  return (
    <ul class="list-plain" style={{ borderTop: '1px solid var(--border)' }}>
      {recent.map((h, i) => {
        const cat = catOfGame(h.gameId) ?? 'logic';
        return (
          <li key={i}>
            <a class="recent-item" href={h.url} data-cat={cat}>
              <span class="cat-icon" dangerouslySetInnerHTML={{ __html: iconSvg(h.gameId === 'daily' ? 'daily' : cat) }} />
              <span class="grow">
                <span class="t">{SCORE_RULES[h.gameId]?.label ?? pageForGameId(h.gameId)?.name ?? h.gameId}</span>
                <br />
                <span class="s">{prettyVariant(h.variant)}, {timeAgo(h.date)}</span>
              </span>
              <span class="v">{h.display}</span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
