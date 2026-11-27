/**
 * Dokumentációs képek (nem teszt): csak CAPTURE=baseline vagy CAPTURE=polish esetén fut.
 *
 *   CAPTURE=baseline → docs/baseline/: a v1-approved képei, szerkezete és stílusai
 *   CAPTURE=polish   → docs/polish/: az új build képei textúrával és textúra nélkül
 */
import { test, type Page } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { VIEWPORTS } from '../../playwright.config.ts';
import { NEW, OLD, open, extractStructure, extractStyles, COLOR_TOKENS } from './helpers.ts';

const mode = process.env['CAPTURE'];
test.skip(mode !== 'baseline' && mode !== 'polish', 'csak CAPTURE=baseline|polish esetén');

const shot = (page: Page) =>
  page.screenshot({ fullPage: true, animations: 'disabled', caret: 'hide' });

test('képek és adatok mentése', async ({ page }) => {
  test.setTimeout(120_000);
  const dir = mode === 'baseline' ? 'docs/baseline' : 'docs/polish';
  mkdirSync(dir, { recursive: true });
  for (const [vpName, vp] of Object.entries(VIEWPORTS)) {
    await page.setViewportSize(vp);
    if (mode === 'baseline') {
      await open(page, `${OLD}/`);
      writeFileSync(`${dir}/fooldal-${vpName}-${vp.width}.png`, await shot(page));
      if (vpName === 'desktop') {
        const data = {
          ref: 'v1-approved',
          structure: await page.evaluate(extractStructure),
          styles: await page.evaluate(extractStyles, COLOR_TOKENS),
        };
        writeFileSync(`${dir}/fooldal-dom.json`, `${JSON.stringify(data, null, 2)}\n`);
      }
    } else {
      await open(page, `${NEW}/`);
      writeFileSync(`${dir}/fooldal-${vpName}-${vp.width}-textura.png`, await shot(page));
      await open(page, `${NEW}/`, { polish: false });
      writeFileSync(`${dir}/fooldal-${vpName}-${vp.width}-textura-nelkul.png`, await shot(page));
    }
  }
});
