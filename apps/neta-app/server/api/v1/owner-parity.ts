import "server-only";

import type {
  DeleteResult,
  FinanceTransactionDetail,
  FinanceTransactionListItem,
  FinanceTransactionMutationPayload,
  JournalEntryDetail,
  JournalEntryListItem,
  JournalEntryMutationPayload,
  JournalRangeResponse,
  LocalizedFinancePayload,
  LocalizedJournalPayload,
  MultiCurrencyFinanceSummary,
  PaginatedResponse,
} from "@neta/api-contracts";
import { isFinanceTransactionMutationPayload, isJournalEntryMutationPayload } from "@neta/api-contracts";
import type { SessionContext } from "@/server/auth/session";
import { domainActorFromSession } from "@/server/auth/domain-actor";
import { DomainError } from "@/server/domain/errors";
import { getDomainService } from "@/server/services/runtime";
import { localizedEntity, ownerContext, toIso } from "./owner-read";
import { paginate } from "./pagination";
import { optionalText, strictSearchParams } from "./query";
import { requireCurrentVersion, requireIfMatch, runIdempotentMutation } from "./mutations";

export function getFinanceSummary(context: SessionContext, request: Request): MultiCurrencyFinanceSummary {
  const params = strictSearchParams(request, ["month"]);
  const month = requiredMonth(params.get("month"));
  const actor = domainActorFromSession(context);
  const rows = getDomainService().listFinanceTransactions(actor).filter((row) => row.transactionDate.startsWith(month));
  const groups = new Map<string, typeof rows>();
  for (const row of rows) groups.set(row.currency, [...(groups.get(row.currency) ?? []), row]);
  return {
    currencies: [...groups.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([currency, items]) => {
      const income = sum(items.filter((item) => item.type === "income" && item.paymentStatus === "paid"));
      const expense = sum(items.filter((item) => item.type === "expense" && item.paymentStatus === "paid"));
      const pending = sum(items.filter((item) => item.paymentStatus === "planned" || item.paymentStatus === "pending"));
      const money = (amountMinor: number) => ({ amountMinor, currency });
      return { currency, totals: { expense: money(expense), gross: money(income), income: money(income), net: money(income - expense), pending: money(pending), taxEstimate: null } };
    }),
    generatedAt: new Date().toISOString(),
    month,
    taxDisclaimer: "Vergi tahmini sunulmaz; para birimleri kur verisi olmadan birleştirilmez.",
  };
}

export function listFinance(context: SessionContext, request: Request): PaginatedResponse<FinanceTransactionListItem> {
  const params = strictSearchParams(request, ["clientId", "cursor", "kind", "limit", "locale", "month", "paymentStatus", "projectId", "search"]);
  const month = params.get("month");
  if (month) requiredMonth(month);
  const { actor, locale, service } = ownerContext(context, request);
  const clientId = optionalText(params, "clientId");
  const projectId = optionalText(params, "projectId");
  const search = optionalText(params, "search");
  const kind = params.get("kind");
  const paymentStatus = params.get("paymentStatus");
  if (kind && kind !== "income" && kind !== "expense") invalidQuery("kind");
  if (paymentStatus && !["planned", "pending", "paid", "cancelled"].includes(paymentStatus)) invalidQuery("paymentStatus");
  const clients = new Map(service.listClients(actor).map((row) => [row.id, row.name]));
  const projects = new Map(service.listProjects(actor).map((row) => [row.id, row.name]));
  const rows = service.listFinanceTransactions(actor);
  const translations = service.contentTranslations.listBatch("finance_transaction", rows.map((row) => row.id));
  const items = rows.map((row) => {
    const localized = localizedEntity(service, "finance_transaction", row, translations.get(row.id), locale);
    return presentFinance(row, localized.category ?? "", localized.description ?? null, clients.get(row.clientId ?? "") ?? null, projects.get(row.projectId ?? "") ?? null);
  }).filter((item) => (!month || item.date.startsWith(month)) && (!clientId || item.clientId === clientId) && (!projectId || item.projectId === projectId) && (!kind || item.kind === kind) && (!paymentStatus || item.paymentStatus === paymentStatus) && (!search || `${item.category} ${item.description ?? ""}`.toLocaleLowerCase(locale.locale).includes(search.toLocaleLowerCase(locale.locale))))
    .sort((a, b) => b.date.localeCompare(a.date) || b.updatedAt.localeCompare(a.updatedAt) || a.id.localeCompare(b.id));
  return paginate(items, { cursor: params.get("cursor"), fingerprint: { clientId, kind, locale: locale.locale, month, paymentStatus, projectId, search }, limit: params.get("limit") });
}

