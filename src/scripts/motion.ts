/**
 * Prémium mozgás (prémium finomítás 5–6.): könyvtár nélkül, Web Animations API +
 * IntersectionObserver. Csak transform, opacity, filter és clip-path animálódik; minden animáció
 * a végén törlődik (`cancel()`), így nem marad inline stílus, `filter` vagy `will-change`.
 *
 * - prefers-reduced-motion: reduce → semmi nem fut (az inline indító sem tesz fel osztályt).
 * - JS nélkül vagy hibánál minden látszik: a hajtás alatti elemek kezdőállapotát csak ez a fájl
 *   állítja be, és csak akkor, ha a szekciójuk az indításkor a képernyő alatt van.
 * - Blur legfeljebb 12 elemen egyszerre; gyenge eszközön (≤ 4 mag vagy saveData) nincs blur.
 */

type From = Keyframe & { filter?: string };
interface Opts {
  delay?: number;
  dur?: number;
  ease?: string;
  /** blur a kezdőállapotban (true = --reveal-blur) */
  blur?: boolean | string;
  /** saját végállapot (alapból a természetes CSS-állapot) */
  to?: Keyframe;
  pseudo?: string;
  /** inline-block az animáció idejére (inline szó- és betű-span-ek transformjához) */
  block?: boolean;
}
type Step = [el: Element | null | undefined, from: From, opts?: Opts];

const root = document.documentElement;
const cl = root.classList;
cl.add('m-ok');

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const css = getComputedStyle(root);
const tok = (n: string) => css.getPropertyValue(`--${n}`).trim();
const ms = (n: string, d: number) => {
  const v = tok(n);
  const x = parseFloat(v);
  return Number.isFinite(x) ? x * (v.endsWith('ms') ? 1 : 1000) : d;
};

export const EASE = tok('ease-out-expo') || 'cubic-bezier(.22,1,.36,1)';
export const SOFT = tok('ease-in-out-soft') || 'cubic-bezier(.65,0,.35,1)';
export const DUR = {
  xs: ms('dur-xs', 180),
  s: ms('dur-s', 420),
  m: ms('dur-m', 700),
  l: ms('dur-l', 1000),
};
export const STAGGER = { word: ms('stagger-word', 70), item: ms('stagger-item', 90) };
const BLUR = tok('reveal-blur') || '10px';
export const RISE = tok('reveal-y') || '0.35em';

const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
const lite = (nav.hardwareConcurrency || 8) <= 4 || !!nav.connection?.saveData;

/** A blur-os animációk időablakai: egyszerre legfeljebb 12 (6.). */
const blurWindows: [number, number][] = [];
function blurAllowed(t0: number, t1: number): boolean {
  if (lite) return false;
  const now = performance.now();
  for (let i = blurWindows.length - 1; i >= 0; i--) {
    if ((blurWindows[i]?.[1] ?? 0) < now) blurWindows.splice(i, 1);
  }
  if (blurWindows.filter(([a, b]) => a < t1 && b > t0).length >= 12) return false;
  blurWindows.push([t0, t1]);
  return true;
}

const live = new Set<Animation>();

/** Egy elem animálása a `from` állapotból a természetes (CSS) állapotba. */
export function play(el: Element | null | undefined, from: From, o: Opts = {}): Animation | null {
  if (!el) return null;
  const h = el as HTMLElement;
  const dur = o.dur ?? DUR.m;
  const delay = o.delay ?? 0;
  const f: From = { ...from };
  const t: Keyframe = { ...o.to };
  if (o.blur) {
    const t0 = performance.now() + delay;
    if (blurAllowed(t0, t0 + dur)) {
      f.filter = `blur(${o.blur === true ? BLUR : o.blur})`;
      t['filter'] ??= 'blur(0px)';
    }
  }
  for (const k of Object.keys(f)) {
    if (k in t) continue;
    t[k] = k === 'opacity' ? 1 : k === 'filter' ? 'none' : k === 'clipPath' ? 'inset(0)' : 'none';
  }
  if (o.block) h.style.display = 'inline-block';
  const a = el.animate([f, t], {
    duration: dur,
    delay,
    easing: o.ease ?? EASE,
    fill: 'both',
    ...(o.pseudo ? { pseudoElement: o.pseudo } : {}),
  });
  unhide(el);
  live.add(a);
  const done = () => {
    a.cancel();
    live.delete(a);
    if (o.block) h.style.removeProperty('display');
  };
  a.finished.then(done, done);
  return a;
}

