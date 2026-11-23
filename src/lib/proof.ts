/**
 * A bizonyíték-sáv értékei (6.3, D-009). A számolt értékek a jóváhagyott munkák „utána”
 * méréseiből jönnek, így a sáv és a munkakártyák soha nem mondanak ellent egymásnak.
 * Átlag és medián csak legalább 2 mérésből; ha 2-nél kevesebb érték marad, a sáv elmarad.
 */
import type { ProofItem } from './site.ts';
import type { Metric, Work } from './portfolio.ts';

export interface ResolvedProof {
  value: number;
  decimals: number;
  unit: string;
  label: string;
  /** forrás szövegesen, pl. „PageSpeed Insights (Lighthouse 13), mobil · 3 munka” */
  source: string;
  /** a legkorábbi és a legkésőbbi mérés napja (ISO) */
  from: string;
  to: string;
}

export const MIN_POINTS = 2;
export const MIN_ITEMS = 2;

const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
function median(xs: number[]): number {
  const s = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? (s[mid] as number) : ((s[mid - 1] as number) + (s[mid] as number)) / 2;
}

export function resolveProofItem(item: ProofItem, works: Work[]): ResolvedProof | null {
  if (item.type === 'manual') {
    return {
      value: item.value,
      decimals: item.decimals,
      unit: item.unit,
      label: item.label,
      source: item.source,
      from: item.measured_at,
      to: item.measured_at,
    };
  }
  const points: Metric[] = works.flatMap((w) => w.metrics.filter((m) => m.key === item.metric));
  if (points.length < MIN_POINTS) return null;
  const values = points.map((m) => m.after);
  const dates = points.map((m) => m.measured_at).sort();
  const tools = [...new Set(points.map((m) => m.tool))].join('; ');
  const units = new Set(points.map((m) => m.unit));
  if (units.size > 1) throw new Error(`Eltérő mértékegységek a(z) ${item.metric} mérésekben.`);
  return {
    value: item.type === 'portfolio_mean' ? mean(values) : median(values),
    decimals: item.decimals,
    unit: points[0]?.unit ?? '',
    label: item.label,
    source: `${tools} · ${points.length} munka ${item.type === 'portfolio_mean' ? 'átlaga' : 'mediánja'}`,
    from: dates[0] as string,
    to: dates[dates.length - 1] as string,
  };
}

/** A megjelenítendő elemek; üres tömb, ha 2-nél kevesebb valós érték van. */
export function resolveProof(items: ProofItem[], works: Work[]): ResolvedProof[] {
  const resolved = items
    .map((i) => resolveProofItem(i, works))
    .filter((r): r is ResolvedProof => r !== null);
  return resolved.length >= MIN_ITEMS ? resolved : [];
}
