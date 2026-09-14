import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import {
  compose,
  defaultValues,
  refreshValues,
  validateValues,
  getOptions,
} from '../lib/prompt.ts';
const t = JSON.parse(
  fs.readFileSync(
    new URL('../data/modules/programming.json', import.meta.url),
    'utf8',
  ),
)[0];
test('placeholder values are literal and do not recursively expand', () => {
  const v = defaultValues(t);
  v.subject = '{{audience}} $& <script>';
  const text = compose(t, v);
  assert.ok(text.includes('{{audience}} $& <script>'));
  assert.ok(text.includes('开发语言：Python'));
});
test('locked fields and free text survive recommendation refresh', () => {
  const v = defaultValues(t);
  v.subject = '保持这段代码';
  v.audience = 'TypeScript';
  v.keywords = ['自定义重点'];
  const next = refreshValues(t, v, { audience: true, keywords: true });
  assert.equal(next.subject, v.subject);
  assert.equal(next.audience, v.audience);
  assert.deepEqual(next.keywords, v.keywords);
  assert.notEqual(next.style, v.style);
  assert.notStrictEqual(v, next);
});
test('all locked values remain unchanged', () => {
  const v = defaultValues(t);
  assert.deepEqual(
    refreshValues(t, v, Object.fromEntries(t.fields.map((f) => [f.key, true]))),
    v,
  );
});
test('required fields and selection limits are validated', () => {
  const v = defaultValues(t);
  assert.ok(validateValues(t, v).some((e) => e.includes('请填写')));
  v.subject = 'example';
  v.keywords = ['1', '2', '3', '4', '5', '6'];
  assert.ok(validateValues(t, v).some((e) => e.includes('最多')));
});
test('platform-specific keywords follow the selected platform', () => {
  const marketing = JSON.parse(
    fs.readFileSync(
      new URL('../data/modules/marketing.json', import.meta.url),
      'utf8',
    ),
  )[0];
  const v = defaultValues(marketing);
  v.audience = 'LinkedIn';
  assert.deepEqual(
    getOptions(
      marketing.fields.find((f) => f.key === 'style'),
      v,
    ),
    ['专业正式', '行业观点', '商业价值'],
  );
});
test('module IDs, variables and defaults validated by content compiler', () => {
  const seed = JSON.parse(
    fs.readFileSync(
      new URL('../data/seed.generated.json', import.meta.url),
      'utf8',
    ),
  );
  assert.equal(seed.counts.templates, 366);
  assert.equal(seed.counts.custom, 87);
  assert.equal(seed.counts.imported, 279);
  assert.equal(seed.counts.categories, 10);
});
