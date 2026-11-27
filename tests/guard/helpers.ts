/**
 * Őrtesztek közös része (POLISH_PLAN 1.): a v1-approved build (8796) és az új build (8788)
 * ugyanazon a gépen, ugyanazzal a böngészővel kerül összehasonlításra.
 */
import type { Page } from '@playwright/test';
import sharp from 'sharp';

export const NEW = 'http://localhost:8788';
export const OLD = 'http://localhost:8796';

export interface OpenOptions {
  /** false: a `@supports (--polish: 1)` textúra-blokkok törlése a CSSOM-ból */
  polish?: boolean;
  reducedMotion?: 'reduce' | 'no-preference';
}

/** Megnyitja az oldalt, minden képet betölt, és megvárja a betűket. */
export async function open(page: Page, url: string, opts: OpenOptions = {}): Promise<void> {
  const { polish = true, reducedMotion = 'reduce' } = opts;
  await page.emulateMedia({ reducedMotion });
  await page.goto(url);
  // Az új build végleges kinézete a később betöltött stíluslappal teljes (D-043).
  if (url.startsWith(NEW))
    await page.waitForFunction(() => document.documentElement.classList.contains('tx'));
  // A content-visibility: auto blokkok teljes oldalas képen üresek maradnának (D-033).
  await page.addStyleTag({ content: '.defer-render{content-visibility:visible!important}' });
  if (!polish) await page.evaluate(stripPolish);
  await page.evaluate(async () => {
    const imgs = [...document.images];
    for (const img of imgs) img.loading = 'eager';
    // A decode() a betöltést is megvárja; utána két képkocka, hogy a festés is megtörténjen.
    await Promise.all(imgs.map((img) => img.decode().catch(() => undefined)));
    await document.fonts.ready;
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  });
  await page.waitForLoadState('networkidle');
}

/** A textúra-kapu blokkjainak törlése (a böngészőben fut). */
export function stripPolish(): number {
  let removed = 0;
  const walk = (rules: CSSRuleList, owner: CSSStyleSheet | CSSGroupingRule) => {
    for (let i = rules.length - 1; i >= 0; i--) {
      const rule = rules[i];
      if (!rule) continue;
      if (
        rule instanceof CSSSupportsRule &&
        rule.conditionText.replace(/\s/g, '') === '(--polish:1)'
      ) {
        owner.deleteRule(i);
        removed++;
      } else if (rule instanceof CSSGroupingRule) {
        walk(rule.cssRules, rule);
      }
    }
  };
  for (const sheet of document.styleSheets) {
    try {
      walk(sheet.cssRules, sheet);
    } catch {
      /* idegen stíluslap: nincs ilyen */
    }
  }
  return removed;
}

export interface Diff {
  ratio: number;
  width: number;
  height: number;
  sameSize: boolean;
  diffPng?: Buffer | undefined;
}

/** Képpont-összehasonlítás: eltérő, ha bármely csatorna eltérése > `tolerance`. */
export async function comparePng(a: Buffer, b: Buffer, tolerance = 24): Promise<Diff> {
  const [ra, rb] = await Promise.all(
    [a, b].map((buf) => sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true })),
  );
  if (!ra || !rb) throw new Error('kép nem dekódolható');
  const { width, height } = ra.info;
  if (width !== rb.info.width || height !== rb.info.height) {
    return { ratio: 1, width, height, sameSize: false };
  }
  const out = Buffer.alloc(width * height * 4);
  let diff = 0;
  for (let i = 0; i < ra.data.length; i += 4) {
    let d = 0;
    for (let c = 0; c < 3; c++)
      d = Math.max(d, Math.abs((ra.data[i + c] ?? 0) - (rb.data[i + c] ?? 0)));
    if (d > tolerance) {
      diff++;
      out[i] = 255;
      out[i + 3] = 255;
    } else {
      out[i] = out[i + 1] = out[i + 2] = (ra.data[i] ?? 0) / 3 + 170;
      out[i + 3] = 255;
    }
  }
  const diffPng = diff
    ? await sharp(out, { raw: { width, height, channels: 4 } })
        .png()
        .toBuffer()
    : undefined;
  return { ratio: diff / (width * height), width, height, sameSize: true, diffPng };
}

/** Szerkezet: szekciók sorrendje, címsorok, látható szöveg, linkek, képek, űrlapmezők. */
export function extractStructure() {
  const norm = (s: string | null | undefined) => (s ?? '').replace(/\s+/g, ' ').trim();
  const cls = (e: Element) => norm(e.getAttribute('class')).split(' ')[0] ?? '';
  return {
    sections: [...document.querySelectorAll('body > header, main > *, body > footer')].map(
      (e) => `${e.tagName.toLowerCase()}#${e.id}.${cls(e)}`,
    ),
    headings: [...document.querySelectorAll('h1, h2, h3, h4, h5, h6')].map(
      (h) => `${h.tagName.toLowerCase()}: ${norm(h.textContent)}`,
    ),
    text: norm(document.body.innerText),
    links: [...document.querySelectorAll('a[href]')].map(
      (a) => `${a.getAttribute('href')} | ${norm(a.textContent)}`,
    ),
    images: [...document.querySelectorAll('img, picture source')].map((i) =>
      [i.getAttribute('src'), i.getAttribute('srcset'), i.getAttribute('alt')].join(' | '),
    ),
    fields: [...document.querySelectorAll('form, input, textarea, select, button, label')].map(
      (f) =>
        [
          f.tagName.toLowerCase(),
          f.getAttribute('name'),
          f.getAttribute('type'),
          f.getAttribute('for'),
          f.getAttribute('action'),
          norm(f.textContent),
        ].join(' | '),
    ),
    ids: [...document.querySelectorAll('[id]')].map((e) => e.id),
  };
}

export const COLOR_TOKENS = [
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
] as const;

/**
 * Arculat: minden szövegcsomópont szülőjének számított betű- és színadatai, az azonos stílusú
 * szomszédos szakaszok összevonásával (így a szavankénti span-ekre bontás nem számít eltérésnek).
 */
export function extractStyles(tokens: readonly string[]) {
  const runs: { text: string; style: string }[] = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const transparent = 'rgba(0, 0, 0, 0)';
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const text = (n.textContent ?? '').replace(/\s+/g, '');
    const el = n.parentElement;
    if (!text || !el || el.closest('script, style, noscript, template')) continue;
    const cs = getComputedStyle(el);
    let bg = transparent;
    for (let b: Element | null = el; b; b = b.parentElement) {
      const c = getComputedStyle(b).backgroundColor;
      if (c !== transparent) {
        bg = c;
        break;
      }
    }
    const style = [
      cs.fontFamily,
      cs.fontSize,
      cs.fontWeight,
      cs.lineHeight,
      cs.letterSpacing,
      cs.color,
      bg,
    ].join(' | ');
    const last = runs.at(-1);
    if (last && last.style === style) last.text += text;
    else runs.push({ text, style });
  }
  const root = getComputedStyle(document.documentElement);
  return {
    runs: runs.map((r) => `${r.text} :: ${r.style}`),
    tokens: Object.fromEntries(tokens.map((t) => [t, root.getPropertyValue(t).trim()])),
  };
}
