# Referencia-elemzés (2A) – ramotion.com, krauszdesign.com, framer.com

Készült: 2026. november 23. · Szerep: senior UI/UX design review a zolberg.hu építése előtt
Státusz: az R0 mérföldkő része, ez a `docs/PLAN.md` bemenete, nem az oldal specifikációja.

## Anyag és módszer

| Referencia                            | Mélység                  | Nézetek                                                | Forrás                                               |
| ------------------------------------- | ------------------------ | ------------------------------------------------------ | ---------------------------------------------------- |
| ramotion.com (főoldal)                | teljes                   | 1525×900 (asztali), 834×1112 (tablet), 390×844 (mobil) | élő oldal, a Claude asztali app beépített böngészője |
| krauszdesign.com/#ingyeneskonzultacio | csak konverziós logika   | 1525×900                                               | élő oldal                                            |
| framer.com (főoldal)                  | csak az érdemi eltérések | 1525×900                                               | élő oldal                                            |

**Az értékek forrása.** Ahol egy érték mellett **CSS** áll, az a böngésző által számolt stílusból jön (`getComputedStyle`, `getBoundingClientRect`), 2026. 11. 23-i állapot, 1525 px széles nézet. Ezek pontos értékek az adott pillanatban. Minden más szám (képernyőképről leolvasott méret, árnyalat) közelítő érték: ezt itt egyszer mondom ki, a táblázatokban nem ismétlem.

**Jelölések.** **[látható]**: az anyagban látszik vagy mérhető. **[következtetett]**: vizuális vagy kódbeli jelből levezetve. **[ajánlott]**: saját javaslat ott, ahol az anyag nem mutat semmit.

**Korlátok.** A lusta betöltésű videók és képek egy része nem rajzolódott ki a képernyőképeken (a DOM-ban megvannak). A Ramotion fejléc-CTA-ja ebben a környezetben 2 px szélesre zárva jelent meg (inline `width: 0`, JS vezérli), a teljes állapota innen nem igazolható. Hover-időzítést és a menük tartalmát csak ott írom le, ahol a DOM-ból kiolvasható.

**Szöveg és arculat.** A referenciák szövegét szándékosan nem idézem, a szekciókat a funkciójukkal nevezem meg (2. szakasz 6. pont, 2A/5. szabály).

---

## 0. Összefoglaló

A ramotion.com egy portfólió-központú ügynökségi főoldal: óriás, középre zárt pozicionáló cím, egysoros alcím, utána azonnal a munka (showreel-videó), majd ügyfél-logófal, kézzel komponált, eltolt munkagaléria, képesség-diagram, vélemények és egyetlen nagy záró CTA. **Alapelv: a munka adja a vizuális izgalmat, a héj semleges marad** (egyetlen sötét szürke a világosszürke papíron, akcentusszín nélkül). Azért működik, mert a hierarchia három szintre van csupaszítva (óriás cím / szekciócím / törzs), a képek viszik a színt, és minden szekció ugyanarra a kétoszlopos fejlécmintára épül, így a szabálytalan galéria is rendezettnek hat.

---

## 1. Elrendezés

### Specifikáció (asztali, 1525 px)

| Tulajdonság             | Érték                                                                                                                                                                                                         | Jelölés      |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| Konténer                | `max-width: 1312px`, `padding: 0 16px` → tartalom **1280 px**                                                                                                                                                 | CSS          |
| Tartalom kezdő / záró x | 123 px / 1403 px                                                                                                                                                                                              | CSS          |
| Külső margó             | 122,5 px = a nézet **8,0%-a** (1440 px-en ugyanez a konténer 80 px-et, 5,6%-ot adna)                                                                                                                          | CSS, számolt |
| Rács                    | nincs globális 12 oszlopos rács; szekciónként két rendszer: (a) **felezett** 640 + 640 px (cím bal, bekezdés a jobb fél elején), (b) **5 oszlopos** 194–196 px-es cellák 271 px-es lépéssel (logófal, lábléc) | CSS          |
| Galéria-szélességek     | nagy **778 px** (60,8%), kicsi **443 px** (34,6%), fél **610 px** (47,7%)                                                                                                                                     | CSS          |
| Galéria vízszintes köz  | **59–60 px** (4,7%)                                                                                                                                                                                           | CSS          |
| Elosztás                | aszimmetrikus galéria, minden más szimmetrikus kétoszlopos vagy középre zárt                                                                                                                                  | látható      |

### Galéria-span minták (fentről lefelé)

