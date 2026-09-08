import { env } from 'cloudflare:workers';
import seed from '@/data/seed.generated.json';
export function database(): D1Database {
  const db = (env as unknown as { DB?: D1Database }).DB;
  if (!db) throw new Error('DATABASE_UNAVAILABLE');
  return db;
}
let ready: Promise<void> | undefined;
export async function ensureContent() {
  if (!ready)
    ready = (async () => {
      const db = database();
      const done = await db
        .prepare('SELECT id FROM content_versions WHERE id=?')
        .bind(seed.version)
        .first();
      if (done) return;
      for (const batch of seed.batches) {
        await db.batch(
          batch.map(({ sql, args }) => db.prepare(sql).bind(...args)),
        );
      }
      await db
        .prepare(
          'INSERT OR IGNORE INTO content_versions(id,applied_at) VALUES (?,?)',
        )
        .bind(seed.version, new Date().toISOString())
        .run();
    })().catch((error) => {
      ready = undefined;
      throw error;
    });
  await ready;
}
