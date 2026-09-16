import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const dataDir = path.join(process.cwd(), ".data", `phase3-storage-smoke-${Date.now()}`);
const databasePath = path.join(dataDir, "neta.db");
const env = { ...process.env, DATA_DIR: dataDir, DATABASE_PATH: databasePath };

fs.mkdirSync(dataDir, { recursive: true });
execFileSync(process.execPath, ["scripts/migrate.mjs"], { cwd: process.cwd(), env, stdio: "inherit" });
execFileSync(process.execPath, ["node_modules/typescript/bin/tsc", "-p", "tsconfig.phase3-smoke.json"], {
  cwd: process.cwd(),
  stdio: "inherit",
});
// Next resolves this marker to an empty module for server code. The standalone
// compiled smoke runs in Node; provide that marker only in its test output.
const serverOnlyDir = path.join(process.cwd(), ".next", "phase3-storage-smoke-dist", "node_modules", "server-only");
fs.mkdirSync(serverOnlyDir, { recursive: true });
fs.writeFileSync(path.join(serverOnlyDir, "index.js"), "module.exports = {};\n");
execFileSync(
  process.execPath,
  [path.join(".next", "phase3-storage-smoke-dist", "scripts", "phase3-storage-smoke.js"), dataDir, ...process.argv.slice(2)],
  { cwd: process.cwd(), stdio: "inherit" },
);
