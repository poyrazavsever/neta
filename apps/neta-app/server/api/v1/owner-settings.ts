import "server-only";

import { and, eq, ne } from "drizzle-orm";
import { verifyPassword } from "better-auth/crypto";
import type { AiSettings, AppearanceSettings, AuthSessionInfo, DeleteResult, GeneralSettings, NetaMeProfile } from "@neta/api-contracts";
import { auth } from "@/server/auth/auth";
import { domainActorFromSession } from "@/server/auth/domain-actor";
import type { SessionContext } from "@/server/auth/session";
import { getBrandingService } from "@/server/branding/runtime";
import { getSqliteConnection } from "@/server/db/client";
import { account, appProfiles, session } from "@/server/db/schema";
import { DomainError, notFound } from "@/server/domain/errors";
import { getApiMeProfile } from "./me-profile";
import { getPublicAiSettings, updateAiSettings } from "@/server/settings/ai";
import { revokeAllDeviceSessions } from "@/server/auth/device-pairing";

export async function updateProfile(context: SessionContext, request: Request, body: unknown): Promise<NetaMeProfile> {
  const name = record(body).name;
  if (typeof name !== "string" || !name.trim() || name.trim().length > 200) invalid("name");
  const displayName = name.trim();
  await auth.api.updateUser({ headers: request.headers, body: { name: displayName } });
  getSqliteConnection().db.update(appProfiles).set({ displayName, updatedAt: new Date() }).where(eq(appProfiles.authUserId, context.user.id)).run();
  const current = getApiMeProfile(context, request);
  return { ...current, user: { ...current.user, name: displayName } };
}

export async function changePassword(context: SessionContext, request: Request, body: unknown): Promise<DeleteResult> {
  const value = record(body); const currentPassword = value.currentPassword; const newPassword = value.newPassword;
  if (typeof currentPassword !== "string" || typeof newPassword !== "string" || newPassword.length < 8 || newPassword.length > 128) invalid("password");
  await auth.api.changePassword({ headers: request.headers, body: { currentPassword, newPassword, revokeOtherSessions: value.revokeOtherSessions !== false } });
  revokeAllDeviceSessions(context.user.id);
  return { deleted: true, id: context.session.id };
}

export function listSessions(context: SessionContext): AuthSessionInfo[] {
  return getSqliteConnection().db.select().from(session).where(eq(session.userId, context.user.id)).all().map((row) => ({
    createdAt: row.createdAt.toISOString(), current: row.id === context.session.id, deviceLabel: deviceLabel(row.userAgent), id: row.id,
    lastActiveAt: row.updatedAt.toISOString(),
  })).sort((a, b) => b.lastActiveAt.localeCompare(a.lastActiveAt));
}

export function revokeSession(context: SessionContext, id: string): DeleteResult {
  if (id === context.session.id) throw new DomainError("CONFLICT", "Geçerli oturum bu endpoint ile sonlandırılamaz.");
  const removed = getSqliteConnection().db.delete(session).where(and(eq(session.id, id), eq(session.userId, context.user.id))).returning({ id: session.id }).get();
  if (!removed) throw notFound("Oturum"); return { deleted: true, id };
}

export function revokeOtherSessions(context: SessionContext): DeleteResult {
  getSqliteConnection().db.delete(session).where(and(eq(session.userId, context.user.id), ne(session.id, context.session.id))).run();
  revokeAllDeviceSessions(context.user.id);
  return { deleted: true, id: "other-sessions" };
}

export function getGeneralSettings(): GeneralSettings {
  const value = getBrandingService().getPublic();
  return { companyName: value.organizationName, portalFooter: value.portalFooterText, workspaceName: value.applicationName };
}

export function updateGeneralSettings(context: SessionContext, body: unknown): GeneralSettings {
  const value = record(body);
  if (typeof value.workspaceName !== "string" || !value.workspaceName.trim() || value.workspaceName.trim().length > 80 || (value.companyName != null && typeof value.companyName !== "string") || (value.portalFooter != null && typeof value.portalFooter !== "string")) invalid("settings");
  getBrandingService().update(domainActorFromSession(context), { applicationName: value.workspaceName.trim(), organizationName: nullableText(value.companyName), portalFooterText: nullableText(value.portalFooter) });
  return getGeneralSettings();
}

export function getAppearance(request: Request): AppearanceSettings {
  const value = getBrandingService().getPublic();
  return { accentColor: value.accentColor, darkLogoUrl: absolute(request, value.darkLogoUrl), defaultColorMode: value.defaultColorMode, faviconUrl: absolute(request, value.iconUrl), lightLogoUrl: absolute(request, value.lightLogoUrl), primaryColor: value.primaryColor, radiusScale: value.radiusScale };
}

export function updateAppearance(context: SessionContext, request: Request, body: unknown): AppearanceSettings {
  const value = record(body);
  getBrandingService().update(domainActorFromSession(context), { accentColor: value.accentColor, defaultColorMode: value.defaultColorMode, primaryColor: value.primaryColor, radiusScale: value.radiusScale });
  return getAppearance(request);
}

export function getAi(context: SessionContext): AiSettings {
  const value = getPublicAiSettings(domainActorFromSession(context));
  return { configured: value.provider === "ollama" || value.hasApiKey, maskedKey: value.hasApiKey ? "••••••••" : null, model: value.model, provider: value.provider };
}

export async function updateAi(context: SessionContext, body: unknown): Promise<AiSettings> {
  const value = record(body);
  if (typeof value.provider !== "string" || typeof value.model !== "string") invalid("ai");
  const current = getPublicAiSettings(domainActorFromSession(context));
  const hasReplacementKey = typeof value.apiKey === "string" && Boolean(value.apiKey.trim());
  if (value.provider !== "ollama" && value.provider !== current.provider && !hasReplacementKey) {
    throw new DomainError("VALIDATION_ERROR", "Provider değiştirirken yeni bir API anahtarı zorunludur.", { field: "apiKey" });
  }
  if (hasReplacementKey) {
    if (typeof value.currentPassword !== "string") throw new DomainError("UNAUTHENTICATED", "Mevcut parola zorunludur.");
    const credential = getSqliteConnection().db.select({ password: account.password }).from(account).where(and(eq(account.userId, context.user.id), eq(account.providerId, "credential"))).get();
    if (!credential?.password || !await verifyPassword({ hash: credential.password, password: value.currentPassword })) {
      throw new DomainError("UNAUTHENTICATED", "Mevcut parola doğrulanamadı.");
    }
  }
  // A key replacement is write-only. Existing keys are retained when omitted.
  updateAiSettings(domainActorFromSession(context), { apiKey: typeof value.apiKey === "string" && value.apiKey.trim() ? value.apiKey : undefined, model: value.model, provider: value.provider });
  return getAi(context);
}

function record(value: unknown): Record<string, unknown> { if (!value || typeof value !== "object" || Array.isArray(value)) invalid("body"); return value as Record<string, unknown>; }
function invalid(field: string): never { throw new DomainError("VALIDATION_ERROR", "Ayar payload geçersiz.", { field }); }
function nullableText(value: unknown): string | null { return typeof value === "string" && value.trim() ? value.trim() : null; }
function absolute(request: Request, value: string | null): string | null { return value ? new URL(value, request.url).toString() : null; }
function deviceLabel(userAgent: string | null): string { if (!userAgent) return "Bilinmeyen cihaz"; return userAgent.replace(/[\r\n]/g, " ").slice(0, 120); }
