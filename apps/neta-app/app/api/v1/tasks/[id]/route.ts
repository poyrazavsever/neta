import { deviceScopesForRoute } from "@/server/api/v1/device-scopes";
import { requireApiV1Role } from "@/server/api/v1/auth";
import { getOwnerTask } from "@/server/api/v1/owner-read";
import { deleteOwnerTask, updateOwnerTask } from "@/server/api/v1/owner-mutations";
import { parseApiV1Json } from "@/server/api/v1/input";
import { apiV1Error, apiV1MethodNotAllowed, apiV1Success } from "@/server/api/v1/responses";
import { z } from "zod";
export const runtime = "nodejs"; export const dynamic = "force-dynamic";
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) { try { return apiV1Success(getOwnerTask(await requireApiV1Role(new Headers(request.headers), ["freelancer"], deviceScopesForRoute(["tasks", "[id]"], request.method)), request, (await params).id)); } catch (error) { return apiV1Error(error); } }
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) { try { const context = await requireApiV1Role(new Headers(request.headers), ["freelancer"], deviceScopesForRoute(["tasks", "[id]"], request.method)); return apiV1Success(updateOwnerTask(context, request, (await params).id, await parseApiV1Json(request, z.unknown()))); } catch (error) { return apiV1Error(error); } }
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) { try { const context = await requireApiV1Role(new Headers(request.headers), ["freelancer"], deviceScopesForRoute(["tasks", "[id]"], request.method)); return apiV1Success(deleteOwnerTask(context, request, (await params).id)); } catch (error) { return apiV1Error(error); } }
export function POST() { return apiV1MethodNotAllowed(["GET", "PATCH", "DELETE"]); } export const PUT = POST;
