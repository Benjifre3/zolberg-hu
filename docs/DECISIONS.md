# Döntésnapló

Formátum: azonosító · dátum · döntés · indok · elvetett lehetőségek. A „specifikáció” a master prompt v2-t jelenti. Ami a felhasználó döntése, az a `docs/OPEN_QUESTIONS.md`-ben van, nem itt.

---

### D-001 · 2026-11-23 · Projektmappa: `zolberg-hu/`

A munkamappa (`Claude projects`) nem üres, egy Blender-projekt is van benne. Az oldal saját almappát kap, ott lesz a git-repó is.
Elvetve: a gyökérbe építés (összekeveredne a nem kapcsolódó fájlokkal).

### D-002 · 2026-11-23 · Az ütközési tábla referencia-oszlopának pontosítása

A Ramotion mostani állapota több ponton eltér az ütközési tábla leírásától: átlátszó fix fejléc, 1280 px-es tartalom 122,5 px-es margóval, ≈61/35 és 48/48-as eltolt galéria, Venn-diagram, statikus lábléc. A részletek a `REFERENCE_REVIEW.md` „Eltérések” táblázatában vannak. A **Zolberg-oszlop döntései változatlanok**, csak a referencia leírása pontosabb.

### D-003 · 2026-11-23 · Hero: balra zárt, egymás alá rendezett

Állapotsor → H1 (teljes szélesség) → asztalin egy sorban az alcím (7/12) és a gombok (5/12) → hero-kép. Mobilon minden egymás alatt.
Indok: a H1 1440 px-en ~121 px, két sorba törik; balra zárva a ceruzajelölés helye kiszámítható. A közös alcím–gomb sorral a hero-kép 1440×900-on ~560 px-nél indul (a 2A 1. elve: a munka a hajtás felett látszik).
Elvetve: középre zárás (Ramotion), osztott hero (szöveg balra, kép jobbra), mert ekkora H1 mellett a kép túl kicsi lenne.

### D-004 · 2026-11-23 · Munkakártya: minden szöveg mindig látható

A Ramotion a kártyaleírást csak hoverre mutatja. Zolbergnél a név, az iparág, a mondat és a metrikák mindig látszanak; a hover csak a kép lassú nagyítása és 4 px-es emelés (`@media (hover: hover)`).
Indok: a látogató gyakran telefonról érkezik, ott nincs hover; a bizonyíték nem lehet elrejtve.

### D-005 · 2026-11-23 · Szekciófej-minták

(a) A Munkák fejléce: H2 balra, „Esettanulmányt kérek” jobbra, közös sorban (Framer-elv). (b) A Szolgáltatás, a Rólam és a GYIK: H2 a bal 5/12-ben, a bevezető bekezdés a 7–12. oszlopban, max. 62 karakter/sor (Ramotion-elv, rövidebb sorral). 834 px alatt egymás alatt.

### D-006 · 2026-11-23 · Munkarács: szabályos 2 oszlop, aszimmetria csak a kiemelt munkánál

A specifikáció 2 oszlopos rácsot ír; az eltolt Ramotion-galéria nem jön át. A szerkesztett aszimmetria a kiemelt munkáé (`3fr 2fr`).

### D-007 · 2026-11-23 · Folyamat-sáv: vonalrács kártyák helyett

4 oszlop 1 px-es függőleges elválasztóval (`--paper` 20%-os átlátszósággal az erdőzöldön), mobilon vízszintes vonalakkal. Az óriás sorszám (01–04) a Bricolage-ból.
Indok: a sötét sávon a kártyák árnyéka nem működik, a vonal a „vékony vonalak” hangulatba illik (4.).

### D-008 · 2026-11-23 · Betűk: 3 egyedi részhalmaz

