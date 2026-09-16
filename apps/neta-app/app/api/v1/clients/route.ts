import { deviceScopesForRoute } from "@/server/api/v1/device-scopes";
import { requireApiV1Role } from "@/server/api/v1/auth";
import { listOwnerClients } from "@/server/api/v1/owner-read";
import { createOwnerClient } from "@/server/api/v1/owner-mutations";
import { parseApiV1Json } from "@/server/api/v1/input";
import { apiV1Error, apiV1MethodNotAllowed, apiV1Success } from "@/server/api/v1/responses";
import { z } from "zod";
export const runtime = "nodejs"; export const dynamic = "force-dynamic";
export async function GET(request: Request) { try { return apiV1Success(listOwnerClients(await requireApiV1Role(new Headers(request.headers), ["freelancer"], deviceScopesForRoute(["clients"], request.method)), request)); } catch (error) { return apiV1Error(error); } }
export async function POST(request: Request) { try { const context = await requireApiV1Role(new Headers(request.headers), ["freelancer"], deviceScopesForRoute(["clients"], request.method)); return apiV1Success(createOwnerClient(context, request, await parseApiV1Json(request, z.unknown())), { status: 201 }); } catch (error) { return apiV1Error(error); } }
export function PUT() { return apiV1MethodNotAllowed(["GET", "POST"]); } export const PATCH = PUT; export const DELETE = PUT;
