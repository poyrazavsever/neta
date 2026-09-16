import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { fetch as expoFetch } from 'expo/fetch';
import { randomUUID } from 'expo-crypto';
import type { DeviceTokenPair, PairingExchangePayload } from '@neta/api-contracts';
import { isDeviceTokenPair } from '@neta/api-contracts';

import { NetaClientError } from '@/lib/api/errors';
import { createApiUrl, fetchJson, fetchResponse, type FetchJsonOptions } from '@/lib/api/http';
import { secureStorage } from '@/lib/storage/secure-storage';

import type { MeProfile, StoredInstance } from '../instance/types';
import { normalizeSetCookieHeader } from './auth-material';
import { normalizeMeProfile } from './me-contract';
import { createSessionCoordinator, StaleAuthSessionError } from './session-coordinator';
import { mutationRequests } from '../resource/mutation-coordinator';
import { matchesNativeActor } from './actor-binding';
import { isRefreshSessionInvalidatingError, rotateDeviceTokens } from './device-refresh-operation';

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
const REFRESH_REQUEST_NAME = 'auth.refresh-request';
const sessions = createSessionCoordinator<DeviceTokenPair>();

export function createNativeAuthClient(instance: StoredInstance): NativeAuthClient {
  return {
    pairDevice: (credential) => pairDevice(instance, credential),
    getMe: () => getMe(instance),
    signInEmail: (email, password) => signInEmail(instance, email, password),
    signOut: () => signOut(instance),
  };
}

export async function clearNativeAuthSession(instanceId: string): Promise<void> {
  await resetAuthSession(instanceId);
}

async function resetAuthSession(instanceId: string): Promise<number> {
  mutationRequests.clear(instanceId);
  const generation = sessions.invalidate(instanceId);
  await sessions.commit(instanceId, generation, async () => {
    await Promise.all([
      secureStorage.remove(instanceId, SESSION_NAME),
      secureStorage.remove(instanceId, COOKIE_NAME),
      secureStorage.remove(instanceId, BEARER_NAME),
      secureStorage.remove(instanceId, REFRESH_REQUEST_NAME),
    ]);
  });
  return generation;
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
  const generation = await resetAuthSession(instance.instanceId);
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
    credentials: 'omit', transport: expoFetch,
  });
  if (!isDeviceTokenPair(data)) throw new NetaClientError('SERVER_ERROR', 'Pairing token yanıtı geçersiz.');
  await commitAuth(instance.instanceId, generation, async () => {
    await secureStorage.set(instance.instanceId, BEARER_NAME, JSON.stringify(data));
    await secureStorage.remove(instance.instanceId, COOKIE_NAME);
  });
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

  const generation = await resetAuthSession(instance.instanceId);
  const response = await fetchJson<SignInResponse>(new URL('/api/auth/sign-in/email', instance.origin).toString(), {
    body: JSON.stringify({ email: trimmedEmail, password }),
    method: 'POST',
    headers: mobileHeaders(instance),
    credentials: 'omit',
    transport: expoFetch,
  });

  await commitAuth(instance.instanceId, generation, () => persistAuthMaterial(instance.instanceId, response.response, response.data));

  const profile = await getMe(instance);
  const signedInUser = response.data.user;
  if (!signedInUser || typeof signedInUser !== 'object' || !('id' in signedInUser) || signedInUser.id !== profile.id) {
    await clearNativeAuthSession(instance.instanceId);
    throw new NetaClientError('AUTH_FAILED', 'Giriş yapılan hesap doğrulanamadı.');
  }
  return profile;
}

async function signOut(instance: StoredInstance): Promise<void> {
  const tokens = await readDeviceTokens(instance.instanceId);
  try {
    if (tokens?.deviceSessionId) {
      await authFetch(instance, createApiUrl(instance.apiBaseUrl, `device-sessions/${tokens.deviceSessionId}`), { method: 'DELETE' });
    } else {
      await authFetch(instance, '/api/auth/sign-out', { body: '{}', method: 'POST' });
    }
  } catch (error) {
    // A password change or remote revoke already ended the server session.
    if (!(error instanceof NetaClientError) ||
        (error.code !== 'AUTH_REQUIRED' && error.code !== 'FORBIDDEN')) throw error;
  } finally {
    await clearNativeAuthSession(instance.instanceId);
  }
}

async function getMe(instance: StoredInstance): Promise<MeProfile> {
  const generation = sessions.snapshot(instance.instanceId);
  const { data } = await authFetch<unknown>(instance, createApiUrl(instance.apiBaseUrl, 'me'));
  const profile = normalizeMeProfile(data);

  if (profile.disabled) {
    if (sessions.current(instance.instanceId, generation)) await clearNativeAuthSession(instance.instanceId);
    throw new NetaClientError('AUTH_REQUIRED', 'Bu kullanıcı devre dışı bırakılmış.');
  }

  await commitAuth(instance.instanceId, generation, () => secureStorage.set(instance.instanceId, SESSION_NAME, JSON.stringify(profile)));

  return profile;
}

export async function authenticatedJsonRequest<T>(
  instance: StoredInstance,
  pathOrUrl: string,
  options: FetchJsonOptions = {},
  expectedGeneration?: number,
) {
  return authenticatedRequest(instance, pathOrUrl, options, fetchJson<T>, expectedGeneration);
}

