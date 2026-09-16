import { skillsForTask } from '../lib/studio.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { analyzeCare, composeCare, careIntents } from '../lib/care.ts';
import {
  taskTemplates,
  composeStudio,
  matchingSkills,
  translateValues,
} from '../lib/studio.ts';
import { defaultValues } from '../lib/prompt.ts';
const read = (p) =>
  JSON.parse(fs.readFileSync(new URL('../' + p, import.meta.url), 'utf8'));
const load = (l) =>
  ['', 'additional/', 'practical/', 'domain/'].flatMap((d) =>
    read('data/studio/' + d + l + '.json'),
  );
test('care handles ordinary phrases in three languages and flags ambiguity', () => {
  const cases = [
    ['给孙女写生日祝福', 'greeting'],
    ['教我发手机里的照片', 'phone'],
    ['两个人晚饭怎么做', 'cooking'],
    ['去旅游每天少走路', 'travel'],
    ['这条消息是不是诈骗', 'check'],
    ['解释这份说明书', 'explain'],
    ['Write a birthday greeting for my granddaughter', 'greeting'],
    ['Help me cook dinner', 'cooking'],
    ['スマホの使い方', 'phone'],
    ['孫の誕生日のお祝い', 'greeting'],
    ['献立を考えて', 'cooking'],
  ];
  for (const [text, id] of cases)
    assert.ok(
      analyzeCare(text).candidates.some((c) => c.intent.id === id),
      text,
    );
  assert.equal(analyzeCare('帮我弄一下那个东西').unmatched, true);
  assert.equal(analyzeCare('教我做饭，再给孙女写生日祝福').ambiguous, true);
  assert.equal(
    analyzeCare('help me repair a carpet').unmatched,
    true,
    'English words must not match partial substrings',
  );
});
test('care suppresses local negations instead of silently choosing a rejected goal', () => {
  for (const text of ['不要做饭', '不想旅游', 'do not cook', '旅行はしない'])
    assert.equal(analyzeCare(text).unmatched, true, text);
  const result = analyzeCare('不想做饭，给孙女写生日祝福');
  assert.ok(!result.candidates.some((c) => c.intent.id === 'cooking'));
  assert.ok(result.candidates.some((c) => c.intent.id === 'greeting'));
});
test('care preserves literal requests and renders only the confirmed intent and response style', () => {
  for (const locale of ['zh', 'en', 'ja'])
    for (const intent of careIntents) {
      const original =
        '我不吃花生，预算50元；保留 {{原话}} <script>not executed</script>。';
      const output = composeCare(
        original,
        intent.id,
        'Only use my supplied facts',
        locale,
        'steps',
      );
      assert.ok(output.includes(original));
      assert.ok(output.includes('Only use my supplied facts'));
      assert.ok(output.includes(intent.rule[locale]));
      for (const other of careIntents.filter((i) => i.id !== intent.id))
        assert.ok(!output.includes(other.rule[locale]));
      assert.notEqual(
        output,
        composeCare(
          original,
          intent.id,
          'Only use my supplied facts',
          locale,
          'short',
        ),
      );
    }
});
test('all 72 focused tasks compose distinctly, translate choices and persist in content seed', () => {
  const tasks = read('data/studio/deep-tasks.json');
  assert.equal(tasks.length, 72);
  const seed = read('data/seed.generated.json');
  for (const locale of ['zh', 'en', 'ja']) {
    const cards = taskTemplates(load(locale), locale);
    assert.equal(cards.length, 237);
    assert.equal(new Set(cards.map((c) => c.id)).size, 237);
    for (const task of tasks) {
      const card = cards.find((c) => c.id === task.id);
      assert.ok(card, task.id);
      const values = {
        ...defaultValues(card.template),
        [card.field]: card.value,
        subject: 'Specific request',
        materials: 'Keep {{literal}}',
      };
      const output = composeStudio(card.template, values, locale);
      assert.ok(output.includes(task.guidance[locale]));
      assert.ok(output.includes(values.materials));
      const target = load('ja').find((t) => t.id === card.template.id);
      assert.equal(
        translateValues(card.template, target, values, {}).task,
        task.labels.ja,
      );
      assert.ok(
        seed.batches
          .flat()
          .some(
            (r) =>
              r.sql.startsWith('INSERT INTO task_resources') &&
              r.args[0] === task.id,
          ),
      );
    }
  }
});
test('every Skill fits its declared task and excludes incompatible details in all input fields', () => {
  const skills = read('data/studio/skills.json'),
    fit = read('data/studio/skill-fit.json');
  for (const locale of ['zh', 'en', 'ja']) {
    const cards = taskTemplates(load(locale), locale);
    for (const skill of skills)
      for (const id of [...skill.tasks, ...fit[skill.id].additionalTasks]) {
        const card = cards.find((c) => c.id === id);
        if (id.startsWith('edit-')) {
          assert.ok(skillsForTask(id, {}).some((s) => s.id === skill.id));
          continue;
        }
        assert.ok(card, id);
        const values = {
          ...defaultValues(card.template),
          [card.field]: card.value,
        };
        assert.ok(
          matchingSkills(card.template, values).some((s) => s.id === skill.id),
          skill.id + ' ' + id,
        );
        if (fit[skill.id].exclude.length)
          for (const key of [
            'subject',
            'constraints',
            'materials',
            'criteria',
            'keywords',
          ])
            assert.ok(
              !matchingSkills(card.template, {
                ...values,
                [key]: fit[skill.id].exclude[0],
              }).some((s) => s.id === skill.id),
              skill.id + ' ' + key,
            );
      }
  }
  const office = load('zh').find((t) => t.id === 'custom-office');
  assert.ok(
    !matchingSkills(office, {
      ...defaultValues(office),
      task: 'WPS 数据透视表',
    }).some((s) => s.id === 'wps-formula'),
  );
  const photo = load('zh').find((t) => t.id === 'studio-photo');
  assert.ok(
    !matchingSkills(photo, {
      ...defaultValues(photo),
      task: '老照片修复描述',
    }).some((s) => s.id === 'image'),
  );
});
