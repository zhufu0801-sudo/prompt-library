import { database } from '@/db/client';
import { json, visitor, readBody } from '@/lib/http';
import { screenFeedback, validFeedback } from '@/lib/feedback';
export async function POST(request: Request) {
  let b;
  try {
    b = await readBody(request);
  } catch {
    return json({ error: 'INVALID_REQUEST' }, 400);
  }
  if (!validFeedback(b)) return json({ error: 'INVALID_FEEDBACK' }, 400);
  if (b.website) return json({ received: true }); // Quietly discard honeypot submissions.
  try {
    const user = await visitor(request),
      db = database(),
      now = new Date().toISOString();
    const summary = b.summary.trim(),
      raw = await crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(
          b.kind + '\n' + summary.normalize('NFKC').toLowerCase(),
        ),
      );
    const digest = Array.from(new Uint8Array(raw), (x) =>
      x.toString(16).padStart(2, '0'),
    ).join('');
    if (
      await db
        .prepare('SELECT id FROM feedback WHERE visitor_id=? AND digest=?')
        .bind(user.id, digest)
        .first()
    )
      return json({ received: true, duplicate: true }, 200, user.cookie);
    const result = await db
      .prepare(
        'INSERT OR IGNORE INTO feedback(id,visitor_id,summary,context,kind,status,digest,created_at) SELECT ?,?,?,?,?,?,?,? WHERE (SELECT count(*) FROM feedback WHERE visitor_id=? AND created_at>?)<5',
      )
      .bind(
        crypto.randomUUID(),
        user.id,
        summary,
        b.context,
        b.kind,
        screenFeedback(summary),
        digest,
        now,
        user.id,
        new Date(Date.now() - 86400000).toISOString(),
      )
      .run();
    if (!result.meta.changes)
      return json({ error: 'DAILY_LIMIT' }, 429, user.cookie);
    return json({ received: true }, 200, user.cookie);
  } catch {
    return json({ error: 'SAVE_FAILED' }, 503);
  }
}