A `@fontsource-variable` csomagok a latint és a latin-extet külön fájlba teszik (családonként 2 fájl → 6), ez sérti a „legfeljebb 3 fájl” szabályt. Ezért a buildben egy szkript (`subset-font`, HarfBuzz wasm, Python nélkül) családonként **egy** woff2-t készít: alap latin + ŐőŰű + „” – — … · → és a nem törő szóköz. Bricolage: `wdth` 100-on rögzítve, `wght` 500–700, `opsz` megtartva. Hanken: `wght` 400–600. JetBrains Mono: 400 statikus. A forrásfontok OFL-licencűek, a licencfájlok a repóba kerülnek.
Elvetve: Google Fonts CDN (harmadik fél, 2.4), 6 fájl (sérti a 3. szakaszt).

### D-009 · 2026-11-23 · Bizonyíték-sáv: legalább 2 valós érték kell

Minden érték csak mért számmal, forrással és dátummal jelenik meg. Ha 2-nél kevesebb ilyen érték van, az egész sáv elmarad (egy magányos szám gyengébb, mint a hiánya).

### D-010 · 2026-11-23 · Akcentus a sötét sávokon

A `--accent` a tintán 3,35:1, az erdőzöldön 2,22:1, ez szövegre és fókuszgyűrűre sem elég. A sötét sávokon (`.on-dark`) a link, a címke és a fókuszgyűrű `--accent-on-dark` (tintán 7,25:1, erdőzöldön 4,81:1). Megvalósítás: `--focus` kontextuális változó.

### D-011 · 2026-11-23 · Tesztadat külön az éles tartalomtól

Az e2e- és a vizuális tesztek a `tests/fixtures/portfolio.fixture.yaml`-on futnak (egyértelműen hamis nevek, „Teszt” előtaggal). Az éles build csak a `content/`-et olvassa, és a tartalom-őr elbuktatja, ha helyőrző marad. A CI ellenőrzi, hogy a fixture-nevek nem kerülnek a `dist/`-be.

### D-012 · 2026-11-23 · `--signal` token az állapotpöttyhöz

A hero-állapotsor „zöld pöttye” a palettából hiányzik (a `--forest` a papíron szinte feketének látszik). Új token: `--signal: #2E7D4F` (4,47:1 a papíron; nem szöveg, 3:1 elég). Csak a pöttyre használható.

### D-013 · 2026-11-23 · Mérési szabvány

Alapmérés: PageSpeed Insights (Lighthouse), **mobil**, 3 futás mediánja, a futás napján. A nyers JSON a `content/measurements/` mappába kerül, ez a forrás. Az oldalon így jelenik meg: „PageSpeed Insights, mobil · 2026. 11. 20.” LCP-t és más Core Web Vitals értéket csak akkor írunk ki, ha ugyanabból a mérésből jön. Mezőadat (CrUX) csak akkor, ha az oldalnak van ilyen.

### D-014 · 2026-11-23 · A vizuális alapképek a CI-ban készülnek

A Playwright-képernyőképek Windows és Linux között betűsimítás miatt eltérnek. Az alapképeket a GitHub Actions (Linux) készíti és frissíti; helyben a vizuális teszt csak a CI-ból letöltött alapképpel vagy a Playwright Docker-képével fut.

### D-015 · 2026-11-23 · Hosztolás: Cloudflare Pages

A specifikáció szerint Cloudflare Pages + Pages Function. A Cloudflare az új projekteket a Workers static assets felé tereli; a `_headers`, a `_redirects` és a Function-kód kis átírással ott is működik, így a váltás később nem drága. (Az Astro-verzióról a D-019 szól.)

### D-016 · 2026-11-23 · Git: helyi azonosító

Globális git-azonosító nincs a gépen. A repó **helyi** beállítást kap (név: „Zolberg”, e-mail: a fiók e-mail-címe), a globális konfigurációhoz nem nyúlok. Push előtt cserélhető (Q7).

### D-017 · 2026-11-23 · Spamvédelem a Q2 eldöntéséig

Honeypot mező + időcsapda (3 mp-nél gyorsabb beküldés elutasítva) + szerveroldali validáció és hosszkorlát. A Turnstile kódja környezeti kapcsolóval (`TURNSTILE_ENABLED`) épül meg, alapból kikapcsolva, amíg a Q2 el nem dől.

### D-018 · 2026-11-23 · Űrlap JS nélkül

