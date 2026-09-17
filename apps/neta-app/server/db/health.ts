import "server-only";

import fs from "node:fs";
import path from "node:path";
import { ensureDataDirectories, getServerConfig } from "@/server/config";
import { getSqliteConnection } from "@/server/db/client";
import { assertMigrationState, readMigrationManifest } from "./migration-state.mjs";

export type ReadinessStatus = {
  ok: boolean;
  checks: {
    dataDirWritable: boolean;
    databaseReachable: boolean;
    migrationsApplied: boolean;
  };
  error?: string;
};

export function checkReadiness(): ReadinessStatus {
  const config = getServerConfig();
  const checks = {
    dataDirWritable: false,
    databaseReachable: false,
    migrationsApplied: false,
  };

  try {
    ensureDataDirectories(config);
    assertWritableDirectory(config.dataDir);
    checks.dataDirWritable = true;

    const { sqlite } = getSqliteConnection();
    sqlite.prepare("select 1 as ok").get();
    checks.databaseReachable = true;

    assertMigrationState(sqlite, readMigrationManifest(path.join(process.cwd(), "server/db/migrations")));
    checks.migrationsApplied = true;

    return {
      ok: true,
      checks,
    };
  } catch (error) {
    return {
      ok: false,
      checks,
      error: error instanceof Error ? error.message : "Unknown readiness error.",
    };
  }
}

function assertWritableDirectory(dir: string): void {
  const probePath = path.join(dir, `.neta-write-${process.pid}-${Date.now()}`);

  fs.writeFileSync(probePath, "ok", { encoding: "utf8", flag: "wx" });
  fs.unlinkSync(probePath);
}