| Sor | Bal             | Jobb                                      | Függőleges eltolás                          |
| --- | --------------- | ----------------------------------------- | ------------------------------------------- |
| A   | nagy (778×698)  | 2 kicsi egymás alatt (443×470, 61 px köz) | nincs                                       |
| B   | fél (610×572)   | fél (610×572)                             | a jobb kártya **316 px-szel lejjebb** indul |
| C   | kicsi (443×470) | nagy (778×698)                            | a jobb kártya **316 px-szel lejjebb**       |
| D   | kicsi (443×446) | –                                         | –                                           |

A minta tehát nem 4/8 (ahogy a master prompt ütközési táblája írta), hanem **≈61/35 → 48/48 eltolva → 35/61 tükrözve**. A sorok egymásba fogaznak: a B sor bal kártyája már a jobb oszlop második kis kártyája mellett elindul. **[látható]**

### Töréspontok

| Nézet   | Konténer                 | Galéria                                     | Navigáció                              | H1    | Jelölés       |
| ------- | ------------------------ | ------------------------------------------- | -------------------------------------- | ----- | ------------- |
| 1525 px | 1280 px + 122,5 px margó | aszimmetrikus, 2 oszlop, eltolással         | teljes                                 | 92 px | CSS           |
| 834 px  | 802 px (16 px margó)     | **1 oszlop**, 802 px széles kártyák         | teljes (4 link + CTA), nincs hamburger | 48 px | CSS           |
| 390 px  | 358 px (16 px margó)     | 1 oszlop, 358×394 px kártyák, **80 px** köz | **hamburger** (kör alakú gomb)         | 48 px | CSS + látható |

**A hierarchia megtartása:** tableten és mobilon a galéria egyetlen oszlopba esik, a sorrend a DOM-sorrend (Upstream → Rizzle → …), vagyis a kiemelt nagy munka marad az első. A showreel mobilon **kifut a margóból** (0–390 px, teljes szélesség), asztalin a konténerben marad. **[látható]**

---

## 2. Szekciósorrend

| #   | Név                  | Tartalom                                                                                                                                          | Cél                                        |
| --- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| 01  | Fejléc               | szóvédjegy, 4 link (az egyik lenyíló), sötét pirula-CTA                                                                                           | tájékozódás, kapcsolat mindig elérhető     |
| 02  | Hero                 | óriás pozicionáló H1 (2 sor), egysoros alcím, középre zárva                                                                                       | 3 másodperc alatt kimondja, mi ez és kinek |
| 03  | Showreel             | 1280×720-as, automatikusan induló, ismétlődő, néma videó, 10 px lekerekítéssel, linkként                                                          | a munka azonnal, magyarázat előtt          |
| 04  | Célcsoport + logófal | kétsoros H2 bal oldalt, „összes munka” link alatta, egy bekezdés a jobb félen; alatta 5 oszlopos, kb. 3 soros ügyfél-logófal, a logók cserélődnek | bizalom: kik dolgoztak már velük           |
| 05  | Munkagaléria         | 8 esettanulmány-kártya aszimmetrikus, eltolt elrendezésben, videós borítókkal                                                                     | a fő bizonyíték: minőség és változatosság  |
| 06  | Képességek           | H2 + bekezdés (ugyanaz a kétoszlopos fej), alatta Venn-diagram két sötét körrel és színes képesség-pirulákkal                                     | a szolgáltatás logikája egy képben         |
| 07  | Vélemények           | H2 bal, idézet jobb oldalt avatarral, névvel, beosztással; előző/következő gomb és számláló                                                       | harmadik fél hangja                        |
| 08  | Záró CTA             | egyetlen nagy, középre zárt sötét pirula                                                                                                          | egy döntés, egy kattintás                  |
| 09  | Lábléc               | hírlevél-panel, 5 linkoszlop, alsó sáv jogi linkekkel                                                                                             | másodlagos utak, jog, megbízhatóság        |

**Tartalmi stratégia:** Pozicionálás → Munka (showreel) → Kinek és ki bízott már bennük (logók) → Munkák → Képességek → Vélemények → Konverzió → (Hírlevél, lábléc).

**Oldaltípus:** portfólió-első ügynökségi főoldal (nem termékoldal, nem landing): a munka viszi a meggyőzést, a szöveg csak keretez.

**Szándékosan hiányzik [látható]:** árazás, csomagok, feature-rács, számokkal teli statisztika-sáv, GYIK, folyamat-szekció, csapatfotók, blog-ajánló és űrlap a főoldalon (a CTA a `/contact/` aloldalra visz).

---

## 3. Navigáció

