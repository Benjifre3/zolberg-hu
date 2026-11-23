/**
 * Levélküldés az ajánlatkérésről a tulajdonosnak (3.: tranzakciós e-mail API, kulcs csak
 * környezeti változóban). A szolgáltató a Q3 döntésétől függ; addig csak a „dry-run” mód él
 * (fejlesztés, tesztek). Ismeretlen vagy hiányzó szolgáltatónál a küldés hibát dob, így az
 * űrlap nem jelez hamis sikert (2.1).
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

/** A levél tárgya és törzse (egyszerű szöveg, magyarul). */
export function composeLead(lead: Lead): { subject: string; text: string } {
  return {
    subject: `Mért adatokat kér: ${lead.company}`.slice(0, 120),
    text: [
      'Új kérés érkezett a zolberg.hu űrlapjáról.',
      '',
      `Cégnév: ${lead.company}`,
      `Weboldal: ${lead.website}`,
      `E-mail: ${lead.email}`,
      `Beérkezett: ${lead.receivedAt}`,
      '',
      'Válasz: erre a levélre válaszolva közvetlenül a kérőnek ír.',
    ].join('\n'),
  };
}

export async function sendLead(lead: Lead, env: MailEnv): Promise<void> {
  const provider = env.EMAIL_PROVIDER ?? '';
  const mail = composeLead(lead);
  switch (provider) {
    case 'dry-run':
      // Csak fejlesztéshez és tesztekhez: a naplóba a cégnév és a tárgy kerül, az e-mail-cím nem.
      console.log(`[dry-run] ${mail.subject} – ${lead.website}`);
      return;
    case '':
      throw new MailerConfigError('Nincs beállítva levélküldő szolgáltató (EMAIL_PROVIDER).');
    default:
      throw new MailerConfigError(`Ismeretlen levélküldő szolgáltató: ${provider}`);
  }
}
