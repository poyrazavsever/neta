import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

// Drizzle stores the SQL hash and journal timestamp, not the filename/version.
export function readMigrationManifest(directory) {
  const journal = JSON.parse(fs.readFileSync(path.join(directory, "meta/_journal.json"), "utf8"));
  if (journal.dialect !== "sqlite" || !Array.isArray(journal.entries) || !journal.entries.length) {
    throw new Error("Invalid migration journal.");
  }
  let previous = -1;
  return journal.entries.map((entry, index) => {
    if (entry.idx !== index || !Number.isSafeInteger(entry.when) || entry.when <= previous ||
        typeof entry.tag !== "string" || !/^\d{4}_[a-z0-9_-]+$/.test(entry.tag)) {
      throw new Error("Invalid migration journal entry.");
    }
    previous = entry.when;
    const sql = fs.readFileSync(path.join(directory, `${entry.tag}.sql`), "utf8");
    const lf = sql.replace(/\r\n/g, "\n");
    // Windows/Linux checkouts must remain backup-compatible. Only line endings
    // may differ; substantive SQL changes still invalidate the recorded hash.
    const hashes = [...new Set([sql, lf, lf.replace(/\n/g, "\r\n")])]
      .map((text) => crypto.createHash("sha256").update(text).digest("hex"));
    return { timestamp: entry.when, hashes };
  });
}

export function assertMigrationState(sqlite, manifest, { allowPending = false, allowEmpty = false } = {}) {
  const table = sqlite.prepare("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = '__drizzle_migrations'").get();
  const rows = table
    ? sqlite.prepare("SELECT hash, created_at FROM __drizzle_migrations ORDER BY created_at, id").all()
    : [];
  if (!rows.length) {
    if (!allowEmpty) throw new Error("Database has no verifiable migration history.");
    const existing = sqlite.prepare("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' AND name != '__drizzle_migrations' LIMIT 1").get();
    if (existing) throw new Error("Database has no verifiable migration history.");
  }
  if (rows.length > manifest.length) throw new Error("Database migration history is incompatible with this release.");
  for (const [index, row] of rows.entries()) {
    const expected = manifest[index];
    if (row.created_at !== expected.timestamp || !expected.hashes.includes(row.hash)) {
      throw new Error("Database migration history is incompatible with this release.");
    }
  }
  if (!allowPending && rows.length !== manifest.length) throw new Error("Database migrations are pending.");
}
