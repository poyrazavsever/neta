import Constants from 'expo-constants';
import NetInfo from '@react-native-community/netinfo';
import { Platform } from 'react-native';

import type { CachePolicy, RequestMetadata, ResourceName } from '@neta/api-contracts';

import { NetaClientError, toClientError } from '@/lib/api/errors';
import { createApiUrl } from '@/lib/api/http';
import { authenticatedJsonRequest, bindNativeActor } from '@/lib/auth/native-auth-client';
import type { MeProfile, StoredInstance } from '@/lib/instance/types';
import { requireInstanceCapability } from '@/lib/instance/capabilities';
import { recordPerformanceSample } from '@/lib/performance/metrics';

import { createQueryKey, type QueryFilters, type QueryKey } from './query-key';
import { effectiveCachePolicy } from './cache-policy';
import { mutationRequests } from './mutation-coordinator';
import {
  clearResourceCacheForResource,
  readResourceCache,
  writeResourceCache,
} from './resource-cache';

type ResourceRequestOptions<T> = {
  body?: unknown;
  cachePolicy?: CachePolicy;
  filters?: QueryFilters;
  idempotencyKey?: string;
  ifMatch?: string;
  invalidates?: ResourceName[];
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  parser: (value: unknown) => T;
  path: string;
  resource: ResourceName;
};

export type ResourceResult<T> = {
  data: T;
  cachedAt: number | null;
  fromCache: boolean;
  isStale: boolean;
  queryKey: QueryKey;
  requestDurationMs: number | null;
};

export async function requestResource<T>(
  instance: StoredInstance,
  user: MeProfile,
  options: ResourceRequestOptions<T>,
): Promise<ResourceResult<T>> {
  if (options.idempotencyKey && (options.method === 'POST' || options.method === 'PUT')) {
    return mutationRequests.run(`${instance.instanceId}\n${user.id}\n${user.role}\n${options.method}\n${options.path}`,
      options.body, options.idempotencyKey,
      (key) => performResourceRequest(instance, user, { ...options, idempotencyKey: key }));
  }
  return performResourceRequest(instance, user, options);
}

async function performResourceRequest<T>(instance: StoredInstance, user: MeProfile, options: ResourceRequestOptions<T>): Promise<ResourceResult<T>> {
  const auth = await bindNativeActor(instance, user);
  const requiredCapability = capabilityFor(options.path);
  if (requiredCapability) requireInstanceCapability(instance, requiredCapability);
  const locale = user.preferences?.locale ?? instance.defaultLocale;
  const cachePolicy = effectiveCachePolicy(options.resource, options.cachePolicy ?? 'none');
  const queryKey = createQueryKey(instance.instanceId, user.id, user.role, locale, options.resource, options.filters);
  const isRead = !options.method || options.method === 'GET';
  const cached = isRead ? await readResourceCache<T>(queryKey, cachePolicy) : null;
  auth.assertCurrent();

  if (cached) {
    try {
      return { data: options.parser(cached.value), cachedAt: cached.storedAt, fromCache: true, isStale: false, queryKey, requestDurationMs: null };
    } catch {
      await clearResourceCacheForResource(instance.instanceId, options.resource);
    }
  }

  const startedAt = Date.now();
  const requestOptions: RequestInit = {
    headers: createRequestHeaders(
      createRequestMetadata(user, locale, options.idempotencyKey),
      options.body !== undefined,
      {},
      options.ifMatch,
    ),
    credentials: 'include',
    method: options.method ?? 'GET',
  };

  if (options.body !== undefined) {
    requestOptions.body = JSON.stringify(options.body);
  }

  if (requestOptions.method !== 'GET') {
    const network = await NetInfo.fetch();
    if (network.isConnected === false || network.isInternetReachable === false) throw new NetaClientError('NETWORK_ERROR', 'Çevrimdışıyken değişiklik yapılamaz.');
  }

  let data: unknown;
  auth.assertCurrent();
  try {
    ({ data } = await authenticatedJsonRequest<unknown>(instance, createApiUrl(instance.apiBaseUrl, options.path), {
      ...requestOptions,
      ...(requiredCapability === 'ai.assistant.v1' ? { timeoutMs: 45_000 } : {}),
      missingEndpointMessage:
        'Bu Neta sunucusu bu ekran için gereken mobil API endpoint’ini henüz sunmuyor.',
    }, auth.generation));
  } catch (value) {
    const error = toClientError(value);
    if (requestOptions.method === 'GET' && (error.code === 'NETWORK_ERROR' || error.code === 'TIMEOUT')) {
      const stale = await readResourceCache<T>(queryKey, cachePolicy, true);
      auth.assertCurrent();
      if (stale) return { cachedAt: stale.storedAt, data: options.parser(stale.value), fromCache: true, isStale: true, queryKey, requestDurationMs: Date.now() - startedAt };
    }
    throw error;
  }
  const parsed = options.parser(data);
  auth.assertCurrent();
  if (options.resource === 'dashboard') recordPerformanceSample('dashboard-data', Date.now() - startedAt);

  if (requestOptions.method !== 'GET') {
    const invalidatedResources = new Set(options.invalidates ?? [options.resource]);
    await Promise.all(
      [...invalidatedResources].map((resource) =>
        clearResourceCacheForResource(instance.instanceId, resource),
      ),
    );
  }

  if (isRead) await auth.commit(() => writeResourceCache(queryKey, cachePolicy, parsed));
  auth.assertCurrent();

  return {
    data: parsed,
    cachedAt: null,
    fromCache: false,
    isStale: false,
    queryKey,
    requestDurationMs: Date.now() - startedAt,
  };
}

function capabilityFor(path: string): string | null {
  if (path.startsWith('chat/') || path === 'finance/analysis' || /projects\/[^/]+\/risk-analysis/.test(path)) return 'ai.assistant.v1';
  if (path.startsWith('portal/')) return 'portal.client.v1';
  if (path === 'device-sessions' || path.startsWith('device-sessions/')) return 'auth.device-pairing.v1';
  if (path.startsWith('finance/')) return 'freelancer.finance.v1';
  if (path.startsWith('journal/')) return 'freelancer.journal.v1';
  if (path.startsWith('settings/locales')) return 'instance.locales.admin.v1';
  if (path.startsWith('settings/') || path.startsWith('me/profile') || path.startsWith('me/password') || path.startsWith('me/sessions')) return 'freelancer.settings.v1';
  if (path === 'files' || /projects\/[^/]+\/assets/.test(path)) return 'files.v1';
  return null;
}

function createRequestMetadata(
  user: MeProfile,
  locale: string,
  idempotencyKey?: string,
): RequestMetadata {
  const metadata: RequestMetadata = {
    client: 'mobile',
    locale,
    platform: Platform.OS,
    role: user.role,
    version: Constants.expoConfig?.version ?? '0.0.0',
  };

  if (idempotencyKey) {
    metadata.idempotencyKey = idempotencyKey;
  }

  return metadata;
}

function createRequestHeaders(metadata: RequestMetadata, hasBody: boolean, authHeaders: Record<string, string>, ifMatch?: string): Record<string, string> {
  const headers = {
    'Accept-Language': metadata.locale,
    ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
    'X-Neta-Client': metadata.client,
    'X-Neta-Client-Version': metadata.version,
    'X-Neta-Platform': metadata.platform,
    ...authHeaders,
    ...(ifMatch ? { 'If-Match': `"${ifMatch}"` } : {}),
  };

  return metadata.idempotencyKey
    ? { ...headers, 'Idempotency-Key': metadata.idempotencyKey }
    : headers;
}
