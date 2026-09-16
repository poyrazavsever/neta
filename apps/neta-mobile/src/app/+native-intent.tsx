import { parseUiCaptureRoute } from '@/lib/instance/ui-capture-route';

export function redirectSystemPath({ path }: { initial: boolean; path: string }): string {
  if (__DEV__ && process.env.EXPO_PUBLIC_NETA_UI_CAPTURE === '1') {
    const route = parseUiCaptureRoute(path);
    if (route) { console.info('[ui-assets] route', route); return route; }
  }
  if (/^neta:\/\/(?:connect|pair)(?:\?|$)/i.test(path)) {
    return `/onboarding?connect=${encodeURIComponent(path)}`;
  }
  return '/';
}
