import "server-only";

import { createHash } from "node:crypto";
import { DomainError } from "@/server/domain/errors";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

type CursorPayload = { fingerprint: string; offset: number; version: 1 };

export function paginate<T>(items: readonly T[], input: { cursor?: string | null; fingerprint: unknown; limit?: string | null }) {
  const limit = parseLimit(input.limit);
  const fingerprint = createFingerprint(input.fingerprint);
  const offset = input.cursor ? decodeCursor(input.cursor, fingerprint) : 0;
  const pageItems = items.slice(offset, offset + limit);
  const nextOffset = offset + pageItems.length;
  const hasNextPage = nextOffset < items.length;

  return {
    items: pageItems,
    pageInfo: {
      hasNextPage,
      nextCursor: hasNextPage ? encodeCursor({ fingerprint, offset: nextOffset, version: 1 }) : null,
    },
  };
}

function parseLimit(value: string | null | undefined): number {
  if (value == null || value === "") return DEFAULT_LIMIT;
  if (!/^\d+$/.test(value)) throw invalidCursor("limit");
  const limit = Number(value);
  if (limit < 1 || limit > MAX_LIMIT) throw invalidCursor("limit");
  return limit;
}

function createFingerprint(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("base64url").slice(0, 16);
}

function encodeCursor(value: CursorPayload): string {
  return Buffer.from(JSON.stringify(value), "utf8").toString("base64url");
}

function decodeCursor(value: string, fingerprint: string): number {
  try {
    const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as Partial<CursorPayload>;
    if (parsed.version !== 1 || parsed.fingerprint !== fingerprint || !Number.isSafeInteger(parsed.offset) || Number(parsed.offset) < 0) {
      throw invalidCursor("cursor");
    }
    return Number(parsed.offset);
  } catch (error) {
    if (error instanceof DomainError) throw error;
    throw invalidCursor("cursor");
  }
}

function invalidCursor(field: string): DomainError {
  return new DomainError("VALIDATION_ERROR", `Invalid ${field}.`, { field, messageKey: "validation.invalidQuery" });
}
