import assert from 'node:assert/strict';
import test from 'node:test';

import { NetaClientError, redactErrorMessage, toClientError, upstreamErrorMessage } from './errors.ts';

test('classifies Expo native fetch errors without exposing their details', () => {
  const error = new Error('fetch failed: TLS failure for https://private.test/?token=private-value');
  assert.equal(error.name, 'Error');
  const result = toClientError(error, 'Giriş yapılamadı.');
  assert.equal(result.code, 'NETWORK_ERROR');
  assert.equal(result.message, 'Sunucuya ulaşılamadı.');
  assert.doesNotMatch(result.message, /private/);
});

test('recognizes wrapped native cancellation and preserves application errors', () => {
  const error = new Error('fetch failed: The operation was aborted.', {
    cause: new DOMException('Cancelled', 'AbortError'),
  });
  assert.equal(toClientError(error).code, 'TIMEOUT');
  const applicationError = new NetaClientError('AUTH_FAILED', 'Giriş doğrulanamadı.');
  assert.equal(toClientError(applicationError), applicationError);
  assert.equal(toClientError(new Error('unrelated')).code, 'UNKNOWN');
});

test('redacts credentials from server errors', () => {
  const safe = redactErrorMessage('provider api_key=sk-private-value');
  assert.doesNotMatch(safe, /sk-private-value/);
  assert.equal(redactErrorMessage('Geçersiz istek.'), 'Geçersiz istek.');
  assert.doesNotMatch(redactErrorMessage('Authorization: Bearer private-value'), /private-value/);
  assert.doesNotMatch(redactErrorMessage('reset_token=private-reset'), /private-reset/);
  assert.doesNotMatch(redactErrorMessage('eyJhbGciOiJIUzI1NiJ9.payload.signature'), /payload/);
});

test('maps upstream errors without provider details', () => {
  assert.match(upstreamErrorMessage('UPSTREAM_TIMEOUT'), /zamanında/);
  assert.match(upstreamErrorMessage('SERVICE_UNAVAILABLE'), /yapılandırılmamış|kullanılamıyor/);
});
