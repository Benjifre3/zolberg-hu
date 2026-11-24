# Állapot – 2026. 11. 24.

Minden mérföldkő (R0, W0–W6) elkészült és commitolva van a helyi `main` ágon. Push nem
történt: nincs GitHub-repó. A kód kész; **az élesítéshez már csak tőled kell tartalom és
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
6. **Fiókok:** GitHub-repó, Cloudflare (Pages + DNS), Brevo → `docs/LAUNCH_CHECKLIST.md` B pont.
7. A git-azonosító a commitokban a fiókod e-mail-címe – push előtt cserélhető (Q7).

## Fontos kockázat

A mobil LCP helyben 2010 ms (tesztképpel, HTTP/1.1-es helyi szerveren). A specifikáció 1,8 s-os
határát a Pages előnézeten mérjük (D-037). Ezt még nem lehetett lefuttatni; az első
deploy után a CI dönt. Ha valódi képekkel sem fér bele, a tartaléklépések a `docs/PLAN.md`
kockázati táblájában vannak.
