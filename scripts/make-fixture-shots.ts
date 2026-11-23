/**
 * Tesztképek a fixture-tartalomhoz (D-011): kitalált cégek egyszerű mintaoldalairól készít
 * képernyőképet Playwrighttal, 1440×900 és 390×844 nézetben. Csak tesztekhez; minden képen
 * látható „TESZTADAT” felirat van. Futtatás: node scripts/make-fixture-shots.ts
 */
import { chromium } from '@playwright/test';
import { fileURLToPath } from 'node:url';

const OUT = fileURLToPath(new URL('../tests/fixtures/content/works/', import.meta.url));

interface Mock {
  id: string;
  name: string;
  headline: string;
  cta: string;
  bg: string;
  fg: string;
  accent: string;
  cards: string[];
}

const mocks: Mock[] = [
  {
    id: 'teszt-gepgyar',
    name: 'Teszt Gépgyártó',
    headline: 'Precíziós alkatrészek, határidőre.',
    cta: 'Ajánlatkérés',
    bg: '#eef1f4',
    fg: '#13202c',
    accent: '#1f5fbf',
    cards: ['CNC-megmunkálás', 'Hegesztett szerkezetek', 'Felületkezelés'],
  },
  {
    id: 'teszt-pekseg',
    name: 'Teszt Pékség',
    headline: 'Kovászos kenyér, minden reggel hétkor.',
    cta: 'Rendelés',
    bg: '#f6efe4',
    fg: '#2b1d12',
    accent: '#b5651d',
    cards: ['Kenyerek', 'Péksütemények', 'Torták'],
  },
  {
    id: 'teszt-logisztika',
    name: 'Teszt Logisztika',
    headline: 'Raktározás és szállítás egy kézből.',
    cta: 'Kapcsolat',
    bg: '#e9f1ec',
    fg: '#102419',
    accent: '#1d7a4a',
    cards: ['Raktározás', 'Belföldi fuvar', 'Vámkezelés'],
  },
];

const html = (m: Mock) => `<!doctype html><html lang="hu"><head><meta charset="utf-8"><style>
*{box-sizing:border-box;margin:0}body{font:16px/1.5 Arial,sans-serif;background:${m.bg};color:${m.fg}}
header{display:flex;justify-content:space-between;align-items:center;padding:20px 6vw;border-bottom:1px solid #0001}
.logo{font-weight:700;font-size:20px}.nav{display:flex;gap:28px;font-size:15px}
.badge{position:fixed;top:12px;right:12px;background:#000;color:#fff;font:700 12px Arial;padding:4px 8px;border-radius:4px;letter-spacing:.05em}
.hero{padding:9vh 6vw 6vh;max-width:1100px}h1{font-size:clamp(34px,5.2vw,72px);line-height:1.05;letter-spacing:-.02em}
p.lead{margin-top:20px;font-size:clamp(16px,1.4vw,20px);max-width:620px;opacity:.8}
.btn{display:inline-block;margin-top:28px;background:${m.accent};color:#fff;padding:14px 26px;border-radius:8px;font-weight:700}
.cards{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;padding:0 6vw}
.card{background:#fff;border-radius:12px;padding:22px;min-height:160px;box-shadow:0 8px 24px -16px #0004}
.card b{display:block;font-size:18px;margin-bottom:8px}.card i{display:block;height:8px;border-radius:4px;background:${m.accent}33;margin-top:10px}
@media(max-width:600px){.nav{display:none}.cards{grid-template-columns:1fr}.hero{padding-top:6vh}}
</style></head><body><span class="badge">TESZTADAT</span>
<header><span class="logo">${m.name}</span><nav class="nav"><span>Szolgáltatások</span><span>Rólunk</span><span>Kapcsolat</span></nav></header>
<section class="hero"><h1>${m.headline}</h1><p class="lead">Kitalált tesztcég mintaoldala. Ez a kép csak az automatikus tesztekhez készült.</p><span class="btn">${m.cta}</span></section>
<section class="cards">${m.cards.map((c) => `<div class="card"><b>${c}</b><i></i><i style="width:70%"></i></div>`).join('')}</section>
</body></html>`;

