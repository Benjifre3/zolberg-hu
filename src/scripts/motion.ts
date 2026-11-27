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

import deferredCss from '../styles/deferred.css?url';

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
  /** teljes kulcskocka-sor (a from/to helyett) */
  frames?: Keyframe[];
}
type Step = [el: Element | null | undefined, from: From, opts?: Opts];

const root = document.documentElement;
const cl = root.classList;
cl.add('m-ok');

// A nem kritikus prémium-stílusok (textúra, hajtás alatti anyagok, interakciók) az első tartalmas
// festés (FCP) és a load után (D-043), mozgástól függetlenül: így nem versenyeznek a hero-képpel,
// és a lassú hálózat sem csúszik ki az első TCP-ablakból. Betöltve a <html> `tx` osztályt kap.
let txDone = false;
const tx = () => {
  if (txDone) return;
  txDone = true;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = deferredCss;
  link.onload = () => cl.add('tx');
  document.head.append(link);
};
const afterLoad = () =>
  document.readyState === 'complete' ? tx() : addEventListener('load', tx, { once: true });
const loadDeferred = () => {
  setTimeout(tx, 3000); // tartalék, ha nincs paint timing
  if (performance.getEntriesByName('first-contentful-paint').length) return afterLoad();
  try {
    new PerformanceObserver((list, obs) => {
      if (!list.getEntriesByName('first-contentful-paint').length) return;
      obs.disconnect();
      afterLoad();
    }).observe({ type: 'paint', buffered: true });
  } catch {
    afterLoad();
  }
};

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
  const a = el.animate(o.frames ?? [f, t], {
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
    tidy(h);
  };
  a.finished.then(done, done);
  return a;
}

/** Üres style-attribútum nem marad az elemen. */
function tidy(h: HTMLElement) {
  if (!h.style.length) h.removeAttribute('style');
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
  tidy(h);
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
  /** az IO első jelentése megjött (a trigger akkor nem látszott, a lépések rejtve) */
  armed?: boolean;
}
const groups: Group[] = [];

/**
 * Egy csoport: amikor a `trigger` ≥ 20%-ban (vagy a képernyő 20%-ában) látszik, a lépések
 * lefutnak. Hogy rejtsünk-e, az IntersectionObserver első, aszinkron jelentése dönti el
 * (kényszerített elrendezés nélkül, D-043): ami az indításkor már látszik – akár csak egy
 * csíkja, pl. horgonyra érkezve –, az nem animálódik és nem villan; ami nem, az rejtve vár.
 */
export function onView(trigger: Element | null | undefined, steps: Step[], run?: () => void) {
  if (!trigger || reduce || !io) return;
  const g: Group = { trigger, steps };
  if (run) g.run = run;
  groups.push(g);
  io.observe(trigger);
}

const io =
  'IntersectionObserver' in window
    ? new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            for (const g of groups.filter((x) => x.trigger === e.target)) {
              if (!g.armed) {
                if (e.isIntersecting) {
                  groups.splice(groups.indexOf(g), 1);
                  io?.unobserve(e.target);
                } else {
                  g.armed = true;
                  for (const [el, from, o] of g.steps) hide(el, from, o);
                }
                continue;
              }
              if (!e.isIntersecting) continue;
              if (e.intersectionRatio < 0.2 && e.intersectionRect.height < innerHeight * 0.2)
                continue;
              io?.unobserve(e.target);
              fire(g);
            }
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

const $ = (s: string) => document.querySelector(s);
const $$ = (s: string) => [...document.querySelectorAll(s)];
const rise = (y: string): From => ({ opacity: 0, transform: `translateY(${y})` });
const run = (steps: Step[]) => steps.forEach(([el, f, o]) => play(el, f, o));

// ───────── Hero-belépő (5.1) ─────────
/**
 * Első látogatás (.intro, ≤ 1,6 s): V1 a hero-keret élesre áll, V2 a pont középről a helyére,
 * a betűk lépcsőzve élesednek, V3 fejléc, V4 H1 szavanként + ceruza, V5 alcím és gombok,
 * V6 állapotsor és telefon. Visszatérő látogató (.intro-short): csak a H1 és a ceruza, 600 ms.
 * Ha az oldal horgonnyal vagy görgetve nyílik, nincs belépő.
 */
