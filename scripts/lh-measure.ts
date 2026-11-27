/**
 * Lighthouse-mérés egy build-könyvtáron (mobil, szimulált lassú 4G, 5 futás mediánja), az
 * összefoglaló JSON-ba kerül. A baseline és az új build összevetésére (prémium finomítás 7.).
 *
 *   node scripts/lh-measure.ts .baseline/dist docs/baseline/lighthouse.json
 *   node scripts/lh-measure.ts dist docs/polish/lighthouse.json
 */
import { spawnSync } from 'node:child_process';
import { readdirSync, readFileSync, rmSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { chromium } from '@playwright/test';

const [dist = 'dist', out = 'lighthouse.json'] = process.argv.slice(2);
const runs = Number(process.env['LH_RUNS'] ?? 5);
rmSync('.lighthouseci', { recursive: true, force: true });

const r = spawnSync(
  'pnpm',
  [
    'exec',
    'lhci',
    'collect',
    '--config=lighthouserc.json',
    `--staticDistDir=${dist}`,
    `--numberOfRuns=${runs}`,
  ],
  {
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: {
      ...process.env,
      CHROME_PATH: chromium.executablePath(),
      LHCI_BUILD_CONTEXT__CURRENT_HASH: 'x',
    },
  },
);
if (r.status !== 0) process.exit(r.status ?? 1);

interface Lhr {
  categories: Record<string, { score: number }>;
  audits: Record<string, { numericValue?: number; details?: unknown }>;
}
const lhrs: Lhr[] = readdirSync('.lighthouseci')
  .filter((f) => /^lhr-.*\.json$/.test(f))
  .map((f) => JSON.parse(readFileSync(join('.lighthouseci', f), 'utf8')) as Lhr);

const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)] ?? NaN;
};
const metric = (id: string) => median(lhrs.map((l) => l.audits[id]?.numericValue ?? NaN));
const score = (id: string) =>
  median(lhrs.map((l) => Math.round((l.categories[id]?.score ?? 0) * 100)));
/** Az LCP-elem HTML-részlete az lcp-breakdown-insight auditból. */
function findSnippet(node: unknown): string | null {
  if (!node || typeof node !== 'object') return null;
  const o = node as Record<string, unknown>;
  if (typeof o['snippet'] === 'string') return o['snippet'];
  for (const v of Object.values(o)) {
    const hit = findSnippet(v);
    if (hit) return hit;
  }
  return null;
}
const lcpEl = findSnippet(lhrs[0]?.audits['lcp-breakdown-insight']?.details)?.slice(0, 200);

const summary = {
  measured_at: new Date().toISOString(),
  dist,
  runs: lhrs.length,
  setup: 'Lighthouse CI, mobil, szimulált lassú 4G, helyi statikus szerver (HTTP/1.1)',
  scores: {
    performance: score('performance'),
    accessibility: score('accessibility'),
    best_practices: score('best-practices'),
    seo: score('seo'),
  },
  metrics_ms: {
    fcp: Math.round(metric('first-contentful-paint')),
    lcp: Math.round(metric('largest-contentful-paint')),
    tbt: Math.round(metric('total-blocking-time')),
    speed_index: Math.round(metric('speed-index')),
  },
  cls: Number(metric('cumulative-layout-shift').toFixed(4)),
  total_bytes: Math.round(metric('total-byte-weight')),
  lcp_element: lcpEl ?? null,
};
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, `${JSON.stringify(summary, null, 2)}\n`);
console.log(JSON.stringify(summary, null, 2));
