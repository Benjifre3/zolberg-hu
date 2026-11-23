/**
 * content/site.yaml betöltése és validálása (zod). Környezeti felülírás a tesztekhez:
 * SITE_FILE=tests/fixtures/site.fixture.yaml
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parse } from 'yaml';
import { z } from 'zod';

const nullableText = z.string().trim().min(1).nullable();

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
});

export type Site = z.infer<typeof SiteSchema>;

/** Élesítés előtt kötelező mezők (a tartalom-őr --release módban ellenőrzi). */
export const LAUNCH_REQUIRED = [
  'company.legal_name',
  'company.owner_name',
  'company.address',
  'company.tax_id',
  'company.email',
  'company.phone',
] as const;

export function loadSite(file = process.env['SITE_FILE'] ?? 'content/site.yaml'): Site {
  const path = resolve(process.cwd(), file);
  const raw: unknown = parse(readFileSync(path, 'utf8'));
  const result = SiteSchema.safeParse(raw);
  if (!result.success) {
    throw new Error(`Hibás ${file}:\n${z.prettifyError(result.error)}`);
  }
  return result.data;
}

export const site = loadSite();
