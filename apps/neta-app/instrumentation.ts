export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs" || process.env.NEXT_PHASE === "phase-production-build") return;

  const { getSqliteConnection } = await import("./server/db/client");
  const { maintainDeviceSessions, startDeviceMaintenance } = await import("./server/auth/device-maintenance");
  const runtime = globalThis as typeof globalThis & { __netaDeviceMaintenanceTimer?: { unref(): void } };
  if (runtime.__netaDeviceMaintenanceTimer) return;
  runtime.__netaDeviceMaintenanceTimer = startDeviceMaintenance({
    run: () => { maintainDeviceSessions(getSqliteConnection().sqlite); },
    schedule: (callback, intervalMs) => setInterval(callback, intervalMs),
    // Avoid SQL/credential details in logs; the next interval retries the job.
    onError: () => { console.error("Device session maintenance failed; retry scheduled."); },
  });
}
