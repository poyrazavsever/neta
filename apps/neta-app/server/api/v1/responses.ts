import "server-only";

import type { NextResponse } from "next/server";
import { apiError, apiSuccess } from "../responses";
import { NETA_API_VERSION } from "./contracts";
import { DomainError } from "../../domain/errors";

export function apiV1Success<T>(
  data: T,
  init?: ResponseInit,
): NextResponse {
  return withV1Headers(apiSuccess(data, init));
}

export function apiV1Error(error: unknown): NextResponse {
  return withV1Headers(apiError(error));
}

export function apiV1NotFound(): NextResponse {
  return apiV1Error(new DomainError("NOT_FOUND", "API route not found.", {
    messageKey: "api.errors.notFound",
  }));
}

export function apiV1MethodNotAllowed(allowed: readonly string[]): NextResponse {
  const response = apiV1Error(new DomainError(
    "METHOD_NOT_ALLOWED",
    "Method not allowed for this API route.",
    { allowed, messageKey: "api.errors.methodNotAllowed" },
  ));
  response.headers.set("Allow", allowed.join(", "));
  return response;
}

function withV1Headers(response: NextResponse): NextResponse {
  response.headers.set("X-Neta-API-Version", NETA_API_VERSION);
  response.headers.set("X-Content-Type-Options", "nosniff");
  if (!response.headers.has("Cache-Control")) {
    response.headers.set("Cache-Control", "private, no-store");
  }
  return response;
}
