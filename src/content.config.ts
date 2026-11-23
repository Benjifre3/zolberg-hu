/**
 * Jogi oldalak (10.): content/legal/<slug>.md (a tesztekben tests/fixtures/content/legal/).
 * A szöveg a jogi konzultáción véglegesül; amíg egy fájl nincs meg, az oldal nem készül el,
 * a link nem jelenik meg, és az éles build tartalom-őre elbukik (D-038).
 */
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const CONTENT_DIR = resolve(process.env['CONTENT_DIR'] ?? 'content');

const legal = defineCollection({
  // A glob-betöltő abszolút útvonalat file: URL-ként fogad el (Windowson is).
  loader: glob({
    base: pathToFileURL(`${resolve(CONTENT_DIR, 'legal')}/`),
    pattern: '{adatkezeles,impresszum}.md',
  }),
  schema: z.object({
    title: z.string().min(5),
    /** a szöveg hatálybalépése / utolsó módosítása (ISO) */
    updated: z.coerce.date(),
    description: z.string().min(50).max(155),
  }),
});

export const collections = { legal };
