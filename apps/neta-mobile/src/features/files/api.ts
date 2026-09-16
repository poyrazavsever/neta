import { File } from 'expo-file-system';
import { fetch as expoFetch } from 'expo/fetch';

import {
  isDeleteResult,
  isFileAsset,
  isPaginatedResponse,
  createIdempotencyKey,
  type DeleteResult,
  type FileAsset,
  type FileAssetKind,
  type PaginatedResponse,
} from '@neta/api-contracts';

import { NetaClientError } from '@/lib/api/errors';
import { createApiUrl } from '@/lib/api/http';
import { authenticatedJsonRequest, bindNativeActor } from '@/lib/auth/native-auth-client';
import type { MeProfile, StoredInstance } from '@/lib/instance/types';
import { requireInstanceCapability } from '@/lib/instance/capabilities';
import { collectResourcePages } from '@/lib/resource/pagination';
import { requestResource, type ResourceResult } from '@/lib/resource/api-client';

import { expectedVisibility, type PickedFile, validatePickedFile } from './policy';

export type FileUploadProgress = { fraction: number | null; sentBytes: number; totalBytes: number };
export type FileUploadController = { cancel: () => Promise<void>; start: () => Promise<FileAsset> };

export async function createFileUploadController(instance: StoredInstance, user: MeProfile, file: PickedFile, kind: FileAssetKind, projectId: string | undefined, onProgress: (progress: FileUploadProgress) => void, idempotencyKey = createIdempotencyKey('file-upload')): Promise<FileUploadController> {
  requireInstanceCapability(instance, 'files.v1');
  const validationError = validatePickedFile(file, kind);
  if (validationError) throw new NetaClientError('VALIDATION_ERROR', validationError);
  if (kind === 'project_asset' && !projectId?.trim()) throw new NetaClientError('VALIDATION_ERROR', 'Project dosyası için proje ID gerekli.');
  const visibility = expectedVisibility(kind);
  const auth = await bindNativeActor(instance, user);
  const nativeFile = new File(file.uri);
  if (!nativeFile.exists) throw new NetaClientError('VALIDATION_ERROR', 'Seçilen dosya artık mevcut değil.');
  const actualError = validatePickedFile({ ...file, size: nativeFile.size }, kind);
  if (actualError) throw new NetaClientError('VALIDATION_ERROR', actualError);
  const controller = new AbortController();
  return {
    cancel: async () => { controller.abort(); },
    start: async () => {
      auth.assertCurrent();
      if (controller.signal.aborted) throw new NetaClientError('UNKNOWN', 'Dosya yükleme iptal edildi.');
      const form = new FormData();
      form.append('file', nativeFile, file.name);
      form.append('kind', kind); form.append('originalName', file.name); form.append('visibility', visibility);
      if (projectId?.trim()) form.append('projectId', projectId.trim());
      // Expo fetch does not expose upload byte acknowledgements. Never invent a percentage.
      onProgress({ fraction: null, sentBytes: 0, totalBytes: nativeFile.size });
      const { data: asset } = await authenticatedJsonRequest<unknown>(instance, createApiUrl(instance.apiBaseUrl, 'files'), {
        body: form, headers: { 'Accept-Language': user.preferences?.locale ?? instance.defaultLocale, 'Idempotency-Key': idempotencyKey },
        method: 'POST', transport: expoFetch, allowRedirects: false, signal: controller.signal, timeoutMs: 60_000,
      }, auth.generation);
      auth.assertCurrent();
      if (!isFileAsset(asset) || asset.kind !== kind || asset.visibility !== visibility || !isInstanceBoundUrl(instance, asset.url) || isImage(asset.mimeType) && !asset.metadataSanitized || (projectId?.trim() ?? null) !== asset.projectId) {
        throw new NetaClientError('SERVER_ERROR', 'Dosya API güvenli v1 kontratını karşılamıyor.');
      }
      onProgress({ fraction: 1, sentBytes: nativeFile.size, totalBytes: nativeFile.size });
      return asset;
    },
  };
}

export function listProjectAssets(instance: StoredInstance, user: MeProfile, projectId: string): Promise<ResourceResult<PaginatedResponse<FileAsset>>> {
  return collectResourcePages((cursor) => requestResource(instance, user, { cachePolicy: 'short', filters: { projectId, cursor }, parser: (value) => parseAssets(value, instance, projectId), path: `projects/${encodeURIComponent(projectId)}/assets${cursor ? `?cursor=${encodeURIComponent(cursor)}` : ''}`, resource: 'files' }));
}

export function deleteProjectAsset(instance: StoredInstance, user: MeProfile, projectId: string, assetId: string): Promise<ResourceResult<DeleteResult>> {
  return requestResource(instance, user, { invalidates: ['files', 'projects', 'portal'], method: 'DELETE', parser: parseDelete, path: `projects/${encodeURIComponent(projectId)}/assets/${encodeURIComponent(assetId)}`, resource: 'files' });
}

function parseAssets(value: unknown, instance: StoredInstance, projectId: string): PaginatedResponse<FileAsset> {
  // Older web uploads truthfully report metadataSanitized=false; they remain readable.
  // Newly uploaded native images must still be sanitized in the upload response above.
  if (!isPaginatedResponse(value, (asset): asset is FileAsset => isFileAsset(asset) && asset.projectId === projectId && isInstanceBoundUrl(instance, asset.url) && asset.kind === 'project_asset')) throw new NetaClientError('SERVER_ERROR', 'Project assets API kontratı beklenen güvenli formatta değil.');
  return value;
}
function parseDelete(value: unknown): DeleteResult { if (!isDeleteResult(value)) throw new NetaClientError('SERVER_ERROR', 'File delete API kontratı beklenen formatta değil.'); return value; }
function isImage(mimeType: string): boolean { return mimeType.startsWith('image/'); }
function isInstanceBoundUrl(instance: StoredInstance, value: string): boolean { try { return new URL(value).origin === new URL(instance.origin).origin; } catch { return false; } }
