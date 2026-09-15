import "server-only";

import type {
  CalendarEventDetail,
  CalendarEventMutationPayload,
  ClientActivity,
  ClientActivityMutationPayload,
  ClientDetail,
  ClientMutationPayload,
  DeleteResult,
  ProjectDetail,
  ProjectMutationPayload,
  TaskDetail,
  TaskMutationPayload,
} from "@neta/api-contracts";
import {
  isCalendarEventMutationPayload,
  isClientActivityMutationPayload,
  isClientMutationPayload,
  isProjectMutationPayload,
  isTaskMutationPayload,
  isTaskStatusMutationPayload,
} from "@neta/api-contracts";
import type { SessionContext } from "@/server/auth/session";
import { domainActorFromSession } from "@/server/auth/domain-actor";
import { DomainError } from "@/server/domain/errors";
import { getDomainService } from "@/server/services/runtime";
import { getOwnerCalendarEvent, getOwnerClient, getOwnerProject, getOwnerTask, toIso } from "./owner-read";
import { requireCurrentVersion, requireIfMatch, runIdempotentMutation } from "./mutations";

export function createOwnerClient(context: SessionContext, request: Request, body: unknown): ClientDetail {
  const payload = validate(body, isClientMutationPayload, "Müşteri");
  return runIdempotentMutation(request, context, payload, () => {
    const actor = domainActorFromSession(context);
    const row = getDomainService().createClient(actor, clientInput(payload));
    return getOwnerClient(context, detailRequest(request), row.id);
  });
}

export function updateOwnerClient(context: SessionContext, request: Request, id: string, body: unknown): ClientDetail {
  const payload = validate(body, isClientMutationPayload, "Müşteri");
  const actor = domainActorFromSession(context);
  const service = getDomainService();
  requireCurrentVersion(payload.version, service.getClient(actor, id).updatedAt);
  service.updateClient(actor, id, clientInput(payload));
  return getOwnerClient(context, detailRequest(request), id);
}

export function listOwnerClientActivities(context: SessionContext, clientId: string): ClientActivity[] {
  const actor = domainActorFromSession(context);
  return getDomainService().listClientActivities(actor, clientId).map(presentActivity);
}

export function createOwnerClientActivity(context: SessionContext, request: Request, clientId: string, body: unknown): ClientActivity {
  const payload = validate(body, isClientActivityMutationPayload, "Müşteri aktivitesi");
  return runIdempotentMutation(request, context, payload, () => {
    const row = getDomainService().addClientActivity(domainActorFromSession(context), {
      activityDate: payload.occurredAt ? validDate(payload.occurredAt, "occurredAt") : new Date(),
      clientId,
      content: payload.note,
      title: payload.note.slice(0, 200),
      type: payload.type,
    });
    return presentActivity(row);
  });
}

export function createOwnerProject(context: SessionContext, request: Request, body: unknown): ProjectDetail {
  const payload = validate(body, isProjectMutationPayload, "Proje");
  return runIdempotentMutation(request, context, payload, () => {
    const row = getDomainService().createProject(domainActorFromSession(context), projectInput(payload));
    return getOwnerProject(context, detailRequest(request), row.id);
  });
}

export function updateOwnerProject(context: SessionContext, request: Request, id: string, body: unknown): ProjectDetail {
  const payload = validate(body, isProjectMutationPayload, "Proje");
  const actor = domainActorFromSession(context);
  const service = getDomainService();
  requireCurrentVersion(payload.version, service.getProject(actor, id).updatedAt);
  service.updateProject(actor, id, projectInput(payload));
  return getOwnerProject(context, detailRequest(request), id);
}

export function createOwnerTask(context: SessionContext, request: Request, body: unknown): TaskDetail {
  const payload = validate(body, isTaskMutationPayload, "Görev");
  return runIdempotentMutation(request, context, payload, () => {
    const row = getDomainService().createTask(domainActorFromSession(context), taskInput(payload));
    return getOwnerTask(context, detailRequest(request), row.id);
  });
}

export function updateOwnerTask(context: SessionContext, request: Request, id: string, body: unknown): TaskDetail {
  const payload = validate(body, (value): value is TaskMutationPayload => isTaskMutationPayload(value) || isTaskStatusMutationPayload(value), "Görev");
  const actor = domainActorFromSession(context);
  const service = getDomainService();
  requireCurrentVersion(payload.version, service.getTask(actor, id).updatedAt);
  service.updateTask(actor, id, taskInput(payload));
  return getOwnerTask(context, detailRequest(request), id);
}

