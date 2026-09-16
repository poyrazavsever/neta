import { deviceScopesForRoute } from "@/server/api/v1/device-scopes";
import { requireApiV1Role } from "@/server/api/v1/auth";
import { getOwnerDashboardOverview } from "@/server/api/v1/owner-read";
import { apiV1Error, apiV1MethodNotAllowed, apiV1Success } from "@/server/api/v1/responses";
export const runtime = "nodejs"; export const dynamic = "force-dynamic";
export async function GET(request: Request) { try { return apiV1Success(getOwnerDashboardOverview(await requireApiV1Role(new Headers(request.headers), ["freelancer"], deviceScopesForRoute(["dashboard", "overview"], request.method)), request)); } catch (error) { return apiV1Error(error); } }
export function POST() { return apiV1MethodNotAllowed(["GET"]); } export const PUT = POST; export const PATCH = POST; export const DELETE = POST;
