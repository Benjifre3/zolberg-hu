/**
 * W4 űrlap (12.3): kitöltve sikeres, hibásan magyar hibaüzenetet ad, JS nélkül is beküldhető.
 * A szerver a wrangler pages dev (dry-run levélküldés).
 */
import { test, expect, type Page } from '@playwright/test';

async function fill(page: Page, values: { company: string; website: string; email: string }) {
  await page.getByLabel('Cégnév').fill(values.company);
  await page.getByLabel('Weboldal címe').fill(values.website);
  await page.getByLabel('E-mail-cím').fill(values.email);
}

const good = { company: 'Teszt Kft.', website: 'teszt.example.com', email: 'teszt@example.com' };

test.describe('kapcsolati űrlap (JS-sel)', () => {
  test('hibás kitöltés: magyar hibaüzenet, aria-invalid, fókusz az első hibán', async ({
    page,
  }) => {
    await page.goto('/#kapcsolat');
    await page.getByLabel('E-mail-cím').fill('rossz');
    await page.getByRole('button', { name: 'Kérem a mért adatokat' }).click();
    const company = page.getByLabel('Cégnév');
    await expect(company).toBeFocused();
    await expect(company).toHaveAttribute('aria-invalid', 'true');
    await expect(company).toHaveAccessibleDescription('Adja meg a cég nevét.');
    await expect(page.getByLabel('E-mail-cím')).toHaveAccessibleDescription(
      /Ellenőrizze az e-mail-címet/,
    );
    await expect(page.locator('[data-form-status]')).toHaveText(
      'Kérem, javítsa a megjelölt mezőket.',
    );
  });

  test('helyes kitöltés: a /koszonjuk oldalra visz', async ({ page }) => {
    await page.goto('/#kapcsolat');
    await fill(page, good);
    // Az időcsapda (D-035) 3 mp-nél gyorsabb beküldést csendben eldob: a kitöltés kezdetét
    // 5 mp-cel korábbra tesszük, hogy a valódi küldési út (dry-run) fusson.
    await page.locator('[data-ts]').evaluate((el) => {
      (el as HTMLInputElement).value = String(Date.now() - 5000);
    });
    await page.getByRole('button', { name: 'Kérem a mért adatokat' }).click();
    await expect(page).toHaveURL(/\/koszonjuk$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Köszönöm, megkaptam.');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
  });

  test('a mezőknek látható címkéje és autocomplete-je van', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByLabel('Cégnév')).toHaveAttribute('autocomplete', 'organization');
    await expect(page.getByLabel('Weboldal címe')).toHaveAttribute('autocomplete', 'url');
    await expect(page.getByLabel('E-mail-cím')).toHaveAttribute('autocomplete', 'email');
  });
});

test.describe('kapcsolati űrlap (JS nélkül)', () => {
  test.use({ javaScriptEnabled: false });

  test('helyes kitöltés natív POST-tal → /koszonjuk', async ({ page }) => {
    await page.goto('/#kapcsolat');
    await fill(page, good);
    await page.getByRole('button', { name: 'Kérem a mért adatokat' }).click();
    await expect(page).toHaveURL(/\/koszonjuk$/);
  });

  test('hibás kitöltés → szerveroldali hibaoldal a beírt értékekkel', async ({ page }) => {
    await page.goto('/#kapcsolat');
    await fill(page, { ...good, email: '' });
    await page.getByRole('button', { name: 'Kérem a mért adatokat' }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Az űrlap nem ment el.');
    await expect(page.getByLabel('E-mail-cím')).toHaveAccessibleDescription(
      'Adja meg az e-mail-címét.',
    );
    await expect(page.getByLabel('Cégnév')).toHaveValue('Teszt Kft.');
  });
});

test('a /api/contact csak POST-ot fogad', async ({ request }) => {
  const res = await request.get('/api/contact');
  expect(res.status()).toBe(405);
});
