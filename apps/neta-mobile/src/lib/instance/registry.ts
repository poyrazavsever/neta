import AsyncStorage from '@react-native-async-storage/async-storage';

import { secureStorage } from '@/lib/storage/secure-storage';
import { clearNativeAuthSession } from '@/lib/auth/native-auth-client';
import { clearResourceCacheForInstance } from '@/lib/resource/resource-cache';
import { didInstanceIdentityChange } from './identity-policy';

import type { PublicCatalog, StoredInstance } from './types';

const ACTIVE_INSTANCE_KEY = 'neta.instance.active';
const INSTANCE_PREFIX = 'neta.instance.';
const CATALOG_NAME = 'public-catalog';

export type SaveInstanceResult = {
  instanceIdChanged: boolean;
  previousInstanceId: string | null;
};

export async function getActiveInstance(): Promise<StoredInstance | null> {
  const instanceId = await AsyncStorage.getItem(ACTIVE_INSTANCE_KEY);

  if (!instanceId) {
    return null;
  }

  return getStoredInstance(instanceId);
}

export async function getStoredInstance(instanceId: string): Promise<StoredInstance | null> {
  const raw = await AsyncStorage.getItem(createInstanceKey(instanceId));

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as StoredInstance;
  } catch {
    await AsyncStorage.removeItem(createInstanceKey(instanceId));
    return null;
  }
}

export async function updateStoredInstance(instance: StoredInstance): Promise<void> {
  await AsyncStorage.setItem(createInstanceKey(instance.instanceId), JSON.stringify(instance));
}

export async function saveDiscoveredInstance(
  instance: StoredInstance,
  catalog: PublicCatalog | null,
): Promise<SaveInstanceResult> {
  const previous = await getActiveInstance();
  const stored = await getStoredInstance(instance.instanceId);
  const changed = [previous, stored].filter((value): value is StoredInstance => value !== null && didInstanceIdentityChange(value, instance));
  const instanceIdChanged = changed.length > 0;

  for (const instanceId of new Set(changed.map((value) => value.instanceId))) {
    await clearInstanceSession(instanceId);
    await clearResourceCacheForInstance(instanceId);
    await AsyncStorage.multiRemove([
      createInstanceKey(instanceId),
      createCatalogKey(instanceId),
    ]);
  }

  await AsyncStorage.setItem(createInstanceKey(instance.instanceId), JSON.stringify(instance));
  await AsyncStorage.setItem(ACTIVE_INSTANCE_KEY, instance.instanceId);

  if (catalog) {
    await AsyncStorage.setItem(createCatalogKey(instance.instanceId), JSON.stringify(catalog));
  }

  return { instanceIdChanged, previousInstanceId: previous?.instanceId ?? null };
}

export async function clearActiveInstance(): Promise<void> {
  await AsyncStorage.removeItem(ACTIVE_INSTANCE_KEY);
}

export async function forgetInstance(instanceId: string): Promise<void> {
  const activeId = await AsyncStorage.getItem(ACTIVE_INSTANCE_KEY);
  await clearInstanceSession(instanceId);
  await AsyncStorage.multiRemove([
    createInstanceKey(instanceId),
    createCatalogKey(instanceId),
    ...(activeId === instanceId ? [ACTIVE_INSTANCE_KEY] : []),
  ]);
}

export async function clearInstanceSession(instanceId: string): Promise<void> {
  await clearNativeAuthSession(instanceId);
  await Promise.all([
    secureStorage.remove(instanceId, 'auth.session'),
    secureStorage.remove(instanceId, 'auth.cookie'),
    secureStorage.remove(instanceId, 'auth.bearer'),
    secureStorage.remove(instanceId, 'auth.csrf'),
    secureStorage.remove(instanceId, 'auth.user'),
  ]);
}

export function createInstanceKey(instanceId: string): string {
  return `${INSTANCE_PREFIX}${encodeURIComponent(instanceId)}`;
}

function createCatalogKey(instanceId: string): string {
  return `${createInstanceKey(instanceId)}.${CATALOG_NAME}`;
}
