/**
 * A munkák képernyőképei (master prompt 5.): a content/portfolio.yaml munkáinak élő oldaláról
 * Playwrighttal, 1440×900 és 390×844 nézetből, csökkentett mozgással, a hajtás feletti részről.
 *
 *   pnpm shots                    → minden munka, amelynek van live_url-je
 *   pnpm shots -- --only <id>     → csak egy munka
 *   pnpm shots -- --suffix elotte → „előtte” kép (pl. a régi oldal archív URL-jéről --url-lel)
 *   pnpm shots -- --only <id> --url <URL> --suffix elotte
 *
 * A kimenet: content/works/<id>-1440.png, <id>-390.png (vagy <id>-<suffix>.png, csak asztali).
 * A sütibannereket a szkript nem kattintja el: ha takar, készítsd el kézzel ugyanebben a
 * méretben, és írd be a fájlnevet a portfolio.yaml-ba.
 */
import { readFileSync, mkdirSync } from 'node:fs';
import { parse } from 'yaml';
import { chromium } from '@playwright/test';
import { contentPath } from '../src/lib/content.ts';

const args = process.argv.slice(2);
const arg = (name: string) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};
const only = arg('only');
const urlOverride = arg('url');
const suffix = arg('suffix');

interface RawWork {
  id: string;
  live_url?: string;
}
const works = (
  (parse(readFileSync(contentPath('portfolio.yaml'), 'utf8')) ?? []) as RawWork[]
).filter((w) => w.live_url && (!only || w.id === only));
if (!works.length) {
  console.error(
    only ? `Nincs ilyen munka: ${only}` : 'A portfolio.yaml-ban nincs munka live_url-lel.',
  );
  process.exit(1);
}

const views = suffix
  ? [{ name: suffix, viewport: { width: 1440, height: 900 } }]
  : [
      { name: '1440', viewport: { width: 1440, height: 900 } },
      { name: '390', viewport: { width: 390, height: 844 } },
    ];

mkdirSync(contentPath('works'), { recursive: true });
const browser = await chromium.launch();
for (const w of works) {
  for (const v of views) {
    const page = await browser.newPage({
      viewport: v.viewport,
      deviceScaleFactor: 1,
      reducedMotion: 'reduce',
      locale: 'hu-HU',
      isMobile: v.viewport.width < 600,
      hasTouch: v.viewport.width < 600,
    });
    const url = urlOverride ?? w.live_url ?? '';
    try {
      await page.goto(url, { waitUntil: 'load', timeout: 45_000 });
      await page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => undefined);
      await page.evaluate(() => document.fonts.ready);
      const file = contentPath('works', `${w.id}-${v.name}.png`);
      await page.screenshot({ path: file, animations: 'disabled' });
      console.log(`OK   ${w.id}-${v.name}.png  ← ${url}`);
    } catch (e) {
      console.error(`HIBA ${w.id} (${v.name}): ${(e as Error).message.split('\n')[0]}`);
      process.exitCode = 1;
    } finally {
      await page.close();
    }
  }
}
await browser.close();
