import type { APIRoute } from 'astro';
import { ADS, adsPublisherId } from '../config/site';

// Authorized Digital Sellers file required by Google AdSense.
// Filled in automatically once ADS.client is set in src/config/site.ts.
export const GET: APIRoute = () => {
  const body = ADS.client
    ? `google.com, ${adsPublisherId()}, DIRECT, f08c47fec0942fa0\n`
    : '# ads.txt: add your AdSense publisher id to src/config/site.ts (ADS.client) to publish your seller line.\n';
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
