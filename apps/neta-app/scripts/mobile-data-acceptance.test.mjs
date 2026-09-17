import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { registerHooks } from "node:module";
import { pathToFileURL } from "node:url";
import { test } from "node:test";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { assertMigrationState, readMigrationManifest } from "../server/db/migration-state.mjs";

const app = process.cwd();
const migrations = path.join(app, "server/db/migrations");
const manifest = readMigrationManifest(migrations);
const root = fs.mkdtempSync(path.join(os.tmpdir(), "neta-mobile-data-"));
process.env.DATA_DIR = path.join(root, "health");
process.env.DATABASE_PATH = "";
process.env.NODE_ENV = "test";
registerHooks({ resolve(specifier, context, next) {
  if (specifier === "server-only") return { url: "data:text/javascript,export {};", shortCircuit: true };
  if (specifier === "@/server/db/client") return { url: "data:text/javascript,export function getSqliteConnection() { return { sqlite: globalThis.__netaDataTestSqlite }; }", shortCircuit: true };
  if (specifier === "@/server/config") return next(pathToFileURL(path.join(app, "server/config.ts")).href, context);
  if (specifier === "@/server/db/health") return next(pathToFileURL(path.join(app, "server/db/health.ts")).href, context);
  return next(specifier, context);
} });
const { GET: ready } = await import("../app/api/health/ready/route.ts");
process.once("exit", () => {
  if (path.dirname(root) !== os.tmpdir() || !path.basename(root).startsWith("neta-mobile-data-")) throw new Error("Unsafe test cleanup.");
  fs.rmSync(root, { recursive: true, force: true });
});
function run(script, data, args = []) {
  return execFileSync(process.execPath, ["scripts/" + script + ".mjs", ...args], {
    cwd: app, env: { ...process.env, DATA_DIR: data, DATABASE_PATH: "", BACKUP_RETENTION_COUNT: "" }, stdio: "pipe",
  });
}
function rejected(script, data, args, pattern) {
  assert.throws(() => run(script, data, args), error => {
    assert.equal(error.status, 1);
    assert.match(error.stderr.toString(), pattern);
    return true;
  });
}
function create(name, previous = false) {
  const data = path.join(root, name);
  fs.mkdirSync(data);
  const db = new Database(path.join(data, "neta.db"));
  try {
    db.pragma("foreign_keys = ON");
    let directory = migrations;
    if (previous) {
      directory = path.join(data, "migrations");
      fs.cpSync(migrations, directory, { recursive: true });
      const journalPath = path.join(directory, "meta/_journal.json");
      const journal = JSON.parse(fs.readFileSync(journalPath, "utf8"));
      journal.entries.splice(typeof previous === "number" ? previous : journal.entries.length - 1);
      fs.writeFileSync(journalPath, JSON.stringify(journal));
    }
    migrate(drizzle({ client: db }), { migrationsFolder: directory });
    db.prepare("INSERT INTO user (id, name, email) VALUES ('owner', 'Owner', 'owner@example.test')").run();
    db.prepare("INSERT INTO runtime_checks (key, value, created_at, updated_at) VALUES ('instance_id', 'fixture-instance', 1, 1)").run();
    fs.mkdirSync(path.join(data, "uploads"));
    fs.writeFileSync(path.join(data, "uploads/proof.txt"), "fixture-upload");
    return { data, db };
  } catch (error) { db.close(); throw error; }
}
function backup(data) {
  run("backup", data);
  return path.join(data, "backups", fs.readdirSync(path.join(data, "backups"))[0]);
}
function rewriteManifest(directory) {
  const file = path.join(directory, "manifest.json");
  const value = JSON.parse(fs.readFileSync(file, "utf8"));
  for (const entry of value.files) {
    const bytes = fs.readFileSync(path.join(directory, entry.path));
    entry.bytes = bytes.length;
    entry.sha256 = crypto.createHash("sha256").update(bytes).digest("hex");
  }
  fs.writeFileSync(file, JSON.stringify(value));
}
function device(db) {
  db.prepare("INSERT INTO device_security_state (key, token_epoch) VALUES ('default', 'old-epoch')").run();
  db.prepare("INSERT INTO device_sessions (id, family_id, owner_user_id, install_id_digest, device_name, platform, app_version, scopes, token_epoch, access_digest, access_expires_at, refresh_digest, refresh_expires_at) VALUES ('device', 'family', 'owner', 'install', 'Fixture', 'android', '0.1.0', '[]', 'old-epoch', 'access', 9999999999999, 'refresh', 9999999999999)").run();
}

