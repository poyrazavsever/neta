import assert from "node:assert/strict";

export async function runPortalSecurityAcceptance({ request, db, ownerCookie, ownerUserId, clientCookie, uploadFile, portalAssetFileId, privateAssetFileId, baseUrl }) {
  db.prepare("INSERT INTO clients (id, owner_user_id, name) VALUES (?, ?, ?)").run("client-beta", ownerUserId, "Beta Client");
  db.prepare("INSERT INTO projects (id, owner_user_id, client_id, name, status, revision_quota) VALUES (?, ?, ?, ?, ?, ?)")
    .run("project-beta", ownerUserId, "client-beta", "Beta Confidential Project", "active", 2);
  db.prepare("INSERT INTO tasks (id, owner_user_id, client_id, project_id, title, status, priority, is_public_to_client) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
    .run("task-beta", ownerUserId, "client-beta", "project-beta", "Beta Confidential Task", "todo", "medium", 1);
  const invite = await request("/api/v1/clients/client-beta/portal-invitations", {
    method: "POST", cookie: ownerCookie, body: { email: "beta-client@example.test", defaultLocale: "tr" },
    headers: { "idempotency-key": "portal-beta-invitation-acceptance" },
  });
  assert.equal(invite.response.status, 201);
  assert.equal(new URL(invite.payload.data.invitationUrl).origin, new URL(baseUrl).origin, "Invitation URL must use the public instance origin");
  const accepted = await request("/api/portal-invitations/accept", {
    method: "POST", body: {
      token: new URL(invite.payload.data.invitationUrl).pathname.split("/").at(-1),
      displayName: "Beta Portal User", password: "Beta-Client-Password-123",
    },
  });
  assert.equal(accepted.response.status, 201);
  const login = await request("/api/auth/sign-in/email", {
    method: "POST", body: { email: "beta-client@example.test", password: "Beta-Client-Password-123" },
  });
  assert.equal(login.response.status, 200);
  const betaCookie = login.response.headers.getSetCookie().map((value) => value.split(";", 1)[0]).join("; ");
  assert.ok(betaCookie);
  const betaFile = await uploadFile("project_asset", { cookie: ownerCookie, projectId: "project-beta", portalVisible: true, fileName: "beta-secret.png" });
  assert.equal(betaFile.response.status, 201);
  const betaPrivate = await uploadFile("project_asset", { cookie: ownerCookie, projectId: "project-beta", portalVisible: false, fileName: "beta-private.png" });
  assert.equal(betaPrivate.response.status, 201);

  const actors = [
    { cookie: clientCookie, ownProject: "project-alpha", foreignProject: "project-beta", ownClient: "client-alpha", foreignClient: "client-beta", ownFile: portalAssetFileId, privateFile: privateAssetFileId, foreignFile: betaFile.payload.data.id, forbiddenText: "Beta Confidential" },
    { cookie: betaCookie, ownProject: "project-beta", foreignProject: "project-alpha", ownClient: "client-beta", foreignClient: "client-alpha", ownFile: betaFile.payload.data.id, privateFile: betaPrivate.payload.data.id, foreignFile: portalAssetFileId, forbiddenText: "Alpha Project" },
  ];
  for (const actor of actors) {
    for (const surface of ["dashboard", `projects?clientId=${actor.foreignClient}`, `tasks?clientId=${actor.foreignClient}`, `revisions?clientId=${actor.foreignClient}`]) {
      const result = await request(`/api/v1/portal/${surface}`, { cookie: actor.cookie });
      assert.equal(result.response.status, 200, surface);
      const serialized = JSON.stringify(result.payload);
      assert.equal(serialized.includes(actor.foreignProject), false, "Forged client filter must not cross actor scope");
      assert.equal(serialized.includes(actor.forbiddenText), false, "Response must not disclose foreign content");
    }
    const own = await request(`/api/v1/portal/projects/${actor.ownProject}`, { cookie: actor.cookie });
    assert.equal(own.response.status, 200);
    for (const file of own.payload.data.assets) assert.equal(new URL(file.url).origin, new URL(baseUrl).origin, "Portal asset URL must use the public instance origin");
    assert.ok(own.payload.data.assets.some((file) => file.id === actor.ownFile));
    assert.equal(own.payload.data.assets.some((file) => file.id === actor.privateFile), false, "Private asset metadata must stay hidden");
    for (const method of ["GET", "POST"]) {
      const suffix = method === "POST" ? "/revisions" : "";
      const options = { method, cookie: actor.cookie, ...(method === "POST" ? {
        body: { description: "Cross-client mutation", sourceLocale: "tr" },
        headers: { "idempotency-key": `portal-cross-client-${actor.ownClient}` },
      } : {}) };
      const foreign = await request(`/api/v1/portal/projects/${actor.foreignProject}${suffix}`, options);
      const missing = await request(`/api/v1/portal/projects/missing-project${suffix}`, options);
      assert.equal(foreign.response.status, 404, "Cross-client ID access must hide existence");
      assert.equal(foreign.response.status, missing.response.status);
      assert.equal(foreign.payload.error.code, missing.payload.error.code);
    }
    for (const surface of ["tasks", "revisions"]) {
      const foreign = await request(`/api/v1/portal/${surface}?projectId=${actor.foreignProject}`, { cookie: actor.cookie });
      const missing = await request(`/api/v1/portal/${surface}?projectId=missing-project`, { cookie: actor.cookie });
      assert.equal(foreign.response.status, missing.response.status, "Foreign project filter must behave like missing ID");
      if (foreign.response.status === 200) assert.deepEqual(foreign.payload.data.items, [], "Forged project filter must not leak records");
      else assert.equal(foreign.response.status, 404);
    }
    for (const surface of ["clients", "projects", "tasks", "finance/transactions", "device-sessions", "settings/ai"]) {
      const result = await request(`/api/v1/${surface}`, { cookie: actor.cookie });
      assert.equal(result.response.status, 403, "Client must not access owner routes");
    }
    for (const [file, expected] of [[actor.ownFile, 200], [actor.privateFile, 404], [actor.foreignFile, 404], ["missing-file", 404]]) {
      for (const prefix of ["/api/files", "/api/v1/files"]) {
        const result = await fetch(`${baseUrl}${prefix}/${file}`, { headers: { cookie: actor.cookie } });
        assert.equal(result.status, expected, "File download authorization");
        if (prefix.includes("v1")) assert.equal(result.headers.get("x-neta-api-version"), "1");
        await result.arrayBuffer();
      }
    }
    const deletion = await request(`/api/files/${actor.foreignFile}`, { method: "DELETE", cookie: actor.cookie });
    const missingDeletion = await request("/api/files/missing-file", { method: "DELETE", cookie: actor.cookie });
    assert.equal(deletion.response.status, 404, "Foreign file delete must hide existence");
    assert.equal(deletion.response.status, missingDeletion.response.status);
    assert.equal(deletion.payload.error.code, missingDeletion.payload.error.code);
    assert.equal(db.prepare("SELECT count(*) AS value FROM files WHERE id = ?").get(actor.foreignFile).value, 1, "Rejected file delete must have no side effects");
    const foreignUser = db.prepare("SELECT auth_user_id FROM clients WHERE id = ?").get(actor.foreignClient).auth_user_id;
    const previous = db.prepare("SELECT display_name FROM app_profiles WHERE auth_user_id = ?").get(foreignUser).display_name;
    const ownUser = db.prepare("SELECT auth_user_id FROM clients WHERE id = ?").get(actor.ownClient).auth_user_id;
    const ownName = db.prepare("SELECT display_name FROM app_profiles WHERE auth_user_id = ?").get(ownUser).display_name;
    const accountSessions = await request("/api/v1/me/sessions", { cookie: actor.cookie });
    assert.equal(accountSessions.response.status, 200, "Portal account self-service must be available");
    assert.ok(accountSessions.payload.data.some((item) => item.current));
    for (const item of accountSessions.payload.data) {
      assert.equal(db.prepare("SELECT user_id FROM session WHERE id = ?").get(item.id).user_id, ownUser, "Session list must contain only the caller's sessions");
    }
    const foreignSessionId = db.prepare("SELECT id FROM session WHERE user_id = ? LIMIT 1").get(foreignUser).id;
    const forbiddenRevoke = await request(`/api/v1/me/sessions/${foreignSessionId}`, { method: "DELETE", cookie: actor.cookie });
    assert.equal(forbiddenRevoke.response.status, 404, "Foreign session revoke must hide existence");
    assert.ok(db.prepare("SELECT id FROM session WHERE id = ?").get(foreignSessionId), "Foreign session must remain active");
    const currentSession = accountSessions.payload.data.find((item) => item.current);
    const currentRevoke = await request(`/api/v1/me/sessions/${currentSession.id}`, { method: "DELETE", cookie: actor.cookie });
    assert.equal(currentRevoke.response.status, 409, "Current session uses the dedicated logout path");
    const profile = await request("/api/v1/portal/profile", { method: "PATCH", cookie: actor.cookie, body: { name: ownName, clientId: actor.foreignClient } });
    assert.equal(profile.response.status, 200);
    assert.equal(db.prepare("SELECT display_name FROM app_profiles WHERE auth_user_id = ?").get(foreignUser).display_name, previous, "Forged profile clientId must not modify another account");
  }
  assert.equal(db.prepare("SELECT count(*) AS value FROM project_revisions WHERE description = 'Cross-client mutation'").get().value, 0, "Rejected revisions must have no side effects");
  const changed = await request("/api/v1/me/password", { method: "POST", cookie: betaCookie,
    body: { currentPassword: "Beta-Client-Password-123", newPassword: "Beta-Updated-Password-456", revokeOtherSessions: true } });
  assert.equal(changed.response.status, 200, "Portal password self-service must work");
  const updatedLogin = await request("/api/auth/sign-in/email", { method: "POST", body: { email: "beta-client@example.test", password: "Beta-Updated-Password-456" } });
  assert.equal(updatedLogin.response.status, 200);
  const oldLogin = await request("/api/auth/sign-in/email", { method: "POST", body: { email: "beta-client@example.test", password: "Beta-Client-Password-123" } });
  assert.notEqual(oldLogin.response.status, 200, "Old portal password must stop authenticating");
  assert.equal((await request("/api/v1/me/sessions", { cookie: clientCookie })).response.status, 200, "Another client must remain authenticated after password change");
  console.log("Mobile security: reciprocal client ID/filter/mutation/file isolation passed with two real portal sessions.");
}
