/**
 * Betű-részhalmazolás (D-008): családonként EGY woff2, latin + magyar ŐőŰű +
 * a magyar tipográfiához szükséges írásjelek. Forrás: fonts-src/ (Google Fonts, OFL).
 * Futtatás: pnpm fonts  → src/assets/fonts/*.woff2
 */
import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import subsetFont from 'subset-font';

const root = fileURLToPath(new URL('..', import.meta.url));
const src = (f: string) => `${root}fonts-src/${f}`;
const out = (f: string) => `${root}src/assets/fonts/${f}`;

function range(from: number, to: number): string {
  let s = '';
  for (let c = from; c <= to; c++) s += String.fromCodePoint(c);
  return s;
}

/** Az oldalon előforduló karakterkészlet. */
export const CHARSET = [
  range(0x20, 0x7e), // alap latin
  range(0xa0, 0xff), // Latin-1 kiegészítés (áéíóöúü, nbsp, ·, ×, ©)
  'ŐőŰű', // Ő ő Ű ű
  ' ‑–—‘’‚“”„•… ', // ‚ “ ” „ – — … szűk nbsp
  '€™−', // € ™ −
  range(0x2190, 0x2193), // ← ↑ → ↓ (ha a betűben megvan)
].join('');

interface Job {
  file: string;
  output: string;
  license: string;
  axes: Record<string, number | { min: number; max: number }>;
}

const jobs: Job[] = [
  {
    file: 'BricolageGrotesque[opsz,wdth,wght].ttf',
    output: 'bricolage-grotesque.woff2',
    license: 'OFL-BricolageGrotesque.txt',
    // D-020: az opsz rögzítve 72-n (mért LCP-túllépés miatt; 74 KB → ~40 KB)
    axes: { wdth: 100, opsz: 72, wght: { min: 500, max: 700 } },
  },
  {
    file: 'HankenGrotesk[wght].ttf',
    output: 'hanken-grotesk.woff2',
    license: 'OFL-HankenGrotesk.txt',
    axes: { wght: { min: 400, max: 600 } },
  },
  {
    file: 'JetBrainsMono[wght].ttf',
    output: 'jetbrains-mono.woff2',
    license: 'OFL-JetBrainsMono.txt',
    axes: { wght: 400 }, // statikus példány
  },
];

await mkdir(out(''), { recursive: true });
let total = 0;
for (const job of jobs) {
  const input = await readFile(src(job.file));
  const result = await subsetFont(input, CHARSET, {
    targetFormat: 'woff2',
    variationAxes: job.axes,
  });
  await writeFile(out(job.output), result);
  await copyFile(src(job.license), out(job.license));
  total += result.length;
  console.log(`${job.output.padEnd(28)} ${(result.length / 1024).toFixed(1).padStart(6)} KB`);
}
console.log(
  `${'összesen'.padEnd(28)} ${(total / 1024).toFixed(1).padStart(6)} KB (költségvetés: 120 KB)`,
);
if (total > 120 * 1024) {
  console.error('A betűfájlok túllépik a 120 KB-os költségvetést.');
  process.exit(1);
}
