import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  composeStudio,
  translateValues,
  localeOf,
  studioIds,
} from '../lib/studio.ts';
import { defaultValues } from '../lib/prompt.ts';
const guides = JSON.parse(fs.readFileSync(new URL('../data/studio/task-guides.json',import.meta.url),'utf8'));
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
