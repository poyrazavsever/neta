import "server-only";

import { and, eq } from "drizzle-orm";
import type {
  PortalDashboard, PortalLocalizedPage, PortalProfile, PortalProjectDetail,
  PortalProjectSummary, PortalRevision, PortalTask,
} from "@neta/api-contracts";
import { auth } from "@/server/auth/auth";
import { domainActorFromSession } from "@/server/auth/domain-actor";
import type { SessionContext } from "@/server/auth/session";
import { getBrandingService } from "@/server/branding/runtime";
import { getServerConfig } from "@/server/config";
import { getSqliteConnection } from "@/server/db/client";
import { appProfiles, clients, files, user } from "@/server/db/schema";
import { DomainError } from "@/server/domain/errors";
import { getPublicLocalizationMetadata } from "@/server/i18n/runtime";
import { getDomainService } from "@/server/services/runtime";
import { getUserPreferences } from "@/server/settings/preferences";
import { paginate } from "./pagination";

export function getPortalDashboard(context: SessionContext, request: Request): PortalDashboard {
  const actor = domainActorFromSession(context);
  const service = getDomainService();
  const projects = service.listProjects(actor);
  const tasks = service.listTasks(actor);
  const revisions = service.listPortalRevisions(actor);
  const locale = portalLocale(context, request);
  return {
    generatedAt: new Date().toISOString(), locale, fallbackChain: fallbackChain(locale),
    portalFooter: getBrandingService().getPublic().portalFooterText,
    projects: projects.slice(0, 5).map(toProject),
    stats: {
      activeProjects: projects.filter((item) => item.status === "active").length,
      completedProjects: projects.filter((item) => item.status === "completed").length,
      completedTasks: tasks.filter((item) => item.status === "done").length,
      pendingRevisions: revisions.filter((item) => item.status === "pending" || item.status === "in_progress").length,
    },
  };
}

export function listPortalProjects(context: SessionContext, request: Request): PortalLocalizedPage<PortalProjectSummary> {
  const locale = portalLocale(context, request);
  const page = paginate(getDomainService().listProjects(domainActorFromSession(context)).map(toProject), {
    cursor: new URL(request.url).searchParams.get("cursor"), fingerprint: { portal: "projects", locale },
    limit: new URL(request.url).searchParams.get("limit"),
  });
  return { ...page, locale, fallbackChain: fallbackChain(locale) };
}

export function getPortalProject(context: SessionContext, request: Request, projectId: string): PortalProjectDetail {
  const service = getDomainService();
  const actor = domainActorFromSession(context);
  const project = service.getProject(actor, projectId);
  const locale = portalLocale(context, request);
  const projectNames = new Map([[project.id, project.name]]);
  const dbFiles = getSqliteConnection().db.select().from(files)
    .where(and(eq(files.projectId, project.id), eq(files.visibility, "portal"))).all();
  const revisions = service.listRevisions(actor, project.id).map((row) => toRevision(row, project.name));
  const allowance = service.getRevisionAllowance(actor, project.id);
  return {
    resource: { id: project.id, status: project.status, progress: project.progress, dueDate: project.dueDate, updatedAt: project.updatedAt.toISOString() },
    localized: { title: project.name, description: project.description },
    locale, fallbackChain: fallbackChain(locale),
    planningSections: service.listPlanningSections(actor, project.id).map((row) => ({ id: row.id, title: row.title, description: row.content, order: row.sortOrder })),
    publicTasks: service.listTasks(actor, project.id).map((row) => toTask(row, projectNames.get(row.projectId ?? "") ?? project.name)),
    assets: dbFiles.map((row) => ({
      id: row.id, name: row.originalName, mimeType: row.mimeType, sizeBytes: row.byteSize,
        url: new URL(`/api/v1/files/${row.id}`, getServerConfig().appUrl).toString(), visibility: "portal" as const,
    })),
    revisions,
    revisionAllowance: { allowed: allowance.quota, used: allowance.used, remaining: allowance.remaining, canRequest: allowance.canRequest },
  };
}

export function listPortalTasks(context: SessionContext, request: Request): PortalLocalizedPage<PortalTask> {
  const actor = domainActorFromSession(context);
  const service = getDomainService();
  const params = new URL(request.url).searchParams;
  const projectId = params.get("projectId") ?? undefined;
  const status = params.get("status");
  const projects = new Map(service.listProjects(actor).map((item) => [item.id, item.name]));
  let values = service.listTasks(actor, projectId);
  if (status) values = values.filter((item) => item.status === status);
  const locale = portalLocale(context, request);
  const page = paginate(values.map((row) => toTask(row, projects.get(row.projectId ?? "") ?? "")), {
    cursor: params.get("cursor"), limit: params.get("limit"), fingerprint: { portal: "tasks", projectId, status, locale },
  });
  return { ...page, locale, fallbackChain: fallbackChain(locale) };
}

