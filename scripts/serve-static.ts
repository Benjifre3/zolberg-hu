/**
 * Minimális statikus szerver a baseline-buildhez (őrtesztek). A Cloudflare Pages útvonal-
 * szabályát követi: /adatkezeles → adatkezeles.html, ismeretlen út → 404.html.
 *
 *   node scripts/serve-static.ts <könyvtár> <port>
 */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname, resolve, normalize } from 'node:path';

const root = resolve(process.argv[2] ?? 'dist');
const port = Number(process.argv[3] ?? 8790);

const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
};

async function file(p: string): Promise<string | null> {
  try {
    return (await stat(p)).isFile() ? p : null;
  } catch {
    return null;
  }
}

createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', 'http://x');
  if (url.pathname === '/__health') {
    res.writeHead(200).end('ok');
    return;
  }
  const rel = normalize(decodeURIComponent(url.pathname)).replace(/^([/\\])+/, '');
  if (rel.startsWith('..')) {
    res.writeHead(400).end();
    return;
  }
  const base = join(root, rel);
  const hit =
    (await file(base)) ?? (await file(`${base}.html`)) ?? (await file(join(base, 'index.html')));
  const target = hit ?? (await file(join(root, '404.html')));
  if (!target) {
    res.writeHead(503, { 'content-type': 'text/plain; charset=utf-8' });
    res.end(`Nincs baseline-build: ${root} (pnpm baseline)`);
    return;
  }
  res.writeHead(hit ? 200 : 404, {
    'content-type': TYPES[extname(target)] ?? 'application/octet-stream',
  });
  res.end(await readFile(target));
}).listen(port, () => console.log(`serve-static ${root} → http://localhost:${port}`));
