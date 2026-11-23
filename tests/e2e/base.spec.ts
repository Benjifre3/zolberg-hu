import { test, expect } from '@playwright/test';

test.describe('alapok', () => {
  test('magyar nyelv, egy H1, meta-adatok a határokon belül', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'hu');
    await expect(page.locator('h1')).toHaveCount(1);

    const title = await page.title();
    expect(title.length).toBeGreaterThan(10);
    expect(title.length).toBeLessThanOrEqual(60);

    const description = await page.locator('meta[name="description"]').getAttribute('content');
    expect(description?.length ?? 0).toBeLessThanOrEqual(155);

    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    expect(canonical).toMatch(/^https:\/\/[^/]+\/$/);
  });

  test('az ugrólink a fő tartalomra viszi a fókuszt', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    const skip = page.getByRole('link', { name: 'Ugrás a tartalomra' });
    await expect(skip).toBeFocused();
    await expect(skip).toBeInViewport();
    await page.keyboard.press('Enter');
    await expect(page.locator('main')).toBeFocused();
  });

  for (const width of [320, 1920]) {
    test(`nincs vízszintes görgetés ${width} px-en`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }

  test('a 404-es oldal nem indexelhető, és visszavisz a főoldalra', async ({ page }) => {
    await page.goto('/404');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
    await expect(page.getByRole('link', { name: /főoldalra/ })).toHaveAttribute('href', '/');
  });

  test('robots.txt a sitemapre mutat', async ({ request }) => {
    const res = await request.get('/robots.txt');
    expect(res.ok()).toBeTruthy();
    expect(await res.text()).toMatch(/Sitemap: https:\/\/.+\/sitemap-index\.xml/);
  });

  test('nincs harmadik féltől származó kérés (2.4)', async ({ page, baseURL }) => {
    const foreign: string[] = [];
    page.on('request', (req) => {
      const url = new URL(req.url());
      if (url.origin !== new URL(baseURL ?? '').origin && url.protocol.startsWith('http')) {
        foreign.push(req.url());
      }
    });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    expect(foreign).toEqual([]);
  });
});
