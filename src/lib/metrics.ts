/**
 * A munkák méréseinek megjelenítése (2.1: minden szám mért, dátumozott, forrásmegjelölt).
 */
import type { Metric, Work } from './portfolio.ts';
import { formatNumber, withUnit, formatDate } from './format.ts';

export const metricValue = (m: Metric, v: number): string =>
  withUnit(formatNumber(v, m.decimals), m.unit);

/** „41 → 97” vagy csak „97”, ha nincs előtte-mérés. */
export const metricChange = (m: Metric): string =>
  m.before === null
    ? metricValue(m, m.after)
    : `${metricValue(m, m.before)} → ${metricValue(m, m.after)}`;

/** Javult-e a mérés (a `better` irány szerint). */
export const improved = (m: Metric): boolean =>
  m.before !== null && (m.better === 'higher' ? m.after > m.before : m.after < m.before);

/** „Mérve: 2026. 11. 20. · PageSpeed Insights …” – mérési alkalmanként egy sor. */
export function provenance(work: Work): string[] {
  const seen = new Map<string, string>();
  for (const m of work.metrics) {
    const key = `${m.measured_at}|${m.tool}`;
    if (!seen.has(key)) seen.set(key, `Mérve: ${formatDate(m.measured_at)} · ${m.tool}`);
  }
  return [...seen.values()];
}

/** Az iparágak a szűrőhöz, magyar ábécérendben. */
export const industries = (works: Work[]): string[] =>
  [...new Set(works.map((w) => w.industry))].sort((a, b) => a.localeCompare(b, 'hu'));

/** Szűrő-azonosító egy iparághoz (data-industry érték). */
export const industryKey = (industry: string): string =>
  industry
    .toLocaleLowerCase('hu')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
