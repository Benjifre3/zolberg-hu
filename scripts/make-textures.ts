/**
 * Textúrák (prémium finomítás 3.): SVG feTurbulence → előre renderelt, csempézhető PNG-k
 * (stitchTiles="stitch"), determinisztikusan (rögzített seed). Csak a meglévő palettából:
 * a papír-rétegek a --ink színét hordozzák alacsony alfával, a sötét sávok szemcséje semleges
 * szürke (soft-light: az 50%-os szürke nem változtat, csak a szórás látszik).
 *
 *   pnpm textures → public/tx/noise.png, public/tx/fiber.png, public/tx/grain-dark.png
 *
 * Határok: a papír két rétege együtt ≤ 20 KB, az összes új textúra ≤ 30 KB (7.).
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import sharp from 'sharp';

const OUT = 'public/tx';
const INK = [20, 19, 15] as const; // --ink
const KB = 1024;

/** Szürkeárnyalatos feTurbulence-zaj, 0..1 értékek. */
async function turbulence(size: number, freq: string, octaves: number, seed: number) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
    <filter id="n" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="${octaves}"
        seed="${seed}" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
    </filter>
    <rect width="100%" height="100%" filter="url(#n)"/>
  </svg>`;
  const { data } = await sharp(Buffer.from(svg))
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true });
  // A feTurbulence értékei a 0,5 körül szóródnak; normalizálás 0..1-re.
  let lo = 255;
  let hi = 0;
  for (const v of data) {
    lo = Math.min(lo, v);
    hi = Math.max(hi, v);
  }
  return Float32Array.from(data, (v) => (v - lo) / Math.max(1, hi - lo));
}

/** Tinta színű, alfával hordozott réteg néhány szinttel (kicsi fájl, finom szemcse). */
async function inkLayer(values: Float32Array, size: number, levels: number[], cut: number) {
  const rgba = Buffer.alloc(size * size * 4);
  values.forEach((v, i) => {
    const t = Math.max(0, (v - cut) / (1 - cut)); // csak a sötétebb csúcsok látszanak
    const a = levels[Math.min(levels.length - 1, Math.floor(t * levels.length))] ?? 0;
    rgba.set([INK[0], INK[1], INK[2], a], i * 4);
  });
  return sharp(rgba, { raw: { width: size, height: size, channels: 4 } })
    .png({ palette: true, colors: levels.length, compressionLevel: 9, effort: 10, dither: 0 })
    .toBuffer();
}

/** Semleges szürke szemcse soft-light-hoz: 128 ± amp. */
async function greyLayer(values: Float32Array, size: number, amp: number, steps: number) {
  const grey = Buffer.alloc(size * size);
  values.forEach((v, i) => {
    const q = Math.round((v * 2 - 1) * steps) / steps; // -1..1, `steps` lépcsővel
    grey[i] = Math.round(128 + q * amp);
  });
  return sharp(grey, { raw: { width: size, height: size, channels: 1 } })
    .png({ palette: true, colors: steps * 2 + 1, compressionLevel: 9, effort: 10, dither: 0 })
    .toBuffer();
}

mkdirSync(OUT, { recursive: true });

// 1) Finom, sűrű papírzaj: 256 px-es csempe. Max. alfa 10/255 (≈ 3,9%).
const noise = await inkLayer(await turbulence(256, '0.85', 3, 7), 256, [0, 0, 4, 7, 10], 0.35);
// 2) Papírrost: nagy léptékű, vízszintesen nyújtott szálak; 256 px, 512 px-re nagyítva.
//    Max. alfa 3/255 (≈ 1,2%), így a két réteg együtt sem sötétebb a v1 szemcséjénél (13/255).
const fiber = await inkLayer(await turbulence(256, '0.008 0.22', 3, 23), 256, [0, 1, 2, 3], 0.55);
// 3) Sötét sávok szemcséje (soft-light): 128 ± 10, 128 px-es csempe.
const grain = await greyLayer(await turbulence(128, '0.95', 2, 41), 128, 10, 3);

const files = { 'noise.png': noise, 'fiber.png': fiber, 'grain-dark.png': grain };
let total = 0;
for (const [name, buf] of Object.entries(files)) {
  writeFileSync(`${OUT}/${name}`, buf);
  total += buf.length;
  console.log(`${OUT}/${name}  ${(buf.length / KB).toFixed(1)} KB`);
}
const paper = noise.length + fiber.length;
console.log(
  `papír: ${(paper / KB).toFixed(1)} KB / 20 KB · összesen: ${(total / KB).toFixed(1)} KB / 30 KB`,
);
if (paper > 20 * KB || total > 30 * KB) {
  console.error('A textúrák túllépik a keretet.');
  process.exit(1);
}
