import "server-only";

import { createHmac, randomBytes, randomInt, randomUUID, timingSafeEqual } from "node:crypto";
import { and, count, eq, inArray, lt, or } from "drizzle-orm";
import { verifyPassword } from "better-auth/crypto";
import type { DeviceSessionInfo } from "@neta/api-contracts";
import { getServerConfig } from "@/server/config";
import { getSqliteConnection } from "@/server/db/client";
import {
  account,
  appProfiles,
  authAuditEvents,
  deviceRefreshHistory,
  deviceRefreshReplays,
  deviceSecurityState,
  deviceSessions,
  pairingChallenges,
  user,
} from "@/server/db/schema";
import { DomainError, notFound } from "@/server/domain/errors";
import type { SessionContext } from "./session";
import { DEVICE_IDLE_TTL_MS } from "./device-maintenance";
import { openRefreshReplay, REFRESH_REPLAY_TTL_MS, sealRefreshReplay } from "./device-replay-crypto";

const CHALLENGE_TTL_MS = 5 * 60_000;
const ACCESS_TTL_MS = 15 * 60_000;
const REFRESH_TTL_MS = 30 * 24 * 60 * 60_000;
const MAX_ACTIVE_CHALLENGES = 3;
const MAX_ATTEMPTS = 5;
const CROCKFORD = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
const OWNER_SCOPES = [
  "profile:read", "clients:read", "clients:write", "projects:read", "projects:write",
  "tasks:read", "tasks:write", "calendar:read", "calendar:write", "finance:read",
  "finance:write", "journal:read", "journal:write", "settings:read", "settings:write",
  "files:read", "files:write",
] as const;
const rateBuckets = new Map<string, { count: number; resetAt: number }>();

type Platform = "ios" | "android" | "unknown";
type TokenPair = {
  accessToken: string;
  accessExpiresAt: string;
  refreshToken: string;
  refreshExpiresAt: string;
  tokenType: "Bearer";
};

export async function createPairingChallenge(
  context: SessionContext,
  request: Request,
  body: unknown,
) {
  assertSecureTransport(request);
  rateLimit(request, "create", 10, 60_000);
  const currentPassword = readString(body, "currentPassword", 128);
  const credential = getSqliteConnection().db.select({ password: account.password }).from(account)
    .where(and(eq(account.userId, context.user.id), eq(account.providerId, "credential"))).get();
  if (!credential?.password || !await verifyPassword({ hash: credential.password, password: currentPassword })) {
    audit("pairing_failed", context.user.id, { reason: "step_up_failed" });
    throw new DomainError("UNAUTHENTICATED", "Mevcut parola doğrulanamadı.");
  }

  const { db } = getSqliteConnection();
  const now = new Date();
  db.update(pairingChallenges).set({ status: "revoked" })
    .where(and(eq(pairingChallenges.ownerUserId, context.user.id), eq(pairingChallenges.status, "pending"), lt(pairingChallenges.expiresAt, now))).run();
  const active = db.select({ value: count() }).from(pairingChallenges)
    .where(and(eq(pairingChallenges.ownerUserId, context.user.id), eq(pairingChallenges.status, "pending")))
    .get()?.value ?? 0;
  if (active >= MAX_ACTIVE_CHALLENGES) {
    throw new DomainError("CONFLICT", "En fazla üç aktif eşleştirme kodu olabilir.");
  }
  const id = randomUUID();
  const locator = randomManualCode(8);
  const secret = `${locator}.${randomBytes(32).toString("base64url")}`;
  const manualCode = `${locator}-${randomManualCode(10)}`;
  const expiresAt = new Date(now.getTime() + CHALLENGE_TTL_MS);
  db.insert(pairingChallenges).values({
    id, ownerUserId: context.user.id, secretDigest: digest(secret),
    manualCodeDigest: digest(normalizeManualCode(manualCode)), locatorDigest: digest(locator), expiresAt,
  }).run();
  audit("pairing_created", context.user.id, { challengeId: id });
  const origin = getServerConfig().appUrl;
  return {
    challengeId: id,
    expiresAt: expiresAt.toISOString(),
    manualCode,
    qrPayload: `neta://pair?origin=${encodeURIComponent(origin)}&secret=${encodeURIComponent(secret)}`,
  };
}

