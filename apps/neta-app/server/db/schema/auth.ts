import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import type {
  AuthAuditEventType,
  PortalInvitationStatus,
  SetupStatus,
  UserRole,
} from "../../auth/types";

const nowMs = sql`(cast(unixepoch('subsecond') * 1000 as integer))`;

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" }).default(false).notNull(),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).default(nowMs).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .default(nowMs)
    .$onUpdate(() => new Date())
    .notNull(),
});

export const session = sqliteTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    token: text("token").notNull().unique(),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).default(nowMs).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .$onUpdate(() => new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_user_id_idx").on(table.userId)],
);

export const account = sqliteTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: integer("access_token_expires_at", { mode: "timestamp_ms" }),
    refreshTokenExpiresAt: integer("refresh_token_expires_at", { mode: "timestamp_ms" }),
    scope: text("scope"),
    password: text("password"),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).default(nowMs).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("account_user_id_idx").on(table.userId)],
);

export const verification = sqliteTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).default(nowMs).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(nowMs)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const appProfiles = sqliteTable(
  "app_profiles",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    authUserId: text("auth_user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    displayName: text("display_name").notNull(),
    role: text("role").$type<UserRole>().notNull(),
    clientId: text("client_id"),
    disabled: integer("disabled", { mode: "boolean" }).default(false).notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).default(nowMs).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(nowMs)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("app_profiles_auth_user_id_unique").on(table.authUserId),
    uniqueIndex("app_profiles_client_id_unique").on(table.clientId),
    index("app_profiles_role_idx").on(table.role),
  ],
);

export const appSetupState = sqliteTable("app_setup_state", {
  key: text("key").primaryKey(),
  status: text("status").$type<SetupStatus>().notNull(),
  lockedBy: text("locked_by"),
  lockedAt: integer("locked_at", { mode: "timestamp_ms" }),
  completedAt: integer("completed_at", { mode: "timestamp_ms" }),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .default(nowMs)
    .$onUpdate(() => new Date())
    .notNull(),
});

export const portalInvitations = sqliteTable(
  "portal_invitations",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    tokenHash: text("token_hash").notNull(),
    clientId: text("client_id").notNull(),
    email: text("email").notNull(),
    locale: text("locale").default("tr").notNull(),
    status: text("status").$type<PortalInvitationStatus>()
      .default("pending")
      .notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    acceptedAt: integer("accepted_at", { mode: "timestamp_ms" }),
    createdByUserId: text("created_by_user_id").references(() => user.id, { onDelete: "set null" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).default(nowMs).notNull(),
  },
  (table) => [
    uniqueIndex("portal_invitations_token_hash_unique").on(table.tokenHash),
    index("portal_invitations_client_id_idx").on(table.clientId),
    index("portal_invitations_email_idx").on(table.email),
    index("portal_invitations_locale_idx").on(table.locale),
  ],
);

export const authAuditEvents = sqliteTable(
  "auth_audit_events",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    type: text("type").$type<AuthAuditEventType>().notNull(),
    authUserId: text("auth_user_id").references(() => user.id, { onDelete: "set null" }),
    email: text("email"),
    metadata: text("metadata", { mode: "json" }).$type<Record<string, unknown> | null>(),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).default(nowMs).notNull(),
  },
  (table) => [
    index("auth_audit_events_type_idx").on(table.type),
    index("auth_audit_events_auth_user_id_idx").on(table.authUserId),
  ],
);

export const deviceSecurityState = sqliteTable("device_security_state", {
  key: text("key").primaryKey().default("default"),
  tokenEpoch: text("token_epoch").notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).default(nowMs).notNull(),
});

export const pairingChallenges = sqliteTable(
  "pairing_challenges",
  {
    id: text("id").primaryKey(),
    ownerUserId: text("owner_user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    secretDigest: text("secret_digest").notNull(),
    manualCodeDigest: text("manual_code_digest").notNull(),
    status: text("status").$type<"pending" | "consumed" | "locked" | "revoked">().default("pending").notNull(),
    attemptCount: integer("attempt_count").default(0).notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    consumedAt: integer("consumed_at", { mode: "timestamp_ms" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).default(nowMs).notNull(),
  },
  (table) => [
    uniqueIndex("pairing_challenges_secret_digest_unique").on(table.secretDigest),
    uniqueIndex("pairing_challenges_manual_code_digest_unique").on(table.manualCodeDigest),
    index("pairing_challenges_owner_status_idx").on(table.ownerUserId, table.status),
  ],
);

export const deviceSessions = sqliteTable(
  "device_sessions",
  {
    id: text("id").primaryKey(),
    familyId: text("family_id").notNull(),
    ownerUserId: text("owner_user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    installIdDigest: text("install_id_digest").notNull(),
    deviceName: text("device_name").notNull(),
    platform: text("platform").$type<"ios" | "android" | "unknown">().notNull(),
    appVersion: text("app_version").notNull(),
    osMajor: text("os_major"),
    scopes: text("scopes", { mode: "json" }).$type<string[]>().notNull(),
    tokenEpoch: text("token_epoch").notNull(),
    accessDigest: text("access_digest").notNull(),
    accessExpiresAt: integer("access_expires_at", { mode: "timestamp_ms" }).notNull(),
    refreshDigest: text("refresh_digest").notNull(),
    previousRefreshDigest: text("previous_refresh_digest"),
    refreshExpiresAt: integer("refresh_expires_at", { mode: "timestamp_ms" }).notNull(),
    status: text("status").$type<"active" | "revoked" | "compromised">().default("active").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).default(nowMs).notNull(),
    lastUsedAt: integer("last_used_at", { mode: "timestamp_ms" }).default(nowMs).notNull(),
    revokedAt: integer("revoked_at", { mode: "timestamp_ms" }),
  },
  (table) => [
    uniqueIndex("device_sessions_access_digest_unique").on(table.accessDigest),
    uniqueIndex("device_sessions_refresh_digest_unique").on(table.refreshDigest),
    index("device_sessions_owner_status_idx").on(table.ownerUserId, table.status),
    index("device_sessions_family_idx").on(table.familyId),
  ],
);
