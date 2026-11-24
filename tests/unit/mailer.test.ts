import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  sendLead,
  composeLead,
  MailerConfigError,
  MailerSendError,
} from '../../src/server/mailer.ts';

const lead = {
  company: 'Példa <Kft.>',
  website: 'https://pelda.hu/',
  email: 'nev@pelda.hu',
  receivedAt: '2026-11-24T10:00:00.000Z',
};
const env = {
  EMAIL_PROVIDER: 'brevo',
  EMAIL_API_KEY: 'teszt-kulcs',
  CONTACT_TO: 'bejovo@example.com',
  CONTACT_FROM: 'urlap@example.com',
};

function fakeFetch(status: number) {
  const calls: { url: string; init: RequestInit }[] = [];
  const fn = (async (url: string, init: RequestInit) => {
    calls.push({ url, init });
    return new Response(JSON.stringify({ messageId: '<x@y>' }), { status });
  }) as unknown as typeof fetch;
  return { fn, calls };
}

test('Brevo: a helyes végpontra, api-key fejléccel, válasz-címként a kérővel', async () => {
  const { fn, calls } = fakeFetch(201);
  await sendLead(lead, env, fn);
  assert.equal(calls.length, 1);
  const call = calls[0];
  assert.ok(call);
  assert.equal(call.url, 'https://api.brevo.com/v3/smtp/email');
  assert.equal((call.init.headers as Record<string, string>)['api-key'], 'teszt-kulcs');
  const body = JSON.parse(String(call.init.body)) as Record<string, unknown>;
  assert.deepEqual(body['to'], [{ email: 'bejovo@example.com' }]);
  assert.deepEqual(body['replyTo'], { email: 'nev@pelda.hu', name: 'Példa <Kft.>' });
  assert.equal(body['subject'], 'Mért adatokat kér: Példa <Kft.>');
  assert.match(String(body['htmlContent']), /Példa &lt;Kft\.&gt;/);
});

test('Brevo: 202 (ütemezve) is siker; más kód hiba, nincs hamis siker', async () => {
  await sendLead(lead, env, fakeFetch(202).fn);
  await assert.rejects(sendLead(lead, env, fakeFetch(401).fn), MailerSendError);
});

test('Brevo: hiányzó beállításnál nem küld', async () => {
  const { fn, calls } = fakeFetch(201);
  await assert.rejects(sendLead(lead, { ...env, CONTACT_TO: '' }, fn), MailerConfigError);
  assert.equal(calls.length, 0);
});

test('a levél szöveges és HTML-változata ugyanazt mondja', () => {
  const m = composeLead(lead);
  assert.match(m.text, /Weboldal: https:\/\/pelda\.hu\//);
  assert.match(m.html, /Weboldal: https:\/\/pelda\.hu\//);
});