A `<form method="post" action="/api/contact">` natívan működik. Siker esetén a Function 303-mal a `/koszonjuk`-ra irányít. Hiba esetén JS nélkül egy szerveroldalon renderelt hibaoldal jön vissza a mezőértékekkel és magyar hibaüzenetekkel; JS-sel a sziget helyben validál, és az első hibás mezőre teszi a fókuszt.

### D-019 · 2026-11-23 · Astro 7 az Astro 5 helyett (a felhasználó döntése)

A specifikáció Astro 5-öt ír, de az 5.x utolsó kiadása 2026. 05. 26-i, azóta megjelent az Astro 6 (2026. 03.) és az Astro 7 (2026. 06.). A felhasználó az Astro 7-et választotta (karbantartott főverzió). Változások, amelyek minket érintenek: Node ≥ 22.23.4; Vite 8; szigorúbb (Rust) fordító – hibás HTML-egymásba ágyazás build-hiba; a `compressHTML` alapértéke `'jsx'`, ezért **`compressHTML: true`** (a magyar szövegben a kiemelt szavak körüli szóköz nem tűnhet el); a Fonts API stabil (helyi fájl, preload, optimalizált tartalék-metrikák).

### D-020 · 2026-11-23 · A Bricolage `opsz` tengelye rögzítve 72-n (mérés alapján)

A specifikáció változó betűt kér `opsz` + `wght` tengellyel. A W0-ban megtartottuk (73,6 KB). A W1-ben a hero-képpel a Lighthouse mobil LCP **1935 ms** lett (határ: 1800 ms): szimulált lassú 4G-n a kép a címbetűvel osztozott a sávszélességen. Ezért az `opsz`-t 72-n rögzítettük (a legfontosabb tipográfiai pillanatok – H1, számok, óriás szóvédjegy – nagy méretűek). Eredmény: a címbetű 41,1 KB, a három betű együtt 82 KB, az LCP **1710 ms**, Performance 100. A `wght` tengely 500–700 között változó maradt. Ez eltérés a 4. szakasztól, a 9. szakasz („elsőként az effekt megy”) alapján.

### D-021 · 2026-11-23 · Eszközlánc-verziók

Node.js 26.13.1 LTS (`.node-version`: 26). pnpm 12.23.0 `npm i -g`-vel, mert a Node 25 óta a corepack nem része a telepítőnek. TypeScript **6.0** (nem 7), mert az `@astrojs/check` csak `^5 || ^6`-ot támogat. ESLint 10 (`defineConfig`), typescript-eslint 8, Playwright 1.65, Lighthouse 13 (`@lhci/cli` 0.16). A `.npmrc` `shell-emulator=true`, hogy a `VAR=érték parancs` alakú scriptek Windowson is fussanak.

### D-022 · 2026-11-23 · Lighthouse CI: Playwright-Chromium, csak helyi riport

A Lighthouse CI a Playwright Chromiumát használja (`scripts/lhci.ts`), a riport a `.lighthouseci/` mappába kerül. A `temporary-public-storage` feltöltést szándékosan nem használjuk (külső szolgáltatás, 2.4 szellemében).

### D-023 · 2026-11-23 · Két build-mód és egy nem blokkoló CI-feladat

`pnpm build` = éles: build + költségvetés + tartalom-őr `--release` módban (kötelező cégadatok, nincs tesztadat és ideiglenes elem). `pnpm build:fixture` = ugyanez `--release` nélkül, a tesztek erre futnak. A CI „Élesíthetőség” feladata az éles buildet futtatja `continue-on-error`-ral: amíg a valós tartalom hiányzik, szándékosan piros, de nem blokkol. A Cloudflare Pages a `pnpm build`-et futtatja, így helyőrzővel nem lehet élesíteni.

### D-024 · 2026-11-23 · A nyíl ikon SVG, nem karakter

A „→” (U+2192) nincs a Google Fonts-féle latin részhalmazokban, és betűnként eltérően rajzolódna. A gombok és linkek nyila saját inline SVG (egy vonalvastagság, `currentColor`), a W1-ben.

