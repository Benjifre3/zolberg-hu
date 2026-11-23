/**
 * A tartalom gyökérkönyvtára. Éles build: content/. Tesztek: CONTENT_DIR=tests/fixtures/content
 * (D-011). Minden tartalomfájl (site.yaml, portfolio.yaml, works/, measurements/) innen jön.
 */
import { resolve } from 'node:path';

export const CONTENT_DIR = resolve(process.cwd(), process.env['CONTENT_DIR'] ?? 'content');

export const contentPath = (...parts: string[]): string => resolve(CONTENT_DIR, ...parts);
