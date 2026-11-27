# Prémium finomítás – terv (feat/premium-polish)

Alap: a `v1-approved` címke (9a97a1c). A specifikáció 2–9. szakasza alapján. Ez a terv a kód előtt
készült. Az eltéréseket és a döntéseket a `docs/DECISIONS.md` (D-050-től) indokolja.

## 0. Kiinduló mérések (v1-approved, tesztadatos build)

| Mutató             | Érték     | Határ   | Tartalék   |
| ------------------ | --------- | ------- | ---------- |
| CSS összesen       | 23,4 KB   | 25 KB   | **1,6 KB** |
| JS összesen (gzip) | 2,6 KB    | 15 KB   | 12,4 KB    |
| HTML (gzip)        | 13,0 KB   | 30 KB   | 17 KB      |
| Hajtás feletti kép | 41,0 KB   | 150 KB  | 109 KB     |
| Mobil LCP (helyi)  | ≈ 2010 ms | (D-037) | +100 ms    |

**A legnagyobb kockázat a CSS-keret.** Ezért a kulcskockák (keyframes) és a mozgás-végállapotok
JS-ben (Web Animations API) vannak, CSS-ben csak a tokenek, a textúra és a festés előtti
kezdőállapot (hero) él.

## 1. Kapuk és őrök

- **Textúra-kapu:** minden 3. szakaszbeli réteg (zaj, fénymező, árnyék, gradiens, fényél,
  hajszálvonal) egy `@supports (--polish: 1)` blokkban van, a saját komponensfájljában. A blokk
  minden modern böngészőben él. A vizuális őr a CSSOM-ból törli ezeket a blokkokat, így „textúra
  nélküli” képet kap. A blokkon kívüli változás nem módosíthatja a nyugalmi képet.
- **Mozgás-kapu:** a `<head>` inline szkriptje teszi fel a `.motion` osztályt (és első
  látogatáskor az `.intro`, visszatérőnél az `.intro-short` osztályt), csak akkor, ha nincs
  `prefers-reduced-motion: reduce`. A CSP-ben (`script-src 'self'`) a szkript sha256-hash-sel
  engedélyezett. Egy teszt ellenőrzi, hogy a hash egyezik.
- **Biztonsági háló:** ha a `motion.ts` nem fut le (hálózati hiba, régi böngésző), a
  `DOMContentLoaded`-kor vagy legkésőbb 1,5 s után az inline szkript leveszi a mozgás-osztályokat,
  és minden azonnal látszik. A hajtás alatti elemek kezdőállapotát csak a `motion.ts` állítja be.
  JS nélkül tehát semmi nincs elrejtve.
- **Horgonyra érkezés** (pl. `/#munkak` a levélből): ami az indításkor már a képernyőn van, az
  nem animálódik, hanem azonnal látszik. Így nincs villanás.

## 2. Elemenkénti hozzárendelés