| Tulajdonság            | Érték                                                                                                                                                                       | Jelölés                  |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| Pozíció                | `position: fixed`, `z-index: 1001`                                                                                                                                          | CSS                      |
| Magasság               | **82 px** (20 px + 42 px sor + 20 px)                                                                                                                                       | CSS                      |
| Régiók                 | 3 oszlopos rács: 443 / 362 / 443 px, 16 px köz → logó balra, linkek középen, CTA jobbra                                                                                     | CSS                      |
| Háttér                 | **átlátszó** (`rgba(0,0,0,0)`), árnyék nincs, `backdrop-filter` nincs; a tartalom alatta fut                                                                                | CSS + látható            |
| Logó                   | SVG szóvédjegy, 117×16 px, csupa nagybetűs, ritkított                                                                                                                       | CSS + látható            |
| Linkek                 | 16 px / 400, `padding: 9px 16px` → **42 px magas** találati felület, nincs aláhúzás                                                                                         | CSS                      |
| Lenyíló                | egy menüpontnál 17×16 px-es lefelé mutató jel; a rejtett rétegben szolgáltatás- és programlista van, a lenyílás viselkedése (hover vagy kattintás, késleltetés) nem igazolt | látható + következtetett |
| Fejléc-CTA             | sötét (`#262626`) pirula, `border-radius: 20px`, 38 px magas, fehér szöveg + nyíl. Ebben a környezetben 2 px-es függőleges vonalként látszott (JS-ből kapott `width: 0`)    | CSS + következtetett     |
| CTA a linkekhez képest | kitöltött sötét pirula, a linkek keret és háttér nélküliek: két szintű hierarchia                                                                                           | CSS                      |
| Mobil                  | kör alakú hamburger-gomb jobbra (`aria-label` angol, általános), a linkek rejtve; tableten (834 px) még teljes menü                                                         | látható                  |

**Megjegyzés:** az átlátszó fix fejléc a görgetett tartalom fölött a szöveget a képekre ülteti (a 480 px-es görgetésnél a logó a videóra került). A master prompt ütközési táblája „tömör háttér”-ként írta le, a mostani állapot ettől eltér; a Zolberg-döntést ez nem érinti.

---

## 4. Tipográfia

**Betűosztály:** semleges geometrikus–groteszk sans, egyetlen család három vágással. **Család: Graphik Web** 400 / 500 / 600 (a böngészőben betöltött fontok listájából) **[CSS]**, tartalék: `system-ui`.

### Skála (1525 px)

| Elem                     | Méret         | Súly | Sormagasság    | Betűköz               | Igazítás    |
| ------------------------ | ------------- | ---- | -------------- | --------------------- | ----------- |
| Hero H1                  | **92 px**     | 600  | 101,2 px (1,1) | −3,2 px (≈ −0,035 em) | közép       |
| Szekció H2               | 48 px         | 600  | 57,6 px (1,2)  | normál                | bal         |
| H2 (vélemények)          | 40 px         | 600  | 48 px (1,2)    | normál                | bal         |
| Kártyacím                | 32 px         | 600  | 38,4 px (1,2)  | normál                | bal         |
| Idézet                   | 24 px         | 400  | 37,2 px (1,55) | normál                | bal         |
| Név (vélemény), panelcím | 24 px         | 500  | 1,2–1,4        | normál                | bal         |
| Hero alcím               | 18 px         | 400  | 27,9 px (1,55) | normál                | közép       |
| Záró CTA szövege         | 20 px         | 400  | 28 px          | normál                | közép       |
| Törzs, nav, lábléc       | 16 px         | 400  | 24 px (1,5)    | normál                | bal         |
| Mobil H1 / H2            | 48 px / 32 px | 600  | 52,8 px (1,1)  | −3,2 px (!)           | közép / bal |

Minden érték **CSS**.

### Címkezelés és hierarchia

- **Méretkontraszt:** H1 : H2 : törzs = 92 : 48 : 16 ≈ 5,75 : 3 : 1. A három szint között nincs köztes méret, ettől „szerkesztett” a hatás. **[CSS]**
- **Sortörés:** a H2-k kézzel tördeltek (`<br>`), két rövid sorba; a H1 két sorban áll. **[CSS]**
- **Betűköz:** csak a H1 szűkített. A mobil H1 ugyanazt a fix −3,2 px-et kapja 48 px-en, ami −0,067 em: túl szoros, a betűk összeérnek. **Kerülendő minta:** a betűközt `em`-ben kell megadni (a Zolberg-specifikáció ezt már így teszi). **[CSS]**
- **Bekezdés-szélesség:** a jobb oldali bekezdések 640 px-esek 16 px-en, ez kb. 80–85 karakter/sor, a felső határon van. A hero alcím `max-width: 980px`, asztalin egy sor. **[CSS + következtetett]**
- **Olvashatóság:** `#262626` a `#FAFAFA`-n kb. 14,5:1; a másodlagos `#6F7984` kb. 4,2:1, ez 16 px-en **AA alatt** marad. **[számolt]**

---

## 5. Színrendszer

