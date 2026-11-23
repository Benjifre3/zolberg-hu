# Master prompt: zolberg.hu bemutatkozó oldal (v2, referencia-elemzés + éles építés)

Készült: 2026. november 23. Előzmények: „Weboldal dizájn javaslat” doksi, a Zolberg landing page demó (Design-vászon), `master-prompt-osszefoglalo.md`, Master prompt v2 (OutreachEngine). Inspiráció: ramotion.com, krauszdesign.com, framer.com (szerkezet és munkabemutatás, nem a kinézet másolása).

**v2 változás:** a senior UI/UX design review prompt (Ramotion-elemzés + 10 pontos elemzési szerkezet) beépítve a **2A. szakaszba**, mint az építés előtti első munkalépés. A 2. szakasz 7. pontja rögzíti a prioritási sorrendet, a 2A ütközési táblája előre eldönti az ismert ütközéseket. A többi szakasz tartalma és számozása változatlan.

**Használat:** a 0. szakasz csak neked szól. Az 1–12. szakaszt (a 2A-val együtt) egyben másold be egy üres mappában indított Claude Code-ba. A `[ ]` helyőrzőket indulás előtt töltsd ki, vagy hagyd, hogy a Claude Code `docs/OPEN_QUESTIONS.md`-be gyűjtse őket.

---

## 0. Amit előtte neked kell elintézni

1. Domainek: `zolberg.hu` (márka, ez az oldal) és `zolbergstudio.com` (küldő-domain, 301-es átirányítás `https://zolberg.hu/#munkak` címre). `[ELLENŐRIZENDŐ: zolberg.studio.hu / zolbergstudio.hu]`
2. Cloudflare-fiók (Pages + DNS), GitHub-repó.
3. Tartalom: 5 referencia (képernyőkép előtte/utána, élő URL, engedély, típus: `client_project` vagy `concept_demo`), dátumozott PageSpeed-mérések, portré, rövid bemutatkozás, cégadatok (név, székhely, adószám), árak vagy csomagnevek (ha lesznek az oldalon).
4. Jogi: az adatkezelési tájékoztató és az impresszum szövegének véglegesítése a jogi konzultáción.
5. Referencia-anyag a 2A-hoz: élő URL-ek elérhetők, vagy képernyőképek a `docs/reference/` mappában (asztali, ha van: mobil nézet).

---

## 1. Szerep és cél

Te egy senior frontend-mérnök és interaction designer vagy (statikus oldalak, webes teljesítmény, akadálymentesség, magyar tipográfia). Az első lépésben (2A) senior UI/UX designerként és front-end design architectként elemzed a referenciákat, utána megépíted a **zolberg.hu** egyoldalas bemutatkozó oldalát éles minőségben.

**Az oldal egyetlen feladata:** aki a hideg levélből idekattint, fél percen belül komolyan vegye a feladót, és kérje a mért adatokat a saját weboldaláról. Nem díjnyerés a cél, hanem a bizalom. A látogató egy nagyobb magyar KKV vagy Kft. döntéshozója, gyakran telefonról érkezik.

**Az oldal maga a referencia.** Ha a levél PageSpeedről vagy betöltési időről beszél, ennek az oldalnak minden mérésen kiemelkedően kell teljesítenie. A gyenge saját mérés hiteltelenné teszi a feladót.

## 2. Nem alku tárgya (kemény szabályok)

