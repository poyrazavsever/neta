import Constants from 'expo-constants';
import {
  isNetaDiscoveryDocument,
  isNetaInstanceMetadata,
  isNetaRuntimeCatalog,
  type NetaDiscoveryDocument,
  type NetaInstanceMetadata,
} from '@neta/api-contracts';

import { appEnvironment } from '@/config/environment';
import { NetaClientError } from '@/lib/api/errors';
import { fetchJson } from '@/lib/api/http';
import { normalizeHex } from '@/theme/tokens';

import { isSameTrustedOrigin, normalizeNetaOrigin } from './domain';
import type { DiscoveryResult, PublicCatalog, StoredInstance } from './types';
import { isCompatibleClientVersion, isSupportedApiVersion } from './version';

export type DiscoveryStep =
  | 'idle'
  | 'normalizing'
  | 'discovering'
  | 'validating-discovery'
  | 'checking-health'
  | 'loading-meta'
  | 'loading-public-catalog'
  | 'ready-for-auth';

type DiscoverOptions = { onStep?: (step: DiscoveryStep) => void };

export async function discoverInstance(
  input: string,
  options: DiscoverOptions = {},
): Promise<DiscoveryResult> {
  options.onStep?.('normalizing');
  const normalized = normalizeNetaOrigin(input, { environment: appEnvironment });

  options.onStep?.('discovering');
  const discovery = await getDiscoveryDocument(normalized.origin);

  options.onStep?.('validating-discovery');
  const apiBaseUrl = resolveTrustedUrl(discovery.api.baseUrl, normalized.origin);
  const healthUrl = resolveTrustedUrl(discovery.api.healthUrl, normalized.origin);
  const metaUrl = resolveTrustedUrl(discovery.api.metaUrl, normalized.origin);
  const catalogUrl = resolveTrustedUrl(discovery.api.catalogUrl, normalized.origin);

  options.onStep?.('checking-health');
  await assertHealthy(healthUrl);

  options.onStep?.('loading-meta');
  const meta = await getMetaDocument(metaUrl);
  validateMetaDocument(discovery, meta);

  options.onStep?.('loading-public-catalog');
  const catalog = await getPublicCatalog(catalogUrl);
  const instance = createStoredInstance(normalized.origin, apiBaseUrl, discovery, meta, catalog);

  options.onStep?.('ready-for-auth');
  return { catalog, instance };
}

async function getDiscoveryDocument(origin: string): Promise<NetaDiscoveryDocument> {
  const { data } = await fetchJson<unknown>(new URL('/.well-known/neta', origin).toString());
  if (!isNetaDiscoveryDocument(data)) {
    throw new NetaClientError('INVALID_DISCOVERY', 'Discovery belgesi Neta v1 kontratını karşılamıyor.');
  }
  return data;
}

async function assertHealthy(healthUrl: string): Promise<void> {
  const { data } = await fetchJson<unknown>(healthUrl);
  if (!isRecord(data) || data.status !== 'ok') {
    throw new NetaClientError('UNHEALTHY', 'Neta instance şu anda hazır değil.');
  }
}

async function getMetaDocument(metaUrl: string): Promise<NetaInstanceMetadata> {
  const { data } = await fetchJson<unknown>(metaUrl);
  if (!isNetaInstanceMetadata(data)) {
    throw new NetaClientError('INVALID_DISCOVERY', 'Instance metadata Neta v1 kontratını karşılamıyor.');
  }
  return data;
}

function validateMetaDocument(
  discovery: NetaDiscoveryDocument,
  meta: NetaInstanceMetadata,
): void {
  if (meta.instance.id !== discovery.instanceId) {
    throw new NetaClientError('INVALID_DISCOVERY', 'Discovery ve meta instance ID eşleşmiyor.');
  }
  if (meta.protocol.apiVersion !== discovery.api.version || !isSupportedApiVersion(meta.protocol.apiVersion)) {
    throw new NetaClientError('INCOMPATIBLE_CLIENT', `Bu instance desteklenmeyen ${meta.protocol.apiVersion} API sürümünü kullanıyor.`);
  }

  const minimumVersion = meta.client.minimumSupportedVersion;
  const currentVersion = Constants.expoConfig?.version ?? '0.0.0';
  if (!isCompatibleClientVersion(currentVersion, minimumVersion)) {
    throw new NetaClientError(
      'INCOMPATIBLE_CLIENT',
      minimumVersion ? `Bu instance Neta Mobile ${minimumVersion} veya üstünü istiyor.` : 'Neta Mobile sürüm bilgisi doğrulanamadı.',
    );
  }
}

async function getPublicCatalog(catalogUrl: string): Promise<PublicCatalog | null> {
  try {
    const { data } = await fetchJson<unknown>(catalogUrl);
    if (!isNetaRuntimeCatalog(data)) {
      throw new NetaClientError('INVALID_DISCOVERY', 'Public catalog Neta v1 kontratını karşılamıyor.');
    }
    return { locale: data.locale, messages: data.messages, version: data.version };
  } catch (error) {
    if (error instanceof NetaClientError && error.status === 404) return null;
    throw error;
  }
}

function createStoredInstance(
  origin: string,
  apiBaseUrl: string,
  discovery: NetaDiscoveryDocument,
  meta: NetaInstanceMetadata,
  catalog: PublicCatalog | null,
): StoredInstance {
  const enabledLocales = meta.localization.supportedLocales
    .filter((locale) => locale.status === 'active')
    .map((locale) => locale.code);

  return {
    accentColor: normalizeHex(meta.branding.accentColor),
    apiBaseUrl,
    apiVersion: meta.protocol.apiVersion,
    catalogVersion: meta.localization.catalogVersion ?? catalog?.version ?? 0,
    capabilities: [...meta.capabilities],
    darkLogoUrl: trustedNullableUrl(meta.branding.darkLogoUrl, origin),
    defaultColorMode: meta.branding.defaultColorMode,
    defaultLocale: meta.localization.defaultLocale,
    discoveryVersion: discovery.discoveryVersion,
    enabledLocales: enabledLocales.length ? enabledLocales : [meta.localization.defaultLocale],
    faviconUrl: trustedNullableUrl(meta.branding.faviconUrl, origin),
    instanceId: discovery.instanceId,
    lastConnectedAt: new Date().toISOString(),
    lightLogoUrl: trustedNullableUrl(meta.branding.lightLogoUrl, origin),
    origin,
    primaryColor: normalizeHex(meta.branding.primaryColor),
    workspaceName: meta.instance.workspaceName,
  };
}

function resolveTrustedUrl(value: string, origin: string): string {
  const url = new URL(value, origin).toString();
  if (!isSameTrustedOrigin(url, origin)) {
    throw new NetaClientError('UNTRUSTED_ORIGIN', 'Discovery farklı origin’e işaret ediyor.');
  }
  return url;
}

function trustedNullableUrl(value: string | null, origin: string): string | null {
  return value === null ? null : resolveTrustedUrl(value, origin);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
