// Header search across categories and games. Pure client-side, no network requests.
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { CATEGORIES, GAMES, categoryById, type CategoryId } from '../data/catalog';
import { iconSvg } from '../data/icons';

interface Entry {
  title: string;
  sub: string;
  url: string;
  cat: CategoryId;
  haystack: string;
  kind: 'category' | 'game';
}

function buildIndex(): Entry[] {
  const entries: Entry[] = [];
  for (const c of CATEGORIES) {
    entries.push({
      title: c.name, sub: c.tagline, url: c.url, cat: c.id, kind: 'category',
      haystack: [c.name, c.tagline, c.description, ...c.keywords].join(' ').toLowerCase(),
    });
  }
  for (const g of GAMES) {
    const c = categoryById(g.category);
    entries.push({
      title: g.name, sub: `${c.name}: ${g.short}`, url: g.url, cat: g.category, kind: 'game',
      haystack: [g.name, g.short, ...g.keywords, c.name, ...c.keywords].join(' ').toLowerCase(),
    });
  }
  return entries;
}

export function scoreEntry(e: Entry, q: string): number {
  const title = e.title.toLowerCase();
  const terms = q.split(/\s+/).filter(Boolean);
  let score = 0;
  for (const raw of terms) {
    // Treat simple plurals ("flags", "capitals") like their singular form.
    const t = raw.length > 3 && raw.endsWith('s') && !title.includes(raw) ? raw.slice(0, -1) : raw;
    if (title.startsWith(t)) score += 6;
    else if (title.includes(t)) score += 4;
    else if (e.haystack.includes(t)) score += 2;
    else return 0; // every term must match somewhere
  }
  if (e.kind === 'game') score += 0.5;
  return score;
}

export default function SiteSearch() {
  const index = useMemo(buildIndex, []);
  const [q, setQ] = useState('');
  const [active, setActive] = useState(0);
  const [focused, setFocused] = useState(false);
  const [open, setOpen] = useState(false); // mobile overlay
  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const query = q.trim().toLowerCase();
  const results = useMemo(() => {
    if (!query) return [];
    return index
      .map((e) => ({ e, s: scoreEntry(e, query) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 8)
      .map((x) => x.e);
  }, [query, index]);

  useEffect(() => setActive(0), [query]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(true);
        inputRef.current?.focus();
      }
    };
    const onDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setFocused(false);
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDown);
    };
  }, []);

  const go = (url: string) => {
    window.location.href = url;
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter') {
      if (results[active]) {
        e.preventDefault();
        go(results[active].url);
      }
    } else if (e.key === 'Escape') {
      setQ('');
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  const showList = (focused || open) && query.length > 0;

  return (
    <div class={`search ${open ? 'open' : ''}`} ref={rootRef}>
      <button
        type="button"
        class="icon-btn search-toggle"
        aria-label="Search games"
        aria-expanded={open}
        onClick={() => {
          setOpen(!open);
          setTimeout(() => inputRef.current?.focus(), 0);
        }}
        dangerouslySetInnerHTML={{ __html: iconSvg('search') }}
      />
      <div class="search-field">
        <span aria-hidden="true" style={{ display: 'inline-flex', width: 18 }} dangerouslySetInnerHTML={{ __html: iconSvg('search') }} />
        <input
          ref={inputRef}
          type="search"
          role="combobox"
          aria-label="Search games and categories"
          aria-expanded={showList}
          aria-controls="search-results"
          aria-autocomplete="list"
          aria-activedescendant={showList && results[active] ? `sr-${active}` : undefined}
          placeholder="Search games…"
          value={q}
          onInput={(e) => setQ((e.target as HTMLInputElement).value)}
          onFocus={() => setFocused(true)}
          onKeyDown={onKeyDown}
          autoComplete="off"
        />
        <kbd aria-hidden="true">Ctrl K</kbd>
      </div>
      {showList && (
        <ul class="search-results" id="search-results" role="listbox" aria-label="Search results">
          {results.length === 0 ? (
            <li class="search-empty" role="option" aria-selected={false}>
              No games match “{q}”. Try “memory”, “flags” or “wpm”.
            </li>
          ) : (
            results.map((r, i) => (
              <li key={r.url + r.title} role="presentation">
                <a href={r.url} id={`sr-${i}`} role="option" aria-selected={i === active} data-cat={r.cat} onMouseEnter={() => setActive(i)}>
                  <span class="r-icon" dangerouslySetInnerHTML={{ __html: iconSvg(r.cat) }} />
                  <span>
                    <span class="r-title">{r.title}</span>
                    <br />
                    <span class="r-sub">{r.sub}</span>
                  </span>
                </a>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
