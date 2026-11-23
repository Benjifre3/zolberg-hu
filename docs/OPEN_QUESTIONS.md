# Nyitott kérdések

Az A. részben vannak a blokkoló döntések (legfeljebb 10). A B. rész a specifikáció `[ ]` helyőrzőit gyűjti: ezek az építést nem akasztják meg, de élesítés előtt mind kell. A tartalom-őr addig elbuktatja az éles buildet.

---

## A. Blokkoló kérdések

### Q1 · Node.js és pnpm telepítése · LEZÁRVA (2026-11-23): Node.js 26.13.1 LTS winget-tel, pnpm 12.23.0

A gépen nincs Node.js és pnpm, ezek nélkül nem indul az Astro.

- **(a) Ajánlott:** telepíthetem én: `winget install OpenJS.NodeJS.LTS`, utána `corepack enable pnpm`. Ez rendszerszintű telepítés, ezért kell az engedélyed.
- (b) Telepíted te, és szólsz, ha kész.

### Q2 · Turnstile vagy a „nincs harmadik féltől származó script” szabály · LEZÁRVA (2026-11-24): Turnstile nélkül (D-035)

A 3. szakasz Turnstile-t kér, a 2. szakasz 4. pontja tiltja a harmadik féltől származó scriptet, és ütközéskor a 2. szakasz nyer. A Turnstile a Cloudflare-től töltődik be, és böngészőjeleket dolgoz fel.

- **(a) Ajánlott:** nincs Turnstile. A védelem: honeypot + időcsapda + szerveroldali validáció + egy Cloudflare sebességkorlát-szabály a `/api/contact`-ra. Ha élesben spam jön, a (b) egy kapcsolóval bekapcsolható (D-017).
- (b) Turnstile csak az űrlap első használatakor töltődik be (az oldal megnyitásakor nem). Az adatkezelési tájékoztatóban szerepel, a CSP-ben engedélyezve.
- (c) Turnstile oldalbetöltéskor, a 3. szakasz szerint. Ez sérti a 2.4-et, nem javaslom.

### Q3 · Tranzakciós e-mail szolgáltató és cél-e-mail · blokkolja: W4

Melyik szolgáltató küldje az űrlap levelét, és melyik címre?

- **(a) Ajánlott:** EU-s cég, mert egyszerűbb lesz a jogi rész (pl. Brevo, francia cég).
- (b) Postmark vagy Resend (amerikai cégek, jó kézbesíthetőség, a jogi konzultáción külön kell kezelni).
- (c) Már van szolgáltatód (pl. az OutreachEngine-hez): akkor azt használom.
  A kulcs csak környezeti változóban lesz (`EMAIL_API_KEY`), a repóba nem kerül.

### Q4 · A `portfolio.yaml` kanonikus helye és a séma bővítése · LEZÁRVA (2026-11-23): a javaslat szerint (D-030)

A specifikáció szerint a weboldal és az OutreachEngine ugyanazt a fájlt használja. Az OutreachEngine kódja nincs a gépen.

1. **Hol legyen a kanonikus példány?**
   - **(a) Ajánlott:** a weboldal repójában (`content/portfolio.yaml`), mert a képek és a mérési JSON-ok is itt vannak. Az OutreachEngine innen olvas (git submodule vagy másolás hash-ellenőrzéssel).
   - (b) Az OutreachEngine-ben, és a weboldal buildje előtt egy szkript bemásolja.
2. **Elfogadod-e a séma bővítését?** Az OutreachEngine kötelező mezői változatlanok, a weboldal csak opcionális mezőket ad hozzá (`featured`, `year_before`, `work_type`, `permission`, `images`, `metrics`; részletek: `docs/PLAN.md` 2. pont). Ehhez az OutreachEngine sémavalidálójának el kell fogadnia az ismeretlen mezőket.

### Q5 · A kézzel rajzolt ceruzavonal · blokkolja: az élesítést (a W1-et nem)

A specifikáció szerint a jelölés nem lehet generált. Legfeljebb 3 kell: a hero „mérés” szavának aláhúzása, és ha akarod, még kettő (pl. a bizonyíték-sávban és a kapcsolatnál).

- **(a) Ajánlott:** tableten rajzolod (pl. iPad + Apple Pencil, Procreate vagy Concepts → SVG-export), egy vonás 400–600 px széles.
- (b) Papírra húzod piros ceruzával, beszkenneled 600 dpi-vel, én vektorizálom (ez útvonallá alakít, nem rajzol újra).
  Addig egy jelölt ideiglenes vonal lesz a fejlesztői buildben, az éles buildet a tartalom-őr elbuktatja.

### Q6 · Végleges domain · blokkolja: W5

