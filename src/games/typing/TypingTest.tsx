import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'preact/hooks';
import './typing.css';
import { TypingChart, type Sample } from './TypingChart';
import { CODE_SNIPPETS } from '../../data/typing';
import { defaultRng, shuffle } from '../../lib/random';
import { recordResult, type RecordOutcome } from '../../lib/storage';
import { Icon, ResultsPanel, Segmented, PersonalBest, StatInline } from '../../components/ui';
import { useBest, useCountdown, usePrefs, isTypingTarget } from '../../components/ui/hooks';
import { computeCodeStats, computeStats, generateWords, type Difficulty, type TypingStats, type WordResult } from './engine';

type Mode = 'words' | 'code';
type Phase = 'ready' | 'running' | 'done';

const DEFAULTS = { duration: 30, difficulty: 'intermediate' as Difficulty, punctuation: false, numbers: false, mode: 'words' as Mode };

export default function TypingTest({ preset }: { preset?: { mode?: Mode } }) {
  const lockedMode = preset?.mode;
  const [prefs, setPrefs] = usePrefs(lockedMode ? 'typing-code' : 'typing', DEFAULTS, lockedMode ? { mode: lockedMode } : undefined);
  const mode: Mode = lockedMode ?? prefs.mode;
  const gameId = mode === 'code' ? 'typing-code' : 'typing';
  const variant =
    mode === 'code'
      ? `${prefs.duration}s`
      : `${prefs.duration}s · ${prefs.difficulty}${prefs.punctuation ? ' · punctuation' : ''}${prefs.numbers ? ' · numbers' : ''}`;

  const [phase, setPhase] = useState<Phase>('ready');
  const [seed, setSeed] = useState(0); // bump to regenerate text
  const [, force] = useState(0);
  const rerender = () => force((x) => x + 1);
  const [focused, setFocused] = useState(false);
  const [final, setFinal] = useState<{ stats: TypingStats; history: Sample[]; outcome: RecordOutcome; elapsed: number } | null>(null);
  const [bestVersion, setBestVersion] = useState(0);
  const best = useBest(gameId, variant, bestVersion);

  const inputRef = useRef<HTMLInputElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const caretRef = useRef<HTMLDivElement>(null);
  const keys = useRef({ correct: 0, total: 0 });
  const startedAt = useRef(0);
  const history = useRef<Sample[]>([]);
  // Keystroke totals at the previous sample, used for per-second raw speed and errors.
  const lastSample = useRef({ t: 0, total: 0, wrong: 0 });

  // ---- words mode data ----
  const words = useRef<string[]>([]);
  const committed = useRef<WordResult[]>([]);
  const current = useRef('');
  const [firstVisible, setFirstVisible] = useState(0);

  // ---- code mode data ----
  const code = useMemo(() => {
    const order = shuffle(defaultRng, CODE_SNIPPETS);
    let text = '';
    const starts: { at: number; lang: string }[] = [];
    for (const s of order) {
      if (text) text += '\n\n';
      starts.push({ at: text.length, lang: s.lang });
      text += s.code;
    }
    return { text, starts };
  }, [seed, mode]);
  const typedCode = useRef('');
  const autoFlags = useRef<boolean[]>([]);

  const resetRun = () => {
    keys.current = { correct: 0, total: 0 };
    history.current = [];
    lastSample.current = { t: 0, total: 0, wrong: 0 };
    committed.current = [];
    current.current = '';
    typedCode.current = '';
    autoFlags.current = [];
    words.current = generateWords(defaultRng, 120, prefs);
    setFirstVisible(0);
    setFinal(null);
    setPhase('ready');
    if (inputRef.current) inputRef.current.value = '';
  };

  // Regenerate whenever settings change or a restart is requested.
  useEffect(resetRun, [seed, prefs.difficulty, prefs.punctuation, prefs.numbers, prefs.duration, mode]);

  const elapsedMs = () => (startedAt.current ? performance.now() - startedAt.current : 0);

  const stats = (elapsed: number): TypingStats =>
    mode === 'code'
      ? computeCodeStats(code.text, typedCode.current, autoFlags.current, elapsed, keys.current)
      : computeStats(committed.current, { target: words.current[committed.current.length] ?? '', typed: current.current }, elapsed, keys.current);

  const finish = (elapsedOverride?: number) => {
    if (phase !== 'running') return;
    const elapsed = elapsedOverride ?? prefs.duration * 1000;
    const s = stats(elapsed);
    // Close the chart with a final (possibly partial) second.
    if (elapsed - lastSample.current.t > 250) takeSample(elapsed);
    const wpm = Math.round(s.wpm);
    const outcome = recordResult({
      gameId, variant, score: wpm, display: `${wpm} WPM`, better: 'higher', url: mode === 'code' ? '/typing/code/' : '/typing/',
    });
    setFinal({ stats: s, history: history.current.slice(), outcome, elapsed });
    setBestVersion((v) => v + 1);
    setPhase('done');
    inputRef.current?.blur();
  };

  const { remaining } = useCountdown(prefs.duration * 1000, phase === 'running', () => finish());

  // Per-second WPM samples for the results chart.
  useEffect(() => {
    if (phase !== 'running') return;
    const id = window.setInterval(() => takeSample(elapsedMs()), 1000);
    return () => window.clearInterval(id);
  }, [phase]);

  /** One chart point: cumulative net WPM, raw WPM and incorrect keystrokes during the interval just ended. */
  const takeSample = (elapsed: number) => {
    const prev = lastSample.current;
    const total = keys.current.total;
    const wrong = keys.current.total - keys.current.correct;
    const minutes = Math.max(elapsed - prev.t, 1) / 60000;
    history.current.push({
      t: elapsed / 1000,
      wpm: stats(elapsed).wpm,
      raw: (total - prev.total) / 5 / minutes,
      errors: wrong - prev.wrong,
    });
    lastSample.current = { t: elapsed, total, wrong };
  };

  const start = () => {
    startedAt.current = performance.now();
    setPhase('running');
  };

  const countKeys = (prev: string, next: string, target: string) => {
    let p = 0;
    while (p < prev.length && p < next.length && prev[p] === next[p]) p++;
    for (let i = p; i < next.length; i++) {
      keys.current.total++;
      if (next[i] === target[i]) keys.current.correct++;
    }
  };

  // ---- words mode input ----
  const onWordsInput = (el: HTMLInputElement) => {
    let v = el.value;
    if (phase === 'done') {
      el.value = '';
      return;
    }
    if (phase === 'ready') {
      if (!v.trim()) {
        el.value = '';
        return;
      }
      start();
    }
    // Mobile keyboards (autocomplete) can insert several characters, including spaces, in one event.
    // Commit every completed word; whatever follows the last space becomes the current word.
    if (v.includes(' ')) {
      const parts = v.split(' ');
      const rest = parts.pop() ?? '';
      let prev = current.current;
      for (const typed of parts) {
        if (!typed) continue; // ignore extra spaces
        const target = words.current[committed.current.length];
        countKeys(prev, typed, target);
        prev = '';
        keys.current.total++;
        if (typed === target) keys.current.correct++;
        committed.current.push({ target, typed });
        if (words.current.length - committed.current.length < 60) {
          words.current = words.current.concat(generateWords(defaultRng, 60, prefs, words.current[words.current.length - 1]));
        }
      }
      current.current = prev;
      v = rest;
      el.value = rest;
      if (!rest) {
        rerender();
        return;
      }
    }
    const target = words.current[committed.current.length];
    if (v.length > target.length + 10) {
      v = v.slice(0, target.length + 10);
      el.value = v;
    }
    countKeys(current.current, v, target);
    current.current = v;
    rerender();
  };

  // ---- code mode input ----
  const appendCode = (ch: string) => {
    const pos = typedCode.current.length;
    if (pos >= code.text.length) return;
    keys.current.total++;
    const ok = code.text[pos] === ch;
    if (ok) keys.current.correct++;
    typedCode.current += ch;
    autoFlags.current.push(false);
    if (ch === '\n' && ok) {
      // Auto-indent: fill the next line's leading spaces.
      let i = pos + 1;
      while (code.text[i] === ' ') {
        typedCode.current += ' ';
        autoFlags.current.push(true);
        i++;
      }
    }
    if (typedCode.current.length >= code.text.length) {
      rerender();
      finish(elapsedMs());
    }
  };

  const onCodeInput = (el: HTMLInputElement) => {
    const v = el.value;
    el.value = '';
    if (phase === 'done' || !v) return;
    if (phase === 'ready') start();
    for (const ch of v) appendCode(ch);
    rerender();
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      setSeed((s) => s + 1);
      return;
    }
    if (mode !== 'code' || phase === 'done') return;
    if (e.key === 'Enter') {
      e.preventDefault();
      if (phase === 'ready') start();
      appendCode('\n');
      rerender();
    } else if (e.key === 'Backspace') {
      e.preventDefault();
      if (!typedCode.current.length) return;
      // Remove automatic indentation together with the character before it.
      while (autoFlags.current.length && autoFlags.current[autoFlags.current.length - 1]) {
        autoFlags.current.pop();
        typedCode.current = typedCode.current.slice(0, -1);
      }
      autoFlags.current.pop();
      typedCode.current = typedCode.current.slice(0, -1);
      rerender();
    } else if (e.key === 'Tab') {
      // Tab moves focus to the restart button (standard keyboard navigation); indentation is automatic.
    }
  };

  // Focus the hidden input when the user starts typing anywhere on the page.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (phase === 'done' || e.ctrlKey || e.metaKey || e.altKey) return;
      if (document.activeElement === inputRef.current || isTypingTarget(e.target)) return;
      if ((e.target as HTMLElement)?.closest?.('button, a, [role="radio"], summary')) return;
      if (e.key.length === 1) inputRef.current?.focus({ preventScroll: true });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase]);

  // Caret positioning and line scrolling (words mode).
  useLayoutEffect(() => {
    const box = boxRef.current;
    const caret = caretRef.current;
    if (!box || !caret || phase === 'done') return;
    let el: HTMLElement | null = null;
    let after = false;
    if (mode === 'words') {
      const wordEl = box.querySelector<HTMLElement>(`[data-i="${committed.current.length}"]`);
      if (!wordEl) return;
      const letters = wordEl.querySelectorAll<HTMLElement>('.l');
      const li = current.current.length;
      if (li < letters.length) el = letters[li];
      else {
        el = letters[letters.length - 1] ?? wordEl;
        after = true;
      }
      // Scroll: keep the active word on the first or second line.
      const first = box.querySelector<HTMLElement>('.w');
      if (first && wordEl.offsetTop - first.offsetTop > wordEl.offsetHeight * 1.5) {
        const all = Array.from(box.querySelectorAll<HTMLElement>('.w'));
        const nextLine = all.find((w) => w.offsetTop > first.offsetTop);
        if (nextLine) {
          setFirstVisible(Number(nextLine.dataset.i));
          return;
        }
      }
    } else {
      el = box.querySelector<HTMLElement>('.c.cur');
      if (!el) {
        const all = box.querySelectorAll<HTMLElement>('.c');
        el = all[all.length - 1] ?? null;
        after = true;
      }
    }
    if (!el) return;
    const left = el.offsetLeft + (after ? el.offsetWidth : 0);
    caret.style.transform = `translate(${left}px, ${el.offsetTop}px)`;
    caret.style.height = `${el.offsetHeight}px`;
  });

  // ---------- Render ----------
  if (phase === 'done' && final) {
    const s = final.stats;
    return (
      <ResultsPanel
        title={mode === 'code' ? 'Code typing result' : 'Typing result'}
        score={Math.round(s.wpm)}
        unit="WPM"
        subtitle={`${mode === 'code' ? 'Code' : variant} · ${Math.round(final.elapsed / 1000)} seconds`}
        outcome={final.outcome}
        stats={[
          { k: 'Accuracy', v: `${s.accuracy.toFixed(1)}%` },
          { k: 'Raw WPM', v: Math.round(s.rawWpm) },
          { k: 'Correct chars', v: s.correctChars },
          { k: 'Incorrect chars', v: s.incorrectChars + s.extraChars },
          mode === 'code' ? { k: 'Lines', v: s.correctWords } : { k: 'Words typed', v: s.wordsTyped },
          mode === 'code' ? { k: 'Time', v: `${Math.round(final.elapsed / 1000)}s` } : { k: 'Missed chars', v: s.missedChars },
        ]}
        onRestart={() => setSeed((x) => x + 1)}
        restartLabel="Next test"
      >
        <TypingChart samples={final.history} />
      </ResultsPanel>
    );
  }

  const live = phase === 'running' ? stats(elapsedMs()) : null;
  const secs = Math.ceil(remaining / 1000);

  return (
    <div class="typing">
      <div class={`typing-config ${phase === 'running' ? 'is-running' : ''}`} inert={phase === 'running'}>
        {!lockedMode && (
          <Segmented label="Mode" hideLabel value={mode} onChange={(v) => setPrefs({ mode: v })} options={[{ value: 'words', label: 'Words' }, { value: 'code', label: 'Code' }]} />
        )}
        <Segmented label="Duration" hideLabel value={prefs.duration} onChange={(v) => setPrefs({ duration: v })}
          options={[15, 30, 60, 120].map((d) => ({ value: d, label: `${d}s` }))} />
        {mode === 'words' && (
          <>
            <Segmented label="Difficulty" hideLabel value={prefs.difficulty} onChange={(v) => setPrefs({ difficulty: v })}
              options={[{ value: 'beginner', label: 'Beginner' }, { value: 'intermediate', label: 'Intermediate' }, { value: 'advanced', label: 'Advanced' }]} />
            <div class="segmented" role="group" aria-label="Extras">
              <button type="button" aria-pressed={prefs.punctuation} onClick={() => setPrefs({ punctuation: !prefs.punctuation })}>
                @ punctuation
              </button>
              <button type="button" aria-pressed={prefs.numbers} onClick={() => setPrefs({ numbers: !prefs.numbers })}>
                # numbers
              </button>
            </div>
          </>
        )}
      </div>

      <div class="typing-live" aria-live="off">
        <StatInline k="Time" v={`${phase === 'running' ? secs : prefs.duration}s`} accent />
        <StatInline k="WPM" v={live ? Math.round(live.wpm) : '—'} />
        <StatInline k="Accuracy" v={live ? `${Math.round(live.accuracy)}%` : '—'} />
        {mode === 'code' && <StatInline k="Language" v={currentLang(code.starts, typedCode.current.length)} />}
      </div>

      <div
        class={`typing-box ${mode === 'code' ? 'code' : ''} ${focused ? 'focused' : ''}`}
        ref={boxRef}
        onClick={() => inputRef.current?.focus({ preventScroll: true })}
      >
        <input
          ref={inputRef}
          class="typing-input"
          aria-label={mode === 'code' ? 'Type the code shown' : 'Type the words shown'}
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellcheck={false}
          onInput={(e) => (mode === 'code' ? onCodeInput : onWordsInput)(e.currentTarget as HTMLInputElement)}
          onKeyDown={onKeyDown}
          onPaste={(e) => e.preventDefault()}
          onDrop={(e) => e.preventDefault()}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        <div class="caret" ref={caretRef} aria-hidden="true" data-idle={phase !== 'running'} />
        {mode === 'words' ? (
          <WordsView words={words.current} committed={committed.current} current={current.current} from={firstVisible} />
        ) : (
          <CodeView text={code.text} typed={typedCode.current} />
        )}
        {!focused && (
          <div class="focus-hint" aria-hidden="true">
            <Icon name="typing" /> Click here or start typing
          </div>
        )}
      </div>

      <div class="typing-foot">
        <button type="button" class="btn btn-ghost btn-sm" onClick={() => setSeed((x) => x + 1)} aria-label="Restart test with new text">
          <Icon name="restart" /> Restart
        </button>
        <span class="muted hint">
          <kbd>Tab</kbd> then <kbd>Enter</kbd> or <kbd>Esc</kbd> to restart
          {mode === 'code' ? '. Indentation is filled in for you.' : ''}
        </span>
        <PersonalBest best={best} />
      </div>
    </div>
  );
}

