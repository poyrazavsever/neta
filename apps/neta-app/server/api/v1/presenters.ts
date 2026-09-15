import {
  isNetaMeProfile,
  isNetaRuntimeCatalog,
  type NetaMeProfile,
  type NetaRuntimeCatalog,
} from "@neta/api-contracts";

type MePresenterInput = {
  user: NetaMeProfile["user"];
  session: NetaMeProfile["session"];
  preferences: {
    colorMode: NetaMeProfile["preferences"]["colorMode"];
    language: string;
    timezone: string;
  };
  localization: NetaMeProfile["localization"];
};

export function presentMeProfile(input: MePresenterInput): NetaMeProfile {
  const output: NetaMeProfile = {
    user: input.user,
    session: input.session,
    preferences: {
      colorMode: input.preferences.colorMode,
      locale: input.preferences.language,
      timezone: input.preferences.timezone,
    },
    localization: input.localization,
  };

  if (!isNetaMeProfile(output)) {
    throw new Error("Me presenter produced an invalid API contract.");
  }
  return output;
}

export function presentRuntimeCatalog(input: NetaRuntimeCatalog): NetaRuntimeCatalog {
  if (!isNetaRuntimeCatalog(input)) {
    throw new Error("Runtime catalog presenter produced an invalid API contract.");
  }
  return input;
}
