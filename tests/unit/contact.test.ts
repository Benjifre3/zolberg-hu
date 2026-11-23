import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validate, isSpam, normalizeWebsite, MIN_FILL_MS } from '../../src/lib/contact-rules.ts';
import { handleContact, escapeHtml } from '../../src/server/contact.ts';
import { composeLead } from '../../src/server/mailer.ts';

const NOW = 1_800_000_000_000;
const good = { company: 'Példa Kft.', website: 'pelda.hu', email: 'nev@pelda.hu' };

function post(fields: Record<string, string>, json = true) {
  const body = new FormData();
  for (const [k, v] of Object.entries(fields)) body.set(k, v);
  return new Request('https://zolberg.hu/api/contact', {
    method: 'POST',
    body,
    headers: json ? { Accept: 'application/json' } : {},
  });
}

test('webcím normalizálás', () => {
  assert.equal(normalizeWebsite('pelda.hu'), 'https://pelda.hu/');
  assert.equal(normalizeWebsite('http://www.pelda.hu/rolunk#x'), 'http://www.pelda.hu/rolunk');
  assert.equal(normalizeWebsite('nem webcím'), null);
  assert.equal(normalizeWebsite('localhost'), null);
});

test('magyar hibaüzenetek minden mezőre', () => {
  const { errors } = validate({ company: '', website: 'x', email: 'rossz' });
  assert.equal(errors.company, 'Adja meg a cég nevét.');
  assert.match(errors.website ?? '', /érvényes webcím/);
  assert.match(errors.email ?? '', /Ellenőrizze az e-mail-címet/);
  assert.deepEqual(validate(good).errors, {});
});

test('spam: honeypot, túl gyors vagy jövőbeli időbélyeg; JS nélkül (üres ts) nem spam', () => {
  assert.equal(isSpam('valami', '', NOW), true);
  assert.equal(isSpam('', String(NOW - 500), NOW), true);
  assert.equal(isSpam('', String(NOW + 120_000), NOW), true);
  assert.equal(isSpam('', String(NOW - MIN_FILL_MS - 1), NOW), false);
  assert.equal(isSpam('', '', NOW), false);
});

test('JSON mód: siker dry-runnal, 422 hibákkal', async () => {
  const ok = await handleContact(post(good), { EMAIL_PROVIDER: 'dry-run' }, NOW);
  assert.equal(ok.status, 200);
  assert.deepEqual(await ok.json(), { ok: true });
  const bad = await handleContact(
    post({ ...good, email: 'x' }),
    { EMAIL_PROVIDER: 'dry-run' },
    NOW,
  );
  assert.equal(bad.status, 422);
  assert.ok(((await bad.json()) as { errors: Record<string, string> }).errors.email);
});

test('natív mód: siker → 303 /koszonjuk; hiba → 400 HTML a beírt értékkel, escapelve', async () => {
  const ok = await handleContact(post(good, false), { EMAIL_PROVIDER: 'dry-run' }, NOW);
  assert.equal(ok.status, 303);
  assert.equal(ok.headers.get('Location'), '/koszonjuk');
  const bad = await handleContact(
    post({ ...good, company: '<b>x</b>', email: '' }, false),
    {},
    NOW,
  );
  assert.equal(bad.status, 400);
  const html = await bad.text();
  assert.match(html, /Adja meg az e-mail-címét\./);
  assert.match(html, /value="&lt;b&gt;x&lt;\/b&gt;"/);
  assert.match(html, /aria-describedby="email-hiba"/);
});

test('gépi beküldés: csendes siker, levél nélkül', async () => {
  const res = await handleContact(post({ ...good, fax: 'spam' }), {}, NOW);
  assert.equal(res.status, 200); // a szolgáltató hiányozna, mégsem hibázik: nem is próbál küldeni
});

test('szolgáltató nélkül nincs hamis siker: 503 és magyar üzenet', async () => {
  const res = await handleContact(post(good), {}, NOW);
  assert.equal(res.status, 503);
  assert.match(((await res.json()) as { error: string }).error, /nem sikerült elküldeni/);
});

test('levél: tárgy és törzs magyarul; HTML-escapelés', () => {
  const { subject, text } = composeLead({
    ...good,
    website: 'https://pelda.hu/',
    receivedAt: '2026-11-24T10:00:00.000Z',
  });
  assert.equal(subject, 'Mért adatokat kér: Példa Kft.');
  assert.match(text, /Weboldal: https:\/\/pelda\.hu\//);
  assert.equal(escapeHtml(`"<'&>`), '&quot;&lt;&#39;&amp;&gt;');
});