function intro() {
  const full = cl.contains('intro');
  if (!full && !cl.contains('intro-short')) return;
  if (location.hash || scrollY > 0) return;
  // olvasás minden írás előtt (egyetlen elrendezés)
  const dot = full ? $('.site-header .wordmark__dot') : null;
  const r = dot?.getBoundingClientRect();
  const h1 = $('.hero__title');
  const ws = h1 ? [...h1.querySelectorAll('[data-i="w"]:not(.mark)')] : [];
  const mark = h1?.querySelector('.mark');

  // V4: H1 szavanként blurból élesre; a „mérés” után a ceruza (a v1 kirajzolása)
  const each = full ? STAGGER.word : 40;
  const dur = full ? DUR.s : 360;
  const at = full ? 250 : 0;
  ws.forEach((w, i) => play(w, rise(RISE), { delay: at + i * each, dur, blur: true, block: true }));
  const markAt =
    at +
    Math.max(
      0,
      ws.findIndex((w) => w.closest('.marked')),
    ) *
      each +
    dur * 0.6;
  const pencil = {
    delay: markAt,
    dur: full ? 900 : 600 - markAt,
    ease: 'cubic-bezier(.2,.7,.2,1)',
  };
  play(mark?.querySelector('.mark__clip'), { transform: 'translateX(-100%)' }, pencil);
  play(mark?.querySelector('.mark__ink'), { transform: 'translateX(100%)' }, pencil);
  if (mark) unhide(mark);
  if (!full) return;

  // V1: a hero-keret „kamera-fókusza” (opacity nélkül: LCP-elem marad)
  play($('.hero-visual__desktop'), { transform: 'scale(1.06)' }, { dur: 600, blur: '16px' });

  // V2: a pont a képernyő közepéről, kicsiből nő a helyére, lágy pulzussal; utána a betűk
  if (dot && r) {
    const dx = innerWidth / 2 - r.left - r.width / 2;
    const dy = innerHeight / 2 - r.top - r.height / 2;
    play(
      dot,
      {},
      {
        dur: DUR.m,
        block: true,
        // szakaszonkénti görbe: az út a 72%-ig lágyan fékez, utána a pulzus
        ease: 'linear',
        frames: [
          { opacity: 0, transform: `translate(${dx}px,${dy}px) scale(.3)`, easing: SOFT },
          { opacity: 1, offset: 0.2 },
          { transform: 'none', offset: 0.72, easing: SOFT },
          { transform: 'scale(1.14)', offset: 0.86, easing: SOFT },
          { opacity: 1, transform: 'none' },
        ],
      },
    );
  }
  // a betűk inline maradnak (opacity és filter inline elemen is működik): a link látható
  // szövege végig „zolberg.” marad (axe: label-content-name-mismatch)
  run(
    stagger(
      $$('.site-header .wordmark > [data-i]:not(.wordmark__dot)'),
      { opacity: 0 },
      {
        delay: 200,
        each: 25,
        dur: 300,
        blur: '6px',
      },
    ),
  );

  // V3: navigáció és gomb
  run(
    stagger($$('.site-header :is(li, .btn)[data-i]'), rise('-8px'), {
      delay: 150,
      each: 40,
      dur: 300,
    }),
  );

  // V5: alcím, fő gomb (0,96 → 1), másodlagos link
  play($('.hero__lead'), rise('8px'), { delay: 700, dur: 300 });
  $$('.hero__actions [data-i]').forEach((b, i) =>
    play(
      b,
      { opacity: 0, transform: `translateY(8px) scale(${i ? 1 : 0.96})` },
      { delay: 800 + i * 80, dur: 300 },
    ),
  );

  // V6: állapotsor; a rálógó telefon 24 px-ről, az asztali keret után (rétegzés); képaláírás
  play($('.hero__status'), rise('6px'), { delay: 900, dur: 300 });
  play($('.hero-visual__phone'), rise('24px'), { delay: 1000, dur: DUR.s });
  play($('.hero-visual__caption'), rise('6px'), { delay: 1100, dur: 300 });
}

// ───────── Görgetésre induló jelenetek (5.2) ─────────
/**
 * Az első képkocka után, külön feladatban (D-043): a hajtás alatti elemek a festéskor úgysem
 * látszanak, így az LCP-kép festését és a TBT-t nem terheli a beállításuk.
 */
