export const COOKIE_NAME = 'ame_visitor';
export function platformIdentity(request: Request) {
  // Sites dispatch strips client identity headers and supplies verified SIWC identity.
  // Self-hosting requires an equivalent trusted gateway; never expose this Worker directly.
  const userId = request.headers.get('oai-authenticated-user-id');
  const email = request.headers.get('oai-authenticated-user-email');
  return userId && email ? { userId, email } : null;
}
export async function visitor(request: Request, anonymousOnly = false) {
  const cookie = request.headers.get('cookie') || '';
  let token = cookie.match(/(?:^|;\s*)ame_visitor=([a-f0-9]{64})(?:;|$)/)?.[1];
  const fresh = !token;
  if (!token)
    token = Array.from(crypto.getRandomValues(new Uint8Array(32)), (x) =>
      x.toString(16).padStart(2, '0'),
    ).join('');
  const identity = anonymousOnly ? null : platformIdentity(request);
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(identity ? 'siwc:' + identity.userId : token),
  );
  const id = Array.from(new Uint8Array(digest), (x) =>
    x.toString(16).padStart(2, '0'),
  ).join('');
  const secure = new URL(request.url).protocol === 'https:' ? '; Secure' : '';
  return {
    id,
    cookie: fresh
      ? `${COOKIE_NAME}=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=31536000${secure}`
      : null,
  };
}
export function json(
  data: unknown,
  status = 200,
  cookie: string | null = null,
) {
  const headers = new Headers({
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  });
  if (cookie) headers.set('Set-Cookie', cookie);
  return new Response(JSON.stringify(data), { status, headers });
}
export function sameOrigin(request: Request) {
  const origin = request.headers.get('origin');
  return !!origin && origin === new URL(request.url).origin;
}
export async function readBody(request: Request) {
  if (!sameOrigin(request)) throw new Error('INVALID_ORIGIN');
  if (!request.headers.get('content-type')?.startsWith('application/json'))
    throw new Error('INVALID_CONTENT_TYPE');
  const raw = await request.text();
  if (raw.length > 40000) throw new Error('PAYLOAD_TOO_LARGE');
  return JSON.parse(raw);
}
