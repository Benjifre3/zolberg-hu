import { test } from 'node:test';
import assert from 'node:assert/strict';
import { professionalService, jsonLdText } from '../../src/lib/jsonld.ts';
import type { Site } from '../../src/lib/site.ts';

const site = (company: Partial<Site['company']>) =>
  ({
    meta: { title: 'x'.repeat(20), description: 'Leírás.' },
    company: {
      legal_name: null,
      owner_name: null,
      address: null,
      tax_id: null,
      email: null,
      phone: null,
      ...company,
    },
  }) as unknown as Site;

test('csak a meglévő cégadat kerül a JSON-LD-be (2.1)', () => {
  const empty = professionalService(site({}), 'https://zolberg.hu/');
  assert.equal(empty['@type'], 'ProfessionalService');
  for (const k of ['address', 'taxID', 'email', 'telephone', 'founder']) {
    assert.equal(k in empty, false, k);
  }
  const full = professionalService(
    site({ legal_name: 'Minta Kft.', tax_id: '12345678-1-12', phone: '+36 1 234 5678' }),
    'https://zolberg.hu/',
  );
  assert.equal(full['name'], 'Minta Kft.');
  assert.equal(full['taxID'], '12345678-1-12');
  assert.equal(full['telephone'], '+36 1 234 5678');
  assert.equal(full['image'], 'https://zolberg.hu/og.png');
});

test('a JSON-LD szöveg nem zárhatja le a <script> elemet', () => {
  assert.equal(jsonLdText({ a: '</script><b>' }).includes('</script>'), false);
});
