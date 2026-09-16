import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import path from "node:path";
import Database from "better-sqlite3";
import { withRestoredSecurityRuntime } from "./lib/restored-security-runtime.mjs";

const fixtureArg = process.argv.indexOf("--fixture");
const distArg = process.argv.indexOf("--dist");
if (fixtureArg < 0 || !process.argv[fixtureArg + 1]) throw new Error("--fixture requires an isolated auth-smoke restored-security-fixture directory.");
const restoredDir = path.resolve(process.argv[fixtureArg + 1]);
const relative = path.relative(path.resolve(".data"), restoredDir);
if (!/^phase1-auth-smoke-\d+[\\/]restored-security-fixture$/.test(relative)) {
  throw new Error("Only the disposable auth-smoke restore fixture is accepted; developer/production DBs are forbidden.");
}
const standaloneDistDir = distArg < 0 ? ".next" : process.argv[distArg + 1];
if (!standaloneDistDir || !/^\.next(?:-[a-zA-Z0-9-]+)?$/.test(standaloneDistDir)) throw new Error("--dist requires a local Next build directory.");
const db = new Database(path.join(restoredDir, "neta.db"), { fileMustExist: true });
db.pragma("foreign_keys = ON");
const id = randomUUID();
const expiresAt = Date.now() - 1000;
try {
  const inserted = db.prepare(`INSERT INTO device_sessions (
    id, family_id, owner_user_id, install_id_digest, device_name, platform, app_version,
    scopes, token_epoch, access_digest, access_expires_at, refresh_digest, refresh_expires_at, last_used_at)
    SELECT ?, ?, auth_user_id, 'maintenance-fixture', 'Maintenance fixture', 'android', '0.1.0',
      '[]', 'maintenance-fixture-epoch', ?, ?, ?, ?, ?
    FROM app_profiles WHERE role = 'freelancer' LIMIT 1`)
    .run(id, id, `fixture-access-${id}`, Date.now() + 60_000, `fixture-refresh-${id}`, expiresAt, Date.now());
  assert.equal(inserted.changes, 1, "Restore fixture needs an owner");
  db.prepare("INSERT INTO device_refresh_history (digest, device_session_id) VALUES (?, ?)").run(`fixture-history-${id}`, id);
  await withRestoredSecurityRuntime({
    restoredDir, standaloneDistDir,
    env: { ...process.env, BETTER_AUTH_SECRET: "phase1-auth-smoke-secret-is-longer-than-32-characters" },
  }, async ({ request }) => {
    const row = db.prepare("SELECT status, revoked_at FROM device_sessions WHERE id = ?").get(id);
    assert.deepEqual(row, { status: "expired", revoked_at: expiresAt }, "Production startup must run session maintenance before readiness");
    assert.ok(db.prepare("SELECT digest FROM device_refresh_history WHERE device_session_id = ?").get(id), "Recently expired history must survive startup");
    const me = await request("/api/v1/me", { headers: { authorization: `Bearer fixture-access-${id}` } });
    assert.equal(me.response.status, 401);
    assert.equal(me.response.headers.get("x-neta-api-version"), "1");
  });
  console.log("Production standalone startup maintenance and readiness smoke passed (isolated restore fixture).");
} finally {
  db.prepare("DELETE FROM device_sessions WHERE id = ?").run(id);
  db.close();
}
