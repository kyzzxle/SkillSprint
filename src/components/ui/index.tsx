// Shared, reusable game UI components (Preact).
import type { ComponentChildren } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import { iconSvg } from '../../data/icons';
import { ADS } from '../../config/site';
import type { RecordOutcome, ScoreRecord } from '../../lib/storage';
import { prefersReducedMotion } from './hooks';
import { prettyVariant } from '../../lib/format';

export function Icon({ name, class: cls }: { name: string; class?: string }) {
  return <span class={`icon ${cls ?? ''}`} dangerouslySetInnerHTML={{ __html: iconSvg(name) }} />;
}

/* ---------- Option selector (radio group) ---------- */
export interface Option<V extends string | number> {
  value: V;
  label: ComponentChildren;
}
export function Segmented<V extends string | number>(props: {
  label: string;
  value: V;
  options: Option<V>[];
  onChange: (v: V) => void;
  hideLabel?: boolean;
}) {
  const { label, value, options, onChange, hideLabel } = props;
  const groupRef = useRef<HTMLDivElement>(null);
  const onKey = (e: KeyboardEvent) => {
    if (!['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'].includes(e.key)) return;
    e.preventDefault();
    const i = options.findIndex((o) => o.value === value);
    const d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : -1;
    const next = options[(i + d + options.length) % options.length];
    onChange(next.value);
    requestAnimationFrame(() => {
      groupRef.current?.querySelector<HTMLButtonElement>('[aria-checked="true"]')?.focus();
    });
  };
  return (
    <div class="option-group">
      <span class={hideLabel ? 'sr-only' : 'label'} id={`lbl-${label.replace(/\W+/g, '-')}`}>{label}</span>
      <div class="segmented" role="radiogroup" aria-labelledby={`lbl-${label.replace(/\W+/g, '-')}`} ref={groupRef} onKeyDown={onKey}>
        {options.map((o) => (
          <button
            type="button"
            role="radio"
            aria-checked={o.value === value}
            tabIndex={o.value === value ? 0 : -1}
            onClick={() => onChange(o.value)}
            key={String(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------- Personal best badge ---------- */
export function PersonalBest({ best, isNew, label = 'Personal best' }: { best?: ScoreRecord; isNew?: boolean; label?: string }) {
  if (isNew) {
    return (
      <span class="pb-badge pb-new" role="status">
        <span class="pb-flag">New PB</span> New personal best!
      </span>
    );
  }
  return (
    <span class="pb-badge">
      <span class="pb-flag">PB</span> {label}: <strong>{best ? best.display : 'none yet'}</strong>
    </span>
  );
}

/* ---------- Instructions ---------- */
export function Instructions({ items, title = 'How to play' }: { items: ComponentChildren[]; title?: string }) {
  return (
    <div class="instructions">
      <h3>{title}</h3>
      <ul>
        {items.map((it, i) => (
          <li key={i}>{it}</li>
        ))}
      </ul>
    </div>
  );
}

/* ---------- Setup (pre-game) panel ---------- */
export function SetupPanel(props: {
  title: string;
  subtitle?: ComponentChildren;
  instructions?: ComponentChildren[];
  children?: ComponentChildren;
  onStart: () => void;
  startLabel?: string;
  best?: ScoreRecord;
  bestLabel?: string;
  footer?: ComponentChildren;
}) {
  return (
    <div class="setup">
      <div class="setup-head">
        <h2>{props.title}</h2>
        {props.subtitle && <p class="muted">{props.subtitle}</p>}
      </div>
      {props.children && <div class="setup-options">{props.children}</div>}
      <div class="btn-row center">
        <button type="button" class="btn btn-primary btn-lg" onClick={props.onStart}>
          <Icon name="play" /> {props.startLabel ?? 'Start'}
        </button>
      </div>
      <div class="btn-row center">
        <PersonalBest best={props.best} label={props.bestLabel} />
      </div>
      {props.instructions && <Instructions items={props.instructions} />}
      {props.footer}
    </div>
  );
}

/* ---------- 3-2-1 countdown ---------- */
export function Countdown({ from = 3, onDone }: { from?: number; onDone: () => void }) {
  const [n, setN] = useState(from);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;
  useEffect(() => {
    if (prefersReducedMotion()) {
      // Still give a short, clearly announced pause before timed play starts.
      const t = window.setTimeout(() => doneRef.current(), 600);
      return () => window.clearTimeout(t);
    }
    if (n <= 0) {
      doneRef.current();
      return;
    }
    const t = window.setTimeout(() => setN((x) => x - 1), 700);
    return () => window.clearTimeout(t);
  }, [n]);
  return (
    <div class="countdown" role="timer" aria-live="assertive">
      <span key={n}>{n > 0 ? n : 'Go'}</span>
    </div>
  );
}

/* ---------- Progress bar ---------- */
export function Progress({ value, max, label }: { value: number; max: number; label: string }) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  return (
    <div class="progress" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={max} aria-valuenow={value}>
      <span style={{ width: `${pct}%` }} />
    </div>
  );
}

export function StatInline({ k, v, accent }: { k: string; v: ComponentChildren; accent?: boolean }) {
  return (
    <div class="stat-inline">
      <span class="k">{k}</span>
      <span class={`v ${accent ? 'accent' : ''}`}>{v}</span>
    </div>
  );
}

export function StatGrid({ stats }: { stats: { k: string; v: ComponentChildren }[] }) {
  return (
    <div class="stat-grid">
      {stats.map((s) => (
        <div class="stat-box" key={s.k}>
          <div class="k">{s.k}</div>
          <div class="v">{s.v}</div>
        </div>
      ))}
    </div>
  );
}

/* ---------- Results panel ---------- */
export function ResultsPanel(props: {
  title?: string;
  score: ComponentChildren;
  unit?: string;
  subtitle?: ComponentChildren;
  stats?: { k: string; v: ComponentChildren }[];
  outcome?: RecordOutcome;
  onRestart: () => void;
  onSettings?: () => void;
  restartLabel?: string;
  children?: ComponentChildren;
  extraActions?: ComponentChildren;
}) {
  const restartRef = useRef<HTMLButtonElement>(null);
  const headRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    headRef.current?.focus({ preventScroll: false });
  }, []);
  const prev = props.outcome?.previous;
  return (
    <section class="results" aria-labelledby="results-title">
      <div class="results-head">
        <p class="eyebrow">{props.title ?? 'Results'}</p>
        <h2 id="results-title" ref={headRef} tabIndex={-1} class="big-score">
          {props.score}
          {props.unit && <small>{props.unit}</small>}
        </h2>
        {props.subtitle && (
          <p class="muted" style={{ margin: '0.7rem 0 0' }}>
            {typeof props.subtitle === 'string' ? prettyVariant(props.subtitle) : props.subtitle}
          </p>
        )}
        {props.outcome && (
          <div class="btn-row">
            {props.outcome.isBest ? (
              <span class="pb-badge pb-new" role="status">
                <span class="pb-flag">New PB</span> New personal best{prev ? `, beating ${prev.display}` : ''}
              </span>
            ) : (
              <PersonalBest best={prev} />
            )}
          </div>
        )}
      </div>
      {props.stats && <StatGrid stats={props.stats} />}
      <div class="btn-row results-actions">
        <button type="button" ref={restartRef} class="btn btn-primary btn-lg" onClick={props.onRestart}>
          <Icon name="restart" /> {props.restartLabel ?? 'Play again'}
        </button>
        {props.onSettings && (
          <button type="button" class="btn btn-secondary btn-lg" onClick={props.onSettings}>
            <Icon name="settings" /> Change settings
          </button>
        )}
        {props.extraActions}
      </div>
      {props.children}
      <AdSlot slot="results" size="inline" />
    </section>
  );
}

/* ---------- Review list for quizzes ---------- */
export interface ReviewItem {
  correct: boolean;
  question: string;
  given: string;
  answer: string;
  explanation?: string;
  tag?: string;
}
export function ReviewList({ items, title = 'Review your answers' }: { items: ReviewItem[]; title?: string }) {
  const [open, setOpen] = useState(false);
  if (!items.length) return null;
  const shown = open ? items : items.slice(0, 5);
  return (
    <div>
      <h3>{title}</h3>
      <ol class="review list-plain">
        {shown.map((r, i) => (
          <li class="review-item" key={i}>
            <span class={`mark ${r.correct ? 'ok' : 'no'}`} aria-label={r.correct ? 'Correct' : 'Incorrect'}>
              {r.correct ? '✓' : '✗'}
            </span>
            <div>
              <div>
                <strong>{r.question}</strong>
              </div>
              <div>
                {r.correct ? (
                  <>Your answer: {r.given}</>
                ) : (
                  <>
                    Your answer: {r.given || <em>no answer</em>}. Correct answer: <strong>{r.answer}</strong>
                  </>
                )}
              </div>
              {r.explanation && <div class="exp">{r.explanation}</div>}
            </div>
          </li>
        ))}
      </ol>
      {items.length > 5 && (
        <div class="btn-row center" style={{ marginTop: '0.75rem' }}>
          <button type="button" class="btn btn-ghost btn-sm" onClick={() => setOpen(!open)} aria-expanded={open}>
            {open ? 'Show fewer' : `Show all ${items.length}`}
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------- Empty state ---------- */
export function EmptyState({ icon = 'history', title, children }: { icon?: string; title: string; children?: ComponentChildren }) {
  return (
    <div class="empty">
      <Icon name={icon} />
      <div>
        <strong>{title}</strong>
      </div>
      {children}
    </div>
  );
}

/* ---------- Confirmation dialog (native <dialog>) ---------- */
export function ConfirmDialog(props: {
  open: boolean;
  title: string;
  children: ComponentChildren;
  confirmLabel: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (props.open && !d.open) d.showModal();
    if (!props.open && d.open) d.close();
  }, [props.open]);
  return (
    <dialog
      ref={ref}
      class="confirm"
      aria-labelledby="confirm-title"
      onCancel={(e: Event) => {
        e.preventDefault();
        props.onCancel();
      }}
    >
      <h2 id="confirm-title">{props.title}</h2>
      <div class="muted">{props.children}</div>
      <div class="btn-row" style={{ justifyContent: 'flex-end', marginTop: '1.25rem' }}>
        <button type="button" class="btn btn-secondary" onClick={props.onCancel} autofocus>
          Cancel
        </button>
        <button type="button" class={`btn ${props.danger ? 'btn-danger' : 'btn-primary'}`} onClick={props.onConfirm}>
          {props.confirmLabel}
        </button>
      </div>
    </dialog>
  );
}

/* ---------- Ad slot (placeholder until AdSense is configured) ---------- */
declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}
export function AdSlot({ slot, size = 'banner' }: { slot: string; size?: 'banner' | 'rect' | 'inline' }) {
  const insRef = useRef<HTMLModElement>(null);
  const slotId = ADS.slots[slot];
  const live = ADS.enabled && ADS.client && slotId;
  useEffect(() => {
    if (!live) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      /* ad blockers etc. */
    }
  }, [live]);
  if (live) {
    return (
      <aside class="ad-slot" data-size={size} aria-label="Advertisement">
        <ins
          ref={insRef}
          class="adsbygoogle"
          style={{ display: 'block', width: '100%' }}
          data-ad-client={ADS.client}
          data-ad-slot={slotId}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </aside>
    );
  }
  if (!ADS.showPlaceholders) return null;
  return (
    <aside class="ad-slot" data-size={size} data-ad-placeholder={slot} aria-label="Advertisement placeholder">
      <span class="ad-label">Advertisement space</span>
    </aside>
  );
}
