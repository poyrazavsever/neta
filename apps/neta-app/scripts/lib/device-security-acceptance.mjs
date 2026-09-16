import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

// Invoked by the isolated auth smoke runtime; never uses the developer's DB.
export async function runDeviceSecurityAcceptance({ request, db, ownerCookie, ownerPassword, ownerUserId, env, dataDir, databasePath, serverOutput }) {
  const secrets = [];
  let source = 0;
  const post = (url, body, extra = {}) => request(url, { method: "POST", body, ...extra });
  const bearer = (tokens) => ({ authorization: `Bearer ${tokens.accessToken}` });
  const status = (result, expected, label) => {
    assert.equal(result.response.status, expected, `${label} (${result.payload?.error?.code ?? "response"})`);
    if (expected >= 400) assert.equal(result.payload.ok, false, label);
    assert.equal(result.response.headers.get("x-neta-api-version"), "1", label);
  };
  const refresh = (tokens) => post("/api/v1/device-sessions/refresh", { refreshToken: tokens.refreshToken });
  const me = (tokens, cookie) => request("/api/v1/me", { headers: bearer(tokens), cookie });
  async function challenge() {
    const result = await post("/api/v1/pairing/challenges", { currentPassword: ownerPassword }, {
      cookie: ownerCookie, headers: { "x-forwarded-for": `127.0.1.${++source}` },
    });
    status(result, 201, "Create challenge with password step-up");
    secrets.push(new URL(result.payload.data.qrPayload).searchParams.get("secret"), result.payload.data.manualCode);
    return result.payload.data;
  }
  function exchangeBody(value, manual = false) {
    return {
      ...(manual ? { code: value.manualCode.toLowerCase().match(/.{1,5}/g).join(" - ") }
        : { secret: new URL(value.qrPayload).searchParams.get("secret") }),
      installId: "mobile-security-install", deviceName: "Acceptance Android", platform: "android", appVersion: "0.1.0",
    };
  }
  async function exchange(value, manual = false) {
    const result = await post("/api/v1/pairing/exchange", exchangeBody(value, manual));
    status(result, 201, "Exchange pairing credential");
    remember(result.payload.data);
    return result.payload.data;
  }
  const pair = async () => exchange(await challenge());
  function remember(tokens) { secrets.push(tokens.accessToken, tokens.refreshToken); }
  const session = (tokens) => db.prepare("SELECT * FROM device_sessions WHERE id = ?").get(tokens.deviceSessionId);

  status(await post("/api/v1/pairing/challenges", { currentPassword: "wrong-password" }, { cookie: ownerCookie }), 401, "Wrong step-up password");
  const pending = await Promise.all([challenge(), challenge(), challenge()]);
  status(await post("/api/v1/pairing/challenges", { currentPassword: ownerPassword }, { cookie: ownerCookie }), 409, "Maximum three pending challenges");
  for (const [index, value] of pending.entries()) {
    if (index === 0) db.prepare("UPDATE pairing_challenges SET expires_at = ? WHERE id = ?").run(Date.now() - 1000, value.challengeId);
    else db.prepare("UPDATE pairing_challenges SET status = ? WHERE id = ?").run(index === 1 ? "locked" : "revoked", value.challengeId);
    status(await post("/api/v1/pairing/exchange", exchangeBody(value)), 401, "Expired/locked/revoked challenge");
  }
  db.prepare("UPDATE pairing_challenges SET status = 'revoked' WHERE id = ?").run(pending[0].challengeId);
  const invalidCode = { code: "ZZZZZZZZZZ", installId: "rate-limit-install", deviceName: "Rate limit test", platform: "android", appVersion: "0.1.0" };
  for (let attempt = 0; attempt < 30; attempt += 1) {
    status(await post("/api/v1/pairing/exchange", invalidCode, { headers: { "x-forwarded-for": "127.0.2.1" } }), 401, "Unknown pairing code");
  }
  status(await post("/api/v1/pairing/exchange", invalidCode, { headers: { "x-forwarded-for": "127.0.2.1" } }), 503, "Pairing source rate limit");

  const atomic = await challenge();
  const exchanges = await Promise.all([false, true].map((manual) => post("/api/v1/pairing/exchange", exchangeBody(atomic, manual))));
  assert.deepEqual(exchanges.map((result) => result.response.status).sort(), [201, 401], "QR and manual exchange racing must consume once");
  const initial = exchanges.find((result) => result.response.status === 201).payload.data;
  remember(initial);
  status(await me(initial), 200, "Paired owner identity");
  const manual = await exchange(await challenge(), true);
  status(await me(manual), 200, "Normalized manual code");
  const png = await (await import("sharp")).default({ create: { width: 2, height: 2, channels: 4, background: "#336699" } }).png().toBuffer();
  async function upload(bytes, name, mimeType, key) {
    const form = new FormData();
    form.set("file", new File([bytes], name, { type: mimeType }));
    form.set("kind", "project_asset"); form.set("projectId", "project-alpha"); form.set("visibility", "portal");
    const response = await fetch(`${env.APP_URL}/api/v1/files`, {
      method: "POST", headers: { ...bearer(manual), "idempotency-key": key }, body: form,
    });
    return { response, payload: await response.json() };
  }
  const asset = await upload(png, "native-project.png", "image/png", "native-file-upload-acceptance");
  status(asset, 201, "Bearer file upload");
  assert.equal(asset.payload.data.metadataSanitized, true);
  assert.equal(new URL(asset.payload.data.url).origin, new URL(env.APP_URL).origin, "File URL must use the configured public instance origin");
  assert.equal(new URL(asset.payload.data.url).pathname, `/api/v1/files/${asset.payload.data.id}`);
  const duplicate = await upload(png, "native-project.png", "image/png", "native-file-upload-acceptance");
  status(duplicate, 201, "Upload lost-response retry");
  assert.equal(duplicate.payload.data.id, asset.payload.data.id, "Retry must not create another file");
  status(await upload(png, "changed-name.png", "image/png", "native-file-upload-acceptance"), 409, "Changed upload payload with same key");
  const pdfBytes = Buffer.from("%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF\n");
  const pdf = await upload(pdfBytes, "native-brief.pdf", "application/pdf", "native-pdf-upload-acceptance");
  status(pdf, 201, "Project PDF upload"); assert.equal(pdf.payload.data.metadataSanitized, false);
  status(await upload(Buffer.from("not a PDF"), "forged.pdf", "application/pdf", "native-forged-pdf-acceptance"), 400, "Forged PDF content");
  for (const item of [asset, pdf]) {
    const downloaded = await fetch(item.payload.data.url, { headers: bearer(manual) });
    assert.equal(downloaded.status, 200, "Bearer download must work without a cookie");
    assert.equal(downloaded.headers.get("x-neta-api-version"), "1");
    assert.equal(downloaded.headers.get("cache-control"), "private, no-store");
    assert.equal(downloaded.headers.get("content-type"), item.payload.data.mimeType);
    assert.equal((await downloaded.arrayBuffer()).byteLength, item.payload.data.sizeBytes);
    if (item === pdf) assert.match(downloaded.headers.get("content-disposition"), /^attachment;/);
    status(await request(new URL(item.payload.data.url).pathname), 401, "Anonymous versioned download");
    status(await request(new URL(item.payload.data.url).pathname, { cookie: ownerCookie, headers: { authorization: "Bearer invalid" } }), 401, "Invalid bearer download cannot use cookie");
  }
  console.log("MOB-5: native-authenticated upload/download, PDF validation and duplicate upload protection passed.");
  console.log("Mobile security: step-up, challenge states and concurrent one-use exchange passed.");

  for (const authorization of ["Bearer invalid-token", "Bearer ", "Basic invalid"]) {
    status(await request("/api/v1/me", { cookie: ownerCookie, headers: { authorization } }), 401, "Explicit invalid auth must not fall back to cookie");
  }
  status(await request("/api/v1/me", { cookie: ownerCookie }), 200, "Cookie-only identity remains valid");
  const originalScopes = session(manual).scopes;
  db.prepare("UPDATE device_sessions SET scopes = ? WHERE id = ?").run(JSON.stringify(["profile:read", "clients:read"]), manual.deviceSessionId);
  status(await me(manual), 200, "Allowed profile scope");
  status(await request("/api/v1/clients", { headers: bearer(manual) }), 200, "Allowed resource read scope");
  status(await request("/api/v1/clients", { method: "POST", headers: bearer(manual), body: {} }), 403, "Missing resource write scope");
  status(await request("/api/v1/finance/summary?month=2026-09", { headers: bearer(manual) }), 403, "Missing dispatch read scope");
  status(await request("/api/v1/device-sessions", { headers: bearer(manual) }), 403, "Missing device administration scope");
  status(await request(new URL(asset.payload.data.url).pathname, { headers: bearer(manual) }), 403, "Missing file read scope");
  status(await request("/api/v1/me/preferences", { method: "PATCH", headers: bearer(manual), body: { colorMode: "dark" } }), 403, "Missing preference write scope");
  status(await request("/api/v1/portal/dashboard", { headers: bearer(manual) }), 403, "Owner bearer cannot impersonate portal client");
  db.prepare("UPDATE device_sessions SET scopes = ? WHERE id = ?").run(originalScopes, manual.deviceSessionId);
  status(await request("/api/v1/finance/summary?month=2026-09", { headers: bearer(manual) }), 200, "Restored dispatch scope");
  console.log("Mobile security: bearer precedence and device scope enforcement passed.");

  let latest = initial;
  for (let rotation = 0; rotation < 3; rotation += 1) {
    const result = await refresh(latest);
    status(result, 200, "Sequential refresh rotation");
    const next = { ...result.payload.data, deviceSessionId: initial.deviceSessionId };
    remember(next);
    status(await me(latest), 401, "Old access token becomes invalid");
    latest = next;
  }
  assert.equal(db.prepare("SELECT count(*) AS value FROM device_refresh_history WHERE device_session_id = ?").get(initial.deviceSessionId).value, 3);
  status(await refresh(initial), 401, "Oldest refresh token reuse after three rotations");
  assert.equal(session(initial).status, "compromised", "Historical reuse compromises the family");
  status(await me(latest, ownerCookie), 401, "Compromised access cannot fall back to owner cookie");
  status(await refresh(latest), 401, "Compromised current refresh is invalid");
  status(await me(manual), 200, "Different device family stays active");

  const racing = await pair();
  const refreshRace = await Promise.all([refresh(racing), refresh(racing)]);
  assert.deepEqual(refreshRace.map((result) => result.response.status).sort(), [200, 401], "Concurrent duplicate refresh fails closed");
  const raceWinner = refreshRace.find((result) => result.response.status === 200).payload.data;
  remember(raceWinner);
  status(await me(raceWinner), 401, "Duplicate refresh compromises even the race winner");
  console.log("Mobile security: multi-generation reuse and concurrent refresh passed.");

  const expired = await pair();
  db.prepare("UPDATE device_sessions SET access_expires_at = ? WHERE id = ?").run(Date.now() - 1000, expired.deviceSessionId);
  status(await me(expired), 401, "Expired access");
  const recovered = await refresh(expired);
  status(recovered, 200, "Refresh recovers expired access");
  remember(recovered.payload.data);
  status(await me(recovered.payload.data), 200, "Recovered access");
  db.prepare("UPDATE device_sessions SET refresh_expires_at = ? WHERE id = ?").run(Date.now() - 1000, expired.deviceSessionId);
  status(await refresh(recovered.payload.data), 401, "Expired refresh");

  const disabled = await pair();
  db.prepare("UPDATE app_profiles SET disabled = 1 WHERE auth_user_id = ?").run(ownerUserId);
  try {
    status(await refresh(disabled), 401, "Disabled owner cannot rotate refresh");
    status(await me(disabled), 401, "Disabled owner access");
  } finally {
    db.prepare("UPDATE app_profiles SET disabled = 0 WHERE auth_user_id = ?").run(ownerUserId);
  }
  status(await me(disabled), 401, "Re-enabling owner must not revive disabled device families");
  const surviving = await pair();
  const epoch = db.prepare("SELECT token_epoch FROM device_security_state WHERE key = 'default'").get().token_epoch;
  db.prepare("UPDATE device_security_state SET token_epoch = ? WHERE key = 'default'").run("acceptance-invalidated-epoch");
  try {
    status(await me(surviving), 401, "Old epoch access");
    status(await refresh(surviving), 401, "Old epoch refresh");
  } finally {
    db.prepare("UPDATE device_security_state SET token_epoch = ? WHERE key = 'default'").run(epoch);
  }

  const revoked = await pair();
  status(await request(`/api/v1/device-sessions/${revoked.deviceSessionId}`, { method: "DELETE", headers: bearer(revoked) }), 200, "Device self logout/revoke");
  status(await me(revoked), 401, "Revoked access");
  status(await refresh(revoked), 401, "Revoked refresh");
  status(await me(surviving), 200, "Single-device revoke preserves other devices");
  console.log("Mobile security: expiry, disabled owner, epoch and single-device revoke passed.");

  // Real backup/restore commands, into a new disposable target (no --force).
  execFileSync(process.execPath, ["scripts/backup.mjs"], { env: { ...env, BACKUP_RETENTION_COUNT: "" }, stdio: "pipe" });
  const backupRoot = path.join(dataDir, "backups");
  const backup = fs.readdirSync(backupRoot).sort().at(-1);
  const restoredDir = path.join(dataDir, "restored-security-fixture");
  execFileSync(process.execPath, ["scripts/restore.mjs", "--from", path.join(backupRoot, backup), "--target", restoredDir], {
    env: { ...env, DATABASE_PATH: "", UPLOADS_DIR: "", BACKUPS_DIR: "" }, stdio: "pipe",
  });
  const restored = new Database(path.join(restoredDir, "neta.db"), { readonly: true });
  try {
    assert.notEqual(restored.prepare("SELECT token_epoch FROM device_security_state WHERE key = 'default'").get().token_epoch, epoch, "Restore must rotate epoch");
    assert.equal(restored.prepare("SELECT count(*) AS value FROM device_sessions WHERE status = 'active'").get().value, 0, "Restore must revoke all active device sessions");
    assert.equal(restored.prepare("SELECT status FROM device_sessions WHERE id = ?").get(surviving.deviceSessionId).status, "revoked");
    assert.equal(restored.prepare("SELECT count(*) AS value FROM device_refresh_history").get().value, db.prepare("SELECT count(*) AS value FROM device_refresh_history").get().value, "Restore preserves consumed digest evidence");
  } finally { restored.close(); }
  status(await me(surviving), 200, "Restore fixture must not alter source runtime");
  status(await request("/api/v1/me/sessions", { method: "DELETE", cookie: ownerCookie }), 200, "Logout-all");
  status(await me(surviving), 401, "Logout-all device access");
  status(await refresh(surviving), 401, "Logout-all device refresh");
  console.log("Mobile security: backup/restore epoch and logout-all passed (isolated DB evidence).");

  const passwordDevice = await pair();
  const temporaryPassword = "Mobile-Acceptance-New-Password-123";
  const changedPassword = await post("/api/v1/me/password", { currentPassword: ownerPassword, newPassword: temporaryPassword }, { cookie: ownerCookie });
  status(changedPassword, 200, "Password change");
  status(await request("/api/v1/me", { cookie: ownerCookie }), 401, "Password change replaces the previous cookie session");
  ownerCookie = responseCookie(changedPassword.response);
  assert.ok(ownerCookie, "Password response must forward the replacement cookie");
  status(await request("/api/v1/me", { cookie: ownerCookie }), 200, "Replacement password-change cookie");
  try {
    status(await me(passwordDevice), 401, "Password change revokes device access");
    status(await refresh(passwordDevice), 401, "Password change revokes device refresh");
  } finally {
    const restoredPassword = await post("/api/v1/me/password", { currentPassword: temporaryPassword, newPassword: ownerPassword }, { cookie: ownerCookie });
    status(restoredPassword, 200, "Restore fixture owner password");
    ownerCookie = responseCookie(restoredPassword.response);
    assert.ok(ownerCookie);
  }

  const auditTypes = new Set(db.prepare("SELECT DISTINCT type FROM auth_audit_events").all().map((row) => row.type));
  for (const type of ["pairing_created", "pairing_consumed", "pairing_failed", "device_session_refreshed", "device_token_reuse_detected", "device_session_revoked"]) {
    assert.ok(auditTypes.has(type), `Missing mobile security audit: ${type}`);
  }
  console.log("Mobile security: cookie password invalidation and audit passed.");
  const nativeDevice = await pair();
  const originalName = db.prepare("SELECT name FROM user WHERE id = ?").get(ownerUserId).name;
  status(await request("/api/v1/me/profile", { method: "PATCH", headers: bearer(nativeDevice), body: { name: "Paired Owner Profile" } }), 200, "Bearer profile update without cookie");
  assert.equal(db.prepare("SELECT name FROM user WHERE id = ?").get(ownerUserId).name, "Paired Owner Profile");
  assert.equal(db.prepare("SELECT display_name FROM app_profiles WHERE auth_user_id = ?").get(ownerUserId).display_name, "Paired Owner Profile");
  status(await request("/api/v1/me/profile", { method: "PATCH", headers: bearer(nativeDevice), body: { name: originalName } }), 200, "Restore owner profile fixture");
  status(await post("/api/v1/me/password", { currentPassword: "wrong-password", newPassword: temporaryPassword }, { headers: bearer(nativeDevice) }), 401, "Bearer password step-up failure");
  status(await me(nativeDevice), 200, "Wrong password must not revoke an active device");
  status(await post("/api/v1/me/password", { currentPassword: ownerPassword, newPassword: temporaryPassword }, { headers: bearer(nativeDevice) }), 200, "Bearer password change without cookie");
  status(await me(nativeDevice), 401, "Bearer password change revokes the initiating device");
  status(await refresh(nativeDevice), 401, "Bearer password change revokes refresh");
  status(await request("/api/v1/me", { cookie: ownerCookie }), 401, "Bearer password change revokes web sessions");
  const signedIn = await post("/api/auth/sign-in/email", {
    email: db.prepare("SELECT email FROM user WHERE id = ?").get(ownerUserId).email, password: temporaryPassword,
  });
  assert.equal(signedIn.response.status, 200, "Updated native password must sign in through Better Auth");
  ownerCookie = responseCookie(signedIn.response);
  const resetPassword = await post("/api/v1/me/password", { currentPassword: temporaryPassword, newPassword: ownerPassword }, { cookie: ownerCookie });
  status(resetPassword, 200, "Restore native password fixture");
  ownerCookie = responseCookie(resetPassword.response);
  for (const value of secrets) {
    assert.ok(value, "Secret fixture must be nonempty");
    for (const file of [databasePath, `${databasePath}-wal`].filter((file) => fs.existsSync(file))) {
      assert.equal(fs.readFileSync(file).includes(Buffer.from(value)), false, "Raw secret/token must not be in DB or WAL");
    }
    assert.equal(serverOutput().includes(value), false, "Raw secret/token must not be logged");
  }
  console.log("Mobile security: bearer profile/password parity and cross-transport invalidation passed.");
  return ownerCookie;
}

function responseCookie(response) {
  return response.headers.getSetCookie().map((value) => value.split(";", 1)[0]).join("; ");
}
