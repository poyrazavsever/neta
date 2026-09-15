import { requireApiV1Role } from "@/server/api/v1/auth";
import { getOwnerClient } from "@/server/api/v1/owner-read";
import { updateOwnerClient } from "@/server/api/v1/owner-mutations";
import { parseApiV1Json } from "@/server/api/v1/input";
import { apiV1Error, apiV1MethodNotAllowed, apiV1Success } from "@/server/api/v1/responses";
import { z } from "zod";
export const runtime = "nodejs"; export const dynamic = "force-dynamic";
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) { try { return apiV1Success(getOwnerClient(await requireApiV1Role(new Headers(request.headers), ["freelancer"]), request, (await params).id)); } catch (error) { return apiV1Error(error); } }
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) { try { const context = await requireApiV1Role(new Headers(request.headers), ["freelancer"]); return apiV1Success(updateOwnerClient(context, request, (await params).id, await parseApiV1Json(request, z.unknown()))); } catch (error) { return apiV1Error(error); } }
export function POST() { return apiV1MethodNotAllowed(["GET", "PATCH"]); } export const PUT = POST; export const DELETE = POST;
