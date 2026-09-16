import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import Database from "better-sqlite3";

test("refresh history migration preserves existing digests and cascades session deletion", () => {
  const db = new Database(":memory:");
  try {
    db.pragma("foreign_keys = ON");
    const root = path.join(process.cwd(), "server/db/migrations");
    const journal = JSON.parse(fs.readFileSync(path.join(root, "meta/_journal.json"), "utf8"));
    for (const entry of journal.entries.filter((entry) => entry.idx < 16)) {
      db.exec(fs.readFileSync(path.join(root, `${entry.tag}.sql`), "utf8"));
    }
    db.prepare("INSERT INTO user (id, name, email) VALUES ('owner', 'Owner', 'owner@example.test')").run();
    db.prepare(`INSERT INTO device_sessions (id, family_id, owner_user_id, install_id_digest,
      device_name, platform, app_version, scopes, token_epoch, access_digest, access_expires_at,
      refresh_digest, previous_refresh_digest, refresh_expires_at, last_used_at)
      VALUES (?, ?, 'owner', 'install-digest', 'Android', 'android', '0.1.0', '[]', 'epoch', ?, 9999999999999, ?, ?, 9999999999999, 1234)`)
      .run("existing", "family", "access-digest", "current-digest", "consumed-digest");
    db.exec(fs.readFileSync(path.join(root, "0016_device-refresh-history.sql"), "utf8"));
    assert.deepEqual(db.prepare("SELECT * FROM device_refresh_history").all(), [{
      digest: "consumed-digest", device_session_id: "existing", consumed_at: 1234,
    }]);
    assert.equal(db.prepare("SELECT refresh_digest FROM device_sessions WHERE id = 'existing'").get().refresh_digest, "current-digest");
    const previous = db.prepare("SELECT status, revoked_at FROM device_sessions WHERE id = 'existing'").get();
    assert.equal(previous.status, "revoked", "Families with irrecoverable old history must re-pair");
    assert.ok(previous.revoked_at > 0);
    db.prepare("DELETE FROM device_sessions WHERE id = 'existing'").run();
    assert.equal(db.prepare("SELECT count(*) AS value FROM device_refresh_history").get().value, 0);
  } finally { db.close(); }
});
