# Építési terv – zolberg.hu (R0)

Készült: 2026. november 23. · Bemenet: master prompt v2 (1–12. szakasz), `docs/REFERENCE_REVIEW.md`
Kapcsolódó: `docs/DECISIONS.md` (döntésnapló), `docs/OPEN_QUESTIONS.md` (blokkoló kérdések)

Prioritás ütközéskor: master prompt 2. szakasz → 3–12. szakasz → referencia-elemzés (2. szakasz 7. pont).

---

## 1. Kiinduló állapot (felmérve)

| Tétel          | Állapot                                                                                  | Hatás                                                                                                   |
| -------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Munkamappa     | `C:\Users\User\Desktop\Claude projects\` nem üres (Blender-projekt van benne)            | a projekt a **`zolberg-hu/`** almappába kerül (D-001)                                                   |
| Node.js, pnpm  | **nincs telepítve**                                                                      | a W0 nem indulhat el (Q1)                                                                               |
| Python         | nincs (csak a Microsoft Store-álnév)                                                     | nem kell: a betű-részhalmazolás Node-ban fut (D-008)                                                    |
| Git            | 2.56 megvan, globális név és e-mail nincs beállítva                                      | a repó helyi azonosítóval commitol (D-016, Q7)                                                          |
| OutreachEngine | nincs a gépen kód; a master prompt v2 PDF megvan, a `portfolio.yaml` mezőit abból vettem | a séma bővítését egyeztetni kell (Q4)                                                                   |
| Tartalom       | referenciák, mérések, portré, cégadatok, kézi ceruzavonal még nincs                      | fejlesztés tesztadattal; az éles build a tartalom-őrön elbukik, amíg helyőrző marad (helyes viselkedés) |

---

## 2. Architektúra

### Könyvtárszerkezet

```
zolberg-hu/
├─ astro.config.mjs          output: 'static', site: SITE_URL, @astrojs/sitemap
├─ package.json              pnpm, Node LTS, "type": "module"
├─ tsconfig.json             astro/tsconfigs/strictest
├─ content/
│  ├─ portfolio.yaml         a referenciák egyetlen forrása (OutreachEngine-séma + bővítés)
│  ├─ site.yaml              cégadatok (NAP), kapcsolat, állapotsor, bizonyíték-sáv, folyamat, GYIK
│  └─ measurements/          nyers PSI/Lighthouse JSON-ok (a dátum és a forrás bizonyítéka)
├─ functions/api/contact.ts  Cloudflare Pages Function (POST, natív űrlap is)
├─ public/                   _headers, _redirects, robots.txt, favicon.svg, og.png, grain.png
├─ src/
│  ├─ assets/                fonts (részhalmazolt woff2), works/ (képernyőképek), marks/ (kézi SVG), portrait
│  ├─ styles/global.css      tokenek + reset + alap + segédosztályok (egyetlen globális stíluslap)
│  ├─ layouts/Base.astro     head, meta, JSON-LD, skip link, fejléc, lábléc
│  ├─ components/            lásd a komponensfát
│  ├─ islands/               vanilla TS szigetek (header, count-up, before-after, filter, form)
│  ├─ lib/                   portfolio.ts, site.ts (zod), format.ts (magyar számformátum)
│  └─ pages/                 index, adatkezeles, impresszum, koszonjuk, 404
├─ scripts/                  subset-fonts, content-guard, check-budgets, screenshot-works, check-links
├─ tests/                    e2e/, visual/, a11y/, fixtures/portfolio.fixture.yaml
├─ lighthouserc.json
└─ .github/workflows/ci.yml
```

### Komponensfa

```
Base.astro
├─ SkipLink
├─ Header                         sticky; görgetéskor áttetsző papír + blur(10px)
│  ├─ Wordmark                    „zolberg.” – a pont --accent
│  ├─ AnchorNav                   Munkák · Szolgáltatás · Folyamat (mobilon rejtve)
│  └─ Button[primary, sm]         „Beszéljünk” → #kapcsolat
│     sziget: header.ts           görgetési állapot + aktív horgony (IntersectionObserver)
├─ main
│  ├─ Hero
│  │  ├─ StatusPill               zöld pötty + „Új projektek indítása: …” (csak ha site.yaml-ban igaz)
│  │  ├─ H1 + PencilMark          a „mérés” szón, kirajzolódás ~900 ms
│  │  ├─ HeroLead                 alcím | gombok (asztalin egy sorban, mobilon egymás alatt)
│  │  └─ HeroVisual               BrowserFrame(asztali kép) + PhoneFrame(mobil kép), LCP
│  ├─ ProofBand                   tinta háttér; 0–3 MetricStat (szám + mono forrás és dátum)
│  │  sziget: count-up.ts
│  ├─ Works  #munkak
│  │  ├─ SectionHead              H2 bal + „Esettanulmányt kérek” jobb
│  │  ├─ FeaturedWork             ≈60/40; címkék, név, egy mondat, 3 előtte → utána metrika
│  │  ├─ BeforeAfter              input[type=range], aria-valuetext; sziget: before-after.ts
│  │  ├─ IndustryFilter           pirula-gombok, aria-pressed; sziget: filter.ts
│  │  ├─ WorkGrid → WorkCard[]    16:10 BrowserFrame, név + iparág, egy mondat, MetricTag[], TypeTag
│  │  ├─ ConceptFootnote
│  │  └─ (ClientLogos, Testimonial) csak valós, írásban engedélyezett anyaggal
│  ├─ Services                    SectionHead + 4 ServiceCard (saját vonalikon)
│  ├─ Process                     erdőzöld sáv, 4 lépés vonalrácsban (01–04, cím, mondat, időkeret)
│  ├─ About                       portré 4:5 + név, 2–3 mondat, mono cégadat-sor
│  ├─ Faq                         natív <details> × 5–6
│  └─ Contact  #kapcsolat         tinta háttér; H2, bevezető, e-mail és telefon, ContactForm
│     sziget: contact-form.ts     helyi validáció, fókusz az első hibára (JS nélkül is beküldhető)
└─ Footer                         óriás „zolberg.”; 4 oszlop: cégadatok, horgonyok, jogi linkek, domainek
```

Aloldalak: `/adatkezeles`, `/impresszum`, `/koszonjuk` (a válasz formátuma és határideje), `/404`. Mind a `Base.astro`-t használja, a fejléc horgonyai ott a főoldalra mutatnak (`/#munkak`).

