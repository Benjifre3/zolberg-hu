/** W3: szolgáltatás, folyamat, rólam, GYIK (6.5–6.8) a fixture-tartalommal. */
import { test, expect } from '@playwright/test';

test('a szekciók sorrendje a specifikáció szerint', async ({ page }) => {
  await page.goto('/');
  const ids = await page.locator('main > section[id]').evaluateAll((els) => els.map((e) => e.id));
  expect(ids).toEqual(['munkak', 'szolgaltatas', 'folyamat', 'rolam', 'gyik', 'kapcsolat']);
});

test('szolgáltatás: 4 kártya, mindegyiken vonalikon, ár nélkül', async ({ page }) => {
  await page.goto('/');
  const section = page.locator('#szolgaltatas');
  await expect(section.getByRole('heading', { level: 2 })).toHaveText('Mit kap a cége.');
  await expect(section.locator('.services__card')).toHaveCount(4);
  await expect(section.locator('.services__card svg[aria-hidden="true"]')).toHaveCount(4);
  await expect(section).not.toContainText(/Ft|HUF|forint/);
});

test('folyamat: 4 lépés 01–04, időkerettel', async ({ page }) => {
  await page.goto('/');
  const steps = page.locator('#folyamat .process__step');
  await expect(steps).toHaveCount(4);
  await expect(steps.locator('.process__num')).toHaveText(['01', '02', '03', '04']);
  await expect(steps.first()).toContainText('Időkeret: 2–3 munkanap');
  await expect(steps.first().getByRole('heading')).toHaveText('1. lépés: Mérés');
});

test('rólam: név a cégadatból, portré alt-szöveggel, mono cégadat-sor', async ({ page }) => {
  await page.goto('/');
  const about = page.locator('#rolam');
  await expect(about.getByRole('heading', { level: 2 })).toHaveText(
    'Teszt Elek, a Zolberg alapítója.',
  );
  await expect(about.locator('img')).toHaveAttribute('alt', /Tesztportré/);
  await expect(about.locator('.about__facts')).toContainText('Adószám: 12345678-1-12');
});

test('GYIK: natív details, JS nélkül is nyitható', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/');
  const items = page.locator('#gyik details');
  expect(await items.count()).toBeGreaterThanOrEqual(5);
  const first = items.first();
  await expect(first).not.toHaveAttribute('open');
  await first.locator('summary').click();
  await expect(first).toHaveAttribute('open', '');
  await expect(first.locator('p')).toBeVisible();
  await context.close();
});

test('a fejléc horgonyai: Munkák, Szolgáltatás, Folyamat', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await expect(page.locator('[data-site-header] nav a')).toHaveText([
    'Munkák',
    'Szolgáltatás',
    'Folyamat',
  ]);
  await page.locator('[data-site-header]').getByRole('link', { name: 'Folyamat' }).click();
  await expect(page.getByRole('heading', { name: 'Így dolgozom.' })).toBeInViewport();
});
