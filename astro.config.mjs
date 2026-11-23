// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';

const SITE_URL = process.env.SITE_URL ?? 'https://zolberg.hu';

/** Oldalak, amelyek nem kerülnek a sitemapbe. */
const NOT_IN_SITEMAP = ['/koszonjuk', '/404'];

export default defineConfig({
  site: SITE_URL,
  output: 'static',
  trailingSlash: 'never',
  // Astro 7 alapértéke 'jsx', ami eltüntetheti a szóközt két inline elem között
  // (magyar szövegben a kiemelt szavak körül ez hibát okozna).
  compressHTML: true,
  build: {
    format: 'file', // /adatkezeles.html → /adatkezeles (Cloudflare Pages)
    inlineStylesheets: 'always', // a teljes CSS ≤ 25 KB: nincs renderblokkoló kérés
  },
  integrations: [
    sitemap({
      filter: (page) => !NOT_IN_SITEMAP.some((p) => new URL(page).pathname.startsWith(p)),
    }),
  ],
  // D-008: családonként egy részhalmazolt woff2 (pnpm fonts).
  fonts: [
    {
      provider: fontProviders.local(),
      name: 'Bricolage Grotesque',
      cssVariable: '--font-display',
      display: 'swap',
      fallbacks: ['Arial', 'sans-serif'],
      options: {
        variants: [
          {
            src: ['./src/assets/fonts/bricolage-grotesque.woff2'],
            weight: '500 700',
            style: 'normal',
          },
        ],
      },
    },
    {
      provider: fontProviders.local(),
      name: 'Hanken Grotesk',
      cssVariable: '--font-body',
      display: 'swap',
      fallbacks: ['Arial', 'sans-serif'],
      options: {
        variants: [
          {
            src: ['./src/assets/fonts/hanken-grotesk.woff2'],
            weight: '400 600',
            style: 'normal',
          },
        ],
      },
    },
    {
      provider: fontProviders.local(),
      name: 'JetBrains Mono',
      cssVariable: '--font-mono',
      display: 'swap',
      fallbacks: ['Consolas', 'monospace'],
      options: {
        variants: [
          {
            src: ['./src/assets/fonts/jetbrains-mono.woff2'],
            weight: '400',
            style: 'normal',
          },
        ],
      },
    },
  ],
});
