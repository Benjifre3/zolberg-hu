/**
 * Build utáni CSS-minifikálás (D-041): a csak CSS-ben élő custom property nevek rövidítése
 * (`--space-3` → `--a`) a dist/*.html inline <style> blokkjaiban. A számított stílus nem változik
 * (az arculat-őr ellenőrzi); a 25 KB-os CSS-keretbe így fér bele a prémium finomítás.
 *
 * Nem rövidül, amit kívülről név szerint érnek el:
 * - a 11 színtoken és a --signal (kontraszt-teszt, arculat-őr), a mozgás-tokenek (motion.ts),
 *   a --font-* változók (Astro Fonts), a --polish kapu (vizuális őr);
 * - minden név, ami a dist JS-fájljaiban vagy egy HTML style="" attribútumban előfordul.
 * A leképezés minden oldalon ugyanaz (determinisztikus: az összes oldal neveiből, ábécérendben).
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const KEEP = new Set([
  '--paper',
  '--paper-raised',
  '--ink',
  '--ink-2',
  '--accent',
  '--accent-mark',
  '--forest',
  '--accent-on-dark',
  '--sage',
  '--line',
  '--field',
  '--signal',
  '--ease-out-expo',
  '--ease-in-out-soft',
  '--dur-xs',
  '--dur-s',
  '--dur-m',
  '--dur-l',
  '--stagger-word',
  '--stagger-item',
  '--reveal-blur',
  '--reveal-y',
  '--polish',
]);

/** literális értékükre cserélhető hivatkozások (egyszer definiált, felül nem írt színek) */
const COLOR_TOKENS = new Set([
  '--paper',
  '--paper-raised',
  '--ink',
  '--ink-2',
  '--accent',
  '--accent-mark',
  '--forest',
  '--accent-on-dark',
  '--sage',
  '--line',
  '--field',
  '--signal',
]);

const STYLE = /(<style[^>]*>)([\s\S]*?)(<\/style>)/g;
/** custom property a definíció (`--x:`) vagy hivatkozás (`var(--x`) helyén */
const PROP = /(^|[{;(\s,])(--[a-zA-Z][\w-]*)(?=\s*[:),])/g;

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

/** Rövid nevek: --a … --z, --aa … (soha nem ütközik meghagyott névvel). */
function* shortNames(): Generator<string> {
  const abc = 'abcdefghijklmnopqrstuvwxyz';
  for (let len = 1; ; len++) {
    const idx = Array(len).fill(0);
    for (;;) {
      yield `--${idx.map((i) => abc[i]).join('')}`;
      let k = len - 1;
      while (k >= 0 && ++idx[k] === abc.length) idx[k--] = 0;
      if (k < 0) break;
    }
  }
}

export function minifyCssVars(dist: string): { renamed: number; saved: number } {
  const files = walk(dist);
  const html = files.filter((f) => extname(f) === '.html');
  const external = files
    .filter((f) => ['.js', '.mjs'].includes(extname(f)))
    .map((f) => readFileSync(f, 'utf8'))
    .join('\n');

  const names = new Set<string>();
  /** JS-ből vagy style="" attribútumból név szerint elért változók */
  const outside = new Set<string>();
  for (const m of external.matchAll(/--[a-zA-Z][\w-]*/g)) outside.add(m[0]);
  for (const f of html) {
    const src = readFileSync(f, 'utf8');
    for (const s of src.matchAll(/style="([^"]*)"/g))
      for (const m of (s[1] ?? '').matchAll(/--[a-zA-Z][\w-]*/g)) outside.add(m[0]);
    for (const [, , css = ''] of src.matchAll(STYLE))
      for (const m of css.matchAll(PROP)) if (m[2]) names.add(m[2]);
  }
  const blocked = new Set<string>([...KEEP, ...outside]);

  // A színtokenek egyszer, literális színnel definiáltak, és soha nem íródnak felül (a kontextusok
  // csak a szerep-változókat cserélik): a `var(--paper)` hivatkozás így a saját értékére
  // cserélhető. A definíció név szerint megmarad (arculat-őr, kontraszt-teszt).
  const values = new Map<string, Set<string>>();
  for (const f of html)
    for (const [, , css = ''] of readFileSync(f, 'utf8').matchAll(STYLE))
      for (const [, n = '', v = ''] of css.matchAll(/[{;](--[\w-]+):([^;}]*)/g)) {
        if (!values.has(n)) values.set(n, new Set());
        values.get(n)?.add(v.trim());
      }
  const literal = new Map<string, string>();
  for (const n of COLOR_TOKENS) {
    const [v, ...rest] = values.get(n) ?? [];
    if (v && !rest.length && /^#[0-9a-fA-F]{3,8}$/.test(v) && !outside.has(n)) literal.set(n, v);
  }
  const inlineVar = (css: string) =>
    css.replace(/var\((--[\w-]+)\)/g, (all, n: string) => literal.get(n) ?? all);

  const gen = shortNames();
  const map = new Map<string, string>();
  for (const n of [...names].sort()) {
    if (blocked.has(n) || n.startsWith('--font-')) continue;
    let s = gen.next().value as string;
    while (blocked.has(s) || names.has(s)) s = gen.next().value as string;
    map.set(n, s);
  }

  let saved = 0;
  for (const f of html) {
    const src = readFileSync(f, 'utf8');
    const out = src.replace(
      STYLE,
      (_, open: string, css: string, close: string) =>
        open +
        inlineVar(css)
          .replace(PROP, (_all, pre: string, n: string) => pre + (map.get(n) ?? n))
          // a custom propertyt tartalmazó értékekben a minifier meghagyja a „, ” szóközét
          .replace(/("[^"]*"|'[^']*')|, /g, (m, quoted?: string) => quoted ?? ',') +
        close,
    );
    saved += src.length - out.length;
    if (out !== src) writeFileSync(f, out);
  }
  return { renamed: map.size, saved };
}
