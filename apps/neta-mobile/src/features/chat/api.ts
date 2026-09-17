import Constants from 'expo-constants';
import { fetch as expoFetch } from 'expo/fetch';
import { Platform } from 'react-native';

import {
  createIdempotencyKey,
  isChatMessage,
  isChatSession,
  isDeleteResult,
  isPaginatedResponse,
  isProjectRiskAnalysis,
  type ChatMessage,
  type ChatMessageMutationPayload,
  type ChatSession,
  type ChatStreamEvent,
  type DeleteResult,
  type PaginatedResponse,
  type ProjectRiskAnalysis,
} from '@neta/api-contracts';

import { NetaClientError, upstreamErrorMessage } from '@/lib/api/errors';
import { createApiUrl } from '@/lib/api/http';
import { authenticatedStreamRequest } from '@/lib/auth/native-auth-client';
import { requireInstanceCapability } from '@/lib/instance/capabilities';
import type { MeProfile, StoredInstance } from '@/lib/instance/types';
import { requestResource, type ResourceResult } from '@/lib/resource/api-client';
import { collectResourcePages } from '@/lib/resource/pagination';
import { consumeChatStream } from './stream.ts';

export function listChatSessions(instance: StoredInstance, user: MeProfile): Promise<ResourceResult<PaginatedResponse<ChatSession>>> {
  return collectResourcePages(cursor => requestResource(instance, user, { cachePolicy: 'none', filters: { cursor }, parser: parseSessionPage, path: `chat/sessions${cursor ? `?cursor=${encodeURIComponent(cursor)}` : ''}`, resource: 'chat' }));
}

export function createChatSession(instance: StoredInstance, user: MeProfile, title?: string): Promise<ResourceResult<ChatSession>> {
  return requestResource(instance, user, { body: { title: title?.trim() || null }, idempotencyKey: createIdempotencyKey('chat-session'), method: 'POST', parser: parseSession, path: 'chat/sessions', resource: 'chat' });
}

export function deleteChatSession(instance: StoredInstance, user: MeProfile, id: string): Promise<ResourceResult<DeleteResult>> {
  return requestResource(instance, user, { method: 'DELETE', parser: parseDelete, path: `chat/sessions/${encodeURIComponent(id)}`, resource: 'chat' });
}

export function listChatMessages(instance: StoredInstance, user: MeProfile, id: string): Promise<ResourceResult<PaginatedResponse<ChatMessage>>> {
  return collectResourcePages(cursor => requestResource(instance, user, { cachePolicy: 'none', filters: { id, cursor }, parser: parseMessagePage, path: `chat/sessions/${encodeURIComponent(id)}/messages${cursor ? `?cursor=${encodeURIComponent(cursor)}` : ''}`, resource: 'chat' }));
}

export function analyzeProjectRisk(instance: StoredInstance, user: MeProfile, projectId: string): Promise<ResourceResult<ProjectRiskAnalysis>> {
  return requestResource(instance, user, { body: {}, idempotencyKey: createIdempotencyKey('project-risk'), method: 'POST', parser: parseRisk, path: `projects/${encodeURIComponent(projectId)}/risk-analysis`, resource: 'projects' });
}

export async function streamChatMessage(
  instance: StoredInstance,
  user: MeProfile,
  sessionId: string,
  payload: ChatMessageMutationPayload,
  idempotencyKey: string,
  signal: AbortSignal,
  onEvent: (event: ChatStreamEvent) => void,
): Promise<ChatMessage> {
  requireInstanceCapability(instance, 'ai.assistant.v1');
  const { response, assertCurrent } = await authenticatedStreamRequest(instance, createApiUrl(instance.apiBaseUrl, `chat/sessions/${encodeURIComponent(sessionId)}/messages`), user, {
    body: JSON.stringify(payload),
    timeoutMs: 45_000,
    transport: expoFetch,
    headers: {
      Accept: 'application/x-ndjson',
      'Accept-Language': user.preferences?.locale ?? instance.defaultLocale,
      'Content-Type': 'application/json',
      'Idempotency-Key': idempotencyKey,
      'X-Neta-Client': 'mobile',
      'X-Neta-Client-Version': Constants.expoConfig?.version ?? '0.0.0',
      'X-Neta-Platform': Platform.OS,
    },
    method: 'POST',
    signal,
  });

  if (!response.headers.get('content-type')?.includes('application/x-ndjson')) throw new NetaClientError('UPSTREAM_ERROR', 'AI akış türü geçersiz.');
  if (!response.body) throw new NetaClientError('UPSTREAM_ERROR', upstreamErrorMessage('UPSTREAM_ERROR'));

  return consumeChatStream(response.body, signal, assertCurrent, onEvent);
}

function parseSessionPage(value: unknown): PaginatedResponse<ChatSession> { if (!isPaginatedResponse(value, isChatSession)) throw contractError('Chat sessions'); return value; }
function parseSession(value: unknown): ChatSession { if (!isChatSession(value)) throw contractError('Chat session'); return value; }
function parseMessagePage(value: unknown): PaginatedResponse<ChatMessage> {
  if (!isPaginatedResponse(value, isChatMessage)) throw contractError('Chat messages');
  return { ...value, items: value.items.filter((message) => message.role === 'user' || message.role === 'assistant') };
}
function parseDelete(value: unknown): DeleteResult { if (!isDeleteResult(value)) throw contractError('Chat delete'); return value; }
function parseRisk(value: unknown): ProjectRiskAnalysis { if (!isProjectRiskAnalysis(value)) throw contractError('Project risk'); return value; }
function contractError(name: string): NetaClientError { return new NetaClientError('SERVER_ERROR', `${name} API kontratı beklenen formatta değil.`); }
