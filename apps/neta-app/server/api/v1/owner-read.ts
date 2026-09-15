import "server-only";

import type {
  CalendarEventDetail,
  CalendarRangeResponse,
  ClientDetail,
  ClientListItem,
  LocalizedTextPayload,
  OwnerDashboardOverview,
  PaginatedResponse,
  PlanningSection,
  ProjectDetail,
  ProjectListItem,
  ProjectRevision,
  TaskDetail,
  TaskListItem,
} from "@neta/api-contracts";
import type { SessionContext } from "@/server/auth/session";
import { domainActorFromSession } from "@/server/auth/domain-actor";
import type { DomainActor } from "@/server/domain/actor";
import { DomainError } from "@/server/domain/errors";
import { negotiateLocale } from "@/server/api/v1/localization";
import { getPublicLocalizationMetadata } from "@/server/i18n/runtime";
import type { ContentTranslationRow } from "@/server/i18n/content";
import { getUserPreferences } from "@/server/settings/preferences";
import { getDomainService } from "@/server/services/runtime";
import { paginate } from "./pagination";
import { optionalEnum, optionalText, requiredInstant, requiredTimezone, strictSearchParams } from "./query";

const CLIENT_STATUSES = ["active", "paused", "archived"] as const;
const PROJECT_STATUSES = ["planning", "active", "paused", "completed", "cancelled"] as const;
const TASK_STATUSES = ["todo", "in_progress", "done", "cancelled"] as const;
const DASHBOARD_RANGES = ["today", "this_week", "this_month", "this_year"] as const;

export function getOwnerDashboardOverview(context: SessionContext, request: Request): OwnerDashboardOverview {
  const params = strictSearchParams(request, ["range", "locale"]);
  const range = optionalEnum(params, "range", DASHBOARD_RANGES) ?? "this_month";
  const actor = domainActorFromSession(context);
  const service = getDomainService();
  const locale = resolveLocale(actor, request);
  const dates = dashboardDates(range);
  const data = service.getFreelancerDashboard(actor, dates);
  const analytics = service.getFreelancerAnalytics(actor, dates);
  const clientTranslations = service.contentTranslations.listBatch("client", data.clients.map((item) => item.id));
  const projectTranslations = service.contentTranslations.listBatch("project", data.projects.map((item) => item.id));
  const generatedAt = new Date().toISOString();

  return {
    dashboard: {
      generatedAt,
      range,
      stats: [
        { id: "active-projects", label: "Aktif projeler", value: data.metrics.activeProjectsCount, trendLabel: null },
        { id: "completed-tasks", label: "Tamamlanan işler", value: data.metrics.completedTasksCount, trendLabel: range },
        { id: "average-mood", label: "Ortalama mod", value: data.metrics.avgMood, trendLabel: null },
      ],
      recentClients: data.clients.map((client) => ({
        id: client.id,
        title: localizedEntity(service, "client", client, clientTranslations.get(client.id), locale).name,
        subtitle: client.companyName,
        status: client.status,
      })),
      recentProjects: data.projects.map((project) => ({
        id: project.id,
        title: localizedEntity(service, "project", project, projectTranslations.get(project.id), locale).name,
        subtitle: project.dueDate,
        status: project.status,
      })),
    },
    analytics: {
      generatedAt,
      range,
      chartSummary: `${analytics.activeTasks} aktif, ${analytics.completedTasks} tamamlanan iş`,
      revenue: [],
      tasks: [
        { label: "Aktif", value: analytics.activeTasks },
        { label: "Tamamlanan", value: analytics.completedTasks },
      ],
      projects: [],
    },
  };
}

export function listOwnerClients(context: SessionContext, request: Request): PaginatedResponse<ClientListItem> {
  const params = strictSearchParams(request, ["cursor", "limit", "locale", "search", "status"]);
  const search = optionalText(params, "search");
  const status = optionalEnum(params, "status", CLIENT_STATUSES);
  const { actor, locale, service } = ownerContext(context, request);
  const rows = service.listClients(actor);
  const translations = service.contentTranslations.listBatch("client", rows.map((row) => row.id));
  const projectCounts = countBy(service.listProjects(actor), (project) => project.clientId);
  const items = rows
    .map((row) => presentClient(row, projectCounts.get(row.id) ?? 0, localizedEntity(service, "client", row, translations.get(row.id), locale).name))
    .filter((item) => (!status || item.status === status) && (!search || searchable(item.displayName, item.email, item.phone).includes(search.toLocaleLowerCase(locale.locale))))
    .sort(updatedDescending);
  return paginate(items, { cursor: params.get("cursor"), fingerprint: { locale: locale.locale, search, status }, limit: params.get("limit") });
}

