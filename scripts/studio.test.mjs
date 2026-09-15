import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  composeStudio,
  taskFields,
  taskTemplates,
  analyzeTask,
  matchingSkills,
  recommendedSkills,
  applySkillRecommendation,
  briefQuestion,
  toolAdapter,
  translateValues,
  localeOf,
  studioIds,
} from '../lib/studio.ts';
import { defaultValues } from '../lib/prompt.ts';
const guides = JSON.parse(
  fs.readFileSync(
    new URL('../data/studio/task-guides.json', import.meta.url),
    'utf8',
  ),
);
test('Skill recommendations are localized, task-scoped and respect locks and ordinary mode', () => {
  for (const locale of ['zh', 'en', 'ja']) {
    const expected = [
      'systematic-debugging',
      'video',
      'image',
      'wps-formula',
      'copywriting',
      'scientific-writing',
    ];
    for (const [i, t] of load(locale).slice(0, 6).entries()) {
      const v = {
        ...defaultValues(t),
        subject:
          i === 0
            ? 'debug error Keep {{code}} exact'
            : i === 3
              ? '公式 formula Keep {{code}} exact'
              : 'Keep {{code}} exact',
        materials: 'My original source',
      };
      const r = recommendedSkills(t, v, locale);
      assert.equal(r[0]?.id, expected[i]);
      assert.ok(r.every((s) => s.tasks.includes(s.task)));
      const next = applySkillRecommendation(t, v, {}, locale, r[0].id);
      assert.equal(next.subject, v.subject);
      assert.equal(next.materials, v.materials);
      assert.equal(next.skill_id, expected[i]);
      assert.ok(composeStudio(t, next, locale).includes(r[0].source));
      assert.ok(
        !composeStudio(t, { ...next, skill_id: '' }, locale).includes(
          r[0].source,
        ),
      );
      assert.equal(
        applySkillRecommendation(t, v, { skill_id: true }, locale, r[0].id),
        v,
      );
      if (!r[0].currentTask)
        assert.equal(
          applySkillRecommendation(t, v, { task: true }, locale, r[0].id),
          v,
        );
      assert.equal(applySkillRecommendation(t, v, {}, locale, 'unknown'), v);
    }
  }
});
test('Skill suitability excludes specialized requests and unrelated task switches', () => {
  const cases = [
    ['zh', 3, 'WPS 表格', '做数据透视表'],
    ['en', 3, 'WPS Spreadsheet', 'Make a pivot table'],
    ['ja', 3, 'WPS 表計算', 'ピボットを作る'],
    ['zh', 2, '', '制作角色三视图'],
    ['en', 2, '', 'character turnaround'],
    ['ja', 2, '', 'キャラクターの三面図'],
    ['zh', 4, '', '写小红书社交媒体文案'],
    ['en', 4, '', 'Write a marketing email'],
    ['ja', 4, '', 'SNS投稿の文案'],
    ['zh', 5, '', '写一篇小说'],
  ];
  for (const [locale, index, task, subject] of cases) {
    const t = load(locale)[index],
      v = { ...defaultValues(t), ...(task ? { task } : {}), subject };
    assert.ok(!recommendedSkills(t, v, locale).some((s) => s.id === ({3: 'wps-formula', 2: 'image', 4: 'copywriting', 5: 'scientific-writing'}[index])), subject);
  }
  const t = load('en')[0],
    v = { ...defaultValues(t), subject: 'Build a backend only data service' };
  assert.equal(recommendedSkills(t, v, 'en').length, 0);
  const image = load('zh')[2],
    iv = { ...defaultValues(image), subject: '角色三视图', skill_id: 'image' };
  assert.ok(!composeStudio(image, iv, 'zh').includes('Skill 辅助说明'));
});
test('six modules preserve user input, localize each new task and scope Skills', () => {
  const extended = JSON.parse(
    fs.readFileSync(
      new URL('../data/studio/extended-tasks.json', import.meta.url),
      'utf8',
    ),
  );
  for (const locale of ['zh', 'en', 'ja']) {
    for (const g of extended) {
      const template = load(locale).find(
        (t) =>
          t.id ===
          {
            office: 'custom-office',
            copy: 'custom-copy',
            paper: 'custom-paper-writing',
          }[g.group],
      );
      const v = {
        ...defaultValues(template),
        task: g.labels[locale],
        subject: 'My exact brief {{style}}',
      };
      const output = composeStudio(template, v, locale);
      assert.ok(output.includes(g.guidance[locale]));
      assert.ok(output.includes(v.subject));
      assert.ok(!output.includes('[[TASK_GUIDE]]'));
      assert.equal(
        taskFields(template, v, locale).find((f) => f.key === 'subject')
          .placeholder,
        g.examples[locale],
      );
      assert.equal(
        taskFields(template, v, locale).find((f) => f.key === 'materials')
          .label,
        { zh: '已有资料', en: 'Available materials', ja: '提供資料' }[locale],
      );
      assert.equal(
        briefQuestion(template, v, locale).text,
        g.questions[locale],
      );
      assert.equal(
        briefQuestion(template, { ...v, materials: 'supplied' }, locale),
        null,
      );
      const en = load('en').find((t) => t.id === template.id);
      assert.equal(translateValues(template, en, v, {}).task, g.labels.en);
      assert.ok(
        !taskFields(template, v, locale).some((f) => f.key === 'skill_id'),
      );
    }
    const image = load(locale)[2],
      animation = load(locale)[1];
    assert.ok(
      !analyzeTask(
        image,
        { subject: 'storyboard 分镜' },
        locale,
      ).candidates.some((c) => c.id === 'storyboard'),
    );
    assert.ok(
      !analyzeTask(
        animation,
        { subject: 'image 图片' },
        locale,
      ).candidates.some((c) => c.id === 'image'),
    );
    const v = {
      ...defaultValues(image),
      subject: 'A mountain',
      skill_id: 'image',
    };
    assert.ok(matchingSkills(image, v).some((s) => s.id === 'image'));
    assert.ok(composeStudio(image, v, locale).includes('/skills/image'));
    assert.ok(
      !composeStudio(image, { ...v, skill_id: 'copywriting' }, locale).includes(
        '/skills/copywriting',
      ),
    );
    assert.ok(
      !composeStudio(image, { ...v, skill_id: '' }, locale).includes('GitHub'),
    );
  }
});
test('natural problem descriptions route to relevant tasks without weak or excluded matches', () => {
  const cases = [
    ['zh', 0, 'debug', '登录后一直跳转', 'auth-expiry'],
    ['en', 0, 'debug', 'same item appears twice', 'duplicate-list'],
    ['ja', 0, 'debug', '画面からはみ出す', 'responsive-layout'],
    ['zh', 1, 'clip', '想看手部细节', 'video-close'],
    ['en', 1, 'clip', 'show the whole setting', 'video-wide'],
    ['ja', 1, 'clip', '二人のやり取り', 'video-medium'],
    ['zh', 1, 'storyboard', '前后镜头场景变了', 'spatial-continuity'],
  ];
  for (const [l, i, task, subject, id] of cases) {
    const t = load(l)[i],
      key = i === 0 ? 'task' : 'medium';
    const v = {
      ...defaultValues(t),
      [key]: guides.find((g) => g.id === task).labels[l],
      subject,
    };
    assert.equal(analyzeTask(t, v, l).scenarios[0]?.id, id);
  }
  const t = load('en')[0],
    v = {
      ...defaultValues(t),
      subject: 'limit 4012',
      task: guides.find((g) => g.id === 'build').labels.en,
    };
  assert.equal(analyzeTask(t, v, 'en').scenarios.length, 0);
  assert.equal(
    analyzeTask(t, { ...v, subject: 'no need for pagination' }, 'en').scenarios
      .length,
    0,
  );
  assert.ok(
    analyzeTask(
      t,
      { ...v, subject: 'keeps redirecting to login' },
      'en',
    ).candidates.some((c) => c.id === 'debug'),
  );
});
test('everyday programming scenarios translate, preserve prose and filter by task', () => {
  const scenes = JSON.parse(
    fs.readFileSync(
      new URL('../data/studio/everyday-scenarios.json', import.meta.url),
      'utf8',
    ),
  );
  for (const locale of ['zh', 'en', 'ja'])
    for (const s of scenes) {
      const t = load(locale)[0],
        g = guides.find((g) => g.id === s.task);
      const v = {
        ...defaultValues(t),
        task: g.labels[locale],
        scenario: s.labels[locale],
        subject: 'User input {{materials}}',
      };
      assert.equal(analyzeTask(t, v, locale).scenarios[0].id, s.id);
      assert.ok(composeStudio(t, v, locale).includes(s.details[locale]));
      assert.ok(
        composeStudio(t, v, locale).includes('User input {{materials}}'),
      );
      assert.ok(
        !composeStudio(t, v, locale, false).includes(s.details[locale]),
      );
      assert.equal(
        taskFields(t, v, locale).find((f) => f.key === 'subject').placeholder,
        s.examples[locale],
      );
      assert.equal(
        translateValues(t, load('en')[0], v, {}).scenario,
        s.labels.en,
      );
      const other = guides.find(
        (g) => g.group === 'programming' && g.id !== s.task,
      );
      assert.ok(
        !taskFields(t, { ...v, task: other.labels[locale] }, locale)
          .find((f) => f.key === 'scenario')
          .options.includes(s.labels[locale]),
      );
    }
});
test('code and shot-size scenarios stay distinct and translate in every locale', () => {
  const scenes = JSON.parse(
    fs.readFileSync(
      new URL('../data/studio/code-and-shots.json', import.meta.url),
      'utf8',
    ),
  );
  for (const locale of ['zh', 'en', 'ja'])
    for (const s of scenes) {
      const g = guides.find((g) => g.id === s.task),
        t = load(locale)[g.group === 'programming' ? 0 : 1];
      const key = g.group === 'programming' ? 'task' : 'medium';
      const v = {
        ...defaultValues(t),
        [key]: g.labels[locale],
        scenario: s.labels[locale],
        subject: 'Custom subject {{materials}}',
      };
      assert.equal(analyzeTask(t, v, locale).scenarios[0].id, s.id);
      const output = composeStudio(t, v, locale);
      assert.ok(output.includes(s.details[locale]));
      assert.ok(output.includes('Custom subject {{materials}}'));
      assert.equal(
        taskFields(t, v, locale).find((f) => f.key === 'subject').placeholder,
        s.examples[locale],
      );
      assert.equal(
        translateValues(t, load('en')[g.group === 'programming' ? 0 : 1], v, {})
          .scenario,
        s.labels.en,
      );
      for (const other of scenes.filter((x) => x.id !== s.id))
        assert.ok(!output.includes(other.details[locale]));
    }
});
test('engineering scenarios compose and translate without crossing task boundaries', () => {
  const scenes = JSON.parse(
    fs.readFileSync(
      new URL('../data/studio/engineering-scenarios.json', import.meta.url),
      'utf8',
    ),
  );
  for (const locale of ['zh', 'en', 'ja'])
    for (const s of scenes) {
      const t = load(locale)[0],
        g = guides.find((g) => g.id === s.task);
      const v = {
        ...defaultValues(t),
        task: g.labels[locale],
        scenario: s.labels[locale],
        subject: 'Existing code {{materials}}',
      };
      assert.equal(analyzeTask(t, v, locale).scenarios[0].id, s.id);
      assert.ok(composeStudio(t, v, locale).includes(s.details[locale]));
      assert.ok(
        composeStudio(t, v, locale).includes('Existing code {{materials}}'),
      );
      assert.ok(
        !composeStudio(t, v, locale, false).includes(s.details[locale]),
      );
      assert.equal(
        taskFields(t, v, locale).find((f) => f.key === 'subject').placeholder,
        s.examples[locale],
      );
      assert.equal(
        translateValues(t, load('ja')[0], v, {}).scenario,
        s.labels.ja,
      );
      assert.ok(
        !analyzeTask(
          t,
          { ...v, task: guides.find((g) => g.id === 'review').labels[locale] },
          locale,
        ).scenarios.some((x) => x.id === s.id),
      );
    }
});
test('spatial workflows stay in their task, localize selection and preserve custom text', () => {
  const scenes = JSON.parse(
    fs.readFileSync(
      new URL('../data/studio/spatial-scenarios.json', import.meta.url),
      'utf8',
    ),
  );
  for (const locale of ['zh', 'en', 'ja'])
    for (const s of scenes) {
      const t = load(locale)[1],
        g = guides.find((g) => g.id === s.task);
      const v = {
        ...defaultValues(t),
        medium: g.labels[locale],
        scenario: s.labels[locale],
        subject: 'User brief {{materials}}',
      };
      assert.equal(analyzeTask(t, v, locale).scenarios[0].id, s.id);
      assert.ok(composeStudio(t, v, locale).includes(s.details[locale]));
      assert.ok(
        composeStudio(t, v, locale).includes('User brief {{materials}}'),
      );
      assert.ok(
        !composeStudio(t, v, locale, false).includes(s.details[locale]),
      );
      assert.equal(
        taskFields(t, v, locale).find((f) => f.key === 'subject').placeholder,
        s.examples[locale],
      );
      assert.equal(
        translateValues(t, load('en')[1], v, {}).scenario,
        s.labels.en,
      );
      const clip = {
        ...v,
        medium: guides.find((g) => g.id === 'clip').labels[locale],
      };
      assert.ok(
        !analyzeTask(t, clip, locale).scenarios.some((x) => x.id === s.id),
      );
    }
});
test('curated scenarios are localized, scoped, attributable and used in output', () => {
  const items = JSON.parse(
    fs.readFileSync(
      new URL('../data/studio/prompts-chat-curated.json', import.meta.url),
      'utf8',
    ),
  );
  assert.equal(items.length, 12);
  for (const locale of ['zh', 'en', 'ja'])
    for (const s of items) {
      const guide = guides.find((g) => g.id === s.task);
      const t = load(locale)[guide.group === 'programming' ? 0 : 1];
      const values = {
        ...defaultValues(t),
        [t.id === 'custom-programming' ? 'task' : 'medium']:
          guide.labels[locale],
        scenario: s.labels[locale],
        subject: 'My custom brief {{criteria}}',
      };
      assert.equal(analyzeTask(t, values, locale).scenarios[0].id, s.id);
      assert.ok(composeStudio(t, values, locale).includes(s.details[locale]));
      assert.ok(
        !composeStudio(t, values, locale, false).includes(s.details[locale]),
      );
      assert.ok(
        composeStudio(t, values, locale).includes(
          'My custom brief {{criteria}}',
        ),
      );
      assert.equal(
        taskFields(t, values, locale).find((f) => f.key === 'subject')
          .options[0],
        s.examples[locale],
      );
      assert.equal(s.source.license, 'CC0-1.0');
      const changed = {
        ...values,
        [t.id === 'custom-programming' ? 'task' : 'medium']: guides.find(
          (g) => g.group === guide.group && g.id !== guide.id,
        ).labels[locale],
      };
      assert.ok(
        !analyzeTask(t, changed, locale).scenarios.some((x) => x.id === s.id),
      );
    }
});
test('tool adapters remain task scoped and translate with saved choices', () => {
  for (const locale of ['zh', 'en', 'ja'])
    for (let i = 0; i < 2; i++) {
      const t = load(locale)[i];
      for (const tool of t.fields.find((f) => f.key === 'tool').options) {
        const values = { ...defaultValues(t), tool };
        assert.ok(
          composeStudio(t, values, locale, false).includes(
            toolAdapter(t, values).guidance[locale],
          ),
        );
        const translated = translateValues(t, load('en')[i], values, {});
        assert.equal(
          toolAdapter(t, values).id,
          toolAdapter(load('en')[i], translated).id,
        );
      }
    }
});
test('each task emits only its own deliverable rules in all three languages', () => {
  for (const locale of ['zh', 'en', 'ja'])
    for (const guide of guides) {
      const template = load(locale)[guide.group === 'programming' ? 0 : 1];
      const key = guide.group === 'programming' ? 'task' : 'medium';
      const output = composeStudio(
        template,
        {
          ...defaultValues(template),
          [key]: guide.labels[locale],
          subject: 'Example',
        },
        locale,
      );
      assert.ok(output.includes(guide.guidance[locale]));
      assert.ok(!output.includes('[[TASK_GUIDE]]'));
      for (const other of guides.filter((g) => g.id !== guide.id))
        assert.ok(!output.includes(other.guidance[locale]));
    }
  const old = composeStudio(
    load('zh')[1],
    { medium: 'AI 动画', subject: '旧方案' },
    'zh',
  );
  assert.ok(
    old.includes(guides.find((g) => g.id === 'storyboard').guidance.zh),
  );
});
const load = (l) =>
  ['', 'additional/', 'practical/', 'domain/'].flatMap((dir) =>
    JSON.parse(
      fs.readFileSync(
        new URL('../data/studio/' + dir + l + '.json', import.meta.url),
        'utf8',
      ),
    ),
  );

