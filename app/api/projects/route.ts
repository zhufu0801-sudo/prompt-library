import { database } from '@/db/client';
import { json, visitor, sameOrigin } from '@/lib/http';
import { validateProject } from '@/lib/video-project';
export async function GET(request: Request) {
  try {
    const user = await visitor(request),
      db = database(),
      id = new URL(request.url).searchParams.get('id');
    if (id) {
      const row = await db
        .prepare(
          'SELECT payload_json,revision,updated_at FROM video_projects WHERE id=? AND visitor_id=?',
        )
        .bind(id, user.id)
        .first();
      return row
        ? json(
            {
              project: JSON.parse(String(row.payload_json)),
              revision: row.revision,
              updatedAt: row.updated_at,
            },
            200,
            user.cookie,
          )
        : json({ error: 'NOT_FOUND' }, 404, user.cookie);
    }
    const { results } = await db
      .prepare(
        'SELECT id,title,revision,updated_at FROM video_projects WHERE visitor_id=? ORDER BY updated_at DESC LIMIT 30',
      )
      .bind(user.id)
      .all();
    return json({ projects: results }, 200, user.cookie);
  } catch {
    return json({ error: 'UNAVAILABLE' }, 503);
  }
}
export async function POST(request: Request) {
  if (
    !sameOrigin(request) ||
    !request.headers.get('content-type')?.startsWith('application/json')
  )
    return json({ error: 'INVALID_ORIGIN' }, 400);
  let b;
  try {
    const text = await request.text();
    if (text.length > 510000) return json({ error: 'TOO_LARGE' }, 413);
    b = JSON.parse(text);
  } catch {
    return json({ error: 'INVALID_JSON' }, 400);
  }
  if (
    !b ||
    !validateProject(b.project) ||
    !Number.isInteger(b.revision) ||
    b.revision < 0
  )
    return json({ error: 'INVALID_PROJECT' }, 400);
  try {
    const u = await visitor(request),
      db = database(),
      p = b.project,
      now = new Date().toISOString();
    let r;
    if (b.revision === 0) {
      r = await db
        .prepare(
          'INSERT OR IGNORE INTO video_projects(id,visitor_id,title,payload_json,revision,updated_at) SELECT ?,?,?,?,1,? WHERE (SELECT count(*) FROM video_projects WHERE visitor_id=?)<30',
        )
        .bind(p.id, u.id, p.title, JSON.stringify(p), now, u.id)
        .run();
    } else {
      r = await db
        .prepare(
          'UPDATE video_projects SET title=?,payload_json=?,revision=revision+1,updated_at=? WHERE id=? AND visitor_id=? AND revision=?',
        )
        .bind(p.title, JSON.stringify(p), now, p.id, u.id, b.revision)
        .run();
    }
    if (!r.meta.changes)
      return json({ error: 'CONFLICT_OR_LIMIT' }, 409, u.cookie);
    return json({ revision: b.revision + 1, updatedAt: now }, 200, u.cookie);
  } catch {
    return json({ error: 'SAVE_FAILED' }, 503);
  }
}
