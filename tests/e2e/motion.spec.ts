/**
 * Prémium mozgás (prémium finomítás 5–6.): progresszív javítás, reduced-motion, CSP, és hogy az
 * animációk után nem marad inline stílus, filter vagy rejtett tartalom.
 */
import { test, expect, type Page } from '@playwright/test';

/** A hajtás alatti elemek közül azok, amelyek még rejtettek (inline opacity: 0). */
const hiddenCount = (page: Page) =>
  page.evaluate(() => document.querySelectorAll('[data-m-hidden]').length);

/** Végiggörget az oldalon, és megvárja, hogy minden animáció lefusson. */
async function scrollThrough(page: Page) {
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y <= height; y += 400) {
    await page.mouse.wheel(0, 400);
    await page.waitForTimeout(60);
  }
  await page.waitForFunction(
    () => document.getAnimations().every((a) => a.playState === 'finished'),
    null,
    {
      timeout: 10_000,
    },
  );
}

test.describe('mozgás – indítás és kapuk', () => {
  test('nincs CSP-sértés és konzolhiba; a mozgás-osztályok fent vannak', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (m) => {
      if (m.type() === 'error') errors.push(m.text());
    });
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('/');
    await expect(page.locator('html')).toHaveClass(/\bm-ok\b/);
    await expect(page.locator('html')).toHaveClass(/\bmotion\b/);
    expect(errors).toEqual([]);
  });

  test('csökkentett mozgásnál nincs mozgás-osztály és nincs rejtett elem', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await expect(page.locator('html')).not.toHaveClass(/\bmotion\b|\bintro/);
    expect(await hiddenCount(page)).toBe(0);
    const running = await page.evaluate(
      () =>
        document
          .getAnimations()
          .filter((a) => !(a instanceof CSSAnimation) && !(a instanceof CSSTransition)).length,
    );
    expect(running).toBe(0);
  });

  test('JS nélkül minden tartalom látszik', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto('/');
    for (const h of await page.locator('h1, h2:not(.visually-hidden)').all()) {
      await expect(h).toHaveCSS('opacity', '1');
    }
    const invisible = await page.evaluate(() =>
      [...document.querySelectorAll('main *, footer *')]
        // a csúszka natív range-mezője szándékosan átlátszó (v1, BeforeAfter.astro)
        .filter((el) => !el.matches('.ba__range'))
        .filter((el) => getComputedStyle(el).opacity === '0')
        .map((el) => el.outerHTML.slice(0, 80)),
    );
    expect(invisible).toEqual([]);
    await context.close();
  });

  test('a szekciócímek egyben olvashatók (aria-label), a szavak aria-hidden', async ({ page }) => {
    await page.goto('/');
    const h2 = page.getByRole('heading', { level: 2, name: 'Munkák, mérésekkel együtt.' });
    await expect(h2).toHaveCount(1);
    await expect(h2.locator('span[aria-hidden="true"]')).toHaveCount(3);
  });

  test('görgetés után minden látszik, és nem marad inline stílus vagy filter', async ({ page }) => {
    await page.goto('/');
    await scrollThrough(page);
    expect(await hiddenCount(page)).toBe(0);
    const leftovers = await page.evaluate(() =>
      [...document.querySelectorAll('main [style], footer [style]')]
        .map((el) => (el as HTMLElement).style.cssText)
        .filter((s) => /opacity|transform|filter|clip-path|will-change|display/.test(s)),
    );
    expect(leftovers).toEqual([]);
  });

  test('horgonyra érkezve a cél szekció azonnal látszik (nincs villanás)', async ({ page }) => {
    await page.goto('/#gyik');
    const h2 = page.locator('#gyik-cim');
    await expect(h2).toBeInViewport();
    const spans = h2.locator('span');
    for (const s of await spans.all()) await expect(s).toHaveCSS('opacity', '1');
  });
});

