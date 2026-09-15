import Constants from 'expo-constants';

const supportedEnvironments = ['development', 'preview', 'production'] as const;

export type AppEnvironment = (typeof supportedEnvironments)[number];

function isAppEnvironment(value: unknown): value is AppEnvironment {
  return typeof value === 'string' && supportedEnvironments.includes(value as AppEnvironment);
}

const configuredEnvironment = Constants.expoConfig?.extra?.environment;
const configuredOrigin = Constants.expoConfig?.extra?.netaOrigin;

export const appEnvironment: AppEnvironment = isAppEnvironment(configuredEnvironment)
  ? configuredEnvironment
  : 'development';

export const defaultNetaOrigin = readConfiguredOrigin(configuredOrigin);

function readConfiguredOrigin(value: unknown): string | null {
  if (typeof value !== 'string' || !value.trim()) {
    return null;
  }

  const url = new URL(value);
  if ((url.protocol !== 'https:' && url.protocol !== 'http:') || url.pathname !== '/' || url.search || url.hash) {
    throw new Error('Neta origin build yapılandırması geçersiz.');
  }

  return url.origin;
}