| Szerep                            | Hex                                                   | Használat                       | Jelölés  |
| --------------------------------- | ----------------------------------------------------- | ------------------------------- | -------- |
| Háttér                            | `#FAFAFA`                                             | oldal héja                      | CSS      |
| Fő szöveg                         | `#262626`                                             | minden szöveg, címek            | CSS      |
| Másodlagos                        | `#6F7984`                                             | lábléc-oszlopfejek, copyright   | CSS      |
| Panel                             | `#F2F2F2`                                             | hírlevél-panel                  | CSS      |
| Sötét felület                     | `#262626`                                             | CTA-pirulák, Venn-körök         | CSS      |
| Mélyebb sötét                     | `#131313`                                             | a Venn-metszet                  | CSS      |
| Vonal                             | ≈ `#D9D9D9`                                           | lábléc elválasztó               | közelítő |
| Pirula-szövegek (csak a Venn-ben) | `#FDFF99`, `#7ACFFF`, `#C9BBFF`, `#FF8BA0`, `#68FFC9` | képesség-linkek a sötét körökön | CSS      |

**Akcentus:** globális akcentusszín nincs. A szín a munkák képeiből és videóiból jön; az egyetlen színes UI-elem a Venn-diagram pasztell pirulasora. **[látható]**

**Elv egy mondatban:** monokróm, enyhén hideg szürke héj, amelyben minden szín a munkához tartozik, ezért a képek vizuálisan mindig nyernek.

---

## 6. Térköz és ritmus

| Terület                                 | Asztali érték                                             | Jelölés      |
| --------------------------------------- | --------------------------------------------------------- | ------------ |
| Oldalmargó                              | 122,5 px (8%)                                             | CSS          |
| Fejléc                                  | 82 px                                                     | CSS          |
| Hero felső térköz                       | a H1 teteje 140 px-en, a fejléc alatt 58 px-szel          | CSS          |
| H1 → alcím                              | 32 px                                                     | CSS          |
| Alcím → munka (showreel)                | **80 px**                                                 | CSS          |
| Showreel → következő H2                 | 112 px                                                    | CSS          |
| H2 → link / bekezdés                    | 24 px                                                     | CSS          |
| Bekezdés → logófal                      | 58 px                                                     | CSS          |
| Logófal                                 | 196×105 px cellák, 75 px vízszintes, 27 px függőleges köz | CSS          |
| Szekciók belső felső térköze            | 56 px (a galériánál 140 px fent, 80 px lent)              | CSS          |
| Látható köz két szekció tartalma között | 112–136 px                                                | CSS, számolt |
| Kép → kártyacím                         | 25 px                                                     | CSS          |
| Galéria vízszintes / függőleges köz     | 60 px / 60–111 px                                         | CSS          |
| Utolsó szekció → záró CTA               | 56 px                                                     | CSS          |
| Záró CTA → lábléc-panel                 | 113 px                                                    | CSS          |
| Lábléc-panel belső térköze              | 32 px / 48 px                                             | CSS          |
| Panel → linkoszlopok                    | 63 px                                                     | CSS          |
| Lábléc-oszlopok                         | 194 px-es oszlop, 271 px-es lépés; linksorok 40 px-enként | CSS          |

**A hero levegője:** 1525×900-on a H1 és az alcím a felső 402 px-et foglalja, a showreel 482 px-nél indul, így **az első képernyő 46%-a már munka**. Mobilon (390×844) a munka 413 px-nél indul, ott is a képernyő fele. A hero tehát nem „üres levegő”, hanem rövid felvezetés a munka előtt. **[CSS + számolt]**

**Szándékos szabálytalanságok:** a galéria 316 px-es függőleges eltolása; a tükrözött nagy/kicsi párok; a kétsoros H2 bal oldalon, mellette a jobb fél tetején induló bekezdés, ami aszimmetrikus üres teret hagy a H2 alatt. **[látható]**

---

## 7. Képkezelés

| Tulajdonság               | Érték                                                                                                                                                                                                                                           | Jelölés              |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| Típusok                   | termék-UI képernyők eszközkontextusban, márka-identitás fotók, mockupok; a galériában **automatikusan induló videók**                                                                                                                           | látható + CSS        |
| Méret a szöveghez képest  | a kép a kártya 84%-a (583 / 698 px), a cím alatta 25 px-re                                                                                                                                                                                      | CSS                  |
| Képarány                  | galéria **4:3** (778×583), showreel **16:9** (1280×720)                                                                                                                                                                                         | CSS                  |
| Lekerekítés               | 8 px (kártyák), 10 px (showreel)                                                                                                                                                                                                                | CSS                  |
| Árnyék                    | nincs                                                                                                                                                                                                                                           | CSS                  |
| Kivágás                   | `object-fit: contain`, a keret `overflow: hidden`                                                                                                                                                                                               | CSS                  |
| Háttér, overlay, gradiens | **a képeken belül** (pl. lila színátmenet egy SaaS-esettanulmány borítóján), a héjon soha                                                                                                                                                       | látható              |
| Animáció                  | a galéria-videók és a showreel `autoplay` + `loop`; a logók átúsznak egymásba (két réteg, az egyik `opacity: 0`); a kártyák hover-viselkedése (nagyítás, leírás-megjelenés) statikusan nem igazolható, a leírás-bekezdés 0,3 s-os átmenetet kap | CSS + következtetett |