A master prompt `[ELLENŐRIZENDŐ]`-ként jelöli. Marad a `zolberg.hu` (márka) és a `zolbergstudio.com` (küldő-domain), vagy más (`zolbergstudio.hu`, `zolberg.studio`…)? A canonical URL, a sitemap, a JSON-LD és az átirányítás erre épül; a kódban egyetlen beállítás (`SITE_URL`).

### Q7 · Git-azonosító és GitHub-repó · nem sürgős

A repó most helyi azonosítóval commitol (D-016). Push előtt:

- milyen névvel és e-maillel szerepeljenek a commitok (nyilvános repóban az e-mail látszik; a GitHub `…@users.noreply.github.com` címe ezt elkerüli),
- van-e már GitHub-repó, privát vagy nyilvános legyen.

---

### Q8 · Hogyan mérjük a mobil LCP-határt (1,8 s)? · blokkolja: a CI zöld állapotát

A helyi Lighthouse CI (szimulált lassú 4G, HTTP/1.1-es statikus szerver, Windows) a W4 után **2010 ms**-ot mér (W3: 1785 ms), a Performance pontszám 99. Felezéses méréssel kimutattam, hogy a különbséget maga az űrlap okozza (űrlap nélkül 1785 ms, űrlap szkript nélkül 1935 ms, teljes űrlap 2010 ms); a szkriptek kiszervezése, a betű-preload elhagyása, a mono betű kiváltása és a dekódolási mód nem változtatott rajta. Az űrlap a specifikáció része, nem hagyható el.

- **(a) Ajánlott:** az LCP-határt a valós környezetben, a Cloudflare Pages előnézeti deployján mérjük (HTTP/2, valódi edge) a CI-ban, amint van GitHub- és Cloudflare-fiók; a helyi LHCI-ban az LCP addig figyelmeztetés 2,1 s-os határral, minden más határ marad hiba. A specifikáció célja a valós mobil élmény, és a launch-ellenőrzőlista is élesben mér.
- (b) A helyi határ 1,8 s marad: ekkor a CI piros, amíg a mérést nem visszük át, vagy amíg más tartalmat nem veszünk el.

## B. Tartalmi helyőrzők (élesítés előtt kell, az építést nem akasztják meg)

| Helyőrző                                                                                              | Hol                         | Ki adja                                                    |
| ----------------------------------------------------------------------------------------------------- | --------------------------- | ---------------------------------------------------------- |
| 5 referencia: élő URL, írásos engedély, típus, iparág, egy mondat, előtte/utána képek                 | `content/portfolio.yaml`    | te; a képernyőképeket a `screenshot-works` szkript készíti |
| Dátumozott mérések (előtte és utána)                                                                  | `content/measurements/`     | a szkript futtatja a PSI-t, te jóváhagyod                  |
| Bizonyíték-sáv 3 értéke (pl. átlagos mobil PageSpeed a munkákon, medián LCP, átadott projektek száma) | `content/site.yaml`         | mérésből; a darabszám tőled                                |
| „Új projektek indítása: [hónap]”                                                                      | hero                        | te (csak ha igaz)                                          |
| [Teljes név], 2–3 mondatos bemutatkozás, portré (4:5, természetes fény)                               | Rólam                       | te                                                         |
| Cégadatok: név, székhely, adószám, telefon, e-mail                                                    | lábléc, impresszum, JSON-LD | te                                                         |
| A folyamat 4 lépésének időkerete ([X] nap/hét)                                                        | Folyamat                    | te                                                         |
| [X] munkanapon belül (válaszidő)                                                                      | Kapcsolat, `/koszonjuk`     | te                                                         |
| Árak vagy csomagnevek ([pricing döntés])                                                              | Szolgáltatás, GYIK          | te; ha nincs döntés, kimarad                               |
| A GYIK 5 kérdése és válasza (megírva, D-034)                                                          | GYIK                        | jóváhagyás tőled: `content/site.yaml` → `faq`              |
| Szolgáltatás- és folyamat-szövegek (megírva, D-034)                                                   | 6.5, 6.6                    | jóváhagyás tőled: `content/site.yaml`                      |
| Bemutatkozás (2–3 mondat) és portré (4:5, `content/about/`)                                           | Rólam                       | te                                                         |
| Adatkezelési tájékoztató, impresszum                                                                  | aloldalak                   | jogi konzultáció                                           |
| Sütibanner nélküli működés megerősítése                                                               | jog                         | jogi konzultáció                                           |
| OG-kép (1200×630)                                                                                     | SEO                         | én elkészítem a valós tartalomból                          |
| Ügyfél-logók, vélemény                                                                                | 6.4                         | csak írásos engedéllyel; ha nincs, kimarad                 |