export function exchangePairingChallenge(request: Request, body: unknown): TokenPair & { deviceSessionId: string } {
  assertSecureTransport(request);
  rateLimit(request, "exchange", 30, 60_000);
  const value = asRecord(body);
  const isSecret = typeof value.secret === "string" && Boolean(value.secret);
  const supplied = isSecret
    ? readString(body, "secret", 1024)
    : normalizeManualCode(readString(body, "code", 32));
  const locator = isSecret ? supplied.split(".")[0].toUpperCase() : supplied.slice(0, 8);
  const suppliedDigest = digest(supplied);
  const installId = readString(body, "installId", 200);
  const deviceName = safeLabel(readString(body, "deviceName", 100));
  const platform = parsePlatform(value.platform);
  const appVersion = safeLabel(readString(body, "appVersion", 40));
  const osMajor = typeof value.osMajor === "string" ? safeLabel(value.osMajor).slice(0, 20) : null;
  const { db } = getSqliteConnection();
  const now = new Date();

  const result = db.transaction((tx) => {
    const challenge = tx.select().from(pairingChallenges)
      .where(eq(pairingChallenges.locatorDigest, digest(locator)))
      .get();
    if (!challenge || challenge.status !== "pending" || challenge.expiresAt <= now) {
      if (challenge?.status === "pending") {
        tx.update(pairingChallenges).set({ status: "revoked" }).where(eq(pairingChallenges.id, challenge.id)).run();
        auditIn(tx, "pairing_failed", challenge.ownerUserId, { challengeId: challenge.id, reason: "invalid_or_expired" });
      }
      return { ok: false as const };
    }
    const expectedDigest = isSecret ? challenge.secretDigest : challenge.manualCodeDigest;
    if (!timingSafeEqual(Buffer.from(expectedDigest, "hex"), Buffer.from(suppliedDigest, "hex"))) {
      const attempts = challenge.attemptCount + 1;
      tx.update(pairingChallenges).set({ attemptCount: attempts, status: attempts >= MAX_ATTEMPTS ? "locked" : "pending" })
        .where(eq(pairingChallenges.id, challenge.id)).run();
      auditIn(tx, "pairing_failed", challenge.ownerUserId, { challengeId: challenge.id, reason: "incorrect_credential" });
      return { ok: false as const };
    }
    const profile = tx.select().from(appProfiles)
      .where(and(eq(appProfiles.authUserId, challenge.ownerUserId), eq(appProfiles.role, "freelancer"), eq(appProfiles.disabled, false))).get();
    if (!profile) throw new DomainError("FORBIDDEN", "Owner hesabı aktif değil.");

    const epoch = ensureEpoch(tx);
    const sessionId = randomUUID();
    const familyId = randomUUID();
    const pair = newTokenPair(now);
    tx.update(pairingChallenges).set({ status: "consumed", consumedAt: now })
      .where(and(eq(pairingChallenges.id, challenge.id), eq(pairingChallenges.status, "pending"))).run();
    tx.insert(deviceSessions).values({
      id: sessionId, familyId, ownerUserId: challenge.ownerUserId,
      installIdDigest: digest(installId), deviceName, platform, appVersion, osMajor,
      scopes: [...OWNER_SCOPES], tokenEpoch: epoch,
      accessDigest: digest(pair.accessToken), accessExpiresAt: new Date(pair.accessExpiresAt),
      refreshDigest: digest(pair.refreshToken), refreshExpiresAt: new Date(pair.refreshExpiresAt),
    }).run();
    auditIn(tx, "pairing_consumed", challenge.ownerUserId, { challengeId: challenge.id, deviceSessionId: sessionId, platform });
    return { ok: true as const, value: { ...pair, deviceSessionId: sessionId } };
  }, { behavior: "immediate" });
  if (!result.ok) throw new DomainError("UNAUTHENTICATED", "Eşleştirme kodu geçersiz veya süresi dolmuş.");
  return result.value;
}

