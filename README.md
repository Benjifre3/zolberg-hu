# zolberg.hu

Egyoldalas bemutatkozó oldal: Astro 7, statikus kimenet, Cloudflare Pages. A specifikáció a
[`docs/MASTER_PROMPT.md`](docs/MASTER_PROMPT.md), a terv a [`docs/PLAN.md`](docs/PLAN.md), a döntések
a [`docs/DECISIONS.md`](docs/DECISIONS.md), a nyitott kérdések az
[`docs/OPEN_QUESTIONS.md`](docs/OPEN_QUESTIONS.md).

> Állapot: **W0** (váz, tokenek, betűk, minőségkapuk). A teljes kézikönyv (tartalomcsere, deploy) a
> W6-ban készül el.

## Követelmények

- Node.js ≥ 22.23.4 (fejlesztve: 26 LTS, lásd `.node-version`)
- pnpm 12 (`npm install -g pnpm`)

## Parancsok

| Parancs              | Mit csinál                                                                                                 |
| -------------------- | ---------------------------------------------------------------------------------------------------------- |
| `pnpm install`       | függőségek telepítése                                                                                      |
| `pnpm dev`           | fejlesztői szerver: http://localhost:4321                                                                  |
| `pnpm build`         | **éles** build + teljesítmény-költségvetés + tartalom-őr (elbukik, ha helyőrző vagy hiányzó cégadat marad) |
| `pnpm build:fixture` | build a tesztekhez (a tartalom-őr éles szabályai nélkül)                                                   |
| `pnpm preview`       | a `dist/` kiszolgálása                                                                                     |
| `pnpm check`         | Astro- és TypeScript-ellenőrzés                                                                            |
| `pnpm lint`          | ESLint + Prettier-ellenőrzés (`pnpm format` javít)                                                         |
| `pnpm test`          | unit tesztek + build + e2e és akadálymentességi tesztek                                                    |
| `pnpm test:visual`   | vizuális regresszió (az alapképek a CI-ban készülnek, D-014)                                               |
| `pnpm test:lh`       | Lighthouse CI (mobil, 3 futás mediánja, a 9. szakasz határaival)                                           |
| `pnpm fonts`         | a betűk újra-részhalmazolása a `fonts-src/`-ből (D-008)                                                    |
| `pnpm grain`         | a szemcse-textúra újragenerálása                                                                           |

Első futtatás előtt a tesztekhez: `pnpm exec playwright install chromium`.

## Tartalom

- `content/site.yaml` – cégadatok, meta. Ami még nincs meg, az `null`: az elem nem jelenik meg.
- `content/portfolio.yaml` – a referenciák egyetlen forrása (W2).
