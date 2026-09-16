// Transient request state only: never persisted to the resource cache or logs.
export function createMutationCoordinator(retentionMs = 10 * 60_000) {
  const pending = new Map<string, { key: string; expiresAt: number; request?: Promise<unknown> }>();
  return {
    clear(instanceId: string) {
      for (const id of pending.keys()) if (id.startsWith(`${instanceId}\n`)) pending.delete(id);
    },
    async run<T>(scope: string, payload: unknown, proposedKey: string, execute: (key: string) => Promise<T>): Promise<T> {
      const now = Date.now();
      for (const [id, value] of pending) if (!value.request && value.expiresAt <= now) pending.delete(id);
      const id = `${scope}\n${JSON.stringify(payload)}`;
      let entry = pending.get(id);
      if (entry?.request) return entry.request as Promise<T>;
      if (!entry) {
        entry = { key: proposedKey, expiresAt: now + retentionMs };
        pending.set(id, entry);
      }
      const current = entry;
      current.request = Promise.resolve().then(() => execute(current.key));
      try {
        const result = await current.request as T;
        if (pending.get(id) === current) pending.delete(id);
        return result;
      } catch (error) {
        delete current.request;
        throw error;
      }
    },
  };
}

export const mutationRequests = createMutationCoordinator();
