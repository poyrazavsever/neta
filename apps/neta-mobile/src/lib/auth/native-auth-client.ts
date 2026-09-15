import { Platform } from 'react-native';
import Constants from 'expo-constants';
import type { DeviceTokenPair, PairingExchangePayload } from '@neta/api-contracts';
import { isDeviceTokenPair } from '@neta/api-contracts';

import { NetaClientError } from '@/lib/api/errors';
import { createApiUrl, fetchJson } from '@/lib/api/http';
import { secureStorage } from '@/lib/storage/secure-storage';

import type { MeProfile, StoredInstance } from '../instance/types';
import { normalizeSetCookieHeader } from './auth-material';
import { normalizeMeProfile } from './me-contract';

export { normalizeMeProfile } from './me-contract';

type SignInResponse = { user?: unknown };

type NativeAuthClient = {
  pairDevice: (credential: { code?: string; secret?: string }) => Promise<MeProfile>;
  getMe: () => Promise<MeProfile>;
  signInEmail: (email: string, password: string) => Promise<MeProfile>;
  signOut: () => Promise<void>;
};

const SESSION_NAME = 'auth.session';
const COOKIE_NAME = 'auth.cookie';
const BEARER_NAME = 'auth.bearer';
const INSTALL_ID_NAME = 'device.install-id';
const refreshes = new Map<string, Promise<DeviceTokenPair>>();

export function createNativeAuthClient(instance: StoredInstance): NativeAuthClient {
  return {
    pairDevice: (credential) => pairDevice(instance, credential),
    getMe: () => getMe(instance),
    signInEmail: (email, password) => signInEmail(instance, email, password),
    signOut: () => signOut(instance),
  };
}

export async function clearNativeAuthSession(instanceId: string): Promise<void> {
  await Promise.all([
    secureStorage.remove(instanceId, SESSION_NAME),
    secureStorage.remove(instanceId, COOKIE_NAME),
    secureStorage.remove(instanceId, BEARER_NAME),
  ]);
}

export async function getNativeAuthHeaders(instanceOrId: StoredInstance | string): Promise<Record<string, string>> {
  const instanceId = typeof instanceOrId === 'string' ? instanceOrId : instanceOrId.instanceId;
  let material = await readDeviceTokens(instanceId);
  if (material && typeof instanceOrId !== 'string' && Date.parse(material.accessExpiresAt) <= Date.now() + 30_000) {
    material = await refreshDeviceTokens(instanceOrId, material);
  }
  if (material) return { Authorization: `Bearer ${material.accessToken}` };
  const cookie = await secureStorage.get(instanceId, COOKIE_NAME);
  return cookie ? { Cookie: cookie } : {};
}

async function pairDevice(
  instance: StoredInstance,
  credential: { code?: string; secret?: string },
): Promise<MeProfile> {
  let installId = await secureStorage.get(instance.instanceId, INSTALL_ID_NAME);
  if (!installId) {
    installId = createInstallId();
    await secureStorage.set(instance.instanceId, INSTALL_ID_NAME, installId);
  }
  const payload: PairingExchangePayload = {
    ...credential,
    appVersion: Constants.expoConfig?.version ?? '0.0.0',
    deviceName: `Neta ${Platform.OS === 'ios' ? 'iPhone/iPad' : 'Android'}`,
    installId,
    platform: Platform.OS === 'ios' ? 'ios' : 'android',
  };
  const osMajor = String(Platform.Version).split('.')[0];
  if (osMajor) payload.osMajor = osMajor;
  const { data } = await fetchJson<unknown>(createApiUrl(instance.apiBaseUrl, 'pairing/exchange'), {
    body: JSON.stringify(payload),
    headers: mobileHeaders(instance),
    method: 'POST',
  });
  if (!isDeviceTokenPair(data)) throw new NetaClientError('SERVER_ERROR', 'Pairing token yanıtı geçersiz.');
  await secureStorage.set(instance.instanceId, BEARER_NAME, JSON.stringify(data));
  await secureStorage.remove(instance.instanceId, COOKIE_NAME);
  return getMe(instance);
}

async function signInEmail(
  instance: StoredInstance,
  email: string,
  password: string,
): Promise<MeProfile> {
  const trimmedEmail = email.trim();

  if (!trimmedEmail || !password) {
    throw new NetaClientError('AUTH_FAILED', 'Email ve şifre gerekli.');
  }

  const response = await authFetch<SignInResponse>(instance, '/api/auth/sign-in/email', {
    body: JSON.stringify({ email: trimmedEmail, password }),
    method: 'POST',
  });

  await persistAuthMaterial(instance.instanceId, response.response, response.data);

  return getMe(instance);
}