### D-025 · 2026-11-23 · Nincs inline `style` attribútum

A komponensek nem használnak `style=""` attribútumot (a változatokat osztály vagy `data-*` attribútum adja), hogy a W5-ös CSP `style-src-attr` nélkül, szigorúan beállítható legyen. JS-ből a CSSOM (`el.style.x`) használható, azt a CSP nem tiltja.

### D-026 · 2026-11-23 · Tartalomkönyvtár és tesztadat

Minden tartalom a `CONTENT_DIR` alól jön (alapból `content/`, a teszteknél `tests/fixtures/content/`): `site.yaml`, `portfolio.yaml`, `works/` (képek), `measurements/` (nyers mérések). A képeket a Vite `@content` aliasa tölti be, így éles buildbe teszt-kép nem kerülhet. A tesztképeket a `pnpm shots:fixture` készíti kitalált cégek mintaoldalairól, „TESZTADAT” felirattal. A pnpm 12 a beállításait a `pnpm-workspace.yaml`-ból olvassa (`shellEmulator: true`, hogy a `VAR=érték parancs` Windowson is fusson).

### D-027 · 2026-11-23 · A bizonyíték-sáv a portfolio.yaml-ból számol

A sáv számolt elemei (`portfolio_mean`, `portfolio_median`) a jóváhagyott munkák „utána” méréseiből jönnek, így a sáv és a munkakártyák nem mondhatnak ellent egymásnak. Átlag és medián csak legalább 2 mérésből; a forrás és a mérési dátumtartomány automatikusan íródik ki. Kézi elem (`manual`, pl. átadott projektek száma) csak forrással és dátummal adható meg.

### D-028 · 2026-11-23 · Ideiglenes kapcsolati szekció a W1-ben

Minden CTA a `#kapcsolat`-ra mutat, ezért a szekció váza (cím, válaszidő, e-mail, telefon) már a W1-ben elkészült. A „Három mező, hírlevél nélkül.” mondat és az űrlap a W4-ben jön, mert addig nem lenne igaz. A fejléc és a lábléc horgonyai csak létező szekcióra mutatnak (`src/lib/nav.ts`, `SECTIONS`).

### D-029 · 2026-11-23 · Állapotváltás színnel is lehet

A 7. szakasz szerint „csak transform és opacity animálódik”. Ezt a kulcskockás animációkra alkalmazzuk (H1-beúszás, ceruzajelölés, hover-nagyítás). A gombok és linkek 150–200 ms-os állapotváltása (7. szakasz 4. pont) színátmenet, ez olcsó, és a specifikáció maga sorolja az effektek közé.

### D-030 · 2026-11-23 · A portfolio.yaml kanonikus helye (Q4, a felhasználó döntése)

A referenciák egyetlen forrása a weboldal repójának `content/portfolio.yaml`-ja (a képek és a nyers mérések is itt vannak). Az OutreachEngine innen olvas (git submodule vagy másolás hash-ellenőrzéssel – az OutreachEngine építésekor dől el). A séma az OutreachEngine kötelező mezőit változatlanul hagyja, a weboldal csak opcionális mezőket ad hozzá (`featured`, `year_before`, `work_type`, `permission`, `images`, `metrics`); az OutreachEngine validátorának az ismeretlen mezőket el kell fogadnia.

### D-031 · 2026-11-24 · Teljesítmény-finomítások a W2-ben

- `scopedStyleStrategy: 'class'`: a scoped szelektorok `.astro-xxxx` alakúak a `[data-astro-cid-xxxx]` helyett; a CSS 24,6 KB-ról 22,7 KB-ra csökkent (keret: 25 KB, tömörítetlenül mérve – a szigorúbb értelmezés).
- A hajtás alatti blokkok (munkák, kapcsolat, lábléc) `content-visibility: auto`-t kapnak (`.defer-render`).
- A hero telefonképe `fetchpriority="low"`: nem LCP-elem, ne versenyezzen a fő képpel. Ezzel a mobil LCP 1860 ms-ról 1785 ms-ra csökkent (tesztképpel).
- A mono szövegek és a munkaleírások nem kapnak automatikus elválasztást (márkanevek, pl. „PageSpeed”).

