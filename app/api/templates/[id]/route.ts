import { getTemplate } from '@/db/queries';
import { json } from '@/lib/http';
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const item = await getTemplate(id);
    return item ? json(item) : json({ error: '模板不存在' }, 404);
  } catch {
    return json({ error: '模板读取失败' }, 503);
  }
}
