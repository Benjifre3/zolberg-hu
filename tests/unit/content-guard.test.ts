import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkHtml } from '../../scripts/lib/guard.ts';

const page = (body: string, head = '') =>
  `<!doctype html><html lang="hu"><head>${head}</head><body>${body}</body></html>`;

test('tiszta oldal: nincs hiba', () => {
  assert.deepEqual(checkHtml(page('<h1>Céges weboldal, amit a mérés igazol.</h1>')), []);
});

for (const [name, body] of [
  ['szöveges helyőrző', '<p>[Teljes név], a Zolberg alapítója.</p>'],
  ['számhelyőrző', '<p>A mobil PageSpeed [42]-ről [96]-ra nőtt.</p>'],
  ['helyőrző alt-szövegben', '<img src="/a.png" alt="[kép leírása]">'],
  ['lorem ipsum', '<p>Lorem ipsum dolor sit amet.</p>'],
  ['TODO', '<p>TODO: szöveg</p>'],
] as const) {
  test(`elkapja: ${name}`, () => {
    assert.equal(checkHtml(page(body)).length > 0, true);
  });
}

test('a JSON-LD tömb és a <style>/<script> tartalma nem hamis riasztás', () => {
  const head =
    '<script type="application/ld+json">{"areaServed":["HU"],"sameAs":[]}</script>' +
    '<style>a[href]{color:red}</style><script>const a = [1, 2];</script>';
  assert.deepEqual(checkHtml(page('<p>Rendben.</p>', head)), []);
});

test('koncepciómunka címke nélkül hiba, címkével rendben', () => {
  const without =
    '<article data-work-type="concept_demo" data-work-id="x"><h3>Minta Kft.</h3></article>';
  const withLabel =
    '<article data-work-type="concept_demo" data-work-id="x"><span>Saját koncepciómunka</span></article>';
  assert.equal(checkHtml(page(without)).length, 1);
  assert.deepEqual(checkHtml(page(withLabel)), []);
});

test('mérés forrás és dátum nélkül hiba, teljes adattal rendben', () => {
  assert.equal(checkHtml(page('<span data-metric>PageSpeed 98</span>')).length, 2);
  assert.deepEqual(
    checkHtml(
      page(
        '<span data-metric data-source="PageSpeed Insights, mobil" data-measured-at="2026-11-20">PageSpeed 98</span>',
      ),
    ),
    [],
  );
});

test('éles módban a tesztadat és az ideiglenes elem hiba, fejlesztői módban nem', () => {
  const body = '<p>Teszt Kft.</p><svg data-placeholder="ideiglenes ceruzavonal"></svg>';
  assert.deepEqual(checkHtml(page(body)), []);
  assert.equal(checkHtml(page(body), { release: true }).length, 2);
});
