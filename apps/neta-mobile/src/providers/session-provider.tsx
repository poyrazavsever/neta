import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { appEnvironment, defaultNetaOrigin } from '@/config/environment';
import { NetaClientError, toClientError } from '@/lib/api/errors';
import { createNativeAuthClient } from '@/lib/auth/native-auth-client';
import { discoverInstance, type DiscoveryStep } from '@/lib/instance/discovery';
import {
  clearInstanceSession,
  forgetInstance,
  getActiveInstance,
  saveDiscoveredInstance,
  updateStoredInstance,
} from '@/lib/instance/registry';
import { parseInstanceConnectInput } from '@/lib/instance/domain';
import type { DiscoveryResult, MeProfile, StoredInstance } from '@/lib/instance/types';
import { recordPerformanceSample } from '@/lib/performance/metrics';
import { clearResourceCacheForInstance, purgeLegacyResourceCache } from '@/lib/resource/resource-cache';

import { useAppEnvironment } from './app-environment-provider';
import { useTheme } from './theme-provider';

const SESSION_STALE_MS = 60_000;

type AuthenticatedSessionState = {
  discoveryStep: DiscoveryStep;
  error: NetaClientError | null;
  instance: StoredInstance;
  isBusy: boolean;
  role: MeProfile['role'];
  status: 'authenticated';
  user: MeProfile;
};

type UnauthenticatedSessionState = {
  discoveryStep: DiscoveryStep;
  error: NetaClientError | null;
  instance: StoredInstance | null;
  isBusy: boolean;
  role: null;
  status: 'loading' | 'unauthenticated';
  user: null;
};

type SessionState = UnauthenticatedSessionState | AuthenticatedSessionState;

