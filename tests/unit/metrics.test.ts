import { test } from 'node:test';
import assert from 'node:assert/strict';
import { metricChange, improved, industries, industryKey } from '../../src/lib/metrics.ts';
import { MetricSchema, type Work } from '../../src/lib/portfolio.ts';

const m = (o: object) =>
  MetricSchema.parse({
    key: 'lcp_mobile',
    label: 'LCP mobil',
    after: 1.3,
    measured_at: '2026-11-20',
    tool: 'PSI',
    source: 'measurements/x.json',
    ...o,
  });

test('előtte → utána magyar formátumban, mértékegységgel', () => {
  assert.equal(metricChange(m({ before: 6.4, unit: 's', decimals: 1 })), '6,4 s → 1,3 s');
  assert.equal(metricChange(m({ unit: 's', decimals: 1 })), '1,3 s');
});

test('a javulás iránya a `better` mezőtől függ', () => {
  assert.equal(improved(m({ before: 6.4, better: 'lower' })), true);
  assert.equal(improved(m({ before: 0.9, better: 'lower' })), false);
  assert.equal(improved(m({ key: 'psi_mobile', before: 41, after: 97 })), true);
});

test('iparágak: egyedi, magyar ábécérend; ékezetmentes kulcs', () => {
  const works = ['Vendéglátás', 'Építőipar', 'Gépipar', 'Gépipar'].map(
    (industry) => ({ industry }) as Work,
  );
  assert.deepEqual(industries(works), ['Építőipar', 'Gépipar', 'Vendéglátás']);
  assert.equal(industryKey('Építőipar és Ügyfél-szolgálat'), 'epitoipar-es-ugyfel-szolgalat');
});
