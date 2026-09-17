import assert from 'node:assert/strict';
import test from 'node:test';

import { compareSemver, isCompatibleClientVersion, isSupportedApiVersion } from './version.ts';

test('compares semver values', () => {
  assert.equal(compareSemver('0.1.0', '0.1.0'), 0);
  assert.ok(compareSemver('0.2.0', '0.1.9') > 0);
  assert.ok(compareSemver('0.1.0', '0.2.0') < 0);
});

test('treats partial and invalid versions defensively', () => {
  assert.equal(compareSemver('1', '1.0.0'), 0);
  assert.ok(compareSemver('bad', '0.0.1') < 0);
});

test('accepts API v1 and rejects incompatible or ambiguous versions', () => {
  assert.equal(isSupportedApiVersion('v1'), true);
  assert.equal(isSupportedApiVersion('1.2.0'), true);
  assert.equal(isSupportedApiVersion('v2'), false);
  assert.equal(isSupportedApiVersion('latest'), false);
  assert.equal(isSupportedApiVersion('1-preview'), false);
});

test('minimum client compatibility separates beta/RC from stable and ignores build metadata', () => {
  assert.equal(isCompatibleClientVersion('1.0.0-rc.1', '1.0.0'), false);
  assert.equal(isCompatibleClientVersion('1.0.0', '1.0.0-rc.1'), true);
  assert.equal(isCompatibleClientVersion('1.0.0+build.42', '1.0.0+build.9'), true);
  const ordered = ['1.0.0-alpha', '1.0.0-alpha.1', '1.0.0-alpha.beta', '1.0.0-beta', '1.0.0-beta.2', '1.0.0-beta.11', '1.0.0-rc.1', '1.0.0'];
  for (let i = 1; i < ordered.length; i++) {
    const previous = ordered[i - 1]; const current = ordered[i];
    assert.ok(previous !== undefined && current !== undefined);
    assert.ok(compareSemver(previous, current) < 0);
  }
  assert.ok(compareSemver('1.0.0-9999999999999999999999', '1.0.0-10000000000000000000000') < 0);
});

test('invalid or partial advertised versions fail closed in discovery compatibility', () => {
  for (const minimum of ['bad', '1', '1.0', '01.0.0', '1.0.0-01', '1.0.0..', '', '1.0.0 trailing']) assert.equal(isCompatibleClientVersion('1.0.0', minimum), false);
  assert.equal(isCompatibleClientVersion('1.0.0-rc.1', null), true);
  assert.equal(isCompatibleClientVersion('bad', null), false);
});
