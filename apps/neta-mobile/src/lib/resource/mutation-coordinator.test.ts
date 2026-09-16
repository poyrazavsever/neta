import assert from 'node:assert/strict';
import test from 'node:test';
import { createMutationCoordinator } from './mutation-coordinator.ts';

test('a lost response keeps the same key for a retry; confirmed success starts a new operation', async () => {
  const coordinator = createMutationCoordinator(); const keys: string[] = [];
  await assert.rejects(coordinator.run('instance\nowner\nPOST\ntasks', { title: 'Task' }, 'first-key', async (key) => {
    keys.push(key); throw new Error('response lost');
  }));
  await coordinator.run('instance\nowner\nPOST\ntasks', { title: 'Task' }, 'new-proposal', async (key) => keys.push(key));
  await coordinator.run('instance\nowner\nPOST\ntasks', { title: 'Task' }, 'next-operation', async (key) => keys.push(key));
  assert.deepEqual(keys, ['first-key', 'first-key', 'next-operation']);
});

test('double submission shares one in-flight request', async () => {
  const coordinator = createMutationCoordinator(); let calls = 0; let finish!: (value: number) => void;
  const execute = async () => { calls++; return new Promise<number>((resolve) => { finish = resolve; }); };
  const first = coordinator.run('instance\nowner', {}, 'first', execute);
  const second = coordinator.run('instance\nowner', {}, 'second', execute);
  await Promise.resolve(); finish(42);
  assert.deepEqual(await Promise.all([first, second]), [42, 42]); assert.equal(calls, 1);
});

test('payload, actor and instance changes stay separate; logout discards retry state', async () => {
  const coordinator = createMutationCoordinator();
  const fail = async () => { throw new Error('offline'); };
  await assert.rejects(coordinator.run('instance\nowner', { title: 'A' }, 'old', fail));
  assert.equal(await coordinator.run('instance\nowner', { title: 'B' }, 'changed', async (key) => key), 'changed');
  assert.equal(await coordinator.run('instance\nclient', { title: 'A' }, 'actor', async (key) => key), 'actor');
  assert.equal(await coordinator.run('other\nowner', { title: 'A' }, 'other', async (key) => key), 'other');
  coordinator.clear('instance');
  assert.equal(await coordinator.run('instance\nowner', { title: 'A' }, 'after-logout', async (key) => key), 'after-logout');
});