1. **Őszinteség:** kitalált ügyfél, vélemény, szám, díj, logó vagy eredmény nem kerülhet az oldalra. Minden szám mért, dátumozott és forrásmegjelölt; ha nincs adat, az elem nem jelenik meg (nem helyőrzővel élesít).
2. **Koncepciómunka jelölése:** a `concept_demo` típusú munka mindenhol „Saját koncepciómunka” címkét kap, és ügyfélmunkának soha nem nevezhető. Fiktív cégnév csak koncepciómunkán szerepelhet, egyértelmű jelöléssel.
3. **Egy hang a levéllel:** magázás, egyes szám első személy („én”, nem „csapatunk”), nincs felkiáltójel, emoji, szuperlatívusz, hamis sürgetés vagy ígért eredmény („X%-kal több ügyfél”).
4. **Adatvédelem:** nincs követő süti, nincs külső analitika, nincs harmadik féltől származó script, nincs pixel. Ha kell statisztika, csak sütimentes, szerveroldali megoldás jöhet, és erről a jogi konzultáción döntünk.
5. **A referenciák egyetlen forrása** a `content/portfolio.yaml`, ugyanaz a séma, amit az OutreachEngine `config/portfolio.yaml`-ja használ (azonosító, név, élő URL, iparág, `type`, `approved_for_outreach`, mérések). Az oldal csak `approved_for_outreach: true` tételt mutat.
6. **Ne másolj:** a Ramotion (és bármely más oldal) szerkezeti mintát ad, nem arculatot. Nem vehető át logó, szöveg, kép, színkombináció vagy egyedi effekt.
7. **Prioritási sorrend ütközéskor:** (1) ez a 2. szakasz → (2) a 3–12. szakasz Zolberg-specifikációja → (3) a 2A referencia-elemzés. A referencia-elemzésből soha nem jön konkrét érték (szín, betű, méret, effekt, szöveg), csak szerkezeti elv. Ha az elemzés olyat javasol, ami a 3–12. szakasszal ütközik, a specifikáció nyer, az eltérés a `docs/DECISIONS.md`-be kerül.

## 2A. Referencia-elemzés (első munkalépés, építés előtt)

**Referenciák:** ramotion.com (fő referencia, teljes mélységben) · krauszdesign.com/#ingyeneskonzultacio és framer.com (csak az érdemi eltérések és átvehető minták). **Anyag:** `[élő URL / docs/reference/ képernyőképek]`, nézet: `[pl. csak asztali ~1525 px]`.

**Kimenet:** `docs/REFERENCE_REVIEW.md`, magyarul, profi design review formában, amelyből egy fejlesztő vagy tervező pontosan dolgozhat. Ez a `docs/PLAN.md` bemenete, nem az oldal specifikációja.

**Elemzési szabályok:**
1. Minden állítás jelölt: **[látható]** (az anyagban látszik), **[következtetett]** (vizuális jelből levezetve, pl. sticky fejléc görgetett képekből), **[ajánlott]** (saját javaslat ott, ahol az anyag nem mutat semmit, pl. mobil viselkedés csak asztali képekből).
2. Méret, betűméret, hex közelítő érték, hacsak nem valós CSS-ből jön. Ezt egyszer mondd ki, utána adj konkrét számot (tartomány is jó, pl. „96–104 px”).
3. Nem látható tartalmat (menüpontok, dropdown tartalma, hover-időzítés) ne találj ki; ha nem dönthető el, írd le, és adj megvalósítási javaslatot.
4. Táblázat a specifikációkhoz, rövid lista a viselkedéshez, próza csak az indokláshoz. Konkrét szám a jelző helyett, töltelék és általános dicséret nélkül.
5. A magyar konkurens (Krausz Design) oldaláról csak a konverziós logikát elemezd (az ajánlat és a CTA felépítése); szöveg, ajánlat-megfogalmazás és vizuális megoldás sem vehető át.

**Az elemzés szerkezete:**

