import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createBriefOutput,
  emptyBrief,
  adapterInfo,
  revisePrompt,
} from '../lib/workflow.ts';
import {
  newProject,
  newShot,
  uid,
  captureContext,
  reviseShot,
  restoreShot,
  validateProject,
  parseProject,
  projectChecklist,
} from '../lib/video-project.ts';
import { validFeedback, screenFeedback } from '../lib/feedback.ts';
import { editTasks } from '../lib/edit-tasks.ts';
test('localized briefs preserve requirements across tools and flag incompatible modes', () => {
  for (const l of ['zh', 'en', 'ja']) {
    const b = {
      ...emptyBrief,
      goal: 'Need exactly 3 scenes',
      change: 'background only',
      preserve: 'red jacket',
      materials: 'reference.jpg',
    };
    for (const tool of ['general', 'runway', 'midjourney', 'deepseek']) {
      const o = createBriefOutput(
        b,
        'Task',
        'Specific guidance',
        tool,
        'image-edit',
        l,
      );
      for (const value of [b.goal, b.change, b.preserve, b.materials])
        assert.ok(o.prompt.includes(value));
      assert.ok(
        revisePrompt(o.prompt, 'Wrong style', 'Keep the jacket', l).includes(
          o.prompt,
        ),
      );
    }
    assert.equal(adapterInfo('deepseek', 'image-edit', l).supported, false);
    assert.ok(adapterInfo('deepseek', 'image-edit', l).warning);
    assert.equal(editTasks(l).length, 10);
    assert.equal(new Set(editTasks(l).map((t) => t.id)).size, 10);
  }
});
test('project validation, historical restore, locked shots and continuity', () => {
  const p = newProject('Test', 'series');
  p.bible = 'Fixed world';
  p.entities = [{ id: uid(), name: 'A', fixed: 'red jacket' }];
  const e = {
    id: uid(),
    title: 'Episode',
    synopsis: 'Story',
    continuity: 'Day 2',
    scenes: [],
  };
  const s = { id: uid(), title: 'Scene', setting: 'Garden', shots: [] };
  e.scenes = [s];
  p.episodes = [e];
  let t = newShot(captureContext(p, e, s, [p.entities[0].id]));
  t.entityIds = [p.entities[0].id];
  s.shots = [t];
  assert.ok(validateProject(p));
  assert.deepEqual(parseProject(JSON.stringify(p)), p);
  t = reviseShot(t, { action: 'Walk' });
  assert.equal(restoreShot(t, 0).action, '');
  for (let i = 0; i < 15; i++) t = reviseShot(t, { action: String(i) });
  assert.equal(t.history.length, 10);
  assert.throws(
    () => reviseShot({ ...t, locked: true }, { action: 'Overwrite' }),
    /LOCKED/,
  );
  assert.throws(() => restoreShot({ ...t, locked: true }, 0), /LOCKED/);
  s.shots = [t];
  const original = t.context;
  p.bible = 'Changed';
  assert.equal(t.context, original);
  assert.ok(
    projectChecklist(p, 'en').some((x) => x.includes('Settings changed')),
  );
  const bad = structuredClone(p);
  bad.episodes[0].scenes[0].shots[0].entityIds = ['unknown'];
  assert.equal(validateProject(bad), false);
  assert.equal(validateProject({ ...p, episodes: [e, e] }), false);
  assert.throws(() => parseProject('{"schema":1}'), /INVALID/);
  assert.throws(() => parseProject('x'.repeat(500001)), /TOO_LARGE/);
});
test('feedback requires explicit consent and quarantines strong spam without excluding short requests', () => {
  const b = {
    summary: '修图',
    context: 'journey/image',
    kind: 'missing',
    consent: true,
    website: '',
  };
  assert.ok(validFeedback(b));
  assert.equal(validFeedback({ ...b, consent: false }), false);
  assert.equal(screenFeedback('修图'), 'pending');
  assert.equal(screenFeedback('a'.repeat(30)), 'quarantined');
  assert.equal(screenFeedback('https://a https://b https://c'), 'quarantined');
});