/** Kezdőállapot a festés előtt (csak a képernyő alatti elemeken). */
function hide(el: Element | null | undefined, from: From, o: Opts = {}) {
  if (!el) return;
  if (o.pseudo) {
    el.classList.add('m-cover');
    return;
  }
  const s = (el as HTMLElement).style;
  for (const [k, v] of Object.entries(from)) {
    if (k !== 'filter' && v != null)
      s.setProperty(
        k.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`),
        String(v),
      );
  }
  (el as HTMLElement).dataset['mHidden'] = Object.keys(from).join(' ');
}

function unhide(el: Element) {
  el.classList.remove('m-cover');
  const h = el as HTMLElement;
  const keys = h.dataset['mHidden'];
  if (keys === undefined) return;
  for (const k of keys.split(' '))
    h.style.removeProperty(k.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`));
  delete h.dataset['mHidden'];
}

/** Lépcsőzött lépések szavakra/elemekre. */
export function stagger(
  els: Iterable<Element>,
  from: From,
  o: Opts & { each?: number } = {},
): Step[] {
  const each = o.each ?? STAGGER.item;
  return [...els].map((el, i) => [el, from, { ...o, delay: (o.delay ?? 0) + i * each }]);
}

/** A szavankénti kiírás lépései (V4/V7). */
export function words(el: Element | null, o: Opts & { each?: number } = {}): Step[] {
  if (!el) return [];
  return stagger(
    el.querySelectorAll(':scope > span, :scope .marked > span:first-child'),
    { opacity: 0, transform: `translateY(${RISE})` },
    { blur: true, block: true, each: STAGGER.word, ...o },
  );
}

// ───────── Görgetésre induló csoportok (5.2) ─────────
interface Group {
  trigger: Element;
  steps: Step[];
  run?: () => void;
}
const groups: Group[] = [];
const fold = () => innerHeight;

/**
 * Egy csoport: amikor a `trigger` ≥ 20%-ban (vagy a képernyő 20%-ában) látszik, a lépések
 * lefutnak. Ha a szekciója az indításkor nem a képernyő alatt van, semmi nem rejtőzik el.
 */
export function onView(trigger: Element | null | undefined, steps: Step[], run?: () => void) {
  if (!trigger || reduce) return;
  const section = trigger.closest('main > *, body > footer') ?? trigger;
  if (section.getBoundingClientRect().top < fold()) return;
  for (const [el, from, o] of steps) hide(el, from, o);
  const g: Group = { trigger, steps };
  if (run) g.run = run;
  groups.push(g);
  io?.observe(trigger);
}

const io =
  'IntersectionObserver' in window
    ? new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (!e.isIntersecting) continue;
            if (e.intersectionRatio < 0.2 && e.intersectionRect.height < innerHeight * 0.2)
              continue;
            io?.unobserve(e.target);
            for (const g of groups.filter((x) => x.trigger === e.target)) fire(g);
          }
        },
        { threshold: [0, 0.2] },
      )
    : null;

function fire(g: Group) {
  groups.splice(groups.indexOf(g), 1);
  for (const [el, from, o] of g.steps) play(el, from, o);
  g.run?.();
}

/** Nyomtatáskor minden azonnal a végállapotba kerül. */
addEventListener('beforeprint', () => {
  for (const g of [...groups]) {
    groups.splice(groups.indexOf(g), 1);
    for (const [el] of g.steps) if (el) unhide(el);
  }
  for (const a of live) a.finish();
});

export const motionOn = !reduce && 'animate' in root;

// ───────── Szekciócímek (V7) ─────────
if (motionOn) {
  for (const h of document.querySelectorAll('main h2[data-reveal]')) onView(h, words(h));
}