export function completeOwnerTask(context: SessionContext, request: Request, id: string, body: unknown): TaskDetail {
  const payload = validate(body, isVersionBody, "Görev tamamlama");
  return runIdempotentMutation(request, context, payload, () => {
    const actor = domainActorFromSession(context);
    const service = getDomainService();
    requireCurrentVersion(payload.version, service.getTask(actor, id).updatedAt);
    service.updateTask(actor, id, { status: "done" });
    return getOwnerTask(context, detailRequest(request), id);
  });
}

export function deleteOwnerTask(context: SessionContext, request: Request, id: string): DeleteResult {
  const actor = domainActorFromSession(context);
  const service = getDomainService();
  requireIfMatch(request, service.getTask(actor, id).updatedAt);
  service.deleteTask(actor, id);
  return { deleted: true, id };
}

export function createOwnerCalendarEvent(context: SessionContext, request: Request, body: unknown): CalendarEventDetail {
  const payload = validate(body, isCalendarEventMutationPayload, "Takvim kaydı");
  return runIdempotentMutation(request, context, payload, () => {
    const row = getDomainService().createCalendarEvent(domainActorFromSession(context), calendarInput(payload));
    return getOwnerCalendarEvent(context, detailRequest(request), row.id);
  });
}

export function updateOwnerCalendarEvent(context: SessionContext, request: Request, id: string, body: unknown): CalendarEventDetail {
  const payload = validate(body, isCalendarEventMutationPayload, "Takvim kaydı");
  const actor = domainActorFromSession(context);
  const service = getDomainService();
  requireCurrentVersion(payload.version, service.getCalendarEvent(actor, id).updatedAt);
  service.updateCalendarEvent(actor, id, calendarInput(payload));
  return getOwnerCalendarEvent(context, detailRequest(request), id);
}

export function deleteOwnerCalendarEvent(context: SessionContext, request: Request, id: string): DeleteResult {
  const actor = domainActorFromSession(context);
  const service = getDomainService();
  requireIfMatch(request, service.getCalendarEvent(actor, id).updatedAt);
  service.deleteCalendarEvent(actor, id);
  return { deleted: true, id };
}

function clientInput(payload: ClientMutationPayload) {
  const { pipelineStatus, version: _version, ...rest } = payload;
  const localizedName = Object.values(payload.translations).find((value) => value.name.trim())?.name.trim();
  return { ...rest, ...(localizedName ? { name: localizedName } : {}), ...(pipelineStatus ? { pipelineStage: pipelineStatus } : {}) };
}

function projectInput(payload: ProjectMutationPayload) {
  const { version: _version, ...rest } = payload;
  return rest;
}

function taskInput(payload: TaskMutationPayload | { status: string; position?: number; version?: string | null }) {
  const { version: _version, ...rest } = payload;
  return {
    ...rest,
    ...("dueAt" in rest && rest.dueAt ? { dueAt: validDate(rest.dueAt, "dueAt") } : {}),
  };
}

function calendarInput(payload: CalendarEventMutationPayload) {
  const { endAt, startAt, version: _version, ...rest } = payload;
  return { ...rest, endsAt: validDate(endAt, "endAt"), startsAt: validDate(startAt, "startAt") };
}

function presentActivity(row: ReturnType<ReturnType<typeof getDomainService>["listClientActivities"]>[number]): ClientActivity {
  return { createdAt: toIso(row.activityDate), id: row.id, note: row.content ?? row.title, type: row.type };
}

function detailRequest(request: Request): Request {
  const url = new URL(request.url);
  for (const key of [...url.searchParams.keys()]) if (key !== "locale") url.searchParams.delete(key);
  return new Request(url, { headers: request.headers, method: "GET" });
}

function validDate(value: string, field: string): Date {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new DomainError("VALIDATION_ERROR", `Geçersiz ${field}.`, { field });
  return date;
}

function isVersionBody(value: unknown): value is { version: string } {
  return Boolean(value && typeof value === "object" && typeof (value as { version?: unknown }).version === "string");
}

function validate<T>(value: unknown, guard: (candidate: unknown) => candidate is T, resource: string): T {
  if (!guard(value)) throw new DomainError("VALIDATION_ERROR", `${resource} payload geçersiz.`);
  return value;
}
