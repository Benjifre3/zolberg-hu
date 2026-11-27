/**
 * Befagyasztott elemek őrei (prémium finomítás, 2. és 8. szakasz). Minden teszt a v1-approved
 * buildet (pnpm baseline → .baseline/dist, 8790) veti össze az új builddel (8788).
 *
 * - Szerkezet-őr: szekciók sorrendje, címsorok, látható szöveg, linkek, képforrások, mezők.
 * - Arculat-őr: betű- és színadatok minden szöveges elemen, a 11 színtoken értéke.
 * - Vizuális őr: csökkentett mozgás + textúra nélkül ≤ 0,5% képpont-eltérés 390/834/1440 px-en.
 */
import { test, expect } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { PAGES } from '../pages.ts';
import { VIEWPORTS } from '../../playwright.config.ts';
import {
  NEW,
  OLD,
  open,
  comparePng,
  extractStructure,
  extractStyles,
  COLOR_TOKENS,
} from './helpers.ts';

const MAX_DIFF = 0.005;

test.beforeAll(async ({ request }) => {
  const r = await request.get(`${OLD}/`);
  expect(r.status(), 'nincs baseline-build: futtasd a `pnpm baseline` parancsot').toBe(200);
});

for (const { path, name } of PAGES) {
  test.describe(name, () => {
    for (const motion of ['reduce', 'no-preference'] as const) {
      test(`szerkezet változatlan (mozgás: ${motion})`, async ({ page }) => {
        await page.setViewportSize(VIEWPORTS.desktop);
        await open(page, OLD + path, { reducedMotion: motion });
        const before = await page.evaluate(extractStructure);
        await open(page, NEW + path, { reducedMotion: motion });
        const after = await page.evaluate(extractStructure);
        expect(after).toEqual(before);
      });
    }

    test('arculat változatlan (betűk, színek, tokenek)', async ({ page }) => {
      for (const vp of Object.values(VIEWPORTS)) {
        await page.setViewportSize(vp);
        await open(page, OLD + path);
        const before = await page.evaluate(extractStyles, COLOR_TOKENS);
        await open(page, NEW + path);
        const after = await page.evaluate(extractStyles, COLOR_TOKENS);
        expect(after.tokens).toEqual(before.tokens);
        expect(after.runs, `${vp.width} px`).toEqual(before.runs);
      }
    });

    for (const [vpName, vp] of Object.entries(VIEWPORTS)) {
      test(`képpontra egyezik textúra nélkül @ ${vpName}`, async ({ page }, info) => {
        await page.setViewportSize(vp);
        const shot = () =>
          page.screenshot({ fullPage: true, animations: 'disabled', caret: 'hide' });
        await open(page, OLD + path, { polish: false });
        const before = await shot();
        await open(page, NEW + path, { polish: false });
        const after = await shot();
        const diff = await comparePng(before, after);
        if (diff.diffPng || !diff.sameSize) {
          const dir = info.outputPath();
          mkdirSync(dir, { recursive: true });
          writeFileSync(`${dir}/before.png`, before);
          writeFileSync(`${dir}/after.png`, after);
          if (diff.diffPng) writeFileSync(`${dir}/diff.png`, diff.diffPng);
        }
        expect(diff.sameSize, 'az oldal mérete eltér a baseline-tól').toBe(true);
        expect(diff.ratio, `eltérő képpontok aránya (${vpName})`).toBeLessThanOrEqual(MAX_DIFF);
      });
    }
  });
}
