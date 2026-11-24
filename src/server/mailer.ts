/**
 * Levélküldés az ajánlatkérésről a tulajdonosnak (3.: tranzakciós e-mail API, kulcs csak
 * környezeti változóban). Szolgáltató (D-040): Brevo (EU-s cég) – cserélhető, egy új `case`
 * elég hozzá. A „dry-run” mód a fejlesztéshez és a tesztekhez való. Hiányzó beállításnál vagy
 * küldési hibánál a függvény hibát dob, így az űrlap nem jelez hamis sikert (2.1).
 *
 * Környezeti változók (Cloudflare Pages → Settings → Variables):
 *   EMAIL_PROVIDER = brevo | dry-run
 *   EMAIL_API_KEY  = a Brevo API-kulcsa (titokként)
 *   CONTACT_TO     = ide érkezik a kérés (pl. a saját postafiókod)
 *   CONTACT_FROM   = feladó a Brevóban hitelesített domainről (pl. urlap@zolberg.hu)
 */
export interface MailEnv {
  EMAIL_PROVIDER?: string;
  EMAIL_API_KEY?: string;
  CONTACT_TO?: string;
  CONTACT_FROM?: string;
}

export interface Lead {
  company: string;
  website: string;
  email: string;
  receivedAt: string;
}

export class MailerConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MailerConfigError';
  }
}

export class MailerSendError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MailerSendError';
  }
}

const BREVO_ENDPOINT = 'https://api.brevo.com/v3/smtp/email';

const escape = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c,
  );

/** A levél tárgya és törzse magyarul: egyszerű szöveg + ugyanez minimális HTML-ben. */
export function composeLead(lead: Lead): { subject: string; text: string; html: string } {
  const lines = [
    'Új kérés érkezett a zolberg.hu űrlapjáról.',
    '',
    `Cégnév: ${lead.company}`,
    `Weboldal: ${lead.website}`,
    `E-mail: ${lead.email}`,
    `Beérkezett: ${lead.receivedAt}`,
    '',
    'Válasz: erre a levélre válaszolva közvetlenül a kérőnek ír.',
  ];
  return {
    subject: `Mért adatokat kér: ${lead.company}`.slice(0, 120),
    text: lines.join('\n'),
    html: `<p>${lines.map(escape).join('<br>')}</p>`,
  };
}

function required(env: MailEnv, keys: (keyof MailEnv)[]): void {
  const missing = keys.filter((k) => !env[k]);
  if (missing.length) throw new MailerConfigError(`Hiányzó beállítás: ${missing.join(', ')}`);
}

export async function sendLead(
  lead: Lead,
  env: MailEnv,
  fetcher: typeof fetch = fetch,
): Promise<void> {
  const provider = env.EMAIL_PROVIDER ?? '';
  const mail = composeLead(lead);
  switch (provider) {
    case 'dry-run':
      // Csak fejlesztéshez és tesztekhez: a naplóba a tárgy és a webcím kerül, az e-mail-cím nem.
      console.log(`[dry-run] ${mail.subject} – ${lead.website}`);
      return;
    case 'brevo': {
      required(env, ['EMAIL_API_KEY', 'CONTACT_TO', 'CONTACT_FROM']);
      const res = await fetcher(BREVO_ENDPOINT, {
        method: 'POST',
        headers: {
          'api-key': env.EMAIL_API_KEY ?? '',
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          sender: { email: env.CONTACT_FROM, name: 'zolberg.hu űrlap' },
          to: [{ email: env.CONTACT_TO }],
          replyTo: { email: lead.email, name: lead.company.slice(0, 70) },
          subject: mail.subject,
          textContent: mail.text,
          htmlContent: mail.html,
        }),
        signal: AbortSignal.timeout(10_000),
      });
      // 201: elküldve, 202: ütemezve – mindkettő siker.
      if (res.status !== 201 && res.status !== 202) {
        throw new MailerSendError(`A Brevo ${res.status} kóddal válaszolt.`);
      }
      return;
    }
    case '':
      throw new MailerConfigError('Nincs beállítva levélküldő szolgáltató (EMAIL_PROVIDER).');
    default:
      throw new MailerConfigError(`Ismeretlen levélküldő szolgáltató: ${provider}`);
  }
}