export function getFinance(context: SessionContext, request: Request, id: string): FinanceTransactionDetail {
  const { actor, locale, service } = ownerContext(context, request);
  const row = service.getFinanceTransaction(actor, id);
  const localized = localizedEntity(service, "finance_transaction", row, undefined, locale);
  return {
    ...presentFinance(row, localized.category ?? "", localized.description ?? null, row.clientId ? service.getClient(actor, row.clientId).name : null, row.projectId ? service.getProject(actor, row.projectId).name : null),
    translations: financeTranslations(service.contentTranslations.listEntityTranslations("finance_transaction", id), row.category ?? "", row.description, locale.defaultLocale),
    version: toIso(row.updatedAt),
  };
}

export function createFinance(context: SessionContext, request: Request, body: unknown): FinanceTransactionDetail {
  const payload = validate(body, isFinanceTransactionMutationPayload, "Finans");
  return runIdempotentMutation(request, context, payload, () => {
    const row = getDomainService().createFinanceTransaction(domainActorFromSession(context), financeInput(payload));
    return getFinance(context, detailRequest(request), row.id);
  });
}

export function updateFinance(context: SessionContext, request: Request, id: string, body: unknown): FinanceTransactionDetail {
  const payload = validate(body, isFinanceTransactionMutationPayload, "Finans");
  const actor = domainActorFromSession(context); const service = getDomainService();
  requireCurrentVersion(payload.version, service.getFinanceTransaction(actor, id).updatedAt);
  service.updateFinanceTransaction(actor, id, financeInput(payload));
  return getFinance(context, detailRequest(request), id);
}

export function deleteFinance(context: SessionContext, request: Request, id: string): DeleteResult {
  const actor = domainActorFromSession(context); const service = getDomainService();
  requireIfMatch(request, service.getFinanceTransaction(actor, id).updatedAt); service.deleteFinanceTransaction(actor, id);
  return { deleted: true, id };
}

export function listJournal(context: SessionContext, request: Request): JournalRangeResponse {
  const params = strictSearchParams(request, ["from", "to", "locale"]);
  const from = requiredDate(params.get("from"), "from"); const to = requiredDate(params.get("to"), "to");
  if (from > to) invalidQuery("range");
  const { actor, locale, service } = ownerContext(context, request);
  const rows = service.listJournalEntries(actor).filter((row) => row.entryDate >= from && row.entryDate <= to);
  const translations = service.contentTranslations.listBatch("journal_entry", rows.map((row) => row.id));
  return { from, items: rows.map((row) => presentJournal(row, localizedEntity(service, "journal_entry", row, translations.get(row.id), locale).moodLabel ?? "")).sort((a, b) => a.date.localeCompare(b.date)), to };
}

export function getJournal(context: SessionContext, request: Request, id: string): JournalEntryDetail {
  const { actor, locale, service } = ownerContext(context, request); const row = service.getJournalEntry(actor, id);
  const localized = localizedEntity(service, "journal_entry", row, undefined, locale);
  return { ...presentJournal(row, localized.moodLabel ?? ""), translations: journalTranslations(service.contentTranslations.listEntityTranslations("journal_entry", id), row.moodLabel ?? "", row.note ?? "", locale.defaultLocale), version: toIso(row.updatedAt) };
}

export function upsertJournal(context: SessionContext, request: Request, date: string, body: unknown): JournalEntryDetail {
  requiredDate(date, "date"); const payload = validate(body, isJournalEntryMutationPayload, "Günlük");
  return runIdempotentMutation(request, context, payload, () => {
    const actor = domainActorFromSession(context); const service = getDomainService();
    const existing = service.listJournalEntries(actor).find((row) => row.entryDate === date);
    if (existing) requireCurrentVersion(payload.version, existing.updatedAt);
    const row = service.saveJournalEntry(actor, journalInput(date, payload));
    if (!row) throw new DomainError("INVARIANT_VIOLATION", "Günlük kaydı saklanamadı.");
    return getJournal(context, detailRequest(request), row.id);
  });
}