### Adatmodell (`content/portfolio.yaml`, zod-dal validálva)

Az OutreachEngine kötelező mezői változatlanok: `id`, `name`, `live_url`, `description`, `industry`, `type` (`client_project` | `concept_demo`), `approved_for_outreach`. A weboldal csak **opcionális** mezőket tesz hozzá (Q4):

```yaml
- id: pelda-kft # egyedi, kebab-case
  name: 'Példa Kft.' # concept_demo esetén fiktív név is lehet
  live_url: 'https://…'
  description: 'Egy mondat: mit csináltam + mért eredmény.'
  industry: 'Gépipar' # a szűrő ebből épül
  type: client_project # vagy concept_demo → „Saját koncepciómunka” címke kötelező
  approved_for_outreach: true # csak true jelenik meg (levélben és oldalon is)
  # --- a weboldal opcionális mezői ---
  featured: true # pontosan egy lehet true
  year_before: 2019 # a csúszka „Előtte · 2019” címkéje
  work_type: 'Újraépítés'
  permission: { written: true, date: 2026-11-10, scope: [name, screenshots, metrics] }
  images:
    desktop: works/pelda-1440.png # Playwright, 1440×900
    mobile: works/pelda-390.png # Playwright, 390×844
    before: works/pelda-before.png # azonos méret és kivágás, mint az after
    after: works/pelda-after.png
    alt: 'A Példa Kft. ajánlatkérő oldala asztali nézetben, …'
  metrics: # csak mért, dátumozott, forrásmegjelölt érték
    - key: psi_mobile # psi_mobile | psi_desktop | lcp_mobile | cls | inp | custom
      label: 'PageSpeed mobil'
      before: 42
      after: 96
      unit: ''
      measured_at: 2026-11-20
      tool: 'PageSpeed Insights (Lighthouse 12), mobil, 3 futás mediánja'
      source: measurements/pelda-2026-11-20.json
```

Validációs szabályok (a build elbukik): `concept_demo` → `permission` nem kell, de a címke kötelező a kimenetben; `client_project` + `approved_for_outreach: true` → `permission.written: true` kell; minden metrikának van `measured_at`, `tool`, `source`, és a `source` fájl létezik; `featured` pontosan egy tételen; képek léteznek, méretük egyezik a nézettel.

### Fejlesztés valós tartalom nélkül