test("empty startup migration becomes ready; repeated startup preserves data and history", () => {
  const data = path.join(root, "empty");
  run("migrate", data);
  const db = new Database(path.join(data, "neta.db"));
  try {
    db.prepare("INSERT INTO runtime_checks (key, value, created_at, updated_at) VALUES ('probe', 'preserved', 1, 1)").run();
    run("migrate", data);
    assertMigrationState(db, manifest);
    assert.equal(db.prepare("SELECT count(*) n FROM __drizzle_migrations").get().n, manifest.length);
    assert.equal(db.prepare("SELECT value FROM runtime_checks WHERE key = 'probe'").get().value, "preserved");
    globalThis.__netaDataTestSqlite = db;
    assert.equal(ready().status, 200);
  } finally { db.close(); }
});

test("previous 0016 DB is not ready; 0017 preserves owner, instance, active device and files while revoking old challenges", () => {
  const { db, data } = create("previous", true);
  try {
    device(db);
    db.prepare("INSERT INTO pairing_challenges (id, owner_user_id, secret_digest, manual_code_digest, expires_at) VALUES ('challenge', 'owner', 'secret', 'manual', 9999999999999)").run();
    globalThis.__netaDataTestSqlite = db;
    assert.equal(ready().status, 503);
    assertMigrationState(db, manifest, { allowPending: true });
    run("migrate", data);
    assert.equal(ready().status, 200);
    assert.equal(db.prepare("SELECT name FROM user WHERE id = 'owner'").get().name, "Owner");
    assert.equal(db.prepare("SELECT value FROM runtime_checks WHERE key = 'instance_id'").get().value, "fixture-instance");
    assert.equal(db.prepare("SELECT status FROM device_sessions").get().status, "active");
    assert.equal(db.prepare("SELECT status FROM pairing_challenges").get().status, "revoked");
    assert.equal(fs.readFileSync(path.join(data, "uploads/proof.txt"), "utf8"), "fixture-upload");
  } finally { db.close(); }
});

test("missing, changed, duplicate and future ledger entries fail readiness and startup without rewriting DB", async () => {
  for (const [name, sql] of [
    ["missing", "DELETE FROM __drizzle_migrations WHERE created_at = (SELECT min(created_at) FROM __drizzle_migrations)"],
    ["changed", "UPDATE __drizzle_migrations SET hash = 'wrong' WHERE created_at = (SELECT min(created_at) FROM __drizzle_migrations)"],
    ["duplicate", "INSERT INTO __drizzle_migrations (hash, created_at) SELECT hash, created_at FROM __drizzle_migrations LIMIT 1"],
    ["future", "INSERT INTO __drizzle_migrations (hash, created_at) VALUES ('future', 9999999999999)"],
  ]) {
    const { db, data } = create(name);
    try {
      db.exec(sql);
      globalThis.__netaDataTestSqlite = db;
      const response = ready();
      assert.equal(response.status, 503);
      assert.deepEqual((await response.json()).checks, { dataDirWritable: true, databaseReachable: true, migrationsApplied: false });
      const before = db.prepare("SELECT * FROM __drizzle_migrations").all();
      rejected("migrate", data, [], /migration history is incompatible/);
      assert.deepEqual(db.prepare("SELECT * FROM __drizzle_migrations").all(), before);
      assert.equal(db.prepare("SELECT count(*) n FROM user").get().n, 1);
    } finally { db.close(); }
  }
});

test("runtime_checks alone cannot prove migration completion; LF/CRLF SQL hashes remain compatible", () => {
  const db = new Database(":memory:");
  try {
    db.exec("CREATE TABLE runtime_checks (key text)");
    assert.throws(() => assertMigrationState(db, manifest, { allowPending: true }), /no verifiable/);
    db.exec("DROP TABLE runtime_checks");
    migrate(drizzle({ client: db }), { migrationsFolder: migrations });
    for (const entry of manifest) db.prepare("UPDATE __drizzle_migrations SET hash = ? WHERE created_at = ?").run(entry.hashes.at(-1), entry.timestamp);
    assertMigrationState(db, manifest);
  } finally { db.close(); }
});

test("current backup restore preserves uploads/identity, rotates epoch, revokes devices and removes replay material", () => {
  const { db, data } = create("restore-current");
  device(db);
  db.prepare("INSERT INTO device_refresh_replays VALUES ('device', 'consumed', 'request', 'successor', 'ciphertext', 9999999999999)").run();
  db.close();
  const directory = backup(data);
  const target = path.join(root, "restored");
  run("restore", target, ["--from", directory, "--target", target]);
  const restored = new Database(path.join(target, "neta.db"), { readonly: true });
  try {
    assertMigrationState(restored, manifest);
    assert.notEqual(restored.prepare("SELECT token_epoch FROM device_security_state").get().token_epoch, "old-epoch");
    assert.equal(restored.prepare("SELECT status FROM device_sessions").get().status, "revoked");
    assert.equal(restored.prepare("SELECT count(*) n FROM device_refresh_replays").get().n, 0);
    assert.equal(restored.prepare("SELECT value FROM runtime_checks WHERE key = 'instance_id'").get().value, "fixture-instance");
    assert.equal(fs.readFileSync(path.join(target, "uploads/proof.txt"), "utf8"), "fixture-upload");
  } finally { restored.close(); }
});

