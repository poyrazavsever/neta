import { isNetaMeProfile } from '@neta/api-contracts';

import { NetaClientError } from '../api/errors.ts';
import type { MeProfile } from '../instance/types.ts';

export function normalizeMeProfile(value: unknown): MeProfile {
  if (!isNetaMeProfile(value)) {
    throw new NetaClientError('AUTH_REQUIRED', 'Oturum doğrulanamadı.');
  }
  return {
    disabled: value.user.disabled,
    email: value.user.email,
    id: value.user.id,
    name: value.user.name,
    role: value.user.role,
    preferences: value.preferences,
  };
}
