/**
 * Linkellenőrzés (master prompt 12.3): nincs törött belső vagy külső link.
 *
 *   node scripts/check-links.ts             → belső linkek, horgonyok, erőforrások a dist/-ben
 *   node scripts/check-links.ts --external  → + külső http(s) linkek (HEAD, majd GET), 10 mp-es
 *                                              időkorláttal; csak éles tartalommal van értelme
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname, posix } from 'node:path';
import { parse } from 'node-html-parser';

const DIST = 'dist';
const EXTERNAL = process.argv.includes('--external');

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

/** Útvonal → dist-fájl (Cloudflare Pages „pretty URL”: /x → x.html vagy x/index.html). */
function fileFor(urlPath: string): string | null {
  const clean = decodeURIComponent(urlPath.split(/[?#]/)[0] ?? '/');
  const candidates =
    clean === '/'
      ? ['index.html']
      : [clean.slice(1), `${clean.slice(1)}.html`, `${clean.slice(1)}/index.html`];
  return (
    candidates.map((c) => join(DIST, c)).find((p) => existsSync(p) && statSync(p).isFile()) ?? null
  );
}

/** Pages Function-útvonal (pl. /api/contact → functions/api/contact.ts). */
const isFunction = (urlPath: string) =>
  existsSync(join('functions', `${urlPath.split(/[?#]/)[0]}.ts`));

const idCache = new Map<string, Set<string>>();
function ids(file: string): Set<string> {
  let set = idCache.get(file);
  if (!set) {
    set = new Set(
      parse(readFileSync(file, 'utf8'))
        .querySelectorAll('[id]')
        .map((e) => e.id),
    );
    idCache.set(file, set);
  }
  return set;
}

const problems: string[] = [];
const external = new Map<string, string[]>();

for (const file of walk(DIST).filter((f) => extname(f) === '.html')) {
  const page =
    '/' +
    file
      .slice(DIST.length + 1)
      .replace(/\\/g, '/')
      .replace(/(index)?\.html$/, '');
  const root = parse(readFileSync(file, 'utf8'));
  const refs = [
    ...root.querySelectorAll('a[href], link[href]').map((e) => e.getAttribute('href') ?? ''),
    ...root.querySelectorAll('img[src], script[src]').map((e) => e.getAttribute('src') ?? ''),
    ...root.querySelectorAll('form[action]').map((e) => e.getAttribute('action') ?? ''),
    ...root
      .querySelectorAll('img[srcset], source[srcset]')
      .flatMap((e) =>
        (e.getAttribute('srcset') ?? '').split(',').map((c) => c.trim().split(/\s+/)[0] ?? ''),
      ),
  ].filter(Boolean);

  for (const ref of new Set(refs)) {
    if (/^(mailto|tel|data):/.test(ref)) continue;
    if (/^https?:\/\//.test(ref)) {
      const list = external.get(ref) ?? [];
      list.push(page);
      external.set(ref, list);
      continue;
    }
    const [pathPart, hash] = ref.split('#') as [string, string | undefined];
    const target =
      pathPart === '' ? page || '/' : posix.resolve(posix.dirname(page || '/'), pathPart);
    if (isFunction(target)) continue;
    const targetFile = fileFor(target);
    if (!targetFile) {
      problems.push(`${page}: törött belső link → ${ref}`);
      continue;
    }
    if (hash && extname(targetFile) === '.html' && !ids(targetFile).has(decodeURIComponent(hash))) {
      problems.push(`${page}: nem létező horgony → ${ref}`);
    }
  }
}

if (EXTERNAL) {
  for (const [url, pages] of external) {
    // Az oldal saját kanonikus/OG URL-jei a még nem élő domainre mutatnak: azokat nem kérjük le.
    if (/^https:\/\/(www\.)?zolberg\.hu\//.test(url)) continue;
    let status = 0;
    for (const method of ['HEAD', 'GET'] as const) {
      try {
        const res = await fetch(url, {
          method,
          redirect: 'follow',
          signal: AbortSignal.timeout(10_000),
        });
        status = res.status;
        if (res.ok) break;
      } catch {
        status = 0;
      }
    }
    if (status < 200 || status >= 400) {
      problems.push(`${pages[0]}: törött külső link (${status || 'nincs válasz'}) → ${url}`);
    }
  }
}

if (problems.length) {
  console.error(`Linkellenőrzés: ${problems.length} hiba\n- ${problems.join('\n- ')}`);
  process.exit(1);
}
console.log(
  `Linkellenőrzés: rendben (${idCache.size} oldal horgonyai, ${external.size} külső link${EXTERNAL ? ' ellenőrizve' : ', nem ellenőrizve'}).`,
);
