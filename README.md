# zolberg.hu

Egyoldalas bemutatkozó oldal: Astro 7, statikus kimenet, Cloudflare Pages + egy Pages Function
(`/api/contact`). Az oldal maga a referencia: a teljesítmény-költségvetést (9.) a build és a CI
kikényszeríti.

| Dokumentum                                             | Miről szól                                           |
| ------------------------------------------------------ | ---------------------------------------------------- |
| [`docs/STATUS.md`](docs/STATUS.md)                     | **hol tart a projekt, mi kell még tőled**            |
| [`docs/MASTER_PROMPT.md`](docs/MASTER_PROMPT.md)       | a specifikáció (v2)                                  |
| [`docs/PLAN.md`](docs/PLAN.md)                         | architektúra, mérföldkövek, kockázatok               |
| [`docs/DECISIONS.md`](docs/DECISIONS.md)               | minden döntés indoklással (D-001…)                   |
| [`docs/OPEN_QUESTIONS.md`](docs/OPEN_QUESTIONS.md)     | nyitott kérdések és hiányzó tartalom                 |
| [`docs/CONTENT_GUIDE.md`](docs/CONTENT_GUIDE.md)       | tartalomcsere: referenciák, mérések, képek, szövegek |
| [`docs/LAUNCH_CHECKLIST.md`](docs/LAUNCH_CHECKLIST.md) | élesítés lépésről lépésre                            |
| [`docs/REFERENCE_REVIEW.md`](docs/REFERENCE_REVIEW.md) | a referencia-elemzés (2A)                            |

## Követelmények

- Node.js ≥ 22.23.4 (fejlesztve: 26 LTS, lásd `.node-version`)
- pnpm 12: `npm install -g pnpm`
- Első futtatás előtt: `pnpm install`, majd a tesztekhez `pnpm exec playwright install chromium`

## Napi parancsok

| Parancs                                    | Mit csinál                                                                                                                            |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm dev`                                 | fejlesztői szerver: http://localhost:4321 (a `content/` tartalmával)                                                                  |
| `pnpm build`                               | **éles build**: build + költségvetés + tartalom-őr éles módban. Elbukik, ha helyőrző, tesztadat vagy hiányzó kötelező tartalom marad. |
| `pnpm build:fixture`                       | build a tesztadattal (`tests/fixtures/content/`)                                                                                      |
| `pnpm test`                                | unit tesztek + tesztadatos build + e2e, mobil és akadálymentességi tesztek (a `wrangler pages dev` alatt, próbamódú levélküldéssel)   |
| `pnpm check` / `pnpm lint` / `pnpm format` | típusellenőrzés / ESLint + Prettier / automatikus formázás                                                                            |
| `pnpm links`                               | belső linkek és horgonyok ellenőrzése a `dist/`-ben; `pnpm links:external` a külső linkeket is                                        |
| `pnpm test:lh`                             | Lighthouse CI helyben (mobil, 3 futás mediánja); `pnpm test:lh -- --preview <URL>` az előnézeten                                      |
| `pnpm test:visual`                         | vizuális regresszió 390 / 834 / 1440 px-en (az alapképek a CI-ban készülnek)                                                          |

## Tartalomcsere röviden

Minden tartalom a `content/` mappában van, kód nélkül szerkeszthető – a részletek a
[`docs/CONTENT_GUIDE.md`](docs/CONTENT_GUIDE.md)-ben:

- `content/site.yaml` – cégadatok, hero, bizonyíték-sáv, szolgáltatás, folyamat, rólam, GYIK
- `content/portfolio.yaml` – a referenciák (az OutreachEngine is innen olvas)
- `content/works/`, `content/about/` – képek; `content/measurements/` – nyers mérések
- `content/legal/` – adatkezelési tájékoztató, impresszum (tervezet: `docs/legal-drafts/`)

Ami még nincs meg, az `null` a YAML-ban – az elem ekkor nem jelenik meg, nincs helyőrző.

## Deploy (Cloudflare Pages)

Build-parancs: `pnpm build`, kimenet: `dist`, Node-verzió: a `.node-version` szerint. A
`functions/` mappát a Pages automatikusan függvényként telepíti. Környezeti változók, titkok,
DNS és átirányítások: [`docs/LAUNCH_CHECKLIST.md`](docs/LAUNCH_CHECKLIST.md).

## Felépítés

```
content/            tartalom (YAML, Markdown, képek, mérések)
functions/api/      Pages Function: /api/contact
src/components/     Astro-komponensek (BEM-előtagos, hash nélküli stílusok – D-033)
src/lib/            adatbetöltés + zod-sémák, formázás, szabályok
src/server/         az űrlap szerveroldali logikája, levélküldő adapter
src/pages/          főoldal, jogi oldalak, köszönőoldal, 404, robots.txt
scripts/            betűk, képek, OG-kép, költségvetés, tartalom-őr, linkek, Lighthouse
tests/              unit, e2e, a11y, vizuális tesztek + fixtures (TESZTADAT)
```
