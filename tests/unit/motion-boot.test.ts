/**
 * A mozgás-indító inline szkript és a CSP (prémium finomítás 6., D-039): a `public/_headers`
 * script-src-je pontosan a szkript hash-ét engedi, `unsafe-inline` nélkül. A buildelt HTML-ben
 * ugyanez a szöveg áll (az e2e a böngészőben is ellenőrzi, hogy nincs CSP-sértés).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { MOTION_BOOT, MOTION_BOOT_HASH } from '../../src/lib/motion-boot.ts';

const headers = readFileSync('public/_headers', 'utf8');
const scriptSrc = /script-src ([^;]+);/.exec(headers)?.[1] ?? '';

test('a CSP a mozgás-indító hash-ét engedi', () => {
  assert.equal(scriptSrc, `'self' '${MOTION_BOOT_HASH}'`);
});

test('nincs unsafe-inline a script-src-ben', () => {
  assert.doesNotMatch(scriptSrc, /unsafe-inline/);
});

test('a szkript csökkentett mozgásnál semmit nem kapcsol be, és van biztonsági hálója', () => {
  assert.match(MOTION_BOOT, /prefers-reduced-motion: reduce\)'\)\.matches\)return/);
  assert.match(MOTION_BOOT, /DOMContentLoaded/);
  assert.match(MOTION_BOOT, /setTimeout\(f,1500\)/);
  assert.ok(MOTION_BOOT.length < 600, 'az inline szkript maradjon apró');
});
