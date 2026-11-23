/**
 * content/portfolio.yaml – a referenciák egyetlen forrása (master prompt 2.5, 11.).
 * Az OutreachEngine kötelező mezői: id, name, live_url, description, industry, type,
 * approved_for_outreach. A weboldal csak opcionális mezőket tesz hozzá (PLAN 2., Q4).
 * Az oldal kizárólag approved_for_outreach: true tételt mutat.
 */
import { existsSync, readFileSync } from 'node:fs';
import { parse } from 'yaml';
import { z } from 'zod';
import { contentPath } from './content.ts';

export const METRIC_KEYS = [
  'psi_mobile',
  'psi_desktop',
  'lcp_mobile',
  'cls_mobile',
  'inp_mobile',
  'custom',
] as const;

export const MetricSchema = z.object({
  key: z.enum(METRIC_KEYS),
  label: z.string().min(2),
  /** null, ha nincs „előtte” mérés (pl. új oldal) */
  before: z.number().nullable().default(null),
  after: z.number(),
  unit: z.string().default(''),
  decimals: z.number().int().min(0).max(3).default(0),
  better: z.enum(['higher', 'lower']).default('higher'),
  measured_at: z.iso.date(),
  tool: z.string().min(3),
  /** a nyers mérés helye a content/ mappán belül, pl. measurements/pelda-2026-11-20.json */
  source: z.string().min(3),
});

export const WorkSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/, 'Az azonosító kisbetű, szám és kötőjel lehet.'),
  name: z.string().min(2),
  live_url: z.url(),
  description: z.string().min(10).max(220),
  industry: z.string().min(2),
  type: z.enum(['client_project', 'concept_demo']),
  approved_for_outreach: z.boolean(),
  // --- a weboldal opcionális mezői ---
  featured: z.boolean().default(false),
  year_before: z.number().int().min(1995).max(2100).nullable().default(null),
  work_type: z.string().min(2).nullable().default(null),
  permission: z
    .object({
      written: z.boolean(),
      date: z.iso.date(),
      scope: z.array(z.enum(['name', 'screenshots', 'metrics', 'logo', 'quote'])).min(1),
    })
    .nullable()
    .default(null),
  images: z
    .object({
      desktop: z.string(),
      mobile: z.string(),
      before: z.string().nullable().default(null),
      after: z.string().nullable().default(null),
      alt_desktop: z.string().min(10),
      alt_mobile: z.string().min(10),
    })
    .nullable()
    .default(null),
  metrics: z.array(MetricSchema).default([]),
});

export type Metric = z.infer<typeof MetricSchema>;
export type Work = z.infer<typeof WorkSchema>;

export const PortfolioSchema = z.array(WorkSchema).superRefine((works, ctx) => {
  const ids = new Set<string>();
  works.forEach((w, i) => {
    if (ids.has(w.id))
      ctx.addIssue({ code: 'custom', path: [i, 'id'], message: `Ismétlődő azonosító: ${w.id}` });
    ids.add(w.id);
    if (w.approved_for_outreach && w.type === 'client_project' && !w.permission?.written) {
      ctx.addIssue({
        code: 'custom',
        path: [i, 'permission'],
        message: `${w.id}: jóváhagyott ügyfélmunkához írásos engedély kell (permission.written: true).`,
      });
    }
  });
  const featured = works.filter((w) => w.approved_for_outreach && w.featured);
  if (featured.length > 1) {
    ctx.addIssue({
      code: 'custom',
      path: [],
      message: `Legfeljebb egy kiemelt munka lehet, most ${featured.length}.`,
    });
  }
});

/** A hivatkozott fájlok (képek, nyers mérések) léteznek-e a tartalomkönyvtárban. */
export function missingFiles(works: Work[]): string[] {
  const missing: string[] = [];
  for (const w of works) {
    const files = [
      ...(w.images ? [w.images.desktop, w.images.mobile, w.images.before, w.images.after] : []),
    ]
      .filter((f): f is string => !!f)
      .map((f) => `works/${f}`);
    files.push(...w.metrics.map((m) => m.source));
    for (const f of files) if (!existsSync(contentPath(f))) missing.push(`${w.id}: ${f}`);
  }
  return missing;
}

export function loadPortfolio(file = contentPath('portfolio.yaml')): Work[] {
  if (!existsSync(file)) return [];
  const raw: unknown = parse(readFileSync(file, 'utf8')) ?? [];
  const result = PortfolioSchema.safeParse(raw);
  if (!result.success) throw new Error(`Hibás portfolio.yaml:\n${z.prettifyError(result.error)}`);
  const missing = missingFiles(result.data);
  if (missing.length)
    throw new Error(`Hiányzó fájlok a portfolio.yaml-ból:\n- ${missing.join('\n- ')}`);
  return result.data;
}

export const portfolio = loadPortfolio();
/** Csak ezek jelenhetnek meg az oldalon (és a levélben). */
export const approvedWorks = portfolio.filter((w) => w.approved_for_outreach);
export const featuredWork = approvedWorks.find((w) => w.featured) ?? null;

export const TYPE_LABEL: Record<Work['type'], string> = {
  client_project: 'Ügyfélmunka',
  concept_demo: 'Saját koncepciómunka',
};
