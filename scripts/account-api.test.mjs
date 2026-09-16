import assert from 'node:assert/strict';
import { newProject } from '../lib/video-project.ts';
const origin = process.env.TEST_ORIGIN || 'http://localhost:3000';
if (!['localhost', '127.0.0.1'].includes(new URL(origin).hostname))
  throw Error('Local mutation tests only');
const signed = '__sites_local_auth=1';
async function request(path, body, cookie = '', extra = {}) {
  const r = await fetch(origin + path, {
    method: body ? 'POST' : 'GET',
    headers: {
      Cookie: cookie,
      ...(body ? { 'Content-Type': 'application/json', Origin: origin } : {}),
      ...extra,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return {
    status: r.status,
    cookie: r.headers.get('set-cookie')?.split(';')[0] || cookie,
    body: await r.json().catch(() => null),
  };
}
const guest = await request('/api/account');
assert.equal(guest.body.signedIn, false);
assert.equal(
  (
    await request('/api/account', undefined, '', {
      'oai-authenticated-user-id': 'forged',
      'oai-authenticated-user-email': 'zhufu0801@gmail.com',
    })
  ).body.signedIn,
  false,
);
assert.equal((await request('/api/review')).status, 403);
assert.equal(
  (
    await request(
      '/api/account',
      { action: 'claim-guest-data', consent: true },
      guest.cookie,
    )
  ).status,
  401,
);
const project = newProject('Account test ' + crypto.randomUUID(), 'single');
assert.equal(
  (await request('/api/projects', { project, revision: 0 }, guest.cookie))
    .status,
  200,
);
assert.equal(
  (await request('/api/projects?id=' + project.id, undefined, signed)).status,
  404,
);
assert.equal(
  (
    await request(
      '/api/account',
      { action: 'claim-guest-data', consent: false },
      signed + '; ' + guest.cookie,
    )
  ).status,
  400,
);
assert.ok(
  [400, 403].includes(
    (
      await request(
        '/api/account',
        { action: 'claim-guest-data', consent: true },
        signed + '; ' + guest.cookie,
        { Origin: 'https://other.invalid' },
      )
    ).status,
  ),
);
assert.equal(
  (
    await request(
      '/api/account',
      { action: 'claim-guest-data', consent: true },
      signed + '; ' + guest.cookie,
    )
  ).status,
  200,
);
assert.equal(
  (await request('/api/projects?id=' + project.id, undefined, signed)).status,
  200,
  'same account on second browser',
);
assert.equal(
  (await request('/api/projects?id=' + project.id, undefined, guest.cookie))
    .status,
  404,
  'sign-out does not expose account records',
);
assert.equal(
  (
    await request(
      '/api/account',
      { action: 'claim-guest-data', consent: true },
      signed + '; ' + guest.cookie,
    )
  ).status,
  200,
  'safe repeat',
);
const summary = 'Review fixture ' + crypto.randomUUID();
assert.equal(
  (
    await request(
      '/api/feedback',
      {
        summary,
        context: 'local integration test',
        kind: 'missing',
        consent: true,
        website: '',
      },
      guest.cookie,
    )
  ).status,
  200,
);
const review = await request('/api/review', undefined, signed);
assert.equal(
  review.status,
  200,
  'local seedy allowlist configured in ignored .dev.vars',
);
const item = review.body.items.find((i) => i.summary === summary);
assert.ok(item);
assert.equal(
  (
    await request(
      '/api/review',
      {
        id: item.id,
        status: 'approved',
        note: 'specific reproducible requirement',
      },
      guest.cookie,
    )
  ).status,
  403,
);
assert.equal(
  (
    await request(
      '/api/review',
      {
        id: item.id,
        status: 'approved',
        note: 'specific reproducible requirement',
      },
      signed,
    )
  ).status,
  200,
);
const approved = await request(
  '/api/review?status=approved',
  undefined,
  signed,
);
assert.equal(
  approved.body.items.find((i) => i.id === item.id)?.note,
  'specific reproducible requirement',
);
assert.equal(
  (
    await request(
      '/api/review',
      { id: item.id, status: 'rejected', note: 'test fixture completed' },
      signed,
    )
  ).status,
  200,
);
console.log(
  'PASS: trusted identity headers, guest/account isolation, explicit migration, cross-device identity, CSRF, admin authorization and feedback review persistence',
);
