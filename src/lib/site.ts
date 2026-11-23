/**
 * content/site.yaml betöltése és validálása (zod). A tesztek a CONTENT_DIR-rel
 * a tests/fixtures/content/ mappára váltanak (D-011).
 * Szabály (2.1): ami még nincs meg, az null, és az elem nem jelenik meg.
 */
import { readFileSync } from 'node:fs';
import { parse } from 'yaml';
import { z } from 'zod';
import { contentPath } from './content.ts';
import { METRIC_KEYS } from './portfolio.ts';

const nullableText = z.string().trim().min(1).nullable();
const decimals = z.number().int().min(0).max(2).default(0);

/** Bizonyíték-sáv eleme: a portfolio.yaml méréseiből számolt vagy kézi (forrással). */
export const ProofItemSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('portfolio_mean'),
    metric: z.enum(METRIC_KEYS),
    label: z.string().min(3),
    decimals,
  }),
  z.object({
    type: z.literal('portfolio_median'),
    metric: z.enum(METRIC_KEYS),
    label: z.string().min(3),
    decimals,
  }),
  z.object({
    type: z.literal('manual'),
    value: z.number(),
    unit: z.string().default(''),
    label: z.string().min(3),
    decimals,
    source: z.string().min(3),
    measured_at: z.iso.date(),
  }),
]);

export const SiteSchema = z.object({
  brand: z.string().min(1),
  meta: z.object({
    title: z.string().min(10).max(60),
    description: z.string().min(50).max(155),
  }),
  company: z.object({
    legal_name: nullableText,
    owner_name: nullableText,
    address: nullableText,
    tax_id: z
      .string()
      .regex(/^\d{8}-\d-\d{2}$/, 'Az adószám formátuma: 12345678-1-12')
      .nullable(),
    email: z.email().nullable(),
    phone: z
      .string()
      .regex(/^\+36[\d ]{8,12}$/, 'A telefonszám nemzetközi formátumban: +36 …')
      .nullable(),
  }),
  domains: z.object({
    brand: z.string().min(3),
    sender: z.string().min(3),
  }),
  hero: z.object({
    /** „Új projektek indítása: …” – csak ha igaz (6.2) */
    status_month: nullableText.default(null),
  }),
  proof: z.object({
    items: z.array(ProofItemSchema).max(3).default([]),
  }),
  contact: z.object({
    /** „[X] munkanapon belül” (6.9) */
    response_days: z.number().int().min(1).max(30).nullable().default(null),
  }),
});

export type Site = z.infer<typeof SiteSchema>;
export type ProofItem = z.infer<typeof ProofItemSchema>;

/** Élesítés előtt kötelező mezők (a tartalom-őr --release módban ellenőrzi). */
export const LAUNCH_REQUIRED = [
  'company.legal_name',
  'company.owner_name',
  'company.address',
  'company.tax_id',
  'company.email',
  'company.phone',
  'contact.response_days',
] as const;

export function loadSite(file = contentPath('site.yaml')): Site {
  const raw: unknown = parse(readFileSync(file, 'utf8'));
  const result = SiteSchema.safeParse(raw);
  if (!result.success) {
    throw new Error(`Hibás ${file}:\n${z.prettifyError(result.error)}`);
  }
  return result.data;
}

export const site = loadSite();

/** Telefonszám tel: linkhez (szóközök nélkül). */
export const telHref = (phone: string) => `tel:${phone.replace(/\s/g, '')}`;
