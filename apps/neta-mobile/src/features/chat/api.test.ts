import assert from 'node:assert/strict';
import test from 'node:test';

import { consumeChatStream, createChatStreamRequest, parseNdjsonChunk } from './stream.ts';

test('parses NDJSON events split across native stream chunks', () => {
  const first = parseNdjsonChunk('', '{"type":"message.delta","delta":"Mer');
  assert.equal(first.events.length, 0);
  const second = parseNdjsonChunk(first.remainder, 'haba"}\n{"type":"message.delta","delta":"!"}\n');
  assert.deepEqual(second.events.map((event) => event.type), ['message.delta', 'message.delta']);
  assert.equal(second.remainder, '');
});

test('rejects unknown stream events without exposing payloads', () => {
  assert.throws(() => parseNdjsonChunk('', '{"type":"secret","token":"do-not-show"}\n'), /kontrat/);
});

test('reuses the idempotency key when retrying the same chat request', () => {
  const payload = { content: 'Tekrar dene', sourceLocale: 'tr' };
  const first = createChatStreamRequest(payload);
  const retry = createChatStreamRequest(payload, first.idempotencyKey);
  assert.equal(retry.idempotencyKey, first.idempotencyKey);
});

test('decodes split UTF-8 through the terminal assistant acknowledgement', async () => {
  const message = { id: 'assistant', role: 'assistant', content: 'Türkçe 🧭', createdAt: '2026-09-17T00:00:00.000Z', sourceLocale: 'tr' };
  const bytes = new TextEncoder().encode(JSON.stringify({ type: 'message.delta', delta: message.content }) + '\n' + JSON.stringify({ type: 'message.completed', message }) + '\n');
  let offset = 0;
  const body = new ReadableStream<Uint8Array>({ pull(controller) { if (offset === bytes.length) controller.close(); else controller.enqueue(bytes.slice(offset, ++offset)); } });
  const events: string[] = [];
  assert.deepEqual(await consumeChatStream(body, new AbortController().signal, () => {}, event => events.push(event.type)), message);
  assert.deepEqual(events, ['message.delta', 'message.completed']);
  assert.equal(body.locked, false);
});

test('stale auth discards new chunks and cancels the reader', async () => {
  let valid = true; let cancelled = false; let received = 0;
  const body = new ReadableStream<Uint8Array>({ pull(controller) { valid = false; controller.enqueue(new TextEncoder().encode('{"type":"message.delta","delta":"private"}\n')); }, cancel() { cancelled = true; } });
  await assert.rejects(consumeChatStream(body, new AbortController().signal, () => { if (!valid) throw Error('auth changed'); }, () => received++), /auth changed/);
  assert.equal(received, 0); assert.equal(cancelled, true); assert.equal(body.locked, false);
});

test('abort cancels a blocked read even when the transport ignores the signal', async () => {
  let cancelled = false;
  const abort = new AbortController();
  const body = new ReadableStream<Uint8Array>({ cancel() { cancelled = true; } });
  const result = consumeChatStream(body, abort.signal, () => {}, () => {});
  abort.abort();
  await assert.rejects(result, { code: 'UPSTREAM_TIMEOUT' });
  assert.equal(cancelled, true); assert.equal(body.locked, false);
});

test('missing acknowledgement and provider error events fail without exposing private messages', async () => {
  function body(value: string) { return new ReadableStream<Uint8Array>({ start(controller) { controller.enqueue(new TextEncoder().encode(value)); controller.close(); } }); }
  await assert.rejects(consumeChatStream(body('{"type":"message.delta","delta":"partial"}\n'), new AbortController().signal, () => {}, () => {}), /kesildi/);
  await assert.rejects(consumeChatStream(body('{"type":"error","code":"SERVICE_UNAVAILABLE","message":"private-provider-key"}\n'), new AbortController().signal, () => {}, () => {}), error => error instanceof Error && !error.message.includes('private-provider-key'));
  assert.equal(createChatStreamRequest({ content: 'hello', sourceLocale: 'tr' }, undefined, 'chat-a').sessionId, 'chat-a');
});
