// Global site configuration. Update these values before deploying.
export const SITE = {
  name: 'SkillSprint',
  tagline: 'Train Your Mind. Challenge Your Limits.',
  description:
    'Free online skill-training games: typing speed, reaction time, memory, mental math, vocabulary, geography, keyboard shortcuts, logic, color and reading speed. No sign-up required.',
  // Published on the Contact and Privacy pages. Google AdSense reviewers expect a working way to reach you.
  contactEmail: '',
  locale: 'en',
};

// Advertising configuration (Google AdSense).
// 1. Paste your publisher id (ca-pub-XXXXXXXXXXXXXXXX) into `client`. This adds the AdSense verification
//    tag + loader to every page, generates /ads.txt, and switches the Privacy Policy to describe live ads.
// 2. After approval, create ad units in AdSense, paste their slot ids below and set `enabled: true`.
// Empty, labelled placeholders are shown only during development so layouts reserve space for ads.
export const ADS = {
  enabled: false,
  showPlaceholders: import.meta.env.DEV,
  client: '',
  slots: {
    'home-banner': '',
    'category': '',
    'content': '',
    'results': '',
  } as Record<string, string>,
};

/** Publisher id in the form used by ads.txt ("pub-…"). */
export const adsPublisherId = () => ADS.client.replace(/^ca-/, '');
