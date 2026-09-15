import "server-only";

import { eq } from "drizzle-orm";
import type { NetaMeProfile } from "@neta/api-contracts";
import { negotiateLocale } from "@/server/api/v1/localization";
import { presentMeProfile } from "@/server/api/v1/presenters";
import type { SessionContext } from "@/server/auth/session";
import { domainActorFromSession } from "@/server/auth/domain-actor";
import { getServerConfig } from "@/server/config";
import { getSqliteConnection } from "@/server/db/client";
import { clients } from "@/server/db/schema";
import { getPublicLocalizationMetadata } from "@/server/i18n/runtime";
import { getUserPreferences } from "@/server/settings/preferences";

export function getApiMeProfile(context: SessionContext, request: Request): NetaMeProfile {
  const requestUrl = new URL(request.url);
  const preferences = getUserPreferences(domainActorFromSession(context));
  const portalLocale = context.profile.clientId
    ? getSqliteConnection().db
        .select({ portalLocale: clients.portalLocale })
        .from(clients)
        .where(eq(clients.id, context.profile.clientId))
        .get()?.portalLocale ?? null
    : null;
  const resolvedLocale = negotiateLocale({
    metadata: getPublicLocalizationMetadata(),
    requestedLocale: requestUrl.searchParams.get("locale"),
    acceptLanguage: request.headers.get("accept-language"),
    preferredLocale: preferences.language,
    portalLocale,
  });

  return presentMeProfile({
    user: {
      id: context.user.id,
      email: context.profile.email,
      name: context.profile.displayName,
      role: context.profile.role,
      clientId: context.profile.clientId,
      disabled: false,
      imageUrl: absoluteOptionalUrl(context.user.image),
    },
    session: {
      expiresAt: context.session.expiresAt.toISOString(),
    },
    preferences,
    localization: {
      userPreferenceLocale: preferences.language,
      clientDefaultLocale: portalLocale,
      resolvedLocale: resolvedLocale.locale,
      requestedLocale: resolvedLocale.requestedLocale,
      instanceDefaultLocale: resolvedLocale.defaultLocale,
      source: resolvedLocale.source,
      fallbackChain: resolvedLocale.fallbackChain,
    },
  });
}

function absoluteOptionalUrl(value: string | null | undefined): string | null {
  return value ? new URL(value, `${getServerConfig().appUrl}/`).toString() : null;
}
