/**
 * A /api/contact kezelője (W4, 3., 6.9). Két mód:
 *  - JS-sel (Accept: application/json): JSON-válasz, a sziget mutatja a hibákat.
 *  - JS nélkül (natív POST): siker → 303 a /koszonjuk-ra; hiba → szerveroldali hibaoldal
 *    a beírt értékekkel és magyar hibaüzenetekkel.
 * Gépi beküldésnél (honeypot, időcsapda) csendes „siker”, levél nélkül (D-035).
 */
import {
  validate,
  isSpam,
  HONEYPOT,
  TIMESTAMP,
  FIELDS,
  type Values,
  type Errors,
} from '../lib/contact-rules.ts';
import { sendLead, type MailEnv } from './mailer.ts';

export type ContactEnv = MailEnv;

const SECURITY_HEADERS = {
  'Content-Security-Policy':
    "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Cache-Control': 'no-store',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...SECURITY_HEADERS, 'Content-Type': 'application/json; charset=utf-8' },
  });

const redirect = (location: string) =>
  new Response(null, { status: 303, headers: { ...SECURITY_HEADERS, Location: location } });

export const escapeHtml = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c,
  );

const LABELS: Record<(typeof FIELDS)[number], { label: string; type: string; auto: string }> = {
  company: { label: 'Cégnév', type: 'text', auto: 'organization' },
  website: { label: 'Weboldal címe', type: 'text', auto: 'url' },
  email: { label: 'E-mail-cím', type: 'email', auto: 'email' },
};

/** JS nélküli hibaoldal: ugyanaz az űrlap, kitöltve, a hibákkal (10.: aria-describedby). */
export function errorPage(
  values: Values,
  errors: Errors,
  status = 400,
  message?: string,
): Response {
  const fields = FIELDS.map((f) => {
    const err = errors[f];
    const { label, type, auto } = LABELS[f];
    return `<p><label for="${f}">${label}</label>
<input id="${f}" name="${f}" type="${type}" autocomplete="${auto}" value="${escapeHtml(values[f])}"${err ? ` aria-invalid="true" aria-describedby="${f}-hiba"` : ''}>
${err ? `<span class="err" id="${f}-hiba">${escapeHtml(err)}</span>` : ''}</p>`;
  }).join('\n');
  const intro = message ?? 'Kérem, javítsa a megjelölt mezőket, és küldje el újra.';
  const html = `<!doctype html><html lang="hu"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex">
<title>Az űrlap nem ment el – Zolberg</title>
<style>body{font:18px/1.55 system-ui,sans-serif;max-width:36rem;margin:4rem auto;padding:0 20px;background:#F4F1EA;color:#14130F}
h1{font-size:2rem;line-height:1.1}label{display:block;font-weight:600}input{width:100%;min-height:52px;padding:0 14px;font:inherit;border:1.5px solid #6B675E;border-radius:10px;background:#FBFAF6}
input[aria-invalid]{border-color:#C2331A}.err{display:block;color:#C2331A;margin-top:4px}button{min-height:52px;padding:0 28px;border:0;border-radius:999px;background:#C2331A;color:#fff;font:600 1rem system-ui,sans-serif}
a{color:#C2331A}:focus-visible{outline:3px solid #C2331A;outline-offset:3px}</style></head>
<body><main><h1>Az űrlap nem ment el.</h1><p>${escapeHtml(intro)}</p>
<form method="post" action="/api/contact" novalidate>${fields}
<p><button type="submit">Kérem a mért adatokat</button></p></form>
<p><a href="/#kapcsolat">Vissza az oldalra</a></p></main></body></html>`;
  return new Response(html, {
    status,
    headers: { ...SECURITY_HEADERS, 'Content-Type': 'text/html; charset=utf-8' },
  });
}

export async function handleContact(
  request: Request,
  env: ContactEnv,
  now = Date.now(),
): Promise<Response> {
  const wantsJson = (request.headers.get('Accept') ?? '').includes('application/json');
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return wantsJson
      ? json({ ok: false, error: 'Hibás kérés.' }, 400)
      : errorPage({ company: '', website: '', email: '' }, {}, 400);
  }

  const get = (k: string) => {
    const v = form.get(k);
    return typeof v === 'string' ? v : '';
  };

  if (isSpam(get(HONEYPOT), get(TIMESTAMP), now)) {
    return wantsJson ? json({ ok: true }) : redirect('/koszonjuk');
  }

  const { values, errors } = validate({
    company: get('company'),
    website: get('website'),
    email: get('email'),
  });
  if (Object.keys(errors).length) {
    return wantsJson ? json({ ok: false, errors }, 422) : errorPage(values, errors, 400);
  }

  try {
    await sendLead({ ...values, receivedAt: new Date(now).toISOString() }, env);
  } catch (e) {
    console.error(`[contact] ${(e as Error).name}: ${(e as Error).message}`);
    const message =
      'Az üzenetet most nem sikerült elküldeni. Kérem, próbálja újra később, vagy írjon közvetlenül e-mailben.';
    return wantsJson
      ? json({ ok: false, error: message }, 503)
      : errorPage(values, {}, 503, message);
  }
  return wantsJson ? json({ ok: true }) : redirect('/koszonjuk');
}