0. **Összefoglaló:** 2–3 mondat: oldaltípus, egy mondatos alapelv (pl. „a munka adja a vizuális izgalmat, az oldal semleges marad”), mitől működik.
1. **Elrendezés:** konténer max. szélessége, tartalom kezdő/záró x-koordinátája, külső margók (px és viewport-%); rács (oszlopszám, gutter, igazítás); szimmetrikus vagy aszimmetrikus elosztás, kártya-span minták (pl. 4/8, 6/6 a 12-ből); reszponzív stratégia asztali / tablet / mobil szinten, és hogyan marad meg a hierarchia. Formátum: spec-táblázat + töréspont-lista.
2. **Szekciósorrend:** számozott lista fentről lefelé (01, 02…), mindegyiknél: név, tartalom, cél. Utána a tartalmi stratégia sorozatként (pl. Pozicionálás → Bizonyíték → Hitelesség → Munkák → Képességek → Vélemények → Konverzió), az oldaltípus, és a szándékosan hiányzó szokásos szekciók (árazás, feature-rács…).
3. **Navigáció:** fejléc-régiók (logó / linkek / CTA), igazítás, magasság; logókezelés, menüpontok, dropdown-jelzések (és ami nem ismert róluk); a fejléc-CTA a sima linkekhez képest; sticky viselkedés; mobil minta (megerősített vagy ajánlott).
4. **Tipográfia:** betűosztály, valószínű család; skála-táblázat: Elem | Méret | Súly | Sormagasság (hero, H2, kártyacím, idézet, törzs, nav, lábléc); címkezelés (méretkontraszt, igazítás, sortörés, betűköz); hierarchia-logika, bekezdés-szélesség, olvashatóság.
5. **Színrendszer:** táblázat: Szerep | Hex | Használat (háttér, fő szöveg, másodlagos, halvány, panel, vonal); az akcentusok globálisak vagy a képekből jönnek; a színhasználati elv egy mondatban.
6. **Térköz és ritmus:** táblázat: Terület | Asztali érték (margók, fejléc, hero felső térköz, cím→szöveg, szöveg→kép, szekcióközök, rácsközök, lábléc-oszlopközök); a hero levegője és az általa teremtett prioritás; szándékos szabálytalanságok (aszimmetrikus üres tér, eltolt elemek).
7. **Képkezelés:** képtípusok; méret a szöveghez képest, lekerekítés, árnyék (vagy hiánya), kivágás, képarány; háttér, overlay, gradiens: a képen belül vagy az oldal héján; látható vagy sejthető animáció (ami statikus képből nem igazolható, azt jelöld).
8. **Kártyák és blokkok:** blokktípusonként (portfólió, pirulák, vélemény, panel): szerkezet, lekerekítés, keret, árnyék, belső térköz, ikonhasználat, igazítás, rácsviselkedés (kézzel elhelyezett vagy masonry), billentyűzetes fókusz.
9. **Gombok és CTA-k:** típusonként kitöltés, szövegszín, nyíl/ikon, lekerekítés, közelítő méret; hierarchia (tömör elsődleges / körvonalas másodlagos / tartalomba ültetett / nagy záró CTA); hover- és fókuszállapot (megerősített vagy ajánlott).
10. **Összhatás:** 3–4 kulcsszó egy-egy sorral (pl. minimalista, prémium, szerkesztett); érzelmi hangvétel; mely tervezési kategóriákból merít; hogyan épít tekintélyt, és mit kerül el szándékosan.
11. **Átvételi térkép (Zolbergre fordítva):** táblázat: Referenciaminta | Átvehető elv | Zolberg-megfelelő (szakasz) | Nem átvehető. Ez helyettesíti az „újraépítési prioritásokat”: az oldalt nem újraépítjük, hanem elveket fordítunk le.

**Ismert ütközések, előre eldöntve (a Zolberg-oszlop érvényes):**

| Téma | Referencia (Ramotion-elemzés) | Zolberg-döntés |
|---|---|---|
| Színek | monokróm szürke héj, a színt a képek adják | meleg papír + egyetlen vermilion akcentus (4.) |
| Betűk | Inter-szerű semleges groteszk | Bricolage Grotesque / Hanken Grotesk / JetBrains Mono (4.) |
| Konténer, margó | ~1328 px, 96–100 px oldalmargó | max. 1280 px, 48 / 48 / 20 px (4.) |
| Mélység | szinte nincs árnyék, 8–10 px lekerekítés | kétrétegű puha árnyék, 14 px lekerekítés, böngészőkeret (4., 5.) |
| Fejléc | tömör háttér, árnyék nélkül | görgetéskor áttetsző papír + `blur(10px)` (4.) |
| Mobilnavigáció | hamburger-menü (ajánlott) | nincs hamburger: szóvédjegy + gomb (6.1) |
| Portfólió | eltolt, aszimmetrikus 4/8-as galéria | kiemelt munka ≈60/40 + 2 oszlopos rács (6.4) |
| Logófal, vélemények | nagy ügyfél-logófal, véleménykarusszel | csak valós, írásban engedélyezett anyag; automatikus karusszel tilos (2., 6.4, 7.) |
| Szolgáltatások | interaktív kördiagram, előnézettel | 4 statikus kártya vonalikonnal (6.5) |
| Hírlevél | szürke feliratkozó-sáv | nincs hírlevél (10.) |
| Lábléc | kinyitható szolgáltatás-/város-/programlista | 4 oszlop + óriás „zolberg.” szóvédjegy (6.10) |

