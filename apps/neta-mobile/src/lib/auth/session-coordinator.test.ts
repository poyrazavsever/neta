import assert from 'node:assert/strict';
import test from 'node:test';
import { createSessionCoordinator } from './session-coordinator.ts';

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => { resolve = done; });
  return { promise, resolve };
}

test('one instance shares a refresh while another instance refreshes independently', async () => {
  const sessions = createSessionCoordinator<string>();
  const network = deferred<string>();
  let calls = 0;
  const run = () => { calls += 1; return network.promise; };
  const first = sessions.refresh('a', 0, run);
  const duplicate = sessions.refresh('a', 0, run);
  assert.equal(first, duplicate);
  assert.equal(await sessions.refresh('b', 0, async () => 'b-token'), 'b-token');
  network.resolve('a-token');
  assert.deepEqual(await Promise.all([first, duplicate]), ['a-token', 'a-token']);
  assert.equal(calls, 1);
});

test('a refresh response arriving after logout cannot restore credentials', async () => {
  const sessions = createSessionCoordinator<string>();
  const network = deferred<string>();
  let stored: string | null = 'old';
  const pending = sessions.refresh('a', 0, async () => {
    const next = await network.promise;
    assert.equal(await sessions.commit('a', 0, async () => { stored = next; }), false);
    return next;
  });
  const logout = sessions.invalidate('a');
  await sessions.commit('a', logout, async () => { stored = null; });
  network.resolve('late-token');
  await pending;
  assert.equal(stored, null);
});

test('logout waits for an already started credential write and then clears it', async () => {
  const sessions = createSessionCoordinator<string>();
  const writing = deferred<void>();
  const started = deferred<void>();
  let stored: string | null = 'old';
  const write = sessions.commit('a', 0, async () => {
    started.resolve();
    await writing.promise;
    stored = 'late';
  });
  await started.promise;
  const logout = sessions.invalidate('a');
  const clear = sessions.commit('a', logout, async () => { stored = null; });
  writing.resolve();
  assert.equal(await write, false);
  assert.equal(await clear, true);
  assert.equal(stored, null);
});

test('an obsolete refresh finishing cannot remove a new login refresh', async () => {
  const sessions = createSessionCoordinator<string>();
  const oldNetwork = deferred<string>();
  const newNetwork = deferred<string>();
  const old = sessions.refresh('a', 0, () => oldNetwork.promise);
  const generation = sessions.invalidate('a');
  const next = sessions.refresh('a', generation, () => newNetwork.promise);
  oldNetwork.resolve('old');
  await old;
  assert.equal(sessions.refresh('a', generation, async () => 'duplicate'), next);
  assert.equal(await sessions.commit('a', 0, async () => { throw new Error('must not write'); }), false);
  newNetwork.resolve('new');
  assert.equal(await next, 'new');
});

test('failed storage writes do not prevent subsequent logout clearing', async () => {
  const sessions = createSessionCoordinator<string>();
  await assert.rejects(sessions.commit('a', 0, async () => { throw new Error('storage failed'); }));
  const generation = sessions.invalidate('a');
  let cleared = false;
  assert.equal(await sessions.commit('a', generation, async () => { cleared = true; }), true);
  assert.equal(cleared, true);
});
