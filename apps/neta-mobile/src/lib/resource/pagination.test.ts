import assert from 'node:assert/strict';
import test from 'node:test';
import { appendResourcePage, collectResourcePages } from './pagination.ts';
test('appending cursor pages retains prior rows, refreshes overlaps and advances the cursor', () => {
  const result = appendResourcePage({ items: [{ id: 'a', title: 'A' }, { id: 'b', title: 'old' }], pageInfo: { hasNextPage: true, nextCursor: 'page-2' } },
    { items: [{ id: 'b', title: 'new' }, { id: 'c', title: 'C' }], pageInfo: { hasNextPage: false, nextCursor: null } });
  assert.deepEqual(result.items, [{ id: 'a', title: 'A' }, { id: 'b', title: 'new' }, { id: 'c', title: 'C' }]);
  assert.deepEqual(result.pageInfo, { hasNextPage: false, nextCursor: null });
});
test('collecting relation pages follows cursor, retains metadata and stale evidence', async () => {
  const cursors: (string | undefined)[] = [];
  const result = await collectResourcePages(async (cursor) => {
    cursors.push(cursor);
    return { data: { items: [{ id: cursor ? 'b' : 'a' }], pageInfo: { hasNextPage: !cursor, nextCursor: cursor ? null : 'next' }, locale: 'tr' }, fromCache: !cursor, isStale: !cursor };
  });
  assert.deepEqual(cursors, [undefined, 'next']); assert.deepEqual(result.data.items, [{ id: 'a' }, { id: 'b' }]);
  assert.equal(result.data.locale, 'tr'); assert.equal(result.isStale, true); assert.equal(result.fromCache, true);
});
test('a repeating or missing cursor fails instead of silently truncating the collection', async () => {
  await assert.rejects(collectResourcePages(async () => ({ data: { items: [], pageInfo: { hasNextPage: true, nextCursor: 'same' } }, fromCache: false, isStale: false })), /ilerlemiyor/);
  await assert.rejects(collectResourcePages(async () => ({ data: { items: [], pageInfo: { hasNextPage: true, nextCursor: null } }, fromCache: false, isStale: false })), /ilerlemiyor/);
});
