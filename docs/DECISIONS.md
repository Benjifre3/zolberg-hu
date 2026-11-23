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

### D-020 · 2026-11-23 · A Bricolage `opsz` tengelye megmarad

A specifikáció változó betűt kér `opsz` + `wght` tengellyel. Megtartva a fájl 73,6 KB, a három betű együtt 114,5 KB (keret: 120 KB). Az `opsz` rögzítése (pl. 48-on) 39,8 KB-ra csökkentené a Bricolage-ot (összesen ~81 KB). **Tartalék lépés**, ha a W1/W6-ban az LCP szűkös lesz: `opsz: 48` a `scripts/subset-fonts.ts`-ben; ez a 4. szakasztól való eltérés, ezért csak mérés alapján és naplózva.

### D-021 · 2026-11-23 · Eszközlánc-verziók

Node.js 26.13.1 LTS (`.node-version`: 26). pnpm 12.23.0 `npm i -g`-vel, mert a Node 25 óta a corepack nem része a telepítőnek. TypeScript **6.0** (nem 7), mert az `@astrojs/check` csak `^5 || ^6`-ot támogat. ESLint 10 (`defineConfig`), typescript-eslint 8, Playwright 1.65, Lighthouse 13 (`@lhci/cli` 0.16). A `.npmrc` `shell-emulator=true`, hogy a `VAR=érték parancs` alakú scriptek Windowson is fussanak.

### D-022 · 2026-11-23 · Lighthouse CI: Playwright-Chromium, csak helyi riport

A Lighthouse CI a Playwright Chromiumát használja (`scripts/lhci.ts`), a riport a `.lighthouseci/` mappába kerül. A `temporary-public-storage` feltöltést szándékosan nem használjuk (külső szolgáltatás, 2.4 szellemében).

### D-023 · 2026-11-23 · Két build-mód és egy nem blokkoló CI-feladat

`pnpm build` = éles: build + költségvetés + tartalom-őr `--release` módban (kötelező cégadatok, nincs tesztadat és ideiglenes elem). `pnpm build:fixture` = ugyanez `--release` nélkül, a tesztek erre futnak. A CI „Élesíthetőség” feladata az éles buildet futtatja `continue-on-error`-ral: amíg a valós tartalom hiányzik, szándékosan piros, de nem blokkol. A Cloudflare Pages a `pnpm build`-et futtatja, így helyőrzővel nem lehet élesíteni.

### D-024 · 2026-11-23 · A nyíl ikon SVG, nem karakter

A „→” (U+2192) nincs a Google Fonts-féle latin részhalmazokban, és betűnként eltérően rajzolódna. A gombok és linkek nyila saját inline SVG (egy vonalvastagság, `currentColor`), a W1-ben.
