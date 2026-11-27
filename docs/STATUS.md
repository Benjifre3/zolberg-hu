# Állapot – 2026. 11. 27.

## Prémium finomítás (`feat/premium-polish`) – kész, jóváhagyásra vár

A mozgás és a textúra a `v1-approved` állapotra épül; a szerkezet, a tartalom, a színek és a
betűk változatlanok (az őrtesztek minden futáskor a címkéhez hasonlítanak).

| Mit nézz meg                     | Hol                                                                                                 |
| -------------------------------- | --------------------------------------------------------------------------------------------------- |
| Képernyővideó (asztali + mobil)  | `docs/polish-demo.mp4`                                                                              |
| Textúrák előtte/utána            | `docs/polish/textura-*-elotte-utana.jpg` (felül v1, alul az új)                                     |
| Teljes oldal textúrával          | `docs/polish/fooldal-*-textura.jpg`                                                                 |
| Terv, döntések, nyitott kérdések | `docs/POLISH_PLAN.md`, `docs/DECISIONS.md` (D-050–D-056), `docs/OPEN_QUESTIONS.md` C. rész (Q9–Q13) |

Mérés (helyi Lighthouse mobil, 5 futás mediánja): **99 / 100 / 100 / 100, LCP 2010 ms (v1: 2010),
TBT 33 ms, CLS 0**; JS 6,6 / 15 KB gzip (a `motion.ts` ≈ 3,7 KB), CSS 25,0 / 25 KB, textúrák
20,7 / 30 KB. Görgetés 4× CPU-lassítással: nincs 50 ms-nál hosszabb feladat. Tesztek: 61 unit,
119 e2e / mobil / axe / őr és 1 görgetési teljesítményteszt (`pnpm test:perf`, egyedül fut).

---

# Állapot – 2026. 11. 24.

Minden mérföldkő (R0, W0–W6) elkészült, és fent van a privát GitHub-repóban:
https://github.com/Benjifre3/zolberg-hu (`main`; a push minden alkalommal lefuttatja a CI-t). A kód kész; **az élesítéshez már csak tőled kell tartalom és
fiók.** Az éles build (`pnpm build`) addig szándékosan elbukik, és pontosan felsorolja, mi
hiányzik.

## Ami kész

| Terület      | Állapot                                                                                                                                                                           |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Oldal        | hero, bizonyíték-sáv, munkák (kiemelt, csúszka, szűrő, rács), szolgáltatás, folyamat, rólam, GYIK, kapcsolat + űrlap, lábléc; `/adatkezeles`, `/impresszum`, `/koszonjuk`, `/404` |
| Űrlap        | JS-sel és JS nélkül is; Turnstile nélkül (D-035); levélküldés Brevóval (D-040)                                                                                                    |
| Minőség      | 56 unit + 77 e2e/mobil/axe teszt zöld; tartalom-őr, költségvetés, linkellenőrzés; helyi Lighthouse 99/100/100/100                                                                 |
| CI           | GitHub Actions: minőségkapuk, vizuális alapképek, élesíthetőség, Lighthouse a Pages előnézeten (Cloudflare-titkok kellenek)                                                       |
| Dokumentáció | README, CONTENT_GUIDE, LAUNCH_CHECKLIST, DECISIONS (D-001–D-040), jogi tervezetek                                                                                                 |

## Amit nélküled hoztam meg (felülbírálható)

- **Q3 – Brevo** a levélküldéshez (D-040). Más szolgáltató egy új ág a `src/server/mailer.ts`-ben.
- **Szövegek** (szolgáltatás, folyamat, GYIK) – tervezetek, jóváhagyásra várnak (D-034).
- Korábbi döntéseid: Astro 7, Turnstile nélkül, az LCP-határ mérése a Pages előnézeten.

## Ami tőled kell (sorrendben)

1. **Cégadatok** a `content/site.yaml`-ba: név, képviselő, székhely, adószám, e-mail, telefon, válaszidő.
2. **Referenciák** (legalább 1–2, ideálisan 5): élő URL, írásos engedély, mérések → `docs/CONTENT_GUIDE.md`.
3. **Kézzel rajzolt ceruzavonal** (Q5): `src/assets/marks/underline.svg`.
4. **Jogi szövegek** a jogi konzultáció után: `content/legal/` (tervezet: `docs/legal-drafts/`).
5. **Portré és 2–3 mondatos bemutatkozás.**
6. **Fiókok:** Cloudflare (Pages + DNS) és Brevo (a GitHub-repó már kész) → `docs/LAUNCH_CHECKLIST.md` B pont.
7. A commitok szerzői e-mail-címe a fiókod privát (Apple-relay) címe; privát repóban csak te látod. Ha nyilvánossá tennéd a repót, előtte érdemes a GitHub `noreply` címére cserélni (Q7).

## Fontos kockázat

A mobil LCP helyben 2010 ms (tesztképpel, HTTP/1.1-es helyi szerveren). A specifikáció 1,8 s-os
határát a Pages előnézeten mérjük (D-037). Ezt még nem lehetett lefuttatni; az első
deploy után a CI dönt. Ha valódi képekkel sem fér bele, a tartaléklépések a `docs/PLAN.md`
kockázati táblájában vannak.
