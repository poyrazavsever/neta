export function didInstanceIdentityChange(
  previous: { instanceId: string; origin: string } | null,
  next: { instanceId: string; origin: string },
): boolean {
  return Boolean(previous && (
    previous.origin === next.origin && previous.instanceId !== next.instanceId ||
    previous.instanceId === next.instanceId && previous.origin !== next.origin
  ));
}
