import "server-only";

import sharp from "sharp";
import type { AppearanceAsset, AppearanceAssetKind, DeleteResult, FileAsset, PaginatedResponse } from "@neta/api-contracts";
import type { SessionContext } from "@/server/auth/session";
import { domainActorFromSession } from "@/server/auth/domain-actor";
import { DomainError } from "@/server/domain/errors";
import { getFileService } from "@/server/files/runtime";
import { MAX_UPLOAD_BYTES } from "@/server/files/policy";
import { getBrandingService } from "@/server/branding/runtime";
import { paginate } from "./pagination";

const KINDS = ["avatar", "branding_logo", "branding_icon", "project_asset"] as const;

export async function uploadFile(context: SessionContext, request: Request): Promise<FileAsset> {
  const form = await request.formData(); const file = form.get("file"); const kind = form.get("kind");
  if (!(file instanceof File) || typeof kind !== "string" || !KINDS.includes(kind as typeof KINDS[number])) invalid("file");
  if (file.size <= 0 || file.size > MAX_UPLOAD_BYTES) invalid("file.size");
  const projectId = text(form.get("projectId")); const visibility = text(form.get("visibility"));
  const expected = kind === "project_asset" ? (visibility === "portal" ? "portal" : "private") : kind === "avatar" ? "private" : "public_branding";
  if (visibility && visibility !== expected) throw new DomainError("INVARIANT_VIOLATION", "Dosya görünürlüğü kind ile uyumlu değil.");
  const sanitized = await sanitizeImage(new Uint8Array(await file.arrayBuffer()), file.type);
  const stored = getFileService().upload(domainActorFromSession(context), { bytes: sanitized, claimedMimeType: file.type, kind: kind as typeof KINDS[number], metadataSanitized: true, originalName: text(form.get("originalName")) ?? file.name, portalVisible: expected === "portal", projectId: projectId ?? undefined });
  return presentFile(request, stored);
}

export async function uploadAppearanceFile(context: SessionContext, request: Request): Promise<AppearanceAsset> {
  const form = await request.formData(); const file = form.get("file"); const kind = form.get("kind");
  if (!(file instanceof File) || (kind !== "lightLogo" && kind !== "darkLogo" && kind !== "favicon")) invalid("file");
  if (file.size <= 0 || file.size > MAX_UPLOAD_BYTES) invalid("file.size");
  const fileKind = kind === "favicon" ? "branding_icon" : "branding_logo";
  const sanitized = await sanitizeImage(new Uint8Array(await file.arrayBuffer()), file.type);
  const actor = domainActorFromSession(context);
  const stored = getFileService().upload(actor, { bytes: sanitized, claimedMimeType: file.type, kind: fileKind, metadataSanitized: true, originalName: file.name });
  const field = kind === "lightLogo" ? "lightLogoFileId" : kind === "darkLogo" ? "darkLogoFileId" : "iconFileId";
  try { getBrandingService().update(actor, { [field]: stored.id }); }
  catch (error) { getFileService().delete(actor, stored.id); throw error; }
  return { kind: kind as AppearanceAssetKind, mimeType: stored.mimeType as AppearanceAsset["mimeType"], url: new URL(`/api/files/${stored.id}`, request.url).toString() };
}

export function deleteAppearanceFile(context: SessionContext, kind: AppearanceAssetKind): DeleteResult {
  const actor = domainActorFromSession(context); const branding = getBrandingService().getPublic();
  const field = kind === "lightLogo" ? "lightLogoFileId" : kind === "darkLogo" ? "darkLogoFileId" : "iconFileId";
  const id = branding[field]; if (!id) return { deleted: false, id: kind };
  getBrandingService().update(actor, { [field]: null });
  try { getFileService().delete(actor, id); } catch { /* The reference is already safely detached. */ }
  return { deleted: true, id };
}

export function listProjectFiles(context: SessionContext, request: Request, projectId: string): PaginatedResponse<FileAsset> {
  const items = getFileService().list(domainActorFromSession(context)).filter((file) => file.kind === "project_asset" && file.projectId === projectId).map((file) => presentFile(request, file));
  return paginate(items, { cursor: new URL(request.url).searchParams.get("cursor"), fingerprint: { projectId }, limit: new URL(request.url).searchParams.get("limit") });
}

export function deleteProjectFile(context: SessionContext, request: Request, projectId: string, id: string): DeleteResult {
  const actor = domainActorFromSession(context); const file = getFileService().list(actor).find((item) => item.id === id && item.projectId === projectId && item.kind === "project_asset");
  if (!file) throw new DomainError("NOT_FOUND", "Dosya bulunamadı."); getFileService().delete(actor, id); return { deleted: true, id };
}

export function presentFile(request: Request, file: ReturnType<ReturnType<typeof getFileService>["list"]>[number]): FileAsset {
  return { createdAt: file.createdAt.toISOString(), id: file.id, kind: file.kind, metadataSanitized: file.metadataSanitized, mimeType: file.mimeType, name: file.originalName, projectId: file.projectId, sizeBytes: file.byteSize, url: new URL(`/api/files/${file.id}`, request.url).toString(), visibility: file.visibility };
}

async function sanitizeImage(bytes: Uint8Array, mimeType: string): Promise<Uint8Array> {
  const image = sharp(bytes, { animated: false, failOn: "error", limitInputPixels: 40_000_000 }).rotate();
  try {
    if (mimeType === "image/jpeg") return new Uint8Array(await image.jpeg({ quality: 90 }).toBuffer());
    if (mimeType === "image/png") return new Uint8Array(await image.png().toBuffer());
    if (mimeType === "image/webp") return new Uint8Array(await image.webp({ quality: 90 }).toBuffer());
    if (mimeType === "image/gif") return new Uint8Array(await image.gif().toBuffer());
  } catch {
    invalid("file.content");
  }
  invalid("file.type");
}

function text(value: FormDataEntryValue | null): string | null { return typeof value === "string" && value.trim() ? value.trim() : null; }
function invalid(field: string): never { throw new DomainError("VALIDATION_ERROR", "Dosya yüklemesi geçersiz.", { field }); }