---

## 8. Kártyák és blokkok

| Blokk            | Szerkezet                                                                                                     | Lekerekítés   | Keret / árnyék | Belső térköz        | Igazítás, rács                                   | Fókusz                                                        |
| ---------------- | ------------------------------------------------------------------------------------------------------------- | ------------- | -------------- | ------------------- | ------------------------------------------------ | ------------------------------------------------------------- |
| Portfólió-kártya | média → cím (32 px) → leírás (16 px, valószínűleg csak hoverre látszik); az egész kártya egy link             | 8 px a médián | nincs / nincs  | 0 (a média kitölti) | kézzel elhelyezett, eltolt 2 oszlop; nem masonry | nem vizsgált; [ajánlott] a teljes kártyán látható fókuszgyűrű |
| Logócella        | 196×105 px, két egymásra helyezett logó, átúszás                                                              | nincs         | nincs          | –                   | 5 oszlopos rács                                  | nem link (egy részük igen)                                    |
| Képesség-pirula  | színes szöveg + bal oldali hely ikonnak (32 px bal belső térköz) + kis nyíl                                   | 20 px         | nincs          | 8 / 12 / 8 / 32 px  | szabadon a körökön                               | –                                                             |
| Vélemény         | idézet (24 px) → 80 px-es kerek avatar + név + beosztás; jobbra fent 48×48-as nyílgombok és „1 / 11” számláló | avatar 50%    | nincs          | –                   | a jobb fél (640 px)                              | a nyílgomboknak van szöveges címkéje                          |
| Hírlevél-panel   | cím + egy mondat bal oldalt, körvonalas pirula jobb oldalt                                                    | 8 px          | nincs          | 32 / 48 px          | teljes konténer                                  | –                                                             |

**Ikonhasználat:** minimális, csak nyilak (16×12 px) és a lenyíló jele. **[CSS]**

---

## 9. Gombok és CTA-k

| Típus                     | Kitöltés                                            | Szöveg           | Nyíl              | Lekerekítés | Méret                                                                   | Jelölés              |
| ------------------------- | --------------------------------------------------- | ---------------- | ----------------- | ----------- | ----------------------------------------------------------------------- | -------------------- |
| Fejléc-CTA (elsődleges)   | `#262626` tömör                                     | fehér, 16 px     | igen              | 20 px       | ~38 px magas                                                            | CSS                  |
| Szöveges link a cím alatt | nincs                                               | `#262626`, 16 px | igen, 16×12       | –           | 27 px magas, 1 px-es átlátszó alsó keret (hoverre valószínűleg látszik) | CSS + következtetett |
| Körvonalas másodlagos     | panel színe                                         | `#262626`, 20 px | nem               | 40 px       | 150×60 px, 1 px keret                                                   | CSS                  |
| Nagy záró CTA             | `#262626` tömör, 2 px azonos színű keret            | fehér, 20 px     | igen, jobb szélen | 40 px       | **340×75 px**, középen                                                  | CSS                  |
| Tartalomba ültetett       | a képesség-pirulák (színes szöveg, átlátszó háttér) | pasztell         | kis nyíl          | 20 px       | 38 px magas                                                             | CSS                  |

**Hierarchia:** tömör sötét (fejléc, záró) → körvonalas (hírlevél) → szöveges link nyíllal (szekciófejekben) → tartalomba ültetett pirula. A záró CTA a legnagyobb gomb az oldalon, a végén áll, és egyetlen dolgot kér.

**Hover és fókusz:** a linkek színátmenete `color 0.3s ease-in-out` **[CSS]**; a gombok hover-állapota és fókuszgyűrűje statikusan nem igazolható. **[ajánlott]**: minden interaktív elemen látható, nem csak színnel jelzett fókusz.

---

## 10. Összhatás

- **Minimalista:** egy betűcsalád, két szürke, nulla akcentus; minden díszítés a munkában van.
- **Szerkesztett:** kézzel tördelt címek, tükrözött és eltolt galéria, ismétlődő kétoszlopos szekciófej: tudatos kompozíció, nem sablon.
- **Munka-központú:** a hajtás felett már munka látszik; a szöveg mennyisége szekciónként egy bekezdés.
- **Magabiztos, csendes:** nincs felkiáltás, nincs számháború, nincs sürgetés; a tekintélyt a márkanevek és a kidolgozottság adja.