export function refreshDeviceSession(request: Request, body: unknown): TokenPair {
  assertSecureTransport(request);
  rateLimit(request, "refresh", 60, 60_000);
  const refreshToken = readString(body, "refreshToken", 1024);
  const tokenDigest = digest(refreshToken);
  const requestId = asRecord(body).requestId === undefined ? null : readString(body, "requestId", 128);
  if (requestId && !/^[A-Za-z0-9_-]{16,128}$/.test(requestId)) {
    throw new DomainError("VALIDATION_ERROR", "Refresh istek kimliği geçersiz.", { field: "requestId" });
  }
  const requestDigest = requestId ? digest(`refresh-request:${requestId}`) : null;
  const now = new Date();
  const pair = newTokenPair(now);
  const { db } = getSqliteConnection();
  const result = db.transaction((tx) => {
    const consumed = tx.select().from(deviceRefreshHistory)
      .where(eq(deviceRefreshHistory.digest, tokenDigest)).get();
    const row = consumed
      ? tx.select().from(deviceSessions).where(eq(deviceSessions.id, consumed.deviceSessionId)).get()
      : tx.select().from(deviceSessions)
      .where(or(eq(deviceSessions.refreshDigest, tokenDigest), eq(deviceSessions.previousRefreshDigest, tokenDigest))).get();
    if (!row) throw new DomainError("UNAUTHENTICATED", "Refresh token geçersiz.");
    if (row.status !== "active" || row.refreshExpiresAt <= now ||
        row.lastUsedAt.getTime() + DEVICE_IDLE_TTL_MS <= now.getTime() || row.tokenEpoch !== ensureEpoch(tx)) {
      tx.delete(deviceRefreshReplays).where(eq(deviceRefreshReplays.deviceSessionId, row.id)).run();
      return { ok: false as const, reason: "invalid" as const };
    }
    const activeOwner = tx.select({ id: appProfiles.id }).from(appProfiles)
      .where(and(eq(appProfiles.authUserId, row.ownerUserId), eq(appProfiles.role, "freelancer"), eq(appProfiles.disabled, false))).get();
    if (!activeOwner) {
      tx.update(deviceSessions).set({ status: "revoked", revokedAt: now })
        .where(and(eq(deviceSessions.ownerUserId, row.ownerUserId), eq(deviceSessions.status, "active"))).run();
      tx.delete(deviceRefreshReplays).where(inArray(deviceRefreshReplays.deviceSessionId,
        tx.select({ id: deviceSessions.id }).from(deviceSessions).where(eq(deviceSessions.ownerUserId, row.ownerUserId)))).run();
      return { ok: false as const, reason: "invalid" as const };
    }
    if (consumed || row.previousRefreshDigest === tokenDigest) {
      const replay = requestDigest ? tx.select().from(deviceRefreshReplays)
        .where(and(eq(deviceRefreshReplays.deviceSessionId, row.id), eq(deviceRefreshReplays.consumedDigest, tokenDigest),
          eq(deviceRefreshReplays.requestDigest, requestDigest), eq(deviceRefreshReplays.successorRefreshDigest, row.refreshDigest))).get() : null;
      const retried = replay ? openRefreshReplay(replay.encryptedResponse, deviceSecret(), {
        ...replay, tokenEpoch: row.tokenEpoch, expiresAt: replay.expiresAt.getTime(),
      }, now.getTime()) : null;
      if (retried && digest(retried.refreshToken) === row.refreshDigest && digest(retried.accessToken) === row.accessDigest &&
          retried.accessExpiresAt === row.accessExpiresAt.toISOString() && retried.refreshExpiresAt === row.refreshExpiresAt.toISOString()) {
        auditIn(tx, "device_session_refresh_replayed", row.ownerUserId, { deviceSessionId: row.id });
        return { ok: true as const, value: retried };
      }
      tx.update(deviceSessions).set({ status: "compromised", revokedAt: now })
        .where(and(eq(deviceSessions.familyId, row.familyId), eq(deviceSessions.status, "active"))).run();
      tx.delete(deviceRefreshReplays).where(eq(deviceRefreshReplays.deviceSessionId, row.id)).run();
      auditIn(tx, "device_token_reuse_detected", row.ownerUserId, { deviceSessionId: row.id });
      return { ok: false as const, reason: "reuse" as const };
    }
    tx.insert(deviceRefreshHistory).values({
      digest: row.refreshDigest, deviceSessionId: row.id, consumedAt: now,
    }).run();
    tx.update(deviceSessions).set({
      accessDigest: digest(pair.accessToken), accessExpiresAt: new Date(pair.accessExpiresAt),
      previousRefreshDigest: row.refreshDigest, refreshDigest: digest(pair.refreshToken),
      refreshExpiresAt: new Date(pair.refreshExpiresAt), lastUsedAt: now,
    }).where(and(eq(deviceSessions.id, row.id), eq(deviceSessions.refreshDigest, tokenDigest))).run();
    tx.delete(deviceRefreshReplays).where(eq(deviceRefreshReplays.deviceSessionId, row.id)).run();
    if (requestDigest) {
      const binding = {
        deviceSessionId: row.id, tokenEpoch: row.tokenEpoch, consumedDigest: tokenDigest,
        requestDigest, successorRefreshDigest: digest(pair.refreshToken), expiresAt: now.getTime() + REFRESH_REPLAY_TTL_MS,
      };
      tx.insert(deviceRefreshReplays).values({
        deviceSessionId: binding.deviceSessionId, consumedDigest: binding.consumedDigest,
        requestDigest: binding.requestDigest, successorRefreshDigest: binding.successorRefreshDigest,
        expiresAt: new Date(binding.expiresAt), encryptedResponse: sealRefreshReplay(pair, deviceSecret(), binding),
      }).run();
    }
    auditIn(tx, "device_session_refreshed", row.ownerUserId, { deviceSessionId: row.id });
    return { ok: true as const, value: pair };
  }, { behavior: "immediate" });
  if (!result.ok) {
    throw new DomainError("UNAUTHENTICATED", result.reason === "reuse"
      ? "Token reuse algılandı; cihaz oturumu kapatıldı."
      : "Cihaz oturumu geçersiz veya süresi dolmuş.");
  }
  return result.value;
}

