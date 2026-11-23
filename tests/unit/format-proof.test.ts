import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatNumber, withUnit, formatDate, formatDateRange, NBSP } from '../../src/lib/format.ts';
import { resolveProof, resolveProofItem } from '../../src/lib/proof.ts';
import { PortfolioSchema, type Work } from '../../src/lib/portfolio.ts';

test('magyar számformátum: tizedesvessző, ezres tagolás nem törő szóközzel', () => {
  assert.equal(formatNumber(1.4, 1), '1,4');
  assert.equal(formatNumber(500000), `500${NBSP}000`);
  assert.equal(withUnit('1,4', 's'), `1,4${NBSP}s`);
});

test('magyar dátum és dátumtartomány', () => {
  assert.equal(formatDate('2026-11-20'), '2026. 11. 20.');
  assert.equal(formatDateRange('2026-11-20', '2026-11-20'), '2026. 11. 20.');
  assert.equal(formatDateRange('2026-11-18', '2026-11-20'), '2026. 11. 18. – 2026. 11. 20.');
});

const metric = (after: number, date: string) => ({
  key: 'psi_mobile' as const,
  label: 'PageSpeed mobil',
  before: null,
  after,
  unit: '',
  decimals: 0,
  better: 'higher' as const,
  measured_at: date,
  tool: 'PSI',
  source: 'measurements/x.json',
});
const work = (id: string, ...metrics: ReturnType<typeof metric>[]): Work =>
  ({ id, metrics }) as unknown as Work;

const mean = { type: 'portfolio_mean', metric: 'psi_mobile', label: 'átlag', decimals: 0 } as const;
const manual = {
  type: 'manual',
  value: 12,
  unit: '',
  label: 'projekt',
  decimals: 0,
  source: 'nyilvántartás',
  measured_at: '2026-11-20',
} as const;

test('átlag csak legalább 2 mérésből (2.1)', () => {
  assert.equal(resolveProofItem(mean, [work('a', metric(90, '2026-11-20'))]), null);
  const r = resolveProofItem(mean, [
    work('a', metric(90, '2026-11-18')),
    work('b', metric(96, '2026-11-20')),
  ]);
  assert.equal(r?.value, 93);
  assert.equal(r?.from, '2026-11-18');
  assert.equal(r?.to, '2026-11-20');
});

test('2-nél kevesebb valós értéknél a sáv elmarad (D-009)', () => {
  assert.deepEqual(resolveProof([mean, manual], [work('a', metric(90, '2026-11-20'))]), []);
  assert.equal(
    resolveProof(
      [mean, manual],
      [work('a', metric(90, '2026-11-20')), work('b', metric(96, '2026-11-20'))],
    ).length,
    2,
  );
});

const base = {
  id: 'x',
  name: 'Minta',
  live_url: 'https://example.com/',
  description: 'Egy mondat a munkáról, mérésekkel.',
  industry: 'Gépipar',
  approved_for_outreach: true,
};

test('jóváhagyott ügyfélmunkához írásos engedély kell', () => {
  assert.equal(PortfolioSchema.safeParse([{ ...base, type: 'client_project' }]).success, false);
  assert.equal(PortfolioSchema.safeParse([{ ...base, type: 'concept_demo' }]).success, true);
});

test('legfeljebb egy kiemelt munka, egyedi azonosítók', () => {
  const two = [
    { ...base, type: 'concept_demo', featured: true },
    { ...base, id: 'y', type: 'concept_demo', featured: true },
  ];
  assert.equal(PortfolioSchema.safeParse(two).success, false);
  assert.equal(
    PortfolioSchema.safeParse([
      { ...base, type: 'concept_demo' },
      { ...base, type: 'concept_demo' },
    ]).success,
    false,
  );
});
