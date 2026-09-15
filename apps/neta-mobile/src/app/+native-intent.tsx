export function redirectSystemPath({ path }: { initial: boolean; path: string }): string {
  if (/^neta:\/\/(?:connect|pair)(?:\?|$)/i.test(path)) {
    return `/onboarding?connect=${encodeURIComponent(path)}`;
  }
  return '/';
}
