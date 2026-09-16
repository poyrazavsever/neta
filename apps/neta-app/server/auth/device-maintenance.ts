import type Database from "better-sqlite3";

export const DEVICE_IDLE_TTL_MS = 30 * 24 * 60 * 60_000;
export const DEVICE_RETENTION_MS = 30 * 24 * 60 * 60_000;
export const CHALLENGE_RETENTION_MS = 24 * 60 * 60_000;
export const DEVICE_MAINTENANCE_INTERVAL_MS = 60 * 60_000;
const BATCH_SIZE = 500;

/** Runs outside request handlers; active-family history is never pruned. */
export function maintainDeviceSessions(sqlite: Database.Database, now = Date.now()) {
  return sqlite.transaction(() => {
    const expired = sqlite.prepare(`
      UPDATE device_sessions SET status = 'expired',
        revoked_at = min(refresh_expires_at, last_used_at + @idleTtl)
      WHERE id IN (
        SELECT id FROM device_sessions WHERE status = 'active'
          AND (refresh_expires_at <= @now OR last_used_at <= @idleCutoff)
        ORDER BY refresh_expires_at, id LIMIT @batch
      )
    `).run({ now, idleTtl: DEVICE_IDLE_TTL_MS, idleCutoff: now - DEVICE_IDLE_TTL_MS, batch: BATCH_SIZE }).changes;
    const replaysDeleted = sqlite.prepare(`
      DELETE FROM device_refresh_replays WHERE device_session_id IN (
        SELECT r.device_session_id FROM device_refresh_replays r
        JOIN device_sessions s ON s.id = r.device_session_id
        WHERE r.expires_at <= ? OR s.status != 'active' OR s.refresh_expires_at <= ? OR s.last_used_at <= ?
        ORDER BY r.expires_at, r.device_session_id LIMIT ?
      )
    `).run(now, now, now - DEVICE_IDLE_TTL_MS, BATCH_SIZE).changes;
    // Cascade removes consumed digests only once their closed session is retired.
    const sessionsDeleted = sqlite.prepare(`
      DELETE FROM device_sessions WHERE id IN (
        SELECT id FROM device_sessions
        WHERE status IN ('expired', 'revoked', 'compromised')
          AND revoked_at IS NOT NULL AND revoked_at <= ?
        ORDER BY revoked_at, id LIMIT ?
      )
    `).run(now - DEVICE_RETENTION_MS, BATCH_SIZE).changes;
    const challengesDeleted = sqlite.prepare(`
      DELETE FROM pairing_challenges WHERE id IN (
        SELECT id FROM pairing_challenges WHERE expires_at <= ?
        ORDER BY expires_at, id LIMIT ?
      )
    `).run(now - CHALLENGE_RETENTION_MS, BATCH_SIZE).changes;
    return { expired, replaysDeleted, sessionsDeleted, challengesDeleted };
  }).immediate();
}

type MaintenanceTimer = { unref(): void };
type MaintenanceRuntime = {
  run(): void;
  onError(error: unknown): void;
  schedule(callback: () => void, intervalMs: number): MaintenanceTimer;
};

/** Startup errors block readiness; periodic errors are reported and retried. */
export function startDeviceMaintenance(runtime: MaintenanceRuntime) {
  runtime.run();
  const timer = runtime.schedule(() => {
    try { runtime.run(); } catch (error) { runtime.onError(error); }
  }, DEVICE_MAINTENANCE_INTERVAL_MS);
  timer.unref();
  return timer;
}
