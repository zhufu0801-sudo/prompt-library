import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  composeStudio,
  taskFields,
  analyzeTask,
  toolAdapter,
  translateValues,
  localeOf,
  studioIds,
} from '../lib/studio.ts';
import { defaultValues } from '../lib/prompt.ts';
const guides = JSON.parse(fs.readFileSync(new URL('../data/studio/task-guides.json',import.meta.url),'utf8'));
test('natural problem descriptions route to relevant tasks without weak or excluded matches',()=>{
 const cases=[['zh',0,'debug','登录后一直跳转','auth-expiry'],['en',0,'debug','same item appears twice','duplicate-list'],['ja',0,'debug','画面からはみ出す','responsive-layout'],['zh',1,'clip','想看手部细节','video-close'],['en',1,'clip','show the whole setting','video-wide'],['ja',1,'clip','二人のやり取り','video-medium'],['zh',1,'storyboard','前后镜头场景变了','spatial-continuity']];
 for(const [l,i,task,subject,id] of cases){
  const t=load(l)[i],key=i===0?'task':'medium';
  const v={...defaultValues(t),[key]:guides.find(g=>g.id===task).labels[l],subject};
  assert.equal(analyzeTask(t,v,l).scenarios[0]?.id,id);
 }
 const t=load('en')[0],v={...defaultValues(t),subject:'limit 4012',task:guides.find(g=>g.id==='build').labels.en};
 assert.equal(analyzeTask(t,v,'en').scenarios.length,0);
 assert.equal(analyzeTask(t,{...v,subject:'no need for pagination'},'en').scenarios.length,0);
 assert.ok(analyzeTask(t,{...v,subject:'keeps redirecting to login'},'en').candidates.some(c=>c.id==='debug'));
});
test('everyday programming scenarios translate, preserve prose and filter by task',()=>{
 const scenes=JSON.parse(fs.readFileSync(new URL('../data/studio/everyday-scenarios.json',import.meta.url),'utf8'));
 for(const locale of ['zh','en','ja']) for(const s of scenes) {
  const t=load(locale)[0],g=guides.find(g=>g.id===s.task);
  const v={...defaultValues(t),task:g.labels[locale],scenario:s.labels[locale],subject:'User input {{materials}}'};
  assert.equal(analyzeTask(t,v,locale).scenarios[0].id,s.id);
  assert.ok(composeStudio(t,v,locale).includes(s.details[locale]));
  assert.ok(composeStudio(t,v,locale).includes('User input {{materials}}'));
  assert.ok(!composeStudio(t,v,locale,false).includes(s.details[locale]));
  assert.equal(taskFields(t,v,locale).find(f=>f.key==='subject').placeholder,s.examples[locale]);
  assert.equal(translateValues(t,load('en')[0],v,{}).scenario,s.labels.en);
  const other=guides.find(g=>g.group==='programming'&&g.id!==s.task);
  assert.ok(!taskFields(t,{...v,task:other.labels[locale]},locale).find(f=>f.key==='scenario').options.includes(s.labels[locale]));
 }
});
test('code and shot-size scenarios stay distinct and translate in every locale',()=>{
 const scenes=JSON.parse(fs.readFileSync(new URL('../data/studio/code-and-shots.json',import.meta.url),'utf8'));
 for(const locale of ['zh','en','ja']) for(const s of scenes) {
  const g=guides.find(g=>g.id===s.task),t=load(locale)[g.group==='programming'?0:1];
  const key=g.group==='programming'?'task':'medium';
  const v={...defaultValues(t),[key]:g.labels[locale],scenario:s.labels[locale],subject:'Custom subject {{materials}}'};
  assert.equal(analyzeTask(t,v,locale).scenarios[0].id,s.id);
  const output=composeStudio(t,v,locale);
  assert.ok(output.includes(s.details[locale]));
  assert.ok(output.includes('Custom subject {{materials}}'));
  assert.equal(taskFields(t,v,locale).find(f=>f.key==='subject').placeholder,s.examples[locale]);
  assert.equal(translateValues(t,load('en')[g.group==='programming'?0:1],v,{}).scenario,s.labels.en);
  for(const other of scenes.filter(x=>x.id!==s.id)) assert.ok(!output.includes(other.details[locale]));
 }
});
test('engineering scenarios compose and translate without crossing task boundaries',()=>{
 const scenes=JSON.parse(fs.readFileSync(new URL('../data/studio/engineering-scenarios.json',import.meta.url),'utf8'));
 for(const locale of ['zh','en','ja']) for(const s of scenes) {
  const t=load(locale)[0],g=guides.find(g=>g.id===s.task);
  const v={...defaultValues(t),task:g.labels[locale],scenario:s.labels[locale],subject:'Existing code {{materials}}'};
  assert.equal(analyzeTask(t,v,locale).scenarios[0].id,s.id);
  assert.ok(composeStudio(t,v,locale).includes(s.details[locale]));
  assert.ok(composeStudio(t,v,locale).includes('Existing code {{materials}}'));
  assert.ok(!composeStudio(t,v,locale,false).includes(s.details[locale]));
  assert.equal(taskFields(t,v,locale).find(f=>f.key==='subject').placeholder,s.examples[locale]);
  assert.equal(translateValues(t,load('ja')[0],v,{}).scenario,s.labels.ja);
  assert.ok(!analyzeTask(t,{...v,task:guides.find(g=>g.id==='review').labels[locale]},locale).scenarios.some(x=>x.id===s.id));
 }
});
test('spatial workflows stay in their task, localize selection and preserve custom text',()=>{
 const scenes=JSON.parse(fs.readFileSync(new URL('../data/studio/spatial-scenarios.json',import.meta.url),'utf8'));
 for(const locale of ['zh','en','ja']) for(const s of scenes) {
  const t=load(locale)[1], g=guides.find(g=>g.id===s.task);
  const v={...defaultValues(t),medium:g.labels[locale],scenario:s.labels[locale],subject:'User brief {{materials}}'};
  assert.equal(analyzeTask(t,v,locale).scenarios[0].id,s.id);
  assert.ok(composeStudio(t,v,locale).includes(s.details[locale]));
  assert.ok(composeStudio(t,v,locale).includes('User brief {{materials}}'));
  assert.ok(!composeStudio(t,v,locale,false).includes(s.details[locale]));
  assert.equal(taskFields(t,v,locale).find(f=>f.key==='subject').placeholder,s.examples[locale]);
  assert.equal(translateValues(t,load('en')[1],v,{}).scenario,s.labels.en);
  const clip={...v,medium:guides.find(g=>g.id==='clip').labels[locale]};
  assert.ok(!analyzeTask(t,clip,locale).scenarios.some(x=>x.id===s.id));
 }
});
test('curated scenarios are localized, scoped, attributable and used in output',()=>{
 const items=JSON.parse(fs.readFileSync(new URL('../data/studio/prompts-chat-curated.json',import.meta.url),'utf8'));
 assert.equal(items.length,12);
 for(const locale of ['zh','en','ja']) for(const s of items) {
  const guide=guides.find(g=>g.id===s.task);
  const t=load(locale)[guide.group==='programming'?0:1];
  const values={...defaultValues(t),[t.id==='custom-programming'?'task':'medium']:guide.labels[locale],scenario:s.labels[locale],subject:'My custom brief {{criteria}}'};
  assert.equal(analyzeTask(t,values,locale).scenarios[0].id,s.id);
  assert.ok(composeStudio(t,values,locale).includes(s.details[locale]));
  assert.ok(!composeStudio(t,values,locale,false).includes(s.details[locale]));
  assert.ok(composeStudio(t,values,locale).includes('My custom brief {{criteria}}'));
  assert.equal(taskFields(t,values,locale).find(f=>f.key==='subject').options[0],s.examples[locale]);
  assert.equal(s.source.license,'CC0-1.0');
  const changed={...values,[t.id==='custom-programming'?'task':'medium']:guides.find(g=>g.group===guide.group&&g.id!==guide.id).labels[locale]};
  assert.ok(!analyzeTask(t,changed,locale).scenarios.some(x=>x.id===s.id));
 }
});
test('tool adapters remain task scoped and translate with saved choices',()=>{
 for(const locale of ['zh','en','ja']) for(let i=0;i<2;i++) {
  const t=load(locale)[i];
  for(const tool of t.fields.find(f=>f.key==='tool').options) {
   const values={...defaultValues(t),tool};
   assert.ok(composeStudio(t,values,locale,false).includes(toolAdapter(t,values).guidance[locale]));
   const translated=translateValues(t,load('en')[i],values,{});
   assert.equal(toolAdapter(t,values).id,toolAdapter(load('en')[i],translated).id);
  }
 }
});
test('each task emits only its own deliverable rules in all three languages', () => {
  for (const locale of ['zh','en','ja']) for (const guide of guides) {
    const template = load(locale)[guide.group === 'programming' ? 0 : 1];
    const key = guide.group === 'programming' ? 'task' : 'medium';
    const output = composeStudio(template,{...defaultValues(template),[key]:guide.labels[locale],subject:'Example'},locale);
    assert.ok(output.includes(guide.guidance[locale]));
    assert.ok(!output.includes('[[TASK_GUIDE]]'));
    for (const other of guides.filter(g=>g.id!==guide.id)) assert.ok(!output.includes(other.guidance[locale]));
  }
  const old = composeStudio(load('zh')[1],{medium:'AI 动画',subject:'旧方案'},'zh');
  assert.ok(old.includes(guides.find(g=>g.id==='storyboard').guidance.zh));
});
const load = (l) =>
  JSON.parse(
    fs.readFileSync(
      new URL('../data/studio/' + l + '.json', import.meta.url),
      'utf8',
    ),
  );
