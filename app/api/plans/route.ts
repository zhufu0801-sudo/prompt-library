import { database, ensureContent } from '@/db/client';
import { getTemplate } from '@/db/queries';
import { json, visitor, readBody } from '@/lib/http';
export async function GET(request: Request) {
  try {
    await ensureContent();
    const user = await visitor(request);
    const { results } = await database()
      .prepare(
        'SELECT id,template_id,title,values_json,locks_json,output,updated_at FROM plans WHERE visitor_id=? ORDER BY updated_at DESC LIMIT 100',
      )
      .bind(user.id)
      .all();
    return json(
      {
        plans: results.map((p) => ({
          id: p.id,
          templateId: p.template_id,
          title: p.title,
          values: JSON.parse(String(p.values_json)),
          locks: JSON.parse(String(p.locks_json)),
          output: p.output,
          updatedAt: p.updated_at,
        })),
      },
      200,
      user.cookie,
    );
  } catch {
    return json({ error: '读取方案失败' }, 503);
  }
}
export async function POST(request: Request) {
  let b;
  try {
    b = await readBody(request);
  } catch {
    return json({ error: '请求来源或格式无效' }, 400);
  }
  if (
    !b ||
    typeof b !== 'object' ||
    Array.isArray(b) ||
    typeof b.templateId !== 'string' ||
    typeof b.title !== 'string' ||
    !b.title.trim() ||
    b.title.length > 100 ||
    typeof b.output !== 'string' ||
    b.output.length > 20000 ||
    !b.values ||
    typeof b.values !== 'object' ||
    Array.isArray(b.values) ||
    !b.locks ||
    typeof b.locks !== 'object' ||
    Array.isArray(b.locks) ||
    Object.values(b.locks).some((v) => typeof v !== 'boolean') ||
    Object.entries(b.values).some(
      ([k, v]) =>
        k.length > 50 ||
        !(
          (typeof v === 'string' && v.length <= 12000) ||
          (Array.isArray(v) &&
            v.length <= 10 &&
            v.every((x) => typeof x === 'string' && x.length <= 100))
        ),
    ) ||
    (b.id !== undefined && typeof b.id !== 'string')
  )
    return json({ error: '方案内容格式无效或超出长度限制' }, 400);
  try {
    const t = await getTemplate(b.templateId);
    if (!t) return json({ error: '模板不存在' }, 404);
    const allowed = new Set(t.fields.map((f) => f.key));
    if (
      Object.keys(b.values).some((k) => !allowed.has(k)) ||
      Object.keys(b.locks).some((k) => !allowed.has(k))
    )
      return json({ error: '未知的表单字段' }, 400);
    for (const f of t.fields) {
      const v = b.values[f.key];
      if (v === undefined) {
        if (f.required) return json({ error: `请填写${f.label}` }, 400);
        continue;
      }
      if (f.type === 'multi') {
        if (
          !Array.isArray(v) ||
          v.length > f.maxSelections ||
          v.some((x: unknown) => typeof x !== 'string' || x.length > 40)
        )
          return json({ error: '词条数量或内容无效' }, 400);
      } else if (
        typeof v !== 'string' ||
        v.length > (f.type === 'text' ? 200 : 12000) ||
        (f.required && !v.trim())
      )
        return json({ error: `${f.label}无效` }, 400);
    }
    const user = await visitor(request);
    const db = database();
    const now = new Date().toISOString();
    const id = b.id || crypto.randomUUID();
    if (b.id) {
      const result = await db
        .prepare(
          'UPDATE plans SET title=?,values_json=?,locks_json=?,output=?,updated_at=? WHERE id=? AND visitor_id=? AND template_id=?',
        )
        .bind(
          b.title.trim(),
          JSON.stringify(b.values),
          JSON.stringify(b.locks),
          b.output,
          now,
          id,
          user.id,
          t.id,
        )
        .run();
      if (!result.meta.changes)
        return json({ error: '方案不存在或不属于当前访客' }, 404);
    } else {
      const result = await db
        .prepare(
          'INSERT INTO plans(id,visitor_id,template_id,title,values_json,locks_json,output,created_at,updated_at) SELECT ?,?,?,?,?,?,?,?,? WHERE (SELECT count(*) FROM plans WHERE visitor_id=?)<100',
        )
        .bind(
          id,
          user.id,
          t.id,
          b.title.trim(),
          JSON.stringify(b.values),
          JSON.stringify(b.locks),
          b.output,
          now,
          now,
          user.id,
        )
        .run();
      if (!result.meta.changes)
        return json(
          { error: '最多保存100个方案，请更新已有方案或导出备份。' },
          409,
        );
    }
    return json({ id, updatedAt: now }, 200, user.cookie);
  } catch {
    return json({ error: '方案保存失败' }, 503);
  }
}
