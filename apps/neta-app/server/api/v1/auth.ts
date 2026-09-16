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
  requiredDeviceScopes: readonly string[] = [],
): Promise<SessionContext> {
  // An explicit Authorization header is authoritative. Invalid/revoked device
  // credentials must not inherit a browser session sent with the same request.
  const context = requestHeaders.has("authorization")
    ? getDeviceSessionContext(requestHeaders)
    : await getSessionContextFromHeaders(requestHeaders);
  if (!context) {
    throw new DomainError("UNAUTHENTICATED", "Authentication required.", {
      messageKey: "api.errors.unauthenticated",
    });
  }
  const device = context.device;
  if (device && (requiredDeviceScopes.length === 0 ||
    requiredDeviceScopes.some((scope) => !device.scopes.includes(scope)))) {
    throw new DomainError("FORBIDDEN", "Device session cannot access this resource.", {
      messageKey: "api.errors.forbidden",
    });
  }
  return context;
}

export async function requireApiV1Role(
  requestHeaders: Headers,
  allowedRoles: readonly UserRole[],
  requiredDeviceScopes: readonly string[] = [],
): Promise<SessionContext> {
  const context = await requireApiV1Session(requestHeaders, requiredDeviceScopes);
  if (!allowedRoles.includes(context.profile.role)) {
    throw new DomainError("FORBIDDEN", "This account cannot access the resource.", {
      allowedRoles,
      messageKey: "api.errors.forbidden",
    });
  }
  return context;
}
