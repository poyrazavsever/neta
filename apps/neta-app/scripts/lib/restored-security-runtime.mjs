import { execFileSync, spawn } from "node:child_process";
import fs from "node:fs";
import net from "node:net";
import path from "node:path";

/** Boots a second loopback backend against the disposable restore target. */
export async function withRestoredSecurityRuntime({ env, restoredDir, standaloneDistDir }, verify) {
  const root = path.resolve(process.cwd());
  const dataDir = path.resolve(restoredDir);
  const relativeData = path.relative(path.join(root, ".data"), dataDir);
  if (!relativeData || relativeData.startsWith("..") || path.isAbsolute(relativeData)) {
    throw new Error("Restore acceptance requires a disposable target inside the app .data directory.");
  }
  const port = await availablePort();
  const baseUrl = `http://127.0.0.1:${port}`;
  const distDir = `.next-restored-security-${process.pid}-${Date.now()}`;
  const distPath = path.resolve(root, distDir);
  const standalonePath = standaloneDistDir ? path.resolve(root, standaloneDistDir, "standalone/apps/neta-app/server.js") : null;
  if (standalonePath && (path.isAbsolute(path.relative(root, standalonePath)) || path.relative(root, standalonePath).startsWith(".."))) {
    throw new Error("Standalone acceptance artifact must be inside the app directory.");
  }
  const runtimeEnv = {
    ...env, NODE_ENV: standalonePath ? "production" : "development", DATA_DIR: dataDir, DATABASE_PATH: path.join(dataDir, "neta.db"),
    APP_URL: baseUrl, BETTER_AUTH_URL: baseUrl, NEXT_PUBLIC_SITE_URL: baseUrl, TRUSTED_ORIGINS: baseUrl,
    NEXT_DIST_DIR: standaloneDistDir ?? distDir, NEXT_TELEMETRY_DISABLED: "1", PORT: String(port), HOSTNAME: "127.0.0.1",
  };
  execFileSync(process.execPath, ["scripts/migrate.mjs"], { cwd: root, env: runtimeEnv, stdio: "pipe" });
  const server = spawn(process.execPath, standalonePath ? [standalonePath] : ["node_modules/next/dist/bin/next", "dev", "--hostname", "127.0.0.1", "--port", String(port)], {
    cwd: root, env: runtimeEnv, stdio: ["ignore", "pipe", "pipe"], detached: process.platform !== "win32",
  });
  let log = "";
  let spawnError;
  server.once("error", (error) => { spawnError = error; });
  for (const stream of [server.stdout, server.stderr]) stream.on("data", (chunk) => { log += chunk; });
  try {
    const deadline = Date.now() + 60_000;
    let ready = false;
    while (Date.now() < deadline) {
      if (spawnError || server.exitCode !== null) throw new Error("Restored acceptance runtime exited before readiness.");
      try {
        const response = await fetch(`${baseUrl}/api/health/ready`, { signal: AbortSignal.timeout(2000) });
        if (response.ok) { ready = true; break; }
      } catch {}
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
    if (!ready) throw new Error("Restored acceptance runtime readiness timed out.");
    return await verify({
      baseUrl,
      log: () => log,
      request: async (pathname, { method = "GET", body, headers = {}, cookie } = {}) => {
        const requestHeaders = { origin: baseUrl, ...headers };
        if (body !== undefined) requestHeaders["content-type"] = "application/json";
        if (cookie) requestHeaders.cookie = cookie;
        const response = await fetch(`${baseUrl}${pathname}`, {
          method, headers: requestHeaders, body: body === undefined ? undefined : JSON.stringify(body),
          redirect: "error", signal: AbortSignal.timeout(30_000),
        });
        return { response, payload: await response.json() };
      },
    });
  } finally {
    if (server.pid && server.exitCode === null) {
      if (process.platform === "win32") {
        try { execFileSync("taskkill", ["/PID", String(server.pid), "/T", "/F"], { stdio: "pipe" }); }
        catch { server.kill("SIGTERM"); }
      } else {
        try { process.kill(-server.pid, "SIGTERM"); } catch { server.kill("SIGTERM"); }
      }
      if (server.exitCode === null) await Promise.race([
        new Promise((resolve) => server.once("exit", resolve)),
        new Promise((resolve) => setTimeout(resolve, 5000)),
      ]);
    }
    // The test owns this exact generated build directory, never the data target.
    if (path.dirname(distPath) !== root || !path.basename(distPath).startsWith(".next-restored-security-")) {
      throw new Error("Unexpected restore acceptance build path.");
    }
    fs.rmSync(distPath, { recursive: true, force: true });
  }
}

function availablePort() {
  return new Promise((resolve, reject) => {
    const listener = net.createServer();
    listener.once("error", reject);
    listener.listen(0, "127.0.0.1", () => {
      const { port } = listener.address();
      listener.close((error) => error ? reject(error) : resolve(port));
    });
  });
}
