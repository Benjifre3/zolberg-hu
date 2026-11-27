/**
 * Dokumentációs képek (nem teszt): csak CAPTURE=baseline vagy CAPTURE=polish esetén fut.
 *
 *   CAPTURE=baseline → docs/baseline/: a v1-approved képei, szerkezete és stílusai
 *   CAPTURE=polish   → docs/polish/: az új build teljes oldala textúrával (390/834/1440), és
 *                      előtte/utána részletképek a textúrákról (1440 px, 1:1)
 */
import { test, type Page } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import sharp from 'sharp';
import { VIEWPORTS } from '../../playwright.config.ts';
import { NEW, OLD, open, extractStructure, extractStyles, COLOR_TOKENS } from './helpers.ts';

const mode = process.env['CAPTURE'];
test.skip(mode !== 'baseline' && mode !== 'polish', 'csak CAPTURE=baseline|polish esetén');

const shot = (page: Page) =>
  page.screenshot({ fullPage: true, animations: 'disabled', caret: 'hide' });

/** Részletek a textúrákhoz: a szelektor elemének teteje körüli 1440×640-es sáv. */
const DETAILS = [
  ['hero', '.hero'],
  ['bizonyitek-sav', '.proof'],
  ['szolgaltatas-kartyak', '.services__grid'],
  ['folyamat-sav', '.process'],
] as const;

test('képek és adatok mentése', async ({ page }) => {
  test.setTimeout(180_000);
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
      continue;
    }
    await open(page, `${NEW}/`);
    const full = await sharp(await shot(page))
      .jpeg({ quality: 82, mozjpeg: true })
      .toBuffer();
    writeFileSync(`${dir}/fooldal-${vpName}-${vp.width}-textura.jpg`, full);
  }
  if (mode !== 'polish') return;

  // Előtte/utána: ugyanaz a részlet a v1-approved-ból és az új buildből, egymás mellett
  await page.setViewportSize(VIEWPORTS.desktop);
  const crops: Record<string, Buffer[]> = {};
  for (const url of [OLD, NEW]) {
    await open(page, `${url}/`);
    const png = await shot(page);
    for (const [name, sel] of DETAILS) {
      const top = await page.evaluate(
        (s) =>
          Math.max(0, (document.querySelector(s)?.getBoundingClientRect().top ?? 0) + scrollY - 80),
        sel,
      );
      const crop = await sharp(png)
        .extract({ left: 0, top: Math.round(top), width: 1440, height: 640 })
        .toBuffer();
      (crops[name] ??= []).push(crop);
    }
  }
  for (const [name, [before, after]] of Object.entries(crops)) {
    if (!before || !after) continue;
    const out = await sharp({
      create: { width: 1440, height: 1296, channels: 3, background: '#ffffff' },
    })
      .composite([
        { input: before, top: 0, left: 0 },
        { input: after, top: 656, left: 0 },
      ])
      .jpeg({ quality: 90, mozjpeg: true })
      .toBuffer();
    writeFileSync(`${dir}/textura-${name}-elotte-utana.jpg`, out);
  }
});
