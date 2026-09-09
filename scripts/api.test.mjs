import assert from 'node:assert/strict';
const origin = process.env.TEST_ORIGIN || 'http://localhost:3000';
let cookieA = '',
  cookieB = '';
async function get(path, cookie = '') {
  const r = await fetch(origin + path, { headers: { Cookie: cookie } });
  return {
    status: r.status,
    cookie: r.headers.get('set-cookie')?.split(';')[0] || cookie,
    body: await r.json().catch(() => ({ error: 'non-json response' })),
  };
}
async function post(path, body, cookie = '', customOrigin = origin) {
  const r = await fetch(origin + path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: customOrigin,
      Cookie: cookie,
    },
    body: JSON.stringify(body),
  });
  return {
    status: r.status,
    cookie: r.headers.get('set-cookie')?.split(';')[0] || cookie,
    body: await r.json().catch(() => ({ error: 'non-json response' })),
  };
}
const all = await get('/api/catalog');
for (const locale of ['zh', 'en', 'ja']) {
  const studio = await get('/api/studio?locale=' + locale);
  assert.equal(studio.status, 200);
  assert.equal(studio.body.templates.length, 2);
  assert.equal(studio.body.locale, locale);
  assert.deepEqual(
    studio.body.templates.map((t) => t.id),
    ['custom-programming', 'custom-animation'],
  );
  const animation = studio.body.templates[1];
  assert.equal(
    animation.fields.find((f) => f.key === 'medium').options.length,
    2,
  );
  const values = Object.fromEntries(
    animation.fields.map((f) => [f.key, f.defaultValue]),
  );
  values.subject = 'A kitten in a forest';
  const saved = await post(
    '/api/plans',
    {
      templateId: animation.id,
      title: 'Locale test ' + locale,
      values,
      locks: { medium: true },
      output: animation.content,
    },
    studio.cookie,
  );
  assert.equal(saved.status, 200);
  const restored = await get('/api/plans', saved.cookie);
  assert.equal(restored.body.plans[0].values.medium, values.medium);
  assert.equal(restored.body.plans[0].locks.medium, true);
}
assert.equal(all.status, 200);
cookieA = all.cookie;
assert.equal(all.body.total, 311);
assert.equal(all.body.categories.length, 10);
assert.equal(all.body.ai.enabled, false);
const userB = await get('/api/catalog');
cookieB = userB.cookie;
assert.notEqual(cookieA, cookieB);
assert.equal((await get('/api/catalog?kind=custom')).body.total, 32);
assert.equal((await get('/api/catalog?kind=imported')).body.total, 279);
assert.equal(
  (await get('/api/catalog?kind=custom&category=programming')).body.total,
  4,
);
assert.ok(
  (await get('/api/catalog?q=' + encodeURIComponent('代码'))).body.total > 0,
);
assert.equal(
  (await get('/api/catalog?q=' + encodeURIComponent("' OR 1=1 --"))).body.total,
  0,
);
const template = await get('/api/templates/custom-code-explain');
assert.equal(template.body.fields.length, 5);
assert.equal((await get('/api/templates/aishort-1')).body.sourceRecordId, '1');
assert.equal((await get('/api/templates/not-real')).status, 404);
assert.equal(
  (
    await post(
      '/api/favorites',
      { templateId: 'custom-code-explain', saved: true },
      cookieA,
    )
  ).status,
  200,
);
assert.ok(
  (await get('/api/catalog?favorites=1', cookieA)).body.items.some(
    (x) => x.id === 'custom-code-explain',
  ),
);
assert.equal((await get('/api/catalog?favorites=1', cookieB)).body.total, 0);
assert.ok(
  [400, 403].includes(
    (
      await post(
        '/api/favorites',
        { templateId: 'custom-code-explain', saved: false },
        cookieA,
        'https://other.invalid',
      )
    ).status,
  ),
);
assert.equal(
  (
    await post(
      '/api/favorites',
      { templateId: 'missing', saved: true },
      cookieA,
    )
  ).status,
  404,
);
const plan = {
  templateId: 'custom-code-explain',
  title: 'Automated integration test',
  values: {
    subject: 'const x = 1',
    audience: 'Python',
    style: '步骤说明',
    keywords: ['代码解读'],
    constraints: '',
  },
  locks: { audience: true },
  output: 'Test prompt',
};
const saved = await post('/api/plans', plan, cookieA);
assert.equal(saved.status, 200);
const id = saved.body.id;
assert.equal(
  (await post('/api/plans', { ...plan, id, title: 'Updated test' }, cookieA))
    .status,
  200,
);
assert.equal((await post('/api/plans', { ...plan, id }, cookieB)).status, 404);
const own = (await get('/api/plans', cookieA)).body.plans.find(
  (p) => p.id === id,
);
assert.equal(own.title, 'Updated test');
assert.equal(own.locks.audience, true);
assert.equal((await get('/api/plans', cookieB)).body.plans.length, 0);
assert.equal(
  (await post('/api/plans', { ...plan, output: 'x'.repeat(21000) }, cookieA))
    .status,
  400,
);
assert.equal((await post('/api/ai', {}, cookieA)).status, 501);
await post(
  '/api/favorites',
  { templateId: 'custom-code-explain', saved: false },
  cookieA,
);
console.log(
  'PASS: 22 API assertions; catalog/search, source preservation, favorites, plan updates, cross-visitor isolation, CSRF, limits, disabled AI',
);
