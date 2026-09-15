import assert from 'node:assert/strict';
import test from 'node:test';
import { hasInstanceCapability, requireInstanceCapability } from './capabilities.ts';
import type { StoredInstance } from './types.ts';

const instance = { capabilities: ['freelancer.clients.v1'] } as StoredInstance;

test('gates mobile resources by discovered instance capabilities', () => {
  assert.equal(hasInstanceCapability(instance, 'freelancer.clients.v1'), true);
  assert.equal(hasInstanceCapability(instance, 'freelancer.tasks.v1'), false);
  assert.throws(() => requireInstanceCapability(instance, 'freelancer.tasks.v1'), /freelancer.tasks.v1/);
});
