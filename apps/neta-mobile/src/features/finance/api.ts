import {
  createIdempotencyKey,
  isDeleteResult,
  isFinanceAnalysis,
  isMultiCurrencyFinanceSummary,
  isFinanceTransactionDetail,
  isFinanceTransactionListItem,
  isPaginatedResponse,
  type DeleteResult,
  type FinanceAnalysis,
  type FinancePaymentStatus,
  type MultiCurrencyFinanceSummary,
  type FinanceTransactionDetail,
  type FinanceTransactionKind,
  type FinanceTransactionListItem,
  type FinanceTransactionMutationPayload,
  type PaginatedResponse,
} from '@neta/api-contracts';

import { NetaClientError } from '@/lib/api/errors';
import type { MeProfile, StoredInstance } from '@/lib/instance/types';
import { requireInstanceCapability } from '@/lib/instance/capabilities';
import { requestResource, type ResourceResult } from '@/lib/resource/api-client';
import { collectResourcePages } from '@/lib/resource/pagination';

export function listAllFinanceTransactions(instance: StoredInstance, user: MeProfile, filters: FinanceTransactionFilters) {
  return collectResourcePages((cursor) => listFinanceTransactions(instance, user, { ...filters, ...(cursor ? { cursor } : {}) }));
}

export type FinanceTransactionFilters = {
  clientId?: string;
  cursor?: string;
  kind?: FinanceTransactionKind;
  month?: string;
  paymentStatus?: FinancePaymentStatus;
  projectId?: string;
  search?: string;
};

const versionByTransaction = new Map<string, string>();

export function getFinanceSummary(
  instance: StoredInstance,
  user: MeProfile,
  month: string,
): Promise<ResourceResult<MultiCurrencyFinanceSummary>> {
  requireInstanceCapability(instance, 'freelancer.finance.v1');
  return requestResource(instance, user, {
    cachePolicy: 'short',
    filters: { month },
    parser: parseFinanceSummary,
    path: `finance/summary?${new URLSearchParams({ month }).toString()}`,
    resource: 'finance',
  });
}

export function listFinanceTransactions(
  instance: StoredInstance,
  user: MeProfile,
  filters: FinanceTransactionFilters,
): Promise<ResourceResult<PaginatedResponse<FinanceTransactionListItem>>> {
  requireInstanceCapability(instance, 'freelancer.finance.v1');
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value) params.set(key, value);
  }
  const query = params.toString();
  return requestResource(instance, user, {
    cachePolicy: 'medium',
    filters,
    parser: parseFinanceTransactionPage,
    path: query ? `finance/transactions?${query}` : 'finance/transactions',
    resource: 'finance',
  });
}

export async function getFinanceTransactionDetail(
  instance: StoredInstance,
  user: MeProfile,
  transactionId: string,
): Promise<ResourceResult<FinanceTransactionDetail>> {
  requireInstanceCapability(instance, 'freelancer.finance.v1');
  const result = await requestResource(instance, user, {
    cachePolicy: 'short',
    filters: { transactionId },
    parser: parseFinanceTransactionDetail,
    path: `finance/transactions/${encodeURIComponent(transactionId)}`,
    resource: 'finance',
  });
  if (result.data.version) versionByTransaction.set(`${instance.instanceId}:${transactionId}`, result.data.version);
  return result;
}

export function createFinanceTransaction(
  instance: StoredInstance,
  user: MeProfile,
  payload: FinanceTransactionMutationPayload,
): Promise<ResourceResult<FinanceTransactionDetail>> {
  requireInstanceCapability(instance, 'freelancer.finance.v1');
  return requestResource(instance, user, {
    body: payload,
    idempotencyKey: createIdempotencyKey('finance-create'),
    invalidates: ['finance', 'dashboard', 'calendar'],
    method: 'POST',
    parser: parseFinanceTransactionDetail,
    path: 'finance/transactions',
    resource: 'finance',
  });
}

export function updateFinanceTransaction(
  instance: StoredInstance,
  user: MeProfile,
  transactionId: string,
  payload: FinanceTransactionMutationPayload,
): Promise<ResourceResult<FinanceTransactionDetail>> {
  requireInstanceCapability(instance, 'freelancer.finance.v1');
  return requestResource(instance, user, {
    body: payload,
    invalidates: ['finance', 'dashboard', 'calendar'],
    method: 'PATCH',
    parser: parseFinanceTransactionDetail,
    path: `finance/transactions/${encodeURIComponent(transactionId)}`,
    resource: 'finance',
  });
}

export function deleteFinanceTransaction(
  instance: StoredInstance,
  user: MeProfile,
  transactionId: string,
  version = versionByTransaction.get(`${instance.instanceId}:${transactionId}`),
): Promise<ResourceResult<DeleteResult>> {
  requireInstanceCapability(instance, 'freelancer.finance.v1');
  if (!version) return Promise.reject(new NetaClientError('CONFLICT', 'Kayıt sürümü bilinmiyor; detayı yeniden yükleyin.'));
  return requestResource(instance, user, {
    invalidates: ['finance', 'dashboard', 'calendar'],
    method: 'DELETE',
    ifMatch: version,
    parser: parseDeleteResult,
    path: `finance/transactions/${encodeURIComponent(transactionId)}`,
    resource: 'finance',
  });
}

export function requestFinanceAnalysis(
  instance: StoredInstance,
  user: MeProfile,
  month: string,
): Promise<ResourceResult<FinanceAnalysis>> {
  return requestResource(instance, user, {
    body: { month },
    idempotencyKey: createIdempotencyKey('finance-analysis'),
    method: 'POST',
    parser: parseFinanceAnalysis,
    path: 'finance/analysis',
    resource: 'finance',
  });
}

function parseFinanceSummary(value: unknown): MultiCurrencyFinanceSummary {
  if (!isMultiCurrencyFinanceSummary(value)) throw contractError('Finance summary');
  return value;
}

function parseFinanceTransactionPage(value: unknown): PaginatedResponse<FinanceTransactionListItem> {
  if (!isPaginatedResponse(value, isFinanceTransactionListItem)) throw contractError('Finance list');
  return value;
}

function parseFinanceTransactionDetail(value: unknown): FinanceTransactionDetail {
  if (!isFinanceTransactionDetail(value)) throw contractError('Finance detail');
  return value;
}

function parseFinanceAnalysis(value: unknown): FinanceAnalysis {
  if (!isFinanceAnalysis(value)) throw contractError('Finance analysis');
  return value;
}

function parseDeleteResult(value: unknown): DeleteResult {
  if (!isDeleteResult(value)) throw contractError('Finance delete');
  return value;
}

function contractError(resource: string): NetaClientError {
  return new NetaClientError('SERVER_ERROR', `${resource} API kontratı beklenen formatta değil.`);
}
