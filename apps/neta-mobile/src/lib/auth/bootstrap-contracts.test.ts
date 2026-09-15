import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import {
  isNetaDiscoveryDocument,
  isNetaInstanceMetadata,
  isNetaRuntimeCatalog,
} from '@neta/api-contracts';

import { normalizeMeProfile } from './me-contract.ts';

test('mobile consumes the shared discovery, metadata and catalog fixtures', () => {
  assert.equal(isNetaDiscoveryDocument(fixture('discovery.json')), true);
  assert.equal(isNetaInstanceMetadata(fixture('meta.json')), true);
  assert.equal(isNetaRuntimeCatalog(fixture('catalog.json')), true);
});

test('mobile maps the canonical owner and client me fixtures without aliases', () => {
  assert.deepEqual(normalizeMeProfile(fixture('me-owner.json')), {
    disabled: false,
    email: 'owner@example.com',
    id: 'owner-user',
    name: 'Örnek Owner',
    role: 'freelancer',
    preferences: { colorMode: 'system', locale: 'tr', timezone: 'Europe/Istanbul' },
  });
  assert.equal(normalizeMeProfile(fixture('me-client.json')).role, 'client');
  assert.throws(
    () => normalizeMeProfile({ user: { id: 'legacy', role: 'owner' } }),
    /Oturum doğrulanamadı/,
  );
});

function fixture(name: string): unknown {
  return JSON.parse(readFileSync(
    new URL(`../../../../../packages/api-contracts/fixtures/${name}`, import.meta.url),
    'utf8',
  )) as unknown;
}
