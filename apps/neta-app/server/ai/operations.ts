import { createHash, randomUUID } from "node:crypto";
import type Database from "better-sqlite3";
import { DomainError } from "../domain/errors";

type Scope = { actorId: string; route: string; key: string; payload: unknown };
type RecordRow = { payload_hash: string; response_json: string };
type State = { operation: "ai.v1"; status: "pending" | "failed" | "completed"; lease: string; until: number; result?: unknown };

/** Short SQLite transactions surround the provider call; no transaction spans I/O. */
export function claimAiOperation<T>(db: Database.Database, scope: Scope, timeout: number, prepare: (messageId: string) => T) {
  if (!/^[A-Za-z0-9][A-Za-z0-9._:-]{7,127}$/.test(scope.key)) {
    throw new DomainError("VALIDATION_ERROR", "Geçerli bir Idempotency-Key zorunludur.");
  }
  const args = [scope.actorId, scope.route, scope.key];
  const payloadHash = hash(JSON.stringify(scope.payload));
  const messageId = `ai-user-${hash(JSON.stringify(args))}`;
  return db.transaction(() => {
    const row = db.prepare("SELECT payload_hash, response_json FROM api_idempotency_records WHERE actor_user_id = ? AND method = 'POST' AND route = ? AND idempotency_key = ?").get(...args) as RecordRow | undefined;
    if (row && row.payload_hash !== payloadHash) throw new DomainError("CONFLICT", "Idempotency-Key farklı bir istek için kullanıldı.");
    const old = row ? JSON.parse(row.response_json) as State : null;
    if (old?.status === "completed") return { replay: true as const, result: old.result };
    if (old?.status === "pending" && old.until > Date.now()) throw new DomainError("CONFLICT", "AI isteği halen işleniyor; aynı anahtarla yeniden deneyin.");
    const active = db.prepare(`SELECT count(*) AS n FROM api_idempotency_records WHERE actor_user_id = ?
      AND json_extract(response_json, '$.operation') = 'ai.v1' AND json_extract(response_json, '$.status') = 'pending'
      AND json_extract(response_json, '$.until') > ?`).get(scope.actorId, Date.now()) as { n: number };
    if (active.n >= 3) throw new DomainError("SERVICE_UNAVAILABLE", "En fazla üç AI isteği aynı anda işlenebilir.");
    const prepared = prepare(messageId);
    const state: State = { operation: "ai.v1", status: "pending", lease: randomUUID(), until: Date.now() + timeout + 30_000 };
    const pendingJson = JSON.stringify(state);
    db.prepare(`INSERT INTO api_idempotency_records (actor_user_id, method, route, idempotency_key, payload_hash, response_json, created_at)
      VALUES (?, 'POST', ?, ?, ?, ?, ?) ON CONFLICT (actor_user_id, method, route, idempotency_key)
      DO UPDATE SET response_json = excluded.response_json, created_at = excluded.created_at`).run(...args, payloadHash, pendingJson, Date.now());
    db.prepare("DELETE FROM api_idempotency_records WHERE created_at < ?").run(Date.now() - 7 * 24 * 60 * 60_000);
    const update = (next: State) => db.prepare("UPDATE api_idempotency_records SET response_json = ? WHERE actor_user_id = ? AND method = 'POST' AND route = ? AND idempotency_key = ? AND response_json = ?")
      .run(JSON.stringify(next), ...args, pendingJson);
    return {
      replay: false as const, prepared,
      complete<R>(persist: () => R): R {
        return db.transaction(() => {
          const current = db.prepare("SELECT response_json FROM api_idempotency_records WHERE actor_user_id = ? AND method = 'POST' AND route = ? AND idempotency_key = ?").get(...args) as RecordRow | undefined;
          if (current?.response_json !== pendingJson) throw new DomainError("CONFLICT", "AI işlemi başka bir deneme tarafından devralındı.");
          const result = persist();
          if (Buffer.byteLength(JSON.stringify(result)) > 512 * 1024) throw new DomainError("UPSTREAM_ERROR", "AI yanıtı boyut sınırını aştı.");
          update({ ...state, status: "completed", result });
          return result;
        }).immediate();
      },
      fail() { update({ ...state, status: "failed" }); },
    };
  }).immediate();
}

function hash(value: string) { return createHash("sha256").update(value).digest("hex"); }
