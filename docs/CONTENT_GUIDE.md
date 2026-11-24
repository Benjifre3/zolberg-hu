# Tartalomkézikönyv

Hogyan cseréld a referenciákat, a méréseket, a képeket és a szövegeket. Kódot nem kell
módosítani. Minden változtatás után: `pnpm build` – ha valami hiányzik vagy szabálytalan, a
build megáll, és magyarul megmondja, mi a baj.

## Alapszabályok (master prompt 2.)

1. **Csak valós adat.** Kitalált ügyfél, szám, vélemény, logó vagy díj nem kerülhet az oldalra.
   Ami nincs meg, az `null` (vagy kimarad) – az elem ilyenkor nem jelenik meg.
2. **Minden szám mért, dátumozott és forrásmegjelölt.** A build elutasítja a forrás vagy dátum
   nélküli számot.
3. **A koncepciómunka mindenhol „Saját koncepciómunka”** – ezt a `type: concept_demo` mező
   automatikusan kiírja; ügyfélmunkának nevezni tilos.
4. **Hangnem:** magázás, egyes szám első személy, nincs felkiáltójel, emoji, szuperlatívusz,
   ígért eredmény. A `tests/unit/copy.test.ts` ezt ellenőrzi.

## Referencia hozzáadása (`content/portfolio.yaml`)

1. Írásos engedély az ügyféltől (név, képernyőkép, mérések). Koncepciómunkához nem kell.
2. Új tétel a `portfolio.yaml`-ba – a fájl elején kommentált minta van. Kötelező: `id`, `name`,
   `live_url`, `description` (egy mondat: mit csináltam + mért eredmény), `industry`, `type`,
   `approved_for_outreach`. Az oldal és a levél **csak** `approved_for_outreach: true` tételt mutat.
3. Képernyőképek: `pnpm shots -- --only <id>` → `content/works/<id>-1440.png` és `-390.png`.
   Az „előtte” kép a régi oldal címéről (pl. archív URL):
   `pnpm shots -- --only <id> --url <régi cím> --suffix elotte`.
   Ha sütibanner takar, készítsd el kézzel ugyanebben a méretben (1440×900, 390×844).
4. A fájlneveket írd be az `images` alá; az `alt_*` szövegek mondják meg, mit mutat a kép.
5. Kiemelt munka: legfeljebb egy tételnél `featured: true` – ez lesz a hero képe és a
   kiemelt kártya, az előtte/utána csúszkával.

## Mérés hozzáadása

1. Mérés: PageSpeed Insights (pagespeed.web.dev), **mobil**, 3 futás, a mediánt rögzítsd (D-013).
2. A nyers JSON-t mentsd: `content/measurements/<id>-<dátum>.json`.
3. A munka `metrics` listájába: `key` (`psi_mobile`, `lcp_mobile`, …), `label`, `before`
   (ha nincs, `null`), `after`, `unit` (pl. `s`), `decimals`, `better` (`higher`/`lower`),
   `measured_at` (ÉÉÉÉ-HH-NN), `tool`, `source` (a JSON útvonala).
4. A bizonyíték-sáv (`site.yaml` → `proof`) az átlagot és a mediánt **automatikusan** ebből
   számolja, legalább 2 mérésből. 2-nél kevesebb értéknél a sáv nem jelenik meg.

## Cégadatok és szövegek (`content/site.yaml`)

- `company`: név, képviselő, székhely, adószám (`12345678-1-12`), e-mail, telefon (`+36 …`).
  Ugyanez jelenik meg a láblécben, az impresszumban és a JSON-LD-ben.
- `hero.status_month`: „Új projektek indítása: …” – csak ha igaz.
- `contact.response_days`: hány munkanapon belül küldöd a mérési összefoglalót.
- `services`, `process`, `faq`: a szövegek (szolgáltatás és folyamat 40–60 szó).
  A folyamat `duration` mezője csak kitöltve jelenik meg.
- `about.bio` (2–3 mondat) és `about.portrait` (4:5-ös fotó a `content/about/` mappában,
  természetes fény, semleges háttér; stockfotó nem).

## Kézzel rajzolt jelölés (Q5)

A hero „mérés” szava alatti piros ceruzavonal: `src/assets/marks/underline.svg`. Tableten rajzolt
vagy beszkennelt, majd vektorizált vonal; a színe `currentColor` legyen (fill vagy stroke), a
nézete kb. 300×24 arányú. Amíg nincs meg, egy jelölt ideiglenes vonal áll a helyén, és az éles
build elbukik.

## Jogi szövegek

A jóváhagyott szöveg: `content/legal/adatkezeles.md` és `content/legal/impresszum.md`
(fejléc: `title`, `updated`, `description`). Tervezet: `docs/legal-drafts/`.

## Ellenőrzés csere után

```
pnpm build        # éles build: költségvetés + tartalom-őr
pnpm links        # belső linkek
pnpm dev          # nézd meg böngészőben
```
