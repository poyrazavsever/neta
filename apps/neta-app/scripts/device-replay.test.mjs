import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import Database from "better-sqlite3";
import { openRefreshReplay, REFRESH_REPLAY_TTL_MS, sealRefreshReplay } from "../server/auth/device-replay-crypto.ts";

const migrations = new URL("../server/db/migrations/", import.meta.url);
function migrate(db, before = Infinity) {
  db.pragma("foreign_keys = ON");
  const journal = JSON.parse(fs.readFileSync(new URL("meta/_journal.json", migrations), "utf8"));
  for (const entry of journal.entries.filter((entry) => entry.idx < before)) db.exec(fs.readFileSync(new URL(`${entry.tag}.sql`, migrations), "utf8"));
}

test("0017 revokes only legacy pending challenges and preserves existing device/web sessions and consumed history", () => {
  const db = new Database(":memory:");
  try {
    migrate(db, 17);
    db.exec("INSERT INTO user (id, name, email) VALUES ('owner', 'Owner', 'owner@example.test')");
    for (const status of ["pending", "consumed", "locked", "revoked"]) db.prepare(`INSERT INTO pairing_challenges
      (id, owner_user_id, secret_digest, manual_code_digest, status, expires_at) VALUES (?, 'owner', ?, ?, ?, ?)`)
      .run(status, `secret-${status}`, `manual-${status}`, status, Date.now() + 60_000);
    insertDevice(db);
    db.exec("INSERT INTO device_refresh_history (digest, device_session_id) VALUES ('consumed', 'device')");
    db.prepare("INSERT INTO session (id, expires_at, token, updated_at, user_id) VALUES ('web', ?, 'web-token', ?, 'owner')").run(Date.now() + 60_000, Date.now());
    db.exec(fs.readFileSync(new URL("0017_device-pairing-replay.sql", migrations), "utf8"));
    assert.equal(db.prepare("SELECT status FROM pairing_challenges WHERE id = 'pending'").get().status, "revoked");
    for (const status of ["consumed", "locked", "revoked"]) assert.equal(db.prepare("SELECT status FROM pairing_challenges WHERE id = ?").get(status).status, status);
    assert.equal(db.prepare("SELECT status FROM device_sessions WHERE id = 'device'").get().status, "active");
    assert.equal(db.prepare("SELECT count(*) AS n FROM session").get().n, 1);
    assert.equal(db.prepare("SELECT count(*) AS n FROM device_refresh_history").get().n, 1);
  } finally { db.close(); }
});

test("encrypted replay survives SQLite reopen, hides credentials, rejects binding/key/ciphertext tampering, and expires exactly", () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "neta-device-replay-test-"));
  const filename = path.join(directory, "replay.db");
  const now = Date.now();
  const secret = randomBytes(32).toString("hex");
  const binding = { deviceSessionId: "device", tokenEpoch: "epoch", consumedDigest: "consumed", requestDigest: "request-digest", successorRefreshDigest: "successor", expiresAt: now + REFRESH_REPLAY_TTL_MS };
  const pair = { accessToken: randomBytes(32).toString("base64url"), refreshToken: randomBytes(32).toString("base64url"), accessExpiresAt: new Date(now + 60_000).toISOString(), refreshExpiresAt: new Date(now + 120_000).toISOString(), tokenType: "Bearer" };
  let db;
  try {
    db = new Database(filename); migrate(db);
    db.exec("INSERT INTO user (id, name, email) VALUES ('owner', 'Owner', 'owner@example.test')");
    insertDevice(db);
    const ciphertext = sealRefreshReplay(pair, secret, binding);
    assert.ok(!ciphertext.includes(pair.accessToken) && !ciphertext.includes(pair.refreshToken));
    db.prepare(`INSERT INTO device_refresh_replays VALUES (?, ?, ?, ?, ?, ?)`)
      .run(binding.deviceSessionId, binding.consumedDigest, binding.requestDigest, binding.successorRefreshDigest, ciphertext, binding.expiresAt);
    db.close();
    db = new Database(filename);
    db.pragma("foreign_keys = ON");
    const stored = db.prepare("SELECT encrypted_response FROM device_refresh_replays WHERE device_session_id = 'device'").get().encrypted_response;
    assert.deepEqual(openRefreshReplay(stored, secret, binding, now), pair);
    assert.deepEqual(openRefreshReplay(stored, secret, binding, binding.expiresAt - 1), pair);
    assert.equal(openRefreshReplay(stored, secret, binding, binding.expiresAt), null);
    assert.equal(openRefreshReplay(stored, "foreign-key", binding, now), null);
    for (const field of Object.keys(binding)) {
      const changed = { ...binding, [field]: field === "expiresAt" ? binding.expiresAt - 1 : "foreign" };
      assert.equal(openRefreshReplay(stored, secret, changed, now), null, `${field} must be authenticated`);
    }
    const damaged = stored.split(".");
    damaged[3] = (damaged[3][0] === "A" ? "B" : "A") + damaged[3].slice(1);
    assert.equal(openRefreshReplay(damaged.join("."), secret, binding, now), null);
    assert.equal(openRefreshReplay("invalid-format", secret, binding, now), null);
    assert.equal(openRefreshReplay(stored, secret, { ...binding, expiresAt: now + REFRESH_REPLAY_TTL_MS + 1 }, now), null);
    for (const credential of [pair.accessToken, pair.refreshToken]) assert.ok(!fs.readFileSync(filename).includes(Buffer.from(credential)));
    db.exec("DELETE FROM device_sessions WHERE id = 'device'");
    assert.equal(db.prepare("SELECT count(*) AS n FROM device_refresh_replays").get().n, 0);
  } finally {
    if (db?.open) db.close();
    const absolute = path.resolve(directory);
    if (path.dirname(absolute) !== path.resolve(os.tmpdir()) || !path.basename(absolute).startsWith("neta-device-replay-test-")) throw new Error("Unexpected replay test cleanup path");
    fs.rmSync(absolute, { recursive: true, force: true });
  }
});

function insertDevice(db) {
  db.prepare(`INSERT INTO device_sessions (id, family_id, owner_user_id, install_id_digest,
    device_name, platform, app_version, scopes, token_epoch, access_digest, access_expires_at, refresh_digest, refresh_expires_at)
    VALUES ('device', 'family', 'owner', 'install', 'Android', 'android', '0.1.0', '[]', 'epoch', 'access', ?, 'refresh', ?)`)
    .run(Date.now() + 60_000, Date.now() + 120_000);
}
