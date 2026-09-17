import assert from "node:assert/strict";
import { spawn, execFileSync } from "node:child_process";
import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import fs from "node:fs";
import net from "node:net";
import path from "node:path";
import Database from "better-sqlite3";
import { isChatStreamEvent, isChatSession, isProjectRiskAnalysis, isFinanceAnalysis } from "@neta/api-contracts";

// All provider traffic stays on loopback. No real provider keys or user DB.
let mode = "normal"; let calls = 0; let cancelled = 0;
let resumePaused;
const prompts = [];
const privateMarker = "FAKE-UPSTREAM-SECRET-MUST-NOT-LEAK";
const provider = createServer(async (req, res) => {
  const chunks = []; for await (const chunk of req) chunks.push(chunk);
  const body = JSON.parse(Buffer.concat(chunks).toString());
  calls++; prompts.push(body.messages);
  if (mode === "reject") { res.writeHead(429, { "Content-Type": "application/json" }); res.end(JSON.stringify({ error: { message: privateMarker } })); return; }
  if (mode === "invalid") { res.writeHead(200, { "Content-Type": "application/json" }); res.end(JSON.stringify({ id: "fixture", object: "chat.completion", choices: [{ index: 0, message: { role: "assistant", content: "invalid JSON" }, finish_reason: "stop" }] })); return; }
  if (!body.stream) {
    const risk = body.response_format?.json_schema?.schema?.properties?.riskLevel;
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ id: "fixture", object: "chat.completion", model: "fixture", choices: [{ index: 0, message: { role: "assistant", content: JSON.stringify({ summary: "Fixture analysis", recommendations: ["Review schedule"], ...(risk ? { riskLevel: "medium" } : {}) }) }, finish_reason: "stop" }], usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 } })); return;
  }
  res.writeHead(200, { "Content-Type": "text/event-stream" });
  const send = (delta, finish = null) => res.write(`data: ${JSON.stringify({ id: "fixture", object: "chat.completion.chunk", model: "fixture", choices: [{ index: 0, delta: { content: delta }, finish_reason: finish }] })}\n\n`);
  send("Merhaba ");
  if (mode === "pause") { resumePaused = () => { send("dünya 🧭"); send("", "stop"); res.end("data: [DONE]\n\n"); }; return; }
  if (mode === "hang") { res.on("close", () => { cancelled++; }); return; }
  await new Promise(resolve => setTimeout(resolve, 80));
  send("dünya 🧭"); send("", "stop"); res.end("data: [DONE]\n\n");
});
await new Promise(resolve => provider.listen(0, "127.0.0.1", resolve));
const stamp = Date.now();
const root = process.cwd();
const dataDir = path.join(root, ".data", `mobile-ai-smoke-${stamp}`);
const distDir = `.next-mobile-ai-smoke-${stamp}`;
const databasePath = path.join(dataDir, "neta.db");
const snapshots = ["next-env.d.ts", "tsconfig.json"].map(file => ({ file, content: fs.readFileSync(file) }));
const port = await freePort(); const base = `http://127.0.0.1:${port}`;
const env = { ...process.env, NODE_ENV: "development", DATA_DIR: dataDir, DATABASE_PATH: databasePath, APP_URL: base,
  NEXT_PUBLIC_SITE_URL: base, TRUSTED_ORIGINS: base, BETTER_AUTH_SECRET: "mobile-ai-smoke-secret-longer-than-32-characters", AI_REQUEST_TIMEOUT_MS: "1500",
  OLLAMA_BASE_URL: `http://127.0.0.1:${provider.address().port}/v1`, NEXT_DIST_DIR: distDir, NEXT_TELEMETRY_DISABLED: "1" };
