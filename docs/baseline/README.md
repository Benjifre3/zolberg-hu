# Baseline: v1-approved (9a97a1c)

A prémium finomítás előtti, jóváhagyott állapot (P0). Ehhez hasonlít minden őrteszt.

| Fájl                           | Tartalom                                                                                                                                |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| `fooldal-*-{390,834,1440}.png` | teljes oldal, csökkentett mozgás, tesztadat (Windows, Chromium)                                                                         |
| `fooldal-dom.json`             | a szerkezet-őr és az arculat-őr adatai 1440 px-en (szekciók, címsorok, szöveg, linkek, képek, mezők, betű- és színadatok, 11 színtoken) |
| `lighthouse.json`              | Lighthouse mobil, 5 futás mediánja (helyi statikus szerver)                                                                             |

Mérés (helyben, tesztképpel): Performance 99, Accessibility 100, Best Practices 100, SEO 100;
FCP 705 ms, **LCP 2010 ms** (LCP-elem: a hero asztali képe), TBT ≈ 50 ms, CLS 0,0003.

Az őrtesztek nem ezeket a fájlokat olvassák, hanem minden futáskor újraépítik a címkét
(`pnpm baseline` → `.baseline/dist`), és ugyanazon a gépen hasonlítanak. Így a Windows és a Linux
betűsimítása nem okoz hamis eltérést. A képek itt a jóváhagyáshoz és a dokumentációhoz kellenek.

Újragenerálás: `pnpm baseline`, `pnpm build:fixture`, majd
`CAPTURE=baseline pnpm exec playwright test --project=guard tests/guard/capture.spec.ts` és
`node scripts/lh-measure.ts .baseline/dist docs/baseline/lighthouse.json`.