| Elem                                                | 3. szakasz (anyag)                                                                                | 5. szakasz (mozgás)                                                                                                                                                                                  | Kockázat / védelem                                                                     |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `body` papír                                        | kétrétegű zaj: 256 px finom + 512 px „rost”, `multiply`                                           | –                                                                                                                                                                                                    | ≤ 20 KB; kontraszt-teszt a legsötétebb zajpixellel                                     |
| Fejléc                                              | `saturate(1.2)`, zajréteg, a hajszálvonal csak görgetés után (v1-ben is így)                      | V3: a nav és a gomb beúszik (150–450 ms); V2: a pont középről a helyére, a betűk 25 ms-os lépcsővel élesednek                                                                                        | a betű-span-ek inline-ok, csak az animáció alatt inline-block (aláfutás/kerning marad) |
| Hero                                                | lágy radiális fényfolt a papírból (±5%), zaj a sávosodás ellen                                    | V1: a böngészőkeret `blur(16px) scale(1.06)` → éles (0–600 ms), **opacity nélkül**, LCP-elem marad; V4: H1 szavanként; ceruza a „mérés” után; V5: alcím, gombok; V6: állapotsor, a telefon 24 px-ről | a H1 LCP-hatását P3-ban mérem; ha >100 ms, a szavak nem 0-ról indulnak                 |
| Böngészőkeret                                       | felülről világosodó sáv a `--paper-raised`-ből, belső 1 px-es szegély (ink 6%), vinyetta (ink 4%) | –                                                                                                                                                                                                    | a kép nem kap szűrőt; a vinyetta egy rátett, `pointer-events: none` réteg              |
| Telefonkeret                                        | mélyebb kontaktárnyék                                                                             | V6                                                                                                                                                                                                   | –                                                                                      |
| Kártyák (szolgáltatás, csúszka, portré, munkakeret) | háromrétegű árnyék, felső fényél, `--line` hajszálvonal 70%                                       | V8 / V9                                                                                                                                                                                              | a lekerekítés 14 px marad                                                              |
| Elsődleges gomb                                     | ±4%-os függőleges tónus, belső fényél, `--accent` 25%-os színes árnyék, sheen (700 ms)            | a nyíl 4 px-t mozdul                                                                                                                                                                                 | a szín, méret, szöveg marad                                                            |
| Hajszálvonalak                                      | 2 dppx-en 0,5 px-esnek ható élesítés                                                              | –                                                                                                                                                                                                    | csak nagy felbontáson; az őr 1×-es képen fut                                           |
| Ceruzajelölés                                       | vonal menti, változó átlátszóságú maszk                                                           | V4 után kirajzolódik (900 ms)                                                                                                                                                                        | a szín marad `--accent-mark`                                                           |
| H2-k (szekciócímek)                                 | –                                                                                                 | V7: szavanként blurból                                                                                                                                                                               | `<RevealText>`: `aria-label` + `aria-hidden` szavak                                    |
| Bizonyíték-sáv                                      | saját szemcse (`soft-light`), felső fényél, fénymező                                              | V12: papír → tinta (fedőréteg `opacity`), V11: count-up + blur, a forrás utolsóként                                                                                                                  | a háttérszín maga nem animálódik                                                       |
| Kiemelt munka                                       | –                                                                                                 | a keret 48 px-ről és 0,97-ről; a címkék, név, mondat, metrikák lépcsőzve; metrika count-up                                                                                                           | a szélesség rögzített (CLS)                                                            |
| Csúszka                                             | –                                                                                                 | egyszeri 50 → 38 → 50% „megmutatás” (1,2 s), ha még senki nem nyúlt hozzá                                                                                                                            | a range értéke nem változik; bármilyen bevitel leállítja                               |
| Szűrő-pirulák                                       | –                                                                                                 | V10: balról jobbra, 6 px                                                                                                                                                                             | –                                                                                      |
| Munkarács                                           | –                                                                                                 | V8: soronként 64 px; benne kép → név → címkék                                                                                                                                                        | –                                                                                      |
| Szolgáltatás                                        | –                                                                                                 | kártya-lépcső; az ikonok `stroke-dashoffset`-tel (600 ms)                                                                                                                                            | a dashoffset SVG-attribútum, nem elrendezés                                            |
| Folyamat (erdőzöld)                                 | szemcse, fényél, fénymező                                                                         | papír → erdőzöld, a 01–04 maszk mögül (`clip-path`)                                                                                                                                                  | –                                                                                      |
| Rólam                                               | –                                                                                                 | a portré blurból, 1,04 → 1; a cégadat-sor gépelésszerűen (`clip-path` lépcsőkkel, ≤ 500 ms)                                                                                                          | a szöveg nem cserélődik (CLS)                                                          |
| GYIK                                                | –                                                                                                 | a kérdések lépcsőzve; a `<details>` magasság-animációja `::details-content` + `interpolate-size`, támogatás nélkül azonnal nyílik                                                                    | a magasság itt kivétel a „csak transform” szabály alól (a specifikáció kéri)           |
| Kapcsolat (tinta)                                   | szemcse, fényél, fénymező                                                                         | V14: a panel 80 px-ről (1000 ms), a mezők sorban                                                                                                                                                     | –                                                                                      |
| Lábléc                                              | –                                                                                                 | V14: az óriás szóvédjegy betűnként maszk mögül, a pont utolsóként                                                                                                                                    | `aria-hidden` szöveg, nincs akadálymentességi hatás                                    |
| Linkek                                              | –                                                                                                 | az aláhúzás balról jobbra rajzolódik (250 ms)                                                                                                                                                        | nyugalomban a v1 aláhúzása látszik                                                     |
| Kártya-spotlight                                    | –                                                                                                 | `pointer: fine`, csak a szolgáltatás-kártyákon, `--paper` 8%                                                                                                                                         | –                                                                                      |

## 3. A `motion.ts` felépítése (≤ 5 KB gzip)

