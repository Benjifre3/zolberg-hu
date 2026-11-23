/**
 * A tartalom-őr szabályai (master prompt 2.1, 2.2, 12.3), egyetlen HTML-dokumentumra.
 * A scripts/content-guard.ts a dist/ minden oldalán futtatja; a unit teszt közvetlenül hívja.
 */
import { parse, NodeType, type HTMLElement, type Node } from 'node-html-parser';

/** Szögletes zárójeles helyőrző, pl. [Teljes név], [X] nap, [42]. JSON-tömb nem egyezik (idézőjel). */
export const PLACEHOLDER = /\[[\p{L}\p{N} .,:;/()–+-]{1,60}\]/u;

const FORBIDDEN = [
  { re: PLACEHOLDER, why: 'szögletes zárójeles helyőrző' },
  { re: /lorem|ipsum/i, why: '„lorem ipsum” szöveg' },
  { re: /\b(TODO|FIXME|TBD|XXX)\b/, why: 'fejlesztői jelölés' },
];
const RELEASE_FORBIDDEN = [
  { re: /TESZTADAT|\bTeszt (Kft|Bt|Zrt)\b/, why: 'tesztadat az éles kimenetben' },
];
const CHECKED_ATTRS = [
  'alt',
  'title',
  'aria-label',
  'aria-description',
  'content',
  'placeholder',
  'value',
];

/** Látható szöveg + ellenőrzött attribútumok; a <style> és a nem JSON-LD <script> kimarad. */
function collectTexts(node: Node, out: string[] = []): string[] {
  for (const child of node.childNodes) {
    if (child.nodeType === NodeType.TEXT_NODE) {
      out.push(child.rawText);
    } else if (child.nodeType === NodeType.ELEMENT_NODE) {
      const el = child as HTMLElement;
      if (el.tagName === 'STYLE') continue;
      if (el.tagName === 'SCRIPT' && el.getAttribute('type') !== 'application/ld+json') continue;
      for (const a of CHECKED_ATTRS) {
        const v = el.getAttribute(a);
        if (v) out.push(v);
      }
      collectTexts(el, out);
    }
  }
  return out;
}

export function checkHtml(html: string, { release = false } = {}): string[] {
  const problems: string[] = [];
  const root = parse(html);
  const rules = release ? [...FORBIDDEN, ...RELEASE_FORBIDDEN] : FORBIDDEN;

  for (const raw of collectTexts(root)) {
    const text = raw.replace(/\s+/g, ' ').trim();
    if (!text) continue;
    for (const { re, why } of rules) {
      const m = text.match(re);
      if (m) problems.push(`${why}: „${m[0]}” – ${text.slice(0, 80)}`);
    }
  }

  // Koncepciómunka csak címkével (2.2)
  for (const el of root.querySelectorAll('[data-work-type="concept_demo"]')) {
    if (!el.textContent.includes('Saját koncepciómunka')) {
      const id = el.getAttribute('data-work-id') ?? '?';
      problems.push(`koncepciómunka „Saját koncepciómunka” címke nélkül (${id})`);
    }
  }

  // Minden megjelenített mérés forrással és dátummal (2.1)
  for (const el of root.querySelectorAll('[data-metric]')) {
    const label = el.textContent.trim().slice(0, 40);
    if (!(el.getAttribute('data-source') ?? '').trim()) {
      problems.push(`forrás nélküli szám: ${label}`);
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(el.getAttribute('data-measured-at') ?? '')) {
      problems.push(`dátum nélküli szám: ${label}`);
    }
  }

  if (release) {
    for (const el of root.querySelectorAll('[data-placeholder], [data-fixture]')) {
      const what = el.getAttribute('data-placeholder') ?? 'tesztadat';
      problems.push(`ideiglenes elem az éles kimenetben: <${el.tagName.toLowerCase()}> ${what}`);
    }
  }
  return problems;
}
