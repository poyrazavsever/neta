import type Database from "better-sqlite3";
export type MigrationManifest = { timestamp: number; hashes: string[] }[];
export function readMigrationManifest(directory: string): MigrationManifest;
export function assertMigrationState(sqlite: Database.Database, manifest: MigrationManifest, options?: { allowPending?: boolean; allowEmpty?: boolean }): void;
