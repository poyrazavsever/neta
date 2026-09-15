import "server-only";

import { eq } from "drizzle-orm";
import { z } from "zod";
import type { ColorMode } from "@/lib/color-mode";
import { getSqliteConnection } from "@/server/db/client";
import { instanceLocales, userPreferences } from "@/server/db/schema";
import { assertEnabledActor, type DomainActor } from "@/server/domain/actor";
import { DomainError } from "@/server/domain/errors";

const colorModeInputSchema = z.object({
  colorMode: z.enum(["light", "dark", "system"]),
});
const languageInputSchema = z.object({
  language: z.string().trim().regex(/^[a-z]{2}(?:-[A-Z]{2}[0-9]?)?$/),
});
const preferencesInputSchema = z.object({
  colorMode: z.enum(["light", "dark", "system"]).optional(),
  language: z.string().trim().regex(/^[a-z]{2}(?:-[A-Z]{2}[0-9]?)?$/).optional(),
  timezone: z.string().trim().min(1).max(64).refine(isValidIanaTimeZone).optional(),
}).strict();

export type PublicUserPreferences = {
  colorMode: ColorMode;
  language: string;
  timezone: string;
};

export function getUserPreferences(actor: DomainActor): PublicUserPreferences {
  assertEnabledActor(actor);

  const row = getSqliteConnection().db
    .select({
      colorMode: userPreferences.colorMode,
      language: userPreferences.language,
      timezone: userPreferences.timezone,
    })
    .from(userPreferences)
    .where(eq(userPreferences.ownerUserId, actor.authUserId))
    .get();

  return {
    colorMode: (row?.colorMode as ColorMode | undefined) ?? "system",
    language: row?.language ?? "tr",
    timezone: row?.timezone ?? "Europe/Istanbul",
  };
}

export function updateColorModePreference(
  actor: DomainActor,
  input: unknown,
): PublicUserPreferences {
  assertEnabledActor(actor);

  const parsed = colorModeInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new DomainError("VALIDATION_ERROR", "Renk modu tercihi geçersiz.");
  }

  return updateUserPreferences(actor, parsed.data);
}

export function updateLanguagePreference(
  actor: DomainActor,
  input: unknown,
): PublicUserPreferences {
  assertEnabledActor(actor);

  const parsed = languageInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new DomainError("VALIDATION_ERROR", "Dil tercihi geçersiz.");
  }

  return updateUserPreferences(actor, parsed.data);
}

export function updateUserPreferences(
  actor: DomainActor,
  input: unknown,
): PublicUserPreferences {
  assertEnabledActor(actor);

  const parsed = preferencesInputSchema.safeParse(input);
  if (!parsed.success || Object.keys(parsed.data).length === 0) {
    throw new DomainError("VALIDATION_ERROR", "Kullanıcı tercihleri geçersiz.");
  }

  const { db } = getSqliteConnection();
  if (parsed.data.language) {
    const locale = db
      .select({
        code: instanceLocales.code,
        status: instanceLocales.status,
      })
      .from(instanceLocales)
      .where(eq(instanceLocales.code, parsed.data.language))
      .get();
    if (!locale || locale.status !== "active") {
      throw new DomainError("VALIDATION_ERROR", "Dil tercihi aktif bir dil olmalıdır.");
    }
  }

  const current = getUserPreferences(actor);
  const next = {
    colorMode: parsed.data.colorMode ?? current.colorMode,
    language: parsed.data.language ?? current.language,
    timezone: parsed.data.timezone ?? current.timezone,
  };
  db.insert(userPreferences)
    .values({
      ownerUserId: actor.authUserId,
      ...next,
    })
    .onConflictDoUpdate({
      target: userPreferences.ownerUserId,
      set: {
        ...next,
        updatedAt: new Date().toISOString(),
      },
    })
    .run();

  return next;
}

function isValidIanaTimeZone(value: string): boolean {
  try {
    new Intl.DateTimeFormat("en", { timeZone: value }).format();
    return true;
  } catch {
    return false;
  }
}
