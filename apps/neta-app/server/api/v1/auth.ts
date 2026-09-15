import "server-only";

import type { UserRole } from "@/server/auth/types";
import {
  getSessionContextFromHeaders,
  type SessionContext,
} from "@/server/auth/session";
import { DomainError } from "@/server/domain/errors";
import { getDeviceSessionContext } from "@/server/auth/device-pairing";

export async function requireApiV1Session(
  requestHeaders: Headers,
): Promise<SessionContext> {
  const context = getDeviceSessionContext(requestHeaders)
    ?? await getSessionContextFromHeaders(requestHeaders);
  if (!context) {
    throw new DomainError("UNAUTHENTICATED", "Authentication required.", {
      messageKey: "api.errors.unauthenticated",
    });
  }
  return context;
}

export async function requireApiV1Role(
  requestHeaders: Headers,
  allowedRoles: readonly UserRole[],
): Promise<SessionContext> {
  const context = await requireApiV1Session(requestHeaders);
  if (!allowedRoles.includes(context.profile.role)) {
    throw new DomainError("FORBIDDEN", "This account cannot access the resource.", {
      allowedRoles,
      messageKey: "api.errors.forbidden",
    });
  }
  return context;
}
