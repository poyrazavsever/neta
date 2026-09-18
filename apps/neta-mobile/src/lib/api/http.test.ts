import assert from 'node:assert/strict';
import test from 'node:test';

import { NetaClientError } from './errors.ts';
import { fetchJson } from './http.ts';

test('reports Better Auth rejected credentials as a localized login failure', async () => {
  await assert.rejects(fetchJson('https://neta.test/api/auth/sign-in/email', {
    method: 'POST',
    transport: async () => Response.json({
      code: 'INVALID_EMAIL_OR_PASSWORD', message: 'Invalid email or password',
    }, { status: 401 }),
  }), (error: unknown) => error instanceof NetaClientError && error.code === 'AUTH_FAILED' &&
    error.status === 401 && error.message === 'Email veya şifre hatalı.');
});

test('classifies timeouts even when the native transport loses the abort cause', async () => {
  await assert.rejects(fetchJson('https://neta.test/api/v1/me', {
    timeoutMs: 5,
    transport: async (_url, options) => new Promise<Response>((_resolve, reject) => {
      options.signal?.addEventListener('abort', () => reject(new Error('fetch failed: cancelled')), { once: true });
    }),
  }), (error: unknown) => error instanceof NetaClientError && error.code === 'TIMEOUT');
});

test('upload transport refuses even same-origin redirects without replaying the body', async () => {
  const calls: RequestInit[] = [];
  await assert.rejects(fetchJson('https://neta.test/api/v1/files', {
    body: new FormData(), method: 'POST', allowRedirects: false,
    transport: async (_url, options) => {
      calls.push(options);
      return new Response(null, { status: 307, headers: { location: '/api/v1/files/' } });
    },
  }), (error: unknown) => error instanceof NetaClientError && error.code === 'UNTRUSTED_ORIGIN');
  assert.equal(calls.length, 1);
  assert.equal(calls[0]?.redirect, 'manual');
});

test('forwards user cancellation to the active upload transport', async () => {
  const controller = new AbortController();
  const pending = fetchJson('https://neta.test/api/v1/files', {
    signal: controller.signal,
    transport: async (_url, options) => new Promise<Response>((_resolve, reject) => {
      options.signal?.addEventListener('abort', () => reject(new DOMException('Cancelled', 'AbortError')), { once: true });
      controller.abort();
    }),
  });
  await assert.rejects(pending, { name: 'AbortError' });
});

test('rejects cross-origin redirects before forwarding credentials or request bodies', async (context) => {
  const calls: string[] = [];
  context.mock.method(globalThis, 'fetch', async (url: string | URL | Request) => {
    calls.push(String(url));
    return new Response(null, { status: 307, headers: { location: 'https://other.test/api/v1/tasks' } });
  });
  await assert.rejects(fetchJson('https://neta.test/api/v1/tasks', {
    method: 'POST', headers: { Authorization: 'Bearer test', Cookie: 'test=value' }, body: '{"private":true}',
  }), (error: unknown) => error instanceof NetaClientError && error.code === 'UNTRUSTED_ORIGIN');
  assert.deepEqual(calls, ['https://neta.test/api/v1/tasks']);
});

test('allows redirects within the selected origin', async (context) => {
  const calls: string[] = [];
  context.mock.method(globalThis, 'fetch', async (url: string | URL | Request) => {
    calls.push(String(url));
    return calls.length === 1 ? new Response(null, { status: 307, headers: { location: '/api/v1/tasks/' } })
      : Response.json({ ok: true, data: [] });
  });
  assert.deepEqual((await fetchJson('https://neta.test/api/v1/tasks')).data, []);
  assert.deepEqual(calls, ['https://neta.test/api/v1/tasks', 'https://neta.test/api/v1/tasks/']);
});

test('preserves an HTML HTTP error instead of reporting a JSON parse failure', async (context) => {
  context.mock.method(globalThis, 'fetch', async () =>
    new Response('<!doctype html><title>Not found</title>', {
      headers: { 'content-type': 'text/html; charset=utf-8' },
      status: 404,
    }),
  );

  await assert.rejects(
    fetchJson('https://neta.test/api/v1/dashboard'),
    (error: unknown) =>
      error instanceof NetaClientError &&
      error.code === 'NOT_FOUND' &&
      error.status === 404 &&
      error.message === 'Sunucu 404 yanıtı döndürdü.',
  );
});

test('classifies an absent resource API route as a missing server capability', async (context) => {
  context.mock.method(globalThis, 'fetch', async () =>
    new Response('<!doctype html><title>Not found</title>', {
      headers: { 'content-type': 'text/html; charset=utf-8' },
      status: 404,
    }),
  );

  await assert.rejects(
    fetchJson('https://neta.test/api/v1/dashboard', {
      missingEndpointMessage: 'Mobil API endpoint’i bulunamadı.',
    }),
    (error: unknown) =>
      error instanceof NetaClientError &&
      error.code === 'MISSING_CAPABILITY' &&
      error.status === 404 &&
      error.message === 'Mobil API endpoint’i bulunamadı.',
  );
});

test('keeps JSON API errors and successful envelope responses intact', async (context) => {
  const fetchMock = context.mock.method(globalThis, 'fetch');
  fetchMock.mock.mockImplementationOnce(async () =>
    Response.json(
      { ok: false, error: { code: 'VALIDATION_ERROR', message: 'Geçersiz filtre.' } },
      { status: 422 },
    ),
  );

  await assert.rejects(
    fetchJson('https://neta.test/api/v1/projects'),
    (error: unknown) =>
      error instanceof NetaClientError &&
      error.code === 'VALIDATION_ERROR' &&
      error.status === 422 &&
      error.message === 'Geçersiz filtre.',
  );

  fetchMock.mock.mockImplementationOnce(async () =>
    Response.json({ ok: true, data: { id: 'project-a' } }),
  );

  const result = await fetchJson<{ id: string }>('https://neta.test/api/v1/projects/project-a');
  assert.deepEqual(result.data, { id: 'project-a' });
});

test('still rejects a successful non-JSON response', async (context) => {
  context.mock.method(globalThis, 'fetch', async () =>
    new Response('<!doctype html><title>Unexpected page</title>', {
      headers: { 'content-type': 'text/html; charset=utf-8' },
      status: 200,
    }),
  );

  await assert.rejects(
    fetchJson('https://neta.test/api/v1/projects'),
    (error: unknown) =>
      error instanceof NetaClientError &&
      error.code === 'SERVER_ERROR' &&
      error.status === 200 &&
      error.message === 'Sunucu JSON olmayan yanıt döndürdü.',
  );
});
