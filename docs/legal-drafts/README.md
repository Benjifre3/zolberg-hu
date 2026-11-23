# Jogi szövegek – tervezetek a jogi konzultációhoz

**Ezek tervezetek, nem jogi tanácsadás eredményei.** A végleges szöveget jogász hagyja jóvá
(master prompt 10.). A build ezeket a fájlokat **nem** használja.

Élesítéskor a jóváhagyott szöveg a `content/legal/` mappába kerül, ugyanezzel a fejléccel
(`title`, `updated`, `description`):

| Tervezet | Élesben | Oldal |
|---|---|---|
| `impresszum.md` | `content/legal/impresszum.md` | `/impresszum` |
| `adatkezeles.md` | `content/legal/adatkezeles.md` | `/adatkezeles` |

Amíg bármelyik hiányzik, a lábléc és az űrlap nem linkel rá, és az éles build (`pnpm build`)
tartalom-őre elbukik (D-038).

A `[szögletes zárójeles]` részeket a jogi konzultáción kell kitölteni vagy törölni; az éles
build a megmaradt helyőrzőn elbukik.

Az impresszum tetején a név, a székhely, az adószám, az e-mail és a telefon automatikusan
megjelenik a `content/site.yaml`-ból (ugyanonnan, mint a lábléc és a JSON-LD), ezért ezeket a
Markdown-szövegbe nem kell beírni.