function scenes() {
  const I = STAGGER.item;
  const fade: From = { opacity: 0 };
  const up = (px: number) => rise(`${px}px`);
  /** a sáv háttere papírból a saját színébe úszik (fedőréteg a ::before-on, csak opacity) */
  const cover = (band: Element | null): Step => [
    band,
    { opacity: 1 },
    { pseudo: '::before', to: { opacity: 0 }, dur: DUR.m, ease: SOFT },
  ];

  // V7: szekciócímek szavanként
  for (const h of $$('main h2[data-reveal]')) onView(h, words(h));

  // V11 + V12: bizonyíték-sáv – papír → tinta, a számok blurból (a meglévő count-up mellett),
  // a mono forrás-sor utolsóként
  const proof = $('.proof');
  onView(proof, [
    cover(proof),
    ...stagger($$('.proof__value'), up(12), { delay: 200, blur: true }),
    ...stagger($$('.proof__label'), up(8), { delay: 320, dur: DUR.s }),
    ...stagger($$('.proof__source'), fade, { delay: 600, dur: DUR.s }),
  ]);

  // V8: kiemelt munka – a keret alulról és kicsinyítve, a jobb oldal lépcsőzve, metrika count-up
  const featured = $('.featured__card');
  onView(
    featured,
    [
      [
        $('.featured__media'),
        { opacity: 0, transform: 'translateY(48px) scale(.97)' },
        { dur: DUR.l },
      ],
      ...stagger($$('.featured__body > *'), up(16), { delay: 160, dur: DUR.s }),
    ],
    () =>
      $$('.metrics--large .metrics__value').forEach((v, i) =>
        setTimeout(() => countUp(v), 500 + i * I),
      ),
  );

  // V9: előtte/utána csúszka – egyszeri, lassú „megmutatás”, ha még senki nem nyúlt hozzá
  const ba = $('[data-before-after]');
  onView(ba, [], () => hint(ba));

  // V10: szűrő-pirulák balról jobbra
  const filter = $('[data-work-filter]');
  onView(filter, stagger($$('[data-work-filter] .pill'), up(6), { each: 60, dur: DUR.s }));

  // V8: munkarács – soronként emelkedés, bent kép → név → metrikák → címkék
  const two = innerWidth >= 834;
  $$('.works__grid .work-card').forEach((card, i) => {
    const d = two ? (i % 2) * I : 0;
    onView(card, [
      [card, up(64), { delay: d, dur: DUR.l }],
      ...stagger(
        card.querySelectorAll(
          '.work-card__title, .work-card__text, .metrics, .work-tags, .work-card__links',
        ),
        up(10),
        { delay: d + 240, dur: DUR.s, each: 70 },
      ),
    ]);
  });

  // V8 + V9: szolgáltatás – kártya-lépcső, az ikonok vonala kirajzolódik (600 ms)
  const cards = $$('.services__card');
  onView($('.services__grid'), [
    ...stagger(cards, up(40), { dur: DUR.m }),
    ...cards.flatMap((c, i) =>
      [...c.querySelectorAll('.services__icon path')].map((p): Step => [
        p,
        { strokeDasharray: '1', strokeDashoffset: '1' },
        {
          delay: 200 + i * I,
          dur: 600,
          ease: SOFT,
          to: { strokeDasharray: '1', strokeDashoffset: '0' },
        },
      ]),
    ),
  ]);

  // V12: folyamat – papír → erdőzöld, a 01–04 maszk mögül csúszik fel
  const process = $('.process');
  onView(process, [
    cover(process),
    ...stagger(
      $$('.process__num'),
      { transform: 'translateY(100%)', clipPath: 'inset(-30% -10% 100% -10%)' },
      {
        delay: 250,
        dur: DUR.m,
        to: { clipPath: 'inset(-30% -10% -30% -10%)' },
      },
    ),
  ]);

  // V8: rólam – a portré blurból és 1,04-ről; a cégadat-sor gépelésszerűen (clip-path, ≤ 500 ms)
  const facts = $('.about__facts');
  onView($('.about'), [
    [$('.about__portrait'), { opacity: 0, transform: 'scale(1.04)' }, { blur: true, dur: DUR.l }],
    [
      facts,
      { clipPath: 'inset(0 100% 0 0)' },
      {
        delay: 600,
        dur: Math.min(500, (facts?.textContent?.length ?? 0) * 12),
        ease: `steps(${facts?.textContent?.length ?? 1})`,
      },
    ],
  ]);

  // V13: GYIK – a kérdések lépcsőzve (a <details> magasság-animációja CSS: deferred.css)
  onView($('.faq__list'), stagger($$('.faq__item'), up(16), { dur: DUR.s, each: 70 }));

  // V14: kapcsolat – a teljes panel 80 px-ről lassan, utána a mezők sorban
  const contact = $('.contact');
  onView(contact, [
    [contact, up(80), { dur: DUR.l }],
    ...stagger($$('.cform__field, .cform__submit'), up(12), { delay: 400, dur: DUR.s }),
  ]);

  // V14: lábléc – az óriás szóvédjegy betűnként maszk mögül, a pont utolsóként „koppan”
  const giant = $$('.site-footer__giant .wordmark > span');
  const dotEl = giant.pop();
  onView($('.site-footer__giant'), [
    ...stagger(
      giant,
      { opacity: 0, transform: 'translateY(100%)', clipPath: 'inset(-40% -10% 100% -10%)' },
      {
        each: 45,
        dur: DUR.m,
        block: true,
        to: { clipPath: 'inset(-40% -10% -40% -10%)' },
      },
    ),
    [
      dotEl,
      { opacity: 0, transform: 'scale(0)' },
      { delay: giant.length * 45 + 250, dur: DUR.s, block: true },
    ],
  ]);

  spotlight();
}

