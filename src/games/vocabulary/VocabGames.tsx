import { defaultRng } from '../../lib/random';
import { Segmented } from '../../components/ui';
import { QuizGame, MODE_OPTIONS } from '../../components/ui/QuizGame';
import { usePrefs } from '../../components/ui/hooks';
import { spellingQuestion, vocabQuestion, type AnswerStyle, type Level, type SpellMode, type VocabMode } from './questions';
import './vocab.css';

const LEVELS = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
] as const;
const TOTAL = 10;
const SECS = 60;

export function VocabQuiz() {
  const [p, set] = usePrefs('vocabulary', { mode: 'mixed', level: 'easy', style: 'choice', run: 'count' });
  const mode = p.mode as VocabMode;
  // Typing answers only make sense when there is exactly one correct word (definition questions).
  const style: AnswerStyle = mode === 'definition' ? (p.style as AnswerStyle) : 'choice';
  const timed = p.run === 'timed';
  const variant = `${mode} · ${p.level} · ${style === 'typing' ? 'typing' : 'multiple choice'} · ${timed ? `${SECS}s` : `${TOTAL} questions`}`;
  return (
    <QuizGame
      gameId="vocabulary"
      url="/vocabulary/"
      title="Vocabulary Quiz"
      subtitle="Definitions, synonyms and antonyms — with an explanation for every word."
      variant={variant}
      timed={timed}
      total={TOTAL}
      timeLimitSec={SECS}
      createRun={() => {
        const seen = new Set<string>();
        return (i) => vocabQuestion(defaultRng, mode, p.level as Level, style, `v${i}`, seen);
      }}
      instructions={[
        'Definition: pick (or type) the word that matches the definition.',
        'Synonym: pick the word closest in meaning. Antonym: pick the word most nearly opposite.',
        'Press 1–4 to answer quickly. Each answer shows the word’s meaning and related words.',
      ]}
      settings={
        <>
          <Segmented label="Question type" value={mode} onChange={(v) => set({ mode: v })}
            options={[{ value: 'mixed', label: 'Mixed' }, { value: 'definition', label: 'Definitions' }, { value: 'synonym', label: 'Synonyms' }, { value: 'antonym', label: 'Antonyms' }]} />
          <Segmented label="Difficulty" value={p.level} onChange={(v) => set({ level: v })} options={[...LEVELS]} />
          {mode === 'definition' && (
            <Segmented label="Answer with" value={p.style} onChange={(v) => set({ style: v })}
              options={[{ value: 'choice', label: 'Multiple choice' }, { value: 'typing', label: 'Typing' }]} />
          )}
          <Segmented label="Length" value={p.run} onChange={(v) => set({ run: v })} options={MODE_OPTIONS(TOTAL, SECS)} />
        </>
      }
    />
  );
}

export function SpellingChallenge() {
  const [p, set] = usePrefs('spelling', { mode: 'choose', level: 'easy', style: 'choice', run: 'count' });
  const mode = p.mode as SpellMode;
  const style: AnswerStyle = mode === 'fix' ? 'typing' : mode === 'choose' ? 'choice' : (p.style as AnswerStyle);
  const timed = p.run === 'timed';
  const label = { choose: 'correct spelling', fix: 'fix the spelling', missing: 'missing letters' }[mode];
  const variant = `${label} · ${p.level} · ${style === 'typing' ? 'typing' : 'multiple choice'} · ${timed ? `${SECS}s` : `${TOTAL} questions`}`;
  return (
    <QuizGame
      gameId="spelling"
      url="/vocabulary/spelling/"
      title="Spelling Challenge"
      subtitle="Master the words people most often get wrong."
      variant={variant}
      timed={timed}
      total={TOTAL}
      timeLimitSec={SECS}
      createRun={() => {
        const seen = new Set<string>();
        return (i) => spellingQuestion(defaultRng, mode, p.level as Level, style, `s${i}`, seen);
      }}
      instructions={[
        'Correct spelling: choose the one correctly spelled word among four options.',
        'Fix the spelling: a misspelled word is shown — type it correctly.',
        'Missing letters: fill the gaps. The meaning is shown so there is only one right word.',
        'Every answer comes with a memory tip.',
      ]}
      settings={
        <>
          <Segmented label="Challenge" value={mode} onChange={(v) => set({ mode: v })}
            options={[{ value: 'choose', label: 'Correct spelling' }, { value: 'fix', label: 'Fix the spelling' }, { value: 'missing', label: 'Missing letters' }]} />
          <Segmented label="Difficulty" value={p.level} onChange={(v) => set({ level: v })} options={[...LEVELS]} />
          {mode === 'missing' && (
            <Segmented label="Answer with" value={p.style} onChange={(v) => set({ style: v })}
              options={[{ value: 'choice', label: 'Multiple choice' }, { value: 'typing', label: 'Typing' }]} />
          )}
          <Segmented label="Length" value={p.run} onChange={(v) => set({ run: v })} options={MODE_OPTIONS(TOTAL, SECS)} />
        </>
      }
    />
  );
}
