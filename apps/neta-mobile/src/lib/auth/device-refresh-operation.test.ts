import assert from 'node:assert/strict';
import test from 'node:test';
import type { DeviceTokenPair } from '@neta/api-contracts';
import { NetaClientError } from '../api/errors.ts';
import { isRefreshSessionInvalidatingError, rotateDeviceTokens } from './device-refresh-operation.ts';
import { createSessionCoordinator, StaleAuthSessionError } from './session-coordinator.ts';

const current: DeviceTokenPair = {
  accessToken: 'A'.repeat(43), refreshToken: 'R'.repeat(43), deviceSessionId: 'device-id', tokenType: 'Bearer',
  accessExpiresAt: '2026-09-16T10:00:00.000Z', refreshExpiresAt: '2026-10-16T10:00:00.000Z',
};
const successor: DeviceTokenPair = { ...current, accessToken: 'B'.repeat(43), refreshToken: 'S'.repeat(43) };
delete successor.deviceSessionId;

function storage() {
  let pending: string | null = null;
  let tokens: DeviceTokenPair | null = current;
  let created = 0;
  const sent: unknown[] = [];
  const io = {
    readPending: async () => pending,
    createRequestId: () => `operation-${String(++created).padStart(8, '0')}`,
    savePending: async (value: unknown) => { pending = JSON.stringify(value); },
    exchange: async (value: unknown): Promise<unknown> => { sent.push(value); return successor; },
    saveTokens: async (value: DeviceTokenPair) => { tokens = value; },
    clearPending: async () => { pending = null; },
    commit: async (write: () => Promise<void>) => { await write(); },
  };
  return { io, sent, get pending() { return pending; }, get tokens() { return tokens; }, get created() { return created; }, clear: async () => { pending = null; tokens = null; } };
}

test('response loss preserves the persisted operation ID; a fresh client retries and saves the exact successor', async () => {
  const state = storage();
  const droppedResponse = new NetaClientError('NETWORK_ERROR', 'Response lost');
  await assert.rejects(rotateDeviceTokens(current, { ...state.io, exchange: async (request) => { state.sent.push(request); throw droppedResponse; } }), droppedResponse);
  assert.equal(state.created, 1);
  assert.deepEqual(state.tokens, current);
  assert.ok(state.pending);
  assert.equal(isRefreshSessionInvalidatingError(droppedResponse), false);
  // There is no process-local request-ID cache: a new invocation reads secure state.
  const next = await rotateDeviceTokens(current, { ...state.io });
  assert.deepEqual(state.sent[0], state.sent[1]);
  assert.equal(state.created, 1);
  assert.equal(next.deviceSessionId, current.deviceSessionId);
  assert.equal(next.refreshToken, successor.refreshToken);
  assert.deepEqual(state.tokens, next);
  assert.equal(state.pending, null);
});

test('another token or corrupted local retry record cannot select a foreign operation', async () => {
  const state = storage();
  for (const value of [{ refreshToken: 'foreign-token', requestId: 'foreign-operation-id' }, { refreshToken: current.refreshToken, requestId: '\ninvalid' }]) {
    await state.io.savePending(value);
    await rotateDeviceTokens(current, state.io);
    assert.notEqual((state.sent.at(-1) as { requestId: string }).requestId, value.requestId);
  }
  const separateInstance = storage();
  await rotateDeviceTokens(current, separateInstance.io);
  assert.equal(separateInstance.created, 1);
  assert.equal(state.created, 2);
});

test('pending-state persistence failure prevents sending; malformed responses retain retry state and old credentials', async () => {
  const state = storage();
  await assert.rejects(rotateDeviceTokens(current, { ...state.io, savePending: async () => { throw new Error('Storage unavailable'); } }), /Storage unavailable/);
  assert.equal(state.sent.length, 0);
  await assert.rejects(rotateDeviceTokens(current, { ...state.io, exchange: async () => ({ secret: 'invalid-response' }) }), /yanıtı geçersiz/);
  assert.deepEqual(state.tokens, current);
  assert.ok(state.pending);
});

test('logout clears pending retry state and a late refresh cannot restore credentials or the pending operation', async () => {
  const state = storage();
  const sessions = createSessionCoordinator<DeviceTokenPair>();
  const generation = sessions.snapshot('instance');
  let deliver!: (value: unknown) => void;
  let started!: () => void;
  const sent = new Promise<void>((resolve) => { started = resolve; });
  const network = new Promise<unknown>((resolve) => { deliver = resolve; });
  const rotate = rotateDeviceTokens(current, {
    ...state.io,
    exchange: async () => { started(); return network; },
    commit: async (write) => { if (!await sessions.commit('instance', generation, write)) throw new StaleAuthSessionError(); },
  });
  const rejected = assert.rejects(rotate, StaleAuthSessionError);
  await sent;
  await sessions.commit('instance', sessions.invalidate('instance'), state.clear);
  deliver(successor);
  await rejected;
  assert.equal(state.tokens, null);
  assert.equal(state.pending, null);
});

test('only explicit auth rejection invalidates refresh credentials; transport, timeout and server failures remain retryable', () => {
  for (const code of ['NETWORK_ERROR', 'TIMEOUT', 'SERVER_ERROR', 'SERVICE_UNAVAILABLE'] as const) assert.equal(isRefreshSessionInvalidatingError(new NetaClientError(code, 'Failure')), false);
  for (const code of ['AUTH_REQUIRED', 'FORBIDDEN'] as const) assert.equal(isRefreshSessionInvalidatingError(new NetaClientError(code, 'Rejected')), true);
  assert.equal(isRefreshSessionInvalidatingError(new Error('Unknown failure')), false);
});