### D-032 · 2026-11-24 · Munkák: elrendezési részletek

- A rács a kiemelt munkán kívüli jóváhagyott munkákat mutatja; a szűrő ezek iparágaiból épül, és csak legalább 2 iparágnál jelenik meg. JS nélkül rejtve van, minden munka látszik.
- A kártyán két link van: „Esettanulmányt kérek” (→ `#kapcsolat`, esettanulmány-oldal még nincs) és „Élő oldal” (a `live_url`).
- A kiemelt munka és a hero ugyanazt a munkát mutatja (a specifikáció mindkettőt a legerősebb munkára írja).
- Az előtte/utána csúszka natív `input[type=range]`, amely átlátszóan lefedi a képpárt; a látható fogantyú mutatja a fókuszt. A képpárnak azonos méretűnek és kivágásúnak kell lennie (`pnpm shots -- --only <id> --url <régi URL> --suffix elotte`).

### D-033 · 2026-11-24 · Komponens-CSS hash nélkül (`is:global`), BEM-előtaggal

A W3 négy szekciójával a CSS 26,0 KB lett (keret: 25 KB, tömörítetlenül). A scoped jelölés (`.astro-xxxx`) 231 helyen ~3,4 KB-ot adott. Mivel minden komponens egyedi BEM-előtagot használ (`hero__`, `services__` …), a stílusok továbbra is a komponensfájlban vannak, de `<style is:global>`-ként, hash nélkül. Eredmény: 22,6 KB. Új komponensnél az osztálynév kötelezően a komponens nevével kezdődik. A vizuális regressziós teszt a `content-visibility: auto`-t kikapcsolja, különben a teljes oldalas képen a viewporton kívüli blokkok üresek maradnának.

### D-034 · 2026-11-24 · W3 szövegek és megjelenési szabályok

- A szolgáltatás-, folyamat- és GYIK-szövegeket én írtam (magázás, egyes szám első személy, ígéret és szuperlatívusz nélkül); **jóváhagyásra várnak** (OPEN_QUESTIONS B). Kód nélkül a `content/site.yaml`-ban írhatók át.
- A 40–60 szavas szabályt a törzsszövegre alkalmazzuk (címek nélkül); a GYIK kérdés–válasz formátuma kivétel. A `tests/unit/copy.test.ts` ellenőrzi, és tiltja a felkiáltójelet, az emojit, a „csapatunk”-féle többes számot és a szuperlatívuszokat.
- A folyamat időkerete csak kitöltve jelenik meg; a „Rólam” szekció csak névvel és bemutatkozással (a portré opcionális, amíg nincs valódi fotó). Az ár-kérdés a pricing-döntés után kerül a GYIK-be.

### D-035 · 2026-11-24 · Űrlap Turnstile nélkül (Q2, a felhasználó döntése)

A 2. szakasz 4. pontja (nincs harmadik féltől származó script) elsőbbséget kap a 3. szakasz Turnstile-jával szemben. A spamvédelem: rejtett honeypot mező, időcsapda (JS-sel töltött időbélyeg; 3 mp-nél gyorsabb beküldés csendben eldobva), szerveroldali validáció és hosszkorlát, élesben egy Cloudflare sebességkorlát-szabály a `/api/contact`-ra (LAUNCH_CHECKLIST). A D-017-ben tervezett Turnstile-kapcsoló nem készül el; a CSP-ben csak saját origin lesz.

### D-036 · 2026-11-24 · Az űrlap felépítése (W4)

