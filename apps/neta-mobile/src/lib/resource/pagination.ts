type Page<T> = { items: T[]; pageInfo: { hasNextPage: boolean; nextCursor: string | null } };
type Result<P> = { data: P; fromCache: boolean; isStale: boolean };

// Relation pickers and project sublists must not silently omit later pages.
export async function collectResourcePages<P extends Page<{ id: string }>, R extends Result<P>>(
  fetchPage: (cursor?: string) => Promise<R>,
): Promise<R> {
  let result = await fetchPage();
  const seen = new Set<string>();
  while (result.data.pageInfo.hasNextPage) {
    const cursor = result.data.pageInfo.nextCursor;
    if (!cursor || seen.has(cursor) || seen.size >= 1000) throw new Error('Pagination cursor ilerlemiyor.');
    seen.add(cursor);
    const next = await fetchPage(cursor);
    result = { ...next, fromCache: result.fromCache || next.fromCache, isStale: result.isStale || next.isStale,
      data: { ...next.data, ...appendResourcePage(result.data, next.data) } };
  }
  return result;
}
export function appendResourcePage<T extends { id: string }>(current: Page<T> | null, next: Page<T>): Page<T> {
  const items = new Map((current?.items ?? []).map((item) => [item.id, item]));
  for (const item of next.items) items.set(item.id, item);
  return { items: [...items.values()], pageInfo: next.pageInfo };
}
