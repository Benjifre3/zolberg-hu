/**
 * Melyik jogi oldal létezik (a content/legal/*.md alapján). A lábléc és az űrlap csak meglévő
 * oldalra linkel; a tartalom-őr éles módban mindkettőt megköveteli (D-038).
 */
import { existsSync } from 'node:fs';
import { contentPath } from './content.ts';

export const LEGAL_PAGES = [
  { slug: 'adatkezeles', label: 'Adatkezelési tájékoztató' },
  { slug: 'impresszum', label: 'Impresszum' },
] as const;

export type LegalSlug = (typeof LEGAL_PAGES)[number]['slug'];

export const hasLegal = (slug: LegalSlug): boolean =>
  existsSync(contentPath('legal', `${slug}.md`));

export const existingLegal = () => LEGAL_PAGES.filter((p) => hasLegal(p.slug));
