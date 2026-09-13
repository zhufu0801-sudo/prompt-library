import type { Template, Values, Locks, Field } from './prompt';
import guides from '../data/studio/task-guides.json' with { type: 'json' };
import inputs from '../data/studio/task-inputs.json' with { type: 'json' };
import originalScenarios from '../data/studio/scenarios.json' with { type: 'json' };
import curatedScenarios from '../data/studio/prompts-chat-curated.json' with { type: 'json' };
import adapters from '../data/studio/tool-adapters.json' with { type: 'json' };
import spatialScenarios from '../data/studio/spatial-scenarios.json' with { type: 'json' };
type Scenario = typeof originalScenarios[number] & {source?: typeof curatedScenarios[number]['source']};
const scenarios: Scenario[] = [...originalScenarios, ...curatedScenarios, ...spatialScenarios];
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
  const baseGuide = taskGuide(t, values).guidance[locale];
  const matches = meta ? analyzeTask(t, values, locale).scenarios : [];
  const adapter = toolAdapter(t, values);
  const scope = {zh:'以下基础规范只适用与当前任务直接相关的部分；以所选场景的交付物为准，不为单元测试等任务额外创建界面或接口。',en:'Apply base rules only where relevant to this task. Use the selected scenario’s deliverables; do not create unrelated UI or APIs for tasks such as unit tests.',ja:'基本要件は今回のタスクに関係する部分だけ適用し、選択シナリオの成果物を優先する。単体テストなどに不要な画面やAPIを追加しない。'}[locale];
  const guide = (matches.length ? scope+'\n\n' : '') + baseGuide + (matches.length ? '\n\n' + matches.map(x => x.labels[locale] + ': ' + x.details[locale]).join('\n\n') : '') + '\n\n' + adapter.labels[locale] + ': ' + adapter.guidance[locale];
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
        if (i >= 0) return next.options[i] ?? v;
        const guide = taskGuide(to, values);
        const targetLabel = to.fields.find(f => f.key === (to.id === 'custom-programming' ? 'task' : 'medium'))?.options[0];
        const firstGuide = guides.find(g => g.id === (to.id === 'custom-programming' ? 'build' : 'image'))!;
        const targetLocale = (Object.keys(firstGuide.labels) as Locale[]).find(l => firstGuide.labels[l] === targetLabel);
        if (targetLocale) {
          const localized = inputs[guide.id as keyof typeof inputs];
          for (const sourceLocale of ['zh', 'en', 'ja'] as Locale[]) {
            const sourceField = localized[sourceLocale][key as keyof typeof localized.zh];
            const targetField = localized[targetLocale][key as keyof typeof localized.zh];
            if (sourceField && targetField && 'options' in sourceField && 'options' in targetField) {
              const optionIndex = (sourceField.options as string[]).indexOf(v);
              if (optionIndex >= 0) return targetField.options[optionIndex] ?? v;
            }
          }
        }
        return v;
      };
      return [
        key,
        Array.isArray(value) ? value.map(translate) : translate(value),
      ];
    }),
  );
}

function taskGuide(t: Template, values: Values) {
  const selection = String(values[t.id === 'custom-programming' ? 'task' : 'medium'] || '');
  const group = t.id === 'custom-programming' ? 'programming' : 'visual';
  const selected = guides.find(g => g.group === group && Object.values(g.labels).includes(selection));
  const fallback = guides.find(g => g.id === (group === 'programming' ? 'build' : ['AI 动画','AI animation','AIアニメーション'].includes(selection) ? 'storyboard' : 'image'))!;
  return selected || fallback;

}

export function taskFields(t: Template, values: Values, locale: Locale): (Field & {placeholder?: string})[] {
  if (!studioIds.includes(t.id)) return t.fields;
  const overrides = inputs[taskGuide(t, values).id as keyof typeof inputs][locale] as Record<string, Partial<Field> & {placeholder?: string}>;
  const current = taskGuide(t, values).id;
  const selected = [...curatedScenarios, ...spatialScenarios].find(s=>s.task===current && Object.values(s.labels).includes(String(values.scenario || '')));
  return t.fields.map(f => {
    const field = {...f, ...overrides[f.key]};
    if (f.key === 'scenario') field.options = [f.options[0],...scenarios.filter(s=>s.task===current).map(s=>s.labels[locale])];
    if (f.key === 'subject' && selected) {
      field.options = [selected.examples[locale]];
      field.placeholder = selected.examples[locale];
    }
    return field;
  });
}

export function toolAdapter(t: Template, values: Values) {
  const group = t.id === 'custom-programming' ? 'programming' : 'visual';
  const options = adapters.filter(a=>a.group===group);
  return options.find(a=>Object.values(a.labels).includes(String(values.tool || ''))) || options[0];
}


const intentTerms: Record<string,string[]> = {
  build: ['实现','开发','implement','build','実装'],
  debug: ['报错','排错','故障','修复','debug','bug','error','不具合','エラー','修正'],
  review: ['审查','审计','review','audit','レビュー'],
  image: ['图片','海报','三视图','静态','image','poster','turnaround','静止画','画像','三面図'],
  clip: ['单镜头','首帧','图生视频','single shot','single-shot','first frame','image-to-video','単一カット','開始フレーム'],
  storyboard: ['分镜','多镜头','storyboard','multi-shot','絵コンテ','複数カット']
};
function matchedTerms(text: string, terms: string[]) {
  const lower = text.toLowerCase();
  return terms.filter(term => {
    if (/^[a-z -]+$/i.test(term)) return new RegExp('\\b'+term.trim().replace(/[- ]/g,'[- ]')+'\\b','i').test(lower);
    return lower.includes(term);
  });
}
export function analyzeTask(t: Template, values: Values, locale: Locale) {
  const subject = String(values.subject || '').trim();
  const current = taskGuide(t, values);
  const candidates = subject ? guides.filter(g => g.group === current.group).map(g => ({
    id:g.id, label:g.labels[locale], evidence:matchedTerms(subject,intentTerms[g.id] || [])
  })).filter(g => g.evidence.length).sort((a,b)=>b.evidence.length-a.evidence.length) : [];
  const selected = scenarios.find(s=>s.task===current.id && Object.values(s.labels).includes(String(values.scenario || '')));
  const matched = selected ? [{...selected,evidence:[{zh:'手动选择',en:'Selected by you',ja:'手動選択'}[locale]]}] : subject ? scenarios.filter(s => s.task === current.id).map(s => ({...s,evidence:matchedTerms(subject,s.terms)})).filter(s=>s.evidence.length).sort((a,b)=>b.evidence.length-a.evidence.length).slice(0,2) : [];
  return {current:current.id, candidates, scenarios:matched, missing:subject ? ['materials','criteria','constraints'].filter(k=>!String(values[k]||'').trim()) : []};
}
