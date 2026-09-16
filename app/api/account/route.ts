import { database } from '@/db/client';
import { isAdmin } from '@/lib/admin';
import { json, visitor, platformIdentity, readBody } from '@/lib/http';
export async function GET(request: Request) {
  const identity = platformIdentity(request),
    user = await visitor(request);
  return json(
    {
      signedIn: !!identity,
      email: identity?.email || null,
      admin: isAdmin(request),
    },
    200,
    user.cookie,
  );
}
export async function POST(request: Request) {
  if (!platformIdentity(request))
    return json({ error: 'SIGN_IN_REQUIRED' }, 401);
  try {
    const body = await readBody(request);
    if (body?.action !== 'claim-guest-data' || body?.consent !== true)
      return json({ error: 'CONSENT_REQUIRED' }, 400);
    const account = await visitor(request),
      guest = await visitor(request, true),
      db = database();
    for (const [table, limit] of [
      ['plans', 100],
      ['video_projects', 30],
    ] as const) {
      const count = await db
        .prepare(`SELECT count(*) AS n FROM ${table} WHERE visitor_id IN (?,?)`)
        .bind(account.id, guest.id)
        .first<{ n: number }>();
      if (count && count.n > limit)
        return json({ error: 'TRANSFER_LIMIT', limit }, 409, account.cookie);
    }
    // Atomic, explicit transfer. Never take an owner identifier from the client.
    await db.batch([
      db
        .prepare(
          'INSERT OR IGNORE INTO favorites(visitor_id,template_id,created_at) SELECT ?,template_id,created_at FROM favorites WHERE visitor_id=?',
        )
        .bind(account.id, guest.id),
      db.prepare('DELETE FROM favorites WHERE visitor_id=?').bind(guest.id),
      db
        .prepare('UPDATE plans SET visitor_id=? WHERE visitor_id=?')
        .bind(account.id, guest.id),
      db
        .prepare('UPDATE video_projects SET visitor_id=? WHERE visitor_id=?')
        .bind(account.id, guest.id),
    ]);
    return json({ transferred: true }, 200, account.cookie);
  } catch {
    return json({ error: 'TRANSFER_FAILED' }, 400);
  }
}
