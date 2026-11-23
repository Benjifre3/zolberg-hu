/**
 * JSON-LD (10.): ProfessionalService a site.yaml cégadataiból – ugyanonnan, mint a lábléc és az
 * impresszum (NAP). Csak meglévő adat kerül bele; kitalált érték nem (2.1).
 */
import type { Site } from './site.ts';

export function professionalService(site: Site, siteUrl: string): Record<string, unknown> {
  const c = site.company;
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: c.legal_name ?? 'Zolberg',
    url: siteUrl,
    image: new URL('/og.png', siteUrl).href,
    description: site.meta.description,
    areaServed: { '@type': 'Country', name: 'HU' },
    knowsLanguage: 'hu',
  };
  if (c.address) data['address'] = c.address;
  if (c.tax_id) data['taxID'] = c.tax_id;
  if (c.email) data['email'] = c.email;
  if (c.phone) data['telephone'] = c.phone;
  if (c.owner_name) data['founder'] = { '@type': 'Person', name: c.owner_name };
  return data;
}

/** <script type="application/ld+json"> tartalom, a </script> lezárás ellen védve. */
export const jsonLdText = (data: unknown) => JSON.stringify(data).replace(/</g, '\\u003c');