test("previous-schema backup can restore separately and upgrade to current release", () => {
  const { db, data } = create("restore-previous", true);
  db.close();
  const directory = backup(data);
  const target = path.join(root, "restored-previous");
  run("restore", target, ["--from", directory, "--target", target]);
  run("migrate", target);
  const restored = new Database(path.join(target, "neta.db"), { readonly: true });
  try { assertMigrationState(restored, manifest); } finally { restored.close(); }
});

test("checksum, future schema and relationally corrupt backups are rejected before overwriting target", () => {
  for (const name of ["checksum", "future-schema", "foreign-key", "untracked-file"]) {
    const { db, data } = create("backup-" + name);
    db.close();
    const directory = backup(data);
    if (name === "checksum") fs.appendFileSync(path.join(directory, "uploads/proof.txt"), "tampered");
    else if (name === "untracked-file") fs.writeFileSync(path.join(directory, "extra.txt"), "untracked");
    else {
      const corrupt = new Database(path.join(directory, "neta.db"));
      if (name === "future-schema") corrupt.exec("INSERT INTO __drizzle_migrations (hash, created_at) VALUES ('future', 9999999999999)");
      else { corrupt.pragma("foreign_keys = OFF"); device(corrupt); corrupt.exec("DELETE FROM user"); }
      corrupt.close();
      // A matching checksum is insufficient: schema/integrity must also validate.
      rewriteManifest(directory);
    }
    const target = path.join(root, "target-" + name);
    fs.mkdirSync(path.join(target, "uploads"), { recursive: true });
    fs.writeFileSync(path.join(target, "neta.db"), "original-target");
    fs.writeFileSync(path.join(target, "uploads/original.txt"), "original-upload");
    rejected("restore", target, ["--from", directory, "--target", target, "--force"], /Backup file metadata mismatch|Backup checksum mismatch|migration history is incompatible|integrity validation failed|missing from the checksum manifest/);
    assert.equal(fs.readFileSync(path.join(target, "neta.db"), "utf8"), "original-target");
    assert.equal(fs.readFileSync(path.join(target, "uploads/original.txt"), "utf8"), "original-upload");
    assert.equal(fs.readdirSync(target).some(name => name.includes("restore-stage") || name.includes("restore-rollback")), false);
  }
});


test("restore rejects an empty database and target WAL sidecars before replacement", () => {
  const data = path.join(root, "blank-backup");
  fs.mkdirSync(data);
  new Database(path.join(data, "neta.db")).close();
  const blank = backup(data);
  const target = path.join(root, "blank-target");
  rejected("restore", target, ["--from", blank, "--target", target], /no verifiable migration history/);
  assert.equal(fs.existsSync(path.join(target, "neta.db")), false);
  const current = create("wal-source");
  current.db.close();
  const directory = backup(current.data);
  const walTarget = path.join(root, "wal-target");
  fs.mkdirSync(walTarget);
  fs.writeFileSync(path.join(walTarget, "neta.db"), "original");
  fs.writeFileSync(path.join(walTarget, "neta.db-wal"), "original-wal");
  rejected("restore", walTarget, ["--from", directory, "--target", walTarget, "--force"], /Target database has WAL\/SHM files/);
  assert.equal(fs.readFileSync(path.join(walTarget, "neta.db"), "utf8"), "original");
  assert.equal(fs.readFileSync(path.join(walTarget, "neta.db-wal"), "utf8"), "original-wal");
});

test("invalid journal ordering and missing SQL files fail closed", () => {
  const directory = path.join(root, "invalid-manifest");
  fs.cpSync(migrations, directory, { recursive: true });
  const file = path.join(directory, "meta/_journal.json");
  const journal = JSON.parse(fs.readFileSync(file, "utf8"));
  const original = JSON.stringify(journal);
  journal.entries[1].when = journal.entries[0].when;
  fs.writeFileSync(file, JSON.stringify(journal));
  assert.throws(() => readMigrationManifest(directory), /Invalid migration journal entry/);
  fs.writeFileSync(file, original);
  fs.unlinkSync(path.join(directory, journal.entries[0].tag + ".sql"));
  assert.throws(() => readMigrationManifest(directory));
});


test("pre-pairing backup restores without pre-creating pending migration tables and then upgrades", () => {
  const { db, data } = create("pre-pairing", 15);
  db.close();
  const directory = backup(data);
  const target = path.join(root, "restored-pre-pairing");
  run("restore", target, ["--from", directory, "--target", target]);
  run("migrate", target);
  const restored = new Database(path.join(target, "neta.db"), { readonly: true });
  try {
    assertMigrationState(restored, manifest);
    assert.equal(restored.prepare("SELECT count(*) n FROM device_sessions").get().n, 0);
    assert.equal(restored.prepare("SELECT name FROM user").get().name, "Owner");
  } finally { restored.close(); }
});
