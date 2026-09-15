import { NetaClientError } from '../api/errors.ts';
import type { StoredInstance } from './types.ts';

export function hasInstanceCapability(instance: StoredInstance, capability: string): boolean {
  return instance.capabilities?.includes(capability) ?? false;
}

export function requireInstanceCapability(instance: StoredInstance, capability: string): void {
  if (!hasInstanceCapability(instance, capability)) {
    throw new NetaClientError('INCOMPATIBLE_CLIENT', `Bu Neta instance'\u0131 ${capability} yetene\u011fini yay\u0131nlam\u0131yor.`);
  }
}