/** Count-up a mért értékeken (a szöveg a végén pontosan az eredeti; a szélesség rögzített). */
function countUp(el: Element) {
  const h = el as HTMLElement;
  const final = h.textContent ?? '';
  const nums = [...final.matchAll(/\d+(?:,\d+)?/g)].map((m) => m[0]);
  if (!nums.length) return;
  h.style.minWidth = `${h.getBoundingClientRect().width}px`;
  const t0 = performance.now();
  const step = (now: number) => {
    const p = Math.min(1, (now - t0) / 900);
    const e = 1 - (1 - p) ** 3;
    let i = 0;
    h.textContent =
      p < 1
        ? final.replace(/\d+(?:,\d+)?/g, (n) => {
            const dec = (nums[i++] ?? n).split(',')[1]?.length ?? 0;
            return (parseFloat(n.replace(',', '.')) * e).toFixed(dec).replace('.', ',');
          })
        : final;
    if (p < 1) requestAnimationFrame(step);
    else {
      h.style.removeProperty('min-width');
      tidy(h);
    }
  };
  requestAnimationFrame(step);
}

/** A csúszka egyszeri „megmutatása”: 50 → 38 → 50% (1,2 s), csak érintetlen csúszkán. */
function hint(root: Element | null) {
  const range = root?.querySelector<HTMLInputElement>('[data-ba-range]');
  const handle = root?.querySelector('[data-ba-handle]');
  const before = root?.querySelector('[data-ba-before]');
  if (!root || !range || !handle || !before || range.value !== '50') return;
  const dx = -(root.querySelector('.ba__stage')?.clientWidth ?? 0) * 0.12;
  const o: KeyframeAnimationOptions = { duration: 1200, easing: SOFT };
  const anims = [
    handle.animate(
      [{ transform: 'none' }, { transform: `translateX(${dx}px)` }, { transform: 'none' }],
      o,
    ),
    before.animate(
      [
        { clipPath: 'inset(0 50% 0 0)' },
        { clipPath: 'inset(0 62% 0 0)' },
        { clipPath: 'inset(0 50% 0 0)' },
      ],
      o,
    ),
  ];
  const stop = () => anims.forEach((a) => a.cancel());
  for (const ev of ['pointerdown', 'keydown', 'input', 'focus'])
    range.addEventListener(ev, stop, { once: true });
}

/** Kurzort követő lágy fény a szolgáltatás-kártyákon (csak finom mutatóval, hoverre). */
function spotlight() {
  if (!matchMedia('(pointer: fine) and (hover: hover)').matches) return;
  for (const card of $$('.services__card')) {
    const c = card as HTMLElement;
    let raf = 0;
    c.addEventListener('pointermove', (e) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = c.getBoundingClientRect();
        c.style.backgroundImage = `radial-gradient(260px circle at ${e.clientX - r.left}px ${e.clientY - r.top}px, rgb(255 255 255 / .55), transparent 70%)`;
      });
    });
    c.addEventListener('pointerleave', () => {
      cancelAnimationFrame(raf);
      c.style.removeProperty('background-image');
      tidy(c);
    });
  }
}
/**
 * Indítás az első képkocka után (D-043): a modul-szkript a Chrome-ban az első festés előtt fut,
 * így minden itt végzett munka az LCP-t tolná. A festéskor a CSS-kezdőállapot (.intro: átlátszó,
 * illetve elmosott keret) már ugyanaz, mint az animációk kezdőkockája, ezért az átvétel
 * észrevétlen. A rAF háttérlapon nem fut: a setTimeout a tartalék.
 */
let started = false;
const start = () => {
  if (started) return;
  started = true;
  if (motionOn) intro();
  cl.remove('intro', 'intro-short');
  if (motionOn) setTimeout(scenes);
  loadDeferred();
};
requestAnimationFrame(() => setTimeout(start));
setTimeout(start, 200);
