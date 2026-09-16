import { requireApiV1Session } from "@/server/api/v1/auth";
import { apiV1Error } from "@/server/api/v1/responses";
import { domainActorFromSession } from "@/server/auth/domain-actor";
import { getFileService } from "@/server/files/runtime";
import { fileResponse } from "@/server/files/http";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const context = await requireApiV1Session(new Headers(request.headers), ["files:read"]);
    const file = getFileService().read(domainActorFromSession(context), (await params).id);
    const response = fileResponse(file.metadata, file.bytes, "private, no-store");
    response.headers.set("X-Neta-API-Version", "1");
    return response;
  } catch (error) {
    return apiV1Error(error);
  }
}
