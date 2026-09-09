import { database, ensureContent } from '@/db/client';
import { getTemplate } from '@/db/queries';
import { json, visitor } from '@/lib/http';
import { localeOf, studioIds } from '@/lib/studio';
import en from '@/data/studio/en.json';
import ja from '@/data/studio/ja.json';
export async function GET(request: Request) {
  try {
    await ensureContent();
    const locale = localeOf(new URL(request.url).searchParams.get('locale'));
    const user = await visitor(request);
    const templates = await Promise.all(studioIds.map(getTemplate));
    if (templates.some((t) => !t)) throw Error('Featured template missing');
    const { results } = await database()
      .prepare('SELECT template_id FROM favorites WHERE visitor_id=?')
      .bind(user.id)
      .all();
    const translated = locale === 'en' ? en : ja;
    return json(
      {
        templates: templates.map((t) =>
          locale === 'zh' ? t : translated.find((x) => x.id === t!.id),
        ),
        favorites: results.map((r) => r.template_id),
        locale,
      },
      200,
      user.cookie,
    );
  } catch {
    return json({ error: 'STUDIO_UNAVAILABLE' }, 503);
  }
}
