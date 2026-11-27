/**
 * Teljesítmény-költségvetés (master prompt 9.) a build kimenetén. Ha egy határ sérül,
 * a build elbukik. A futásidejű mutatókat (LCP, CLS, TBT, teljes letöltött súly)
 * a Lighthouse CI méri (lighthouserc.json); ez a szkript a statikus méreteket nézi.
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';
import { gzipSync } from 'node:zlib';
import { parse } from 'node-html-parser';

const DIST = 'dist';
const KB = 1024;
const BUDGET = {
  htmlGzip: 30 * KB,
  css: 25 * KB,
  jsGzip: 15 * KB,
  fonts: 120 * KB,
  aboveFoldImages: 150 * KB,
  total: 900 * KB,
  textures: 30 * KB, // prémium finomítás 7.: új textúra-fájlok összesen
};

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

const fileSize = (urlPath: string): number => {
  const p = join(DIST, decodeURIComponent(urlPath.split(/[?#]/)[0] ?? ''));
  return existsSync(p) ? statSync(p).size : 0;
};
const gz = (s: string | Buffer) => gzipSync(s, { level: 9 }).length;
const fmt = (n: number) => `${(n / KB).toFixed(1)} KB`;

const failures: string[] = [];
const rows: [string, number, number][] = [];
function check(label: string, value: number, limit: number) {
  rows.push([label, value, limit]);
  if (value > limit) failures.push(`${label}: ${fmt(value)} > ${fmt(limit)}`);
}

// 1) Minden HTML-oldal gzip-mérete
const htmlFiles = walk(DIST).filter((f) => extname(f) === '.html');
for (const f of htmlFiles)
  check(`HTML (gzip) ${f.slice(DIST.length + 1)}`, gz(readFileSync(f)), BUDGET.htmlGzip);

// 2) A főoldal első betöltése
const indexHtml = readFileSync(join(DIST, 'index.html'), 'utf8');
const doc = parse(indexHtml);

const inlineCss = doc
  .querySelectorAll('style')
  .map((s) => s.textContent)
  .join('\n');
const linkedCss = doc
  .querySelectorAll('link[rel="stylesheet"]')
  .map((l) => readFileSync(join(DIST, l.getAttribute('href') ?? ''), 'utf8'))
  .join('\n');
// A JS által a load után betöltött stíluslap (deferred.css, D-052) is a keretbe számít.
const deferredCss = (existsSync(join(DIST, '_astro')) ? walk(join(DIST, '_astro')) : [])
  .filter((f) => extname(f) === '.css')
  .map((f) => readFileSync(f, 'utf8'))
  .join('\n');
const cssBytes = Buffer.byteLength(inlineCss + linkedCss + deferredCss);
check('CSS összesen (inline + később betöltött)', cssBytes, BUDGET.css);

const scripts = doc
  .querySelectorAll('script')
  .filter((s) => s.getAttribute('type') !== 'application/ld+json');
let jsGzip = 0;
let jsRaw = 0;
for (const s of scripts) {
  const src = s.getAttribute('src');
  const code = src ? readFileSync(join(DIST, src), 'utf8') : s.textContent;
  jsGzip += gz(code);
  jsRaw += Buffer.byteLength(code);
}
check('JS összesen (gzip)', jsGzip, BUDGET.jsGzip);

const fontDir = join(DIST, '_astro', 'fonts');
const fontBytes = existsSync(fontDir)
  ? walk(fontDir).reduce((sum, f) => sum + statSync(f).size, 0)
  : 0;
check('Betűfájlok összesen', fontBytes, BUDGET.fonts);

// Hajtás feletti képek: a nem lusta <img>-ek legnagyobb jelöltje + a CSS-háttérképek
let aboveFold = 0;
for (const img of doc.querySelectorAll('img')) {
  if (img.getAttribute('loading') === 'lazy') continue;
  const sources = [
    img.getAttribute('src') ?? '',
    ...(img.getAttribute('srcset') ?? '').split(',').map((c) => c.trim().split(/\s+/)[0] ?? ''),
  ];
  const picture = img.parentNode?.tagName === 'PICTURE' ? img.parentNode : null;
  if (picture) {
    for (const source of picture.querySelectorAll('source')) {
      sources.push(
        ...(source.getAttribute('srcset') ?? '')
          .split(',')
          .map((c) => c.trim().split(/\s+/)[0] ?? ''),
      );
    }
  }
  aboveFold += Math.max(0, ...sources.filter(Boolean).map(fileSize));
}
const cssImages = [
  ...(inlineCss + linkedCss).matchAll(/url\(["']?(\/[^"')]+\.(?:png|jpe?g|webp|avif|svg))["']?\)/g),
].map((m) => m[1] ?? '');
const cssImageBytes = [...new Set(cssImages)].reduce((sum, u) => sum + fileSize(u), 0);
aboveFold += cssImageBytes;
check('Képek a hajtás felett', aboveFold, BUDGET.aboveFoldImages);

const total =
  Buffer.byteLength(indexHtml) +
  jsRaw +
  fontBytes +
  aboveFold +
  fileSize('/favicon.svg') +
  Buffer.byteLength(linkedCss);
check('Teljes oldalsúly (első betöltés, tömörítetlen)', total, BUDGET.total);

// Prémium finomítás: a public/tx/ textúrái összesen
const txDir = join(DIST, 'tx');
const txBytes = existsSync(txDir) ? walk(txDir).reduce((sum, f) => sum + statSync(f).size, 0) : 0;
check('Textúrák összesen (tx/)', txBytes, BUDGET.textures);

const width = Math.max(...rows.map((r) => r[0].length));
for (const [label, value, limit] of rows) {
  const ok = value <= limit ? 'OK ' : 'HIBA';
  console.log(`${ok}  ${label.padEnd(width)}  ${fmt(value).padStart(9)} / ${fmt(limit)}`);
}
if (failures.length) {
  console.error(`\nA költségvetés sérült (${failures.length}):\n- ${failures.join('\n- ')}`);
  process.exit(1);
}
