import {
  NETA_API_BASE_PATH as SHARED_NETA_API_BASE_PATH,
  NETA_API_VERSION as SHARED_NETA_API_VERSION,
  NETA_CAPABILITIES as SHARED_NETA_CAPABILITIES,
  NETA_CAPABILITY_DETAILS as SHARED_NETA_CAPABILITY_DETAILS,
  NETA_DISCOVERY_VERSION as SHARED_NETA_DISCOVERY_VERSION,
  NETA_PROTOCOL as SHARED_NETA_PROTOCOL,
  isNetaDiscoveryDocument,
  isNetaInstanceMetadata,
  type NetaCapability as SharedNetaCapability,
  type NetaCapabilityAccess as SharedNetaCapabilityAccess,
  type NetaCapabilityStatus as SharedNetaCapabilityStatus,
  type NetaDiscoveryDocument as SharedNetaDiscoveryDocument,
  type NetaInstanceMetadata as SharedNetaInstanceMetadata,
  type NetaLocalizedResponse as SharedNetaLocalizedResponse,
  type NetaTranslationMutationShape as SharedNetaTranslationMutationShape,
} from "@neta/api-contracts";
import type { PublicBranding } from "../../branding/service";
import type { InstanceIdentity } from "../../instance/service";
import type { getPublicLocalizationMetadata } from "../../i18n/runtime";
import { buildLocalizationContract } from "./localization";

export const NETA_PROTOCOL = SHARED_NETA_PROTOCOL;
export const NETA_DISCOVERY_VERSION = SHARED_NETA_DISCOVERY_VERSION;
export const NETA_API_VERSION = SHARED_NETA_API_VERSION;
export const NETA_API_BASE_PATH = SHARED_NETA_API_BASE_PATH;

export type CapabilityStatus = SharedNetaCapabilityStatus;
export type CapabilityAccess = SharedNetaCapabilityAccess;

export type NetaCapability = SharedNetaCapability;

export type NetaLocalizedResponse<TResource> = SharedNetaLocalizedResponse<TResource>;

export type NetaTranslationMutationShape = SharedNetaTranslationMutationShape;

export const NETA_CAPABILITY_DETAILS = SHARED_NETA_CAPABILITY_DETAILS;

export const NETA_CAPABILITIES = SHARED_NETA_CAPABILITIES;

export type NetaDiscoveryDocument = SharedNetaDiscoveryDocument;

export type NetaInstanceMetadata = SharedNetaInstanceMetadata;

type ContractInput = {
  appUrl: string;
  serverVersion: string;
  minimumMobileClientVersion: string | null;
  identity: InstanceIdentity;
  branding: PublicBranding;
  localization: ReturnType<typeof getPublicLocalizationMetadata>;
};

export function buildDiscoveryDocument(
  input: ContractInput,
): NetaDiscoveryDocument {
  const apiBaseUrl = absoluteUrl(input.appUrl, NETA_API_BASE_PATH);
  const output: NetaDiscoveryDocument = {
    protocol: NETA_PROTOCOL,
    discoveryVersion: NETA_DISCOVERY_VERSION,
    instanceId: input.identity.instanceId,
    applicationName: input.branding.applicationName,
    workspaceName: input.branding.organizationName ?? input.branding.applicationName,
    api: {
      version: NETA_API_VERSION,
      baseUrl: apiBaseUrl,
      metaUrl: absoluteUrl(input.appUrl, `${NETA_API_BASE_PATH}/meta`),
      healthUrl: absoluteUrl(input.appUrl, `${NETA_API_BASE_PATH}/health`),
      catalogUrl: absoluteUrl(input.appUrl, `${NETA_API_BASE_PATH}/localization/catalog`),
    },
    security: {
      httpsRequired: true,
      insecureLoopbackAllowed: true,
    },
    localization: {
      defaultLocale: input.localization.defaultLocale,
      supportedLocales: input.localization.supportedLocales.map((locale) => ({
        code: locale.code,
        name: locale.name,
        nativeName: locale.nativeName,
        status: locale.status,
        textDirection: locale.textDirection,
      })),
      catalogVersion: input.localization.catalogVersion,
    },
    capabilities: NETA_CAPABILITIES,
    capabilityDetails: NETA_CAPABILITY_DETAILS,
  };
  if (!isNetaDiscoveryDocument(output)) {
    throw new Error("Discovery presenter produced an invalid API contract.");
  }
  return output;
}