export function getDeviceSessionContext(requestHeaders: Headers): SessionContext | null {
  const authorization = requestHeaders.get("authorization");
  if (!authorization?.startsWith("Bearer ")) return null;
  const raw = authorization.slice(7).trim();
  if (!raw) return null;
  const { db } = getSqliteConnection();
  const now = new Date();
  const row = db.select().from(deviceSessions).where(eq(deviceSessions.accessDigest, digest(raw))).get();
  if (!row || row.status !== "active" || row.accessExpiresAt <= now || row.refreshExpiresAt <= now ||
      row.lastUsedAt.getTime() + DEVICE_IDLE_TTL_MS <= now.getTime() || row.tokenEpoch !== ensureEpoch(db)) return null;
  const profile = db.select().from(appProfiles)
    .where(and(eq(appProfiles.authUserId, row.ownerUserId), eq(appProfiles.role, "freelancer"), eq(appProfiles.disabled, false))).get();
  const authUser = db.select().from(user).where(eq(user.id, row.ownerUserId)).get();
  if (!profile || !authUser) {
    revokeAllDeviceSessions(row.ownerUserId);
    return null;
  }
  if (now.getTime() - row.lastUsedAt.getTime() >= 5 * 60_000) {
    db.update(deviceSessions).set({ lastUsedAt: now }).where(eq(deviceSessions.id, row.id)).run();
  }
  return {
    profile,
    device: { id: row.id, scopes: row.scopes },
    user: authUser as SessionContext["user"],
    session: {
      id: `device:${row.id}`, userId: row.ownerUserId, token: "",
      expiresAt: row.accessExpiresAt, createdAt: row.createdAt, updatedAt: row.lastUsedAt,
      ipAddress: null, userAgent: `Neta Mobile (${row.platform})`,
    } as SessionContext["session"],
  };
}

export function listDeviceSessions(context: SessionContext): DeviceSessionInfo[] {
  return getSqliteConnection().db.select().from(deviceSessions)
    .where(eq(deviceSessions.ownerUserId, context.user.id)).all()
    .map((row) => ({
      id: row.id, current: context.session.id === `device:${row.id}`, deviceLabel: row.deviceName,
      platform: row.platform, createdAt: row.createdAt.toISOString(), lastActiveAt: row.lastUsedAt.toISOString(),
      revokedAt: row.revokedAt?.toISOString() ?? null,
    })).sort((a, b) => b.lastActiveAt.localeCompare(a.lastActiveAt));
}

export function revokeDeviceSession(context: SessionContext, id: string) {
  const now = new Date();
  getSqliteConnection().db.transaction((tx) => {
    const changed = tx.update(deviceSessions).set({ status: "revoked", revokedAt: now })
      .where(and(eq(deviceSessions.id, id), eq(deviceSessions.ownerUserId, context.user.id), eq(deviceSessions.status, "active")))
      .returning({ id: deviceSessions.id }).get();
    if (!changed) throw notFound("Cihaz oturumu");
    tx.delete(deviceRefreshReplays).where(eq(deviceRefreshReplays.deviceSessionId, id)).run();
    auditIn(tx, "device_session_revoked", context.user.id, { deviceSessionId: id });
  }, { behavior: "immediate" });
  return { deleted: true, id };
}

