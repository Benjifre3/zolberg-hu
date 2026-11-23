/**
 * Magyar szám- és dátumformátum (master prompt 4.): tizedesvessző, ezres tagolás nem törő
 * szóközzel, szám és mértékegység között nem törő szóköz, dátum: „2026. 11. 20.”
 */
export const NBSP = ' ';

export function formatNumber(value: number, decimals = 0): string {
  return new Intl.NumberFormat('hu-HU', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
    .format(value)
    .replace(/\s/g, NBSP);
}

export function withUnit(formatted: string, unit: string): string {
  return unit ? `${formatted}${NBSP}${unit}` : formatted;
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('hu-HU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'UTC',
  }).format(new Date(`${iso}T00:00:00Z`));
}

/** Két dátum: azonos napnál egy dátum, különben „2026. 11. 18. – 2026. 11. 20.” */
export function formatDateRange(fromIso: string, toIso: string): string {
  return fromIso === toIso ? formatDate(fromIso) : `${formatDate(fromIso)} – ${formatDate(toIso)}`;
}

/** Domain a böngészőkeret címsorába: https://www.pelda.hu/ → pelda.hu */
export function displayDomain(url: string): string {
  return new URL(url).hostname.replace(/^www\./, '');
}
