// Central catalog of categories and game pages. Used for navigation, search, SEO pages,
// the statistics page and homepage widgets. Keep this file free of browser-only code.

export type CategoryId =
  | 'typing' | 'reaction' | 'memory' | 'math' | 'vocabulary'
  | 'geography' | 'shortcuts' | 'logic' | 'color' | 'reading';

export interface Category {
  id: CategoryId;
  name: string;
  url: string;
  tagline: string;
  description: string;
  keywords: string[];
}

export interface GamePage {
  /** Unique page id */
  id: string;
  /** Storage id for scores. Several pages may share one (e.g. geography modes). */
  gameId: string;
  category: CategoryId;
  name: string;
  url: string;
  short: string;
  keywords: string[];
  /** The page that hosts the category's flagship game */
  flagship?: boolean;
  featured?: boolean;
}

export const CATEGORIES: Category[] = [
  {
    id: 'typing', name: 'Typing Speed', url: '/typing/',
    tagline: 'Measure your WPM and accuracy.',
    description: 'Timed typing tests with live WPM, accuracy tracking, punctuation, numbers and code modes.',
    keywords: ['typing', 'wpm', 'words per minute', 'keyboard', 'typing test', 'code'],
  },
  {
    id: 'reaction', name: 'Reaction Time', url: '/reaction-time/',
    tagline: 'How fast can you respond?',
    description: 'Click the moment the screen changes colour. Precise millisecond timing over 5 or 10 rounds.',
    keywords: ['reaction', 'reflex', 'speed', 'milliseconds', 'click test'],
  },
  {
    id: 'memory', name: 'Memory Training', url: '/memory/',
    tagline: 'Sequences, numbers and grids.',
    description: 'Three progressively harder memory games: sequence memory, number memory and the memory grid.',
    keywords: ['memory', 'sequence', 'number memory', 'visual memory', 'grid', 'brain training'],
  },
  {
    id: 'math', name: 'Mental Math', url: '/math/',
    tagline: 'Arithmetic at speed.',
    description: 'Addition to exponents, fractions and percentages — timed sprints or relaxed practice.',
    keywords: ['math', 'arithmetic', 'mental math', 'multiplication', 'fractions', 'percentages', 'square roots'],
  },
  {
    id: 'vocabulary', name: 'Vocabulary & Spelling', url: '/vocabulary/',
    tagline: 'Know your words.',
    description: 'Definitions, synonyms, antonyms, spelling and missing-letter puzzles with explanations.',
    keywords: ['vocabulary', 'spelling', 'synonyms', 'antonyms', 'english', 'words', 'definitions'],
  },
  {
    id: 'geography', name: 'Geography Challenge', url: '/geography/',
    tagline: 'Flags, capitals and maps.',
    description: 'Identify countries by flag and map location, name capitals and place countries on continents.',
    keywords: ['geography', 'flags', 'capitals', 'countries', 'map quiz', 'continents', 'world'],
  },
  {
    id: 'shortcuts', name: 'Keyboard Shortcuts', url: '/keyboard-shortcuts/',
    tagline: 'Work faster with your keyboard.',
    description: 'Learn Windows, macOS, VS Code, Excel and Google Sheets shortcuts through quizzes and practice.',
    keywords: ['keyboard shortcuts', 'hotkeys', 'windows', 'mac', 'vs code', 'excel', 'google sheets', 'productivity'],
  },
  {
    id: 'logic', name: 'Logic & Reasoning', url: '/logic/',
    tagline: 'Patterns, sequences and deduction.',
    description: 'Number sequences, missing numbers, patterns and deduction puzzles — each with a clear explanation.',
    keywords: ['logic', 'puzzles', 'reasoning', 'number sequence', 'pattern', 'iq', 'deduction'],
  },
  {
    id: 'color', name: 'Color Recognition', url: '/color/',
    tagline: 'Train your eye for colour.',
    description: 'Guess RGB and HEX values, match colours with sliders and find complementary colours.',
    keywords: ['color', 'colour', 'rgb', 'hex', 'design', 'complementary', 'color match'],
  },
  {
    id: 'reading', name: 'Reading Speed', url: '/reading/',
    tagline: 'Read faster, understand more.',
    description: 'Timed reading passages with words-per-minute measurement and comprehension questions.',
    keywords: ['reading', 'reading speed', 'wpm', 'comprehension', 'speed reading'],
  },
];

