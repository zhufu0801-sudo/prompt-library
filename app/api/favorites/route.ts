import { database } from '@/db/client';
import { getTemplate } from '@/db/queries';
import { json, visitor, readBody } from '@/lib/http';
export async function POST(request: Request) {
  let body;
  try {
    body = await readBody(request);
  } catch {
    return json({ error: '请求来源或格式无效' }, 400);
  }
  if (
    !body ||
    typeof body !== 'object' ||
    Array.isArray(body) ||
    typeof body.templateId !== 'string' ||
    typeof body.saved !== 'boolean'
  )
    return json({ error: '需要模板编号和收藏状态' }, 400);
  try {
    if (!(await getTemplate(body.templateId)))
      return json({ error: '模板不存在' }, 404);
    const user = await visitor(request);
    const db = database();
    if (body.saved)
      await db
        .prepare(
          'INSERT OR IGNORE INTO favorites(visitor_id,template_id,created_at) VALUES (?,?,?)',
        )
        .bind(user.id, body.templateId, new Date().toISOString())
        .run();
    else
      await db
        .prepare('DELETE FROM favorites WHERE visitor_id=? AND template_id=?')
        .bind(user.id, body.templateId)
        .run();
    return json({ saved: body.saved }, 200, user.cookie);
  } catch {
    return json({ error: '收藏保存失败' }, 503);
  }
}