- A tokeneket a `:root`-ból olvassa (`--dur-*`, `--stagger-*`, `--reveal-*`, `--ease-*`). Egy
  helyen vannak, a CSS-ben.
- `reveal(el, from, opts)`: `el.animate([from, {}], {fill: 'both'})`, a végén `cancel()` → nem
  marad inline stílus, `will-change` vagy `filter`.
- **Blur-keret:** az időablakokat számolja; ha egy új blur-os animáció ablakában már 12 blur fut,
  az új blur nélkül indul (csak fade + emelkedés). Gyenge eszközön (`hardwareConcurrency ≤ 4` vagy
  `saveData`) nincs blur.
- Egy IntersectionObserver (`threshold: 0.2`), minden cél egyszer fut le.

## 4. Mérföldkövek

|     | Tartalom                                                                                                                                                                       | Kész, ha                                                  |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------- |
| P0  | `scripts/baseline.ts`: a `v1-approved` buildje a `.baseline/dist`-be; képek, szerkezet és stílus JSON, Lighthouse → `docs/baseline/`; őrtesztek (szerkezet, arculat, vizuális) | az őrök a még változatlan kódon zöldek                    |
| P1  | tokenek, `motion.ts`, `<RevealText>`, inline szkript + CSP-hash, reduced-motion                                                                                                | minden teszt zöld, JS nélkül minden látszik               |
| P2  | textúrák (`pnpm textures`), anyagrétegek a kapu mögött                                                                                                                         | őrök zöldek; textúrás képek a `docs/baseline/polish/`-ban |
| P3  | hero belépő                                                                                                                                                                    | LCP-mérés a baseline-hoz képest ≤ +100 ms                 |
| P4  | görgetéses mozgás, mikro-interakciók                                                                                                                                           | e2e + axe zöld, CLS ≤ 0,05                                |
| P5  | finomítás, Lighthouse CI, videó (`docs/polish-demo.mp4`)                                                                                                                       | minden határ zöld                                         |

## 5. Kockázatok

| Kockázat                                             | Valószínűség          | Kezelés                                                                                                                                  |
| ---------------------------------------------------- | --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| A CSS átlépi a 25 KB-ot                              | magas                 | keyframes JS-ben, tömör szelektorok; ha mégis átlépi, először a mikro-interakciók egyszerűsödnek, utána a textúra (7. szakasz sorrendje) |
| A H1 vagy a hero-kép LCP-je késik                    | közepes               | a kép soha nem `opacity: 0`; a H1 hatását mérem                                                                                          |
| Kerning-eltérés a szó-/betű-span-ek miatt            | alacsony              | nyugalomban inline span (a szövegformázás közös), az őr képpontra méri                                                                   |
| A `content-visibility: auto` és az IO együttműködése | alacsony              | e2e-teszt görgetéssel                                                                                                                    |
| A Windows és a Linux képe eltér                      | biztos                | az őr mindig ugyanazon a gépen hasonlít (a baseline-t a teszt előtt építi)                                                               |
| A CSP blokkolja az inline szkriptet                  | biztos, ha nincs hash | build utáni hash-ellenőrzés a tesztben                                                                                                   |

## 6. Eredmény (2026-11-27)

| Mérföldkő | Commit-üzenet eleje        | Megjegyzés                                                         |
| --------- | -------------------------- | ------------------------------------------------------------------ |
| P0        | `test: P0 baseline …`      | `docs/baseline/`: képek, DOM/stílus, Lighthouse (LCP 2010 ms)      |
| P1        | `feat: P1 motion tokens …` | inline indító CSP-hash-sel, `<RevealText>`                         |
| P2        | `feat: P2 textures …`      | textúra-kapu, CSS-minifikálás (D-050), fejléc-blur javítás (D-051) |
| P3        | `feat: P3 hero intro …`    | kritikus/később betöltött CSS (D-052)                              |
| P4        | `feat: P4 scroll scenes …` | IO-alapú élesítés, kényszerített elrendezés nélkül                 |
| P5        | `feat: P5 …`               | görgetési teljesítményteszt, videó, dokumentáció                   |

A tervhez képest változott: a textúra és az anyagrétegek nem inline, hanem a load után
betöltött `deferred.css`-ben vannak (D-052). Az eltéréseket a D-050–D-056, a jóváhagyandó
pontokat az OPEN_QUESTIONS C. része sorolja fel.
