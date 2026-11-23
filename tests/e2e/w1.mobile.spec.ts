/** W1 mobilon (6.1, 8.): nincs hamburger, a munka a hajtás felett indul. */
import { test, expect } from '@playwright/test';

test.use({ viewport: { width: 390, height: 844 } });

test('mobilon csak a szóvédjegy és a gomb látszik, hamburger nincs', async ({ page }) => {
  await page.goto('/');
  const header = page.locator('[data-site-header]');
  await expect(header.getByRole('link', { name: 'Zolberg – főoldal' })).toBeVisible();
  await expect(header.getByRole('link', { name: 'Beszéljünk' })).toBeVisible();
  await expect(header.locator('button, [aria-expanded]')).toHaveCount(0);
});

test('a hero-kép teteje ≤ 620 px 390×844-en', async ({ page }) => {
  await page.goto('/');
  const box = await page.locator('.hero-visual__desktop img').boundingBox();
  expect(box?.y ?? Infinity).toBeLessThanOrEqual(620);
});

test('érintési célok ≥ 44 px a fejlécben', async ({ page }) => {
  await page.goto('/');
  for (const link of await page.locator('[data-site-header] a:visible').all()) {
    const box = await link.boundingBox();
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
  }
});