export const GAMES: GamePage[] = [
  { id: 'typing', gameId: 'typing', category: 'typing', name: 'Typing Speed Test', url: '/typing/', flagship: true, featured: true,
    short: 'Timed 15–120 second tests with live WPM and accuracy.', keywords: ['monkeytype', 'speed test', 'wpm test'] },
  { id: 'typing-code', gameId: 'typing-code', category: 'typing', name: 'Code Typing Test', url: '/typing/code/',
    short: 'Type real-looking code snippets: brackets, symbols and indentation.', keywords: ['programming', 'code', 'developer'] },

  { id: 'reaction', gameId: 'reaction', category: 'reaction', name: 'Reaction Time Test', url: '/reaction-time/', flagship: true, featured: true,
    short: 'Wait for green, then click. Average of 5 or 10 rounds.', keywords: ['reaction test', 'reflex test'] },

  { id: 'sequence-memory', gameId: 'sequence-memory', category: 'memory', name: 'Sequence Memory', url: '/memory/', flagship: true, featured: true,
    short: 'Watch the tiles light up and repeat the growing pattern.', keywords: ['simon', 'pattern memory'] },
  { id: 'number-memory', gameId: 'number-memory', category: 'memory', name: 'Number Memory', url: '/memory/number-memory/',
    short: 'Memorise a number before it disappears. One digit longer each level.', keywords: ['digit span', 'numbers'] },
  { id: 'memory-grid', gameId: 'memory-grid', category: 'memory', name: 'Memory Grid', url: '/memory/memory-grid/',
    short: 'Remember which tiles were highlighted as the grid grows.', keywords: ['visual memory', 'tiles'] },

  { id: 'math', gameId: 'math', category: 'math', name: 'Mental Math Sprint', url: '/math/', flagship: true, featured: true,
    short: 'Pick your operations and difficulty, then race the clock.', keywords: ['math game', 'arithmetic test'] },

  { id: 'vocabulary', gameId: 'vocabulary', category: 'vocabulary', name: 'Vocabulary Quiz', url: '/vocabulary/', flagship: true,
    short: 'Guess words from definitions, synonyms and antonyms.', keywords: ['word quiz', 'definitions'] },
  { id: 'spelling', gameId: 'spelling', category: 'vocabulary', name: 'Spelling Challenge', url: '/vocabulary/spelling/',
    short: 'Pick or type the correct spelling and solve missing-letter puzzles.', keywords: ['spelling test', 'missing letters'] },

  { id: 'geography', gameId: 'geography', category: 'geography', name: 'Geography Quiz', url: '/geography/', flagship: true, featured: true,
    short: 'Mixed flags, capitals, map and continent questions.', keywords: ['world quiz'] },
  { id: 'geography-flags', gameId: 'geography', category: 'geography', name: 'Flag Quiz', url: '/geography/flags/',
    short: 'Name the country from its flag.', keywords: ['flags quiz', 'country flags'] },
  { id: 'geography-capitals', gameId: 'geography', category: 'geography', name: 'Capital Cities Quiz', url: '/geography/capitals/',
    short: 'Match countries with their capital cities.', keywords: ['capitals quiz'] },
  { id: 'geography-map', gameId: 'geography', category: 'geography', name: 'World Map Quiz', url: '/geography/map/',
    short: 'Identify the highlighted country on a world map.', keywords: ['map quiz', 'locate countries'] },

  { id: 'shortcuts', gameId: 'shortcuts', category: 'shortcuts', name: 'Keyboard Shortcut Quiz', url: '/keyboard-shortcuts/', flagship: true,
    short: 'Windows, macOS, VS Code, Excel and Google Sheets — guess the combination.', keywords: ['hotkey quiz'] },
  { id: 'shortcuts-reference', gameId: 'shortcuts', category: 'shortcuts', name: 'Shortcut Reference Sheets', url: '/keyboard-shortcuts/reference/',
    short: 'Browse every shortcut in the quiz with a plain-English explanation.', keywords: ['cheat sheet', 'reference'] },

  { id: 'logic', gameId: 'logic', category: 'logic', name: 'Logic Puzzles', url: '/logic/', flagship: true, featured: true,
    short: 'Sequences, missing numbers, patterns and deduction with explanations.', keywords: ['brain teasers', 'iq puzzles'] },

  { id: 'color', gameId: 'color', category: 'color', name: 'Color Challenge', url: '/color/', flagship: true,
    short: 'Guess RGB and HEX codes and spot complementary colours.', keywords: ['hex quiz', 'rgb quiz'] },
  { id: 'color-match', gameId: 'color-match', category: 'color', name: 'Color Match', url: '/color/color-match/', featured: true,
    short: 'Recreate a target colour with RGB or HSL sliders and see your accuracy.', keywords: ['color picker game', 'sliders'] },

  { id: 'reading', gameId: 'reading', category: 'reading', name: 'Reading Speed Test', url: '/reading/', flagship: true,
    short: 'Read a passage, measure your WPM, then answer comprehension questions.', keywords: ['reading test', 'speed reading test'] },
];

