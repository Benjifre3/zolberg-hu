/**
 * A design tokenek kontrasztja (master prompt 4., D-010). A színeket a global.css-ből olvassa,
 * így ha valaki módosít egy tokent, ez a teszt jelzi, ha a pár az AA-küszöb alá esik.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync('src/styles/global.css', 'utf8');
const token = (name: string): string => {
  const m = css.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`));
  if (!m?.[1]) throw new Error(`Hiányzó token: --${name}`);
  return m[1];
};

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

const TEXT = 4.5; // WCAG AA, normál szöveg
const UI = 3; // WCAG AA, nem szöveges elem (fókuszgyűrű, mezőkeret, pötty)

const pairs: [fg: string, bg: string, min: number][] = [
  ['ink', 'paper', TEXT],
  ['ink-2', 'paper', TEXT],
  ['ink-2', 'paper-raised', TEXT],
  ['ink-2', 'sage', TEXT],
  ['accent', 'paper', TEXT],
  ['accent', 'paper-raised', TEXT],
  ['paper', 'ink', TEXT],
  ['paper', 'forest', TEXT],
  ['accent-on-dark', 'forest', TEXT],
  ['accent-on-dark', 'ink', TEXT],
  ['field', 'paper', UI],
  ['field', 'paper-raised', UI],
  ['signal', 'paper', UI],
  ['accent', 'ink', UI], // gomb-háttér a tinta sávon (nem szöveg)
];

for (const [fg, bg, min] of pairs) {
  test(`--${fg} / --${bg} ≥ ${min}:1`, () => {
    const ratio = contrast(token(fg), token(bg));
    assert.ok(ratio >= min, `${ratio.toFixed(2)}:1 < ${min}:1`);
  });
}

test('fehér szöveg az --accent gombon ≥ 4,5:1', () => {
  assert.ok(contrast('#ffffff', token('accent')) >= TEXT);
});

test('az --accent szövegként NEM használható sötét sávon (D-010)', () => {
  assert.ok(contrast(token('accent'), token('ink')) < TEXT);
  assert.ok(contrast(token('accent'), token('forest')) < UI);
});
