export class StaleAuthSessionError extends Error {
  constructor() { super('Authentication session changed.'); }
}

type State<T> = { generation: number; writes: Promise<void>; refresh: Promise<T> | undefined };

// Network requests may finish after logout or a new login. Serialize credential
// writes with clearing, and reject results belonging to an older session.
export function createSessionCoordinator<T>() {
  const states = new Map<string, State<T>>();
  function state(id: string): State<T> {
    let value = states.get(id);
    if (!value) {
      value = { generation: 0, writes: Promise.resolve(), refresh: undefined };
      states.set(id, value);
    }
    return value;
  }
  const current = (id: string, generation: number) => state(id).generation === generation;
  return {
    snapshot: (id: string) => state(id).generation,
    current,
    invalidate(id: string) {
      const value = state(id);
      value.generation += 1;
      value.refresh = undefined;
      return value.generation;
    },
    async commit(id: string, generation: number, write: () => Promise<void>): Promise<boolean> {
      const value = state(id);
      const pending = value.writes.then(async () => {
        if (!current(id, generation)) return false;
        await write();
        return current(id, generation);
      });
      value.writes = pending.then(() => undefined, () => undefined);
      return pending;
    },
    refresh(id: string, generation: number, run: () => Promise<T>): Promise<T> {
      if (!current(id, generation)) return Promise.reject(new StaleAuthSessionError());
      const value = state(id);
      if (value.refresh) return value.refresh;
      const pending = Promise.resolve().then(run).finally(() => {
        if (value.refresh === pending) value.refresh = undefined;
      });
      value.refresh = pending;
      return pending;
    },
  };
}