test('expanded tasks have distinct localized deliverables, examples and scoped Skills', () => {
  const tasks = JSON.parse(
    fs.readFileSync(
      new URL('../data/studio/additional-tasks.json', import.meta.url),
      'utf8',
    ),
  );
  for (const locale of ['zh', 'en', 'ja'])
    for (const g of tasks) {
      const t = load(locale).find(
        (t) =>
          t.id ===
          (g.group === 'programming'
            ? 'custom-programming'
            : 'studio-' + g.group),
      );
      assert.ok(t);
      const v = {
        ...defaultValues(t),
        task: g.labels[locale],
        subject: g.examples[locale],
      };
      const output = composeStudio(t, v, locale);
      assert.ok(output.includes(g.guidance[locale]));
      assert.ok(!output.includes('[[TASK_GUIDE]]'));
      assert.equal(
        taskFields(t, v, locale).find((f) => f.key === 'subject').placeholder,
        g.examples[locale],
      );
      for (const other of tasks.filter((x) => x.id !== g.id))
        assert.ok(!output.includes(other.guidance[locale]));
      if (g.id === 'frontend-ui')
        assert.ok(matchingSkills(t, v).some((s) => s.id === 'frontend-design'));
      if (g.id === 'content-roadmap')
        assert.ok(
          matchingSkills(t, v).some((s) => s.id === 'content-strategy'),
        );
    }
});

