import type { Template, Values, Locks } from './prompt';
import guides from '../data/studio/task-guides.json' with { type: 'json' };
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
    zh: '未提供；非关键内容可列明假设，关键缺项再询问',
    en: 'Not supplied; state assumptions for noncritical gaps and ask only about blockers',
    ja: '未指定。重要でない不足は仮定を明示し、不可欠な点だけ確認',
  }[locale];
  const sections = t.content.split('\n\n---META---\n\n');
  const selection = String(values[t.id === 'custom-programming' ? 'task' : 'medium'] || '');
  const group = t.id === 'custom-programming' ? 'programming' : 'visual';
  const selected = guides.find(g => g.group === group && Object.values(g.labels).includes(selection));
  const fallback = guides.find(g => g.id === (group === 'programming' ? 'build' : ['AI 动画','AI animation','AIアニメーション'].includes(selection) ? 'storyboard' : 'image'))!;
  const guide = (selected || fallback).guidance[locale];
  return (meta ? sections.join('\n\n') : sections[0]).replace('[[TASK_GUIDE]]', guide).replace(
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