- A tesztek és a vizuális regresszió egy **egyértelműen hamis tesztkészleten** futnak (`tests/fixtures/portfolio.fixture.yaml`, `PORTFOLIO_FILE` környezeti változóval). A tesztkészlet soha nem kerül éles buildbe; a CI ezt külön ellenőrzi.
- Az éles build (`pnpm build`) a `content/` mappát olvassa. Ha ott nincs jóváhagyott referencia, a Munkák szekció nem jelenik meg, a bizonyíték-sáv elmarad, és a tartalom-őr a megmaradt `[` helyőrzők miatt elbuktatja a buildet. Ez szándékos: helyőrzővel nem élesítünk (2.1).

---

## 3. Tokenek (master prompt 4. szakasz → `src/styles/global.css`)

A specifikáció értékei változatlanok. A kontrasztokat szkripttel újraszámoltam (W0-ban automata teszt lesz belőle):

| Pár                             | Számolt    | Spec     |
| ------------------------------- | ---------- | -------- |
| `--ink` / `--paper`             | 16,48:1    | 16,5:1 ✓ |
| `--ink-2` / `--paper`           | 6,09:1     | 6,1:1 ✓  |
| `--accent` / `--paper`          | 4,92:1     | 4,92:1 ✓ |
| fehér / `--accent`              | 5,55:1     | 5,55:1 ✓ |
| `--paper` / `--forest`          | 10,94:1    | 10,9:1 ✓ |
| `--accent-on-dark` / `--forest` | 4,81:1     | 4,8:1 ✓  |
| `--field` / `--paper`           | 5,00:1     | 5,0:1 ✓  |
| **`--accent` / `--ink`**        | **3,35:1** | –        |
| **`--accent` / `--forest`**     | **2,22:1** | –        |
| `--accent-on-dark` / `--ink`    | 7,25:1     | –        |

**Következmény (D-010):** a tinta (bizonyíték-sáv, kapcsolat, lábléc, ha sötét) és az erdőzöld sávon a link, a címke és a **fókuszgyűrű** is `--accent-on-dark`. Ezt egy kontextuális változó oldja meg: `--focus: var(--accent)` alapból, `.on-dark { --focus: var(--accent-on-dark) }`.

Kiegészítő tokenek (a döntések a D-naplóban):

```css
--signal: #2e7d4f; /* állapotpötty; 4,47:1 a papíron (nem szöveg, 3:1 kell) – D-012 */
--container: 1280px;
--gutter: 48px; /* 834+ px; 20px mobilon */
--section: 72px; /* 96px ≥834, 128px ≥1440 */
--radius-card: 14px;
--radius-pill: 999px;
--shadow-card: 0 1px 0 rgb(20 19 15 / 0.04), 0 12px 32px -18px rgb(20 19 15 / 0.18);
--ease-out: cubic-bezier(0.2, 0.7, 0.2, 1);
```

Betűk (D-008): **3 fájl**, mindegyik latin + a magyar ŐőŰű + tipográfiai jelek („” – — … · → nbsp) részhalmaza: Bricolage Grotesque (változó, `wdth` rögzítve 100-on, `wght` 500–700, `opsz` megtartva), Hanken Grotesk (változó, `wght` 400–600), JetBrains Mono 400 (statikus). A részhalmazolás a buildben fut (`subset-font`, HarfBuzz wasm, Python nélkül). Költségvetés: összesen ≤120 KB, cél ≤90 KB.

---

## 4. Elrendezési döntések (a 2A átvételi térkép alkalmazása)

