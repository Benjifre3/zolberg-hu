/**
 * Görgetési teljesítmény (prémium finomítás 7.): közepes Android-telefon közelítése a Chrome
 * DevTools 4× CPU-lassításával; végiggörgetve az oldalt (minden jelenet lefut) nincs 50 ms-nál
 * hosszabb feladat. Az első betöltés feladatai nem számítanak (azokat a Lighthouse TBT méri).
 * Külön projektben, egyetlen workerrel fut (pnpm test:perf): párhuzamos tesztek mellett a gép
 * terhelése mérné magát, nem az oldalt.
 */
import { test, expect } from '@playwright/test';

test('4× CPU-lassítással görgetés közben nincs 50 ms-nál hosszabb feladat', async ({
  page,
  browserName,
}) => {
  test.skip(browserName !== 'chromium', 'CDP CPU-lassítás csak Chromiumban');
  test.setTimeout(60_000);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.waitForFunction(() => document.documentElement.classList.contains('tx'));
  await page.waitForTimeout(2000); // a belépő és a betöltés vége

  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await page.evaluate(() => {
    const w = window as unknown as { __long: number[] };
    w.__long = [];
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) w.__long.push(Math.round(e.duration));
    }).observe({ type: 'longtask' });
  });

  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < height; y += 300) {
    await page.mouse.wheel(0, 300);
    await page.waitForTimeout(120);
  }
  await page.waitForTimeout(1500);
  const long = await page.evaluate(() => (window as unknown as { __long: number[] }).__long);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
  expect(long, `hosszú feladatok (ms): ${long.join(', ')}`).toEqual([]);
});
