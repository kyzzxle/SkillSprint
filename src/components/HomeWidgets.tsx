// Homepage widgets that read local statistics. Rendered with neutral placeholders on the server
// and filled in from localStorage after hydration — no statistics are ever invented.
import { useEffect, useState } from 'preact/hooks';
import { SCORE_RULES, pageForGameId, type CategoryId } from '../data/catalog';
import { iconSvg } from '../data/icons';
import { localDateKey, formatDateKey, timeAgo } from '../lib/date';
import { dailyStreak, load, onStorageChange, type StoreData } from '../lib/storage';
import { EmptyState, Icon } from './ui';

function useStore(): StoreData | null {
  const [data, setData] = useState<StoreData | null>(null);
  useEffect(() => {
    const refresh = () => setData(load());
    refresh();
    return onStorageChange(refresh);
  }, []);
  return data;
}

const catOf = (gameId: string): CategoryId => (gameId === 'daily' ? 'logic' : (pageForGameId(gameId)?.category ?? 'typing'));

export function DailyCard() {
  const data = useStore();
  const [today] = useState(() => localDateKey());
  const result = data?.daily[today];
  const streak = data ? dailyStreak(data.daily, today) : null;
  return (
    <div class="daily-card">
      <div>
        <p class="eyebrow">Daily Challenge{data ? ` · ${formatDateKey(today)}` : ''}</p>
        <h2>10 questions. Same for everyone today.</h2>
        <p class="muted" style={{ margin: 0 }}>
          A fresh mix of maths, logic, vocabulary, geography, colour and shortcut questions every day. Build a streak by playing daily.
        </p>
        <div class="btn-row" style={{ marginTop: '1.1rem' }}>
          <a class="btn btn-primary btn-lg" href="/daily/">
            <Icon name={result ? 'check' : 'play'} /> {result ? 'View today’s result' : 'Play today’s challenge'}
          </a>
        </div>
      </div>
      <div class="daily-stats">
        <div class="stat-box">
          <div class="k">Today</div>
          <div class="v">{!data ? '…' : result ? `${result.score}/${result.total}` : 'Not played'}</div>
        </div>
        <div class="stat-box">
          <div class="k">Streak</div>
          <div class="v">
            {!streak ? '…' : `${streak.current}`}
            <span style={{ fontSize: '0.8rem', color: 'var(--muted)', marginLeft: 4 }}>{streak ? (streak.current === 1 ? 'day' : 'days') : ''}</span>
          </div>
        </div>
        <div class="stat-box">
          <div class="k">Best streak</div>
          <div class="v">{streak ? streak.best : '…'}</div>
        </div>
        <div class="stat-box">
          <div class="k">Days played</div>
          <div class="v">{data ? Object.keys(data.daily).length : '…'}</div>
        </div>
      </div>
    </div>
  );
}

/** Best score across all variants of a game. */
function bestOverall(data: StoreData, gameId: string) {
  const rule = SCORE_RULES[gameId];
  let best: { score: number; display: string; variant: string } | null = null;
  for (const [key, rec] of Object.entries(data.bests)) {
    const [g, variant] = key.split('|');
    if (g !== gameId) continue;
    if (!best || (rule?.better === 'lower' ? rec.score < best.score : rec.score > best.score)) best = { score: rec.score, display: rec.display, variant };
  }
  return best;
}

const HIGHLIGHT_GAMES = ['typing', 'reaction', 'sequence-memory', 'number-memory', 'memory-grid', 'color-match', 'reading', 'typing-code'];

export function Highlights() {
  const data = useStore();
  if (!data) return <div class="card" aria-busy="true" style={{ minHeight: 180 }} />;
  const items = HIGHLIGHT_GAMES.map((g) => ({ g, best: bestOverall(data, g) })).filter((x) => x.best);
  const plays = Object.values(data.plays).reduce((a, b) => a + b, 0);
  if (!items.length) {
    return (
      <EmptyState icon="trophy" title="No personal bests yet">
        <p>Play any game and your best scores will appear here. They are stored only in this browser.</p>
        <a class="btn btn-secondary btn-sm" href="/typing/">Try the typing test</a>
      </EmptyState>
    );
  }
  return (
    <div class="card">
      <ul class="list-plain grid grid-2" style={{ gap: '0.9rem' }}>
        {items.slice(0, 6).map(({ g, best }) => {
          const page = pageForGameId(g);
          return (
            <li key={g}>
              <a class="highlight" href={page?.url ?? '/'} data-cat={catOf(g)}>
                <span class="cat-icon" dangerouslySetInnerHTML={{ __html: iconSvg(catOf(g)) }} />
                <span>
                  <span class="muted" style={{ fontSize: '0.85rem', display: 'block' }}>{SCORE_RULES[g]?.label ?? g}</span>
                  <span class="v">{best!.display}</span>
                </span>
              </a>
            </li>
          );
        })}
      </ul>
      <p class="muted" style={{ margin: '1rem 0 0', fontSize: '0.88rem' }}>
        {plays} game{plays === 1 ? '' : 's'} played on this device · <a href="/stats/">See all statistics</a>
      </p>
    </div>
  );
}

export function RecentlyPlayed() {
  const data = useStore();
  if (!data) return <div class="card" aria-busy="true" style={{ minHeight: 180 }} />;
  const recent = data.history.slice(0, 5);
  if (!recent.length) {
    return (
      <EmptyState icon="history" title="Nothing played yet">
        <p>Your recently played games will show up here.</p>
        <a class="btn btn-secondary btn-sm" href="/reaction-time/">Test your reactions</a>
      </EmptyState>
    );
  }
  return (
    <ul class="list-plain">
      {recent.map((h, i) => {
        const cat = catOf(h.gameId);
        return (
          <li key={i}>
            <a class="recent-item" href={h.url} data-cat={cat}>
              <span class="cat-icon" dangerouslySetInnerHTML={{ __html: iconSvg(cat) }} />
              <span class="grow">
                <span class="t">{SCORE_RULES[h.gameId]?.label ?? h.gameId}</span>
                <br />
                <span class="s">{h.variant} · {timeAgo(h.date)}</span>
              </span>
              <span class="v">{h.display}</span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}

