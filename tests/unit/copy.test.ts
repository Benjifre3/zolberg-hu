/**
 * Szöveg-szabályok az éles content/site.yaml-on (master prompt 2.3, 6.):
 * szekciónként 40–60 szó (törzsszöveg, címek nélkül; a GYIK kérdés–válasz formátuma kivétel),
 * nincs felkiáltójel, emoji, „csapatunk”-típusú többes szám vagy szuperlatívusz.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parse } from 'yaml';
import { SiteSchema } from '../../src/lib/site.ts';

const site = SiteSchema.parse(parse(readFileSync('content/site.yaml', 'utf8')));
const words = (...texts: string[]) => texts.join(' ').split(/\s+/).filter(Boolean).length;

test('szolgáltatás: 40–60 szó', () => {
  const n = words(site.services.intro, ...site.services.items.map((i) => i.text));
  assert.ok(n >= 40 && n <= 60, `${n} szó`);
});

test('folyamat: 40–60 szó', () => {
  const n = words(...site.process.steps.map((s) => s.text));
  assert.ok(n >= 40 && n <= 60, `${n} szó`);
});

const allCopy = [
  site.meta.description,
  site.services.intro,
  ...site.services.items.flatMap((i) => [i.title, i.text]),
  ...site.process.steps.flatMap((s) => [s.title, s.text]),
  ...site.faq.flatMap((f) => [f.q, f.a]),
  ...(site.about.bio ?? []),
].join('\n');

test('hangnem: nincs felkiáltójel és emoji (2.3)', () => {
  assert.doesNotMatch(allCopy, /!/);
  assert.doesNotMatch(allCopy, /\p{Extended_Pictographic}/u);
});

test('hangnem: egyes szám első személy, nincs „csapatunk”, szuperlatívusz, ígért eredmény (2.3)', () => {
  assert.doesNotMatch(allCopy, /\b(csapatunk|csapatunkkal|cégünk|munkatársaink)\b/i);
  assert.doesNotMatch(allCopy, /\b(legjobb|legolcsóbb|garantált|garantáljuk|garantálom)\b/i);
  assert.doesNotMatch(allCopy, /\d+\s*%-kal több/);
});