test('legacy templates compose their own fields without unrelated task guidance', () => {
  const t = {
    ...load('en')[0],
    id: 'legacy-example',
    content: 'Review {{code}}',
    fields: [],
  };
  assert.equal(
    composeStudio(t, { code: 'const x = "{{literal}}";' }, 'en'),
    'Review const x = "{{literal}}";',
  );
  assert.deepEqual(recommendedSkills(t, {}, 'en'), []);
});

test('60 practical task templates resolve correctly in all languages and preserve source input', () => {
  const tasks = JSON.parse(
    fs.readFileSync(
      new URL('../data/studio/practical-tasks.json', import.meta.url),
      'utf8',
    ),
  );
  const review = JSON.parse(
    fs.readFileSync(
      new URL(
        '../data/research-library/practical-source-review.json',
        import.meta.url,
      ),
      'utf8',
    ),
  );
  assert.equal(tasks.length, 60);
  for (const locale of ['zh', 'en', 'ja']) {
    const templates = load(locale),
      cards = taskTemplates(templates, locale);
    assert.equal(cards.length, 225);
    assert.equal(new Set(cards.map((c) => c.id)).size, 225);
    for (const task of tasks) {
      const card = cards.find((c) => c.id === task.id);
      assert.ok(card);
      const v = {
        ...defaultValues(card.template),
        [card.field]: card.value,
        subject: task.examples[locale],
        materials: 'Keep {{user_text}} unchanged',
      };
      const output = composeStudio(card.template, v, locale);
      assert.ok(output.includes(task.guidance[locale]));
      assert.ok(output.includes('Keep {{user_text}} unchanged'));
      assert.ok(!output.includes('[[TASK_GUIDE]]'));
      assert.equal(analyzeTask(card.template, v, locale).current, task.id);
      for (const other of tasks.filter(
        (x) => x.group === task.group && x.id !== task.id,
      ))
        assert.ok(!output.includes(other.guidance[locale]));
      assert.ok(
        task.sourceReferences.every((id) =>
          review.records.some((r) => r.id === id),
        ),
      );
      const target = load('ja').find((t) => t.id === card.template.id),
        translated = translateValues(card.template, target, v, {});
      assert.equal(translated.task, task.labels.ja);
      assert.equal(translated.materials, v.materials);
    }
  }
  const seed = JSON.parse(
    fs.readFileSync(
      new URL('../data/seed.generated.json', import.meta.url),
      'utf8',
    ),
  );
  assert.ok(
    seed.batches.every((b) => b.length <= 90),
    'seed batches must remain bounded as task resources grow',
  );
});
test('72 domain tasks have distinct localized deliverables and preserve task selection', () => {
  const tasks = JSON.parse(
    fs.readFileSync(
      new URL('../data/studio/domain-tasks.json', import.meta.url),
      'utf8',
    ),
  );
  assert.equal(tasks.length, 72);
  for (const locale of ['zh', 'en', 'ja']) {
    const templates = load(locale),
      cards = taskTemplates(templates, locale);
    assert.equal(templates.length, 57);
    assert.equal(new Set(tasks.map((t) => t.guidance[locale])).size, 72);
    for (const task of tasks) {
      const card = cards.find((c) => c.id === task.id);
      assert.ok(card);
      const values = {
        ...defaultValues(card.template),
        [card.field]: card.value,
        subject: task.examples[locale],
        materials: 'Literal {{subject}} remains user text',
      };
      const output = composeStudio(card.template, values, locale);
      assert.ok(output.includes(task.guidance[locale]));
      assert.ok(output.includes(values.materials));
      assert.ok(!output.includes('[[TASK_GUIDE]]'));
      assert.equal(analyzeTask(card.template, values, locale).current, task.id);
      for (const other of tasks.filter(
        (t) => t.group === task.group && t.id !== task.id,
      ))
        assert.ok(!output.includes(other.guidance[locale]));
      const target = load('en').find((t) => t.id === card.template.id);
      assert.equal(
        translateValues(card.template, target, values, {}).task,
        task.labels.en,
      );
      assert.equal(task.editorialStatus, 'original-task-brief');
      assert.deepEqual(task.sourceReferences, []);
    }
  }
});