export async function bindNativeActor(instance: StoredInstance, user: MeProfile) {
  const generation = sessions.snapshot(instance.instanceId);
  const raw = await secureStorage.get(instance.instanceId, SESSION_NAME);
  const actor: unknown = raw ? JSON.parse(raw) : null;
  const assertCurrent = () => { if (!sessions.current(instance.instanceId, generation)) throw authChanged(); };
  assertCurrent();
  if (!matchesNativeActor(actor, user)) throw authChanged();
  return { generation, assertCurrent, commit: (write: () => Promise<void>) => commitAuth(instance.instanceId, generation, write) };
}

export async function authenticatedFileRequest(instance: StoredInstance, url: string, user: MeProfile) {
  const auth = await bindNativeActor(instance, user);
  return authenticatedRequest(instance, url, { method: 'GET' }, fetchResponse, auth.generation);
}

async function authenticatedRequest<T>(
  instance: StoredInstance,
  pathOrUrl: string,
  options: FetchJsonOptions,
  send: (url: string, options: FetchJsonOptions) => Promise<T>,
  expectedGeneration?: number,
) {
  const url = pathOrUrl.startsWith('http') ? pathOrUrl : new URL(pathOrUrl, instance.origin).toString();
  if (new URL(url).origin !== new URL(instance.origin).origin) throw new NetaClientError('UNTRUSTED_ORIGIN', 'İstek seçilen sunucunun dışına çıkamaz.');
  const generation = sessions.snapshot(instance.instanceId);
  if (expectedGeneration !== undefined && generation !== expectedGeneration) throw authChanged();
  const authHeaders = await getNativeAuthHeaders(instance);
  const headers = new Headers(mobileHeaders(instance));
  new Headers(options.headers).forEach((value, key) => headers.set(key, value));
  if (options.body instanceof FormData) headers.delete('Content-Type');
  for (const [key, value] of Object.entries(authHeaders)) headers.set(key, value);
  if (!sessions.current(instance.instanceId, generation)) throw authChanged();

  try {
    const result = await send(url, {
      ...options,
      credentials: 'omit',
      transport: options.transport ?? expoFetch,
      headers: Object.fromEntries(headers),
    });
    if (!sessions.current(instance.instanceId, generation)) throw authChanged();
    return result;
  } catch (error) {
    if (!(error instanceof NetaClientError) || error.code !== 'AUTH_REQUIRED' ||
        url.includes('/device-sessions/refresh') || url.includes('/pairing/exchange')) throw error;
    if (!sessions.current(instance.instanceId, generation)) throw authChanged();
    const tokens = await readDeviceTokens(instance.instanceId);
    if (!tokens) throw error;
    const refreshed = await refreshDeviceTokens(instance, tokens);
    headers.set('Authorization', `Bearer ${refreshed.accessToken}`);
    const result = await send(url, {
      ...options,
      credentials: 'omit',
      transport: options.transport ?? expoFetch,
      headers: Object.fromEntries(headers),
    });
    if (!sessions.current(instance.instanceId, generation)) throw authChanged();
    return result;
  }
}

const authFetch = authenticatedJsonRequest;

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
  const generation = sessions.snapshot(instance.instanceId);
  return sessions.refresh(instance.instanceId, generation, async () => {
    try {
      const stored = await readDeviceTokens(instance.instanceId);
      if (!stored || !sessions.current(instance.instanceId, generation)) throw new StaleAuthSessionError();
      // A caller may have read its token before another refresh completed.
      if (stored.refreshToken !== current.refreshToken) return stored;
      return await rotateDeviceTokens(current, {
        readPending: () => secureStorage.get(instance.instanceId, REFRESH_REQUEST_NAME),
        createRequestId: randomUUID,
        savePending: (request) => secureStorage.set(instance.instanceId, REFRESH_REQUEST_NAME, JSON.stringify(request)),
        exchange: async (request) => (await fetchJson<unknown>(createApiUrl(instance.apiBaseUrl, 'device-sessions/refresh'), {
          body: JSON.stringify(request), headers: mobileHeaders(instance), method: 'POST',
          credentials: 'omit', transport: expoFetch,
        })).data,
        saveTokens: (next) => secureStorage.set(instance.instanceId, BEARER_NAME, JSON.stringify(next)),
        clearPending: () => secureStorage.remove(instance.instanceId, REFRESH_REQUEST_NAME),
        commit: (write) => commitAuth(instance.instanceId, generation, write),
      });
    } catch (error) {
      if (sessions.current(instance.instanceId, generation) && isRefreshSessionInvalidatingError(error)) await clearNativeAuthSession(instance.instanceId);
      if (error instanceof StaleAuthSessionError) throw authChanged();
      throw error;
    }
  });
}

async function commitAuth(instanceId: string, generation: number, write: () => Promise<void>): Promise<void> {
  if (!await sessions.commit(instanceId, generation, write)) throw authChanged();
}

function authChanged(): NetaClientError {
  return new NetaClientError('AUTH_REQUIRED', 'Oturum değişti; yeniden giriş yapın.');
}

function mobileHeaders(instance: StoredInstance): Record<string, string> {
  return {
    Origin: new URL(instance.origin).origin,
    'Accept-Language': instance.defaultLocale,
    'Content-Type': 'application/json',
    'X-Neta-Client': 'mobile',
    'X-Neta-Client-Version': Constants.expoConfig?.version ?? '0.0.0',
    'X-Neta-Platform': Platform.OS,
  };
}

function createInstallId(): string {
  return randomUUID();
}
