import assert from "node:assert/strict";
import { test } from "node:test";
import Database from "better-sqlite3";
import { registerHooks } from "node:module";

registerHooks({ resolve(specifier, context, next) { return next(specifier === "../domain/errors" ? "../domain/errors.ts" : specifier, context); } });
const { claimAiOperation } = await import("../server/ai/operations.ts");

function fixture() {
  const db = new Database(":memory:");
  db.exec(`CREATE TABLE api_idempotency_records (actor_user_id TEXT, method TEXT, route TEXT, idempotency_key TEXT, payload_hash TEXT, response_json TEXT, created_at INTEGER,
    PRIMARY KEY (actor_user_id, method, route, idempotency_key)); CREATE TABLE messages (id TEXT PRIMARY KEY, content TEXT);`);
  return db;
}
const scope = { actorId: "owner", route: "/api/v1/chat/sessions/a/messages", key: "request-key-123", payload: { content: "hello", sourceLocale: "tr" } };

test("AI retry keeps one user message, conflicts during flight, and replays a completed result without provider work", () => {
  const db = fixture(); let preparations = 0;
  const prepare = id => { preparations++; db.prepare("INSERT OR IGNORE INTO messages VALUES (?, 'hello')").run(id); return id; };
  try {
    const first = claimAiOperation(db, scope, 1_000, prepare);
    assert.throws(() => claimAiOperation(db, scope, 1_000, prepare), { code: "CONFLICT" });
    first.fail();
    const retry = claimAiOperation(db, scope, 1_000, prepare);
    assert.equal(retry.prepared, first.prepared);
    assert.equal(db.prepare("SELECT count(*) n FROM messages").get().n, 1);
    const result = retry.complete(() => ({ content: "answer", id: "assistant" }));
    assert.deepEqual(claimAiOperation(db, scope, 1_000, prepare), { replay: true, result });
    assert.equal(preparations, 2);
    assert.throws(() => claimAiOperation(db, { ...scope, payload: { content: "different" } }, 1_000, prepare), { code: "CONFLICT" });
    assert.throws(() => claimAiOperation(db, { ...scope, key: "bad" }, 1_000, prepare), { code: "VALIDATION_ERROR" });
  } finally { db.close(); }
});

test("expired lease recovery fences late results and late failure writes", () => {
  const db = fixture();
  try {
    const old = claimAiOperation(db, scope, 1_000, id => id);
    const row = JSON.parse(db.prepare("SELECT response_json FROM api_idempotency_records").get().response_json);
    db.prepare("UPDATE api_idempotency_records SET response_json = ?").run(JSON.stringify({ ...row, until: 0 }));
    const next = claimAiOperation(db, scope, 1_000, id => id);
    let writes = 0;
    assert.throws(() => old.complete(() => ++writes), { code: "CONFLICT" });
    old.fail();
    assert.equal(writes, 0);
    assert.equal(next.complete(() => "new result"), "new result");
    assert.equal(claimAiOperation(db, scope, 1_000, () => { throw Error("no provider"); }).result, "new result");
  } finally { db.close(); }
});

test("message and operation completion roll back together when persistence or response bounds fail", () => {
  const db = fixture();
  try {
    const op = claimAiOperation(db, scope, 1_000, id => id);
    assert.throws(() => op.complete(() => { db.exec("INSERT INTO messages VALUES ('assistant', 'partial')"); throw Error("write failed"); }));
    assert.equal(db.prepare("SELECT count(*) n FROM messages").get().n, 0);
    assert.throws(() => op.complete(() => "a".repeat(512 * 1024)), { code: "UPSTREAM_ERROR" });
    op.fail();
    assert.equal(claimAiOperation(db, scope, 1_000, () => "recovered").replay, false);
  } finally { db.close(); }
});

test("per-owner concurrency is bounded while completed replay and released retries remain available", () => {
  const db = fixture();
  try {
    const ops = [0, 1, 2].map(i => claimAiOperation(db, { ...scope, key: `bounded-key-${i}` }, 1_000, () => i));
    assert.throws(() => claimAiOperation(db, { ...scope, key: 'bounded-key-3' }, 1_000, () => 3), { code: "SERVICE_UNAVAILABLE" });
    ops[0].complete(() => 'completed');
    claimAiOperation(db, { ...scope, key: 'bounded-key-3' }, 1_000, () => 3);
    assert.equal(claimAiOperation(db, { ...scope, key: 'bounded-key-0' }, 1_000, () => 0).result, 'completed');
    ops[1].fail();
    assert.equal(claimAiOperation(db, { ...scope, key: 'bounded-key-1' }, 1_000, () => 1).replay, false);
  } finally { db.close(); }
});
