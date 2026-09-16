export function matchesNativeActor(value: unknown, expected: { id: string; role: string }): boolean {
  return Boolean(value && typeof value === 'object' && 'id' in value && 'role' in value
    && value.id === expected.id && value.role === expected.role);
}