export function getOwnerClient(context: SessionContext, request: Request, id: string): ClientDetail {
  strictSearchParams(request, ["locale"]);
  const { actor, locale, service } = ownerContext(context, request);
  const row = service.getClient(actor, id);
  const projects = service.listProjects(actor);
  const localized = localizedEntity(service, "client", row, undefined, locale);
  return {
    ...presentClient(row, projects.filter((project) => project.clientId === id).length, localized.name),
    company: row.companyName,
    notes: localized.notes ?? row.notes,
    translations: translationPayload(service.contentTranslations.listEntityTranslations("client", id), row.name, row.notes, locale.defaultLocale),
  };
}

export function listOwnerProjects(context: SessionContext, request: Request): PaginatedResponse<ProjectListItem> {
  const params = strictSearchParams(request, ["clientId", "cursor", "limit", "locale", "search", "status"]);
  const clientId = optionalText(params, "clientId");
  const search = optionalText(params, "search");
  const status = optionalEnum(params, "status", PROJECT_STATUSES);
  const { actor, locale, service } = ownerContext(context, request);
  const clients = new Map(service.listClients(actor).map((client) => [client.id, client.name]));
  const rows = service.listProjects(actor);
  const translations = service.contentTranslations.listBatch("project", rows.map((row) => row.id));
  const items = rows
    .map((row) => presentProject(row, clients.get(row.clientId ?? "") ?? null, localizedEntity(service, "project", row, translations.get(row.id), locale).name))
    .filter((item) => (!clientId || item.clientId === clientId) && (!status || item.status === status) && (!search || searchable(item.title, item.clientName).includes(search.toLocaleLowerCase(locale.locale))))
    .sort(updatedDescending);
  return paginate(items, { cursor: params.get("cursor"), fingerprint: { clientId, locale: locale.locale, search, status }, limit: params.get("limit") });
}

export function getOwnerProject(context: SessionContext, request: Request, id: string): ProjectDetail {
  strictSearchParams(request, ["locale"]);
  const { actor, locale, service } = ownerContext(context, request);
  const row = service.getProject(actor, id);
  const clientName = row.clientId ? service.getClient(actor, row.clientId).name : null;
  const localized = localizedEntity(service, "project", row, undefined, locale);
  const revisions = service.listRevisions(actor, id);
  return {
    ...presentProject(row, clientName, localized.name),
    revisionAllowance: row.revisionQuota,
    revisionsUsed: revisions.filter((revision) => revision.status !== "rejected").length,
    translations: translationPayload(service.contentTranslations.listEntityTranslations("project", id), row.name, row.description, locale.defaultLocale),
  };
}

export function listOwnerPlanning(context: SessionContext, request: Request, projectId: string): PaginatedResponse<PlanningSection> {
  const params = strictSearchParams(request, ["cursor", "limit", "locale"]);
  const { actor, locale, service } = ownerContext(context, request);
  const rows = service.listPlanningSections(actor, projectId);
  const translations = service.contentTranslations.listBatch("planning_section", rows.map((row) => row.id));
  const items = rows.map((row) => {
    const localized = localizedEntity(service, "planning_section", row, translations.get(row.id), locale);
    return { category: row.category, content: localized.content, id: row.id, order: row.sortOrder, title: localized.title };
  }).sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
  return paginate(items, { cursor: params.get("cursor"), fingerprint: { locale: locale.locale, projectId }, limit: params.get("limit") });
}

export function listOwnerRevisions(context: SessionContext, request: Request, projectId: string): PaginatedResponse<ProjectRevision> {
  const params = strictSearchParams(request, ["cursor", "limit"]);
  const actor = domainActorFromSession(context);
  const items = getDomainService().listRevisions(actor, projectId).map((row) => ({
    createdAt: toIso(row.createdAt), description: row.description, id: row.id, requestedBy: row.requestedByUserId, status: row.status,
  })).sort((a, b) => b.createdAt.localeCompare(a.createdAt) || a.id.localeCompare(b.id));
  return paginate(items, { cursor: params.get("cursor"), fingerprint: { projectId }, limit: params.get("limit") });
}