export function buildInstanceMetadata(
  input: ContractInput,
): NetaInstanceMetadata {
  const output: NetaInstanceMetadata = {
    protocol: {
      name: NETA_PROTOCOL,
      discoveryVersion: NETA_DISCOVERY_VERSION,
      apiVersion: NETA_API_VERSION,
    },
    server: {
      version: input.serverVersion,
    },
    instance: {
      id: input.identity.instanceId,
      createdAt: input.identity.createdAt,
      applicationName: input.branding.applicationName,
      workspaceName: input.branding.organizationName ?? input.branding.applicationName,
      metaTitle: input.branding.applicationName,
      shortName: input.branding.shortName,
      organizationName: input.branding.organizationName,
    },
    branding: {
      primaryColor: input.branding.primaryColor,
      accentColor: input.branding.accentColor,
      defaultColorMode: input.branding.defaultColorMode,
      radiusScale: input.branding.radiusScale,
      lightLogoUrl: absoluteOptionalUrl(input.appUrl, input.branding.lightLogoUrl),
      darkLogoUrl: absoluteOptionalUrl(input.appUrl, input.branding.darkLogoUrl),
      iconUrl: absoluteOptionalUrl(input.appUrl, input.branding.iconUrl),
      faviconUrl: absoluteOptionalUrl(input.appUrl, input.branding.iconUrl),
    },
    localization: buildLocalizationContract(input.localization),
    contracts: {
      localizedResponse: {
        resource: "original database record",
        localized: "locale-resolved record",
        locale: "resolved locale code",
        fallbackChain: "ordered locale fallback chain",
      },
      ownerMutationTranslations: {
        field: "translations",
        shape: "Record<locale, Record<field, string | null>>",
        unsupportedLocaleCode: "UNSUPPORTED_LOCALE",
      },
      portalRevision: {
        sourceLocale: "locale code of the client-authored revision message",
        descriptionPolicy: "user-authored text is stored and returned without machine translation",
      },
      preferenceMutation: {
        endpoint: "PATCH /api/v1/me/preferences",
        canonicalFields: ["locale", "colorMode", "timezone"],
        legacyInputAlias: "language -> locale",
        roles: "freelancer and client users mutate only their own preferences",
      },
      catalogDownload: {
        endpoint: "GET /api/v1/localization/catalog?locale=tr&namespaces=common,portal",
        versionField: "version",
        legacyVersionField: "catalogVersion",
      },
    },
    client: {
      minimumSupportedVersion: input.minimumMobileClientVersion,
      platforms: ["ios", "android"],
    },
    authentication: {
      sessionMethod: "better-auth-cookie",
      devicePairing: "available",
    },
    capabilities: NETA_CAPABILITIES,
    capabilityDetails: NETA_CAPABILITY_DETAILS,
    links: {
      discovery: absoluteUrl(input.appUrl, "/.well-known/neta"),
      apiBase: absoluteUrl(input.appUrl, NETA_API_BASE_PATH),
      health: absoluteUrl(input.appUrl, `${NETA_API_BASE_PATH}/health`),
      me: absoluteUrl(input.appUrl, `${NETA_API_BASE_PATH}/me`),
      preferences: absoluteUrl(input.appUrl, `${NETA_API_BASE_PATH}/me/preferences`),
      catalog: absoluteUrl(input.appUrl, `${NETA_API_BASE_PATH}/localization/catalog`),
    },
  };
  if (!isNetaInstanceMetadata(output)) {
    throw new Error("Metadata presenter produced an invalid API contract.");
  }
  return output;
}

function absoluteOptionalUrl(baseUrl: string, value: string | null): string | null {
  return value ? absoluteUrl(baseUrl, value) : null;
}

function absoluteUrl(baseUrl: string, pathname: string): string {
  return new URL(pathname, `${baseUrl}/`).toString();
}
