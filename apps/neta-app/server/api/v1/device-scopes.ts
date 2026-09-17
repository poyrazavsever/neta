// Device access is opt-in at the v1 boundary. Unmapped surfaces fail closed.
export function deviceScopesForRoute(path: readonly string[], method: string): readonly string[] {
  const action = method === "GET" || method === "HEAD" ? "read" : "write";
  // AI context can expose private workspace data. A mutation scope alone must
  // never grant permission to send that data to the configured provider.
  if (path[0] === "chat") return [action === "read" ? "settings:read" : "settings:write", "clients:read", "projects:read", "tasks:read", "finance:read", "journal:read"];
  if (path.join("/") === "finance/analysis") return ["settings:read", "finance:read"];
  if (path[0] === "projects" && path[2] === "risk-analysis") return ["settings:read", "projects:read", "tasks:read", "clients:read"];
  if (["clients", "tasks", "calendar", "finance", "journal"].includes(path[0])) {
    return [`${path[0]}:${action}`];
  }
  if (path[0] === "projects") {
    return [path[2] === "assets" ? `files:${action}` : `projects:${action}`];
  }
  if (path[0] === "files") return [`files:${action}`];
  if (path[0] === "settings" || path[0] === "pairing" || path[0] === "device-sessions") {
    return [`settings:${action}`];
  }
  if (path[0] === "me") return [action === "read" ? "profile:read" : "settings:write"];
  if (path.join("/") === "dashboard/overview" && action === "read") {
    return ["clients:read", "projects:read", "tasks:read", "calendar:read", "finance:read", "journal:read"];
  }
  return [];
}
