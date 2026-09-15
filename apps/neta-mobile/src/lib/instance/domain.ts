import { NetaClientError } from '../api/errors.ts';

type AppEnvironment = 'development' | 'preview' | 'production';

export type NormalizedOrigin = {
  isLocalDevelopment: boolean;
  origin: string;
};

export type InstanceConnectInput = NormalizedOrigin & {
  source: 'domain' | 'qr';
  pairingSecret?: string;
};

type NormalizeOptions = {
  environment?: AppEnvironment;
};

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '10.0.2.2', '0.0.0.0']);

export function normalizeNetaOrigin(
  input: string,
  options: NormalizeOptions = {},
): NormalizedOrigin {
  const environment = options.environment ?? 'production';
  const trimmed = input.trim();

  if (!trimmed) {
    throw new NetaClientError('INVALID_DOMAIN', 'Neta domain adresi gerekli.');
  }

  if (/\s/.test(trimmed)) {
    throw new NetaClientError('INVALID_DOMAIN', 'Domain boşluk içeremez.');
  }

  const withProtocol = /^[a-z][a-z\d+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  const url = parseUrl(withProtocol);

  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    throw new NetaClientError('INVALID_DOMAIN', 'Yalnız HTTP veya HTTPS adresleri desteklenir.');
  }

  if (url.username || url.password) {
    throw new NetaClientError('INVALID_DOMAIN', 'Domain kullanıcı bilgisi içeremez.');
  }

  if (url.pathname !== '/' || url.search || url.hash) {
    throw new NetaClientError('INVALID_DOMAIN', 'Yalnız origin girin; path, query veya fragment kullanmayın.');
  }

  const isLocalDevelopment = isLocalHost(url.hostname);

  if (url.protocol === 'http:' && environment === 'production') {
    throw new NetaClientError('UNTRUSTED_ORIGIN', 'Production build HTTP instance adresine bağlanamaz.');
  }

  if (url.protocol === 'http:' && !isLocalDevelopment && environment !== 'development') {
    throw new NetaClientError('UNTRUSTED_ORIGIN', 'HTTP yalnız development ortamında kullanılabilir.');
  }

  url.hash = '';
  url.pathname = '';
  url.search = '';

  return {
    isLocalDevelopment,
    origin: url.origin,
  };
}

export function parseInstanceConnectInput(
  input: string,
  options: NormalizeOptions = {},
): InstanceConnectInput {
  const trimmed = input.trim();
  if (/^neta:\/\//i.test(trimmed)) {
    const url = parseUrl(trimmed);
    const isPair = url.hostname === 'pair';
    if ((!isPair && url.hostname !== 'connect') || (url.pathname !== '' && url.pathname !== '/') || url.hash ||
      [...url.searchParams.keys()].some((key) => key !== 'origin' && !(isPair && key === 'secret'))) {
      throw new NetaClientError('INVALID_DOMAIN', 'Neta bağlantı QR’ı geçersiz.');
    }
    const origin = url.searchParams.get('origin');
    if (!origin) throw new NetaClientError('INVALID_DOMAIN', 'Neta bağlantı QR’ı origin içermiyor.');
    const pairingSecret = isPair ? url.searchParams.get('secret') : null;
    if (isPair && !pairingSecret) throw new NetaClientError('INVALID_DOMAIN', 'Pairing QR’ı secret içermiyor.');
    return { ...normalizeNetaOrigin(origin, options), source: 'qr', ...(pairingSecret ? { pairingSecret } : {}) };
  }
  return { ...normalizeNetaOrigin(trimmed, options), source: 'domain' };
}

export function isSameTrustedOrigin(candidate: string, trustedOrigin: string): boolean {
  return parseUrl(candidate).origin === parseUrl(trustedOrigin).origin;
}

function isLocalHost(hostname: string): boolean {
  return LOCAL_HOSTS.has(hostname.toLowerCase()) || hostname.endsWith('.localhost');
}

function parseUrl(value: string): URL {
  try {
    return new URL(value);
  } catch {
    throw new NetaClientError('INVALID_DOMAIN', 'Geçerli bir Neta domain adresi girin.');
  }
}
