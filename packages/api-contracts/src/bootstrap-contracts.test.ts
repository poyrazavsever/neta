import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import {
  NETA_CAPABILITIES,
  NETA_CAPABILITY_DETAILS,
  NETA_CAPABILITY_ROUTE_REQUIREMENTS,
  NETA_MOBILE_V1_REQUIRED_CAPABILITIES,
  isApiEnvelope,
  isMultiCurrencyFinanceSummary,
  isNetaDiscoveryDocument,
  isNetaInstanceMetadata,
  isNetaMePreferencesMutation,
  isNetaMeProfile,
  isNetaRuntimeCatalog,
  isPaginatedResponse,
} from './index.ts';

const discovery = fixture('discovery.json');
const meta = fixture('meta.json');
const owner = fixture('me-owner.json');
const client = fixture('me-client.json');
const preferences = fixture('me-preferences-owner.json');
const catalog = fixture('catalog.json');
const error = fixture('error-validation.json');
const page = fixture('page.json');

test('freezes discovery, meta, me, preferences and catalog bootstrap contracts', () => {
  assert.equal(isNetaDiscoveryDocument(discovery), true);
  assert.equal(isNetaInstanceMetadata(meta), true);
  assert.equal(isNetaMeProfile(owner), true);
  assert.equal(isNetaMeProfile(client), true);
  assert.equal(isNetaMeProfile(preferences), true);
  assert.equal(isNetaRuntimeCatalog(catalog), true);
  assert.equal(isApiEnvelope(error, () => false), true);
  assert.equal(isPaginatedResponse(page, isFixtureItem), true);
});

test('publishes only implemented capabilities and keeps mobile-v1 planned', () => {
  const available = NETA_CAPABILITY_DETAILS.filter((capability) => capability.status === 'available');
  assert.deepEqual(NETA_CAPABILITIES, available.map((capability) => capability.id));
  assert.equal(NETA_CAPABILITIES.some((capability) => capability === 'mobile-v1'), false);
  assert.equal(NETA_CAPABILITY_DETAILS.find((capability) => capability.id === 'mobile-v1')?.status, 'planned');
  assert.ok(NETA_MOBILE_V1_REQUIRED_CAPABILITIES.includes('freelancer.calendar.v1'));
  for (const capability of available) {
    assert.ok(NETA_CAPABILITY_ROUTE_REQUIREMENTS[capability.id]?.length, `${capability.id} route gereksinimi eksik`);
  }
});

test('accepts additive capability metadata without weakening available consistency', () => {
  const extended = structuredClone(discovery) as Record<string, unknown>;
  extended.capabilities = [...(extended.capabilities as string[]), 'future.additive.v1'];
  extended.capabilityDetails = [
    ...(extended.capabilityDetails as unknown[]),
    { id: 'future.additive.v1', version: 1, status: 'available', access: 'session' },
  ];
  assert.equal(isNetaDiscoveryDocument(extended), true);

  const inconsistent = structuredClone(extended) as Record<string, unknown>;
  inconsistent.capabilityDetails = (inconsistent.capabilityDetails as Record<string, unknown>[])
    .map((capability) => capability.id === 'future.additive.v1' ? { ...capability, status: 'planned' } : capability);
  assert.equal(isNetaDiscoveryDocument(inconsistent), false);
});

test('keeps preference mutation strict and timezone-aware', () => {
  assert.equal(isNetaMePreferencesMutation({ locale: 'en', colorMode: 'dark', timezone: 'Europe/Berlin' }), true);
  assert.equal(isNetaMePreferencesMutation({ language: 'en' }), false);
  assert.equal(isNetaMePreferencesMutation({}), false);
  assert.equal(isNetaMePreferencesMutation({ timezone: 'Not/AZone' }), false);
});

test('freezes currency-grouped summary without cross-currency totals', () => {
  assert.equal(isMultiCurrencyFinanceSummary({
    generatedAt: '2026-09-03T09:00:00.000Z',
    month: '2026-09',
    taxDisclaimer: null,
    currencies: [
      { currency: 'EUR', totals: totals('EUR') },
      { currency: 'TRY', totals: totals('TRY') },
    ],
  }), true);
  assert.equal(isMultiCurrencyFinanceSummary({
    generatedAt: '2026-09-03T09:00:00.000Z',
    month: '2026-09',
    taxDisclaimer: null,
    currencies: [
      { currency: 'TRY', totals: totals('TRY') },
      { currency: 'EUR', totals: totals('EUR') },
    ],
  }), false);
});

test('fixtures do not contain credential or internal filesystem material', () => {
  for (const [name, value] of Object.entries({ discovery, meta, owner, client, preferences, catalog, error, page })) {
    const serialized = JSON.stringify(value);
    assert.doesNotMatch(serialized, /(?:password|accessToken|refreshToken|sessionToken|apiKey|encryptedApiKey)/i, name);
    assert.doesNotMatch(serialized, /(?:\/app\/data|neta\.db|Bearer\s+|eyJ[A-Za-z0-9_-]+\.)/, name);
  }
});

function fixture(name: string): unknown {
  return JSON.parse(readFileSync(new URL(`../fixtures/${name}`, import.meta.url), 'utf8')) as unknown;
}

function isFixtureItem(value: unknown): value is { id: string } {
  return typeof value === 'object' && value !== null && 'id' in value && typeof value.id === 'string';
}

function totals(currency: string) {
  const amount = (amountMinor: number) => ({ amountMinor, currency });
  return {
    expense: amount(2000),
    gross: amount(10000),
    income: amount(10000),
    net: amount(8000),
    pending: amount(1000),
    taxEstimate: null,
  };
}
