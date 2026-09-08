import { database, ensureContent } from '@/db/client';
import type { Template, Field } from '@/lib/prompt';
export async function getTemplate(id: string): Promise<Template | null> {
  await ensureContent();
  const db = database();
  const r = await db
    .prepare("SELECT * FROM templates WHERE id=? AND status='published'")
    .bind(id)
    .first<Record<string, unknown>>();
  if (!r) return null;
  const [{ results: tags }, { results: fields }, { results: suggestions }] =
    await db.batch<Record<string, unknown>>([
      db
        .prepare(
          'SELECT tags.label FROM tags JOIN template_tags ON tags.id=template_tags.tag_id WHERE template_tags.template_id=? ORDER BY tags.label',
        )
        .bind(id),
      db
        .prepare(
          'SELECT * FROM template_fields WHERE template_id=? ORDER BY sort_order',
        )
        .bind(id),
      db
        .prepare(
          'SELECT s.* FROM field_suggestions s JOIN template_fields f ON f.id=s.field_id WHERE f.template_id=? ORDER BY s.sort_order',
        )
        .bind(id),
    ]);
  return {
    id: String(r.id),
    slug: String(r.slug),
    title: String(r.title),
    categoryId: String(r.category_id),
    description: String(r.description),
    content: String(r.content),
    translation: String(r.translation),
    kind: r.kind as Template['kind'],
    sourceId: String(r.source_id),
    sourceRecordId: r.source_record_id as string | null,
    sourceUrl: r.source_url as string | null,
    status: String(r.status),
    version: Number(r.version),
    tags: tags.map((x) => String(x.label)),
    fields: fields.map((f) => {
      const choices = suggestions.filter((s) => s.field_id === f.id);
      const conditions: Record<string, Record<string, string[]>> = {};
      for (const s of choices.filter((s) => s.condition_key)) {
        const key = String(s.condition_key),
          value = String(s.condition_value);
        ((conditions[key] ??= {})[value] ??= []).push(String(s.label));
      }
      return {
        key: String(f.key),
        label: String(f.label),
        type: f.type as Field['type'],
        required: !!f.required,
        defaultValue: JSON.parse(String(f.default_json)),
        maxSelections: Number(f.max_selections),
        options: choices
          .filter((s) => !s.condition_key)
          .map((s) => String(s.label)),
        conditionalOptions: conditions,
      };
    }),
  };
}
