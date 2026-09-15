import "server-only";

import { DomainError } from "@/server/domain/errors";

export function strictSearchParams(request: Request, allowed: readonly string[]): URLSearchParams {
  const params = new URL(request.url).searchParams;
  const allowedSet = new Set(allowed);
  for (const key of params.keys()) {
    if (!allowedSet.has(key) || params.getAll(key).length !== 1) {
      throw new DomainError("VALIDATION_ERROR", "Invalid query parameters.", {
        field: key,
        messageKey: "validation.invalidQuery",
      });
    }
  }
  return params;
}

export function optionalEnum<T extends string>(params: URLSearchParams, key: string, values: readonly T[]): T | null {
  const value = params.get(key);
  if (value == null) return null;
  if (!values.includes(value as T)) throw invalidQuery(key);
  return value as T;
}

export function optionalText(params: URLSearchParams, key: string, max = 100): string | null {
  const value = params.get(key)?.trim() ?? null;
  if (value == null) return null;
  if (!value || value.length > max) throw invalidQuery(key);
  return value;
}

export function requiredInstant(params: URLSearchParams, key: string): Date {
  const value = params.get(key);
  const date = value ? new Date(value) : new Date(Number.NaN);
  if (!value || Number.isNaN(date.getTime())) throw invalidQuery(key);
  return date;
}

export function requiredTimezone(params: URLSearchParams, key: string): string {
  const value = optionalText(params, key, 64);
  if (!value) throw invalidQuery(key);
  try {
    new Intl.DateTimeFormat("en", { timeZone: value }).format();
  } catch {
    throw invalidQuery(key);
  }
  return value;
}

function invalidQuery(field: string): DomainError {
  return new DomainError("VALIDATION_ERROR", `Invalid ${field}.`, { field, messageKey: "validation.invalidQuery" });
}
