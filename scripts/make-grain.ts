/**
 * Szemcse-textúra (master prompt 4.): 128×128-as, csempézhető, alacsony átlátszóságú zaj.
 * Determinisztikus (rögzített seed), külső függőség nélkül ír PNG-t: szürke + alfa csatorna.
 * Futtatás: pnpm grain → public/grain.png (≤ 15 KB)
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { deflateSync, crc32 } from 'node:zlib';

const SIZE = 128;
const INK = 20; // a --ink szürke közelítése
const MAX_ALPHA = 13; // ≈ 5% fedés a legsötétebb szemcsén
const LEVELS = [0, 0, 4, 7, 10, MAX_ALPHA]; // kevés szint → kis fájl, finom szemcse

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function chunk(type: string, data: Buffer): Buffer {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

const rand = mulberry32(20261123);
const raw = Buffer.alloc((SIZE * 2 + 1) * SIZE);
for (let y = 0; y < SIZE; y++) {
  const row = y * (SIZE * 2 + 1);
  raw[row] = 0; // szűrő: none
  for (let x = 0; x < SIZE; x++) {
    const i = row + 1 + x * 2;
    raw[i] = INK;
    raw[i + 1] = LEVELS[Math.floor(rand() * LEVELS.length)] ?? 0;
  }
}

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(SIZE, 0);
ihdr.writeUInt32BE(SIZE, 4);
ihdr[8] = 8; // bitmélység
ihdr[9] = 4; // szürke + alfa
const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk('IHDR', ihdr),
  chunk('IDAT', deflateSync(raw, { level: 9 })),
  chunk('IEND', Buffer.alloc(0)),
]);

const out = fileURLToPath(new URL('../public/grain.png', import.meta.url));
writeFileSync(out, png);
console.log(`public/grain.png ${(png.length / 1024).toFixed(1)} KB`);
if (png.length > 15 * 1024) {
  console.error('A szemcse-textúra nagyobb 15 KB-nál.');
  process.exit(1);
}
