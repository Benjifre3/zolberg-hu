/**
 * Átadási képernyővideó (prémium finomítás 8.): asztali (1440×900) és mobil (390×844)
 * végiggörgetés a tesztadatos buildről, első látogatásként (hero-belépővel).
 * A Playwright WebM-et rögzít, az ffmpeg ebből egyetlen H.264 MP4-et fűz (a mobil a 1440×900-as
 * vászon közepén). Kell hozzá: futó szerver a dist-en (pl. pnpm preview:fixture) és ffmpeg a PATH-on.
 *
 *   node scripts/record-demo.ts [http://localhost:8788] → docs/polish-demo.mp4
 */
import { spawnSync } from 'node:child_process';
import { mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from '@playwright/test';

const BASE = process.argv[2] ?? 'http://localhost:8788';
const TMP = 'test-results/demo';
const OUT = 'docs/polish-demo.mp4';

rmSync(TMP, { recursive: true, force: true });
mkdirSync(TMP, { recursive: true });

async function record(name: string, width: number, height: number, step: number) {
  const browser = await chromium.launch();
  const dir = join(TMP, name);
  const context = await browser.newContext({
    viewport: { width, height },
    recordVideo: { dir, size: { width, height } },
    reducedMotion: 'no-preference',
  });
  const page = await context.newPage();
  await page.goto(BASE);
  await page.waitForTimeout(2600); // hero-belépő
  const total = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  for (let y = 0; y < total; y += step) {
    await page.mouse.move(width / 2, height / 2);
    await page.mouse.wheel(0, step);
    await page.waitForTimeout(260);
  }
  await page.waitForTimeout(1800); // a lábléc szóvédjegye
  await context.close();
  await browser.close();
  const file = readdirSync(dir).find((f) => f.endsWith('.webm'));
  if (!file) throw new Error(`nincs videó: ${dir}`);
  return join(dir, file);
}

const desktop = await record('desktop', 1440, 900, 180);
const mobile = await record('mobile', 390, 844, 160);

const list = join(TMP, 'parts.txt');
const parts = [
  ['desktop', desktop, 'scale=1440:900'],
  ['mobile', mobile, 'scale=-2:900,pad=1440:900:(ow-iw)/2:0:color=0xf4f1ea'],
] as const;
for (const [name, src, vf] of parts) {
  const r = spawnSync(
    'ffmpeg',
    [
      '-y',
      '-loglevel',
      'error',
      '-i',
      src,
      '-vf',
      `${vf},fps=30,format=yuv420p`,
      '-c:v',
      'libx264',
      '-preset',
      'slow',
      '-crf',
      '24',
      '-an',
      join(TMP, `${name}.mp4`),
    ],
    { stdio: 'inherit' },
  );
  if (r.status !== 0) process.exit(r.status ?? 1);
}
writeFileSync(list, parts.map(([name]) => `file '${name}.mp4'`).join('\n'));
const r = spawnSync(
  'ffmpeg',
  [
    '-y',
    '-loglevel',
    'error',
    '-f',
    'concat',
    '-safe',
    '0',
    '-i',
    list,
    '-c',
    'copy',
    '-movflags',
    '+faststart',
    OUT,
  ],
  { stdio: 'inherit' },
);
if (r.status !== 0) process.exit(r.status ?? 1);
console.log(`${OUT} kész`);
