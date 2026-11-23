/** W2 mobilon: érintés a csúszkán (12.3), a szűrősor vízszintesen görgethető (8.). */
import { test, expect } from '@playwright/test';

test.use({ viewport: { width: 390, height: 844 } });

test('a csúszka érintéssel húzható', async ({ page }) => {
  await page.goto('/');
  const range = page.locator('[data-ba-range]');
  await range.scrollIntoViewIfNeeded();
  const b = await range.boundingBox();
  if (!b) throw new Error('A csúszka nem látszik.');
  await page.touchscreen.tap(b.x + b.width * 0.85, b.y + b.height / 2);
  const value = Number(await range.inputValue());
  expect(value).toBeGreaterThan(70);
  await expect(range).toHaveAttribute('aria-valuetext', `Előtte ${value}%`);
});

test('a szűrő gombjai legalább 44 px magasak, és az oldal nem görget vízszintesen', async ({
  page,
}) => {
  await page.goto('/');
  for (const button of await page.locator('[data-work-filter] button').all()) {
    expect((await button.boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(44);
  }
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});
