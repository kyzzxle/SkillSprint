// Global site configuration. Update these values before deploying.
export const SITE = {
  name: 'SkillSprint',
  tagline: 'Train Your Mind. Challenge Your Limits.',
  description:
    'Free online skill-training games: typing speed, reaction time, memory, mental math, vocabulary, geography, keyboard shortcuts, logic, color and reading speed. No sign-up required.',
  // Shown on the Contact page. Leave empty until you have a real address to publish.
  contactEmail: '',
  locale: 'en',
};

// Advertising configuration (Google AdSense-ready).
// While `enabled` is false, <AdSlot> renders clearly-labelled empty placeholders (when `showPlaceholders` is true)
// so layouts reserve space and do not shift once real ad units are added.
// To go live: set enabled=true, set `client` to your ca-pub-XXXXXXXX id, map slot ids below,
// add the AdSense loader script in BaseLayout, and update the Privacy Policy accordingly.
export const ADS = {
  enabled: false,
  showPlaceholders: true,
  client: '',
  slots: {
    'home-banner': '',
    'category': '',
    'content': '',
    'results': '',
  } as Record<string, string>,
};
