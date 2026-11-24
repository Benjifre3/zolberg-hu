# Élesítési ellenőrzőlista

A master prompt 12.4 pontja, kiegészítve a beállítási lépésekkel. Élesíteni csak akkor lehet,
ha minden pont ki van pipálva, és a `pnpm build` (éles mód) hiba nélkül lefut.

## A. Tartalom (a `pnpm build` tartalom-őre ellenőrzi)

- [ ] minden helyőrző valós adatra cserélve (`content/site.yaml` cégadatok, válaszidő; nincs `null` a kötelező mezőkben)
- [ ] 5 referencia engedéllyel, a koncepciómunkák jelölve (`content/portfolio.yaml`)
- [ ] a mérések dátummal és nyers JSON-nal (`content/measurements/`), legalább 2 a bizonyíték-sávhoz
- [ ] a kézzel rajzolt ceruzavonal (`src/assets/marks/underline.svg`, Q5)
- [ ] portré és bemutatkozás (`content/about/`, `site.yaml` → `about`)
- [ ] a szolgáltatás-, folyamat- és GYIK-szövegek jóváhagyva (D-034)
- [ ] jogi szövegek átnézve és a `content/legal/` mappában (adatkezelés, impresszum)
- [ ] sütibanner nélküli működés megerősítve a jogi konzultáción

## B. Cloudflare Pages

- [ ] Pages-projekt `zolberg-hu` néven a GitHub-repóhoz kötve; build: `pnpm build`, kimenet: `dist`
- [ ] Brevo-fiók; a feladó-domain (pl. `zolberg.hu`) hitelesítve a Brevóban (SPF/DKIM DNS-rekordok); API-kulcs létrehozva (D-040)
- [ ] Környezeti változók (Production): `EMAIL_PROVIDER=brevo`, `EMAIL_API_KEY` (titokként), `CONTACT_TO` (ide érkeznek a kérések), `CONTACT_FROM` (pl. `urlap@zolberg.hu`)
- [ ] A Brevo adatfeldolgozói szerződése és az adatkezelési tájékoztató adatfeldolgozói része a jogi konzultáción átnézve
- [ ] Cloudflare Web Analytics / Zaraz **kikapcsolva** (2.4: nincs analitika, nincs harmadik féltől származó script)
- [ ] Sebességkorlát-szabály (WAF → Rate limiting): `/api/contact`, pl. 5 kérés / 10 perc / IP (D-035)
- [ ] Egyéni domain: `zolberg.hu` (apex) a Pages-projekten; `www.zolberg.hu` → 301 → `https://zolberg.hu` (Redirect Rule)
- [ ] SSL/TLS: Full (strict); „Always Use HTTPS” be
- [ ] `zolbergstudio.com` zóna: Redirect Rule `https://zolbergstudio.com/munkak` (és a gyökér) → 301 → `https://zolberg.hu/#munkak`
- [ ] GitHub-titkok a CI előnézeti méréséhez: `CLOUDFLARE_API_TOKEN` (Pages: Edit), `CLOUDFLARE_ACCOUNT_ID` (D-037)

## C. Mérés és minőség (élesben)

- [ ] a CI minden feladata zöld, az „Előnézeti Lighthouse” is (mobil LCP ≤ 1,8 s)
- [ ] mobil Lighthouse a határokon belül, **élesben mérve** (PageSpeed Insights, a zolberg.hu címen): Performance ≥ 98, Accessibility / Best Practices / SEO 100
- [ ] biztonsági fejlécek élesben (pl. `curl -I https://zolberg.hu/`): CSP, HSTS, nosniff
- [ ] `pnpm links:external` hiba nélkül (a valódi referenciák élő URL-jei)
- [ ] a vizuális alapképek a CI-ból commitolva (`tests/visual/__screenshots__/*-linux.png`)

## D. Végigpróbálás

- [ ] űrlap élesben kipróbálva, a levél megérkezik (`CONTACT_TO`), a `/koszonjuk` oldal jön
- [ ] űrlap JS nélkül is (böngészőben a JavaScript kikapcsolva)
- [ ] a `zolbergstudio.com` átirányítás HTTPS-sel a `#munkak` horgonyra visz
- [ ] a levél linkje Gmailből, mobilon és asztali gépen végigpróbálva
- [ ] jogi szövegek átnézve, a láblécből és az űrlap alól elérhetők
- [ ] `https://zolberg.hu/robots.txt` és `/sitemap-index.xml` elérhető; Search Console-ba beküldve
