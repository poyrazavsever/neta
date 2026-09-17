import "server-only";

import { z } from "zod";
import { createPortalInvitation, derivePortalInvitationToken, PortalInvitationError } from "@/server/auth/invitations";
import { requireApiV1Role } from "./auth";
import { deviceScopesForRoute } from "./device-scopes";
import { dispatchAi } from "./ai";
import { parseApiV1Json } from "./input";
import {
  completeOwnerTask,
  createOwnerClientActivity,
  listOwnerClientActivities,
} from "./owner-mutations";
import { getOwnerClient } from "./owner-read";
import { paginate } from "./pagination";
import { apiV1Error, apiV1MethodNotAllowed, apiV1NotFound, apiV1Success } from "./responses";
import { runIdempotentMutation } from "./mutations";
import { DomainError } from "@/server/domain/errors";
import { getServerConfig } from "@/server/config";
import {
  createFinance,
  deleteFinance,
  deleteJournal,
  getFinance,
  getFinanceSummary,
  getJournal,
  listFinance,
  listJournal,
  updateFinance,
  updateJournal,
  upsertJournal,
} from "./owner-parity";
import {
  changePassword,
  getAi,
  getAppearance,
  getGeneralSettings,
  listSessions,
  revokeOtherSessions,
  revokeSession,
  updateAi,
  updateAppearance,
  updateGeneralSettings,
  updateProfile,
} from "./owner-settings";
import { deleteAppearanceFile, deleteProjectFile, listProjectFiles, uploadAppearanceFile, uploadFile } from "./files";
import { createLocale, getTranslations, importTranslations, listLocales, updateLocale, updateTranslations } from "./locales-admin";
import {
  createPairingChallenge, exchangePairingChallenge, listDeviceSessions,
  refreshDeviceSession, revokeDeviceSession,
} from "@/server/auth/device-pairing";
import {
  createPortalRevision, getPortalDashboard, getPortalProfile, getPortalProject,
  listPortalProjects, listPortalRevisions, listPortalTasks, updatePortalProfile,
} from "./portal";