**Érzelmi hangvétel:** nyugodt, prémium, kissé távolságtartó. **Tervezési kategóriák:** svájci/nemzetközi tipográfia (rács, groteszk, középhangsúly nélküli héj), szerkesztőségi portfólió, termékbemutató (videós borítók).

**Mit kerül el szándékosan:** gradiens-héj, ikonrácsok, árazás, „miért mi” listák, statisztika-sávok, stockfotó.

**Mit nem vesz át a Zolberg teljesítmény-okokból [látható]:** a főoldal automatikusan induló videókat, Google Tag Managert, egy közösségimédia-követő pixelt és egy RUM-mérőt tölt be. A 2. szakasz 4. pontja ezeket kizárja; a zolberg.hu-nak éppen a mérhetően könnyű oldal a referenciája.

---

## Kiegészítő referenciák (csak az érdemi eltérések)

### krauszdesign.com – konverziós logika

Csak az ajánlat és a CTA felépítése; szöveg, ajánlat-megfogalmazás és vizuális megoldás nem vehető át (2A/5.).

| Elem                                | Megfigyelés                                                                                                                                                                                                                                                                             | Jelölés |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| Egy cél                             | minden CTA (fejléc-pirula, hero-gomb, láblécbeli link) **ugyanarra a horgonyra** visz: az ingyenes konzultáció blokkjára                                                                                                                                                                | látható |
| A CTA állandó                       | a fejléc kiemelt pirulája görgetés közben is látszik                                                                                                                                                                                                                                    | látható |
| Narratív ív                         | ígéret → fájdalompontok felismertetése → miért nem működik a „hagyományos” oldal (kétoszlopos összevetés) → referenciák → szolgáltatások → 5 lépéses folyamat (füles panelek) → bemutatkozás → vélemény-fal (névvel, cégnévvel) → **foglalás** → tartalmi blokk → kapcsolat (térképpel) | látható |
| A konverziós lépés                  | beágyazott **naptárfoglaló** (időpont-választás űrlap helyett, 20 perces online hívás, látható szabad sávok): a súrlódás 2 kattintás                                                                                                                                                    | látható |
| Társadalmi bizonyíték a CTA mellett | logósor közvetlenül a hero-gomb alatt; partner-jelvény a cím fölött                                                                                                                                                                                                                     | látható |
| Kettős út                           | elsődleges: foglalás; másodlagos: kapcsolat-blokk (cím, térkép)                                                                                                                                                                                                                         | látható |
| Technika                            | Framerrel épült, sötét téma, **sütibanner**, harmadik féltől származó naptár-iframe és Google Maps-iframe                                                                                                                                                                               | látható |

**Pozicionálási ütközés (fontos).** A versenytárs hero-ígérete is a _mérhető eredményekre_ épül. A Zolberg H1-je („Céges weboldal, amit a mérés igazol.”) ugyanebbe a mezőbe lép. A különbséget nem a szlogen, hanem a **bizonyíték formája** adja: dátumozott, forrásmegjelölt mérés a látogató saját oldaláról a beszélgetés _előtt_, és maga a zolberg.hu mint mérhető példa. Ezt a bizonyíték-sávnak és a munkakártyák mono címkéinek kell hordoznia, nem újabb ígéretnek.

### framer.com – átvehető minták

| Elem       | Megfigyelés                                                                                                                                    | Jelölés |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| Szekciófej | H2 (44 px / 500, −0,04 em) **balra**, kis másodlagos gomb **jobbra, ugyanabban a sorban**; minden szekcióban azonos                            | CSS     |
| Hero       | balra zárt H1 (54 px / 500, sormagasság 1,0, −0,04 em), alatta egy sor, gomb; utána azonnal egy 1200×674-es termékkép                          | CSS     |
| Vonalrács  | a képesség-blokk 3 oszlopos rács, a cellákat **1 px-es vonalak** választják el (nincs köz, nincs kártya); cellacím + nyíl, alatta illusztráció | látható |
| Bemutató   | vegyes méretű csempék (nagy + kicsi) a kész oldalakról                                                                                         | látható |
| Záró CTA   | az egyetlen középre zárt cím az oldalon, 54 px                                                                                                 | CSS     |
| Konténer   | 1200 px tartalom, 155 px margó 1525-ön                                                                                                         | CSS     |
| Fejléc     | 64 px, lenyíló jelek, kis tömör gomb (30 px magas, 8 px lekerekítés) + szöveges link                                                           | CSS     |
| Eltérés    | sötét téma, sütibanner, követés; ezek nem átvehetők                                                                                            | látható |

---

## Eltérések a master prompt ütközési táblájától

