import type { Template, Values, Locks } from './prompt';
export type Locale = 'zh' | 'en' | 'ja';
export const studioIds = ['custom-programming', 'custom-animation'];
export function localeOf(value: string | null): Locale {
  return value === 'en' || value === 'ja' ? value : 'zh';
}
export function composeStudio(
  t: Template,
  values: Values,
  locale: Locale,
  meta = true,
) {
  const empty = {
    zh: '未指定，请先询问我',
    en: 'Not specified; ask me first',
    ja: '未指定。先に質問してください',
  }[locale];
  const sections = t.content.split('\n\n---META---\n\n');
  return (meta ? sections.join('\n\n') : sections[0]).replace(
    /\{\{([a-z_]+)\}\}/g,
    (_, key) => {
      const value = values[key];
      return (
        (Array.isArray(value)
          ? value.join(locale === 'en' ? ', ' : '、')
          : value?.trim()) || empty
      );
    },
  );
}
// Translate only known defaults/options. Keep user prose and every locked value intact.
export function translateValues(
  from: Template,
  to: Template,
  values: Values,
  locks: Locks,
): Values {
  return Object.fromEntries(
    Object.entries(values).map(([key, value]) => {
      if (locks[key]) return [key, value];
      const old = from.fields.find((f) => f.key === key),
        next = to.fields.find((f) => f.key === key);
      if (!old || !next) return [key, value];
      const translate = (v: string) => {
        const i = old.options.indexOf(v);
        return i >= 0 ? (next.options[i] ?? v) : v;
      };
      return [
        key,
        Array.isArray(value) ? value.map(translate) : translate(value),
      ];
    }),
  );
}
