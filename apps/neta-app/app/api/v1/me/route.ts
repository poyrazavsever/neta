import { requireApiV1Session } from "@/server/api/v1/auth";
import { getApiMeProfile } from "@/server/api/v1/me-profile";
import {
  apiV1Error,
  apiV1MethodNotAllowed,
  apiV1Success,
} from "@/server/api/v1/responses";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const context = await requireApiV1Session(new Headers(request.headers));
    return apiV1Success(getApiMeProfile(context, request));
  } catch (error) {
    return apiV1Error(error);
  }
}

export function POST() { return apiV1MethodNotAllowed(["GET"]); }
export function PUT() { return apiV1MethodNotAllowed(["GET"]); }
export function PATCH() { return apiV1MethodNotAllowed(["GET"]); }
export function DELETE() { return apiV1MethodNotAllowed(["GET"]); }
