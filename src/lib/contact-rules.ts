/**
 * Az űrlap szabályai és magyar hibaüzenetei (6.9, 10.) – ugyanaz a modul fut a böngészőben
 * (azonnali visszajelzés) és a Pages Functionben (a végső döntés mindig a szerveré).
 */
export const FIELDS = ['company', 'website', 'email'] as const;
export type Field = (typeof FIELDS)[number];
export type Values = Record<Field, string>;
export type Errors = Partial<Record<Field, string>>;

/** Rejtett csapdamező: ember nem tölti ki (D-035). */
export const HONEYPOT = 'fax';
/** JS-sel kitöltött időbélyeg (ms); ennél gyorsabb beküldés gép (D-035). */
export const TIMESTAMP = 'ts';
export const MIN_FILL_MS = 3000;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const HOST = /^(?=.{4,253}$)([a-z0-9-]+\.)+[a-z]{2,}$/i;

/** „pelda.hu”, „www.pelda.hu/rolunk” → https://pelda.hu/rolunk; érvénytelennél null. */
export function normalizeWebsite(input: string): string | null {
  const raw = input.trim();
  if (!raw) return null;
  try {
    const url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    if (!HOST.test(url.hostname)) return null;
    url.hash = '';
    return url.href;
  } catch {
    return null;
  }
}

export function validate(input: Partial<Record<Field, unknown>>): {
  values: Values;
  errors: Errors;
} {
  const text = (v: unknown) => (typeof v === 'string' ? v.trim() : '');
  const values: Values = {
    company: text(input.company).replace(/\s+/g, ' '),
    website: text(input.website),
    email: text(input.email),
  };
  const errors: Errors = {};

  if (!values.company) errors.company = 'Adja meg a cég nevét.';
  else if (values.company.length > 120) errors.company = 'A cégnév legfeljebb 120 karakter lehet.';

  if (!values.website) errors.website = 'Adja meg a weboldal címét, például: pelda.hu';
  else if (values.website.length > 300 || !normalizeWebsite(values.website))
    errors.website = 'Ez nem tűnik érvényes webcímnek. Példa: pelda.hu';

  if (!values.email) errors.email = 'Adja meg az e-mail-címét.';
  else if (values.email.length > 254 || !EMAIL.test(values.email))
    errors.email = 'Ellenőrizze az e-mail-címet, például: nev@pelda.hu';

  return { values, errors };
}

/** Gépi beküldés: kitöltött csapdamező vagy túl gyors (illetve jövőbeli) időbélyeg. */
export function isSpam(honeypot: unknown, timestamp: unknown, now = Date.now()): boolean {
  if (typeof honeypot === 'string' && honeypot.trim() !== '') return true;
  if (typeof timestamp === 'string' && timestamp !== '') {
    const ts = Number(timestamp);
    if (!Number.isFinite(ts) || now - ts < MIN_FILL_MS || ts > now + 60_000) return true;
  }
  return false;
}