test.describe('mozgás – hero-belépő (5.1)', () => {
  /** A futó (nem CSS-) animációk célpontjai a betöltés pillanatában. */
  const targets = (page: Page) =>
    page.evaluate(() =>
      document
        .getAnimations()
        .filter((a) => !(a instanceof CSSAnimation) && !(a instanceof CSSTransition))
        .map((a) => {
          const t = (a.effect as KeyframeEffect | null)?.target;
          return t ? t.className || t.tagName : '';
        }),
    );

  test('első látogatás: teljes belépő; a hero-kép végig átlátszatlan (LCP)', async ({ page }) => {
    await page.goto('/', { waitUntil: 'commit' });
    await page.waitForFunction(() => document.documentElement.classList.contains('m-ok'));
    const names = await targets(page);
    expect(names.some((n) => String(n).includes('hero-visual__desktop'))).toBe(true);
    expect(names.some((n) => String(n).includes('hero__lead'))).toBe(true);
    // 5.1: a teljes belépő ≤ 1,6 s (a leghosszabb animáció vége a WAAPI időzítéséből)
    const end = await page.evaluate(() =>
      Math.max(
        ...document
          .getAnimations()
          .filter((x) => !(x instanceof CSSAnimation) && !(x instanceof CSSTransition))
          .map((x) => Number(x.effect?.getComputedTiming().endTime ?? 0)),
      ),
    );
    expect(end).toBeLessThanOrEqual(1600);
    await expect(page.locator('html')).not.toHaveClass(/\bintro/);
    for (let i = 0; i < 6; i++) {
      const opacity = await page.evaluate(() => {
        let o = 1;
        for (
          let el = document.querySelector('.hero-visual__desktop img');
          el;
          el = el.parentElement
        )
          o *= Number(getComputedStyle(el).opacity);
        return o;
      });
      expect(opacity).toBe(1);
      await page.waitForTimeout(150);
    }
    await page.waitForFunction(() =>
      document
        .getAnimations()
        .every((a) => a instanceof CSSAnimation || a.playState === 'finished'),
    );
    const leftovers = await page.evaluate(
      () => [...document.querySelectorAll('[data-i][style], h1 [style]')].length,
    );
    expect(leftovers).toBe(0);
  });

  test('visszatérő látogató: csak a H1 és a ceruza animálódik', async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => sessionStorage.getItem('zb-intro') === '1');
    await page.reload({ waitUntil: 'commit' });
    await page.waitForFunction(() => document.documentElement.classList.contains('m-ok'));
    const names = (await targets(page)).map(String);
    expect(names.length).toBeGreaterThan(0);
    expect(names.some((n) => n.includes('hero__lead') || n.includes('hero-visual'))).toBe(false);
    expect(names.every((n) => n === 'SPAN' || n === '' || /mark__/.test(n))).toBe(true);
  });
});

test.describe('mozgás – görgetésre induló jelenetek és mikro-interakciók (5.2–5.3)', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('csúszka: egyszeri megmutatás, az érték marad 50; bevitelre azonnal leáll', async ({
    page,
  }) => {
    await page.goto('/');
    await page.waitForFunction(() => document.documentElement.classList.contains('tx'));
    await page.locator('[data-before-after]').scrollIntoViewIfNeeded();
    const handle = page.locator('[data-ba-handle]');
    await expect
      .poll(() => handle.evaluate((el) => el.getAnimations().length), { timeout: 5000 })
      .toBeGreaterThan(0);
    await expect(page.locator('[data-ba-range]')).toHaveValue('50');
    await page.locator('[data-ba-range]').focus();
    expect(await handle.evaluate((el) => el.getAnimations().length)).toBe(0);
  });

  test('GYIK: a <details> nyitása magasság-animációval (ha a böngésző támogatja)', async ({
    page,
  }) => {
    await page.goto('/#gyik');
    await page.waitForFunction(() => document.documentElement.classList.contains('tx'));
    const supported = await page.evaluate(() => CSS.supports('selector(::details-content)'));
    test.skip(!supported, 'nincs ::details-content támogatás');
    // az átmenethez kell egy már kiszámolt kezdőállapot (a stíluslap épp most töltődött be)
    await page.waitForTimeout(300);
    // félúton a magasság a 0 és a végleges érték között van
    const [mid, end] = await page.evaluate(async () => {
      const d = document.querySelector('.faq__item');
      d?.querySelector('summary')?.click();
      const h = () => (d ? parseFloat(getComputedStyle(d, '::details-content').blockSize) : 0);
      await new Promise((r) => setTimeout(r, 60));
      const m = h();
      await new Promise((r) => setTimeout(r, 800));
      return [m, h()];
    });
    expect(mid).toBeGreaterThan(0);
    expect(mid).toBeLessThan(end);
    await expect(page.locator('.faq__item').first()).toHaveAttribute('open', '');
  });

  test('link: hoverre az aláhúzás balról jobbra rajzolódik', async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => document.documentElement.classList.contains('tx'));
    const link = page.locator('.section-head__link').first();
    await link.scrollIntoViewIfNeeded();
    const span = link.locator('span').first();
    await expect(span).toHaveCSS('background-size', '0px 1px');
    await link.hover();
    await expect(span).not.toHaveCSS('background-size', '0px 1px');
    await expect(span).toHaveCSS('background-size', /1px$/);
    await expect(link).toHaveCSS('text-decoration-color', 'rgba(0, 0, 0, 0)');
  });

  test('szolgáltatás: az ikonok kirajzolódnak, utána nem marad dash-beállítás', async ({
    page,
  }) => {
    await page.goto('/');
    await page.locator('.services__grid').scrollIntoViewIfNeeded();
    await page.waitForFunction(() =>
      document
        .getAnimations()
        .every(
          (a) =>
            a.playState === 'finished' ||
            !(a instanceof Animation) ||
            a instanceof CSSAnimation ||
            a instanceof CSSTransition,
        ),
    );
    await page.waitForTimeout(1500);
    const dash = await page
      .locator('.services__icon path')
      .first()
      .evaluate((p) => (p as SVGPathElement).style.strokeDasharray);
    expect(dash).toBe('');
  });
});