type SessionContextValue = SessionState & {
  cancelInstanceConnection: () => void;
  confirmInstanceConnection: (pairingCode?: string) => Promise<boolean>;
  connectInstance: (input: string) => Promise<void>;
  forgetCurrentInstance: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  retryBootstrap: () => Promise<void>;
  updateInstance: (patch: Partial<StoredInstance>) => Promise<void>;
  pendingInstance: StoredInstance | null;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: PropsWithChildren) {
  const { appState, isOnline } = useAppEnvironment();
  const { setBrandColors, setColorMode } = useTheme();
  const lastSessionCheckAtRef = useRef(0);
  const [session, setSession] = useState<SessionState>(createLoadingState());
  const [pendingDiscovery, setPendingDiscovery] = useState<DiscoveryResult | null>(null);
  const pendingPairingSecretRef = useRef<string | null>(null);

  const applyInstanceBranding = useCallback((instance: StoredInstance | null) => {
    setBrandColors({ accent: instance?.accentColor ?? null, primary: instance?.primaryColor ?? null });
  }, [setBrandColors]);

  const applyUserPreferences = useCallback((user: MeProfile) => {
    if (user.preferences?.colorMode) setColorMode(user.preferences.colorMode);
  }, [setColorMode]);

  const bootstrap = useCallback(async () => {
    const startedAt = Date.now();
    setSession((current) => ({ ...toUnauthenticated(current), error: null, isBusy: true, status: 'loading' }));
    let instance = await getActiveInstance();

    try {
      await purgeLegacyResourceCache();
      const discoveryOrigin = instance?.origin ?? defaultNetaOrigin;
      if (isOnline && discoveryOrigin) {
        const result = await discoverInstance(discoveryOrigin, {
          onStep: (discoveryStep) => setSession((current) => ({
            ...toUnauthenticated(current), discoveryStep, error: null, isBusy: true, status: 'loading',
          })),
        });
        const saved = await saveDiscoveredInstance(result.instance, result.catalog);
        if (saved.instanceIdChanged && saved.previousInstanceId) {
          await clearResourceCacheForInstance(saved.previousInstanceId);
        }
        instance = result.instance;
      }

      applyInstanceBranding(instance);
      if (!instance) {
        setSession(createUnauthenticatedState(null));
        recordPerformanceSample('cold-shell', Date.now() - startedAt);
        return;
      }

      const user = await createNativeAuthClient(instance).getMe();
      applyUserPreferences(user);
      lastSessionCheckAtRef.current = Date.now();
      setSession(authenticatedState(instance, user));
      recordPerformanceSample('warm-shell', Date.now() - startedAt);
    } catch (error) {
      const clientError = toClientError(error, 'Neta hazırlanamadı.');
      if (instance && isSessionInvalidatingError(clientError)) {
        await clearResourceCacheForInstance(instance.instanceId);
        await clearInstanceSession(instance.instanceId);
      }
      setSession({
        ...createUnauthenticatedState(instance),
        error: clientError.code === 'AUTH_REQUIRED' ? null : clientError,
      });
      recordPerformanceSample('cold-shell', Date.now() - startedAt);
    }
  }, [applyInstanceBranding, applyUserPreferences, isOnline]);

  const connectInstance = useCallback(async (input: string) => {
    setPendingDiscovery(null);
    setSession((current) => ({ ...toUnauthenticated(current), error: null, isBusy: true }));
    try {
      const parsed = parseInstanceConnectInput(input, { environment: appEnvironment });
      pendingPairingSecretRef.current = parsed.pairingSecret ?? null;
      const result = await discoverInstance(parsed.origin, {
        onStep: (discoveryStep) => setSession((current) => ({
          ...toUnauthenticated(current), discoveryStep, error: null, isBusy: true,
        })),
      });
      setPendingDiscovery(result);
      setSession((current) => ({ ...toUnauthenticated(current), discoveryStep: 'ready-for-auth', isBusy: false }));
    } catch (error) {
      setSession((current) => ({
        ...toUnauthenticated(current),
        error: toClientError(error, 'Neta instance doğrulanamadı.'),
        isBusy: false,
      }));
    }
  }, []);

  const cancelInstanceConnection = useCallback(() => {
    setPendingDiscovery(null);
    pendingPairingSecretRef.current = null;
    setSession((current) => ({ ...toUnauthenticated(current), error: null, isBusy: false }));
  }, []);

  const confirmInstanceConnection = useCallback(async (pairingCode?: string) => {
    if (!pendingDiscovery) return false;
    const result = pendingDiscovery;
    setSession((current) => ({ ...toUnauthenticated(current), error: null, isBusy: true }));
    try {
      const saved = await saveDiscoveredInstance(result.instance, result.catalog);
      if (saved.instanceIdChanged && saved.previousInstanceId) {
        await clearResourceCacheForInstance(saved.previousInstanceId);
      }
      setPendingDiscovery(null);
      applyInstanceBranding(result.instance);
      const credential = pendingPairingSecretRef.current
        ? { secret: pendingPairingSecretRef.current }
        : pairingCode?.trim() ? { code: pairingCode.trim() } : null;
      pendingPairingSecretRef.current = null;
      if (credential) {
        const user = await createNativeAuthClient(result.instance).pairDevice(credential);
        applyUserPreferences(user);
        setSession(authenticatedState(result.instance, user));
      } else {
        setSession(createUnauthenticatedState(result.instance));
      }
      return true;
    } catch (error) {
      setSession((current) => ({
        ...toUnauthenticated(current),
        error: toClientError(error, 'Instance kaydedilemedi.'),
        isBusy: false,
      }));
      return false;
    }
  }, [applyInstanceBranding, applyUserPreferences, pendingDiscovery]);

  const forgetCurrentInstance = useCallback(async () => {
    const instance = session.instance;
    if (!instance) return;
    setSession((current) => ({ ...toUnauthenticated(current), error: null, isBusy: true }));
    await clearResourceCacheForInstance(instance.instanceId);
    await forgetInstance(instance.instanceId);
    setPendingDiscovery(null);
    applyInstanceBranding(null);
    setSession(createUnauthenticatedState(null));
  }, [applyInstanceBranding, session.instance]);

  useEffect(() => {
    const timeout = setTimeout(() => { void bootstrap(); }, 0);
    return () => clearTimeout(timeout);
  }, [bootstrap]);

  useEffect(() => {
    if (appState !== 'active' || session.status !== 'authenticated') return;
    const now = Date.now();
    if (now - lastSessionCheckAtRef.current < SESSION_STALE_MS) return;
    lastSessionCheckAtRef.current = now;
    void createNativeAuthClient(session.instance).getMe().then((user) => {
      applyUserPreferences(user);
      setSession(authenticatedState(session.instance, user));
    }).catch(async (error) => {
      const clientError = toClientError(error, 'Oturum doğrulanamadı.');
      if (!isSessionInvalidatingError(clientError)) return;
      await clearResourceCacheForInstance(session.instance.instanceId);
      await clearInstanceSession(session.instance.instanceId);
      setSession({ ...createUnauthenticatedState(session.instance), error: new NetaClientError('AUTH_REQUIRED', 'Oturum süresi doldu. Lütfen tekrar giriş yap.') });
    });
  }, [appState, applyUserPreferences, session]);

  const login = useCallback(async (email: string, password: string) => {
    if (session.status === 'authenticated' || !session.instance) return;
    setSession((current) => ({ ...toUnauthenticated(current), error: null, isBusy: true }));
    try {
      const user = await createNativeAuthClient(session.instance).signInEmail(email, password);
      applyUserPreferences(user);
      lastSessionCheckAtRef.current = Date.now();
      setSession(authenticatedState(session.instance, user));
    } catch (error) {
      setSession({ ...createUnauthenticatedState(session.instance), error: toClientError(error, 'Giriş yapılamadı.') });
    }
  }, [applyUserPreferences, session]);

  const logout = useCallback(async () => {
    if (!session.instance) return;
    const instance = session.instance;
    try {
      if (session.status === 'authenticated') await createNativeAuthClient(instance).signOut();
      else await clearInstanceSession(instance.instanceId);
    } finally {
      await clearResourceCacheForInstance(instance.instanceId);
      setSession(createUnauthenticatedState(instance));
    }
  }, [session]);

  const refreshSession = useCallback(async () => {
    if (session.status !== 'authenticated') return;
    const user = await createNativeAuthClient(session.instance).getMe();
    applyUserPreferences(user);
    setSession(authenticatedState(session.instance, user));
  }, [applyUserPreferences, session]);

  const updateInstance = useCallback(async (patch: Partial<StoredInstance>) => {
    if (!session.instance) return;
    const instance = { ...session.instance, ...patch, origin: session.instance.origin };
    await updateStoredInstance(instance);
    applyInstanceBranding(instance);
    setSession((current) => ({ ...current, instance } as SessionState));
  }, [applyInstanceBranding, session.instance]);

  const value = useMemo<SessionContextValue>(() => ({
    ...session,
    cancelInstanceConnection,
    confirmInstanceConnection,
    connectInstance,
    forgetCurrentInstance,
    login,
    logout,
    refreshSession,
    retryBootstrap: bootstrap,
    updateInstance,
    pendingInstance: pendingDiscovery?.instance ?? null,
  }), [bootstrap, cancelInstanceConnection, confirmInstanceConnection, connectInstance, forgetCurrentInstance, login, logout, pendingDiscovery, refreshSession, session, updateInstance]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const value = useContext(SessionContext);
  if (!value) throw new Error('useSession must be used within SessionProvider.');
  return value;
}

function createLoadingState(): UnauthenticatedSessionState {
  return { discoveryStep: 'idle', error: null, instance: null, isBusy: true, role: null, status: 'loading', user: null };
}

function createUnauthenticatedState(instance: StoredInstance | null): UnauthenticatedSessionState {
  return { discoveryStep: instance ? 'ready-for-auth' : 'idle', error: null, instance, isBusy: false, role: null, status: 'unauthenticated', user: null };
}

function authenticatedState(instance: StoredInstance, user: MeProfile): AuthenticatedSessionState {
  return { discoveryStep: 'ready-for-auth', error: null, instance, isBusy: false, role: user.role, status: 'authenticated', user };
}

function toUnauthenticated(state: SessionState): UnauthenticatedSessionState {
  if (state.status === 'authenticated') return createUnauthenticatedState(state.instance);
  return { ...state, role: null, user: null };
}

function isSessionInvalidatingError(error: NetaClientError): boolean {
  return error.code === 'AUTH_REQUIRED' || error.code === 'FORBIDDEN';
}
