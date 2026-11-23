/** W2: munkák (6.4) a fixture-tartalommal. Kötelező tesztek (12.3): csúszka, szűrő. */
import { test, expect, type Page } from '@playwright/test';

const slider = (page: Page) => page.getByRole('slider', { name: /Előtte–utána/ });

async function box(locator: ReturnType<typeof slider>) {
  const b = await locator.boundingBox();
  if (!b) throw new Error('Az elem nem látszik.');
  return b;
}

test.describe('munkák', () => {
  test('a fejléc „Munkák” horgonya a szekcióra visz és aktív lesz', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    const link = page.locator('[data-site-header]').getByRole('link', { name: 'Munkák' });
    await link.click();
    await expect(page).toHaveURL(/#munkak$/);
    await expect(
      page.getByRole('heading', { name: 'Munkák, mérésekkel együtt.' }),
    ).toBeInViewport();
    await expect(link).toHaveAttribute('aria-current', 'true');
  });

  test('a kiemelt munka: címkék, egy mondat, előtte → utána metrikák forrással', async ({
    page,
  }) => {
    await page.goto('/');
    const featured = page.locator('.featured');
    await expect(featured.getByRole('heading', { name: 'Teszt Gépgyártó Kft.' })).toBeVisible();
    await expect(featured.locator('.work-tags')).toContainText('Ügyfélmunka');
    await expect(featured.locator('[data-metric]').first()).toContainText('41 → 97');
    await expect(featured.locator('[data-metric]').nth(1)).toContainText('6,4 s → 1,3 s');
    await expect(featured).toContainText('Mérve: 2026. 11. 20.');
  });

  test('a koncepciómunka mindenhol jelölt, és van lábjegyzet (2.2)', async ({ page }) => {
    await page.goto('/');
    const card = page.locator('[data-work-type="concept_demo"]');
    await expect(card).toHaveCount(1);
    await expect(card).toContainText('Saját koncepciómunka');
    await expect(page.getByText('A koncepciómunkák fiktív cégekre készült tervek')).toBeVisible();
  });
});

test.describe('előtte/utána csúszka', () => {
  test('középről indul, aria-valuetext-tel', async ({ page }) => {
    await page.goto('/');
    await expect(slider(page)).toHaveValue('50');
    await expect(slider(page)).toHaveAttribute('aria-valuetext', 'Előtte 50%');
  });

  test('nyílbillentyűkkel húzható', async ({ page }) => {
    await page.goto('/');
    await slider(page).focus();
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await expect(slider(page)).toHaveValue('52');
    await page.keyboard.press('Home');
    await expect(slider(page)).toHaveAttribute('aria-valuetext', 'Előtte 0%');
    const pos = await page
      .locator('[data-before-after]')
      .evaluate((el) => el.style.getPropertyValue('--pos'));
    expect(pos).toBe('0%');
  });

  test('egérrel húzható', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await slider(page).scrollIntoViewIfNeeded();
    const b = await box(slider(page));
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
    await page.mouse.down();
    await page.mouse.move(b.x + b.width * 0.2, b.y + b.height / 2, { steps: 8 });
    await page.mouse.up();
    const value = Number(await slider(page).inputValue());
    expect(b.width).toBeGreaterThan(300);
    expect(value).toBeGreaterThan(10);
    expect(value).toBeLessThan(30);
  });

  test('JS nélkül a csúszka rejtve, a képpár 50%-on látszik', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto('/');
    await expect(page.locator('[data-ba-range]')).toBeHidden();
    await expect(page.locator('[data-before-after] img')).toHaveCount(2);
    await context.close();
  });
});

test.describe('iparági szűrő', () => {
  test('szűr, és aria-pressed-et vált', async ({ page }) => {
    await page.goto('/');
    const all = page.getByRole('button', { name: 'Mind' });
    const food = page.getByRole('button', { name: 'Vendéglátás' });
    await expect(all).toHaveAttribute('aria-pressed', 'true');
    await food.click();
    await expect(food).toHaveAttribute('aria-pressed', 'true');
    await expect(all).toHaveAttribute('aria-pressed', 'false');
    await expect(page.locator('.works__grid > li:visible')).toHaveCount(1);
    await expect(page.locator('.works__grid > li:visible')).toContainText('Teszt Pékség');
    await expect(page.locator('[data-work-filter-status]')).toHaveText('1 munka látható.');
    await all.click();
    await expect(page.locator('.works__grid > li:visible')).toHaveCount(2);
  });

  test('JS nélkül nincs szűrő, és minden munka látszik', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto('/');
    await expect(page.locator('[data-work-filter]')).toBeHidden();
    await expect(page.locator('.works__grid > li')).toHaveCount(2);
    await expect(page.locator('.works__grid > li:visible')).toHaveCount(2);
    await context.close();
  });
});