export async function dispatchApiV1(request: Request, path: readonly string[]): Promise<Response> {
  try {
    if (path.join("/") === "pairing/exchange") {
      if (request.method !== "POST") return apiV1MethodNotAllowed(["POST"]);
      return apiV1Success(exchangePairingChallenge(request, await parseApiV1Json(request, z.unknown())), { status: 201 });
    }
    if (path.join("/") === "device-sessions/refresh") {
      if (request.method !== "POST") return apiV1MethodNotAllowed(["POST"]);
      return apiV1Success(refreshDeviceSession(request, await parseApiV1Json(request, z.unknown())));
    }
    if (path[0] === "portal") {
      const portalContext = await requireApiV1Role(new Headers(request.headers), ["client"]);
      const body = request.method === "GET" || request.method === "DELETE" ? undefined : await parseApiV1Json(request, z.unknown());
      if (path.join("/") === "portal/dashboard" && request.method === "GET") return apiV1Success(getPortalDashboard(portalContext, request));
      if (path.join("/") === "portal/projects" && request.method === "GET") return apiV1Success(listPortalProjects(portalContext, request));
      if (path.length === 3 && path[1] === "projects" && request.method === "GET") return apiV1Success(getPortalProject(portalContext, request, path[2]));
      if (path.join("/") === "portal/tasks" && request.method === "GET") return apiV1Success(listPortalTasks(portalContext, request));
      if (path.join("/") === "portal/revisions" && request.method === "GET") return apiV1Success(listPortalRevisions(portalContext, request));
      if (path.length === 4 && path[1] === "projects" && path[3] === "revisions" && request.method === "POST") {
        return apiV1Success(runIdempotentMutation(request, portalContext, body, () => createPortalRevision(portalContext, path[2], body)), { status: 201 });
      }
      if (path.join("/") === "portal/profile") {
        if (request.method === "GET") return apiV1Success(getPortalProfile(portalContext));
        if (request.method === "PATCH") return apiV1Success(await updatePortalProfile(portalContext, request, body));
      }
      return apiV1NotFound();
    }
    // Account self-service is shared by owner and portal users. Every operation
    // below is scoped to context.user.id; workspace settings remain owner-only.
    const accountRoute = path.join("/") === "me/profile" || path.join("/") === "me/password" ||
      path.join("/") === "me/sessions" || path.length === 3 && path[0] === "me" && path[1] === "sessions";
    const context = await requireApiV1Role(new Headers(request.headers), accountRoute ? ["freelancer", "client"] : ["freelancer"], deviceScopesForRoute(path, request.method));
    if (path[0] === "chat" || path.join("/") === "finance/analysis" || path[2] === "risk-analysis") {
      const result = await dispatchAi(request, path, context);
      if (result) return result;
      return apiV1NotFound();
    }
    if (path.join("/") === "pairing/challenges") {
      if (request.method !== "POST") return apiV1MethodNotAllowed(["POST"]);
      return apiV1Success(await createPairingChallenge(context, request, await parseApiV1Json(request, z.unknown())), { status: 201 });
    }
    if (path.join("/") === "device-sessions") {
      if (request.method !== "GET") return apiV1MethodNotAllowed(["GET"]);
      return apiV1Success(listDeviceSessions(context));
    }
    if (path.length === 2 && path[0] === "device-sessions") {
      if (request.method !== "DELETE") return apiV1MethodNotAllowed(["DELETE"]);
      return apiV1Success(revokeDeviceSession(context, path[1]));
    }
    if (path.join("/") === "files") {
      if (request.method !== "POST") return apiV1MethodNotAllowed(["POST"]);
      return apiV1Success(await uploadFile(context, request), { status: 201 });
    }
    if (path.join("/") === "settings/appearance/assets") {
      if (request.method !== "POST") return apiV1MethodNotAllowed(["POST"]);
      return apiV1Success(await uploadAppearanceFile(context, request), { status: 201 });
    }
    const body = request.method === "GET" || request.method === "DELETE"
      ? undefined
      : await parseApiV1Json(request, z.unknown());

    if (path.join("/") === "me/profile") {
      if (request.method !== "PATCH") return apiV1MethodNotAllowed(["PATCH"]);
      return apiV1Success(await updateProfile(context, request, body));
    }
    if (path.join("/") === "me/password") {
      if (request.method !== "POST") return apiV1MethodNotAllowed(["POST"]);
      return apiV1Success(await changePassword(context, request, body));
    }
    if (path.join("/") === "me/sessions") {
      if (request.method === "GET") return apiV1Success(listSessions(context));
      if (request.method === "DELETE") return apiV1Success(revokeOtherSessions(context));
      return apiV1MethodNotAllowed(["GET", "DELETE"]);
    }
    if (path.length === 3 && path[0] === "me" && path[1] === "sessions") {
      if (request.method !== "DELETE") return apiV1MethodNotAllowed(["DELETE"]);
      return apiV1Success(revokeSession(context, path[2]));
    }
    if (path.join("/") === "settings/general") {
      if (request.method === "GET") return apiV1Success(getGeneralSettings());
      if (request.method === "PATCH") return apiV1Success(updateGeneralSettings(context, body));
      return apiV1MethodNotAllowed(["GET", "PATCH"]);
    }
    if (path.join("/") === "settings/appearance") {
      if (request.method === "GET") return apiV1Success(getAppearance(request));
      if (request.method === "PATCH") return apiV1Success(updateAppearance(context, request, body));
      return apiV1MethodNotAllowed(["GET", "PATCH"]);
    }
    if (path.length === 4 && path[0] === "settings" && path[1] === "appearance" && path[2] === "assets") {
      if (request.method !== "DELETE" || (path[3] !== "lightLogo" && path[3] !== "darkLogo" && path[3] !== "favicon")) return apiV1MethodNotAllowed(["DELETE"]);
      return apiV1Success(deleteAppearanceFile(context, path[3]));
    }
    if (path.join("/") === "settings/ai") {
      if (request.method === "GET") return apiV1Success(getAi(context));
      if (request.method === "PATCH") return apiV1Success(await updateAi(context, body));
      return apiV1MethodNotAllowed(["GET", "PATCH"]);
    }
    if (path.join("/") === "settings/locales") {
      if (request.method === "GET") return apiV1Success(listLocales(context));
      if (request.method === "POST") return apiV1Success(createLocale(context, request, body), { status: 201 });
      return apiV1MethodNotAllowed(["GET", "POST"]);
    }
    if (path.join("/") === "settings/locales/import") {
      if (request.method !== "POST") return apiV1MethodNotAllowed(["POST"]);
      return apiV1Success(importTranslations(context, request, body));
    }
    if (path.join("/") === "settings/locales/export") {
      if (request.method !== "GET") return apiV1MethodNotAllowed(["GET"]);
      const locale = new URL(request.url).searchParams.get("locale");
      if (!locale) throw new DomainError("VALIDATION_ERROR", "locale zorunludur.");
      return apiV1Success(getTranslations(context, locale));
    }
    if (path.length === 3 && path[0] === "settings" && path[1] === "locales") {
      if (request.method !== "PATCH") return apiV1MethodNotAllowed(["PATCH"]);
      return apiV1Success(updateLocale(context, path[2], body));
    }
    if (path.length === 4 && path[0] === "settings" && path[1] === "locales" && path[3] === "translations") {
      if (request.method === "GET") return apiV1Success(getTranslations(context, path[2]));
      if (request.method === "PUT") return apiV1Success(updateTranslations(context, path[2], body));
      return apiV1MethodNotAllowed(["GET", "PUT"]);
    }
    if (path.length === 3 && path[0] === "projects" && path[2] === "assets") {
      if (request.method === "GET") return apiV1Success(listProjectFiles(context, request, path[1]));
      return apiV1MethodNotAllowed(["GET"]);
    }
    if (path.length === 4 && path[0] === "projects" && path[2] === "assets") {
      if (request.method !== "DELETE") return apiV1MethodNotAllowed(["DELETE"]);
      return apiV1Success(deleteProjectFile(context, request, path[1], path[3]));
    }

    if (path.join("/") === "finance/summary") {
      if (request.method !== "GET") return apiV1MethodNotAllowed(["GET"]);
      return apiV1Success(getFinanceSummary(context, request));
    }
    if (path.join("/") === "finance/transactions") {
      if (request.method === "GET") return apiV1Success(listFinance(context, request));
      if (request.method === "POST") return apiV1Success(createFinance(context, request, body), { status: 201 });
      return apiV1MethodNotAllowed(["GET", "POST"]);
    }
    if (path.length === 3 && path[0] === "finance" && path[1] === "transactions") {
      if (request.method === "GET") return apiV1Success(getFinance(context, request, path[2]));
      if (request.method === "PATCH") return apiV1Success(updateFinance(context, request, path[2], body));
      if (request.method === "DELETE") return apiV1Success(deleteFinance(context, request, path[2]));
      return apiV1MethodNotAllowed(["GET", "PATCH", "DELETE"]);
    }
    if (path.join("/") === "journal/entries") {
      if (request.method === "GET") return apiV1Success(listJournal(context, request));
      return apiV1MethodNotAllowed(["GET"]);
    }
    if (path.length === 3 && path[0] === "journal" && path[1] === "entries") {
      if (request.method === "GET") return apiV1Success(getJournal(context, request, path[2]));
      if (request.method === "PUT") return apiV1Success(upsertJournal(context, request, path[2], body));
      if (request.method === "PATCH") return apiV1Success(updateJournal(context, request, path[2], body));
      if (request.method === "DELETE") return apiV1Success(deleteJournal(context, request, path[2]));
      return apiV1MethodNotAllowed(["GET", "PUT", "PATCH", "DELETE"]);
    }

    if (path.length === 3 && path[0] === "clients" && path[2] === "activities") {
      if (request.method === "GET") {
        const items = listOwnerClientActivities(context, path[1]);
        return apiV1Success(paginate(items, { cursor: new URL(request.url).searchParams.get("cursor"), fingerprint: { clientId: path[1] }, limit: new URL(request.url).searchParams.get("limit") }));
      }
      if (request.method === "POST") return apiV1Success(createOwnerClientActivity(context, request, path[1], body), { status: 201 });
      return apiV1MethodNotAllowed(["GET", "POST"]);
    }

    if (path.length === 3 && path[0] === "clients" && path[2] === "portal-invitations") {
      if (request.method !== "POST") return apiV1MethodNotAllowed(["POST"]);
      const payload = invitationPayload(body);
      const idempotencyKey = request.headers.get("idempotency-key")?.trim() ?? "";
      const rawToken = derivePortalInvitationToken(context, path[1], idempotencyKey);
      const result = runIdempotentMutation(request, context, payload, () => {
        try {
          const invitation = createPortalInvitation(context, { clientId: path[1], email: payload.email, locale: payload.defaultLocale }, { rawToken });
          return {
            client: getOwnerClient(context, new Request(request.url, { headers: request.headers }), path[1]),
            expiresAt: invitation.expiresAt.toISOString(),
          };
        } catch (error) {
          if (error instanceof PortalInvitationError) {
            throw new DomainError(error.code === "FORBIDDEN" ? "FORBIDDEN" : error.code.includes("NOT_FOUND") ? "NOT_FOUND" : "CONFLICT", error.message);
          }
          throw error;
        }
      });
      return apiV1Success({ ...result, invitationUrl: `${getServerConfig().appUrl}/invite/${rawToken}` }, { status: 201 });
    }

    if (path.length === 3 && path[0] === "tasks" && path[2] === "complete") {
      if (request.method !== "POST") return apiV1MethodNotAllowed(["POST"]);
      return apiV1Success(completeOwnerTask(context, request, path[1], body));
    }

    return apiV1NotFound();
  } catch (error) {
    return apiV1Error(error);
  }
}

function invitationPayload(value: unknown): { defaultLocale: string; email: string } {
  if (!value || typeof value !== "object") throw new DomainError("VALIDATION_ERROR", "Davet payload geçersiz.");
  const { defaultLocale, email } = value as Record<string, unknown>;
  if (typeof defaultLocale !== "string" || typeof email !== "string") throw new DomainError("VALIDATION_ERROR", "Davet payload geçersiz.");
  return { defaultLocale, email };
}