export function updateJournal(context: SessionContext, request: Request, id: string, body: unknown): JournalEntryDetail {
  const payload = validate(body, isJournalEntryMutationPayload, "Günlük"); const actor = domainActorFromSession(context); const service = getDomainService();
  const current = service.getJournalEntry(actor, id); requireCurrentVersion(payload.version, current.updatedAt);
  service.updateJournalEntry(actor, id, journalInput(current.entryDate, payload)); return getJournal(context, detailRequest(request), id);
}

export function deleteJournal(context: SessionContext, request: Request, id: string): DeleteResult {
  const actor = domainActorFromSession(context); const service = getDomainService(); requireIfMatch(request, service.getJournalEntry(actor, id).updatedAt); service.deleteJournalEntry(actor, id); return { deleted: true, id };
}

function financeInput(payload: FinanceTransactionMutationPayload) { const { date, kind, version: _version, ...rest } = payload; return { ...rest, transactionDate: date, type: kind }; }
function journalInput(date: string, payload: JournalEntryMutationPayload) { const { energy, mood, satisfaction, sourceLocale: _sourceLocale, version: _version, ...rest } = payload; return { ...rest, energyScore: energy, entryDate: date, moodScore: mood, workSatisfactionScore: satisfaction }; }
function presentFinance(row: ReturnType<ReturnType<typeof getDomainService>["listFinanceTransactions"]>[number], category: string, description: string | null, clientName: string | null, projectName: string | null): FinanceTransactionListItem { return { amount: { amountMinor: row.amountMinor, currency: row.currency }, category, clientId: row.clientId, clientName, date: row.transactionDate, description, id: row.id, kind: row.type, paymentStatus: row.paymentStatus, projectId: row.projectId, projectName, updatedAt: toIso(row.updatedAt) }; }
function presentJournal(row: ReturnType<ReturnType<typeof getDomainService>["listJournalEntries"]>[number], moodLabel: string): JournalEntryListItem { return { date: row.entryDate, energy: row.energyScore as JournalEntryListItem["energy"], id: row.id, mood: row.moodScore as JournalEntryListItem["mood"], moodLabel, satisfaction: row.workSatisfactionScore as JournalEntryListItem["satisfaction"], updatedAt: toIso(row.updatedAt) }; }
function financeTranslations(rows: Array<{ locale: string; field: string; value: string }>, category: string, description: string | null, locale: string): LocalizedFinancePayload { const out: LocalizedFinancePayload = { [locale]: { category, description } }; for (const row of rows) { const item = out[row.locale] ?? { category }; if (row.field === "category") item.category = row.value; if (row.field === "description") item.description = row.value; out[row.locale] = item; } return out; }
function journalTranslations(rows: Array<{ locale: string; field: string; value: string }>, moodLabel: string, note: string, locale: string): LocalizedJournalPayload { const out: LocalizedJournalPayload = { [locale]: { moodLabel, note } }; for (const row of rows) { const item = out[row.locale] ?? { moodLabel, note }; if (row.field === "moodLabel") item.moodLabel = row.value; if (row.field === "note") item.note = row.value; out[row.locale] = item; } return out; }
function sum(rows: Array<{ amountMinor: number }>) { return rows.reduce((total, row) => total + row.amountMinor, 0); }
function requiredMonth(value: string | null): string { if (!value || !/^\d{4}-(0[1-9]|1[0-2])$/.test(value)) invalidQuery("month"); return value; }
function requiredDate(value: string | null, field: string): string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) invalidQuery(field);
  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) invalidQuery(field);
  return value;
}
function invalidQuery(field: string): never { throw new DomainError("VALIDATION_ERROR", `Geçersiz ${field}.`, { field, messageKey: "validation.invalidQuery" }); }
function detailRequest(request: Request): Request { return new Request(new URL(request.url), { headers: request.headers, method: "GET" }); }
function validate<T>(value: unknown, guard: (candidate: unknown) => candidate is T, resource: string): T { if (!guard(value)) throw new DomainError("VALIDATION_ERROR", `${resource} payload geçersiz.`); return value; }
