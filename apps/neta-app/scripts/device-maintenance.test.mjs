import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import Database from "better-sqlite3";
import {
  CHALLENGE_RETENTION_MS, DEVICE_IDLE_TTL_MS, DEVICE_RETENTION_MS,
  DEVICE_MAINTENANCE_INTERVAL_MS, maintainDeviceSessions, startDeviceMaintenance,
} from "../server/auth/device-maintenance.ts";

function fixture() {
  const db = new Database(":memory:");
  db.pragma("foreign_keys = ON");
  const root = new URL("../server/db/migrations/", import.meta.url);
  const journal = JSON.parse(fs.readFileSync(new URL("meta/_journal.json", root), "utf8"));
  for (const entry of journal.entries) db.exec(fs.readFileSync(new URL(`${entry.tag}.sql`, root), "utf8"));
  db.prepare("INSERT INTO user (id, name, email) VALUES ('owner', 'Owner', 'owner@example.test')").run();
  return db;
}

function session(db, id, { status = "active", lastUsedAt = Date.now(), refreshExpiresAt = Date.now() + DEVICE_IDLE_TTL_MS, revokedAt = null } = {}) {
  db.prepare(`INSERT INTO device_sessions (id, family_id, owner_user_id, install_id_digest,
    device_name, platform, app_version, scopes, token_epoch, access_digest, access_expires_at,
    refresh_digest, refresh_expires_at, status, last_used_at, revoked_at)
    VALUES (?, ?, 'owner', 'install', 'Android', 'android', '0.1.0', '[]', 'epoch', ?, ?, ?, ?, ?, ?, ?)`)
    .run(id, `family-${id}`, `access-${id}`, refreshExpiresAt, `refresh-${id}`, refreshExpiresAt, status, lastUsedAt, revokedAt);
  db.prepare("INSERT INTO device_refresh_history (digest, device_session_id, consumed_at) VALUES (?, ?, ?)")
    .run(`consumed-${id}`, id, lastUsedAt - DEVICE_RETENTION_MS * 2);
}

test("maintenance expires sessions at the boundary, retains active history, and cascades only retired sessions", () => {
  const db = fixture();
  const now = Date.now();
  try {
    session(db, "active", { lastUsedAt: now, refreshExpiresAt: now + DEVICE_IDLE_TTL_MS });
    session(db, "access-only-expired", { lastUsedAt: now, refreshExpiresAt: now + DEVICE_IDLE_TTL_MS });
    db.prepare("UPDATE device_sessions SET access_expires_at = ? WHERE id = 'access-only-expired'").run(now - 1);
    session(db, "refresh-expired", { refreshExpiresAt: now, lastUsedAt: now });
    session(db, "idle", { lastUsedAt: now - DEVICE_IDLE_TTL_MS, refreshExpiresAt: now + DEVICE_IDLE_TTL_MS });
    session(db, "ancient-idle", { lastUsedAt: now - DEVICE_IDLE_TTL_MS - DEVICE_RETENTION_MS });
    for (const status of ["revoked", "compromised", "expired"]) {
      session(db, `old-${status}`, { status, revokedAt: now - DEVICE_RETENTION_MS });
      session(db, `recent-${status}`, { status, revokedAt: now - DEVICE_RETENTION_MS + 1 });
    }
    session(db, "no-retirement-date", { status: "revoked" });
    db.prepare(`INSERT INTO pairing_challenges (id, owner_user_id, secret_digest, manual_code_digest, expires_at)
      VALUES (?, 'owner', ?, ?, ?)`).run("old-challenge", "old-secret", "old-code", now - CHALLENGE_RETENTION_MS);
    db.prepare(`INSERT INTO pairing_challenges (id, owner_user_id, secret_digest, manual_code_digest, expires_at)
      VALUES (?, 'owner', ?, ?, ?)`).run("recent-challenge", "recent-secret", "recent-code", now - CHALLENGE_RETENTION_MS + 1);

    assert.deepEqual(maintainDeviceSessions(db, now), { expired: 3, replaysDeleted: 0, sessionsDeleted: 4, challengesDeleted: 1 });
    for (const id of ["refresh-expired", "idle"]) {
      assert.deepEqual(db.prepare("SELECT status, revoked_at FROM device_sessions WHERE id = ?").get(id), { status: "expired", revoked_at: now });
    }
    for (const id of ["active", "access-only-expired"]) assert.equal(db.prepare("SELECT status FROM device_sessions WHERE id = ?").get(id).status, "active");
    // Consumed history can be older than retention while its family remains active.
    assert.ok(db.prepare("SELECT * FROM device_refresh_history WHERE digest = 'consumed-active'").get());
    assert.equal(db.prepare("SELECT * FROM device_refresh_history WHERE digest = 'consumed-old-revoked'").get(), undefined);
    assert.equal(db.prepare("SELECT count(*) AS n FROM device_refresh_history").get().n, 8);
    assert.deepEqual(maintainDeviceSessions(db, now), { expired: 0, replaysDeleted: 0, sessionsDeleted: 0, challengesDeleted: 0 });
  } finally { db.close(); }
});

test("maintenance bounds each batch and retries the remainder on the next run", () => {
  const db = fixture();
  const now = Date.now();
  try {
    db.transaction(() => {
      for (let i = 0; i < 501; i++) session(db, `expired-${i}`, { refreshExpiresAt: now });
    })();
    assert.equal(maintainDeviceSessions(db, now).expired, 500);
    assert.equal(maintainDeviceSessions(db, now).expired, 1);
    assert.equal(db.prepare("SELECT count(*) AS n FROM device_refresh_history").get().n, 501);
  } finally { db.close(); }
});

test("maintenance startup fails closed, periodic errors retry, and timer does not keep Node alive", () => {
  let calls = 0;
  let scheduled;
  let unref = false;
  const errors = [];
  startDeviceMaintenance({
    run: () => { if (++calls === 2) throw new Error("test failure"); },
    onError: (error) => errors.push(error),
    schedule: (callback, interval) => {
      assert.equal(calls, 1);
      assert.equal(interval, DEVICE_MAINTENANCE_INTERVAL_MS);
      scheduled = callback;
      return { unref: () => { unref = true; } };
    },
  });
  assert.equal(unref, true);
  scheduled(); scheduled();
  assert.equal(calls, 3);
  assert.equal(errors.length, 1);
  assert.throws(() => startDeviceMaintenance({
    run: () => { throw new Error("unmigrated database"); }, onError: () => assert.fail(), schedule: () => assert.fail(),
  }), /unmigrated database/);
});

test("maintenance removes expired/closed encrypted replays while keeping recent active replay and all active history", () => {
  const db = fixture(); const now = Date.now();
  try {
    for (const id of ["expired-replay", "active-replay", "closed-replay"]) session(db, id, { lastUsedAt: now });
    db.prepare("UPDATE device_sessions SET status = 'revoked', revoked_at = ? WHERE id = 'closed-replay'").run(now);
    for (const id of ["expired-replay", "active-replay", "closed-replay"]) db.prepare("INSERT INTO device_refresh_replays VALUES (?, ?, ?, ?, 'ciphertext', ?)")
      .run(id, `consumed-${id}`, "request-digest", "successor", id === "expired-replay" ? now : now + 5000);
    const result = maintainDeviceSessions(db, now);
    assert.equal(result.replaysDeleted, 2);
    assert.deepEqual(db.prepare("SELECT device_session_id FROM device_refresh_replays").all(), [{ device_session_id: "active-replay" }]);
    assert.equal(db.prepare("SELECT count(*) AS n FROM device_refresh_history").get().n, 3);
  } finally { db.close(); }
});