**Kifejezetten átvehető szerkezeti elvek:** a hero hierarchiája (óriás cím → egysoros alcím → azonnal munka), a munka előbb jön, mint a magyarázat; a kép domináns, a szöveg másodlagos; visszafogott héj, a karaktert a munka és az aláíró elemek adják; tömör / körvonalas / nagy záró CTA-hierarchia; bőkezű térköz, szerkesztett (nem véletlenszerű) aszimmetria a kiemelt munkánál.

## 3. Technológia

- **Astro 5** statikus kimenettel, TypeScript `strict`, kliensoldali JS csak szigetként (csúszka, szűrő, űrlap), keretrendszer nélkül (vanilla TS). Nincs React, Tailwind CDN, jQuery, UI-könyvtár (Shadcn, Radix stb.).
- CSS: egyetlen globális stíluslap design tokenekkel (CSS custom properties) + komponens-szintű scoped CSS. Nincs CSS-in-JS.
- Képek: `astro:assets` → AVIF + WebP, `srcset`/`sizes`, kötelező `width`/`height`, a hero-kép `fetchpriority="high"`, a többi `loading="lazy"` `decoding="async"`.
- Betűk: saját hosztolás (`@fontsource-variable` vagy letöltött woff2), `latin` + `latin-ext` részhalmaz, `font-display: swap`, legfeljebb 3 fájl, a címbetű `preload`.
- Űrlap: Cloudflare Pages Function (`/api/contact`), Turnstile-lal (láthatatlan mód) és honeypot mezővel; a levél a `[cél e-mail]` címre megy egy tranzakciós e-mail API-n át (`[szolgáltató]`, kulcs csak környezeti változóban). JS nélkül is működjön (natív `POST`, szerveroldali visszaigazoló oldal).
- Hosztolás: Cloudflare Pages, HTTPS, HSTS, `www` → apex 301. Biztonsági fejlécek a `_headers` fájlban: CSP (csak saját origin + Turnstile), `X-Content-Type-Options`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`.
- Eszközök: pnpm, ESLint, Prettier, Playwright (e2e + vizuális), `@axe-core/playwright`, Lighthouse CI.

## 4. Design rendszer (tokenek)

**Hangulat egy mondatban:** meleg papír, finom szemcse, nagy, határozott groteszk címek, sok levegő, vékony vonalak, egyetlen vermilion akcentus. Nincs gradiens-mosás, üvegkártya, neon, lebegő 3D-mockup, ticker-sáv.

**Színek** (WCAG-kontraszt kiszámolva):
| Token | Hex | Használat |
|---|---|---|
| `--paper` | `#F4F1EA` | alap háttér (~60%) |
| `--paper-raised` | `#FBFAF6` | kártyák |
| `--ink` | `#14130F` | szöveg, sötét sávok (16,5:1 a papíron) |
| `--ink-2` | `#5E5A51` | másodlagos szöveg (6,1:1) |
| `--accent` | `#C2331A` | fő CTA, linkek, címkék (fehér rajta 5,55:1; papíron 4,92:1); legfeljebb 5% |
| `--accent-mark` | `#E8472B` | csak a kézzel rajzolt jelölés, szövegre soha |
| `--forest` | `#1E3A2F` | folyamat-sáv (papírszín rajta 10,9:1) |
| `--accent-on-dark` | `#FF7A5C` | akcent sötét háttéren (4,8:1 a forest-en) |
| `--sage` | `#E3E8DC` | kép-helyőrzők, másodlagos felületek |
| `--line` | `#D9D4C7` | díszítő vonal (kezelőelemen nem) |
| `--field` | `#6B675E` | űrlapmező kerete (5,0:1) |