test('three languages share field identities and option positions across every module', () => {
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
      items[1].fields.some((f) => f.key === 'medium' && f.options.length === 2),
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
  for (const locale of ['zh', 'en', 'ja']) {
    const samples = new Set();
    for (const guide of guides) {
      const template = load(locale)[guide.group === 'programming' ? 0 : 1];
      const key = guide.group === 'programming' ? 'task' : 'medium';
      const values = {
        ...defaultValues(template),
        [key]: guide.labels[locale],
        subject: 'my code',
        materials: 'my reference',
      };
      const before = structuredClone(values);
      const fields = taskFields(template, values, locale);
      const subject = fields.find((f) => f.key === 'subject');
      assert.equal(subject.options.length, 3);
      assert.equal(new Set(subject.options).size, 3);
      samples.add(subject.options[0]);
      for (const key of [
        'subject',
        'materials',
        'criteria',
        'constraints',
        'audience',
      ])
        assert.ok(fields.find((f) => f.key === key).placeholder);
      assert.deepEqual(values, before);
    }
    assert.equal(samples.size, 6);
  }
  const source = load('zh')[0],
    target = load('ja')[0];
  const values = {
    task: '错误排查',
    keywords: ['最小复现'],
    subject: 'do not translate my code',
  };
  assert.deepEqual(translateValues(source, target, values, {}).keywords, [
    '最小再現',
  ]);
  assert.deepEqual(
    translateValues(source, target, values, { keywords: true }).keywords,
    ['最小复现'],
  );
});

