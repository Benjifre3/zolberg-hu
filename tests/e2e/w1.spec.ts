/**
 * W1: fejléc, hero, bizonyíték-sáv, kapcsolat (váz), lábléc. A fixture-buildre fut
 * (CONTENT_DIR=tests/fixtures/content), a várt értékek a tesztadatból számolhatók.
 */
import { test, expect } from '@playwright/test';

test.describe('fejléc', () => {
  test('sticky marad, és görgetéskor áttetsző állapotot kap', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    const header = page.locator('[data-site-header]');
    await expect(header).not.toHaveAttribute('data-scrolled');
    await page.mouse.wheel(0, 1200);
    await expect(header).toHaveAttribute('data-scrolled', '');
    const box = await header.boundingBox();
    expect(box?.y).toBe(0);
  });

  test('a „Beszéljünk” gomb a kapcsolat szekcióhoz visz', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Beszéljünk' }).click();
    await expect(page).toHaveURL(/#kapcsolat$/);
    await expect(page.getByRole('heading', { name: 'Kérem a mért adatokat.' })).toBeInViewport();
  });
});

test.describe('hero', () => {
  test('egy H1, a „mérés” szón a ceruzajelölés', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toHaveText('Céges weboldal, amit a mérés igazol.');
    await expect(page.locator('h1 .marked')).toHaveText('mérés');
  });

  test('a fő gomb a kapcsolatra mutat', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: 'Kérem a mért adatokat' })).toHaveAttribute(
      'href',
      '#kapcsolat',
    );
  });

  test('a munka a hajtás felett látszik: a hero-kép teteje ≤ 560 px 1440×900-on', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    const img = page.locator('.hero-visual__desktop img');
    await expect(img).toHaveAttribute('fetchpriority', 'high');
    const box = await img.boundingBox();
    expect(box?.y ?? Infinity).toBeLessThanOrEqual(560);
  });

  test('a képaláírás jelöli a munka típusát', async ({ page }) => {
    await page.goto('/');
    const caption = page.locator('.hero-visual figcaption');
    await expect(caption).toContainText('Teszt Gépgyártó Kft.');
    await expect(caption).toContainText('Ügyfélmunka');
  });

  test('az állapotsor csak a site.yaml-ból jön', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Új projektek indítása: 2027. január')).toBeVisible();
  });
});

test.describe('bizonyíték-sáv', () => {
  test('3 érték, mindegyik forrással és dátummal, a tesztadatból számolva', async ({ page }) => {
    await page.goto('/');
    const items = page.locator('.proof [data-metric]');
    await expect(items).toHaveCount(3);
    for (const item of await items.all()) {
      await expect(item).toHaveAttribute('data-source', /.{3,}/);
      await expect(item).toHaveAttribute('data-measured-at', /^\d{4}-\d{2}-\d{2}$/);
    }
    // átlag(97, 99, 94) = 96,67 → „97”; medián(1,3; 0,9) = 1,1 s; kézi: 12
    await items.first().scrollIntoViewIfNeeded();
    await expect(items.nth(0).locator('[data-countup-value]')).toHaveText('97');
    await expect(items.nth(1).locator('[data-countup-value]')).toHaveText('1,1');
    await expect(items.nth(2).locator('[data-countup-value]')).toHaveText('12');
    await expect(items.nth(1)).toContainText('2026. 11. 18. – 2026. 11. 20.');
  });

  test('JS nélkül is a végleges számok látszanak', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto('/');
    await expect(page.locator('.proof [data-countup-value]').first()).toHaveText('97');
    await context.close();
  });
});

test.describe('lábléc és tartalmi szabályok', () => {
  test('a cégadatok a site.yaml-ból jönnek', async ({ page }) => {
    await page.goto('/');
    const footer = page.locator('footer');
    await expect(footer).toContainText('Adószám: 12345678-1-12');
    await expect(footer.getByRole('link', { name: 'teszt@example.com' })).toHaveAttribute(
      'href',
      'mailto:teszt@example.com',
    );
  });

  test('nem jóváhagyott munka sehol nem jelenik meg', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('body')).not.toContainText('Teszt Rejtett');
  });

  test('minden belső horgonynak van célja', async ({ page }) => {
    await page.goto('/');
    const hrefs = await page
      .locator('a[href^="#"]')
      .evaluateAll((as) => as.map((a) => a.getAttribute('href') ?? ''));
    for (const href of new Set(hrefs)) {
      await expect(page.locator(href), href).toHaveCount(1);
    }
  });

  test('csökkentett mozgásnál nincs animáció', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    const name = await page
      .locator('.mark__clip')
      .evaluate((el) => getComputedStyle(el).animationName);
    expect(name).toBe('none');
  });
});