**Textúra** (a „profi” érzet forrása, mértékkel):
- Szemcse: egy 128×128-as, csempézhető, alacsony átlátszóságú zajtextúra (PNG, ≤15 KB) a `body` hátterén. A szöveg kontrasztját nem ronthatja, és `prefers-reduced-transparency` / nyomtatás esetén kikapcsol.
- Hero: 64 px-es, 5%-os átlátszóságú vonalrács (CSS `linear-gradient` vonalak, nem színátmenet).
- Mélység: kártyákon kétrétegű, nagyon puha árnyék (`0 1px 0` + `0 12px 32px -18px`, ink 4–18%), 14 px lekerekítés; képkereteken böngészőkeret-sáv (3 pötty, halvány címsor).
- A fejléc görgetéskor áttetsző papír + `backdrop-filter: blur(10px)`.

**Tipográfia** (mind támogatja az ő/ű betűt a `latin-ext` részhalmazzal; élesítés előtt ellenőrizd):
| Szerep | Betű | Beállítás |
|---|---|---|
| Címek, számok | **Bricolage Grotesque** (változó, `opsz` + `wght`) | 700 / 500, `letter-spacing: -0.035em` (H1-nél -0.04em), sormagasság 0,94–1,1 |
| Törzsszöveg, gombok | **Hanken Grotesk** | 400 / 600, 18–20 px, sormagasság 1,55, sorhossz 60–70 karakter |
| Adatcímkék, metaadatok | **JetBrains Mono** | 400, 12–13 px |

Skála: H1 `clamp(3rem, 8.4vw, 7.75rem)`, H2 `clamp(2.1rem, 5vw, 4.25rem)`, H3 `clamp(1.5rem, 2.4vw, 2rem)`. Csupa nagybetűs hosszú cím nincs. Magyar szabályok: `lang="hu"`, `hyphens: auto`, tizedesvessző („1,4 s”), ezres tagolás szóközzel („500 000 Ft”), szám és mértékegység között `&nbsp;`, magyar idézőjel („…”).

**Formák és ritmus:** gombok pirulaformájúak (`border-radius: 999px`, min. 52 px magasak); 8 px-es térköz-rács; szekciók között 128 / 96 / 72 px (asztali / tablet / mobil); tartalomszélesség max. 1280 px, oldalsó margó 48 / 48 / 20 px.

**Aláíró elemek (ezek adják az egyediséget):**
1. Kézzel rajzolt piros ceruzás aláhúzás (SVG `path`, beszkennelt vagy tableten rajzolt vonal, nem generált), legfeljebb 3 az oldalon; a hero kulcsszaván egyszer kirajzolódik (~900 ms).
2. Mono adatcímkék a munkákon („PageSpeed 98”, „LCP 1,2 s”), csak valós, dátumozott mérésből.
3. Előtte/utána csúszka.
4. Valódi név, arc és cégadat.
5. Óriás „zolberg.” szóvédjegy a láblécben, az akcentszínű ponttal.

## 5. Képek

- **Csak valódi vagy saját anyag:** saját munkák képernyőképei (Playwright-tal, 1440×900 és 390×844 nézetből, egységes böngészőkeretben), valódi portré/műhelyfotó. Stockfotó, AI-generált „csapat”, ikon-csomag illusztráció nincs.
- Hero: a legerősebb munka asztali képe böngészőkeretben, rálógó telefonkerettel (mobilnézet). Ez a hero LCP-eleme: ≤120 KB AVIF.
- Referenciakártya: 16:10 arány, egységes böngészőkeret, hoverre 1,035-ös lassú nagyítás (csak `transform`).
- Előtte/utána: azonos méretű, azonos kivágású képpár.
- Portré: 4:5, természetes fény, semleges háttér.
- Minden képnek értelmes magyar `alt` szövege van (mit mutat, nem „kép”).
- Képkeret-szabály: a képek ne legyenek eltérő stílusúak; mindegyik ugyanabban a keretben és árnyékban jelenjen meg.

