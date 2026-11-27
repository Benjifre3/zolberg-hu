import { defineConfig, devices } from '@playwright/test';

const PORT = 8788;
const BASELINE_PORT = 8796;
const CI = !!process.env['CI'];

/** Töréspontok (master prompt 8.) */
export const VIEWPORTS = {
  mobile: { width: 390, height: 844 },
  tablet: { width: 834, height: 1112 },
  desktop: { width: 1440, height: 900 },
} as const;

export default defineConfig({
  testDir: 'tests',
  fullyParallel: true,
  forbidOnly: CI,
  retries: CI ? 1 : 0,
  reporter: CI ? [['github'], ['html', { open: 'never' }]] : [['list']],
  use: {
    baseURL: `http://localhost:${PORT}`,
    locale: 'hu-HU',
    trace: 'retain-on-failure',
  },
  // D-014: az alapképek Linuxon (CI) készülnek; a platform a fájlnév része.
  snapshotPathTemplate: '{testDir}/visual/__screenshots__/{arg}-{projectName}-{platform}{ext}',
  expect: {
    toHaveScreenshot: { maxDiffPixelRatio: 0.002, animations: 'disabled', caret: 'hide' },
  },
  projects: [
    {
      name: 'e2e',
      testMatch: /e2e\/.*\.spec\.ts/,
      testIgnore: /\.mobile\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'e2e-mobile',
      testMatch: /e2e\/.*\.mobile\.spec\.ts/,
      use: { ...devices['Pixel 7'] },
    },
    { name: 'a11y', testMatch: /a11y\/.*\.spec\.ts/, use: { ...devices['Desktop Chrome'] } },
    { name: 'visual', testMatch: /visual\/.*\.spec\.ts/, use: { ...devices['Desktop Chrome'] } },
    // Prémium finomítás: a v1-approved és az új build összevetése (tests/guard, pnpm baseline).
    { name: 'guard', testMatch: /guard\/.*\.spec\.ts/, use: { ...devices['Desktop Chrome'] } },
  ],
  // A Cloudflare Pages helyi futtatókörnyezete: statikus fájlok + a /api/contact függvény.
  // A levélküldés dry-run módban fut (src/server/mailer.ts).
  webServer: [
    {
      command: `pnpm exec wrangler pages dev dist --port ${PORT} --binding EMAIL_PROVIDER=dry-run`,
      env: { WRANGLER_SEND_METRICS: 'false' },
      url: `http://localhost:${PORT}`,
      reuseExistingServer: !CI,
      timeout: 60_000,
    },
    // A v1-approved baseline-build (scripts/baseline.ts). Hiányában 503-at ad, csak az őr bukik.
    {
      command: `node scripts/serve-static.ts .baseline/dist ${BASELINE_PORT}`,
      url: `http://localhost:${BASELINE_PORT}/__health`,
      reuseExistingServer: !CI,
      timeout: 30_000,
    },
  ],
});