export function revokeAllDeviceSessions(ownerUserId: string): void {
  const now = new Date();
  getSqliteConnection().db.transaction((tx) => {
    tx.update(deviceSessions).set({ status: "revoked", revokedAt: now })
      .where(and(eq(deviceSessions.ownerUserId, ownerUserId), eq(deviceSessions.status, "active"))).run();
    tx.delete(deviceRefreshReplays).where(inArray(deviceRefreshReplays.deviceSessionId,
      tx.select({ id: deviceSessions.id }).from(deviceSessions).where(eq(deviceSessions.ownerUserId, ownerUserId)))).run();
  }, { behavior: "immediate" });
}

function newTokenPair(now: Date): TokenPair {
  return {
    accessToken: randomBytes(32).toString("base64url"),
    accessExpiresAt: new Date(now.getTime() + ACCESS_TTL_MS).toISOString(),
    refreshToken: randomBytes(32).toString("base64url"),
    refreshExpiresAt: new Date(now.getTime() + REFRESH_TTL_MS).toISOString(),
    tokenType: "Bearer",
  };
}

function ensureEpoch(db: ReturnType<typeof getSqliteConnection>["db"]): string {
  const existing = db.select().from(deviceSecurityState).where(eq(deviceSecurityState.key, "default")).get();
  if (existing) return existing.tokenEpoch;
  const tokenEpoch = randomBytes(32).toString("base64url");
  db.insert(deviceSecurityState).values({ key: "default", tokenEpoch }).onConflictDoNothing().run();
  return db.select().from(deviceSecurityState).where(eq(deviceSecurityState.key, "default")).get()?.tokenEpoch ?? tokenEpoch;
}

function digest(value: string): string {
  return createHmac("sha256", deviceSecret()).update(value).digest("hex");
}

function deviceSecret(): string {
  const config = getServerConfig();
  return config.betterAuthSecret ?? `neta-development-device-key:${config.databasePath}`;
}

function randomManualCode(length: number): string {
  return Array.from({ length }, () => CROCKFORD[randomInt(CROCKFORD.length)]).join("");
}

function normalizeManualCode(value: string): string {
  return value.toUpperCase().replace(/[\s-]/g, "");
}

function parsePlatform(value: unknown): Platform {
  return value === "ios" || value === "android" ? value : "unknown";
}

function safeLabel(value: string): string {
  return value.replace(/[\r\n\t]/g, " ").trim();
}

function readString(body: unknown, key: string, max: number): string {
  const value = asRecord(body)[key];
  if (typeof value !== "string" || !value.trim() || value.length > max) {
    throw new DomainError("VALIDATION_ERROR", `${key} geçersiz.`, { field: key });
  }
  return value.trim();
}

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new DomainError("VALIDATION_ERROR", "Payload geçersiz.");
  }
  return value as Record<string, unknown>;
}

function assertSecureTransport(request: Request): void {
  const url = new URL(request.url);
  const forwarded = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const secure = url.protocol === "https:" || forwarded === "https";
  const loopback = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  if (!secure && !loopback) throw new DomainError("FORBIDDEN", "Device pairing HTTPS gerektirir.");
}

function rateLimit(request: Request, action: string, limit: number, windowMs: number): void {
  const source = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() || "unknown";
  const key = `${action}:${digest(source)}`;
  const now = Date.now();
  const current = rateBuckets.get(key);
  if (!current || current.resetAt <= now) {
    rateBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }
  current.count += 1;
  if (current.count > limit) throw new DomainError("SERVICE_UNAVAILABLE", "Çok fazla istek; kısa süre sonra yeniden deneyin.");
}

function audit(type: Parameters<typeof auditIn>[1], authUserId: string, metadata: Record<string, unknown>) {
  auditIn(getSqliteConnection().db, type, authUserId, metadata);
}

function auditIn(
  db: ReturnType<typeof getSqliteConnection>["db"],
  type: typeof authAuditEvents.$inferInsert.type,
  authUserId: string,
  metadata: Record<string, unknown>,
) {
  db.insert(authAuditEvents).values({ type, authUserId, metadata }).run();
}
