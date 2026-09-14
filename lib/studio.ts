import type { Template, Values, Locks, Field } from './prompt';
import baseGuides from '../data/studio/task-guides.json' with { type: 'json' };
import originalExtendedTasks from '../data/studio/extended-tasks.json' with { type: 'json' };
import additionalTasks from '../data/studio/additional-tasks.json' with { type: 'json' };
import { compose } from './prompt.ts';
const extendedTasks = [...originalExtendedTasks, ...additionalTasks];
import skillCatalog from '../data/studio/skills.json' with { type: 'json' };
import skillFit from '../data/studio/skill-fit.json' with { type: 'json' };
import inputs from '../data/studio/task-inputs.json' with { type: 'json' };
import originalScenarios from '../data/studio/scenarios.json' with { type: 'json' };
import curatedScenarios from '../data/studio/prompts-chat-curated.json' with { type: 'json' };
import adapters from '../data/studio/tool-adapters.json' with { type: 'json' };
import spatialScenarios from '../data/studio/spatial-scenarios.json' with { type: 'json' };
import engineeringScenarios from '../data/studio/engineering-scenarios.json' with { type: 'json' };
import codeAndShots from '../data/studio/code-and-shots.json' with { type: 'json' };
import everydayScenarios from '../data/studio/everyday-scenarios.json' with { type: 'json' };
import {termEvidence, scenarioEvidence} from './matching.ts';
type Scenario = typeof originalScenarios[number] & {source?: typeof curatedScenarios[number]['source']};
const scenarios: Scenario[] = [...originalScenarios, ...curatedScenarios, ...spatialScenarios, ...engineeringScenarios, ...codeAndShots, ...everydayScenarios];
const guides = [...baseGuides,...extendedTasks];
export type Locale = 'zh' | 'en' | 'ja';
export const studioIds = ['custom-programming', 'custom-animation', 'custom-image', 'custom-office', 'custom-copy', 'custom-paper-writing', 'studio-writing', 'studio-learning', 'studio-language', 'studio-life', 'studio-creative', 'studio-business', 'studio-thinking'];
export function taskKey(t:Template) {return ['custom-animation','custom-image'].includes(t.id)?'medium':'task';}
export function moduleGroup(t:Template) {return t.id.startsWith('studio-') ? t.id.slice(7) : ({'custom-office':'office','custom-copy':'copy','custom-paper-writing':'paper','custom-programming':'programming'} as Record<string,string>)[t.id] || 'visual';}
function visibleGuides(t:Template) {
 return guides.filter(g=>g.group===moduleGroup(t) && (t.id==='custom-image'?g.id==='image':t.id==='custom-animation'?g.id!=='image':true));
}
export function localeOf(value: string | null): Locale {
  return value === 'en' || value === 'ja' ? value : 'zh';
}
export function composeStudio(
  t: Template,
  values: Values,
  locale: Locale,
  meta = true,
) {
  if (!studioIds.includes(t.id)) return compose(t,values);
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
  const text = (meta ? sections.join('\n\n') : sections[0]).replace('[[TASK_GUIDE]]', guide).replace(
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
  const skill = matchingSkills(t,values).find(s=>s.id===values.skill_id);
  if(!skill) return text;
  return text+'\n\n'+{zh:'Skill 辅助说明',en:'Skill-assisted instructions',ja:'Skill 補助指示'}[locale]+': '+skill.labels[locale]+'\n'+skill.source+'\n'+{
   zh:'仅在已导入该 Skill 且当前工具支持时应用其中与任务相关的步骤。尚未安装时，仍按上述提示词交付内容。遵守用户资料与事实边界，不套用上游示例数字；先核对目标工具的当前功能，未经确认不调用付费工具、不执行命令、不输出秘密信息。请用中文回答。',
   en:'Apply relevant steps only if this Skill is imported and supported. Otherwise fulfill the prompt above. Preserve user facts; never treat upstream example numbers as evidence. Verify current tool capabilities; do not invoke paid tools, execute commands or expose secrets without appropriate authorization. Answer in English.',
   ja:'導入済みかつ対応ツールの場合だけ関連手順を適用し、それ以外は上記プロンプトに従う。提供事実を保ち、上流の例示数値を根拠扱いしない。現在の機能を確認し、承認なしの有料操作・コマンド実行・秘密情報出力をしない。日本語で回答する。'
  }[locale];
}
function fitsBrief(id:string,values:Values){
 const rule=skillFit[id as keyof typeof skillFit];
 return !rule || !termEvidence(String(values.subject||''),rule.exclude).length;
}
export function matchingSkills(t:Template,values:Values){return skillCatalog.filter(s=>s.tasks.includes(taskGuide(t,values).id)&&fitsBrief(s.id,values));}
export function recommendedSkills(t:Template,values:Values,locale:Locale){
 if(!studioIds.includes(t.id)) return [];
 const current=taskGuide(t,values),available=visibleGuides(t),subject=String(values.subject||'').trim();
 const detected=subject?analyzeTask(t,values,locale).candidates:[];
 return skillCatalog.flatMap(s=>{
  const target=s.tasks.includes(current.id)?current:available.find(g=>s.tasks.includes(g.id));
  if(!target || !fitsBrief(s.id,values) || (subject&&target.id!==current.id&&!detected.some(g=>s.tasks.includes(g.id))))return [];
  return [{...s,task:target.id,taskLabel:target.labels[locale],currentTask:target.id===current.id,scope:skillFit[s.id as keyof typeof skillFit]?.scope[locale]||''}];
 }).sort((a,b)=>Number(b.currentTask)-Number(a.currentTask));
}
export function applySkillRecommendation(t:Template,values:Values,locks:Locks,locale:Locale,id:string):Values {
 const skill=recommendedSkills(t,values,locale).find(s=>s.id===id);
 if(!skill || locks.skill_id || (!skill.currentTask && locks[taskKey(t)])) return values;
 return {...values,skill_id:id,...(!skill.currentTask?{[taskKey(t)]:skill.taskLabel,...(!locks.scenario?{scenario:t.fields.find(f=>f.key==='scenario')?.options[0]||''}:{})}:{})};
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
        const targetLabel = to.fields.find(f => f.key === taskKey(to))?.options[0];
        const firstGuide = guides.find(g=>Object.values(g.labels).includes(targetLabel || ''))!;
        const targetLocale = firstGuide && (Object.keys(firstGuide.labels) as Locale[]).find(l => firstGuide.labels[l] === targetLabel);
        if (targetLocale) {
          const localized = inputs[guide.id as keyof typeof inputs];
          if (!localized) return v;
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
  const selection = String(values[taskKey(t)] || '');
  const group = moduleGroup(t);
  const selected = guides.find(g => g.group === group && Object.values(g.labels).includes(selection));
  const fallback = ['AI 动画','AI animation','AIアニメーション'].includes(selection)?baseGuides.find(g=>g.id==='storyboard')!:visibleGuides(t)[0] || baseGuides[0];
  return selected || fallback;

}

export function taskFields(t: Template, values: Values, locale: Locale): (Field & {placeholder?: string})[] {
  if (!studioIds.includes(t.id)) return t.fields;
  const guide=taskGuide(t,values);
  const extension=extendedTasks.find(g=>g.id===guide.id);
  const overrides = (inputs[guide.id as keyof typeof inputs]?.[locale] || {}) as Record<string, Partial<Field> & {placeholder?: string}>;
  const current = taskGuide(t, values).id;
  const selected = [...curatedScenarios, ...spatialScenarios, ...engineeringScenarios, ...codeAndShots, ...everydayScenarios].find(s=>s.task===current && Object.values(s.labels).includes(String(values.scenario || '')));
  return t.fields.filter(f=>f.key!=='skill_id').map(f => {
    const field = {...f, ...overrides[f.key]};
    if (extension && f.key==='subject') {field.options=[extension.examples[locale]];field.placeholder=extension.examples[locale];}
    if (extension && f.key==='materials') field.placeholder=extension.questions[locale];
    if (f.key === 'scenario') field.options = [f.options[0],...scenarios.filter(s=>s.task===current).map(s=>s.labels[locale])];
    if (f.key === 'subject' && selected) {
      field.options = [selected.examples[locale]];
      field.placeholder = selected.examples[locale];
    }
    return field;
  });
}

export function toolAdapter(t: Template, values: Values) {
  const group = moduleGroup(t);
  if (!['programming','visual'].includes(group)) return {id:'general-chat',labels:{zh:'通用对话AI',en:'General chat AI',ja:'汎用対話AI'},guidance:{zh:'按目标软件和版本提供内容；没有文件操作能力时交付可复制正文及步骤，不声称已制作或修改文件。',en:'Match the target software/version. Without file tools, provide copyable content and steps rather than claiming file creation or edits.',ja:'対象ソフトと版に合わせる。ファイル操作機能がなければ貼付用本文と手順を出し、制作・修正済みとしない。'}};
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
  return termEvidence(text,terms);
}
export function analyzeTask(t: Template, values: Values, locale: Locale) {
  const subject = String(values.subject || '').trim();
  const current = taskGuide(t, values);
  const ranked = subject ? scenarios.map(s=>({...s,...scenarioEvidence(subject,s.id,s.terms)})).filter(s=>s.score>=2).sort((a,b)=>b.score-a.score) : [];
  const candidates = subject ? visibleGuides(t).map(g => ({
    id:g.id, label:g.labels[locale], evidence:[...new Set([...matchedTerms(subject,intentTerms[g.id] || extendedTasks.find(x=>x.id===g.id)?.terms || []),...ranked.filter(s=>s.task===g.id).slice(0,1).flatMap(s=>s.evidence)])]
  })).filter(g => g.evidence.length).sort((a,b)=>b.evidence.length-a.evidence.length) : [];
  const selected = scenarios.find(s=>s.task===current.id && Object.values(s.labels).includes(String(values.scenario || '')));
  const matched = selected ? [{...selected,evidence:[{zh:'手动选择',en:'Selected by you',ja:'手動選択'}[locale]]}] : ranked.filter(s=>s.task===current.id).slice(0,1);
  return {current:current.id, candidates, scenarios:matched, missing:subject ? ['materials','criteria','constraints'].filter(k=>!String(values[k]||'').trim()) : []};
}

export function briefQuestion(t:Template,values:Values,locale:Locale) {
 const guide=taskGuide(t,values),ext=extendedTasks.find(x=>x.id===guide.id);
 if(!String(values.subject||'').trim()) return {key:'subject',text:{zh:'先写一句话：你想完成什么？',en:'Start with one sentence: what do you want to achieve?',ja:'まず一文で、何をしたいか教えてください。'}[locale]};
 if(String(values.materials||'').trim()) return null;
 const text=String(values.subject||'');
 if(guide.id==='debug' && /```|traceback|stack trace|at \w+.*:\d+|报错[：:]\s*\S+/i.test(text)) return null;
 if(['clip','storyboard'].includes(guide.id) && /\d+\s*(秒|seconds?|sec|s\b)/i.test(text)) return null;
 if(ext && /资料[：:]|原文[：:]|data:|source:|資料[:：]/i.test(text))return null;
 const questions:Record<string,string[]>={
 debug:['请补充报错原文、相关代码和运行环境；已写在需求里就不用重复。','Add the exact error, relevant code and environment; omit anything already supplied.','エラー原文、関連コード、環境を補足。既出なら重複不要です。'],
 image:['有没有参考图？希望的画幅和需要保持不变的主体是什么？','Do you have a reference image? What aspect ratio and subject must be preserved?','参照画像はありますか？比率と固定する被写体を教えてください。'],
 clip:['这段视频多长？从参考图开始，还是先构思首帧？','How long is the clip, and is there an input image or should we plan one?','尺は何秒ですか？参照画像から始めますか？'],
 storyboard:['总时长、故事梗概和已有角色资料是什么？','What are the total duration, story and existing character references?','総尺、物語、人物資料を教えてください。']};
 const fallback=['有哪些已有资料或不可改变的要求？','What existing materials or fixed requirements should be used?','既存資料や変更できない条件は何ですか？'];
 return {key:'materials',text:ext?ext.questions[locale]:(questions[guide.id]||fallback)[['zh','en','ja'].indexOf(locale)]};
}