test('three languages share field identities, option positions and two featured templates', () => {
  const zh = load('zh');
  for (const locale of ['zh', 'en', 'ja']) {
    const items = load(locale);
    assert.deepEqual(
      items.map((x) => x.id),
      studioIds,
    );
    items.forEach((t, i) => {
      assert.deepEqual(
        t.fields.map((f) => f.key),
        zh[i].fields.map((f) => f.key),
      );
      assert.deepEqual(
        t.fields.map((f) => f.options.length),
        zh[i].fields.map((f) => f.options.length),
      );
      const result = composeStudio(
        t,
        { ...defaultValues(t), subject: 'user input {{style}}' },
        locale,
      );
      assert.ok(result.includes('user input {{style}}'));
      assert.ok(!result.includes('---META---'));
      assert.ok(
        result.length >
          composeStudio(t, defaultValues(t), locale, false).length,
      );
    });
    assert.ok(
      items[1].fields.some((f) => f.key === 'medium' && f.options.length === 3),
    );
  }
  assert.equal(localeOf('de'), 'zh');
});
test('translate known options but preserve prose and locked fields', () => {
  const from = load('zh')[1],
    to = load('ja')[1],
    v = {
      ...defaultValues(from),
      subject: 'Keep my exact words',
      constraints: 'user context',
    };
  const result = translateValues(from, to, v, { style: true });
  assert.equal(result.subject, v.subject);
  assert.equal(result.constraints, v.constraints);
  assert.equal(result.style, v.style);
  assert.equal(result.medium, to.fields[0].defaultValue);
  assert.deepEqual(
    result.keywords,
    to.fields.find((f) => f.key === 'keywords').defaultValue,
  );
});


