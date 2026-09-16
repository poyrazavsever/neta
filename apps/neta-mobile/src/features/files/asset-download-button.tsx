import { useRef, useState } from 'react';
import { View } from 'react-native';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { Button, Toast } from '@/components/ui';
import { authenticatedFileRequest, bindNativeActor } from '@/lib/auth/native-auth-client';
import { NetaClientError, toClientError } from '@/lib/api/errors';
import { useSession } from '@/providers/session-provider';
import { useAppEnvironment } from '@/providers/app-environment-provider';
import { resolveFileDownloadUrl } from './download-policy';

type DownloadableAsset = { id: string; mimeType: string; name: string; url: string; sizeBytes: number };

export function AssetDownloadButton({ asset }: { asset: DownloadableAsset }) {
  const session = useSession(); const { isOnline } = useAppEnvironment();
  const busy = useRef(false);
  const [loading, setLoading] = useState(false); const [error, setError] = useState<string | null>(null);
  const open = async () => {
    if (busy.current || session.status !== 'authenticated') return;
    busy.current = true; setLoading(true); setError(null);
    let file: File | undefined;
    try {
      if (!await Sharing.isAvailableAsync()) throw new NetaClientError('UNKNOWN', 'Bu cihazda dosya paylaşımı kullanılamıyor.');
      const url = resolveFileDownloadUrl(session.instance.origin, asset.id, asset.url);
      const auth = await bindNativeActor(session.instance, session.user);
      const response = await authenticatedFileRequest(session.instance, url, session.user);
      if (response.headers.get('content-type')?.split(';')[0] !== asset.mimeType || asset.sizeBytes <= 0 || asset.sizeBytes > 10 * 1024 * 1024
        || Number(response.headers.get('content-length')) !== asset.sizeBytes) {
        throw new NetaClientError('SERVER_ERROR', 'Dosya yanıtı beklenen biçimde değil.');
      }
      const bytes = new Uint8Array(await response.arrayBuffer());
      auth.assertCurrent();
      if (bytes.byteLength !== asset.sizeBytes) throw new NetaClientError('SERVER_ERROR', 'Dosya eksik indirildi.');
      const extension = asset.mimeType === 'application/pdf' ? 'pdf' : asset.mimeType.split('/')[1] ?? 'bin';
      file = new File(Paths.cache, `neta-download-${Date.now()}-${Math.random().toString(36).slice(2)}.${extension.replace(/[^a-z0-9]/gi, '')}`);
      file.create(); file.write(bytes);
      await Sharing.shareAsync(file.uri, { dialogTitle: asset.name, mimeType: asset.mimeType });
    } catch (value) { setError(toClientError(value, 'Dosya açılamadı.').message); }
    finally {
      try { if (file?.exists) file.delete(); }
      catch (value) { setError(toClientError(value, 'Geçici dosya temizlenemedi.').message); }
      finally { busy.current = false; setLoading(false); }
    }
  };
  return <View><Button disabled={!isOnline} loading={loading} onPress={() => void open()} variant="secondary">{asset.name}</Button>{error ? <Toast message={error} tone="danger" /> : null}</View>;
}
