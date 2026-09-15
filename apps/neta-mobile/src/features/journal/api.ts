import {
  createIdempotencyKey,
  isDeleteResult,
  isJournalEntryDetail,
  isJournalRangeResponse,
  type DeleteResult,
  type JournalEntryDetail,
  type JournalEntryMutationPayload,
  type JournalRangeResponse,
} from '@neta/api-contracts';

import { NetaClientError } from '@/lib/api/errors';
import type { MeProfile, StoredInstance } from '@/lib/instance/types';
import { requireInstanceCapability } from '@/lib/instance/capabilities';
import { requestResource, type ResourceResult } from '@/lib/resource/api-client';

const versionByEntry = new Map<string, string>();

export function listJournalEntries(instance: StoredInstance, user: MeProfile, from: string, to: string): Promise<ResourceResult<JournalRangeResponse>> {
  requireInstanceCapability(instance, 'freelancer.journal.v1');
  const normalizedFrom = from.slice(0, 10);
  const normalizedTo = to.slice(0, 10);
  const query = new URLSearchParams({ from: normalizedFrom, to: normalizedTo }).toString();
  return requestResource(instance, user, { cachePolicy: 'medium', filters: { from: normalizedFrom, to: normalizedTo }, parser: parseRange, path: `journal/entries?${query}`, resource: 'journal' });
}

export async function getJournalEntry(instance: StoredInstance, user: MeProfile, id: string): Promise<ResourceResult<JournalEntryDetail>> {
  requireInstanceCapability(instance, 'freelancer.journal.v1');
  const result = await requestResource(instance, user, { cachePolicy: 'short', filters: { id }, parser: parseDetail, path: `journal/entries/${encodeURIComponent(id)}`, resource: 'journal' });
  if (result.data.version) versionByEntry.set(`${instance.instanceId}:${id}`, result.data.version);
  return result;
}

export function upsertJournalEntry(instance: StoredInstance, user: MeProfile, date: string, payload: JournalEntryMutationPayload): Promise<ResourceResult<JournalEntryDetail>> {
  requireInstanceCapability(instance, 'freelancer.journal.v1');
  return requestResource(instance, user, { body: payload, idempotencyKey: createIdempotencyKey('journal-upsert'), invalidates: ['journal', 'dashboard', 'calendar'], method: 'PUT', parser: parseDetail, path: `journal/entries/${encodeURIComponent(date)}`, resource: 'journal' });
}

export function updateJournalEntry(instance: StoredInstance, user: MeProfile, id: string, payload: JournalEntryMutationPayload): Promise<ResourceResult<JournalEntryDetail>> {
  requireInstanceCapability(instance, 'freelancer.journal.v1');
  return requestResource(instance, user, { body: payload, invalidates: ['journal', 'dashboard', 'calendar'], method: 'PATCH', parser: parseDetail, path: `journal/entries/${encodeURIComponent(id)}`, resource: 'journal' });
}

export function deleteJournalEntry(instance: StoredInstance, user: MeProfile, id: string, version = versionByEntry.get(`${instance.instanceId}:${id}`)): Promise<ResourceResult<DeleteResult>> {
  requireInstanceCapability(instance, 'freelancer.journal.v1');
  if (!version) return Promise.reject(new NetaClientError('CONFLICT', 'Kayıt sürümü bilinmiyor; detayı yeniden yükleyin.'));
  return requestResource(instance, user, { ifMatch: version, invalidates: ['journal', 'dashboard', 'calendar'], method: 'DELETE', parser: parseDelete, path: `journal/entries/${encodeURIComponent(id)}`, resource: 'journal' });
}

function parseRange(value: unknown): JournalRangeResponse {
  if (!isJournalRangeResponse(value)) throw contractError('Journal range');
  return value;
}

function parseDetail(value: unknown): JournalEntryDetail {
  if (!isJournalEntryDetail(value)) throw contractError('Journal detail');
  return value;
}

function parseDelete(value: unknown): DeleteResult {
  if (!isDeleteResult(value)) throw contractError('Journal delete');
  return value;
}

function contractError(resource: string): NetaClientError {
  return new NetaClientError('SERVER_ERROR', `${resource} API kontratı beklenen formatta değil.`);
}
