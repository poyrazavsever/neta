export function compareSemver(left: string, right: string): number {
  const leftParts = parseSemver(left) ?? { core: ['0', '0', '0'], prerelease: [] };
  const rightParts = parseSemver(right) ?? { core: ['0', '0', '0'], prerelease: [] };

  for (let index = 0; index < 3; index += 1) {
    const difference = compareNumeric(leftParts.core[index] ?? '0', rightParts.core[index] ?? '0');
    if (difference !== 0) return difference;
  }
  if (!leftParts.prerelease.length && rightParts.prerelease.length) return 1;
  if (leftParts.prerelease.length && !rightParts.prerelease.length) return -1;
  for (let index = 0; index < Math.max(leftParts.prerelease.length, rightParts.prerelease.length); index++) {
    const a = leftParts.prerelease[index]; const b = rightParts.prerelease[index];
    if (a === undefined) return -1;
    if (b === undefined) return 1;
    if (a === b) continue;
    const aNumeric = /^\d+$/.test(a); const bNumeric = /^\d+$/.test(b);
    if (aNumeric && bNumeric) return compareNumeric(a, b);
    if (aNumeric !== bNumeric) return aNumeric ? -1 : 1;
    return a < b ? -1 : 1;
  }
  return 0;
}

export function isCompatibleClientVersion(current: string, minimum: string | null): boolean {
  return parseSemver(current, false) !== null && (minimum === null ||
    (parseSemver(minimum, false) !== null && compareSemver(current, minimum) >= 0));
}

export function isSupportedApiVersion(value: string): boolean {
  const match = /^v?(\d+)(?:\.\d+){0,2}$/.exec(value.trim());
  return match?.[1] === '1';
}

function parseSemver(value: string, allowPartial = true): { core: string[]; prerelease: string[] } | null {
  const match = /^(0|[1-9]\d*)(?:\.(0|[1-9]\d*))?(?:\.(0|[1-9]\d*))?(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/.exec(value.trim());
  if (!match || (!allowPartial && (!match[2] || !match[3]))) return null;
  const prerelease = match[4]?.split('.') ?? [];
  if (prerelease.some(part => /^\d+$/.test(part) && part.length > 1 && part.startsWith('0'))) return null;
  return { core: [match[1] ?? '0', match[2] ?? '0', match[3] ?? '0'], prerelease };
}

function compareNumeric(a: string, b: string): number {
  if (a.length !== b.length) return a.length < b.length ? -1 : 1;
  return a === b ? 0 : a < b ? -1 : 1;
}
