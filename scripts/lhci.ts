/**
 * Lighthouse CI a Playwright Chromiumával (nincs külön Chrome-telepítés). Az eredmény a
 * .lighthouseci/ mappába kerül, külső szolgáltatásra nem tölt fel semmit (2.4).
 *
 *   pnpm test:lh                         → helyi dist/ (lighthouserc.json; LCP ≤ 2,1 s, D-037)
 *   pnpm test:lh -- --preview <URL>      → Cloudflare Pages előnézet (lighthouserc.preview.json;
 *                                          a specifikáció 1,8 s-os LCP-határával, Q8)
 */
import { spawnSync } from 'node:child_process';
import { chromium } from '@playwright/test';

const args = process.argv.slice(2);
const i = args.indexOf('--preview');
const previewUrl = i >= 0 ? args[i + 1] : undefined;
if (i >= 0 && !previewUrl?.startsWith('https://')) {
  console.error('Használat: pnpm test:lh -- --preview https://<ág>.<projekt>.pages.dev/');
  process.exit(2);
}

const lhciArgs = previewUrl
  ? ['exec', 'lhci', 'autorun', '--config=lighthouserc.preview.json', `--collect.url=${previewUrl}`]
  : ['exec', 'lhci', 'autorun'];

const result = spawnSync('pnpm', lhciArgs, {
  stdio: 'inherit',
  shell: process.platform === 'win32',
  env: { ...process.env, CHROME_PATH: chromium.executablePath() },
});
process.exit(result.status ?? 1);