test('task input hints and samples stay specific without changing entered values', () => {
  for (const locale of ['zh','en','ja']) {
    const samples = new Set();
    for (const guide of guides) {
      const template = load(locale)[guide.group === 'programming' ? 0 : 1];
      const key = guide.group === 'programming' ? 'task' : 'medium';
      const values = {...defaultValues(template), [key]:guide.labels[locale], subject:'my code', materials:'my reference'};
      const before = structuredClone(values);
      const fields = taskFields(template, values, locale);
      const subject = fields.find(f=>f.key==='subject');
      assert.equal(subject.options.length, 3);
      assert.equal(new Set(subject.options).size, 3);
      samples.add(subject.options[0]);
      for (const key of ['subject','materials','criteria','constraints','audience']) assert.ok(fields.find(f=>f.key===key).placeholder);
      assert.deepEqual(values,before);
    }
    assert.equal(samples.size,6);
  }
  const source = load('zh')[0], target=load('ja')[0];
  const values = {task:'错误排查',keywords:['最小复现'],subject:'do not translate my code'};
  assert.deepEqual(translateValues(source,target,values,{}).keywords,['最小再現']);
  assert.deepEqual(translateValues(source,target,values,{keywords:true}).keywords,['最小复现']);
});

test('scenario guidance is task-scoped, optional and preserves literal user content',()=>{
  const t=load('en')[0];
  const values={...defaultValues(t),subject:'Build a CSV tool {{materials}}',materials:'private input'};
  assert.equal(analyzeTask(t,values,'en').scenarios[0].id,'csv');
  assert.ok(composeStudio(t,values,'en').includes('row-level errors'));
  assert.ok(!composeStudio(t,values,'en',false).includes('row-level errors'));
  assert.ok(composeStudio(t,values,'en').includes('{{materials}}'));
  assert.equal(analyzeTask(t,{...values,task:'Code review'},'en').scenarios.length,0);
  assert.equal(analyzeTask(t,{...values,subject:'address'},'en').scenarios.length,0);
  assert.equal(analyzeTask(t,{...values,subject:''},'en').candidates.length,0);
  for (const locale of ['zh','en','ja']) {
    const template=load(locale)[1];
    const analysis=analyzeTask(template,{...defaultValues(template),subject:'turnaround 三视图 三面図'},locale);
    assert.equal(analysis.scenarios[0].id,'turnaround');
    assert.ok(analysis.scenarios[0].details[locale]);
  }
});
