import {
  createIdempotencyKey,
  type ClientActivity,
  type ClientActivityMutationPayload,
  type ClientDetail,
  type ClientListItem,
  type ClientMutationPayload,
  isClientActivity,
  isClientDetail,
  isClientListItem,
  isPaginatedResponse,
  type PaginatedResponse,
  type PortalInvitationPayload,
  type PortalInvitationResult,
  isPortalInvitationResult,
} from '@neta/api-contracts';

import { NetaClientError } from '@/lib/api/errors';
import type { MeProfile, StoredInstance } from '@/lib/instance/types';
import { requireInstanceCapability } from '@/lib/instance/capabilities';
import { requestResource, type ResourceResult } from '@/lib/resource/api-client';
import { collectResourcePages } from '@/lib/resource/pagination';

export function listAllClients(instance: StoredInstance, user: MeProfile, filters: ClientListFilters = {}) {
  return collectResourcePages((cursor) => listClients(instance, user, { ...filters, ...(cursor ? { cursor } : {}) }));
}

export type ClientListFilters = {
  cursor?: string;
  search?: string;
  status?: 'active' | 'paused' | 'archived';
};

export async function listClients(
  instance: StoredInstance,
  user: MeProfile,
  filters: ClientListFilters,
): Promise<ResourceResult<PaginatedResponse<ClientListItem>>> {
  requireInstanceCapability(instance, 'freelancer.clients.v1');
  const params = new URLSearchParams();
  if (filters.cursor) params.set('cursor', filters.cursor);

  if (filters.search) {
    params.set('search', filters.search);
  }

  if (filters.status) {
    params.set('status', filters.status);
  }

  const query = params.toString();

  return requestResource(instance, user, {
    cachePolicy: 'medium',
    filters,
    parser: parseClientPage,
    path: query ? `clients?${query}` : 'clients',
    resource: 'clients',
  });
}

export function getClientDetail(
  instance: StoredInstance,
  user: MeProfile,
  clientId: string,
): Promise<ResourceResult<ClientDetail>> {
  requireInstanceCapability(instance, 'freelancer.clients.v1');
  return requestResource(instance, user, {
    cachePolicy: 'medium',
    filters: { clientId },
    parser: parseClientDetail,
    path: `clients/${encodeURIComponent(clientId)}`,
    resource: 'clients',
  });
}

function parsePortalInvitationResult(value: unknown): PortalInvitationResult {
  if (!isPortalInvitationResult(value)) {
    throw new NetaClientError('SERVER_ERROR', 'Portal invitation API kontratı beklenen formatta değil.');
  }
  return value;
}

export function listClientActivities(
  instance: StoredInstance,
  user: MeProfile,
  clientId: string,
): Promise<ResourceResult<PaginatedResponse<ClientActivity>>> {
  return collectResourcePages((cursor) => requestResource(instance, user, {
    cachePolicy: 'short',
    filters: { clientId, cursor },
    parser: parseClientActivityPage,
    path: `clients/${encodeURIComponent(clientId)}/activities${cursor ? `?cursor=${encodeURIComponent(cursor)}` : ''}`,
    resource: 'clients',
  }));
}

export function createClientActivity(
  instance: StoredInstance,
  user: MeProfile,
  clientId: string,
  payload: ClientActivityMutationPayload,
): Promise<ResourceResult<ClientActivity>> {
  requireInstanceCapability(instance, 'freelancer.core-mutations.v1');
  return requestResource(instance, user, {
    body: payload,
    idempotencyKey: createIdempotencyKey('client-activity-create'),
    invalidates: ['clients'],
    method: 'POST',
    parser: parseClientActivity,
    path: `clients/${encodeURIComponent(clientId)}/activities`,
    resource: 'clients',
  });
}

export function createClient(
  instance: StoredInstance,
  user: MeProfile,
  payload: ClientMutationPayload,
): Promise<ResourceResult<ClientDetail>> {
  requireInstanceCapability(instance, 'freelancer.core-mutations.v1');
  return requestResource(instance, user, {
    body: payload,
    idempotencyKey: createIdempotencyKey('client-create'),
    method: 'POST',
    parser: parseClientDetail,
    path: 'clients',
    resource: 'clients',
  });
}

export function updateClient(
  instance: StoredInstance,
  user: MeProfile,
  clientId: string,
  payload: ClientMutationPayload,
): Promise<ResourceResult<ClientDetail>> {
  requireInstanceCapability(instance, 'freelancer.core-mutations.v1');
  return requestResource(instance, user, {
    body: payload,
    method: 'PATCH',
    parser: parseClientDetail,
    path: `clients/${encodeURIComponent(clientId)}`,
    resource: 'clients',
  });
}

export function archiveClient(
  instance: StoredInstance,
  user: MeProfile,
  clientId: string,
): Promise<ResourceResult<ClientDetail>> {
  return updateClient(instance, user, clientId, {
    status: 'archived',
    translations: {},
  });
}

export function inviteClientPortal(
  instance: StoredInstance,
  user: MeProfile,
  clientId: string,
  payload: PortalInvitationPayload,
): Promise<ResourceResult<PortalInvitationResult>> {
  requireInstanceCapability(instance, 'freelancer.core-mutations.v1');
  return requestResource(instance, user, {
    body: payload,
    idempotencyKey: createIdempotencyKey('portal-invite'),
    method: 'POST',
    parser: parsePortalInvitationResult,
    path: `clients/${encodeURIComponent(clientId)}/portal-invitations`,
    resource: 'clients',
  });
}

function parseClientPage(value: unknown): PaginatedResponse<ClientListItem> {
  if (!isPaginatedResponse(value, isClientListItem)) {
    throw new NetaClientError('SERVER_ERROR', 'Clients API kontratı beklenen formatta değil.');
  }

  return value;
}

function parseClientActivityPage(value: unknown): PaginatedResponse<ClientActivity> {
  if (!isPaginatedResponse(value, isClientActivity)) {
    throw new NetaClientError('SERVER_ERROR', 'Client activity API kontratı beklenen formatta değil.');
  }

  return value;
}

function parseClientActivity(value: unknown): ClientActivity {
  if (!isClientActivity(value)) {
    throw new NetaClientError('SERVER_ERROR', 'Client activity API kontratı beklenen formatta değil.');
  }

  return value;
}

function parseClientDetail(value: unknown): ClientDetail {
  if (!isClientDetail(value)) {
    throw new NetaClientError('SERVER_ERROR', 'Client detail API kontratı beklenen formatta değil.');
  }

  return value;
}