test('scenario guidance is task-scoped, optional and preserves literal user content', () => {
  const t = load('en')[0];
  const values = {
    ...defaultValues(t),
    subject: 'Build a CSV tool {{materials}}',
    materials: 'private input',
  };
  assert.equal(analyzeTask(t, values, 'en').scenarios[0].id, 'csv');
  assert.ok(composeStudio(t, values, 'en').includes('row-level errors'));
  assert.ok(
    !composeStudio(t, values, 'en', false).includes('row-level errors'),
  );
  assert.ok(composeStudio(t, values, 'en').includes('{{materials}}'));
  assert.equal(
    analyzeTask(t, { ...values, task: 'Code review' }, 'en').scenarios.length,
    0,
  );
  assert.equal(
    analyzeTask(t, { ...values, subject: 'address' }, 'en').scenarios.length,
    0,
  );
  assert.equal(
    analyzeTask(t, { ...values, subject: '' }, 'en').candidates.length,
    0,
  );
  for (const locale of ['zh', 'en', 'ja']) {
    const template = load(locale)[2];
    const analysis = analyzeTask(
      template,
      { ...defaultValues(template), subject: 'turnaround 三视图 三面図' },
      locale,
    );
    assert.equal(analysis.scenarios[0].id, 'turnaround');
    assert.ok(analysis.scenarios[0].details[locale]);
  }
});
