import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { PAGES } from '../pages.ts';
import { VIEWPORTS } from '../../playwright.config.ts';

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];

/**
 * Az axe a nyugalmi állapotot méri: a hero-belépő (≤ 1,6 s) alatt a fejléc szóvédjegyének betűi
 * átmenetileg áttetszők, és ilyenkor a link „látható szövege” csak egy pont. Az akadálymentes
 * név végig ugyanaz (aria-label), ezért a mérés előtt megvárjuk, hogy minden animáció véget érjen.
 * Csökkentett mozgásnál külön is mérünk (ott nincs animáció).
 */
const settle = (page: Page) =>
  page.waitForFunction(() =>
    document.getAnimations().every((a) => a.playState === 'finished' || a instanceof CSSAnimation),
  );

for (const { path, name } of PAGES) {
  for (const [vpName, viewport] of Object.entries(VIEWPORTS)) {
    test(`axe: ${name} @ ${vpName}`, async ({ page }) => {
      await page.setViewportSize(viewport);
      if (vpName === 'mobile') await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(path);
      await settle(page);
      const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
      const summary = results.violations.map(
        (v) =>
          `${v.id} (${v.impact}): ${v.help} – ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`,
      );
      expect(summary).toEqual([]);
    });
  }
}
