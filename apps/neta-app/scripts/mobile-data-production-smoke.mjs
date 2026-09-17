import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import net from "node:net";
import { execFileSync, spawn } from "node:child_process";
import Database from "better-sqlite3";

const app = process.cwd();
const stamp = Date.now();
const dist = ".next-mob9-data-build-" + stamp;
const data = path.join(app, ".data/mob9-data-build-" + stamp);
const snapshots = ["tsconfig.json", "next-env.d.ts"].map(file => [file, fs.readFileSync(file)]);
const probe = net.createServer();
await new Promise(resolve => probe.listen(0, "127.0.0.1", resolve));
const port = probe.address().port;
await new Promise(resolve => probe.close(resolve));
const base = "http://127.0.0.1:" + port;
const env = { ...process.env, NODE_ENV: "production", NEXT_DIST_DIR: dist, NEXT_TELEMETRY_DISABLED: "1",
  DATA_DIR: data, DATABASE_PATH: path.join(data, "neta.db"), APP_URL: base, BETTER_AUTH_URL: base, NEXT_PUBLIC_SITE_URL: base,
  BETTER_AUTH_SECRET: "mob9-production-synthetic-secret-32-characters", TRUSTED_ORIGINS: base, PORT: String(port), HOSTNAME: "127.0.0.1" };
let child, db, logs = "";
try {
  // Prepare only this fixture before parallel Next workers open the database.
  execFileSync(process.execPath, ["scripts/migrate.mjs"], { cwd: app, env, stdio: "inherit" });
  execFileSync(process.execPath, ["node_modules/next/dist/bin/next", "build"], { cwd: app, env, stdio: "inherit" });
  execFileSync(process.execPath, ["scripts/prepare-standalone.mjs"], { cwd: app, env, stdio: "inherit" });
  execFileSync(process.execPath, ["scripts/migrate.mjs"], { cwd: app, env, stdio: "inherit" });
  const standalone = path.join(app, dist, "standalone/apps/neta-app");
  assert.equal(fs.existsSync(path.join(standalone, ".data")), false, "Runtime data must not be bundled");
  assert.equal(fs.readdirSync(standalone).some(file => /^\.env/.test(file)), false, "Local env files must not be bundled");
  const journalPath = path.join(standalone, "server/db/migrations/meta/_journal.json");
  const journal = JSON.parse(fs.readFileSync(journalPath, "utf8"));
  const sql = path.join(standalone, "server/db/migrations", journal.entries.at(-1).tag + ".sql");
  assert.ok(fs.existsSync(sql));
  child = spawn(process.execPath, [path.join(standalone, "server.js")], { cwd: standalone, env, stdio: ["ignore", "pipe", "pipe"] });
  for (const output of [child.stdout, child.stderr]) output.on("data", chunk => { logs = (logs + chunk).slice(-16_384); });
  const startupDeadline = Date.now() + 30_000;
  for (;;) {
    try { if ((await fetch(base + "/api/health/live", { redirect: "manual", signal: AbortSignal.timeout(1_000) })).ok) break; } catch {}
    if (Date.now() > startupDeadline || child.exitCode !== null || child.signalCode !== null) throw Error("Production runtime failed: " + logs);
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  const initial = await fetch(base + "/api/health/ready", { redirect: "manual", signal: AbortSignal.timeout(10_000) });
  assert.equal(initial.status, 200);
  assert.equal((await initial.json()).checks.migrationsApplied, true);
  assert.equal((await fetch(base + "/api/v1/health", { redirect: "manual", signal: AbortSignal.timeout(10_000) })).status, 200);
  db = new Database(path.join(data, "neta.db"));
  const row = db.prepare("SELECT * FROM __drizzle_migrations ORDER BY created_at DESC LIMIT 1").get();
  assert.equal(db.prepare("UPDATE __drizzle_migrations SET hash = 'invalid-fixture' WHERE created_at = ?").run(row.created_at).changes, 1);
  assert.equal((await fetch(base + "/api/health/ready", { redirect: "manual", signal: AbortSignal.timeout(10_000) })).status, 503);
  const failed = await fetch(base + "/api/v1/health", { redirect: "manual", signal: AbortSignal.timeout(10_000) });
  assert.equal(failed.status, 503);
  const body = await failed.text();
  assert.equal(body.includes(data), false);
  assert.equal(body.includes("invalid-fixture"), false);
  assert.equal(db.prepare("UPDATE __drizzle_migrations SET hash = ? WHERE created_at = ?").run(row.hash, row.created_at).changes, 1);
  fs.renameSync(sql, sql + ".fixture-missing");
  try { assert.equal((await fetch(base + "/api/health/ready", { redirect: "manual", signal: AbortSignal.timeout(10_000) })).status, 503); }
  finally { fs.renameSync(sql + ".fixture-missing", sql); }
  assert.equal((await fetch(base + "/api/health/ready", { redirect: "manual", signal: AbortSignal.timeout(10_000) })).status, 200);
  console.log("MOB-9 production standalone + real HTTP readiness checks passed.");
} catch (error) {
  console.error("Production data acceptance failed:", error);
  if (logs) console.error("Synthetic runtime output:", logs);
  throw error;
} finally {
  db?.close();
  if (child && child.exitCode === null && child.signalCode === null) {
    await new Promise(resolve => {
      const timeout = setTimeout(resolve, 5_000);
      child.once("close", () => { clearTimeout(timeout); resolve(); });
      child.kill("SIGTERM");
    });
    if (child.exitCode === null && child.signalCode === null && process.platform === "win32") {
      execFileSync("taskkill.exe", ["/PID", String(child.pid), "/T", "/F"], { stdio: "ignore" });
    }
  }
  for (const [file, bytes] of snapshots) fs.writeFileSync(file, bytes);
  const target = path.resolve(app, dist);
  if (path.dirname(target) !== app || !path.basename(target).startsWith(".next-mob9-data-build-")) throw Error("Unsafe build cleanup.");
  await removeFixture(target, app);
  if (path.dirname(data) !== path.join(app, ".data") || !path.basename(data).startsWith("mob9-data-build-")) throw Error("Unsafe data cleanup.");
  await removeFixture(data, path.join(app, ".data"));
}


async function removeFixture(target, parent) {
  if (path.dirname(target) !== parent || !/^(?:\.next-mob9-data-build-|mob9-data-build-)\d+$/.test(path.basename(target))) {
    throw Error("Unsafe fixture cleanup.");
  }
  try {
    await fs.promises.rm(target, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
  } catch (error) {
    if (process.platform !== "win32") throw error;
    // PowerShell -Force handles readonly files in the generated Windows copy.
    const command = "$taskArtifactTarget = [IO.Path]::GetFullPath($env:NETA_SMOKE_CLEANUP_TARGET); $taskArtifactParent = [IO.Path]::GetFullPath($env:NETA_SMOKE_CLEANUP_PARENT); if ((Split-Path -Parent $taskArtifactTarget) -ne $taskArtifactParent -or (Split-Path -Leaf $taskArtifactTarget) -notmatch '^(?:\\.next-mob9-data-build-|mob9-data-build-)\\d+$') { throw 'Unsafe fixture cleanup' }; if (Test-Path -LiteralPath $taskArtifactTarget) { Remove-Item -LiteralPath $taskArtifactTarget -Recurse -Force -ErrorAction Stop }";
    execFileSync("powershell.exe", ["-NoProfile", "-NonInteractive", "-Command", command], {
      env: { ...process.env, NETA_SMOKE_CLEANUP_TARGET: target, NETA_SMOKE_CLEANUP_PARENT: parent }, stdio: "pipe",
    });
  }
}
