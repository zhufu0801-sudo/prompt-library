import { database } from '@/db/client';
import { isAdmin } from '@/lib/admin';
import { json, readBody } from '@/lib/http';
const states = ['pending', 'quarantined', 'approved', 'rejected'];
export async function GET(request: Request) {
  if (!isAdmin(request)) return json({ error: 'FORBIDDEN' }, 403);
  try {
    const query = new URL(request.url).searchParams;
    const status = query.get('status') || 'pending';
    if (!states.includes(status)) return json({ error: 'INVALID_STATUS' }, 400);
    const offset = Math.max(
      0,
      Math.min(100000, Math.trunc(Number(query.get('offset')) || 0)),
    );
    const db = database();
    const rows = await db
      .prepare(
        "SELECT f.id,f.summary,f.context,f.kind,f.status,f.created_at,t.metadata_json FROM feedback f LEFT JOIN task_resources t ON t.id='feedback-'||f.id WHERE f.status=? ORDER BY f.created_at DESC,f.id DESC LIMIT 51 OFFSET ?",
      )
      .bind(status, offset)
      .all();
    const counts = await db
      .prepare('SELECT status,count(*) AS total FROM feedback GROUP BY status')
      .all();
    return json({
      items: rows.results
        .slice(0, 50)
        .map(({ metadata_json, ...row }) => ({
          ...row,
          note: typeof metadata_json === 'string'
            ? JSON.parse(metadata_json).reviewNote || ''
            : '',
        })),
      more: rows.results.length > 50,
      counts: counts.results,
    });
  } catch {
    return json({ error: 'UNAVAILABLE' }, 503);
  }
}
export async function POST(request: Request) {
  if (!isAdmin(request)) return json({ error: 'FORBIDDEN' }, 403);
  try {
    const b = await readBody(request);
    if (
      !b ||
      typeof b.id !== 'string' ||
      !states.includes(b.status) ||
      typeof b.note !== 'string' ||
      b.note.length > 2000
    )
      return json({ error: 'INVALID_REVIEW' }, 400);
    const db = database(),
      row = await db
        .prepare('SELECT summary,context,kind FROM feedback WHERE id=?')
        .bind(b.id)
        .first();
    if (!row) return json({ error: 'NOT_FOUND' }, 404);
    const metadata = JSON.stringify({
      source: 'reviewed-user-feedback',
      feedbackId: b.id,
      ...row,
      reviewNote: b.note,
      reviewedAt: new Date().toISOString(),
      publication:
        'Requires editorial review, translations and tests before publishing.',
    });
    await db.batch([
      db
        .prepare('UPDATE feedback SET status=? WHERE id=?')
        .bind(b.status, b.id),
      db
        .prepare(
          'INSERT INTO task_resources(id,status,metadata_json) VALUES (?,?,?) ON CONFLICT(id) DO UPDATE SET status=excluded.status,metadata_json=excluded.metadata_json',
        )
        .bind(
          'feedback-' + b.id,
          b.status === 'approved' ? 'draft' : 'archived',
          metadata,
        ),
    ]);
    return json({ saved: true });
  } catch {
    return json({ error: 'REVIEW_FAILED' }, 400);
  }
}
