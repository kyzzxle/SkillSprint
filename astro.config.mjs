// @ts-check
import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';

// Set SITE_URL to your production domain before deploying (used for canonical URLs, sitemap and social tags).
const site = process.env.SITE_URL || 'https://skillsprint.example.com';

export default defineConfig({
  site,
  trailingSlash: 'always',
  integrations: [preact(), sitemap({ filter: (page) => !page.includes('/404') })],
  build: { format: 'directory' },
});
