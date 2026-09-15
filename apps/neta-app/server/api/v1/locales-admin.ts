import "server-only";

import { eq } from "drizzle-orm";
import type { LocaleDefinition, TranslationCatalog } from "@neta/api-contracts";
import type { SessionContext } from "@/server/auth/session";
import { domainActorFromSession } from "@/server/auth/domain-actor";
import { getSqliteConnection } from "@/server/db/client";
import { instanceLocales } from "@/server/db/schema";
import { DomainError } from "@/server/domain/errors";
import { I18N_NAMESPACES } from "@/lib/i18n";
import { getCatalogVersion, getResolvedCatalog } from "@/server/i18n/catalog";
import { I18nService, type CreateLocaleInput, type UpdateLocaleInput } from "@/server/i18n/service";
import { runIdempotentMutation } from "./mutations";

export function listLocales(context: SessionContext): LocaleDefinition[] {
  const service = serviceFor(); const actor = domainActorFromSession(context); const settings = service.getSettings(actor);
  const completion = new Map(service.getCompletion(actor).map((item) => [item.locale, item.percent]));
  return service.listLocales(actor).filter((item) => item.status !== "test").map((item) => presentLocale(item, settings.defaultLocale, completion.get(item.code) ?? 0));
}

export function createLocale(context: SessionContext, request: Request, body: unknown): LocaleDefinition {
  const value = localeBody(body, true);
  return runIdempotentMutation(request, context, value, () => {
    const service = serviceFor(); const actor = domainActorFromSession(context);
    const locale = service.createLocale(actor, value); return presentLocale(locale, service.getSettings(actor).defaultLocale, 0);
  });
}

export function updateLocale(context: SessionContext, code: string, body: unknown): LocaleDefinition {
  const value = localeBody(body, false); const service = serviceFor(); const actor = domainActorFromSession(context);
  const locale = service.updateLocale(actor, code, value); const completion = service.getCompletion(actor).find((item) => item.locale === code)?.percent ?? 0;
  return presentLocale(locale, service.getSettings(actor).defaultLocale, completion);
}

export function getTranslations(context: SessionContext, code: string): TranslationCatalog {
  serviceFor().listLocales(domainActorFromSession(context)).find((item) => item.code === code) ?? notFound();
  const catalog = getResolvedCatalog(code, I18N_NAMESPACES, getCatalogVersion());
  return { locale: code, messages: catalog.messages, version: catalog.catalogVersion };
}

export function updateTranslations(context: SessionContext, code: string, body: unknown): TranslationCatalog {
  const value = catalogBody(body, code); const service = serviceFor(); const actor = domainActorFromSession(context);
  if (value.version !== getCatalogVersion()) throw new DomainError("CONFLICT", "Çeviri kataloğu değişti; yeniden yükleyin.", { currentVersion: getCatalogVersion() });
  for (const [key, text] of Object.entries(value.messages)) {
    const separator = key.indexOf("."); if (separator <= 0 || !text.trim()) continue;
    service.upsertUiTranslation(actor, { key: key.slice(separator + 1), locale: code, namespace: key.slice(0, separator), value: text });
  }
  return getTranslations(context, code);
}

export function importTranslations(context: SessionContext, request: Request, body: unknown): TranslationCatalog {
  const value = catalogBody(body);
  return runIdempotentMutation(request, context, value, () => {
    const service = serviceFor(); const actor = domainActorFromSession(context);
    if (!service.listLocales(actor).some((item) => item.code === value.locale)) service.createLocale(actor, { code: value.locale, name: value.locale, nativeName: value.locale, status: "draft" });
    for (const [key, text] of Object.entries(value.messages)) { const separator = key.indexOf("."); if (separator > 0 && text.trim()) service.upsertUiTranslation(actor, { key: key.slice(separator + 1), locale: value.locale, namespace: key.slice(0, separator), value: text }); }
    return getTranslations(context, value.locale);
  });
}

function presentLocale(value: ReturnType<I18nService["listLocales"]>[number], defaultLocale: string, completion: number): LocaleDefinition {
  const updatedAt = getSqliteConnection().db.select({ updatedAt: instanceLocales.updatedAt }).from(instanceLocales).where(eq(instanceLocales.code, value.code)).get()?.updatedAt ?? new Date(0);
  return { code: value.code, completion, fallbackLocale: value.fallbackLocale, isDefault: value.code === defaultLocale, textDirection: value.textDirection, name: value.name, status: value.status === "test" ? "draft" : value.status, updatedAt: updatedAt.toISOString() };
}
function serviceFor() { return new I18nService(getSqliteConnection().db); }
function localeBody(body: unknown, includeCode: true): CreateLocaleInput;
function localeBody(body: unknown, includeCode: false): UpdateLocaleInput;
function localeBody(body: unknown, includeCode: boolean): CreateLocaleInput | UpdateLocaleInput { const value = object(body); if ((includeCode && typeof value.code !== "string") || typeof value.name !== "string" || (value.textDirection !== "ltr" && value.textDirection !== "rtl") || !["draft", "active", "archived"].includes(String(value.status))) invalid(); return { ...(includeCode ? { code: value.code as string } : {}), fallbackLocale: typeof value.fallbackLocale === "string" ? value.fallbackLocale : null, name: value.name, nativeName: value.name, status: value.status as "draft" | "active" | "archived", textDirection: value.textDirection }; }
function catalogBody(body: unknown, code?: string): TranslationCatalog { const value = object(body); const locale = code ?? value.locale; if (typeof locale !== "string" || typeof value.version !== "number" || !value.messages || typeof value.messages !== "object" || Array.isArray(value.messages) || !Object.values(value.messages).every((item) => typeof item === "string")) invalid(); return { locale, messages: value.messages as Record<string, string>, version: value.version }; }
function object(value: unknown): Record<string, unknown> { if (!value || typeof value !== "object" || Array.isArray(value)) invalid(); return value as Record<string, unknown>; }
function invalid(): never { throw new DomainError("VALIDATION_ERROR", "Dil payload geçersiz."); }
function notFound(): never { throw new DomainError("NOT_FOUND", "Dil bulunamadı."); }