function currentLang(starts: { at: number; lang: string }[], pos: number): string {
  let lang = starts[0]?.lang ?? '';
  for (const s of starts) if (pos >= s.at) lang = s.lang;
  return lang;
}

function WordsView({ words, committed, current, from }: { words: string[]; committed: WordResult[]; current: string; from: number }) {
  const idx = committed.length;
  const out = [];
  for (let i = from; i < Math.min(words.length, from + 80); i++) {
    const target = words[i];
    if (i < idx) {
      const typed = committed[i].typed;
      const wrong = typed !== target;
      out.push(
        <span class={`w done ${wrong ? 'err' : ''}`} data-i={i} key={i}>
          {target.split('').map((ch, j) => (
            <span class={`l ${typed[j] === undefined ? 'miss' : typed[j] === ch ? 'ok' : 'bad'}`} key={j}>{ch}</span>
          ))}
          {typed.length > target.length && typed.slice(target.length).split('').map((ch, j) => <span class="l extra" key={`x${j}`}>{ch}</span>)}
        </span>,
      );
    } else if (i === idx) {
      out.push(
        <span class="w active" data-i={i} key={i}>
          {target.split('').map((ch, j) => (
            <span class={`l ${current[j] === undefined ? '' : current[j] === ch ? 'ok' : 'bad'}`} key={j}>{ch}</span>
          ))}
          {current.length > target.length && current.slice(target.length).split('').map((ch, j) => <span class="l extra" key={`x${j}`}>{ch}</span>)}
        </span>,
      );
    } else {
      out.push(
        <span class="w" data-i={i} key={i}>
          {target.split('').map((ch, j) => <span class="l" key={j}>{ch}</span>)}
        </span>,
      );
    }
  }
  return <div class="words" aria-hidden="true">{out}</div>;
}