export function listOwnerTasks(context: SessionContext, request: Request): PaginatedResponse<TaskListItem> {
  const params = strictSearchParams(request, ["clientId", "cursor", "limit", "locale", "projectId", "search", "status"]);
  const clientId = optionalText(params, "clientId");
  const projectId = optionalText(params, "projectId");
  const search = optionalText(params, "search");
  const status = optionalEnum(params, "status", TASK_STATUSES);
  const { actor, locale, service } = ownerContext(context, request);
  const clients = new Map(service.listClients(actor).map((row) => [row.id, row.name]));
  const projects = new Map(service.listProjects(actor).map((row) => [row.id, row.name]));
  const rows = service.listTasks(actor);
  const translations = service.contentTranslations.listBatch("task", rows.map((row) => row.id));
  const items = rows.map((row) => presentTask(row, clients.get(row.clientId ?? "") ?? null, projects.get(row.projectId ?? "") ?? null, localizedEntity(service, "task", row, translations.get(row.id), locale).title))
    .filter((item) => (!clientId || item.clientId === clientId) && (!projectId || item.projectId === projectId) && (!status || item.status === status) && (!search || searchable(item.title, item.clientName, item.projectName).includes(search.toLocaleLowerCase(locale.locale))))
    .sort(updatedDescending);
  return paginate(items, { cursor: params.get("cursor"), fingerprint: { clientId, locale: locale.locale, projectId, search, status }, limit: params.get("limit") });
}

export function getOwnerTask(context: SessionContext, request: Request, id: string): TaskDetail {
  strictSearchParams(request, ["locale"]);
  const { actor, locale, service } = ownerContext(context, request);
  const row = service.getTask(actor, id);
  const localized = localizedEntity(service, "task", row, undefined, locale);
  return {
    ...presentTask(row, row.clientId ? service.getClient(actor, row.clientId).name : null, row.projectId ? service.getProject(actor, row.projectId).name : null, localized.title),
    translations: translationPayload(service.contentTranslations.listEntityTranslations("task", id), row.title, row.description, locale.defaultLocale),
    version: toIso(row.updatedAt),
  };
}

export function listOwnerCalendar(context: SessionContext, request: Request): CalendarRangeResponse {
  const params = strictSearchParams(request, ["from", "locale", "timezone", "to"]);
  const timezone = requiredTimezone(params, "timezone");
  const from = calendarBoundary(params, "from", timezone);
  const to = calendarBoundary(params, "to", timezone);
  if (to <= from || to.getTime() - from.getTime() > 93 * 86_400_000) {
    throw new DomainError("VALIDATION_ERROR", "Calendar range must be positive and at most 93 days.", { messageKey: "validation.invalidRange" });
  }
  const { actor, locale, service } = ownerContext(context, request);
  const rows = service.listCalendarEvents(actor).filter((row) => row.startsAt < to && (row.endsAt ?? row.startsAt) >= from);
  const translations = service.contentTranslations.listBatch("calendar_event", rows.map((row) => row.id));
  return {
    from: from.toISOString(),
    to: to.toISOString(),
    timezone,
    items: rows.map((row) => presentCalendar(row, localizedEntity(service, "calendar_event", row, translations.get(row.id), locale).title))
      .sort((a, b) => a.startAt.localeCompare(b.startAt) || a.id.localeCompare(b.id)),
  };
}

export function getOwnerCalendarEvent(context: SessionContext, request: Request, id: string): CalendarEventDetail {
  strictSearchParams(request, ["locale"]);
  const { actor, locale, service } = ownerContext(context, request);
  const row = service.getCalendarEvent(actor, id);
  const localized = localizedEntity(service, "calendar_event", row, undefined, locale);
  return {
    ...presentCalendar(row, localized.title),
    translations: translationPayload(service.contentTranslations.listEntityTranslations("calendar_event", id), row.title, row.description, locale.defaultLocale),
    version: toIso(row.updatedAt),
  };
}

export function ownerContext(context: SessionContext, request: Request) {
  const actor = domainActorFromSession(context);
  return { actor, locale: resolveLocale(actor, request), service: getDomainService() };
}

function resolveLocale(actor: DomainActor, request: Request) {
  return negotiateLocale({
    metadata: getPublicLocalizationMetadata(),
    requestedLocale: new URL(request.url).searchParams.get("locale"),
    acceptLanguage: request.headers.get("accept-language"),
    preferredLocale: getUserPreferences(actor).language,
  });
}

export function localizedEntity<T extends Record<string, unknown>>(
  service: ReturnType<typeof getDomainService>, entityType: Parameters<typeof service.contentTranslations.resolveEntity>[0], entity: T,
  translations: ContentTranslationRow[] | undefined, locale: ReturnType<typeof resolveLocale>,
): T {
  return service.contentTranslations.resolveEntity(entityType, entity, {
    defaultLocale: locale.defaultLocale, fallbackLocale: locale.fallbackChain[1], locale: locale.locale, translations,
  });
}

function presentClient(row: ReturnType<ReturnType<typeof getDomainService>["listClients"]>[number], projectCount: number, displayName: string): ClientListItem {
  return { id: row.id, displayName, email: row.email, phone: row.phone, portalLocale: row.portalLocale, portalStatus: row.authUserId ? "active" : null, projectCount, pipelineStatus: row.pipelineStage, status: row.status, updatedAt: toIso(row.updatedAt) };
}

