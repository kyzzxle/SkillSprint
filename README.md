# SkillSprint

**Train Your Mind. Challenge Your Limits.**

SkillSprint is a free, account-free skill-training website with 10 categories of interactive games. Scores, streaks and preferences are saved in the visitor's browser (localStorage) only.

## Categories and games

| Category | URL | Games |
| --- | --- | --- |
| Typing Speed | `/typing/` | Typing Speed Test (15/30/60/120 s, 3 difficulties, punctuation, numbers, code mode), Code Typing Test (`/typing/code/`) |
| Reaction Time | `/reaction-time/` | Reaction Time Test (5 or 10 rounds, early-click detection, avg/fastest/slowest/median) |
| Memory | `/memory/` | Sequence Memory, Number Memory (`/memory/number-memory/`), Memory Grid (`/memory/memory-grid/`) |
| Mental Math | `/math/` | Mental Math Sprint: + − × ÷, fractions, percentages, roots & powers; easy/medium/hard; timed or untimed |
| Vocabulary & Spelling | `/vocabulary/` | Vocabulary Quiz (definitions, synonyms, antonyms; choice or typing), Spelling Challenge (`/vocabulary/spelling/`) |
| Geography | `/geography/` | Mixed quiz plus Flag (`/flags/`), Capitals (`/capitals/`) and World Map (`/map/`) quizzes, and continent questions |
| Keyboard Shortcuts | `/keyboard-shortcuts/` | Quiz for Windows, macOS, VS Code, Excel, Google Sheets (practice + timed) and reference sheets (`/reference/`) |
| Logic & Reasoning | `/logic/` | Sequences, missing numbers, patterns, odd-one-out, word problems, deduction; difficulty rises during a round |
| Color Recognition | `/color/` | Color Challenge (RGB, HEX, complementary), Color Match with RGB/HSL sliders (`/color/color-match/`) |
| Reading Speed | `/reading/` | Six original passages (3 levels), WPM + comprehension questions |

Also: Daily Challenge (`/daily/`), statistics (`/stats/`), all games (`/games/`), About, Contact, Privacy Policy, Terms, 404, `robots.txt` and an auto-generated sitemap.

## Tech stack

- [Astro](https://astro.build) 7 — static HTML for every page (fast, SEO-friendly)
- [Preact](https://preactjs.com) islands — only the game on a page is hydrated
- TypeScript (strict), plain CSS with design tokens (no CSS framework)
- Self-hosted fonts via Fontsource (Space Grotesk, JetBrains Mono)
- Vitest for unit tests
- Assets: flags from [flag-icons](https://github.com/lipis/flag-icons) (MIT), map outlines from [Natural Earth](https://www.naturalearthdata.com/) via world-atlas (public domain). Licences are in `public/flags/` and `public/data/`.

## Getting started

Requires a Node.js version supported by Astro 7 (see `node_modules/astro/package.json` → `engines`; developed on Node 24).

```bash
npm install
```

```bash
npm run dev
```

Open http://localhost:4321.

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server with hot reload |
| `npm run check` | Type-check all `.astro`, `.ts` and `.tsx` files |
| `npm test` | Run unit tests (scoring, generators, colour maths, daily seeding, data integrity) |
| `npm run build` | Type-check, then build the static site into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run assets` | Re-generate `public/flags/` and `public/data/world-110m.json` (only needed if `src/data/countries.ts` changes) |

`scripts/make-images.ps1` regenerates the social image and PNG icons (Windows PowerShell).

## Deploying

The build output in `dist/` is a fully static site and can be hosted anywhere (Netlify, Vercel, Cloudflare Pages, GitHub Pages, S3 + CloudFront, nginx…).

1. **Set your domain** — canonical URLs, social tags, `robots.txt` and the sitemap use `SITE_URL`:
   ```bash
   SITE_URL=https://www.your-domain.com npm run build
   ```
   (or change the default in `astro.config.mjs`).
2. Upload `dist/`. Typical host settings: build command `npm run build`, output directory `dist`.
3. Serve `404.html` for unknown paths (most static hosts do this automatically).

## Before going live — checklist

- `src/config/site.ts`: set `contactEmail` (the Contact page shows a neutral message until you do).
- `SITE_URL` as described above.
- **AdSense**: ad placeholders are reserved on the homepage, category/game pages (below the game, never inside controls), content pages and results screens. To enable real ads: set `ADS.enabled = true`, `ADS.client` and the slot ids in `src/config/site.ts`, add the AdSense loader `<script>` to `src/layouts/BaseLayout.astro`, set `ADS.showPlaceholders = false` if you want empty slots hidden, and **update the Privacy Policy** (and add a consent mechanism where required) before ads go live. Ads are never rendered during an active game: the results-screen slot only mounts after a game ends.

## Project structure

```
src/
  config/site.ts          Site name, contact email, ad configuration
  data/                   Catalog (categories/games), countries, vocabulary, shortcuts, passages, typing words, icons
  lib/                    random (seeded RNG), date helpers, storage (localStorage API)
  styles/global.css       Design tokens (dark/light), layout and shared component styles
  components/
    ui/                   Shared game components: SetupPanel, Countdown, ResultsPanel, PersonalBest,
                          Progress, Segmented selector, ReviewList, ConfirmDialog, EmptyState, AdSlot,
                          QuizRunner (question flow) and QuizGame (setup → play → results), hooks (timers, prefs)
    Header/Footer/SiteSearch/HomeWidgets/StatsDashboard, AdSlot.astro, Icon.astro
  games/<category>/       Each game's logic (pure .ts, unit tested) + UI (.tsx) + CSS, isolated per game
  layouts/                BaseLayout (SEO, theme), GameLayout (game page + guide + FAQ + JSON-LD), PageLayout
  pages/                  One file per URL
scripts/                  Asset preparation scripts
tests/                    Vitest unit tests
public/                   Flags, map data, icons, social image
```

## How things are measured

- **Typing WPM**: characters of correctly typed words (plus their spaces) ÷ 5 ÷ minutes; raw WPM counts all typed characters; accuracy is per keystroke (corrected mistakes still count). Code mode excludes auto-inserted indentation.
- **Reaction time**: `performance`-clock timestamp of the animation frame that paints the green screen to the pointer/key event timestamp.
- **Color Match**: CIEDE2000 ΔE between target and guess (verified against published test data); accuracy = 100 − 2 × ΔE, floored at 0.
- **Reading speed**: passage word count ÷ reading minutes. Results are saved only with ≥ 75% comprehension.
- **Daily Challenge**: 10 questions generated from a seed of the visitor's local calendar date (captured once per page load). First attempt counts; streak = consecutive days completed.

## Known limitations

- Statistics are per browser and per device; there is no sync (by design — no accounts).
- Reaction times include display and input-device latency that a web page cannot measure.
- Code typing mode is designed for physical keyboards; some Android keyboards do not report Backspace reliably when the input is empty.
- Keyboard-shortcut questions are multiple choice rather than "press the keys", because many real shortcuts (Alt+F4, Cmd+Q, Win+L…) are intercepted by the OS/browser and could close the tab.
- The world map uses 1:110m Natural Earth data, so very small countries (e.g. Singapore) are excluded from map questions (they still appear in flag/capital questions).
- Colour games depend on colour vision and screen calibration.
- Question banks are original but finite (≈70 vocabulary words, 30 spelling words, 131 countries, ~100 shortcuts, 25 deduction puzzles, 6 passages); math, logic sequences/patterns and colour questions are generated without limit.