function CodeView({ text, typed }: { text: string; typed: string }) {
  const pos = typed.length;
  // Window of lines around the caret.
  const lines = text.split('\n');
  let charIndex = 0;
  let caretLine = 0;
  const lineStarts: number[] = [];
  for (let i = 0; i < lines.length; i++) {
    lineStarts.push(charIndex);
    if (pos >= charIndex && pos <= charIndex + lines[i].length) caretLine = i;
    charIndex += lines[i].length + 1;
  }
  const firstLine = Math.max(0, caretLine - 2);
  const shown = lines.slice(firstLine, firstLine + 9);
  return (
    <pre class="code-text" aria-hidden="true">
      {shown.map((line, li) => {
        const start = lineStarts[firstLine + li];
        const chars = (line + '\n').split('');
        return (
          <div class="code-line" key={firstLine + li}>
            {chars.map((ch, j) => {
              const i = start + j;
              if (i >= text.length + 0 && ch === '\n' && firstLine + li === lines.length - 1) return null;
              let cls = 'c';
              if (i < pos) cls += typed[i] === ch ? ' ok' : ' bad';
              else if (i === pos) cls += ' cur';
              const glyph = ch === '\n' ? (i < pos && typed[i] !== ch ? '⏎' : ' ') : ch;
              return <span class={cls} key={j}>{glyph}</span>;
            })}
          </div>
        );
      })}
    </pre>
  );
}
