import assert from 'node:assert/strict';
import test from 'node:test';
import { matchesNativeActor } from './actor-binding.ts';

test('actor binding reads the normalized flat SecureStore session, not a wire envelope', () => {
  const actor = { id: 'owner-a', role: 'freelancer' };
  assert.equal(matchesNativeActor({ ...actor, name: 'Fixture', preferences: {} }, actor), true);
  assert.equal(matchesNativeActor({ user: actor, preferences: {} }, actor), false);
});
test('a delayed caller cannot use another user or role session', () => {
  assert.equal(matchesNativeActor({ id: 'client-b', role: 'client' }, { id: 'client-a', role: 'client' }), false);
  assert.equal(matchesNativeActor({ id: 'same', role: 'client' }, { id: 'same', role: 'freelancer' }), false);
  for (const value of [null, '', {}, { id: 'owner-a' }]) assert.equal(matchesNativeActor(value, { id: 'owner-a', role: 'freelancer' }), false);
});