## 6. Oldalszerkezet és szövegek

Egy görgethető oldal, horgonyokkal. Külön aloldal csak: `/adatkezeles`, `/impresszum`, `/koszonjuk` (űrlap után), `/404`. Szekciónként 40–60 szó.

1. **Fejléc** (sticky): „zolberg.” szóvédjegy; horgonyok: Munkák, Szolgáltatás, Folyamat; gomb: „Beszéljünk”. Mobilon csak a szóvédjegy és a gomb; hamburger-menü nincs.
2. **Hero:** állapotsor („Új projektek indítása: [hónap]”, zöld pötty, csak ha igaz) · H1: „Céges weboldal, amit a mérés igazol.” (a „mérés” szón a ceruzás jelölés) · alcím: „Régi vagy lassú céges weboldalak újraépítése. Először mérek, utána tervezek, és az átadáskor a mérés mutatja meg az eredményt.” · fő gomb: „Kérem a mért adatokat →” · másodlagos link: „Munkák megtekintése” · hero-kép (5. szakasz).
3. **Bizonyíték-sáv** (tinta háttér): 3 mért érték óriás számmal + mono forrás és dátum (pl. átlagos mobil PageSpeed a munkáimon, medián LCP, átadott projektek száma). Ha egy érték nem valós, az elem kimarad.
4. **Munkák** (`id="munkak"`; ide érkezik a levél linkje), Ramotion-mintára átdolgozva (lásd 2A átvételi térkép):
   - Fejléc: H2 „Munkák, mérésekkel együtt.” + jobbra link „Esettanulmányt kérek”.
   - **Kiemelt munka:** teljes szélességű kártya, bal oldalt nagy kép (≈60%), jobb oldalt címkék (iparág, munkatípus, ügyfélmunka/koncepció), név, egy mondat **„mit csináltam + mért eredmény”** mintára (pl. „Az ajánlatkérés két kattintásra rövidült, a mobil PageSpeed [42]-ről [96]-ra nőtt.”), alatta 3 metrika előtte→utána formában.
   - **Előtte/utána csúszka** ugyanarra a munkára: középről indul, egérrel, érintéssel és nyílbillentyűkkel is húzható, látható fogantyúval, „Előtte · [év]” és „Utána” címkével.
   - **Iparági szűrő:** pirula-gombok (Mind + a `portfolio.yaml` iparágai), `aria-pressed`, mobilon vízszintesen görgethető sor. JS nélkül minden munka látszik.
   - **Munkarács:** 2 oszlop (mobilon 1), nagy képek, alattuk név + iparág egy sorban, egy mondatos leírás, mono metrika-címkék és típuscímke. Minden kártya az esettanulmányra vagy a kapcsolatra visz.
   - Lábjegyzet: „A koncepciómunkák fiktív cégekre készült tervek, nem ügyfélmunkák.”
   - Ügyfél-logósor és vélemény-karusszel **csak** valós, írásban engedélyezett anyaggal; ha nincs, kimarad.
5. **Szolgáltatás:** H2 „Mit kap a cége.” · 4 kártya vonalikonnal (saját SVG, egy vonalvastagság): Mérés és felmérés · Egyedi terv · Gyors, mobilbarát építés · Átadás és karbantartás. Ár vagy csomagnév csak akkor szerepel, ha a `[pricing döntés]` megvan.
6. **Folyamat** (erdőzöld sáv): 4 lépés óriás sorszámmal (01–04), címmel, egy mondattal és időkerettel ([X] nap/hét).
7. **Rólam:** portré + „[Teljes név], a Zolberg alapítója.” + 2–3 mondat + mono cégadat-sor.
8. **GYIK:** natív `<details>`, 5–6 kérdés (határidő, szöveg és képek, keresőbeli helyezés és átirányítás, tulajdonjog, karbantartás, [ár]).
9. **Kapcsolat** (tinta háttér): H2 „Kérem a mért adatokat.” · „Három mező, hírlevél nélkül. [X] munkanapon belül rövid, forrással ellátott mérési összefoglalót küldök a saját oldaláról.” · e-mail és telefon is látszik · űrlap: Cégnév, Weboldal címe, E-mail-cím (látható címkék, `autocomplete`, magyar hibaüzenetek) · gomb: „Kérem a mért adatokat” · alatta az adatkezelési tájékoztató linkje.
10. **Lábléc:** óriás „zolberg.” szóvédjegy; 4 oszlop: cégadatok (név, székhely, adószám), horgonyok, jogi linkek, domainek.

