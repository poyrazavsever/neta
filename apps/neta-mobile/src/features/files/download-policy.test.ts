import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveFileDownloadUrl } from './download-policy.ts';

test('downloads use the versioned authenticated surface, including old cached file URLs', () => {
  assert.equal(resolveFileDownloadUrl('https://neta.test', 'file-1', 'https://neta.test/api/files/file-1'), 'https://neta.test/api/v1/files/file-1');
  assert.equal(resolveFileDownloadUrl('https://neta.test', 'file-1', 'https://neta.test/api/v1/files/file-1'), 'https://neta.test/api/v1/files/file-1');
});
test('rejects foreign origins, mismatched file IDs, embedded credentials and query secrets', () => {
  for (const url of ['https://other.test/api/v1/files/file-1', 'https://neta.test/api/v1/files/file-2',
    'https://user:password@neta.test/api/v1/files/file-1', 'https://neta.test/api/v1/files/file-1?token=secret']) {
    assert.throws(() => resolveFileDownloadUrl('https://neta.test', 'file-1', url));
  }
});
