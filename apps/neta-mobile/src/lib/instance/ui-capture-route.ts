// Opt-in developer navigation only. Authentication/actor layout guards still apply.
const screens = new Set(['onboarding', 'login', 'client', 'client-activity', 'calendar-event', 'finance-record',
  'appearance-settings', 'ai-settings', 'owner-preferences', 'journal-entry', 'invitation', 'owner-profile',
  'owner-security', 'project-risk', 'project', 'task', 'workspace-settings', 'portal-security', 'portal-revision', 'portal-profile']);
export function parseUiCaptureRoute(value: string): string | null {
  try {
    const url = new URL(value);
    if (url.protocol !== 'neta:' || url.hostname !== 'ui-capture' || url.username || url.password || url.hash ||
        [...url.searchParams.keys()].some((key) => key !== 'route')) return null;
    const route = url.searchParams.get('route'); if (!route || !route.startsWith('/')) return null;
    const target = new URL(route, 'https://capture.invalid');
    if (target.origin !== 'https://capture.invalid' || target.hash) return null;
    const pathname = target.pathname;
    const allowed = pathname === '/' || screens.has(pathname.slice(1)) ||
      /^\/\(owner\)(?:\/(?:clients|projects|tasks)(?:\/[A-Za-z0-9_-]{1,100})?|\/(?:calendar|analytics|chat|files|finance|journal|locales|settings))?$/.test(pathname) ||
      /^\/\(portal\)(?:\/(?:projects)(?:\/[A-Za-z0-9_-]{1,100})?|\/(?:tasks|settings|revisions))?$/.test(pathname);
    const parameters = new Set(['clientId', 'projectId', 'taskId', 'recordId', 'date', 'entryDate', 'locale']);
    if (!allowed || [...target.searchParams].some(([key, val]) => !parameters.has(key) || !/^[A-Za-z0-9_-]{1,100}$/.test(val))) return null;
    return route;
  } catch { return null; }
}
