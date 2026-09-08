export type Field = {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'multi';
  required: boolean;
  defaultValue: string | string[];
  options: string[];
  maxSelections: number;
  conditionalOptions?: Record<string, Record<string, string[]>>;
};
export type Template = {
  id: string;
  slug: string;
  title: string;
  categoryId: string;
  description: string;
  content: string;
  translation: string;
  tags: string[];
  kind: 'custom' | 'imported';
  sourceId: string;
  sourceRecordId: string | null;
  sourceUrl: string | null;
  status: string;
  version: number;
  fields: Field[];
};
export type Category = {
  id: string;
  name: string;
  description: string;
  sortOrder: number;
  icon: string;
  count?: number;
};
export type Values = Record<string, string | string[]>;
export type Locks = Record<string, boolean>;
export type Plan = {
  id: string;
  templateId: string;
  title: string;
  values: Values;
  locks: Locks;
  output: string;
  updatedAt: string;
};
export function defaultValues(t: Template): Values {
  return Object.fromEntries(
    t.fields.map((f) => [
      f.key,
      Array.isArray(f.defaultValue) ? [...f.defaultValue] : f.defaultValue,
    ]),
  );
}
export function compose(t: Template, values: Values) {
  return t.content.replace(/\{\{([a-z_]+)\}\}/g, (_, key) => {
    const value = values[key];
    return Array.isArray(value)
      ? value.join('、') || '未指定'
      : value?.trim() || '未填写';
  });
}
export function getOptions(f: Field, values: Values) {
  const result = [...f.options];
  for (const [key, conditions] of Object.entries(f.conditionalOptions || {})) {
    const value = values[key];
    if (typeof value === 'string' && conditions[value])
      return conditions[value];
  }
  return result;
}
export function validateValues(t: Template, values: Values) {
  const errors: string[] = [];
  for (const f of t.fields) {
    const v = values[f.key];
    if (f.required && (!v || (Array.isArray(v) ? !v.length : !v.trim())))
      errors.push(`请填写${f.label}`);
    if (
      f.type === 'multi' &&
      v !== undefined &&
      (!Array.isArray(v) || v.length > f.maxSelections)
    )
      errors.push(`${f.label}最多${f.maxSelections}项`);
  }
  return errors;
}
export function refreshValues(
  t: Template,
  values: Values,
  locks: Locks,
): Values {
  const next = { ...values };
  for (const f of t.fields) {
    if (locks[f.key]) continue;
    const options = getOptions(f, values);
    if (!options.length) continue;
    const old = values[f.key];
    if (f.type === 'multi') {
      const list = Array.isArray(old) ? old : [];
      const available = options.filter((v) => !list.includes(v));
      next[f.key] = (available.length ? available : options).slice(
        0,
        Math.min(2, f.maxSelections),
      );
    } else {
      const index = options.indexOf(String(old));
      next[f.key] = options[(index + 1) % options.length];
    }
  }
  return next;
}
