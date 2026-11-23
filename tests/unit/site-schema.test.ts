import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parse } from 'yaml';
import { SiteSchema } from '../../src/lib/site.ts';

const valid = parse(readFileSync('content/site.yaml', 'utf8')) as Record<string, unknown>;

test('a content/site.yaml megfelel a sémának', () => {
  const r = SiteSchema.safeParse(valid);
  assert.ok(r.success, r.success ? '' : JSON.stringify(r.error.issues, null, 2));
});

test('a 60 karakternél hosszabb title-t elutasítja', () => {
  const meta = { ...(valid['meta'] as object), title: 'x'.repeat(61) };
  assert.equal(SiteSchema.safeParse({ ...valid, meta }).success, false);
});

test('hibás adószámot elutasít, helyeset elfogad', () => {
  const company = valid['company'] as object;
  assert.equal(
    SiteSchema.safeParse({ ...valid, company: { ...company, tax_id: '1234' } }).success,
    false,
  );
  assert.equal(
    SiteSchema.safeParse({ ...valid, company: { ...company, tax_id: '12345678-1-12' } }).success,
    true,
  );
});
