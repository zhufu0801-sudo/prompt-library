import assert from 'node:assert/strict';
import { newProject } from '../lib/video-project.ts';
const base = process.env.TEST_ORIGIN || 'http://localhost:3000';
if (!['localhost', '127.0.0.1'].includes(new URL(base).hostname))
  throw Error('These mutation tests run locally only');
async function request(path, body, cookie = '', origin = base) {
  const r = await fetch(base + path, {
    method: body ? 'POST' : 'GET',
    headers: {
      Cookie: cookie,
      ...(body ? { 'Content-Type': 'application/json', Origin: origin } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return {
    status: r.status,
    cookie: r.headers.get('set-cookie')?.split(';')[0] || cookie,
    body: await r.json().catch(() => null),
  };
}
const a = await request('/api/projects'),
  b = await request('/api/projects');
assert.equal(a.status, 200);
assert.notEqual(a.cookie, b.cookie);
const project = newProject('Integration fixture', 'series');
assert.equal(
  (await request('/api/projects', { project, revision: 0 }, a.cookie)).status,
  200,
);
assert.equal(
  (await request('/api/projects?id=' + project.id, undefined, a.cookie)).body
    .project.title,
  project.title,
);
assert.equal(
  (await request('/api/projects?id=' + project.id, undefined, b.cookie)).status,
  404,
);
assert.equal(
  (await request('/api/projects', { project, revision: 1 }, b.cookie)).status,
  409,
);
assert.equal(
  (await request('/api/projects', { project, revision: 1 }, a.cookie)).body
    .revision,
  2,
);
assert.equal(
  (await request('/api/projects', { project, revision: 1 }, a.cookie)).status,
  409,
);
assert.ok(
  [400, 403].includes(
    (
      await request(
        '/api/projects',
        { project, revision: 2 },
        a.cookie,
        'https://other.invalid',
      )
    ).status,
  ),
);
assert.equal(
  (
    await request(
      '/api/projects',
      { project: { ...project, episodes: [null] }, revision: 2 },
      a.cookie,
    )
  ).status,
  400,
);
const f = {
  summary: 'Test request',
  kind: 'missing',
  context: 'test',
  consent: true,
  website: '',
};
assert.equal(
  (await request('/api/feedback', { ...f, consent: false }, a.cookie)).status,
  400,
);
assert.equal((await request('/api/feedback', f, a.cookie)).status, 200);
assert.equal(
  (await request('/api/feedback', f, a.cookie)).body.duplicate,
  true,
);
for (let i = 0; i < 4; i++)
  assert.equal(
    (await request('/api/feedback', { ...f, summary: 'Test ' + i }, a.cookie))
      .status,
    200,
  );
assert.equal(
  (await request('/api/feedback', { ...f, summary: 'Rate limited' }, a.cookie))
    .status,
  429,
);
assert.equal((await request('/api/feedback', f, b.cookie)).status, 200);
assert.ok([404, 405].includes((await request('/api/feedback')).status));
assert.equal((await request('/api/ai', {}, a.cookie)).status, 501);
console.log(
  'PASS: project isolation, optimistic concurrency, malformed data, CSRF, feedback consent, deduplication, limits and disabled AI',
);