fs.mkdirSync(dataDir, { recursive: true });
let server; let db; let logs = "";
try {
  execFileSync(process.execPath, ["scripts/migrate.mjs"], { env, stdio: "inherit" });
  server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "dev", "--hostname", "127.0.0.1", "--port", String(port)], { env, stdio: ["ignore", "pipe", "pipe"], detached: process.platform !== "win32" });
  for (const output of [server.stdout, server.stderr]) output.on("data", chunk => { logs += chunk; });
  for (let i = 0; ; i++) { try { if ((await fetch(`${base}/api/health/live`)).ok) break; } catch {} if (i > 240) throw Error("AI test backend not ready"); await new Promise(resolve => setTimeout(resolve, 250)); }
  const password = "MobileAI-Password-123";
  const setup = await json("/api/auth/sign-up/email", { method: "POST", body: { name: "AI Owner", email: "ai-owner@example.test", password } });
  assert.equal(setup.response.status, 200);
  const cookie = setup.response.headers.getSetCookie().map(v => v.split(";")[0]).join("; ");
  const owner = setup.payload.user.id;
  db = new Database(databasePath);
  db.prepare("INSERT INTO clients (id, owner_user_id, name) VALUES ('ai-client', ?, 'Fixture Client')").run(owner);
  db.prepare("INSERT INTO projects (id, owner_user_id, name, status) VALUES ('ai-project', ?, 'Fixture Project', 'active')").run(owner);
  db.exec("INSERT INTO user (id, name, email) VALUES ('foreign-owner', 'Foreign Owner', 'foreign@example.test'); INSERT INTO projects (id, owner_user_id, name) VALUES ('foreign-project', 'foreign-owner', 'FOREIGN-PROJECT-PRIVATE'); INSERT INTO chat_sessions (id, owner_user_id, title) VALUES ('foreign-chat', 'foreign-owner', 'FOREIGN-CHAT-PRIVATE')");
  db.prepare("INSERT INTO finance_transactions (id, owner_user_id, type, amount_minor, currency, transaction_date, category) VALUES ('current-finance', ?, 'income', 1200, 'TRY', '2026-09-01', 'MONTH-INCLUDED')").run(owner);
  db.prepare("INSERT INTO finance_transactions (id, owner_user_id, type, amount_minor, currency, transaction_date, category) VALUES ('other-finance', ?, 'income', 9900, 'TRY', '2026-08-01', 'MONTH-EXCLUDED')").run(owner);
  db.prepare("INSERT INTO finance_transactions (id, owner_user_id, type, amount_minor, currency, transaction_date, category) VALUES ('jpy-finance', ?, 'income', 12345, 'JPY', '2026-09-01', 'JPY-INCLUDED')").run(owner);
  const headers = { Cookie: cookie, "Idempotency-Key": randomUUID() };
  assert.equal((await json("/api/v1/chat/sessions")).response.status, 401);
  const missingSettings = await json("/api/v1/projects/ai-project/risk-analysis", { method: "POST", headers, body: {} });
  assert.equal(missingSettings.response.status, 400);
  assert.equal(calls, 0);
  assert.equal((await json("/api/v1/settings/ai", { method: "PATCH", headers, body: { provider: "ollama", model: "fixture" } })).response.status, 200);
  const created = await json("/api/v1/chat/sessions", { method: "POST", headers, body: { title: "AI fixture" } });
  assert.equal(created.response.status, 201); assert.ok(isChatSession(created.payload.data));
  const sessionId = created.payload.data.id;
  const route = `/api/v1/chat/sessions/${sessionId}/messages`;
  const payload = { content: "Merhaba", sourceLocale: "tr" };
  const post = { method: "POST", headers: { Cookie: cookie, "Idempotency-Key": randomUUID() }, body: payload };
  const stream = await events(route, post);
  assert.equal(stream.at(-1).type, "message.completed");
  assert.equal(stream.filter(e => e.type === "message.delta").map(e => e.delta).join(""), "Merhaba dünya 🧭");
  const beforeReplay = calls;
  assert.deepEqual(await events(route, post), [stream.at(-1)]); assert.equal(calls, beforeReplay);
  assert.equal(db.prepare("SELECT count(*) n FROM chat_messages WHERE session_id = ?").get(sessionId).n, 2);
  assert.equal((await json(route, { ...post, body: { ...payload, content: "different" } })).response.status, 409);
  assert.equal((await json(route, { method: "POST", headers: { Cookie: cookie }, body: payload })).response.status, 400);
  assert.equal((await json(route, { ...post, headers: { Cookie: cookie, "Idempotency-Key": randomUUID() }, body: { ...payload, ownerId: "foreign-owner" } })).response.status, 400);
  assert.equal((await json(route, { ...post, body: { content: 'x'.repeat(40_000), sourceLocale: 'tr' } })).response.status, 400);
  assert.equal((await json(route, { ...post, body: { ...payload, sourceLocale: 'zz' } })).response.status, 400);
  assert.equal((await json(route, { method: "PUT", headers: { Cookie: cookie }, body: {} })).response.status, 405);
  assert.equal((await json("/api/v1/chat/sessions/foreign-chat/messages", { headers: { Cookie: cookie } })).response.status, 404);
  assert.equal((await json("/api/v1/projects/foreign-project/risk-analysis", { method: "POST", headers, body: {} })).response.status, 404);
  const page = await json(`${route}?limit=1`, { headers: { Cookie: cookie } });
  assert.equal(page.payload.data.items.length, 1); assert.ok(page.payload.data.pageInfo.hasNextPage);
  const next = await json(`${route}?limit=1&cursor=${encodeURIComponent(page.payload.data.pageInfo.nextCursor)}`, { headers: { Cookie: cookie } });
  assert.equal(next.payload.data.items[0].role, "assistant");
  const riskPost = { method: "POST", headers: { Cookie: cookie, "Idempotency-Key": randomUUID() }, body: {} };
  const risk = await json("/api/v1/projects/ai-project/risk-analysis", riskPost);
  assert.equal(risk.response.status, 200); assert.ok(isProjectRiskAnalysis(risk.payload.data));
  const beforeRisk = calls; assert.deepEqual((await json("/api/v1/projects/ai-project/risk-analysis", riskPost)).payload, risk.payload); assert.equal(calls, beforeRisk);
  const financePost = { method: "POST", headers: { Cookie: cookie, "Idempotency-Key": randomUUID() }, body: { month: "2026-09" } };
  const finance = await json("/api/v1/finance/analysis", financePost);
  assert.equal(finance.response.status, 200); assert.ok(isFinanceAnalysis(finance.payload.data));
  const financePrompt = JSON.stringify(prompts.at(-1)); assert.ok(financePrompt.includes("MONTH-INCLUDED")); assert.ok(!financePrompt.includes("MONTH-EXCLUDED"));
  assert.ok(financePrompt.includes("JPY: gelir 12345"), "JPY amounts must use zero fractional digits");
  const beforeEmpty = calls;
  assert.equal((await json("/api/v1/finance/analysis", { ...financePost, headers: { Cookie: cookie, "Idempotency-Key": randomUUID() }, body: { month: "2001-01" } })).response.status, 200); assert.equal(calls, beforeEmpty);
  assert.equal((await json("/api/v1/finance/analysis", { ...financePost, body: { month: "2026-13" } })).response.status, 400);
  console.log("MOB-8: chat NDJSON/persistence/replay/pagination, owner scope and structured project/selected-month finance passed.");

  mode = "reject";
  const failurePost = { ...post, headers: { Cookie: cookie, "Idempotency-Key": randomUUID() } };
  const failed = await events(route, failurePost); assert.equal(failed.at(-1).type, "error"); assert.equal(failed.at(-1).code, "SERVICE_UNAVAILABLE");
  mode = "normal";
  assert.equal((await events(route, failurePost)).at(-1).type, "message.completed");
  assert.equal(db.prepare("SELECT count(*) n FROM chat_messages WHERE session_id = ? AND role = 'user'").get(sessionId).n, 2);
  mode = "invalid";
  assert.equal((await json("/api/v1/projects/ai-project/risk-analysis", { ...riskPost, headers: { Cookie: cookie, "Idempotency-Key": randomUUID() } })).response.status, 502);
  mode = "hang";
  const timeoutPost = { ...post, headers: { Cookie: cookie, "Idempotency-Key": randomUUID() } };
  const timeout = await events(route, timeoutPost); assert.equal(timeout.at(-1).type, "error"); assert.equal(timeout.at(-1).code, "UPSTREAM_TIMEOUT");
  const abort = new AbortController();
  const cancelPost = { ...post, headers: { Cookie: cookie, "Idempotency-Key": randomUUID() } };
  const cancelResponse = await raw(route, { ...cancelPost, signal: abort.signal });
  const reader = cancelResponse.body.getReader(); await reader.read(); abort.abort(); await reader.cancel().catch(() => {});
  await new Promise(resolve => setTimeout(resolve, 250)); assert.ok(cancelled >= 2, "timeout and cancellation must reach provider");
  mode = "normal";
  assert.equal((await events(route, cancelPost)).at(-1).type, "message.completed");
  assert.ok(!logs.includes(privateMarker), "provider error body must not leak into logs");
  assert.ok(!JSON.stringify(prompts).includes("FOREIGN-PROJECT-PRIVATE"));
  console.log("MOB-8: provider failure privacy, invalid structured output, timeout/cancel propagation and same-key retry passed.");

  const challenge = await json("/api/v1/pairing/challenges", { method: "POST", headers: { Cookie: cookie }, body: { currentPassword: password } });
  const pair = await json("/api/v1/pairing/exchange", { method: "POST", body: { secret: new URL(challenge.payload.data.qrPayload).searchParams.get("secret"), installId: "ai-smoke-install", deviceName: "AI Test", platform: "android", appVersion: "1.0.0" } });
  assert.equal(pair.response.status, 201);
  const bearer = { Authorization: `Bearer ${pair.payload.data.accessToken}` };
  assert.equal((await json("/api/v1/chat/sessions", { headers: bearer })).response.status, 200);
  assert.equal((await events(route, { ...post, headers: { ...bearer, "Idempotency-Key": randomUUID() } })).at(-1).type, "message.completed");
  const originalScopes = db.prepare("SELECT scopes FROM device_sessions WHERE id = ?").get(pair.payload.data.deviceSessionId).scopes;
  db.prepare("UPDATE device_sessions SET scopes = ? WHERE id = ?").run(JSON.stringify(["settings:write", "finance:write", "projects:write"]), pair.payload.data.deviceSessionId);
  for (const p of [route, "/api/v1/finance/analysis", "/api/v1/projects/ai-project/risk-analysis"]) assert.equal((await json(p, { method: "POST", headers: { ...bearer, "Idempotency-Key": randomUUID() }, body: p === route ? payload : p.includes("finance") ? { month: "2026-09" } : {} })).response.status, 403);
  assert.equal((await json("/api/v1/chat/sessions", { headers: { Cookie: cookie, Authorization: "Bearer invalid" } })).response.status, 401);
  db.prepare("UPDATE device_sessions SET scopes = ? WHERE id = ?").run(originalScopes, pair.payload.data.deviceSessionId);
  const beforeRevoke = db.prepare("SELECT count(*) n FROM chat_messages WHERE session_id = ? AND role = 'assistant'").get(sessionId).n;
  mode = "pause";
  const revokedPost = { ...post, headers: { ...bearer, "Idempotency-Key": randomUUID() } };
  const revokedResponse = await raw(route, revokedPost);
  const revokedReader = revokedResponse.body.getReader(); await revokedReader.read();
  db.prepare("UPDATE device_sessions SET status = 'revoked', revoked_at = ? WHERE id = ?").run(Date.now(), pair.payload.data.deviceSessionId);
  resumePaused();
  let revokedTail = ''; const revokedDecoder = new TextDecoder();
  while (true) { const chunk = await revokedReader.read(); if (chunk.done) break; revokedTail += revokedDecoder.decode(chunk.value, { stream: true }); }
  revokedReader.releaseLock(); assert.ok(revokedTail.includes('"type":"error"')); assert.ok(!revokedTail.includes('message.completed'));
  assert.equal(db.prepare("SELECT count(*) n FROM chat_messages WHERE session_id = ? AND role = 'assistant'").get(sessionId).n, beforeRevoke);
  mode = "normal";
  assert.equal((await json(route, revokedPost)).response.status, 401);
  const invitation = await json("/api/portal-invitations", { method: "POST", headers: { Cookie: cookie }, body: { clientId: "ai-client", email: "ai-client@example.test" } });
  assert.equal(invitation.response.status, 201);
  const token = new URL(invitation.payload.invitation.invitationUrl).pathname.split("/").at(-1);
  // Legacy invitation endpoint returns the one-use token directly in its DTO.
  const accepted = await json("/api/portal-invitations/accept", { method: "POST", body: { token, displayName: "AI Client", password: "AIClient-Password-123" } });
  assert.equal(accepted.response.status, 201);
  const clientLogin = await json("/api/auth/sign-in/email", { method: "POST", body: { email: "ai-client@example.test", password: "AIClient-Password-123" } });
  const clientCookie = clientLogin.response.headers.getSetCookie().map(v => v.split(";")[0]).join("; ");
  for (const p of ["/api/v1/chat/sessions", route, "/api/v1/finance/analysis", "/api/v1/projects/ai-project/risk-analysis"]) assert.equal((await json(p, { method: "POST", headers: { Cookie: clientCookie, "Idempotency-Key": randomUUID() }, body: {} })).response.status, 403);
  const meta = await json("/api/v1/meta");
  assert.equal(meta.payload.data.capabilityDetails.find(c => c.id === "ai.assistant.v1").status, "available");
  assert.ok(!meta.payload.data.capabilities.includes("mobile-v1"));
  console.log("MOB-8: Bearer streaming/read-scope enforcement, no cookie fallback, client rejection and capability acceptance passed.");
} finally {
  db?.close();
  if (server?.pid) {
    if (process.platform === "win32") { try { execFileSync("taskkill", ["/PID", String(server.pid), "/T", "/F"], { stdio: "pipe" }); } catch { server.kill(); } }
    else { try { process.kill(-server.pid, "SIGTERM"); } catch { server.kill(); } }
  }
  provider.closeAllConnections(); await new Promise(resolve => provider.close(resolve));
  const target = path.resolve(root, distDir);
  if (path.dirname(target) !== root || !path.basename(target).startsWith(".next-mobile-ai-smoke-")) throw Error("Unexpected AI smoke cleanup target");
  fs.rmSync(target, { recursive: true, force: true });
  for (const snapshot of snapshots) fs.writeFileSync(snapshot.file, snapshot.content);
}

async function raw(route, options = {}) { return fetch(`${base}${route}`, { ...options, headers: { "Content-Type": "application/json", Origin: base, ...options.headers }, body: options.body === undefined ? undefined : JSON.stringify(options.body) }); }
async function json(route, options = {}) { const response = await raw(route, options); const payload = await response.json(); return { response, payload }; }
async function events(route, options) { const response = await raw(route, options); assert.equal(response.status, 200); assert.match(response.headers.get("content-type"), /application\/x-ndjson/); assert.equal(response.headers.get("x-neta-api-version"), "1"); const data = (await response.text()).trim().split("\n").map(JSON.parse); for (const event of data) { assert.ok(isChatStreamEvent(event)); assert.ok(!JSON.stringify(event).includes(privateMarker)); } return data; }
function freePort() { return new Promise(resolve => { const s = net.createServer(); s.listen(0, "127.0.0.1", () => { const port = s.address().port; s.close(() => resolve(port)); }); }); }