export function listPortalRevisions(context: SessionContext, request: Request): PortalLocalizedPage<PortalRevision> {
  const actor = domainActorFromSession(context);
  const service = getDomainService();
  const params = new URL(request.url).searchParams;
  const projectId = params.get("projectId");
  const status = params.get("status");
  const projects = new Map(service.listProjects(actor).map((item) => [item.id, item.name]));
  let values = projectId ? service.listRevisions(actor, projectId) : service.listPortalRevisions(actor);
  if (status) values = values.filter((item) => item.status === status);
  const locale = portalLocale(context, request);
  const page = paginate(values.map((row) => toRevision(row, projects.get(row.projectId) ?? "")), {
    cursor: params.get("cursor"), limit: params.get("limit"), fingerprint: { portal: "revisions", projectId, status, locale },
  });
  return { ...page, locale, fallbackChain: fallbackChain(locale) };
}

export function createPortalRevision(context: SessionContext, projectId: string, body: unknown): PortalRevision {
  const value = asRecord(body);
  if (typeof value.description !== "string" || !value.description.trim() || value.description.length > 4_000 ||
      typeof value.sourceLocale !== "string" || !value.sourceLocale.trim()) {
    throw new DomainError("VALIDATION_ERROR", "Revizyon isteği geçersiz.");
  }
  const service = getDomainService();
  const actor = domainActorFromSession(context);
  const project = service.getProject(actor, projectId);
  const revision = service.requestRevision(actor, {
    projectId, description: value.description.trim(), sourceLocale: value.sourceLocale,
  });
  return toRevision(revision, project.name);
}

export function getPortalProfile(context: SessionContext): PortalProfile {
  const preferences = getUserPreferences(domainActorFromSession(context));
  const client = getDomainService().getClient(domainActorFromSession(context), context.profile.clientId!);
  return {
    name: context.profile.displayName, email: context.profile.email,
    avatarUrl: context.user.image ? new URL(context.user.image, getServerConfig().appUrl).toString() : null,
    clientDefaultLocale: client.portalLocale,
    preferences: { colorMode: preferences.colorMode, locale: preferences.language, timezone: preferences.timezone },
  };
}

export async function updatePortalProfile(context: SessionContext, request: Request, body: unknown): Promise<PortalProfile> {
  const name = asRecord(body).name;
  if (typeof name !== "string" || !name.trim() || name.length > 200) throw new DomainError("VALIDATION_ERROR", "Ad geçersiz.");
  const displayName = name.trim();
  await auth.api.updateUser({ headers: request.headers, body: { name: displayName } });
  const { db } = getSqliteConnection();
  db.update(appProfiles).set({ displayName, updatedAt: new Date() }).where(eq(appProfiles.authUserId, context.user.id)).run();
  db.update(user).set({ name: displayName, updatedAt: new Date() }).where(eq(user.id, context.user.id)).run();
  return getPortalProfile({ ...context, profile: { ...context.profile, displayName }, user: { ...context.user, name: displayName } });
}

function toProject(row: ReturnType<ReturnType<typeof getDomainService>["listProjects"]>[number]): PortalProjectSummary {
  return { id: row.id, title: row.name, description: row.description, dueDate: row.dueDate, progress: row.progress, status: row.status, updatedAt: row.updatedAt.toISOString() };
}

function toTask(row: ReturnType<ReturnType<typeof getDomainService>["listTasks"]>[number], projectName: string): PortalTask {
  if (!row.projectId) throw new DomainError("INVARIANT_VIOLATION", "Portal görevinin projesi eksik.");
  return { id: row.id, title: row.title, description: row.description, projectId: row.projectId, projectName, status: row.status, priority: row.priority, dueAt: row.dueAt?.toISOString() ?? null, isPublicToClient: true, updatedAt: row.updatedAt.toISOString() };
}

function toRevision(row: ReturnType<ReturnType<typeof getDomainService>["listPortalRevisions"]>[number], projectName: string): PortalRevision {
  return { id: row.id, projectId: row.projectId, projectName, description: row.description, sourceLocale: row.sourceLocale ?? "tr", status: row.status, createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString() };
}

function portalLocale(context: SessionContext, request: Request): string {
  const requested = new URL(request.url).searchParams.get("locale") ?? request.headers.get("accept-language")?.split(",")[0]?.split(";")[0]?.trim();
  const clientLocale = getSqliteConnection().db.select({ value: clients.portalLocale }).from(clients).where(eq(clients.id, context.profile.clientId!)).get()?.value;
  return requested || getUserPreferences(domainActorFromSession(context)).language || clientLocale || getPublicLocalizationMetadata().defaultLocale;
}

function fallbackChain(locale: string): string[] {
  const base = locale.split("-")[0];
  const fallback = getPublicLocalizationMetadata().defaultLocale;
  return [...new Set([locale, base, fallback])];
}

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new DomainError("VALIDATION_ERROR", "Payload geçersiz.");
  return value as Record<string, unknown>;
}
