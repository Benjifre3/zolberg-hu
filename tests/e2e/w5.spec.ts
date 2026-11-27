/** W5: jogi oldalak, SEO, biztonsági fejlécek, átirányítások (10., 3.) a fixture-tartalommal. */
import { test, expect } from '@playwright/test';

test('a jogi oldalak elkészülnek, a lábléc és az űrlap rájuk linkel', async ({ page }) => {
  await page.goto('/');
  const footer = page.locator('footer');
  await expect(footer.getByRole('link', { name: 'Adatkezelési tájékoztató' })).toHaveAttribute(
    'href',
    '/adatkezeles',
  );
  await expect(footer.getByRole('link', { name: 'Impresszum' })).toHaveAttribute(
    'href',
    '/impresszum',
  );
  const form = page.locator('[data-contact-form]');
  await expect(form).not.toHaveAttribute('data-placeholder');
  await expect(form.getByRole('link', { name: 'Adatkezelési tájékoztató' })).toBeVisible();

  await page.goto('/adatkezeles');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Adatkezelési tájékoztató');
  await expect(page.getByText('Hatályos: 2026. 11. 20.')).toBeVisible();
});

test('NAP: a lábléc, az impresszum és a JSON-LD ugyanazt mondja', async ({ page }) => {
  await page.goto('/');
  const ld = JSON.parse(
    (await page.locator('script[type="application/ld+json"]').textContent()) ?? '{}',
  ) as Record<string, unknown>;
  expect(ld['@type']).toBe('ProfessionalService');
  const footer = (await page.locator('footer').textContent()) ?? '';
  for (const value of [ld['name'], ld['address'], ld['taxID'], ld['email'], ld['telephone']]) {
    expect(typeof value).toBe('string');
    expect(footer).toContain(value as string);
  }
  await page.goto('/impresszum');
  const nap = (await page.locator('[data-nap]').textContent()) ?? '';
  for (const value of [ld['name'], ld['address'], ld['taxID'], ld['email'], ld['telephone']]) {
    expect(nap).toContain(value as string);
  }
});

test('Open Graph és Twitter: saját 1200×630-as kép', async ({ page, request }) => {
  await page.goto('/');
  const og = async (p: string) => page.locator(`meta[property="${p}"]`).getAttribute('content');
  expect(await og('og:locale')).toBe('hu_HU');
  expect(await og('og:title')).toBe(await page.title());
  expect(await og('og:image:width')).toBe('1200');
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
    'content',
    'summary_large_image',
  );
  const res = await request.get('/og.png');
  expect(res.ok()).toBeTruthy();
  expect(res.headers()['content-type']).toContain('image/png');
});

test('biztonsági fejlécek: CSP csak saját originnel, HSTS, nosniff', async ({ request }) => {
  const res = await request.get('/');
  const h = res.headers();
  expect(h['content-security-policy']).toContain("default-src 'self'");
  // Saját origin + a mozgás-indító inline szkript hash-e, unsafe-inline nélkül (POLISH_PLAN 1.)
  expect(h['content-security-policy']).toMatch(/script-src 'self' 'sha256-[A-Za-z0-9+/]+=*';/);
  expect(h['content-security-policy']).toContain("frame-ancestors 'none'");
  expect(h['strict-transport-security']).toContain('max-age=31536000');
  expect(h['x-content-type-options']).toBe('nosniff');
  expect(h['referrer-policy']).toBe('strict-origin-when-cross-origin');
});

test('nincs CSP-sértés, és minden sziget fut (CSP mellett)', async ({ page }) => {
  const violations: string[] = [];
  page.on('console', (msg) => {
    if (/Content Security Policy|Refused to/i.test(msg.text())) violations.push(msg.text());
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Vendéglátás' }).click();
  await expect(page.locator('.works__grid > li:visible')).toHaveCount(1);
  await page.getByRole('slider', { name: /Előtte–utána/ }).focus();
  await page.keyboard.press('ArrowLeft');
  expect(violations).toEqual([]);
});

test('/munkak átirányít a munkák horgonyra', async ({ request }) => {
  const res = await request.get('/munkak', { maxRedirects: 0 });
  expect(res.status()).toBe(301);
  expect(res.headers()['location']).toMatch(/\/#munkak$/);
});

test('a sitemap a jogi oldalakat tartalmazza, a köszönőoldalt nem', async ({ request }) => {
  const xml = await (await request.get('/sitemap-0.xml')).text();
  expect(xml).toContain('/adatkezeles</loc>');
  expect(xml).toContain('/impresszum</loc>');
  expect(xml).not.toContain('/koszonjuk');
  expect(xml).not.toContain('/404');
});
