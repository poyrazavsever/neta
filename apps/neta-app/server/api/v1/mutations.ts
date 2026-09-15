import "server-only";

import { createHash } from "node:crypto";
import type { SessionContext } from "@/server/auth/session";
import { getSqliteConnection } from "@/server/db/client";
import { DomainError } from "@/server/domain/errors";

const KEY_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:-]{7,127}$/;
const MAX_STORED_RESPONSE_BYTES = 512 * 1024;
const RETENTION_MS = 7 * 24 * 60 * 60 * 1_000;

type StoredRecord = { payloadHash: string; responseJson: string };

export function runIdempotentMutation<T>(
  request: Request,
  context: SessionContext,
  payload: unknown,
  execute: () => T,
): T {
  const key = request.headers.get("idempotency-key")?.trim() ?? "";
  if (!KEY_PATTERN.test(key)) {
    throw new DomainError("VALIDATION_ERROR", "Geçerli bir Idempotency-Key zorunludur.", {
      field: "Idempotency-Key",
      messageKey: "validation.idempotencyKey",
    });
  }

  const method = request.method.toUpperCase();
  if (method !== "POST" && method !== "PUT") {
    throw new DomainError("INVARIANT_VIOLATION", "Bu method idempotent mutation olarak kaydedilemez.");
  }
  const route = new URL(request.url).pathname;
  const payloadHash = sha256(stableJson(payload));
  const { sqlite } = getSqliteConnection();

  return sqlite.transaction(() => {
    const stored = sqlite.prepare(`
      select payload_hash as payloadHash, response_json as responseJson
      from api_idempotency_records
      where actor_user_id = ? and method = ? and route = ? and idempotency_key = ?
    `).get(context.user.id, method, route, key) as StoredRecord | undefined;

    if (stored) {
      if (stored.payloadHash !== payloadHash) {
        throw new DomainError("CONFLICT", "Idempotency-Key farklı bir istek için zaten kullanıldı.", {
          messageKey: "api.errors.idempotencyConflict",
        });
      }
      return JSON.parse(stored.responseJson) as T;
    }

    const result = execute();
    const responseJson = JSON.stringify(result);
    if (Buffer.byteLength(responseJson, "utf8") > MAX_STORED_RESPONSE_BYTES) {
      throw new DomainError("INVARIANT_VIOLATION", "Idempotent mutation yanıtı saklama sınırını aşıyor.");
    }
    sqlite.prepare(`
      insert into api_idempotency_records
        (actor_user_id, method, route, idempotency_key, payload_hash, response_json, created_at)
      values (?, ?, ?, ?, ?, ?, ?)
    `).run(context.user.id, method, route, key, payloadHash, responseJson, Date.now());
    sqlite.prepare("delete from api_idempotency_records where created_at < ?")
      .run(Date.now() - RETENTION_MS);
    return result;
  }).immediate();
}

export function requireCurrentVersion(provided: unknown, current: Date | string | number): void {
  const expected = toIso(current);
  if (typeof provided !== "string" || provided !== expected) {
    throw new DomainError("CONFLICT", "Kayıt başka bir oturum tarafından değiştirildi.", {
      currentVersion: expected,
      messageKey: "api.errors.staleResource",
    });
  }
}

export function requireIfMatch(request: Request, current: Date | string | number): void {
  const raw = request.headers.get("if-match")?.trim();
  const version = raw?.startsWith('"') && raw.endsWith('"') ? raw.slice(1, -1) : raw;
  requireCurrentVersion(version, current);
}

function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => `${JSON.stringify(key)}:${stableJson(item)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value) ?? "null";
}

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function toIso(value: Date | string | number): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}
