/**
 * Cloudflare Pages Function: POST /api/contact (W4). A logika a src/server/contact.ts-ben van,
 * hogy unit tesztből is hívható legyen.
 */
import { handleContact, type ContactEnv } from '../../src/server/contact.ts';

interface Context {
  request: Request;
  env: ContactEnv;
}

export const onRequestPost = ({ request, env }: Context) => handleContact(request, env);

export const onRequest = () =>
  new Response('A /api/contact csak POST kérést fogad.', {
    status: 405,
    headers: { Allow: 'POST', 'Content-Type': 'text/plain; charset=utf-8' },
  });
