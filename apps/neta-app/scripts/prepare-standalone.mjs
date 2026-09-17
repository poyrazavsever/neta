import { cp, mkdir, stat, readdir, unlink, rm, realpath } from "node:fs/promises";
import path from "node:path";

const rootDir = process.cwd();
const distDir = process.env.NEXT_DIST_DIR?.trim() || ".next";
const standaloneDir = path.join(rootDir, distDir, "standalone");
const standaloneAppDir = path.join(standaloneDir, "apps", "neta-app");

async function requireDirectory(directory, label) {
  const info = await stat(directory).catch(() => null);

  if (!info?.isDirectory()) {
    throw new Error(`${label} bulunamadı: ${directory}`);
  }
}

await requireDirectory(standaloneDir, "Next.js standalone çıktısı");
await requireDirectory(standaloneAppDir, "Neta App standalone çıktısı");
await requireDirectory(path.join(rootDir, distDir, "static"), "Next.js static çıktısı");
await requireDirectory(path.join(rootDir, "public"), "Public dizini");

await mkdir(path.join(standaloneAppDir, distDir), { recursive: true });
await cp(path.join(rootDir, distDir, "static"), path.join(standaloneAppDir, distDir, "static"), {
  recursive: true,
  force: true,
});
await cp(path.join(rootDir, "public"), path.join(standaloneAppDir, "public"), {
  recursive: true,
  force: true,
});
await cp(path.join(rootDir, "server/db/migrations"), path.join(standaloneAppDir, "server/db/migrations"), {
  recursive: true,
  force: true,
});

// Remove only a generated copy; never follow a link to the runtime volume.
const packagedDataDir = path.resolve(standaloneAppDir, ".data");
const packagedDataStat = await stat(packagedDataDir).catch(() => null);
if (packagedDataStat) {
  if (path.dirname(packagedDataDir) !== standaloneAppDir || await realpath(packagedDataDir) !== packagedDataDir) {
    throw new Error("Refusing to remove a linked runtime data directory from the build.");
  }
  await rm(packagedDataDir, { recursive: true, force: true });
}

// Next can explicitly copy .env/.env.production independently of NFT excludes.
// Runtime configuration is supplied by the host, never from a packaged env file.
for (const entry of await readdir(standaloneAppDir, { withFileTypes: true })) {
  if (entry.name.startsWith(".env") && (entry.isFile() || entry.isSymbolicLink())) {
    await unlink(path.join(standaloneAppDir, entry.name));
  }
}

console.log("Standalone runtime assets prepared.");
