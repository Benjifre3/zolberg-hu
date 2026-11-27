/**
 * Textúrák és kontraszt (prémium finomítás 3.): a zaj- és fényrétegek a legrosszabb képponton
 * sem csökkenthetik a szöveg kontrasztját.
 *
 * - Papír: a két réteg (noise + fiber, multiply) legsötétebb képpontja sem sötétebb, mint a v1
 *   szemcséje (public/grain.png, normál keverés) → a --ink-2 kontrasztja nem csökken.
 * - Sötét sávok: a fényfolt (a sáv tokenje + 5% --paper) és a soft-light szemcse legvilágosabb
 *   képpontján is AA marad: a halványított szöveg ≥ 4,5:1, az akcent tintán ≥ 4,5:1, az
 *   erdőzöldön csak nagy szövegként (óriás sorszám) szerepel → ≥ 3:1.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import sharp from 'sharp';

type RGB = [number, number, number];
const css = readFileSync('src/styles/global.css', 'utf8');
const hex = (name: string): RGB => {
  const m = css.match(new RegExp(`--${name}:\\s*#([0-9a-fA-F]{6})`));
  if (!m?.[1]) throw new Error(`Hiányzó token: --${name}`);
  const h = m[1];
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as RGB;
};
const lin = (c: number) => {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};
const lum = ([r, g, b]: RGB) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const contrast = (a: RGB, b: RGB) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p) as [number, number];
  return (x + 0.05) / (y + 0.05);
};
const over = (top: RGB, alpha: number, base: RGB): RGB =>
  base.map((v, i) => v * (1 - alpha) + (top[i] ?? 0) * alpha) as RGB;
const mix = (a: RGB, b: RGB, t: number): RGB =>
  a.map((v, i) => v * (1 - t) + (b[i] ?? 0) * t) as RGB;
/** W3C soft-light, csatornánként (0..1) */
const softLight = (b: number, s: number) => {
  const d = b <= 0.25 ? ((16 * b - 12) * b + 4) * b : Math.sqrt(b);
  return s <= 0.5 ? b - (1 - 2 * s) * b * (1 - b) : b + (2 * s - 1) * (d - b);
};

async function maxAlpha(file: string): Promise<number> {
  const { data } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let max = 0;
  for (let i = 3; i < data.length; i += 4) max = Math.max(max, data[i] ?? 0);
  return max / 255;
}
async function maxGrey(file: string): Promise<number> {
  const { data } = await sharp(file).greyscale().raw().toBuffer({ resolveWithObject: true });
  return Math.max(...data) / 255;
}

const paper = hex('paper');
const ink = hex('ink');
const ink2 = hex('ink-2');

test('papír: a textúra legsötétebb pontja sem sötétebb a v1 szemcséjénél', async () => {
  const v1 = over(ink, await maxAlpha('public/grain.png'), paper);
  // multiply: base × (1 − a + a·ink/255), rétegenként
  const mul = (base: RGB, a: number): RGB =>
    base.map((v, i) => v * (1 - a + (a * (ink[i] ?? 0)) / 255)) as RGB;
  const now = mul(
    mul(paper, await maxAlpha('public/tx/fiber.png')),
    await maxAlpha('public/tx/noise.png'),
  );
  assert.ok(lum(now) >= lum(v1), `új: ${now.map(Math.round)}, v1: ${v1.map(Math.round)}`);
  assert.ok(contrast(ink2, now) >= contrast(ink2, v1));
});

test('sötét sávok: a fényfolt és a szemcse legvilágosabb pontján is AA', async () => {
  const s = await maxGrey('public/tx/grain-dark.png');
  const fgMuted = (bg: RGB, a: number) => over(paper, a, bg);
  for (const [name, bg, mutedAlpha, accentMin] of [
    ['tinta', hex('ink'), 0.72, 4.5],
    ['erdőzöld', hex('forest'), 0.78, 3],
  ] as const) {
    const field = mix(bg, paper, 0.05);
    const worst = field.map((v) => softLight(v / 255, s) * 255) as RGB;
    assert.ok(contrast(paper, worst) >= 7, `${name}: papír szöveg`);
    assert.ok(contrast(fgMuted(worst, mutedAlpha), worst) >= 4.5, `${name}: halványított szöveg`);
    assert.ok(contrast(hex('accent-on-dark'), worst) >= accentMin, `${name}: akcent`);
  }
});
