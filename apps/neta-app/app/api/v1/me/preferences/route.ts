import { cookies } from "next/headers";
import { z } from "zod";
import { COLOR_MODE_COOKIE, COLOR_MODE_COOKIE_MAX_AGE } from "@/lib/color-mode";
import { requireApiV1Session } from "@/server/api/v1/auth";
import { parseApiV1Json } from "@/server/api/v1/input";
import { getApiMeProfile } from "@/server/api/v1/me-profile";
import {
  apiV1Error,
  apiV1MethodNotAllowed,
  apiV1Success,
} from "@/server/api/v1/responses";
import { domainActorFromSession } from "@/server/auth/domain-actor";
import { getServerConfig } from "@/server/config";
import { updateUserPreferences } from "@/server/settings/preferences";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const localeSchema = z.string().trim().regex(/^[a-z]{2}(?:-[A-Z]{2}[0-9]?)?$/);
const inputSchema = z.object({
  colorMode: z.enum(["light", "dark", "system"]).optional(),
  locale: localeSchema.optional(),
  language: localeSchema.optional(),
  timezone: z.string().trim().min(1).max(64).refine(isValidIanaTimeZone).optional(),
}).strict().superRefine((value, context) => {
  if (!Object.values(value).some((item) => item !== undefined)) {
    context.addIssue({ code: "custom", message: "At least one preference is required." });
  }
  if (value.locale && value.language && value.locale !== value.language) {
    context.addIssue({
      code: "custom",
      path: ["locale"],
      message: "locale and the legacy language alias must match.",
    });
  }
});

export async function PATCH(request: Request) {
  try {
    const context = await requireApiV1Session(new Headers(request.headers), ["settings:write"]);
    const input = await parseApiV1Json(request, inputSchema);
    updateUserPreferences(domainActorFromSession(context), {
      colorMode: input.colorMode,
      language: input.locale ?? input.language,
      timezone: input.timezone,
    });

    if (input.colorMode) {
      const config = getServerConfig();
      (await cookies()).set(COLOR_MODE_COOKIE, input.colorMode, {
        httpOnly: false,
        maxAge: COLOR_MODE_COOKIE_MAX_AGE,
        path: "/",
        sameSite: "lax",
        secure: config.secureCookies,
      });
    }

    return apiV1Success(getApiMeProfile(context, request));
  } catch (error) {
    return apiV1Error(error);
  }
}

export function GET() { return apiV1MethodNotAllowed(["PATCH"]); }
export function POST() { return apiV1MethodNotAllowed(["PATCH"]); }
export function PUT() { return apiV1MethodNotAllowed(["PATCH"]); }
export function DELETE() { return apiV1MethodNotAllowed(["PATCH"]); }

function isValidIanaTimeZone(value: string): boolean {
  try {
    new Intl.DateTimeFormat("en", { timeZone: value }).format();
    return true;
  } catch {
    return false;
  }
}
