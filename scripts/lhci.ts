/**
 * Lighthouse CI a Playwright Chromiumával (nincs külön Chrome-telepítés). Az eredmény a
 * .lighthouseci/ mappába kerül, külső szolgáltatásra nem tölt fel semmit (2.4).
 */
import { spawnSync } from 'node:child_process';
import { chromium } from '@playwright/test';

const result = spawnSync('pnpm', ['exec', 'lhci', 'autorun'], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
  env: { ...process.env, CHROME_PATH: chromium.executablePath() },
});
process.exit(result.status ?? 1);