| 2A-elv (#)                          | Hol                          | Konkrétan                                                                                                                                          |
| ----------------------------------- | ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Munka a hajtás felett (1)           | Hero                         | asztalin [alcím (7/12) \| gombok (5/12)] egy sorban; **mérhető cél:** a hero-kép teteje ≤560 px 1440×900-on, ≤620 px 390×844-en (Playwright-teszt) |
| Kétoszlopos szekciófej (2)          | Szolgáltatás, Rólam, GYIK    | H2 a bal 5/12-ben, bekezdés a 7–12. oszlopban, max. 62 ch; 834 px alatt egymás alatt                                                               |
| Cím + jobbra zárt link (3)          | Munkák                       | H2 bal, „Esettanulmányt kérek” jobb, közös alapvonal; mobilon a link a H2 alá kerül                                                                |
| Szerkesztett aszimmetria (4)        | Kiemelt munka                | `grid-template-columns: 3fr 2fr`, 48 px köz; a kép 24 px-szel túllóg a kártya felső élén [ajánlott]                                                |
| Kép → név → mondat → bizonyíték (5) | WorkCard                     | minden szöveg mindig látható; a hover csak a kép 1,035-ös nagyítása és 4 px emelés (`hover: hover`)                                                |
| Egy cél, 4 belépés (11)             | Fejléc, hero, Munkák, lábléc | mind `#kapcsolat`; a gombszöveg a konkrét kérést mondja                                                                                            |
| Mi történik utána (12)              | Kapcsolat, `/koszonjuk`      | határidő, formátum (PDF vagy e-mail), forrásmegjelölés                                                                                             |
| Bizonyíték a CTA után (13)          | Bizonyíték-sáv               | közvetlenül a hero alatt, 2–3 érték; 2-nél kevesebb valós értéknél az egész sáv elmarad (D-009)                                                    |
| Vonalrács (9)                       | Folyamat                     | 4 oszlop, 1 px-es elválasztók (`--paper` 20%), mobilon vízszintes vonalak                                                                          |
| Ellenpéldák (15–17)                 | mindenhol                    | em-alapú betűköz, AA másodlagos szöveg, nincs külső script                                                                                         |

Hero-igazítás: **balra zárt** (D-003). A Ramotion középre zár; a Zolberg H1 1440 px-en ~121 px-es, és két sorba törik, balra zárva a ceruzajelölés helye kiszámítható, és a mobil nézettel is egyezik.

---

## 5. Mérföldkövek és elfogadási feltételek

Minden mérföldkő végén: `pnpm check && pnpm lint && pnpm test` zöld, commit (angol üzenet), rövid összefoglaló.

| #      | Tartalom                                                                                                                                                                       | Kész, ha                                                                                                                                     |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **R0** | REFERENCE_REVIEW, PLAN, DECISIONS, OPEN_QUESTIONS                                                                                                                              | ez a dokumentum; a blokkoló kérdések megválaszolva                                                                                           |
| **W0** | Astro 7 váz (D-019), TS strict, tokenek, betű-részhalmazolás, Base layout, ESLint, Prettier, Playwright, axe, Lighthouse CI, költségvetés-szkript, tartalom-őr, GitHub Actions | üres oldal 0 axe-hibával; LHCI 100/100/100/100; a kontraszt-teszt zöld; a fontok ≤120 KB, 3 fájl                                             |
| **W1** | Fejléc, hero (állapotsor, H1 beúszás, ceruzajelölés, HeroVisual), bizonyíték-sáv (count-up), lábléc                                                                            | vizuális alapképek 390/834/1440-en; a hero-kép pozíciójára vonatkozó teszt zöld; LCP-elem azonosítva és ≤1,8 s                               |
| **W2** | `portfolio.yaml` betöltés + zod; kiemelt munka, előtte/utána csúszka, iparági szűrő, rács, lábjegyzet; `screenshot-works` szkript                                              | e2e: csúszka egérrel, érintéssel, billentyűvel; a szűrő `aria-pressed`-et vált, JS nélkül minden munka látszik; a concept-címke-őr zöld      |
| **W3** | Szolgáltatás, folyamat, rólam, GYIK                                                                                                                                            | szekciónként 40–60 szó (szószámláló teszt); 0 axe-hiba                                                                                       |
| **W4** | Űrlap + Pages Function + spamvédelem (Q2) + e-mail API (Q3) + `/koszonjuk`                                                                                                     | e2e: siker, magyar hibaüzenetek, fókusz az első hibára, JS nélküli beküldés (`wrangler pages dev`); az API-kulcs csak env-ben                |
| **W5** | `/adatkezeles`, `/impresszum`, `/404`, SEO (title, description, canonical, OG, sitemap, robots, JSON-LD), `_headers` (CSP, HSTS…), `_redirects`                                | a CSP-ben csak saját origin (+ Turnstile, ha Q2 úgy dönt); egységes NAP-adatok (teszt hasonlítja a láblécet, az impresszumot és a JSON-LD-t) |
| **W6** | Teljesítmény- és a11y-finomítás, vizuális regresszió véglegesítése, README, CONTENT_GUIDE, LAUNCH_CHECKLIST                                                                    | a 9. szakasz összes határa a CI-ban; 320 és 1920 px-en nincs vízszintes görgetés                                                             |

---

## 6. Tesztstratégia

| Teszt                     | Eszköz                                                                                                                           | Mikor fut                                  |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| Típus és Astro-ellenőrzés | `astro check`, `tsc`                                                                                                             | minden commit                              |
| Sémavalidáció             | zod (build közben)                                                                                                               | build                                      |
| e2e                       | Playwright (Chromium + WebKit mobil) a fixture-builden                                                                           | CI                                         |
| JS nélküli útvonalak      | Playwright `javaScriptEnabled: false`                                                                                            | CI                                         |
| Vizuális regresszió       | Playwright `toHaveScreenshot`, 390 / 834 / 1440 px                                                                               | CI (az alapképek Linuxon készülnek, D-014) |
| Akadálymentesség          | `@axe-core/playwright`, minden oldal, minden nézet                                                                               | CI                                         |
| Lighthouse                | `@lhci/cli`, mobil, 3 futás mediánja, a 9. szakasz határaival                                                                    | CI                                         |
| Költségvetés              | `scripts/check-budgets.ts` (gzip HTML, CSS, JS, betűk, hajtás feletti képek, teljes súly)                                        | build után                                 |
| Tartalom-őr               | `scripts/content-guard.ts` a `dist/`-en: `[`-helyőrző, „lorem”, „TODO”, címke nélküli concept_demo, forrás és dátum nélküli szám | éles build után                            |
| Linkek                    | `scripts/check-links.ts` (belső: dist-bejárás; külső: HEAD, időkorláttal)                                                        | CI, külső linkek naponta egyszer           |
| Kontraszt                 | token-párok számolt aránya ≥ a WCAG-küszöb                                                                                       | unit                                       |

---

## 7. Kockázatok

| Kockázat                                                                                        | Hatás                                                             | Kezelés                                                                                                                                         |
| ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Nincs Node a gépen                                                                              | W0 nem indul                                                      | Q1                                                                                                                                              |
| A Turnstile harmadik féltől származó script, a 2.4 tiltja                                       | ütközés a 2. és a 3. szakasz között                               | Q2; addig a spamvédelem honeypot + időcsapda + szerveroldali validáció                                                                          |
| H1-beúszás és LCP                                                                               | ha a H1 `opacity: 0`-ról indul, az LCP az animáció végére tolódik | csak `transform` (soronként `translateY` egy `overflow: clip` sávban), az átlátszóság végig 1                                                   |
| Betűcsere és CLS                                                                                | a swap átrendezheti a H1-et                                       | `size-adjust`/`ascent-override` metrikás tartalék-fontok a Bricolage-hoz és a Hankenhez                                                         |
| **A helyi LCP-mérés túllépi a határt** (W4: 2010 ms / 1800 ms tesztképpel; az űrlap okozza, Q8) | a CI piros, valódi képekkel rosszabb lehet                        | Q8: mérés a Pages előnézeti deployon (HTTP/2); valódi képpel újramérni; tartalék: alacsonyabb AVIF-minőség mobilon, mobilon telefonkeret nélkül |
| Hajtás feletti képek ≤150 KB                                                                    | az asztali kép (≤120 KB) + a telefonkép együtt                    | a telefonkép ≤30 KB AVIF; mobilon a hero-kép kisebb `srcset`-tel                                                                                |
| Lighthouse ≥98 a CI-ban zajos                                                                   | álpiros build                                                     | 3 futás mediánja, statikus kiszolgálás, fix CPU-szorzó                                                                                          |
| Vizuális alapképek Windows és Linux között eltérnek                                             | álpiros build                                                     | az alapképek csak a CI-ban (Linux) készülnek és frissülnek (D-014)                                                                              |
| A szemcse-textúra és a `backdrop-filter` mobilon lassít                                         | INP, görgetés                                                     | a textúra egyetlen 128 px-es csempe; a blur csak a fejlécen                                                                                     |
| Pozicionálási átfedés a versenytárssal (REFERENCE_REVIEW)                                       | a „mérés” szlogenként gyenge                                      | a bizonyíték formája hordozza: dátum, forrás, saját oldal mérése                                                                                |
| Cloudflare Pages vs. Workers static assets                                                      | a Cloudflare az új projekteket a Workers felé tereli              | a specifikáció szerint Pages; a `_headers`, a `_redirects` és a Function-kód mindkettőn működik (D-015)                                         |
| A kézi ceruzavonal nem generálható                                                              | élesítés blokkolva                                                | Q5; fejlesztés alatt jelölt ideiglenes SVG, a tartalom-őr az éles buildben elbuktatja                                                           |

---

## 8. Ami szándékosan nincs

Hamburger-menü, hírlevél, sütibanner (követő süti nélkül; jogi megerősítés kell), analitika, karusszel, videó, parallax, egyedi kurzor, betöltőképernyő, UI-könyvtár, React, Tailwind, kitalált szám, vélemény vagy logó.
