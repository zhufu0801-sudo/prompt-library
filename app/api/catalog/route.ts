import { database, ensureContent } from '@/db/client';
import { json, visitor } from '@/lib/http';
import { aiCapabilities } from '@/lib/ai/provider';
export async function GET(request: Request) {
  try {
    await ensureContent();
    const db = database();
    const user = await visitor(request);
    const url = new URL(request.url);
    const q = (url.searchParams.get('q') || '').trim().slice(0, 150);
    const cat = url.searchParams.get('category') || '';
    const kind = url.searchParams.get('kind') || '';
    const saved = url.searchParams.get('favorites') === '1';
    const page = Math.max(
      1,
      Math.min(1000, Math.floor(Number(url.searchParams.get('page'))) || 1),
    );
    const limit = 18;
    const where = ["t.status='published'"];
    const args: unknown[] = [];
    if (cat) {
      where.push('t.category_id=?');
      args.push(cat);
    }
    if (kind === 'custom' || kind === 'imported') {
      where.push('t.kind=?');
      args.push(kind);
    }
    if (q) {
      const pattern = '%' + q.replace(/[\\%_]/g, '\\$&') + '%';
      where.push(
        "(t.title LIKE ? ESCAPE '\\' OR t.description LIKE ? ESCAPE '\\' OR t.content LIKE ? ESCAPE '\\' OR EXISTS(SELECT 1 FROM template_tags tt JOIN tags g ON g.id=tt.tag_id WHERE tt.template_id=t.id AND g.label LIKE ? ESCAPE '\\'))",
      );
      args.push(pattern, pattern, pattern, pattern);
    }
    if (saved) {
      where.push(
        'EXISTS(SELECT 1 FROM favorites f WHERE f.template_id=t.id AND f.visitor_id=?)',
      );
      args.push(user.id);
    }
    const filter = where.join(' AND ');
    const [
      { results: items },
      { results: count },
      { results: categories },
      { results: totals },
      { results: favorites },
    ] = await db.batch<Record<string, unknown>>([
      db
        .prepare(
          `SELECT t.id,t.title,t.description,t.category_id as categoryId,t.kind,t.source_id as sourceId,t.content, (SELECT json_group_array(g.label) FROM template_tags tt JOIN tags g ON g.id=tt.tag_id WHERE tt.template_id=t.id) AS tags FROM templates t WHERE ${filter} ORDER BY CASE WHEN t.kind='custom' THEN 0 ELSE 1 END,t.title,t.id LIMIT ? OFFSET ?`,
        )
        .bind(...args, limit, (page - 1) * limit),
      db
        .prepare(`SELECT count(*) as count FROM templates t WHERE ${filter}`)
        .bind(...args),
      db.prepare(
        "SELECT c.id,c.name,c.description,c.icon,c.sort_order as sortOrder,count(t.id) as count FROM categories c LEFT JOIN templates t ON t.category_id=c.id AND t.status='published' GROUP BY c.id ORDER BY c.sort_order",
      ),
      db.prepare(
        "SELECT kind,count(*) as count FROM templates WHERE status='published' GROUP BY kind",
      ),
      db
        .prepare('SELECT template_id FROM favorites WHERE visitor_id=?')
        .bind(user.id),
    ]);
    return json(
      {
        items: items.map((r) => ({
          ...r,
          tags: JSON.parse(String(r.tags)),
          content: String(r.content).slice(0, 220),
        })),
        total: Number(count[0].count),
        page,
        pageSize: limit,
        categories,
        totals,
        favorites: favorites.map((f) => f.template_id),
        ai: aiCapabilities,
      },
      200,
      user.cookie,
    );
  } catch (error) {
    console.error(
      'catalog failed',
      error instanceof Error ? error.message : 'unknown',
    );
    return json({ error: '数据库暂时不可用，请稍后重试。' }, 503);
  }
}