/** How each storage game id compares scores and what its unit is. */
export const SCORE_RULES: Record<string, { better: 'higher' | 'lower'; unit: string; label: string }> = {
  typing: { better: 'higher', unit: 'WPM', label: 'Typing Speed Test' },
  'typing-code': { better: 'higher', unit: 'WPM', label: 'Code Typing Test' },
  reaction: { better: 'lower', unit: 'ms', label: 'Reaction Time Test' },
  'sequence-memory': { better: 'higher', unit: 'level', label: 'Sequence Memory' },
  'number-memory': { better: 'higher', unit: 'digits', label: 'Number Memory' },
  'memory-grid': { better: 'higher', unit: 'level', label: 'Memory Grid' },
  math: { better: 'higher', unit: 'pts', label: 'Mental Math Sprint' },
  vocabulary: { better: 'higher', unit: 'pts', label: 'Vocabulary Quiz' },
  spelling: { better: 'higher', unit: 'pts', label: 'Spelling Challenge' },
  geography: { better: 'higher', unit: 'pts', label: 'Geography Quiz' },
  shortcuts: { better: 'higher', unit: 'pts', label: 'Keyboard Shortcut Quiz' },
  logic: { better: 'higher', unit: 'pts', label: 'Logic Puzzles' },
  color: { better: 'higher', unit: 'pts', label: 'Color Challenge' },
  'color-match': { better: 'higher', unit: '%', label: 'Color Match' },
  reading: { better: 'higher', unit: 'WPM', label: 'Reading Speed Test' },
  daily: { better: 'higher', unit: 'pts', label: 'Daily Challenge' },
};

export const categoryById = (id: CategoryId): Category => CATEGORIES.find((c) => c.id === id)!;
export const gamesInCategory = (id: CategoryId): GamePage[] => GAMES.filter((g) => g.category === id);
export const gameById = (id: string): GamePage | undefined => GAMES.find((g) => g.id === id);
/** Primary page for a storage game id */
export const pageForGameId = (gameId: string): GamePage | undefined =>
  GAMES.find((g) => g.gameId === gameId && (g.flagship || g.id === gameId)) ?? GAMES.find((g) => g.gameId === gameId);