Az ütközési tábla Zolberg-oszlopa érvényes, ezen a mostani megfigyelés nem változtat. A _referencia-oszlop_ leírását a mostani állapot alapján pontosítom:

| Téma            | Ütközési tábla (referencia)                  | Megfigyelt állapot, 2026. 11. 23.                                                                                                                  |
| --------------- | -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Konténer, margó | ~1328 px, 96–100 px oldalmargó               | 1312 px max. (benne 16 px belső margó) → 1280 px tartalom; 1525 px-en 122,5 px margó. 96–100 px nagyjából 1475–1480 px-es nézetnél adódna.         |
| Fejléc          | tömör háttér, árnyék nélkül                  | fix, **átlátszó** háttér, árnyék és elmosás nélkül                                                                                                 |
| Portfólió       | eltolt, aszimmetrikus 4/8-as galéria         | ≈61/35 → 48/48 (316 px eltolás) → 35/61; nem 12 oszlopos span                                                                                      |
| Szolgáltatások  | interaktív kördiagram, előnézettel           | kétkörös Venn-diagram + 5 színes link-pirula; előnézet nem volt megfigyelhető                                                                      |
| Lábléc          | kinyitható szolgáltatás-/város-/programlista | 5 statikus linkoszlop + hírlevél-panel + jogi alsó sáv; kinyitható lista a főoldalon nem látszott (a szolgáltatáslista a rejtett menürétegben van) |
| Vélemények      | véleménykarusszel                            | kézi léptetés (előző / következő, „1 / 11”); automatikus lapozást nem figyeltem meg                                                                |
| Mélység         | szinte nincs árnyék, 8–10 px lekerekítés     | megerősítve: árnyék nincs, 8 px (kártya) és 10 px (showreel)                                                                                       |
| Mobilnavigáció  | hamburger (ajánlott)                         | megerősítve: kerek hamburger 390 px-en; 834 px-en még teljes menü                                                                                  |

---

## 11. Átvételi térkép (Zolbergre fordítva)

A referencia-elemzésből csak szerkezeti elv jön, konkrét érték (szín, betű, méret, effekt, szöveg) nem (2. szakasz 7. pont).

