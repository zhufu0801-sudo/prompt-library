import { database, ensureContent } from '@/db/client';
import type { Template, Field } from '@/lib/prompt';
export async function getTemplate(id: string): Promise<Template | null> {
  return (await getTemplates([id]))[0];
}

// Four set queries per chunk instead of four queries for every module.
// Preserve requested order and missing IDs, and stay below D1's bind limit.
export async function getTemplates(
  ids: readonly string[],
): Promise<(Template | null)[]> {
  if (!ids.length) return [];
  await ensureContent();
  const db = database();
  const found = new Map<string, Template>();
  const unique = [...new Set(ids)];
  for (let start = 0; start < unique.length; start += 80) {
    const chunk = unique.slice(start, start + 80);
    const marks = chunk.map(() => '?').join(',');
    const [
      { results: rows },
      { results: tags },
      { results: fields },
      { results: suggestions },
    ] = await db.batch<Record<string, unknown>>([
      db
        .prepare(
          `SELECT * FROM templates WHERE status='published' AND id IN (${marks})`,
        )
        .bind(...chunk),
      db
        .prepare(
          `SELECT tt.template_id, tags.label FROM tags JOIN template_tags tt ON tags.id=tt.tag_id WHERE tt.template_id IN (${marks}) ORDER BY tags.label`,
        )
        .bind(...chunk),
      db
        .prepare(
          `SELECT * FROM template_fields WHERE template_id IN (${marks}) ORDER BY sort_order`,
        )
        .bind(...chunk),
      db
        .prepare(
          `SELECT s.*, f.template_id FROM field_suggestions s JOIN template_fields f ON f.id=s.field_id WHERE f.template_id IN (${marks}) ORDER BY s.sort_order`,
        )
        .bind(...chunk),
    ]);
    for (const row of rows) {
      found.set(
        String(row.id),
        hydrate(
          row,
          tags.filter((x) => x.template_id === row.id),
          fields.filter((x) => x.template_id === row.id),
          suggestions.filter((x) => x.template_id === row.id),
        ),
      );
    }
  }
  return ids.map((id) => found.get(id) ?? null);
}

function hydrate(
  r: Record<string, unknown>,
  tags: Record<string, unknown>[],
  fields: Record<string, unknown>[],
  suggestions: Record<string, unknown>[],
): Template {
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
