import { test, expect } from '@playwright/test';
import { PAGES } from '../pages.ts';
import { VIEWPORTS } from '../../playwright.config.ts';

/**
 * Vizuális regresszió 390 / 834 / 1440 px-en (12.3). Az alapképek csak a CI-ban (Linux)
 * készülnek és frissülnek (D-014); helyben Windows-alapkép nem kerül a repóba.
 */
for (const { path, name } of PAGES) {
  for (const [vpName, viewport] of Object.entries(VIEWPORTS)) {
    test(`${name} @ ${vpName}`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(path);
      // A content-visibility: auto blokkok teljes oldalas képen üresek maradnának (D-033).
      await page.addStyleTag({ content: '.defer-render{content-visibility:visible!important}' });
      await page.evaluate(() => document.fonts.ready);
      await expect(page).toHaveScreenshot(`${name}-${vpName}.png`, { fullPage: true });
    });
  }
}
