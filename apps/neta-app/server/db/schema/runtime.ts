import { sql } from "drizzle-orm";
import { check, index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { user } from "./auth";

export const runtimeChecks = sqliteTable("runtime_checks", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});

export const runtimeEvents = sqliteTable("runtime_events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  type: text("type").notNull(),
  message: text("message").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});

/** Successful retryable API mutations, committed with their domain side effect. */
export const apiIdempotencyRecords = sqliteTable(
  "api_idempotency_records",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    actorUserId: text("actor_user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    method: text("method").notNull(),
    route: text("route").notNull(),
    idempotencyKey: text("idempotency_key").notNull(),
    payloadHash: text("payload_hash").notNull(),
    responseJson: text("response_json").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
  (table) => [
    uniqueIndex("api_idempotency_actor_route_key_unique").on(
      table.actorUserId,
      table.method,
      table.route,
      table.idempotencyKey,
    ),
    index("api_idempotency_created_at_idx").on(table.createdAt),
    check("api_idempotency_method_check", sql`${table.method} in ('POST', 'PUT')`),
    check("api_idempotency_payload_hash_check", sql`length(${table.payloadHash}) = 64`),
  ],
);
