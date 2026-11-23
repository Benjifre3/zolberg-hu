/**
 * Tartalom-őr (master prompt 12.3): a build elbukik, ha a kimenetben helyőrző,
 * „lorem”, „TODO”, címke nélküli koncepciómunka vagy forrás és dátum nélküli szám marad.
 *
 *   node scripts/content-guard.ts            → minden buildnél (tesztadattal is)
 *   node scripts/content-guard.ts --release  → éles build: + kötelező cégadatok,
 *                                              + nincs tesztadat és ideiglenes elem
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { checkHtml } from './lib/guard.ts';
import { loadSite, LAUNCH_REQUIRED } from '../src/lib/site.ts';

const DIST = 'dist';
const release = process.argv.includes('--release');

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

const problems: string[] = [];

for (const file of walk(DIST).filter((f) => extname(f) === '.html')) {
  const rel = file.slice(DIST.length + 1);
  for (const p of checkHtml(readFileSync(file, 'utf8'), { release })) problems.push(`${rel}: ${p}`);
}

if (release) {
  const site = loadSite();
  for (const key of LAUNCH_REQUIRED) {
    const value = key
      .split('.')
      .reduce<unknown>((obj, k) => (obj as Record<string, unknown> | null)?.[k], site);
    if (value === null || value === undefined) {
      problems.push(`content/site.yaml: élesítéshez kötelező adat hiányzik: ${key}`);
    }
  }
}

const mode = release ? ' (éles mód)' : '';
if (problems.length) {
  console.error(`Tartalom-őr: ${problems.length} hiba${mode}\n- ${problems.join('\n- ')}`);
  process.exit(1);
}
console.log(`Tartalom-őr: rendben${mode}.`);
