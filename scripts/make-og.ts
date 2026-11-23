/**
 * Open Graph / Twitter-kép (10.: 1200×630, saját): a saját betűkkel és színekkel renderelt
 * kártya (szóvédjegy + főcím). Futtatás: pnpm og → public/og.png
 */
import { writeFileSync, mkdtempSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from '@playwright/test';

const font = (f: string) =>
  pathToFileURL(fileURLToPath(new URL(`../src/assets/fonts/${f}`, import.meta.url))).href;
const grain = pathToFileURL(fileURLToPath(new URL('../public/grain.png', import.meta.url))).href;

const html = `<!doctype html><html lang="hu"><head><meta charset="utf-8"><style>
@font-face{font-family:D;src:url(${font('bricolage-grotesque.woff2')}) format('woff2');font-weight:500 700}
@font-face{font-family:B;src:url(${font('hanken-grotesk.woff2')}) format('woff2');font-weight:400 600}
@font-face{font-family:M;src:url(${font('jetbrains-mono.woff2')}) format('woff2')}
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;padding:64px 72px;display:flex;flex-direction:column;justify-content:space-between;
background:#F4F1EA url(${grain});color:#14130F;font-family:B}
.grid{position:absolute;inset:0;background-image:linear-gradient(to right,rgb(20 19 15/.05) 1px,transparent 1px),linear-gradient(to bottom,rgb(20 19 15/.05) 1px,transparent 1px);background-size:64px 64px}
.mark{font-family:D;font-weight:700;font-size:44px;letter-spacing:-.045em;position:relative}.mark i{font-style:normal;color:#C2331A}
h1{font-family:D;font-weight:700;font-size:96px;line-height:.94;letter-spacing:-.04em;max-width:15ch;position:relative}

.meta{font-family:M;font-size:22px;color:#5E5A51;position:relative}
</style></head><body><div class="grid"></div>
<div class="mark">zolberg<i>.</i></div>
<h1>Céges weboldal, amit a mérés igazol.</h1>
<div class="meta">zolberg.hu · mérés · terv · újraépítés</div></body></html>`;

const dir = mkdtempSync(join(tmpdir(), 'zolberg-og-'));
const file = join(dir, 'og.html');
writeFileSync(file, html);

const out = fileURLToPath(new URL('../public/og.png', import.meta.url));
const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1200, height: 630 },
  deviceScaleFactor: 1,
});
await page.goto(pathToFileURL(file).href);
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: out });
await browser.close();
console.log(`public/og.png ${(statSync(out).size / 1024).toFixed(1)} KB`);