## 7. Mozgás és interakció

Legfeljebb 6 szándékos effekt, minden más statikus. Csak `transform` és `opacity` animálódik.
- H1 soronkénti beúszás (≤700 ms) + a ceruzajelölés kirajzolódása.
- A bizonyíték-sáv számai egyszer „felszaladnak”, ha képernyőre érnek (IntersectionObserver).
- Képek hoverre lassú nagyítása; kártyák 4 px-es emelkedése (csak `hover: hover` eszközön).
- Gombok/linkek 150–200 ms-os állapotváltása, látható fókuszgyűrű (`3px solid var(--accent)`, `outline-offset: 3px`).
- Az aktív horgony kiemelése a fejlécben.

Tilos: parallax, görgetés-eltérítés, egyedi kurzor, automatikus karusszel, betöltőképernyő, hang, háttérvideó, WebGL. `prefers-reduced-motion: reduce` esetén minden animáció kikapcsol, a jelölés azonnal látszik.

## 8. Reszponzivitás

Töréspontok: **mobil 390** (tervezési alap, mobile-first), **tablet 834**, **asztali 1440**; ellenőrzés 320 és 1920 px-en is. Nincs vízszintes görgetés sehol (kivéve a szűrősávot). Érintési célok ≥44×44 px. Mobilon: a hero-telefonkeret kisebb, a kiemelt munka egy oszlopba törik, a rácsok egy oszlopra váltanak, az űrlap teljes szélességű.

## 9. Teljesítmény-költségvetés (CI-ban kikényszerítve)

| Mutató | Határ |
|---|---|
| Lighthouse mobil: Performance / Accessibility / Best Practices / SEO | ≥ 98 / 100 / 100 / 100 |
| LCP (mobil, lassú 4G) | ≤ 1,8 s |
| CLS | ≤ 0,05 |
| INP / TBT | ≤ 150 ms / ≤ 100 ms |
| Kezdő HTML (gzip) | ≤ 30 KB |
| CSS összesen | ≤ 25 KB |
| JS összesen (gzip) | ≤ 15 KB |
| Betűfájlok összesen | ≤ 120 KB |
| Képek a hajtás felett | ≤ 150 KB |
| Teljes oldalsúly (első betöltés) | ≤ 900 KB |

Ha egy határ sérül, a build elbukik. Elsőként az effekt megy, nem a tartalom.

## 10. Akadálymentesség, SEO, jog

- **WCAG 2.1 AA (2.2 ahol lehet):** egy H1, logikus címsorrend, „Ugrás a tartalomra” link, landmarkok (`header`, `nav`, `main`, `footer`), minden funkció billentyűzettel elérhető, a csúszka `input type="range"` címkével és `aria-valuetext`-tel („Előtte 30%”), az űrlaphibák `aria-describedby`-vel és fókuszálással jelennek meg. Az axe 0 hibát talál.
- **SEO:** magyar `title` (≤60 karakter) és meta description (≤155), kanonikus URL, OG/Twitter-kép (1200×630, saját), `sitemap.xml`, `robots.txt`, JSON-LD (`ProfessionalService`: név, cím, adószám, telefon, `areaServed: HU`, `url`). Egységes NAP-adatok (név, cím, telefon) a láblécben, az impresszumban és a JSON-LD-ben.
- **Jog:** impresszum és adatkezelési tájékoztató (a jogi konzultáción véglegesítve); az űrlap mellett tájékoztató-link; nincs hírlevél-feliratkozás; követő süti nélkül nincs sütibanner, de ezt a jogi konzultáción meg kell erősíteni. EAA: a tisztán tájékoztató B2B oldal valószínűleg hatályon kívül esik, de az AA-szintet így is teljesítjük.

