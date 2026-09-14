import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const root = process.cwd();
const read = (p) =>
  JSON.parse(
    fs.readFileSync(path.join(root, p), 'utf8').replace(/^\uFEFF/, ''),
  );
const categories = read('data/categories.json');
const templates = [
  ...read('data/studio/zh.json'),
  ...read('data/studio/additional/zh.json'),
  ...fs
    .readdirSync('data/modules')
    .filter((f) => f.endsWith('.json'))
    .sort()
    .flatMap((f) => read('data/modules/' + f)),
  ...read('data/imports/aishort.json'),
];
const manifest = read('data/imports/manifest.json');
const seen = new Set();
const slugSeen = new Set();
const catIds = new Set(categories.map((c) => c.id));
for (const t of templates) {
  if (seen.has(t.id) || slugSeen.has(t.slug))
    throw Error('Duplicate id/slug: ' + t.id);
  seen.add(t.id);
  slugSeen.add(t.slug);
  if (!catIds.has(t.categoryId))
    throw Error('Unknown category ' + t.categoryId);
  if (!t.title?.trim() || !t.content?.trim())
    throw Error('Missing title/content ' + t.id);
  if (!['published', 'draft', 'archived'].includes(t.status))
    throw Error('Invalid status');
  const keys = new Set();
  for (const f of t.fields) {
    if (!/^[a-z_]+$/.test(f.key) || keys.has(f.key))
      throw Error('Invalid or duplicate field ' + f.key);
    keys.add(f.key);
    if (!['text', 'textarea', 'multi'].includes(f.type))
      throw Error('Invalid field type');
    if (f.maxSelections < 1 || f.maxSelections > 10)
      throw Error('Invalid limit');
    if (f.type === 'multi' && !Array.isArray(f.defaultValue))
      throw Error('Invalid default');
    for (const key of Object.keys(f.conditionalOptions || {}))
      if (!t.fields.some((x) => x.key === key))
        throw Error('Unknown condition field');
  }
  for (const m of t.content.matchAll(/\{\{([a-z_]+)\}\}/g))
    if (!keys.has(m[1])) throw Error('Unmapped variable: ' + m[1]);
}
const groups = [];
let group = [];
const add = (sql, args = []) => group.push({ sql, args });
function upsert(table, obj) {
  const keys = Object.keys(obj);
  const pk = keys[0];
  add(
    `INSERT INTO ${table} (${keys.join(',')}) VALUES (${keys.map(() => '?').join(',')}) ON CONFLICT(${pk}) DO UPDATE SET ${keys
      .slice(1)
      .map((k) => `${k}=excluded.${k}`)
      .join(',')}`,
    Object.values(obj),
  );
}
for (const c of categories)
  upsert('categories', {
    id: c.id,
    name: c.name,
    description: c.description,
    sort_order: c.sortOrder,
    icon: c.icon,
  });
upsert('sources', {
  id: 'aishort',
  name: 'AI Short / ChatGPT-Shortcut',
  url: manifest.upstream,
  license: 'MIT',
  revision: manifest.commit,
});
upsert('sources', {
  id: 'original',
  name: 'AI Made Easy 原创模板',
  url: null,
  license: 'Project original content',
  revision: '1',
});
groups.push(group);
group = [];
const tagId = (tag) =>
  'tag-' + crypto.createHash('sha256').update(tag).digest('hex').slice(0, 20);
const allTags = [...new Set(templates.flatMap((t) => t.tags))];
for (const label of allTags) upsert('tags', { id: tagId(label), label });
groups.push(group);
group = [];
for (const t of templates) {
  upsert('templates', {
    id: t.id,
    slug: t.slug,
    title: t.title,
    category_id: t.categoryId,
    description: t.description,
    content: t.content,
    translation: t.translation,
    kind: t.kind,
    source_id: t.sourceId,
    source_record_id: t.sourceRecordId,
    source_url: t.sourceUrl,
    status: t.status,
    version: t.version,
  });
  add('DELETE FROM template_tags WHERE template_id=?', [t.id]);
  for (const tag of new Set(t.tags))
    add('INSERT INTO template_tags (template_id,tag_id) VALUES (?,?)', [
      t.id,
      tagId(tag),
    ]);
  add('DELETE FROM template_fields WHERE template_id=?', [t.id]);
  for (const [n, f] of t.fields.entries()) {
    const fid = t.id + ':' + f.key;
    upsert('template_fields', {
      id: fid,
      template_id: t.id,
      key: f.key,
      label: f.label,
      type: f.type,
      required: f.required ? 1 : 0,
      default_json: JSON.stringify(f.defaultValue),
      max_selections: f.maxSelections,
      sort_order: n,
    });
    for (const [i, label] of f.options.entries())
      upsert('field_suggestions', {
        id: fid + ':' + i,
        field_id: fid,
        label,
        condition_key: null,
        condition_value: null,
        sort_order: i,
      });
    for (const [key, conditions] of Object.entries(f.conditionalOptions || {}))
      for (const [value, labels] of Object.entries(conditions))
        for (const [i, label] of labels.entries())
          upsert('field_suggestions', {
            id: fid + ':' + key + ':' + value + ':' + i,
            field_id: fid,
            label,
            condition_key: key,
            condition_value: value,
            sort_order: i,
          });
  }
  groups.push(group);
  group = [];
}
const skillFit=read('data/studio/skill-fit.json');
for (const s of read('data/studio/skills.json')) upsert('skill_resources',{id:s.id,metadata_json:JSON.stringify({...s,fit:skillFit[s.id]})});
for (const s of [...[...read('data/studio/extended-tasks.json'),...read('data/studio/additional-tasks.json')].map(s=>({...s,status:'published'})),...read('data/research-library/topic-rules.json')]) upsert('task_resources',{id:s.id,status:s.status,metadata_json:JSON.stringify(s)});
groups.push(group);
group=[];
const version = crypto
  .createHash('sha256')
  .update(JSON.stringify(groups))
  .digest('hex')
  .slice(0, 24);
// Each template's changes remain in one atomic D1 batch.
const batches = [];
let batch = [];
for (const g of groups) {
  if (batch.length + g.length > 90 && batch.length) {
    batches.push(batch);
    batch = [];
  }
  batch.push(...g);
}
if (batch.length) batches.push(batch);
const seed = {
  version,
  batches,
  counts: {
    categories: categories.length,
    templates: templates.length,
    custom: templates.filter((t) => t.kind === 'custom').length,
    imported: templates.filter((t) => t.kind === 'imported').length,
    fields: templates.reduce((n, t) => n + t.fields.length, 0),
    tags: allTags.length,
  },
};
fs.writeFileSync('data/seed.generated.json', JSON.stringify(seed));
const quote = (v) =>
  v === null
    ? 'NULL'
    : typeof v === 'number'
      ? String(v)
      : "'" + String(v).replaceAll("'", "''") + "'";
const stmts = batches.flat().map(({ sql, args }) => {
  let i = 0;
  return sql.replace(/\?/g, () => quote(args[i++])) + ';';
});
stmts.push(
  `INSERT OR IGNORE INTO content_versions(id,applied_at) VALUES ('${version}',datetime('now'));`,
);
fs.writeFileSync('database/seed.sql', stmts.join('\n') + '\n');
fs.writeFileSync(
  'data/catalog-summary.json',
  JSON.stringify(seed.counts, null, 2) + '\n',
);
console.log(
  'Content validated:',
  seed.counts,
  'batches:',
  batches.length,
  'version:',
  version,
);