- Közös szabálymodul (`src/lib/contact-rules.ts`) a böngészőben és a Pages Functionben: ugyanazok a magyar hibaüzenetek, a végső döntés a szerveré. A webcímet `pelda.hu` alakban is elfogadja (https-re normalizálja).
- A `/api/contact` két módot ismer: JS-sel JSON-válasz (a sziget mutatja a hibákat, fókusz az első hibás mezőre, `aria-invalid` + `aria-describedby`); JS nélkül siker esetén 303 a `/koszonjuk`-ra, hiba esetén szerveroldali hibaoldal a beírt értékekkel. A függvény válaszai saját, szigorú CSP-fejlécet kapnak.
- A levélküldés cserélhető adapter mögött van (`src/server/mailer.ts`). Amíg a Q3 nincs eldöntve, csak a `dry-run` mód él (tesztek, fejlesztés); szolgáltató nélkül a szerver 503-at ad, és az űrlap nem jelez hamis sikert.
- Ha nincs adatkezelési tájékoztató oldal, az űrlap `data-placeholder` jelölést kap, és az éles build tartalom-őre elbukik (adatkezelési link nélkül nem élesítünk).
- Az e2e tesztek a Cloudflare helyi futtatókörnyezetén (`wrangler pages dev`, 8788-as port) futnak, így a függvény is tesztelt; a pnpm csak az `esbuild` és a `workerd` telepítési szkriptjét futtathatja (`pnpm-workspace.yaml` → `allowBuilds`).

### D-037 · 2026-11-24 · Az LCP-határ mérése a Pages előnézeten (Q8, a felhasználó döntése)

A specifikáció 1,8 s-os mobil LCP-határát a Cloudflare Pages előnézeti deployján mérjük (`lighthouserc.preview.json`, CI: „Lighthouse a Pages előnézeten”): a tesztadatos build az állandó `lhci-preview` ágra kerül (`https://lhci-preview.zolberg-hu.pages.dev/`), ott fut a Lighthouse mobil, szimulált lassú 4G-vel. A feladat csak akkor mér, ha a `CLOUDFLARE_API_TOKEN` és a `CLOUDFLARE_ACCOUNT_ID` titok be van állítva; addig jelzi, hogy kimaradt. A helyi Lighthouse CI (`lighthouserc.json`, HTTP/1.1-es statikus szerver) minden más határt változatlanul hibaként kezel, az LCP-t 2,1 s-os hibahatárral, hogy a romlást helyben is elkapja (W4-ben mérve: 2010 ms). A Pages az előnézeti deployokra automatikusan `noindex`-et küld; a tesztadatos oldal így nem kerül keresőbe.

### D-038 · 2026-11-24 · Jogi oldalak a content/legal/ Markdown-fájlokból

Az `/adatkezeles` és az `/impresszum` egy Astro content collectionből (`src/content.config.ts`) épül; oldal csak a meglévő fájlból készül, a lábléc és az űrlap csak meglévő oldalra linkel. Az impresszum tetején a cégadatok a `site.yaml`-ból jönnek (NAP-egyezés a lábléccel és a JSON-LD-vel). Az éles build tartalom-őre mindkét fájlt megköveteli. A jogásznak szóló tervezetek a `docs/legal-drafts/` mappában vannak, a build nem használja őket.

### D-039 · 2026-11-24 · Biztonsági fejlécek, SEO, átirányítások

- `public/_headers`: CSP csak saját originnel (`script-src 'self'`; `style-src 'self' 'unsafe-inline'`, mert a teljes CSS a HTML-be ágyazott – a gyorsabb első festésért), HSTS (`includeSubDomains`, preload nélkül), `nosniff`, `strict-origin-when-cross-origin`, `Permissions-Policy`, `X-Frame-Options: DENY`, COOP; a `/_astro/*` fájlok egy évig gyorsítótárazhatók. A szigetek ehhez külső fájlként épülnek (`vite.build.assetsInlineLimit: 0`; az LCP-n mérhetően nem változtat).
- SEO: Open Graph és Twitter-kártya minden oldalon, saját OG-kép (`pnpm og` → `public/og.png`, a saját betűkkel; generált ceruzavonal nélkül), JSON-LD `ProfessionalService` a főoldalon csak a meglévő cégadatokkal.
- `public/_redirects`: `/munkak` → `/#munkak`, `/kapcsolat` → `/#kapcsolat`. A `www` → apex és a `zolbergstudio.com` → `https://zolberg.hu/#munkak` domain-szintű Cloudflare Redirect Rule (LAUNCH_CHECKLIST).
