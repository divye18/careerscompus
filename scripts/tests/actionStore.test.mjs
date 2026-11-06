// Scene 7 ticks store. Run: npm run test:action
import test from 'node:test';
import assert from 'node:assert/strict';
import { ACTION_KEY, createStepStore, parseStoredSteps } from '../../src/journey/action/actionStore.ts';
import { buildActionPlan } from '../../src/content/actionPlan.ts';

const fake = (initial) => {
  const m = new Map(initial === undefined ? [] : [[ACTION_KEY, initial]]);
  return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, v), m };
};

test('stored ids are validated: unknown, duplicate and non-string values are dropped', () => {
  assert.deepEqual(parseStoredSteps(JSON.stringify(['talk', 'talk', 'nope', 3, null, 'check-official', 'check-website:nope'])), ['talk', 'check-official']);
});
test('corrupt or wrong-shaped storage gives an empty list', () => {
  for (const raw of [null, '', '{not json', '{"a":1}', '"talk"', '42']) assert.deepEqual(parseStoredSteps(raw), [], String(raw));
});
test('a tick is saved and restored by a new store', () => {
  const s = fake();
  const a = createStepStore(() => s);
  a.toggle('talk');
  assert.deepEqual(a.getSnapshot(), ['talk']);
  assert.equal(s.m.get(ACTION_KEY), '["talk"]');
  assert.deepEqual(createStepStore(() => s).getSnapshot(), ['talk']);
});
test('toggling twice removes; an unknown id is ignored and not saved', () => {
  const s = fake();
  const a = createStepStore(() => s);
  a.toggle('talk');
  a.toggle('talk');
  assert.deepEqual(a.getSnapshot(), []);
  a.toggle('made-up');
  assert.deepEqual(a.getSnapshot(), []);
});
test('storage only ever holds step ids', () => {
  const s = fake();
  const a = createStepStore(() => s);
  a.toggle('check-official');
  assert.deepEqual([...s.m.keys()], [ACTION_KEY]);
  assert.deepEqual(JSON.parse(s.m.get(ACTION_KEY)), ['check-official']);
});
test('unavailable storage: null, a throwing getter, or throwing reads and writes all still work for the page view', () => {
  const throwing = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('quota'); } };
  for (const get of [() => null, () => { throw new Error('denied'); }, () => throwing]) {
    const a = createStepStore(get);
    assert.deepEqual(a.getSnapshot(), []);
    a.toggle('talk');
    assert.deepEqual(a.getSnapshot(), ['talk']);
  }
});
test('subscribers are told, can unsubscribe, and the snapshot is stable between changes', () => {
  const a = createStepStore(() => null);
  let n = 0;
  const off = a.subscribe(() => n++);
  assert.equal(a.getSnapshot(), a.getSnapshot());
  a.toggle('talk');
  assert.equal(n, 1);
  off();
  a.toggle('talk');
  assert.equal(n, 1);
});
test('reset clears ticks', () => {
  const s = fake('["talk"]');
  const a = createStepStore(() => s);
  a.reset();
  assert.deepEqual(a.getSnapshot(), []);
  assert.equal(s.m.get(ACTION_KEY), '[]');
});
test('ticking never changes a verification state or any part of the plan', () => {
  const sel = { institutions: ['iit-madras'], programmes: ['vit-vellore--b-tech'], courses: [] };
  const before = JSON.stringify(buildActionPlan(sel));
  const a = createStepStore(() => null);
  for (const s of buildActionPlan(sel).steps) a.toggle(s.id);
  assert.equal(JSON.stringify(buildActionPlan(sel)), before);
  // an absolute check too: a comparison alone misses damage done by an earlier tick in this same process
  assert.equal(buildActionPlan(sel).kept.programmes[0].status, 'partial');
  assert.equal(buildActionPlan({ programmes: ['iit-madras--b-tech'] }).kept.programmes[0].status, 'verified');
});
