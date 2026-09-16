import { NetaClientError } from '../../lib/api/errors.ts';

export function resolveFileDownloadUrl(origin: string, id: string, value: string): string {
  const url = new URL(value);
  const path = `/api/v1/files/${encodeURIComponent(id)}`;
  if (url.origin !== new URL(origin).origin || url.username || url.password || url.search || url.hash ||
      ![path, `/api/files/${encodeURIComponent(id)}`].includes(url.pathname)) {
    throw new NetaClientError('UNTRUSTED_ORIGIN', 'Dosya bağlantısı seçilen sunucuya ait değil.');
  }
  return new URL(path, origin).toString();
}