async function signOut(instance: StoredInstance): Promise<void> {
  const tokens = await readDeviceTokens(instance.instanceId);
  try {
    if (tokens?.deviceSessionId) {
      await authFetch(instance, createApiUrl(instance.apiBaseUrl, `device-sessions/${tokens.deviceSessionId}`), { method: 'DELETE' });
    } else {
      await authFetch(instance, '/api/auth/sign-out', { method: 'POST' });
    }
  } finally {
    await clearNativeAuthSession(instance.instanceId);
  }
}

async function getMe(instance: StoredInstance): Promise<MeProfile> {
  const { data } = await authFetch<unknown>(instance, createApiUrl(instance.apiBaseUrl, 'me'));
  const profile = normalizeMeProfile(data);

  if (profile.disabled) {
    await clearNativeAuthSession(instance.instanceId);
    throw new NetaClientError('AUTH_REQUIRED', 'Bu kullanıcı devre dışı bırakılmış.');
  }

  await secureStorage.set(instance.instanceId, SESSION_NAME, JSON.stringify(profile));

  return profile;
}

async function authFetch<T>(
  instance: StoredInstance,
  pathOrUrl: string,
  options: RequestInit = {},
) {
  const authHeaders = await getNativeAuthHeaders(instance);
  const url = pathOrUrl.startsWith('http') ? pathOrUrl : new URL(pathOrUrl, instance.origin).toString();

  try {
    return await fetchJson<T>(url, {
      ...options,
      credentials: 'include',
      headers: { ...mobileHeaders(instance), ...authHeaders, ...options.headers },
    });
  } catch (error) {
    if (!(error instanceof NetaClientError) || error.code !== 'AUTH_REQUIRED' ||
        url.includes('/device-sessions/refresh') || url.includes('/pairing/exchange')) throw error;
    const tokens = await readDeviceTokens(instance.instanceId);
    if (!tokens) throw error;
    const refreshed = await refreshDeviceTokens(instance, tokens);
    return fetchJson<T>(url, {
      ...options,
      credentials: 'include',
      headers: { ...mobileHeaders(instance), Authorization: `Bearer ${refreshed.accessToken}`, ...options.headers },
    });
  }
}

async function persistAuthMaterial(
  instanceId: string,
  response: Response,
  _body: SignInResponse,
): Promise<void> {
  const cookie = normalizeSetCookieHeader(response.headers.get('set-cookie'));

  if (cookie) {
    await secureStorage.set(instanceId, COOKIE_NAME, cookie);
  }

  // Cookie login and owner pairing are mutually exclusive per instance.
  await secureStorage.remove(instanceId, BEARER_NAME);
}

async function readDeviceTokens(instanceId: string): Promise<DeviceTokenPair | null> {
  const raw = await secureStorage.get(instanceId, BEARER_NAME);
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    return isDeviceTokenPair(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

async function refreshDeviceTokens(instance: StoredInstance, current: DeviceTokenPair): Promise<DeviceTokenPair> {
  const existing = refreshes.get(instance.instanceId);
  if (existing) return existing;
  const pending = (async () => {
    try {
      const { data } = await fetchJson<unknown>(createApiUrl(instance.apiBaseUrl, 'device-sessions/refresh'), {
        body: JSON.stringify({ refreshToken: current.refreshToken }),
        headers: mobileHeaders(instance),
        method: 'POST',
      });
      if (!isDeviceTokenPair(data)) throw new NetaClientError('SERVER_ERROR', 'Refresh token yanıtı geçersiz.');
      const next: DeviceTokenPair = {
        ...data,
        ...(current.deviceSessionId ? { deviceSessionId: current.deviceSessionId } : {}),
      };
      await secureStorage.set(instance.instanceId, BEARER_NAME, JSON.stringify(next));
      return next;
    } catch (error) {
      await clearNativeAuthSession(instance.instanceId);
      throw error;
    } finally {
      refreshes.delete(instance.instanceId);
    }
  })();
  refreshes.set(instance.instanceId, pending);
  return pending;
}

function mobileHeaders(instance: StoredInstance): Record<string, string> {
  return {
    'Accept-Language': instance.defaultLocale,
    'Content-Type': 'application/json',
    'X-Neta-Client': 'mobile',
    'X-Neta-Client-Version': Constants.expoConfig?.version ?? '0.0.0',
    'X-Neta-Platform': Platform.OS,
  };
}

function createInstallId(): string {
  const cryptoApi = globalThis.crypto;
  return typeof cryptoApi?.randomUUID === 'function'
    ? cryptoApi.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
}