const browser = await chromium.launch();
for (const m of mocks) {
  for (const [suffix, viewport] of [
    ['1440', { width: 1440, height: 900 }],
    ['390', { width: 390, height: 844 }],
  ] as const) {
    const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
    await page.setContent(html(m));
    await page.screenshot({ path: `${OUT}${m.id}-${suffix}.png` });
    await page.close();
    console.log(`${m.id}-${suffix}.png`);
  }
}

// „Előtte” kép a kiemelt tesztmunkához: ugyanaz a cég, régi stílusú oldal, azonos méret (5.).
const before = `<!doctype html><html lang="hu"><head><meta charset="utf-8"><style>
body{margin:0;font:13px/1.3 "Times New Roman",serif;background:#c8d4e0;color:#111}
.badge{position:fixed;top:12px;right:12px;background:#000;color:#fff;font:700 12px Arial;padding:4px 8px;border-radius:4px}
.wrap{width:960px;margin:0 auto;background:#fff;border:2px outset #999;min-height:900px}
.top{background:linear-gradient(#2a4d8f,#14306a);color:#ff0;padding:18px;font:700 30px Georgia}
.menu{background:#ddd;border-bottom:1px solid #888;padding:6px;font:bold 12px Verdana}.menu span{margin:0 10px;color:#00c;text-decoration:underline}
table{width:100%;border-collapse:collapse}td{vertical-align:top;padding:10px;border:1px solid #bbb}
.side{width:200px;background:#eef}h2{color:#900;font-size:20px}.blink{color:red;font-weight:bold}
</style></head><body><span class="badge">TESZTADAT</span><div class="wrap">
<div class="top">Teszt Gépgyártó Kft. – Üdvözöljük honlapunkon!</div>
<div class="menu"><span>Főoldal</span><span>Cégünkről</span><span>Termékek</span><span>Galéria</span><span>Kapcsolat</span></div>
<table><tr><td class="side"><b>Hírek</b><p>2019.03.12 – Új gépet vásároltunk.</p><p>2018.11.02 – Ünnepi nyitva tartás.</p><p class="blink">AKCIÓ!!!</p></td>
<td><h2>Bemutatkozás</h2><p>Cégünk 1994 óta foglalkozik fémmegmunkálással. Kérjük, ajánlatkéréshez töltse ki a lenti űrlapot, vagy hívja irodánkat munkaidőben.</p>
<p>Tevékenységeink: esztergálás, marás, hegesztés, felületkezelés, festés, szerelés, karbantartás, egyedi gépgyártás.</p>
<p>Látogatók száma: 004521</p></td></tr></table></div></body></html>`;
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
});
await page.setContent(before);
await page.screenshot({ path: `${OUT}teszt-gepgyar-elotte.png` });
console.log('teszt-gepgyar-elotte.png');

// Tesztportré (4:5): szürke sziluett, nem valódi személy.
const portrait = await browser.newPage({
  viewport: { width: 800, height: 1000 },
  deviceScaleFactor: 1,
});
await portrait.setContent(`<body style="margin:0;background:linear-gradient(#d9d6cf,#c4c0b6)">
<span style="position:fixed;top:16px;right:16px;background:#000;color:#fff;font:700 18px Arial;padding:6px 10px;border-radius:4px">TESZTADAT</span>
<svg viewBox="0 0 800 1000" width="800" height="1000"><circle cx="400" cy="380" r="150" fill="#8f8a80"/>
<path d="M130 1000c20-230 140-360 270-360s250 130 270 360z" fill="#8f8a80"/></svg></body>`);
await portrait.screenshot({
  path: fileURLToPath(new URL('../tests/fixtures/content/about/teszt-portre.png', import.meta.url)),
});
console.log('about/teszt-portre.png');
await browser.close();
