import { isDeviceTokenPair, type DeviceRefreshPayload, type DeviceTokenPair } from '@neta/api-contracts';
import { NetaClientError } from '../api/errors.ts';

type PendingRefresh = Required<DeviceRefreshPayload>;
type RefreshIO = {
  readPending(): Promise<string | null>;
  createRequestId(): string;
  savePending(value: PendingRefresh): Promise<void>;
  exchange(value: PendingRefresh): Promise<unknown>;
  saveTokens(value: DeviceTokenPair): Promise<void>;
  clearPending(): Promise<void>;
  commit(write: () => Promise<void>): Promise<void>;
};

export async function rotateDeviceTokens(current: DeviceTokenPair, io: RefreshIO): Promise<DeviceTokenPair> {
  let pending: PendingRefresh | undefined;
  const raw = await io.readPending();
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    if (parsed && typeof parsed === 'object' && 'refreshToken' in parsed && parsed.refreshToken === current.refreshToken &&
        'requestId' in parsed && typeof parsed.requestId === 'string' && /^[A-Za-z0-9_-]{16,128}$/.test(parsed.requestId)) {
      pending = { refreshToken: current.refreshToken, requestId: parsed.requestId };
    }
  } catch { /* An invalid local record must never select another token's retry. */ }
  pending ??= { refreshToken: current.refreshToken, requestId: io.createRequestId() };
  // Persist before sending: response loss or a process restart keeps the same operation ID.
  const request = pending;
  await io.commit(() => io.savePending(request));
  const data = await io.exchange(request);
  if (!isDeviceTokenPair(data)) throw new NetaClientError('SERVER_ERROR', 'Refresh token yanıtı geçersiz.');
  const next: DeviceTokenPair = { ...data, ...(current.deviceSessionId ? { deviceSessionId: current.deviceSessionId } : {}) };
  await io.commit(async () => { await io.saveTokens(next); await io.clearPending(); });
  return next;
}

export function isRefreshSessionInvalidatingError(error: unknown): boolean {
  return error instanceof NetaClientError && (error.code === 'AUTH_REQUIRED' || error.code === 'FORBIDDEN');
}