function presentProject(row: ReturnType<ReturnType<typeof getDomainService>["listProjects"]>[number], clientName: string | null, title: string): ProjectListItem {
  return { clientId: row.clientId, clientName, dueDate: row.dueDate, id: row.id, progress: row.progress, progressType: row.progressType, status: row.status, title, type: row.type, updatedAt: toIso(row.updatedAt) };
}

function presentTask(row: ReturnType<ReturnType<typeof getDomainService>["listTasks"]>[number], clientName: string | null, projectName: string | null, title: string): TaskListItem {
  return { actualMinutes: row.actualMinutes, clientId: row.clientId, clientName, dueAt: nullableIso(row.dueAt), estimatedMinutes: row.estimatedMinutes, id: row.id, isPublicToClient: row.isPublicToClient, priority: row.priority, projectId: row.projectId, projectName, scheduledDate: row.scheduledDate, status: row.status, title, updatedAt: toIso(row.updatedAt) };
}

function presentCalendar(row: ReturnType<ReturnType<typeof getDomainService>["listCalendarEvents"]>[number], title: string) {
  return { clientId: row.clientId, endAt: toIso(row.endsAt ?? row.startsAt), id: row.id, projectId: row.projectId, readOnly: false, source: "calendar" as const, startAt: toIso(row.startsAt), taskId: row.taskId, title, type: row.type };
}

export function translationPayload(rows: ContentTranslationRow[], defaultName: string, defaultDescription: string | null, defaultLocale: string): LocalizedTextPayload {
  const output: LocalizedTextPayload = { [defaultLocale]: { name: defaultName, description: defaultDescription } };
  for (const row of rows) {
    const current = output[row.locale] ?? { name: defaultName };
    if (row.field === "name" || row.field === "title") current.name = row.value;
    if (row.field === "description" || row.field === "notes") current.description = row.value;
    output[row.locale] = current;
  }
  return output;
}

function countBy<T>(items: readonly T[], key: (item: T) => string | null): Map<string, number> {
  const result = new Map<string, number>();
  for (const item of items) { const value = key(item); if (value) result.set(value, (result.get(value) ?? 0) + 1); }
  return result;
}

function searchable(...values: Array<string | null>): string { return values.filter(Boolean).join(" ").toLocaleLowerCase(); }
function updatedDescending<T extends { id: string; updatedAt: string }>(a: T, b: T) { return b.updatedAt.localeCompare(a.updatedAt) || a.id.localeCompare(b.id); }
export function toIso(value: Date | string | number): string { return value instanceof Date ? value.toISOString() : new Date(value).toISOString(); }
function nullableIso(value: Date | string | number | null): string | null { return value == null ? null : toIso(value); }

function calendarBoundary(params: URLSearchParams, key: string, timezone: string): Date {
  const value = params.get(key);
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return requiredInstant(params, key);
  const [year, month, day] = value.split("-").map(Number);
  const targetUtc = Date.UTC(year, month - 1, day);
  const normalized = new Date(targetUtc);
  if (normalized.getUTCFullYear() !== year || normalized.getUTCMonth() !== month - 1 || normalized.getUTCDate() !== day) {
    throw new DomainError("VALIDATION_ERROR", `Invalid ${key}.`, { field: key, messageKey: "validation.invalidQuery" });
  }
  const probe = new Date(targetUtc);
  const firstOffset = timezoneOffsetMs(probe, timezone);
  const candidate = new Date(targetUtc - firstOffset);
  return new Date(targetUtc - timezoneOffsetMs(candidate, timezone));
}

function timezoneOffsetMs(instant: Date, timezone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    day: "2-digit", hour: "2-digit", hourCycle: "h23", minute: "2-digit", month: "2-digit",
    second: "2-digit", timeZone: timezone, year: "numeric",
  }).formatToParts(instant);
  const values = Object.fromEntries(parts.map((part) => [part.type, Number(part.value)]));
  return Date.UTC(values.year, values.month - 1, values.day, values.hour, values.minute, values.second) - instant.getTime();
}

function dashboardDates(range: typeof DASHBOARD_RANGES[number]) {
  const endAt = new Date();
  const startAt = new Date(endAt);
  if (range === "today") startAt.setHours(0, 0, 0, 0);
  if (range === "this_week") { startAt.setDate(startAt.getDate() - ((startAt.getDay() + 6) % 7)); startAt.setHours(0, 0, 0, 0); }
  if (range === "this_month") { startAt.setDate(1); startAt.setHours(0, 0, 0, 0); }
  if (range === "this_year") { startAt.setMonth(0, 1); startAt.setHours(0, 0, 0, 0); }
  return { startAt, endAt, startDate: startAt.toISOString().slice(0, 10), endDate: endAt.toISOString().slice(0, 10) };
}
