import { createIdempotencyKey, isChatStreamEvent, type ChatMessage, type ChatMessageMutationPayload, type ChatStreamEvent } from '@neta/api-contracts';

import { NetaClientError } from '../../lib/api/errors.ts';

export type ChatStreamRequest = { idempotencyKey: string; payload: ChatMessageMutationPayload; sessionId?: string };

export function createChatStreamRequest(payload: ChatMessageMutationPayload, idempotencyKey?: string, sessionId?: string): ChatStreamRequest {
  return { idempotencyKey: idempotencyKey ?? createIdempotencyKey('chat-message'), payload, ...(sessionId ? { sessionId } : {}) };
}

export async function consumeChatStream(body: ReadableStream<Uint8Array>, signal: AbortSignal, assertCurrent: () => void, onEvent: (event: ChatStreamEvent) => void): Promise<ChatMessage> {
  const reader = body.getReader(); const decoder = new TextDecoder();
  const abortReader = () => { void reader.cancel().catch(() => {}); };
  signal.addEventListener('abort', abortReader, { once: true });
  let remainder = ''; let completed: ChatMessage | null = null; let bytes = 0;
  try {
    while (true) {
      assertCurrent(); signal.throwIfAborted();
      const part = await reader.read();
      assertCurrent(); signal.throwIfAborted();
      bytes += part.value?.byteLength ?? 0;
      if (bytes > 512 * 1024) throw new NetaClientError('UPSTREAM_ERROR', 'AI akışı boyut sınırını aştı.');
      const parsed = parseNdjsonChunk(remainder, part.done ? decoder.decode() : decoder.decode(part.value, { stream: true }), part.done);
      remainder = parsed.remainder;
      for (const event of parsed.events) {
        if (event.type === 'error') throw new NetaClientError(event.code, 'AI yanıtı oluşturulamadı; yeniden deneyin.');
        if (completed) throw new NetaClientError('UPSTREAM_ERROR', 'AI akış sırası geçersiz.');
        if (event.type === 'message.completed') {
          if (event.message.role !== 'assistant') throw new NetaClientError('UPSTREAM_ERROR', 'AI yanıtı geçersiz.');
          completed = event.message;
        }
        onEvent(event);
      }
      if (part.done) break;
    }
    if (!completed) throw new NetaClientError('UPSTREAM_ERROR', 'AI akışı tamamlanmadan kesildi.');
    return completed;
  } catch (error) {
    if (signal.aborted) throw new NetaClientError('UPSTREAM_TIMEOUT', 'AI isteği durduruldu veya zaman aşımına uğradı.');
    throw error;
  } finally { signal.removeEventListener('abort', abortReader); await reader.cancel().catch(() => {}); reader.releaseLock(); }
}

export function parseNdjsonChunk(remainder: string, chunk: string, flush = false): { events: ChatStreamEvent[]; remainder: string } {
  const combined = remainder + chunk;
  const lines = combined.split('\n');
  const nextRemainder = flush ? '' : (lines.pop() ?? '');
  if (flush && lines.at(-1)?.trim() === '') lines.pop();
  const events = lines.filter((line) => line.trim()).map((line) => {
    let value: unknown;
    try { value = JSON.parse(line); } catch { throw new NetaClientError('UPSTREAM_ERROR', 'AI akışı geçersiz veri döndürdü.'); }
    if (!isChatStreamEvent(value)) throw new NetaClientError('UPSTREAM_ERROR', 'AI akış kontratı geçersiz.');
    return value;
  });
  return { events, remainder: nextRemainder };
}