## 11. Kapcsolat az OutreachEngine-nel

- A levél egyetlen linkje: `https://zolbergstudio.com/munkak` → 301 → `https://zolberg.hu/#munkak`. Nincs UTM, nincs nyomkövetés (a levél szabályai szerint).
- Az oldal és a levél ugyanazt a `portfolio.yaml`-t használja; ha egy referencia `approved_for_outreach` értéke `false`, sem a levélben, sem az oldalon nem jelenik meg.
- A levélben ígért „mért adatok” formátumát a `/koszonjuk` oldal írja le („[X] munkanapon belül PDF-ben vagy e-mailben, forrásokkal”).

## 12. Munkamód, tesztek, átadás

1. Először `docs/REFERENCE_REVIEW.md` (2A), utána `docs/PLAN.md` (komponensfa, tokenek, kockázatok, és melyik 2A-elvet hol használod) és legfeljebb 10 blokkoló kérdés; minden más döntés `docs/DECISIONS.md`.
2. Mérföldkövek, mindegyik végén zöld tesztek + commit:
   - **R0:** referencia-elemzés (2A) + `docs/PLAN.md`, kód még nincs;
   - **W0:** váz, tokenek, betűk, alapelrendezés, CI;
   - **W1:** hero, bizonyíték-sáv, fejléc, lábléc;
   - **W2:** munkák (kiemelt, csúszka, szűrő, rács), `portfolio.yaml` betöltés + sémavalidáció (zod);
   - **W3:** szolgáltatás, folyamat, rólam, GYIK;
   - **W4:** űrlap + Pages Function + Turnstile + `/koszonjuk`;
   - **W5:** jogi oldalak, SEO, biztonsági fejlécek;
   - **W6:** teljesítmény- és akadálymentességi finomítás, vizuális regresszió.
3. **Kötelező automatikus tesztek:**
   - Playwright e2e: horgonynavigáció; a csúszka egérrel, érintéssel és billentyűzettel; a szűrő szűr és `aria-pressed`-et vált; az űrlap kitöltve sikeres, hibásan magyar hibaüzenetet ad, JS nélkül is beküldhető.
   - Vizuális regresszió 390 / 834 / 1440 px-en.
   - axe: 0 hiba minden oldalon.
   - Lighthouse CI a 9. szakasz határaival.
   - Tartalom-őr: a build elbukik, ha a kimenetben `[`-helyőrző, „lorem”, „TODO”, `concept_demo` munka „Saját koncepciómunka” címke nélkül, vagy forrás és dátum nélküli szám marad.
   - Linkellenőrzés: nincs törött belső vagy külső link.
4. **Átadandó:** magyar `README.md` (futtatás, tartalomcsere, deploy), `docs/REFERENCE_REVIEW.md`, `docs/CONTENT_GUIDE.md` (hogyan cseréld a referenciákat, méréseket, képeket), `content/portfolio.yaml` kommentált példával, `docs/LAUNCH_CHECKLIST.md`:
   - [ ] minden helyőrző valós adatra cserélve;
   - [ ] 5 referencia engedéllyel, a koncepciómunkák jelölve;
   - [ ] mobil Lighthouse a határokon belül, élesben mérve;
   - [ ] űrlap élesben kipróbálva, a levél megérkezik;
   - [ ] a `zolbergstudio.com` átirányítás HTTPS-sel a `#munkak` horgonyra visz;
   - [ ] a levél linkje Gmailből, mobilon és asztali gépen végigpróbálva;
   - [ ] jogi szövegek átnézve.

Ha valami ütközik ezekkel a szabályokkal vagy nem teljesíthető, ne találj ki kerülőutat: állj meg, írd le az okot és a lehetőségeket a `docs/OPEN_QUESTIONS.md`-be, és kérdezz.