| #   | Referenciaminta                                                      | Átvehető elv                                                                                                    | Zolberg-megfelelő (szakasz)                                                                                                                                                                                                            | Nem átvehető                                                                                                             |
| --- | -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| 1   | Ramotion hero: óriás cím → egy sor → 80 px múlva munka               | **A munka a hajtás felett látszik.** Az első képernyőnek legalább 35%-a munka legyen asztalin.                  | 6.2 Hero: állapotsor → H1 → [alcím \| gombok egy sorban asztalin] → hero-kép böngészőkeretben, rálógó telefonnal. **Cél [ajánlott]:** a hero-kép teteje 1440×900-on legfeljebb 560 px-nél, 390×844-en legfeljebb 620 px-nél kezdődjön. | showreel-videó, középre zárt H1, Graphik                                                                                 |
| 2   | Ramotion kétoszlopos szekciófej (H2 bal, bekezdés a jobb fél elején) | Egy szekció = egy cím + egy bekezdés, a bekezdés a második oszlopban, így a cím alatt szándékos üres tér marad. | 6.5 Szolgáltatás, 6.7 Rólam, 6.8 GYIK fejléce asztalin; mobilon egymás alatt                                                                                                                                                           | a szövegek, a 640 px-es (túl hosszú) sor; Zolbergnél a sorhossz max. 60–70 karakter (4.)                                 |
| 3   | Framer szekciófej (H2 bal, link jobb, közös sor)                     | A szekció másodlagos útja a cím sorában, jobbra zárva.                                                          | 6.4 „Munkák, mérésekkel együtt.” + jobbra „Esettanulmányt kérek”                                                                                                                                                                       | a gomb kinézete                                                                                                          |
| 4   | Ramotion galéria: nagy + kicsi, tükrözött, eltolt                    | **Szerkesztett aszimmetria a legerősebb munkánál**, a többi rendezett.                                          | 6.4 Kiemelt munka ≈60/40 (kép / szöveg), alatta szabályos 2 oszlopos rács; eltolás csak a kiemeltnél [ajánlott]                                                                                                                        | 316 px-es eltolás a rácsban, videós borítók                                                                              |
| 5   | Ramotion kártya: média → cím, a kép domináns                         | Kép → név → egy mondat → bizonyíték. A kép a kártya magasságának legalább kétharmada.                           | 6.4 munkakártya: 16:10 böngészőkeret → név + iparág → egy mondat → mono metrika- és típuscímke; **minden szöveg mindig látszik** (nincs csak hoverre megjelenő leírás, mobilon nem működne)                                            | csak hoverre látható leírás, 4:3 arány, árnyék nélküli lapos kép (Zolberg: kétrétegű árnyék, 14 px, böngészőkeret, 4–5.) |
| 6   | Ramotion logófal                                                     | Harmadik fél neve csak akkor, ha valós és engedélyezett.                                                        | 6.4 utolsó pont: alapból kimarad; ha lesz, statikus sor                                                                                                                                                                                | átúszó logók, nagy fal                                                                                                   |
| 7   | Ramotion vélemény (idézet + arc + név + szerep)                      | Egy hang, egy arc, valódi név.                                                                                  | 6.4 (csak írásos engedéllyel); ha nincs, kimarad                                                                                                                                                                                       | karusszel, számláló                                                                                                      |
| 8   | Ramotion Venn-diagram                                                | A szolgáltatás egy nézetben, egymásra épülő lépésekként.                                                        | 6.5 négy statikus kártya vonalikonnal                                                                                                                                                                                                  | interaktív diagram, pasztell pirulák                                                                                     |
| 9   | Framer vonalrács (cellák 1 px-es vonallal, köz nélkül)               | Kártyák helyett vonalakkal osztott cellák a felsorolás-jellegű blokkban.                                        | 6.6 Folyamat-sáv: 4 lépés, függőleges 1 px-es elválasztókkal (`--paper` 20%-os átlátszósággal a forest-en) [ajánlott]                                                                                                                  | sötét téma, termékképek                                                                                                  |
| 10  | Ramotion nagy záró CTA (340×75, egyetlen kérés)                      | Az oldal végén egyetlen, nagy, egyértelmű kérés.                                                                | 6.9 Kapcsolat (tinta háttér): H2 + 3 mezős űrlap + 52 px-es pirula-gomb; ez a záró CTA                                                                                                                                                 | „Let's talk” típusú üres CTA; Zolbergnél a gomb a konkrét kért dolgot mondja („Kérem a mért adatokat”)                   |
| 11  | Krausz: minden CTA ugyanarra a horgonyra                             | **Egy konverziós cél, 4 belépési pont.**                                                                        | fejléc „Beszéljünk” → `#kapcsolat`; hero fő gomb → `#kapcsolat`; „Esettanulmányt kérek” → `#kapcsolat`; lábléc-link → `#kapcsolat`                                                                                                     | naptárfoglaló-beágyazás (harmadik féltől származó script és süti, 2.4)                                                   |
| 12  | Krausz: konkrét, időkeretes ajánlat a CTA mellett                    | A kért dolog konkrét, ingyenes, kötelezettség nélküli, és **le van írva, mi történik utána**.                   | 6.9: „[X] munkanapon belül … mérési összefoglaló”; a `/koszonjuk` oldal leírja a formátumot (11.)                                                                                                                                      | az ajánlat megfogalmazása                                                                                                |
| 13  | Krausz: bizonyíték közvetlenül a hero-gomb alatt                     | Az első bizonyíték a CTA után azonnal jön.                                                                      | 6.3 Bizonyíték-sáv közvetlenül a hero után                                                                                                                                                                                             | logósor kitalált vagy engedély nélküli logókkal                                                                          |
| 14  | Ramotion monokróm héj                                                | Visszafogott héj, a karaktert a munka és az aláíró elemek adják.                                                | 4. meleg papír + egy vermilion akcentus legfeljebb 5%-on; aláíró elemek: ceruzajelölés, mono címkék, csúszka, név és arc, óriás szóvédjegy                                                                                             | a szürke paletta                                                                                                         |
| 15  | Ramotion: fix px betűköz a mobil H1-en                               | **Ellenpélda:** a betűköz `em`-ben skálázódjon.                                                                 | 4. `letter-spacing: -0.035em / -0.04em`                                                                                                                                                                                                | –                                                                                                                        |
| 16  | Ramotion: #6F7984 másodlagos szöveg (≈4,2:1)                         | **Ellenpélda:** a másodlagos szöveg is AA legyen.                                                               | 4. `--ink-2` 6,1:1                                                                                                                                                                                                                     | –                                                                                                                        |
| 17  | Mindhárom: harmadik féltől származó script, süti, autoplay videó     | **Ellenpélda:** a referencia-oldal maga a bizonyíték.                                                           | 2.4, 9. teljesítmény-költségvetés                                                                                                                                                                                                      | –                                                                                                                        |

**Kifejezetten átvett szerkezeti elvek (a master prompt alapján, a megfigyeléssel megerősítve):** óriás cím → egysoros alcím → azonnal munka; a munka előbb jön, mint a magyarázat; domináns kép, másodlagos szöveg; visszafogott héj; tömör / körvonalas / nagy záró CTA-hierarchia; bőkezű térköz; szerkesztett aszimmetria a kiemelt munkánál.
