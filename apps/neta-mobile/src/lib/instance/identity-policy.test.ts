import assert from 'node:assert/strict';
import test from 'node:test';
import { didInstanceIdentityChange } from './identity-policy.ts';

test('origin changes cannot inherit credentials from a reused instance ID', () => {
  assert.equal(didInstanceIdentityChange({ instanceId: 'one', origin: 'https://old.test' }, { instanceId: 'one', origin: 'https://new.test' }), true);
  assert.equal(didInstanceIdentityChange({ instanceId: 'one', origin: 'https://old.test' }, { instanceId: 'two', origin: 'https://old.test' }), true);
});
test('the same identity and independent instance switching preserve their own scope', () => {
  assert.equal(didInstanceIdentityChange({ instanceId: 'one', origin: 'https://one.test' }, { instanceId: 'one', origin: 'https://one.test' }), false);
  assert.equal(didInstanceIdentityChange({ instanceId: 'one', origin: 'https://one.test' }, { instanceId: 'two', origin: 'https://two.test' }), false);
  assert.equal(didInstanceIdentityChange(null, { instanceId: 'one', origin: 'https://one.test' }), false);
});
