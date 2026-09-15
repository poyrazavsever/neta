export const NETA_PROTOCOL = 'neta' as const;
export const NETA_DISCOVERY_VERSION = 1 as const;
export const NETA_API_VERSION = '1' as const;
export const NETA_API_BASE_PATH = '/api/v1' as const;
export const NETA_API_VERSION_HEADER = 'X-Neta-API-Version' as const;

export type NetaCapabilityStatus = 'available' | 'planned';
export type NetaCapabilityAccess = 'public' | 'session' | 'freelancer' | 'client';

export const NETA_CAPABILITY_DETAILS = [
  { id: 'mobile-v1', version: 1, status: 'planned', access: 'public' },
  { id: 'instance.discovery', version: 1, status: 'available', access: 'public' },
  { id: 'instance.branding', version: 1, status: 'available', access: 'public' },
  { id: 'instance.localization', version: 1, status: 'available', access: 'public' },
  { id: 'auth.better-auth-cookie', version: 1, status: 'available', access: 'session' },
  { id: 'auth.device-pairing.v1', version: 1, status: 'available', access: 'freelancer' },
  { id: 'freelancer.dashboard.v1', version: 1, status: 'available', access: 'freelancer' },
  { id: 'freelancer.clients.v1', version: 1, status: 'available', access: 'freelancer' },
  { id: 'freelancer.projects.v1', version: 1, status: 'available', access: 'freelancer' },
  { id: 'freelancer.tasks.v1', version: 1, status: 'available', access: 'freelancer' },
  { id: 'freelancer.calendar.v1', version: 1, status: 'available', access: 'freelancer' },
  { id: 'freelancer.core-mutations.v1', version: 1, status: 'available', access: 'freelancer' },
  { id: 'freelancer.finance.v1', version: 1, status: 'available', access: 'freelancer' },
  { id: 'freelancer.journal.v1', version: 1, status: 'available', access: 'freelancer' },
  { id: 'freelancer.settings.v1', version: 1, status: 'available', access: 'freelancer' },
  { id: 'instance.locales.admin.v1', version: 1, status: 'available', access: 'freelancer' },
  { id: 'files.v1', version: 1, status: 'available', access: 'freelancer' },
  { id: 'portal.client.v1', version: 1, status: 'available', access: 'client' },
  { id: 'ai.assistant.v1', version: 1, status: 'planned', access: 'freelancer' },
] as const satisfies readonly {
  id: string;
  version: number;
  status: NetaCapabilityStatus;
  access: NetaCapabilityAccess;
}[];

export type NetaCapabilityId = (typeof NETA_CAPABILITY_DETAILS)[number]['id'];
export type NetaCapability = {
  id: string;
  version: number;
  status: NetaCapabilityStatus;
  access: NetaCapabilityAccess;
};

export const NETA_CAPABILITIES = NETA_CAPABILITY_DETAILS
  .filter((capability) => capability.status === 'available')
  .map((capability) => capability.id);

export const NETA_MOBILE_V1_REQUIRED_CAPABILITIES = [
  'instance.discovery',
  'instance.branding',
  'instance.localization',
  'auth.better-auth-cookie',
  'freelancer.dashboard.v1',
  'freelancer.clients.v1',
  'freelancer.projects.v1',
  'freelancer.tasks.v1',
  'freelancer.calendar.v1',
  'freelancer.core-mutations.v1',
  'freelancer.finance.v1',
  'freelancer.journal.v1',
  'freelancer.settings.v1',
  'instance.locales.admin.v1',
  'files.v1',
] as const satisfies readonly NetaCapabilityId[];

export const NETA_CAPABILITY_ROUTE_REQUIREMENTS = {
  'instance.discovery': ['GET /.well-known/neta', 'GET /api/v1/health', 'GET /api/v1/meta'],
  'instance.branding': ['GET /api/v1/meta'],
  'instance.localization': ['GET /api/v1/meta', 'GET /api/v1/localization/catalog'],
  'auth.better-auth-cookie': [
    'POST /api/auth/sign-in/email',
    'POST /api/auth/sign-out',
    'GET /api/v1/me',
    'PATCH /api/v1/me/preferences',
  ],
  'auth.device-pairing.v1': [
    'POST /api/v1/pairing/challenges',
    'POST /api/v1/pairing/exchange',
    'POST /api/v1/device-sessions/refresh',
    'GET /api/v1/device-sessions',
    'DELETE /api/v1/device-sessions/:id',
  ],
  'freelancer.dashboard.v1': ['GET /api/v1/dashboard/overview'],
  'freelancer.clients.v1': ['GET /api/v1/clients', 'GET /api/v1/clients/:id'],
  'freelancer.projects.v1': ['GET /api/v1/projects', 'GET /api/v1/projects/:id', 'GET /api/v1/projects/:id/planning-sections', 'GET /api/v1/projects/:id/revisions'],
  'freelancer.tasks.v1': ['GET /api/v1/tasks', 'GET /api/v1/tasks/:id'],
  'freelancer.calendar.v1': ['GET /api/v1/calendar/events', 'GET /api/v1/calendar/events/:id'],
  'freelancer.core-mutations.v1': ['POST /api/v1/clients', 'PATCH /api/v1/clients/:id', 'GET /api/v1/clients/:id/activities', 'POST /api/v1/clients/:id/activities', 'POST /api/v1/clients/:id/portal-invitations', 'POST /api/v1/projects', 'PATCH /api/v1/projects/:id', 'POST /api/v1/tasks', 'PATCH /api/v1/tasks/:id', 'POST /api/v1/tasks/:id/complete', 'DELETE /api/v1/tasks/:id', 'POST /api/v1/calendar/events', 'PATCH /api/v1/calendar/events/:id', 'DELETE /api/v1/calendar/events/:id'],
  'freelancer.finance.v1': ['GET /api/v1/finance/summary', 'GET /api/v1/finance/transactions', 'POST /api/v1/finance/transactions', 'PATCH /api/v1/finance/transactions/:id', 'DELETE /api/v1/finance/transactions/:id'],
  'freelancer.journal.v1': ['GET /api/v1/journal/entries', 'PUT /api/v1/journal/entries/:date', 'PATCH /api/v1/journal/entries/:id', 'DELETE /api/v1/journal/entries/:id'],
  'freelancer.settings.v1': ['PATCH /api/v1/me/profile', 'POST /api/v1/me/password', 'GET /api/v1/me/sessions', 'DELETE /api/v1/me/sessions/:id', 'DELETE /api/v1/me/sessions', 'GET /api/v1/settings/general', 'PATCH /api/v1/settings/general', 'GET /api/v1/settings/appearance', 'PATCH /api/v1/settings/appearance', 'GET /api/v1/settings/ai', 'PATCH /api/v1/settings/ai'],
  'instance.locales.admin.v1': ['GET /api/v1/settings/locales', 'POST /api/v1/settings/locales', 'PATCH /api/v1/settings/locales/:code', 'GET /api/v1/settings/locales/:code/translations', 'PUT /api/v1/settings/locales/:code/translations', 'POST /api/v1/settings/locales/import', 'GET /api/v1/settings/locales/export'],
  'files.v1': ['POST /api/v1/files', 'GET /api/v1/projects/:id/assets', 'DELETE /api/v1/projects/:id/assets/:assetId', 'POST /api/v1/settings/appearance/assets', 'DELETE /api/v1/settings/appearance/assets/:kind'],
  'portal.client.v1': [
    'GET /api/v1/portal/dashboard', 'GET /api/v1/portal/projects',
    'GET /api/v1/portal/projects/:id', 'GET /api/v1/portal/tasks',
    'GET /api/v1/portal/revisions', 'POST /api/v1/portal/projects/:id/revisions',
    'GET /api/v1/portal/profile', 'PATCH /api/v1/portal/profile',
  ],
  'ai.assistant.v1': ['GET /api/v1/chat/sessions', 'POST /api/v1/chat/sessions'],
} as const satisfies Partial<Record<NetaCapabilityId, readonly string[]>>;

export type NetaColorMode = 'light' | 'dark' | 'system';
export type NetaSessionRole = 'freelancer' | 'client';

export type NetaBootstrapLocale = {
  code: string;
  name: string;
  nativeName: string;
  status: string;
  textDirection: string;
};

export type NetaLocalizedResponse<TResource> = {
  resource: TResource;
  localized: TResource;
  locale: string;
  fallbackChain: string[];
};

export type NetaTranslationMutationShape = Record<string, Record<string, string | null>>;

export type NetaDiscoveryDocument = {
  protocol: typeof NETA_PROTOCOL;
  discoveryVersion: typeof NETA_DISCOVERY_VERSION;
  instanceId: string;
  applicationName: string;
  workspaceName: string;
  api: {
    version: typeof NETA_API_VERSION;
    baseUrl: string;
    metaUrl: string;
    healthUrl: string;
    catalogUrl: string;
  };
  security: {
    httpsRequired: true;
    insecureLoopbackAllowed: true;
  };
  localization: {
    defaultLocale: string;
    supportedLocales: NetaBootstrapLocale[];
    catalogVersion: number;
  };
  capabilities: readonly string[];
  capabilityDetails: readonly NetaCapability[];
};

export type NetaInstanceMetadata = {
  protocol: {
    name: typeof NETA_PROTOCOL;
    discoveryVersion: typeof NETA_DISCOVERY_VERSION;
    apiVersion: typeof NETA_API_VERSION;
  };
  server: { version: string };
  instance: {
    id: string;
    createdAt: string;
    applicationName: string;
    workspaceName: string;
    metaTitle: string;
    shortName: string;
    organizationName: string | null;
  };
  branding: {
    primaryColor: string;
    accentColor: string;
    defaultColorMode: NetaColorMode;
    radiusScale: 'compact' | 'default' | 'soft';
    lightLogoUrl: string | null;
    darkLogoUrl: string | null;
    iconUrl: string | null;
    faviconUrl: string | null;
  };
  localization: {
    defaultLocale: string;
    supportedLocales: NetaBootstrapLocale[];
    catalogVersion: number;
    [key: string]: unknown;
  };
  contracts: Record<string, unknown>;
  client: {
    minimumSupportedVersion: string | null;
    platforms: readonly ['ios', 'android'];
  };
  authentication: {
    sessionMethod: 'better-auth-cookie';
    devicePairing: 'available';
  };
  capabilities: readonly string[];
  capabilityDetails: readonly NetaCapability[];
  links: {
    discovery: string;
    apiBase: string;
    health: string;
    me: string;
    preferences: string;
    catalog: string;
  };
};

export type NetaMePreferences = {
  colorMode: NetaColorMode;
  locale: string;
  timezone: string;
};

export type NetaMeProfile = {
  user: {
    id: string;
    email: string;
    name: string;
    role: NetaSessionRole;
    clientId: string | null;
    disabled: false;
    imageUrl: string | null;
  };
  session: { expiresAt: string };
  preferences: NetaMePreferences;
  localization: {
    userPreferenceLocale: string;
    clientDefaultLocale: string | null;
    resolvedLocale: string;
    requestedLocale: string | null;
    instanceDefaultLocale: string;
    source: 'query' | 'accept-language' | 'preference' | 'portal' | 'instance';
    fallbackChain: string[];
  };
};

export type NetaMePreferencesMutation = Partial<NetaMePreferences>;

export type NetaRuntimeCatalog = TranslationCatalog & {
  requestedLocale: string | null;
  defaultLocale: string;
  source: 'query' | 'accept-language' | 'preference' | 'portal' | 'instance';
  fallbackChain: string[];
  catalogVersion: number;
  namespaces: string[];
};

export type ApiEnvelope<T> = ApiSuccess<T> | ApiFailure;

export type ApiSuccess<T> = {
  ok: true;
  data: T;
};

export type ApiFailure = {
  ok: false;
  error: ApiError;
};

export type ApiError = {
  code: string;
  message: string;
  details?: {
    fieldErrors?: Record<string, string[]>;
    messageKey?: string;
    [key: string]: unknown;
  };
};

export type PageInfo = {
  hasNextPage: boolean;
  nextCursor: string | null;
};

export type PaginatedResponse<T> = {
  items: T[];
  pageInfo: PageInfo;
};

export type LocalizedResponse<TResource, TLocalized> = {
  fallbackChain: string[];
  locale: string;
  localized: TLocalized;
  resource: TResource;
};

export type LocalizedText = {
  name: string;
  description?: string | null;
};

export type LocalizedTextPayload = Record<string, LocalizedText>;

export type MoneyAmount = {
  amountMinor: number;
  currency: string;
};

/** Opaque optimistic-concurrency value; v1 presenters currently derive it from updatedAt. */
export type ResourceVersion = string;

export type DeleteResult = {
  deleted: boolean;
  id: string;
};

export type DashboardRange = 'today' | 'this_week' | 'this_month' | 'this_year';

export type DashboardStat = {
  id: string;
  label: string;
  value: number | MoneyAmount | string;
  trendLabel: string | null;
};

export type DashboardListItem = {
  id: string;
  title: string;
  subtitle: string | null;
  status: string | null;
};

export type OwnerDashboard = {
  generatedAt: string;
  range: DashboardRange;
  stats: DashboardStat[];
  recentClients: DashboardListItem[];
  recentProjects: DashboardListItem[];
};

export type AnalyticsPoint = {
  label: string;
  value: number | MoneyAmount;
};

export type OwnerAnalytics = {
  generatedAt: string;
  range: DashboardRange;
  chartSummary: string;
  revenue: AnalyticsPoint[];
  tasks: AnalyticsPoint[];
  projects: AnalyticsPoint[];
};

export type OwnerDashboardOverview = {
  analytics: OwnerAnalytics;
  dashboard: OwnerDashboard;
};

export type ClientStatus = 'active' | 'paused' | 'archived';
export type ClientPipelineStatus = 'lead' | 'contacted' | 'proposal_sent' | 'won' | 'lost';

export type ClientListItem = {
  id: string;
  displayName: string;
  email: string | null;
  phone: string | null;
  portalLocale: string | null;
  portalStatus: 'disabled' | 'invited' | 'active' | null;
  projectCount: number;
  pipelineStatus: ClientPipelineStatus;
  status: ClientStatus;
  updatedAt: string;
};

export type ClientDetail = ClientListItem & {
  company: string | null;
  notes: string | null;
  translations: LocalizedTextPayload;
};

export type ClientActivity = {
  id: string;
  createdAt: string;
  note: string;
  type: 'call' | 'email' | 'meeting' | 'note';
};

export type ClientActivityMutationPayload = {
  note: string;
  occurredAt?: string;
  type: ClientActivity['type'];
};

export type ClientMutationPayload = {
  email?: string | null;
  phone?: string | null;
  pipelineStatus?: ClientPipelineStatus;
  status?: ClientStatus;
  translations: LocalizedTextPayload;
  version?: string | null;
};

export type PortalInvitationPayload = {
  defaultLocale: string;
  email: string;
};

export type PortalInvitationResult = {
  client: ClientDetail;
  expiresAt: string;
  invitationUrl: string;
};

export type ProjectType = 'client_project' | 'side_project';
export type ProjectStatus = 'planning' | 'active' | 'paused' | 'completed' | 'cancelled';
export type ProjectProgressType = 'manual' | 'auto';

export type ProjectListItem = {
  clientId: string | null;
  clientName: string | null;
  dueDate: string | null;
  id: string;
  progress: number;
  progressType: ProjectProgressType;
  status: ProjectStatus;
  title: string;
  type: ProjectType;
  updatedAt: string;
};

export type ProjectDetail = ProjectListItem & {
  revisionAllowance: number | null;
  revisionsUsed: number;
  translations: LocalizedTextPayload;
};

export type PlanningSection = {
  category?: 'overview' | 'problem' | 'goal' | 'audience' | 'scope' | 'design_system' | 'color_palette' | 'typography' | 'assets' | 'notes';
  content?: string | null;
  id: string;
  order: number;
  title: string;
};

export type ProjectRevision = {
  createdAt: string;
  description: string;
  id: string;
  requestedBy: string | null;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
};

export type ProjectAsset = {
  createdAt: string;
  id: string;
  mimeType: string;
  name: string;
  sizeBytes: number;
  url: string;
  visibility: 'private' | 'portal';
};

export type ProjectMutationPayload = {
  clientId?: string | null;
  dueDate?: string | null;
  progressType?: ProjectProgressType;
  status?: ProjectStatus;
  type: ProjectType;
  translations: LocalizedTextPayload;
  version?: string | null;
};

export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type TaskListItem = {
  actualMinutes: number | null;
  clientId: string | null;
  clientName: string | null;
  dueAt: string | null;
  estimatedMinutes: number | null;
  id: string;
  isPublicToClient: boolean;
  priority: TaskPriority;
  projectId: string | null;
  projectName: string | null;
  scheduledDate: string | null;
  status: TaskStatus;
  title: string;
  updatedAt: string;
};

export type TaskDetail = TaskListItem & {
  translations: LocalizedTextPayload;
  version: string | null;
};

export type TaskMutationPayload = {
  actualMinutes?: number | null;
  clientId?: string | null;
  dueAt?: string | null;
  estimatedMinutes?: number | null;
  isPublicToClient?: boolean;
  priority?: TaskPriority;
  projectId?: string | null;
  scheduledDate?: string | null;
  status?: TaskStatus;
  translations: LocalizedTextPayload;
  version?: string | null;
};

export type TaskStatusMutationPayload = {
  position?: number;
  status: TaskStatus;
  version?: string | null;
};

export type CalendarEventType = 'meeting' | 'focus' | 'deadline' | 'personal' | 'finance';
export type CalendarEventSource = 'calendar' | 'task' | 'finance';

export type CalendarEvent = {
  clientId: string | null;
  endAt: string;
  id: string;
  projectId: string | null;
  readOnly: boolean;
  source: CalendarEventSource;
  startAt: string;
  taskId: string | null;
  title: string;
  type: CalendarEventType;
};

export type CalendarRangeResponse = {
  from: string;
  items: CalendarEvent[];
  timezone: string;
  to: string;
};

export type CalendarEventDetail = CalendarEvent & {
  translations: LocalizedTextPayload;
  version: string | null;
};

export type CalendarEventMutationPayload = {
  clientId?: string | null;
  endAt: string;
  projectId?: string | null;
  startAt: string;
  taskId?: string | null;
  translations: LocalizedTextPayload;
  type: CalendarEventType;
  version?: string | null;
};

export type FinanceTransactionKind = 'income' | 'expense';
export type FinancePaymentStatus = 'planned' | 'pending' | 'paid' | 'cancelled';

export type FinanceSummaryTotals = {
  expense: MoneyAmount;
  gross: MoneyAmount;
  income: MoneyAmount;
  net: MoneyAmount;
  pending: MoneyAmount;
  taxEstimate: MoneyAmount | null;
};

export type FinanceSummary = {
  generatedAt: string;
  month: string;
  taxDisclaimer: string | null;
  totals: FinanceSummaryTotals;
};

export type MultiCurrencyFinanceSummary = {
  generatedAt: string;
  month: string;
  taxDisclaimer: string | null;
  currencies: Array<{
    currency: string;
    totals: FinanceSummaryTotals;
  }>;
};

export type LocalizedFinanceText = {
  category: string;
  description?: string | null;
};

export type LocalizedFinancePayload = Record<string, LocalizedFinanceText>;

export type FinanceTransactionListItem = {
  amount: MoneyAmount;
  category: string;
  clientId: string | null;
  clientName: string | null;
  date: string;
  description: string | null;
  id: string;
  kind: FinanceTransactionKind;
  paymentStatus: FinancePaymentStatus;
  projectId: string | null;
  projectName: string | null;
  updatedAt: string;
};

export type FinanceTransactionDetail = FinanceTransactionListItem & {
  translations: LocalizedFinancePayload;
  version: string | null;
};

export type FinanceTransactionMutationPayload = {
  amountMinor: number;
  clientId?: string | null;
  currency: string;
  date: string;
  kind: FinanceTransactionKind;
  paymentStatus: FinancePaymentStatus;
  projectId?: string | null;
  translations: LocalizedFinancePayload;
  version?: string | null;
};

export type FinanceAnalysis = {
  disclaimer: string | null;
  generatedAt: string;
  recommendations: string[];
  summary: string;
};

export type JournalScore = 1 | 2 | 3 | 4 | 5;

export type LocalizedJournalText = {
  moodLabel: string;
  note: string;
};

export type LocalizedJournalPayload = Record<string, LocalizedJournalText>;

export type JournalEntryListItem = {
  date: string;
  energy: JournalScore | null;
  id: string;
  mood: JournalScore | null;
  moodLabel: string;
  satisfaction: JournalScore | null;
  updatedAt: string;
};

export type JournalRangeResponse = {
  from: string;
  items: JournalEntryListItem[];
  to: string;
};

export type JournalEntryDetail = JournalEntryListItem & {
  translations: LocalizedJournalPayload;
  version: string | null;
};

export type JournalEntryMutationPayload = {
  energy: JournalScore | null;
  mood: JournalScore | null;
  satisfaction: JournalScore | null;
  sourceLocale: string;
  translations: LocalizedJournalPayload;
  version?: string | null;
};

export type ChatSession = {
  createdAt: string;
  id: string;
  lastMessagePreview: string | null;
  title: string;
  updatedAt: string;
};

export type ChatMessageRole = 'system' | 'user' | 'assistant' | 'tool';

export type ChatMessage = {
  content: string;
  createdAt: string;
  id: string;
  role: ChatMessageRole;
  sourceLocale: string | null;
};

export type ChatSessionMutationPayload = { title?: string | null };
export type ChatMessageMutationPayload = { content: string; sourceLocale: string };

export type ChatStreamEvent =
  | { delta: string; type: 'message.delta' }
  | { message: ChatMessage; type: 'message.completed' }
  | { code: 'UPSTREAM_ERROR' | 'UPSTREAM_TIMEOUT' | 'SERVICE_UNAVAILABLE'; message: string; type: 'error' };

export type ProjectRiskAnalysis = {
  generatedAt: string;
  projectId: string;
  recommendations: string[];
  riskLevel: 'low' | 'medium' | 'high';
  summary: string;
};

export type MePreferencesMutationPayload = {
  colorMode?: 'light' | 'dark' | 'system';
  locale?: string;
  timezone?: string;
};

export type MeProfileMutationPayload = { name: string };
export type PasswordMutationPayload = { currentPassword: string; newPassword: string; revokeOtherSessions?: boolean };

export type AuthSessionInfo = {
  createdAt: string;
  current: boolean;
  deviceLabel: string;
  id: string;
  lastActiveAt: string;
};

export type DeviceSessionInfo = AuthSessionInfo & {
  platform: 'android' | 'ios' | 'unknown';
  revokedAt: string | null;
};

export type PairingChallenge = {
  challengeId: string;
  expiresAt: string;
  manualCode: string;
  qrPayload: string;
};

export type PairingExchangePayload = {
  appVersion: string;
  code?: string;
  deviceName: string;
  installId: string;
  osMajor?: string;
  platform: 'android' | 'ios';
  secret?: string;
};

export type DeviceTokenPair = {
  accessExpiresAt: string;
  accessToken: string;
  deviceSessionId?: string;
  refreshExpiresAt: string;
  refreshToken: string;
  tokenType: 'Bearer';
};

export type GeneralSettings = {
  companyName: string | null;
  portalFooter: string | null;
  workspaceName: string;
};

export type AppearanceSettings = {
  accentColor: string | null;
  darkLogoUrl: string | null;
  defaultColorMode: 'light' | 'dark' | 'system';
  faviconUrl: string | null;
  lightLogoUrl: string | null;
  primaryColor: string | null;
  radiusScale: 'compact' | 'default' | 'soft';
};

export type AppearanceMutationPayload = Pick<AppearanceSettings, 'accentColor' | 'defaultColorMode' | 'primaryColor' | 'radiusScale'>;
export type AppearanceAssetKind = 'lightLogo' | 'darkLogo' | 'favicon';
export type AppearanceAsset = { kind: AppearanceAssetKind; mimeType: 'image/png' | 'image/jpeg' | 'image/webp'; url: string };

export type AiSettings = {
  configured: boolean;
  maskedKey: string | null;
  model: string | null;
  provider: 'gemini' | 'openai' | 'groq' | 'ollama' | null;
};

export type AiSettingsMutationPayload = {
  apiKey?: string;
  currentPassword?: string;
  model: string;
  provider: 'gemini' | 'openai' | 'groq' | 'ollama';
};

export type LocaleStatus = 'draft' | 'active' | 'archived';
export type LocaleDefinition = {
  code: string;
  completion: number;
  fallbackLocale: string | null;
  isDefault: boolean;
  /** @deprecated UI-only compatibility field; transport uses textDirection. */
  isRtl?: boolean;
  textDirection: 'ltr' | 'rtl';
  name: string;
  status: LocaleStatus;
  updatedAt: string;
};

export type LocaleMutationPayload = {
  fallbackLocale?: string | null;
  textDirection: 'ltr' | 'rtl';
  name: string;
  status: LocaleStatus;
};

export type TranslationCatalog = {
  locale: string;
  messages: Record<string, string>;
  version: number;
};

export type PortalLocalizedPage<T> = PaginatedResponse<T> & {
  fallbackChain: string[];
  locale: string;
};

export type PortalProjectSummary = {
  description: string | null;
  dueDate: string | null;
  id: string;
  progress: number;
  status: ProjectStatus;
  title: string;
  updatedAt: string;
};

export type PortalDashboard = {
  fallbackChain: string[];
  generatedAt: string;
  locale: string;
  portalFooter: string | null;
  projects: PortalProjectSummary[];
  stats: {
    activeProjects: number;
    completedProjects: number;
    completedTasks: number;
    pendingRevisions: number;
  };
};

export type PortalPlanningSection = {
  description: string | null;
  id: string;
  order: number;
  title: string;
};

export type PortalTask = {
  description: string | null;
  dueAt: string | null;
  id: string;
  isPublicToClient: true;
  priority: TaskPriority;
  projectId: string;
  projectName: string;
  status: TaskStatus;
  title: string;
  updatedAt: string;
};

export type PortalAsset = {
  id: string;
  mimeType: string;
  name: string;
  sizeBytes: number;
  url: string;
  visibility: 'portal';
};

export type PortalRevisionStatus = 'pending' | 'in_progress' | 'completed' | 'rejected';

export type PortalRevision = {
  createdAt: string;
  description: string;
  id: string;
  projectId: string;
  projectName: string;
  sourceLocale: string;
  status: PortalRevisionStatus;
  updatedAt: string;
};

export type PortalRevisionAllowance = {
  allowed: number | null;
  canRequest: boolean;
  remaining: number | null;
  used: number;
};

export type PortalProjectResource = {
  dueDate: string | null;
  id: string;
  progress: number;
  status: ProjectStatus;
  updatedAt: string;
};

export type PortalProjectLocalized = {
  description: string | null;
  title: string;
};

export type PortalProjectDetail = LocalizedResponse<PortalProjectResource, PortalProjectLocalized> & {
  assets: PortalAsset[];
  planningSections: PortalPlanningSection[];
  publicTasks: PortalTask[];
  revisionAllowance: PortalRevisionAllowance;
  revisions: PortalRevision[];
};

export type PortalRevisionMutationPayload = {
  description: string;
  sourceLocale: string;
};

export type PortalProfile = {
  avatarUrl: string | null;
  clientDefaultLocale: string | null;
  email: string | null;
  name: string;
  preferences: {
    colorMode: 'light' | 'dark' | 'system';
    locale: string;
    timezone: string | null;
  };
};

export type PortalProfileMutationPayload = {
  name: string;
};

export type FileVisibility = 'private' | 'portal' | 'public_branding';
export type FileAssetKind = 'avatar' | 'branding_logo' | 'branding_icon' | 'project_asset';

export type FileAsset = {
  createdAt: string;
  id: string;
  kind: FileAssetKind;
  metadataSanitized: boolean;
  mimeType: string;
  name: string;
  projectId: string | null;
  sizeBytes: number;
  url: string;
  visibility: FileVisibility;
};

export type FileUploadMutationPayload = {
  kind: FileAssetKind;
  projectId?: string;
  visibility: FileVisibility;
};

export type RequestMetadata = {
  client: 'mobile';
  idempotencyKey?: string;
  locale: string;
  platform: 'ios' | 'android' | 'web' | 'macos' | 'windows' | 'unknown';
  role: 'freelancer' | 'client';
  version: string;
};

export type CachePolicy = 'none' | 'short' | 'medium' | 'long';

export type ResourceName =
  | 'analytics'
  | 'calendar'
  | 'chat'
  | 'clients'
  | 'dashboard'
  | 'finance'
  | 'files'
  | 'journal'
  | 'localization'
  | 'me'
  | 'portal'
  | 'projects'
  | 'settings'
  | 'tasks';

export function isNetaCapabilityId(value: unknown): value is NetaCapabilityId {
  return typeof value === 'string' && NETA_CAPABILITY_DETAILS.some((capability) => capability.id === value);
}

export function isNetaCapability(value: unknown): value is NetaCapability {
  if (!isRecord(value) || !isNonEmptyString(value.id) || !isNonNegativeInteger(value.version)) return false;
  if (value.version < 1 || (value.status !== 'available' && value.status !== 'planned') ||
    (value.access !== 'public' && value.access !== 'session' && value.access !== 'freelancer' && value.access !== 'client')) return false;
  const expected = NETA_CAPABILITY_DETAILS.find((capability) => capability.id === value.id);
  return expected === undefined || (value.version === expected.version && value.access === expected.access);
}

export function isNetaDiscoveryDocument(value: unknown): value is NetaDiscoveryDocument {
  if (!isRecord(value) || !isRecord(value.api) || !isRecord(value.security) || !isRecord(value.localization)) return false;
  return value.protocol === NETA_PROTOCOL && value.discoveryVersion === NETA_DISCOVERY_VERSION &&
    isNonEmptyString(value.instanceId) && isNonEmptyString(value.applicationName) && isNonEmptyString(value.workspaceName) &&
    value.api.version === NETA_API_VERSION && isAbsoluteHttpUrl(value.api.baseUrl) && isAbsoluteHttpUrl(value.api.metaUrl) &&
    isAbsoluteHttpUrl(value.api.healthUrl) && isAbsoluteHttpUrl(value.api.catalogUrl) &&
    value.security.httpsRequired === true && value.security.insecureLoopbackAllowed === true &&
    isNonEmptyString(value.localization.defaultLocale) && isNonNegativeInteger(value.localization.catalogVersion) &&
    Array.isArray(value.localization.supportedLocales) && value.localization.supportedLocales.every(isNetaBootstrapLocale) &&
    hasConsistentCapabilities(value.capabilities, value.capabilityDetails);
}

export function isNetaInstanceMetadata(value: unknown): value is NetaInstanceMetadata {
  if (!isRecord(value) || !isRecord(value.protocol) || !isRecord(value.server) || !isRecord(value.instance) ||
    !isRecord(value.branding) || !isRecord(value.localization) || !isRecord(value.client) || !isRecord(value.authentication) ||
    !isRecord(value.links) || !isRecord(value.contracts)) return false;
  const branding = value.branding;
  const links = value.links;
  const urls = ['discovery', 'apiBase', 'health', 'me', 'preferences', 'catalog'] as const;
  return value.protocol.name === NETA_PROTOCOL && value.protocol.discoveryVersion === NETA_DISCOVERY_VERSION &&
    value.protocol.apiVersion === NETA_API_VERSION && isNonEmptyString(value.server.version) &&
    isNonEmptyString(value.instance.id) && isIsoInstant(value.instance.createdAt) &&
    isNonEmptyString(value.instance.applicationName) && isNonEmptyString(value.instance.workspaceName) &&
    isNonEmptyString(value.instance.metaTitle) && isNonEmptyString(value.instance.shortName) && isNullableString(value.instance.organizationName) &&
    isNonEmptyString(value.branding.primaryColor) && isNonEmptyString(value.branding.accentColor) &&
    isColorMode(value.branding.defaultColorMode) &&
    (value.branding.radiusScale === 'compact' || value.branding.radiusScale === 'default' || value.branding.radiusScale === 'soft') &&
    (['lightLogoUrl', 'darkLogoUrl', 'iconUrl', 'faviconUrl'] as const)
      .every((key) => isNullableAbsoluteHttpUrl(branding[key])) &&
    isNonEmptyString(value.localization.defaultLocale) && isNonNegativeInteger(value.localization.catalogVersion) &&
    Array.isArray(value.localization.supportedLocales) && value.localization.supportedLocales.every(isNetaBootstrapLocale) &&
    isNullableString(value.client.minimumSupportedVersion) && Array.isArray(value.client.platforms) &&
    value.client.platforms.length === 2 && value.client.platforms[0] === 'ios' && value.client.platforms[1] === 'android' &&
    value.authentication.sessionMethod === 'better-auth-cookie' && value.authentication.devicePairing === 'available' &&
    hasConsistentCapabilities(value.capabilities, value.capabilityDetails) &&
    urls.every((key) => isAbsoluteHttpUrl(links[key]));
}

export function isNetaMeProfile(value: unknown): value is NetaMeProfile {
  if (!isRecord(value) || !isRecord(value.user) || !isRecord(value.session) ||
    !isRecord(value.preferences) || !isRecord(value.localization)) return false;
  return isNonEmptyString(value.user.id) && isNonEmptyString(value.user.email) && isNonEmptyString(value.user.name) &&
    (value.user.role === 'freelancer' || value.user.role === 'client') && isNullableString(value.user.clientId) &&
    value.user.disabled === false && isNullableAbsoluteHttpUrl(value.user.imageUrl) && isIsoInstant(value.session.expiresAt) &&
    isColorMode(value.preferences.colorMode) && isNonEmptyString(value.preferences.locale) && isValidIanaTimeZone(value.preferences.timezone) &&
    isNonEmptyString(value.localization.userPreferenceLocale) && isNullableString(value.localization.clientDefaultLocale) &&
    isNonEmptyString(value.localization.resolvedLocale) && isNullableString(value.localization.requestedLocale) &&
    isNonEmptyString(value.localization.instanceDefaultLocale) &&
    (value.localization.source === 'query' || value.localization.source === 'accept-language' ||
      value.localization.source === 'preference' || value.localization.source === 'portal' || value.localization.source === 'instance') &&
    isStringArray(value.localization.fallbackChain);
}

export function isNetaMePreferencesMutation(value: unknown): value is NetaMePreferencesMutation {
  if (!isRecord(value) || !hasOnlyKeys(value, ['colorMode', 'locale', 'timezone'])) return false;
  if (!Object.keys(value).length) return false;
  return (value.colorMode === undefined || isColorMode(value.colorMode)) &&
    (value.locale === undefined || isNonEmptyString(value.locale)) &&
    (value.timezone === undefined || isValidIanaTimeZone(value.timezone));
}

export function isNetaRuntimeCatalog(value: unknown): value is NetaRuntimeCatalog {
  if (!isRecord(value) || !isTranslationCatalog(value)) return false;
  const candidate: Record<string, unknown> = value;
  return candidate.catalogVersion === value.version &&
    isNullableString(candidate.requestedLocale) && isNonEmptyString(candidate.defaultLocale) &&
    (candidate.source === 'query' || candidate.source === 'accept-language' || candidate.source === 'preference' ||
      candidate.source === 'portal' || candidate.source === 'instance') &&
    isStringArray(candidate.fallbackChain) && isStringArray(candidate.namespaces);
}

export function isApiEnvelope<T>(
  value: unknown,
  isData: (candidate: unknown) => candidate is T,
): value is ApiEnvelope<T> {
  if (!isRecord(value) || typeof value.ok !== 'boolean') {
    return false;
  }

  if (value.ok === true) {
    return 'data' in value && isData(value.data);
  }

  return isApiError(value.error);
}

export function isPaginatedResponse<T>(
  value: unknown,
  isItem: (candidate: unknown) => candidate is T,
): value is PaginatedResponse<T> {
  return (
    isRecord(value) &&
    Array.isArray(value.items) &&
    value.items.every(isItem) &&
    isRecord(value.pageInfo) &&
    typeof value.pageInfo.hasNextPage === 'boolean' &&
    (typeof value.pageInfo.nextCursor === 'string' || value.pageInfo.nextCursor === null)
  );
}

export function isDeleteResult(value: unknown): value is DeleteResult {
  return isRecord(value) && value.deleted === true && typeof value.id === 'string';
}

export function isLocalizedResponse<TResource, TLocalized>(
  value: unknown,
  isResource: (candidate: unknown) => candidate is TResource,
  isLocalized: (candidate: unknown) => candidate is TLocalized,
): value is LocalizedResponse<TResource, TLocalized> {
  return (
    isRecord(value) &&
    Array.isArray(value.fallbackChain) &&
    value.fallbackChain.every((item) => typeof item === 'string') &&
    typeof value.locale === 'string' &&
    isLocalized(value.localized) &&
    isResource(value.resource)
  );
}

export function isOwnerDashboard(value: unknown): value is OwnerDashboard {
  return (
    isRecord(value) &&
    typeof value.generatedAt === 'string' &&
    isDashboardRange(value.range) &&
    Array.isArray(value.stats) &&
    value.stats.every(isDashboardStat) &&
    Array.isArray(value.recentClients) &&
    value.recentClients.every(isDashboardListItem) &&
    Array.isArray(value.recentProjects) &&
    value.recentProjects.every(isDashboardListItem)
  );
}

export function isOwnerAnalytics(value: unknown): value is OwnerAnalytics {
  return (
    isRecord(value) &&
    typeof value.generatedAt === 'string' &&
    isDashboardRange(value.range) &&
    typeof value.chartSummary === 'string' &&
    Array.isArray(value.revenue) &&
    value.revenue.every(isAnalyticsPoint) &&
    Array.isArray(value.tasks) &&
    value.tasks.every(isAnalyticsPoint) &&
    Array.isArray(value.projects) &&
    value.projects.every(isAnalyticsPoint)
  );
}

export function isOwnerDashboardOverview(value: unknown): value is OwnerDashboardOverview {
  return (
    isRecord(value) &&
    isOwnerDashboard(value.dashboard) &&
    isOwnerAnalytics(value.analytics) &&
    value.dashboard.range === value.analytics.range
  );
}

export function isClientListItem(value: unknown): value is ClientListItem {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.displayName === 'string' &&
    (typeof value.email === 'string' || value.email === null) &&
    (typeof value.phone === 'string' || value.phone === null) &&
    (typeof value.portalLocale === 'string' || value.portalLocale === null) &&
    (value.portalStatus === 'disabled' ||
      value.portalStatus === 'invited' ||
      value.portalStatus === 'active' ||
      value.portalStatus === null) &&
    typeof value.projectCount === 'number' &&
    isClientPipelineStatus(value.pipelineStatus) &&
    isClientStatus(value.status) &&
    typeof value.updatedAt === 'string'
  );
}

export function isClientDetail(value: unknown): value is ClientDetail {
  if (!isRecord(value)) {
    return false;
  }

  const record = value;

  return (
    isClientListItem(value) &&
    (typeof record['company'] === 'string' || record['company'] === null) &&
    (typeof record['notes'] === 'string' || record['notes'] === null) &&
    isLocalizedTextPayload(record['translations'])
  );
}

export function isPortalInvitationResult(value: unknown): value is PortalInvitationResult {
  return isRecord(value) && isClientDetail(value.client) && typeof value.expiresAt === 'string' && !Number.isNaN(Date.parse(value.expiresAt)) && isAbsoluteHttpUrl(value.invitationUrl);
}

export function isClientActivity(value: unknown): value is ClientActivity {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.createdAt === 'string' &&
    typeof value.note === 'string' &&
    (value.type === 'call' || value.type === 'email' || value.type === 'meeting' || value.type === 'note')
  );
}

export function isClientActivityMutationPayload(value: unknown): value is ClientActivityMutationPayload {
  return (
    isRecord(value) &&
    typeof value.note === 'string' &&
    value.note.trim().length > 0 &&
    (value.type === 'call' || value.type === 'email' || value.type === 'meeting' || value.type === 'note') &&
    (value.occurredAt === undefined || typeof value.occurredAt === 'string')
  );
}

export function isClientMutationPayload(value: unknown): value is ClientMutationPayload {
  return (
    isRecord(value) &&
    isLocalizedTextPayload(value.translations) &&
    (value.status === undefined || isClientStatus(value.status)) &&
    (value.email === undefined || typeof value.email === 'string' || value.email === null) &&
    (value.phone === undefined || typeof value.phone === 'string' || value.phone === null) &&
    (value.pipelineStatus === undefined || isClientPipelineStatus(value.pipelineStatus)) &&
    (value.version === undefined || typeof value.version === 'string' || value.version === null)
  );
}

export function isProjectListItem(value: unknown): value is ProjectListItem {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    (typeof value.clientId === 'string' || value.clientId === null) &&
    (typeof value.clientName === 'string' || value.clientName === null) &&
    (typeof value.dueDate === 'string' || value.dueDate === null) &&
    typeof value.progress === 'number' &&
    value.progress >= 0 &&
    value.progress <= 100 &&
    isProjectProgressType(value.progressType) &&
    isProjectStatus(value.status) &&
    isProjectType(value.type) &&
    typeof value.updatedAt === 'string'
  );
}

export function isProjectDetail(value: unknown): value is ProjectDetail {
  if (!isRecord(value)) {
    return false;
  }

  const record = value;

  return (
    isProjectListItem(value) &&
    (typeof record['revisionAllowance'] === 'number' || record['revisionAllowance'] === null) &&
    typeof record['revisionsUsed'] === 'number' &&
    isLocalizedTextPayload(record['translations'])
  );
}

export function isPlanningSection(value: unknown): value is PlanningSection {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.order === 'number' &&
    typeof value.title === 'string'
  );
}

export function isProjectRevision(value: unknown): value is ProjectRevision {
  return (
    isRecord(value) &&
    typeof value.createdAt === 'string' &&
    typeof value.description === 'string' &&
    typeof value.id === 'string' &&
    (typeof value.requestedBy === 'string' || value.requestedBy === null) &&
    (value.status === 'pending' || value.status === 'in_progress' || value.status === 'completed' || value.status === 'rejected')
  );
}

export function isProjectAsset(value: unknown): value is ProjectAsset {
  return (
    isRecord(value) &&
    typeof value.createdAt === 'string' &&
    typeof value.id === 'string' &&
    typeof value.mimeType === 'string' &&
    typeof value.name === 'string' &&
    typeof value.sizeBytes === 'number' &&
    typeof value.url === 'string' &&
    (value.visibility === 'private' || value.visibility === 'portal')
  );
}

export function isProjectMutationPayload(value: unknown): value is ProjectMutationPayload {
  return (
    isRecord(value) &&
    isLocalizedTextPayload(value.translations) &&
    (value.clientId === undefined || typeof value.clientId === 'string' || value.clientId === null) &&
    (value.dueDate === undefined || typeof value.dueDate === 'string' || value.dueDate === null) &&
    (value.progressType === undefined || isProjectProgressType(value.progressType)) &&
    (value.status === undefined || isProjectStatus(value.status)) &&
    isProjectType(value.type) &&
    (value.version === undefined || typeof value.version === 'string' || value.version === null)
  );
}

export function isTaskListItem(value: unknown): value is TaskListItem {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    isTaskStatus(value.status) &&
    isTaskPriority(value.priority) &&
    isNullableString(value.projectId) &&
    isNullableString(value.projectName) &&
    isNullableString(value.clientId) &&
    isNullableString(value.clientName) &&
    isNullableString(value.scheduledDate) &&
    isNullableString(value.dueAt) &&
    isNullableNumber(value.estimatedMinutes) &&
    isNullableNumber(value.actualMinutes) &&
    typeof value.isPublicToClient === 'boolean' &&
    typeof value.updatedAt === 'string'
  );
}

export function isTaskDetail(value: unknown): value is TaskDetail {
  if (!isRecord(value)) {
    return false;
  }

  const record = value;
  return (
    isTaskListItem(value) &&
    isLocalizedTextPayload(record['translations']) &&
    isNullableString(record['version'])
  );
}

export function isTaskMutationPayload(value: unknown): value is TaskMutationPayload {
  return (
    isRecord(value) &&
    isLocalizedTextPayload(value.translations) &&
    (value.status === undefined || isTaskStatus(value.status)) &&
    (value.priority === undefined || isTaskPriority(value.priority)) &&
    isOptionalNullableString(value.projectId) &&
    isOptionalNullableString(value.clientId) &&
    isOptionalNullableString(value.scheduledDate) &&
    isOptionalNullableString(value.dueAt) &&
    isOptionalNullableNumber(value.estimatedMinutes) &&
    isOptionalNullableNumber(value.actualMinutes) &&
    (value.isPublicToClient === undefined || typeof value.isPublicToClient === 'boolean') &&
    isOptionalNullableString(value.version)
  );
}

export function isTaskStatusMutationPayload(value: unknown): value is TaskStatusMutationPayload {
  return (
    isRecord(value) &&
    isTaskStatus(value.status) &&
    (value.position === undefined || typeof value.position === 'number') &&
    isOptionalNullableString(value.version)
  );
}

export function isCalendarEvent(value: unknown): value is CalendarEvent {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    isCalendarEventType(value.type) &&
    isCalendarEventSource(value.source) &&
    typeof value.startAt === 'string' &&
    typeof value.endAt === 'string' &&
    typeof value.readOnly === 'boolean' &&
    isNullableString(value.projectId) &&
    isNullableString(value.clientId) &&
    isNullableString(value.taskId)
  );
}

export function isCalendarRangeResponse(value: unknown): value is CalendarRangeResponse {
  return (
    isRecord(value) &&
    typeof value.from === 'string' &&
    typeof value.to === 'string' &&
    typeof value.timezone === 'string' &&
    Array.isArray(value.items) &&
    value.items.every(isCalendarEvent)
  );
}

export function isCalendarEventDetail(value: unknown): value is CalendarEventDetail {
  if (!isRecord(value)) {
    return false;
  }

  const record = value;
  return (
    isCalendarEvent(value) &&
    isLocalizedTextPayload(record['translations']) &&
    isNullableString(record['version'])
  );
}

export function isCalendarEventMutationPayload(value: unknown): value is CalendarEventMutationPayload {
  return (
    isRecord(value) &&
    isCalendarEventType(value.type) &&
    typeof value.startAt === 'string' &&
    typeof value.endAt === 'string' &&
    isLocalizedTextPayload(value.translations) &&
    isOptionalNullableString(value.projectId) &&
    isOptionalNullableString(value.clientId) &&
    isOptionalNullableString(value.taskId) &&
    isOptionalNullableString(value.version)
  );
}

export function isFinanceSummary(value: unknown): value is FinanceSummary {
  if (!isRecord(value) || !isRecord(value.totals)) {
    return false;
  }

  return (
    typeof value.generatedAt === 'string' &&
    isDateMonth(value.month) &&
    isNullableString(value.taxDisclaimer) &&
    isMoneyAmount(value.totals.income) &&
    isMoneyAmount(value.totals.expense) &&
    isMoneyAmount(value.totals.gross) &&
    isMoneyAmount(value.totals.net) &&
    isMoneyAmount(value.totals.pending) &&
    (value.totals.taxEstimate === null || isMoneyAmount(value.totals.taxEstimate))
  );
}

export function isMultiCurrencyFinanceSummary(value: unknown): value is MultiCurrencyFinanceSummary {
  if (!isRecord(value) || !Array.isArray(value.currencies)) return false;
  return isIsoInstant(value.generatedAt) && isDateMonth(value.month) && isNullableString(value.taxDisclaimer) &&
    value.currencies.every((group, index, groups) => {
      if (!isRecord(group) || !/^[A-Z]{3}$/.test(String(group.currency))) return false;
      const previous = groups[index - 1];
      return isFinanceSummary({
        generatedAt: value.generatedAt,
        month: value.month,
        taxDisclaimer: value.taxDisclaimer,
        totals: group.totals,
      }) && (index === 0 || (isRecord(previous) && String(previous.currency) < String(group.currency)));
    });
}

export function isFinanceTransactionListItem(value: unknown): value is FinanceTransactionListItem {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    isFinanceTransactionKind(value.kind) &&
    isFinancePaymentStatus(value.paymentStatus) &&
    isMoneyAmount(value.amount) &&
    isDateOnly(value.date) &&
    typeof value.category === 'string' &&
    isNullableString(value.description) &&
    isNullableString(value.projectId) &&
    isNullableString(value.projectName) &&
    isNullableString(value.clientId) &&
    isNullableString(value.clientName) &&
    typeof value.updatedAt === 'string'
  );
}

export function isFinanceTransactionDetail(value: unknown): value is FinanceTransactionDetail {
  if (!isRecord(value)) return false;
  const record = value;
  return (
    isFinanceTransactionListItem(value) &&
    isLocalizedFinancePayload(record['translations']) &&
    isNullableString(record['version'])
  );
}

export function isFinanceTransactionMutationPayload(
  value: unknown,
): value is FinanceTransactionMutationPayload {
  return (
    isRecord(value) &&
    typeof value.amountMinor === 'number' &&
    Number.isSafeInteger(value.amountMinor) &&
    value.amountMinor > 0 &&
    typeof value.currency === 'string' &&
    /^[A-Z]{3}$/.test(value.currency) &&
    isDateOnly(value.date) &&
    isFinanceTransactionKind(value.kind) &&
    isFinancePaymentStatus(value.paymentStatus) &&
    isLocalizedFinancePayload(value.translations) &&
    isOptionalNullableString(value.projectId) &&
    isOptionalNullableString(value.clientId) &&
    isOptionalNullableString(value.version)
  );
}

export function isFinanceAnalysis(value: unknown): value is FinanceAnalysis {
  return (
    isRecord(value) &&
    typeof value.generatedAt === 'string' &&
    typeof value.summary === 'string' &&
    Array.isArray(value.recommendations) &&
    value.recommendations.every((item) => typeof item === 'string') &&
    isNullableString(value.disclaimer)
  );
}

export function isJournalEntryListItem(value: unknown): value is JournalEntryListItem {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    isDateOnly(value.date) &&
    isNullableJournalScore(value.mood) &&
    isNullableJournalScore(value.energy) &&
    isNullableJournalScore(value.satisfaction) &&
    typeof value.moodLabel === 'string' &&
    typeof value.updatedAt === 'string'
  );
}

export function isJournalRangeResponse(value: unknown): value is JournalRangeResponse {
  return (
    isRecord(value) &&
    isDateOnly(value.from) &&
    isDateOnly(value.to) &&
    Array.isArray(value.items) &&
    value.items.every(isJournalEntryListItem)
  );
}

export function isJournalEntryDetail(value: unknown): value is JournalEntryDetail {
  if (!isRecord(value)) return false;
  const record = value;
  return (
    isJournalEntryListItem(value) &&
    isLocalizedJournalPayload(record['translations']) &&
    isNullableString(record['version'])
  );
}

export function isJournalEntryMutationPayload(value: unknown): value is JournalEntryMutationPayload {
  return (
    isRecord(value) &&
    isNullableJournalScore(value.mood) &&
    isNullableJournalScore(value.energy) &&
    isNullableJournalScore(value.satisfaction) &&
    typeof value.sourceLocale === 'string' &&
    value.sourceLocale.length > 0 &&
    isLocalizedJournalPayload(value.translations) &&
    isOptionalNullableString(value.version)
  );
}

export function isChatSession(value: unknown): value is ChatSession {
  return isRecord(value) && typeof value.id === 'string' && typeof value.title === 'string' &&
    isNullableString(value.lastMessagePreview) && typeof value.createdAt === 'string' && typeof value.updatedAt === 'string';
}

export function isChatMessage(value: unknown): value is ChatMessage {
  return isRecord(value) && typeof value.id === 'string' && isChatMessageRole(value.role) &&
    typeof value.content === 'string' && isNullableString(value.sourceLocale) && typeof value.createdAt === 'string';
}

export function isChatMessageMutationPayload(value: unknown): value is ChatMessageMutationPayload {
  return isRecord(value) && typeof value.content === 'string' && value.content.trim().length > 0 &&
    typeof value.sourceLocale === 'string' && value.sourceLocale.length > 0;
}

export function isChatStreamEvent(value: unknown): value is ChatStreamEvent {
  if (!isRecord(value) || typeof value.type !== 'string') return false;
  if (value.type === 'message.delta') return typeof value.delta === 'string';
  if (value.type === 'message.completed') return isChatMessage(value.message);
  return value.type === 'error' && isUpstreamErrorCode(value.code) && typeof value.message === 'string';
}

export function isProjectRiskAnalysis(value: unknown): value is ProjectRiskAnalysis {
  return isRecord(value) && typeof value.projectId === 'string' &&
    (value.riskLevel === 'low' || value.riskLevel === 'medium' || value.riskLevel === 'high') &&
    typeof value.summary === 'string' && Array.isArray(value.recommendations) &&
    value.recommendations.every((item) => typeof item === 'string') && typeof value.generatedAt === 'string';
}

export function isAuthSessionInfo(value: unknown): value is AuthSessionInfo {
  return isRecord(value) && typeof value.id === 'string' && typeof value.deviceLabel === 'string' &&
    typeof value.current === 'boolean' && typeof value.createdAt === 'string' && typeof value.lastActiveAt === 'string';
}

export function isDeviceSessionInfo(value: unknown): value is DeviceSessionInfo {
  if (!isRecord(value)) return false;
  const record = value;
  return isAuthSessionInfo(value) &&
    (record.platform === 'android' || record.platform === 'ios' || record.platform === 'unknown') &&
    (record.revokedAt === null || isIsoInstant(record.revokedAt));
}

export function isPairingChallenge(value: unknown): value is PairingChallenge {
  return isRecord(value) && typeof value.challengeId === 'string' && isIsoInstant(value.expiresAt) &&
    typeof value.manualCode === 'string' && typeof value.qrPayload === 'string';
}

export function isDeviceTokenPair(value: unknown): value is DeviceTokenPair {
  return isRecord(value) && typeof value.accessToken === 'string' && isIsoInstant(value.accessExpiresAt) &&
    typeof value.refreshToken === 'string' && isIsoInstant(value.refreshExpiresAt) &&
    value.tokenType === 'Bearer' && (value.deviceSessionId === undefined || typeof value.deviceSessionId === 'string');
}

export function isGeneralSettings(value: unknown): value is GeneralSettings {
  return isRecord(value) && typeof value.workspaceName === 'string' && isNullableString(value.companyName) && isNullableString(value.portalFooter);
}

export function isAppearanceSettings(value: unknown): value is AppearanceSettings {
  return isRecord(value) && isNullableString(value.primaryColor) && isNullableString(value.accentColor) &&
    (value.defaultColorMode === 'light' || value.defaultColorMode === 'dark' || value.defaultColorMode === 'system') &&
    (value.radiusScale === 'compact' || value.radiusScale === 'default' || value.radiusScale === 'soft') &&
    isNullableString(value.lightLogoUrl) && isNullableString(value.darkLogoUrl) && isNullableString(value.faviconUrl);
}

export function isAppearanceAsset(value: unknown): value is AppearanceAsset {
  return isRecord(value) && (value.kind === 'lightLogo' || value.kind === 'darkLogo' || value.kind === 'favicon') &&
    (value.mimeType === 'image/png' || value.mimeType === 'image/jpeg' || value.mimeType === 'image/webp') && typeof value.url === 'string';
}

export function isAiSettings(value: unknown): value is AiSettings {
  return isRecord(value) && typeof value.configured === 'boolean' && isNullableString(value.maskedKey) &&
    isNullableString(value.model) && (value.provider === null || value.provider === 'gemini' || value.provider === 'openai' || value.provider === 'groq' || value.provider === 'ollama');
}

export function isLocaleDefinition(value: unknown): value is LocaleDefinition {
  return isRecord(value) && typeof value.code === 'string' && typeof value.name === 'string' &&
    (value.status === 'draft' || value.status === 'active' || value.status === 'archived') &&
    typeof value.isDefault === 'boolean' && (value.textDirection === 'ltr' || value.textDirection === 'rtl') && isNullableString(value.fallbackLocale) &&
    typeof value.completion === 'number' && value.completion >= 0 && value.completion <= 100 && typeof value.updatedAt === 'string';
}

export function isTranslationCatalog(value: unknown): value is TranslationCatalog {
  return isRecord(value) && typeof value.locale === 'string' && typeof value.version === 'number' && Number.isSafeInteger(value.version) &&
    isRecord(value.messages) && Object.values(value.messages).every((message) => typeof message === 'string');
}

export function isPortalProjectSummary(value: unknown): value is PortalProjectSummary {
  return isRecord(value) && typeof value.id === 'string' && typeof value.title === 'string' &&
    isNullableString(value.description) && isNullableString(value.dueDate) &&
    typeof value.progress === 'number' && value.progress >= 0 && value.progress <= 100 &&
    isProjectStatus(value.status) && typeof value.updatedAt === 'string';
}

export function isPortalDashboard(value: unknown): value is PortalDashboard {
  return isRecord(value) && typeof value.generatedAt === 'string' && typeof value.locale === 'string' &&
    isStringArray(value.fallbackChain) && isNullableString(value.portalFooter) &&
    Array.isArray(value.projects) && value.projects.every(isPortalProjectSummary) &&
    isRecord(value.stats) && isNonNegativeInteger(value.stats.activeProjects) &&
    isNonNegativeInteger(value.stats.completedProjects) && isNonNegativeInteger(value.stats.completedTasks) &&
    isNonNegativeInteger(value.stats.pendingRevisions);
}

export function isPortalTask(value: unknown): value is PortalTask {
  return isRecord(value) && typeof value.id === 'string' && typeof value.title === 'string' &&
    isNullableString(value.description) && typeof value.projectId === 'string' &&
    typeof value.projectName === 'string' && isTaskStatus(value.status) && isTaskPriority(value.priority) &&
    isNullableString(value.dueAt) && value.isPublicToClient === true && typeof value.updatedAt === 'string';
}

export function isPortalAsset(value: unknown): value is PortalAsset {
  return isRecord(value) && typeof value.id === 'string' && typeof value.name === 'string' &&
    typeof value.mimeType === 'string' && isNonNegativeInteger(value.sizeBytes) &&
    typeof value.url === 'string' && isAbsoluteHttpUrl(value.url) && value.visibility === 'portal';
}

export function isPortalRevision(value: unknown): value is PortalRevision {
  return isRecord(value) && typeof value.id === 'string' && typeof value.projectId === 'string' &&
    typeof value.projectName === 'string' && typeof value.description === 'string' &&
    typeof value.sourceLocale === 'string' && isPortalRevisionStatus(value.status) &&
    typeof value.createdAt === 'string' && typeof value.updatedAt === 'string';
}

export function isPortalRevisionAllowance(value: unknown): value is PortalRevisionAllowance {
  return isRecord(value) && isNullableNonNegativeInteger(value.allowed) &&
    isNullableNonNegativeInteger(value.remaining) && isNonNegativeInteger(value.used) &&
    typeof value.canRequest === 'boolean';
}

export function isPortalProjectDetail(value: unknown): value is PortalProjectDetail {
  if (!isRecord(value)) return false;
  const record = value;
  return isLocalizedResponse(value, isPortalProjectResource, isPortalProjectLocalized) &&
    Array.isArray(record.planningSections) && record.planningSections.every(isPortalPlanningSection) &&
    Array.isArray(record.publicTasks) && record.publicTasks.every(isPortalTask) &&
    Array.isArray(record.assets) && record.assets.every(isPortalAsset) &&
    Array.isArray(record.revisions) && record.revisions.every(isPortalRevision) &&
    isPortalRevisionAllowance(record.revisionAllowance);
}

export function isPortalProfile(value: unknown): value is PortalProfile {
  return isRecord(value) && typeof value.name === 'string' && isNullableString(value.email) &&
    isNullableString(value.avatarUrl) && isNullableString(value.clientDefaultLocale) &&
    isRecord(value.preferences) &&
    (value.preferences.colorMode === 'light' || value.preferences.colorMode === 'dark' || value.preferences.colorMode === 'system') &&
    typeof value.preferences.locale === 'string' && isNullableString(value.preferences.timezone);
}

export function isPortalLocalizedPage<T>(value: unknown, isItem: (candidate: unknown) => candidate is T): value is PortalLocalizedPage<T> {
  if (!isRecord(value)) return false;
  const record = value;
  return isPaginatedResponse(value, isItem) && typeof record.locale === 'string' && isStringArray(record.fallbackChain);
}

export function isFileAsset(value: unknown): value is FileAsset {
  return isRecord(value) && typeof value.id === 'string' && isFileAssetKind(value.kind) &&
    typeof value.name === 'string' && value.name.length > 0 && value.name.length <= 160 &&
    typeof value.mimeType === 'string' && isNonNegativeInteger(value.sizeBytes) &&
    typeof value.url === 'string' && isAbsoluteHttpUrl(value.url) &&
    isFileVisibility(value.visibility) && isNullableString(value.projectId) &&
    typeof value.metadataSanitized === 'boolean' && typeof value.createdAt === 'string';
}

export function createIdempotencyKey(prefix = 'mobile'): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function isApiError(value: unknown): value is ApiError {
  return isRecord(value) && typeof value.code === 'string' && typeof value.message === 'string';
}

function isDashboardRange(value: unknown): value is DashboardRange {
  return value === 'today' || value === 'this_week' || value === 'this_month' || value === 'this_year';
}

function isClientStatus(value: unknown): value is ClientStatus {
  return value === 'active' || value === 'paused' || value === 'archived';
}

function isClientPipelineStatus(value: unknown): value is ClientPipelineStatus {
  return value === 'lead' || value === 'contacted' || value === 'proposal_sent' || value === 'won' || value === 'lost';
}

function isProjectStatus(value: unknown): value is ProjectStatus {
  return value === 'planning' || value === 'active' || value === 'paused' || value === 'completed' || value === 'cancelled';
}

function isProjectType(value: unknown): value is ProjectType {
  return value === 'client_project' || value === 'side_project';
}

function isProjectProgressType(value: unknown): value is ProjectProgressType {
  return value === 'manual' || value === 'auto';
}

function isTaskStatus(value: unknown): value is TaskStatus {
  return value === 'todo' || value === 'in_progress' || value === 'done' || value === 'cancelled';
}

function isTaskPriority(value: unknown): value is TaskPriority {
  return value === 'low' || value === 'medium' || value === 'high' || value === 'urgent';
}

function isCalendarEventType(value: unknown): value is CalendarEventType {
  return value === 'meeting' || value === 'focus' || value === 'deadline' || value === 'personal' || value === 'finance';
}

function isCalendarEventSource(value: unknown): value is CalendarEventSource {
  return value === 'calendar' || value === 'task' || value === 'finance';
}

function isFinanceTransactionKind(value: unknown): value is FinanceTransactionKind {
  return value === 'income' || value === 'expense';
}

function isFinancePaymentStatus(value: unknown): value is FinancePaymentStatus {
  return value === 'planned' || value === 'pending' || value === 'paid' || value === 'cancelled';
}

function isJournalScore(value: unknown): value is JournalScore {
  return value === 1 || value === 2 || value === 3 || value === 4 || value === 5;
}

function isNullableJournalScore(value: unknown): value is JournalScore | null {
  return value === null || isJournalScore(value);
}

function isChatMessageRole(value: unknown): value is ChatMessageRole {
  return value === 'system' || value === 'user' || value === 'assistant' || value === 'tool';
}

function isUpstreamErrorCode(value: unknown): value is 'UPSTREAM_ERROR' | 'UPSTREAM_TIMEOUT' | 'SERVICE_UNAVAILABLE' {
  return value === 'UPSTREAM_ERROR' || value === 'UPSTREAM_TIMEOUT' || value === 'SERVICE_UNAVAILABLE';
}

function isDateOnly(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isDateMonth(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}$/.test(value);
}

function isIsoInstant(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value) && !Number.isNaN(Date.parse(value));
}

function isLocalizedFinancePayload(value: unknown): value is LocalizedFinancePayload {
  return (
    isRecord(value) &&
    Object.values(value).every(
      (item) =>
        isRecord(item) &&
        typeof item.category === 'string' &&
        (item.description === undefined || isNullableString(item.description)),
    )
  );
}

function isLocalizedJournalPayload(value: unknown): value is LocalizedJournalPayload {
  return (
    isRecord(value) &&
    Object.values(value).every(
      (item) => isRecord(item) && typeof item.moodLabel === 'string' && typeof item.note === 'string',
    )
  );
}

function isNullableString(value: unknown): value is string | null {
  return typeof value === 'string' || value === null;
}

function hasConsistentCapabilities(capabilities: unknown, details: unknown): boolean {
  if (!Array.isArray(capabilities) || !capabilities.every(isNonEmptyString) ||
    !Array.isArray(details) || !details.every(isNetaCapability)) return false;
  return capabilities.every((id) => details.some((capability) =>
    capability.id === id && capability.status === 'available'));
}

function isNetaBootstrapLocale(value: unknown): value is NetaBootstrapLocale {
  return isRecord(value) && isNonEmptyString(value.code) && isNonEmptyString(value.name) &&
    isNonEmptyString(value.nativeName) && isNonEmptyString(value.status) &&
    (value.textDirection === 'ltr' || value.textDirection === 'rtl');
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isColorMode(value: unknown): value is NetaColorMode {
  return value === 'light' || value === 'dark' || value === 'system';
}

function isValidIanaTimeZone(value: unknown): value is string {
  if (!isNonEmptyString(value) || value.length > 64) return false;
  try {
    new Intl.DateTimeFormat('en', { timeZone: value }).format();
    return true;
  } catch {
    return false;
  }
}

function isNullableAbsoluteHttpUrl(value: unknown): value is string | null {
  return value === null || (typeof value === 'string' && isAbsoluteHttpUrl(value));
}

function hasOnlyKeys(value: Record<string, unknown>, keys: readonly string[]): boolean {
  const allowed = new Set(keys);
  return Object.keys(value).every((key) => allowed.has(key));
}

function isNullableNumber(value: unknown): value is number | null {
  return typeof value === 'number' || value === null;
}

function isOptionalNullableString(value: unknown): boolean {
  return value === undefined || isNullableString(value);
}

function isOptionalNullableNumber(value: unknown): boolean {
  return value === undefined || isNullableNumber(value);
}

function isLocalizedTextPayload(value: unknown): value is LocalizedTextPayload {
  return (
    isRecord(value) &&
    Object.values(value).every(
      (item) =>
        isRecord(item) &&
        typeof item.name === 'string' &&
        (item.description === undefined ||
          typeof item.description === 'string' ||
          item.description === null),
    )
  );
}

function isPortalProjectResource(value: unknown): value is PortalProjectResource {
  return isRecord(value) && typeof value.id === 'string' && isNullableString(value.dueDate) &&
    typeof value.progress === 'number' && value.progress >= 0 && value.progress <= 100 &&
    isProjectStatus(value.status) && typeof value.updatedAt === 'string';
}

function isPortalProjectLocalized(value: unknown): value is PortalProjectLocalized {
  return isRecord(value) && typeof value.title === 'string' && isNullableString(value.description);
}

function isPortalPlanningSection(value: unknown): value is PortalPlanningSection {
  return isRecord(value) && typeof value.id === 'string' && typeof value.order === 'number' &&
    typeof value.title === 'string' && isNullableString(value.description);
}

function isPortalRevisionStatus(value: unknown): value is PortalRevisionStatus {
  return value === 'pending' || value === 'in_progress' || value === 'completed' || value === 'rejected';
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.length > 0 && value.every((item) => typeof item === 'string' && item.length > 0);
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}

function isNullableNonNegativeInteger(value: unknown): value is number | null {
  return value === null || isNonNegativeInteger(value);
}

function isAbsoluteHttpUrl(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

function isFileAssetKind(value: unknown): value is FileAssetKind {
  return value === 'avatar' || value === 'branding_logo' || value === 'branding_icon' || value === 'project_asset';
}

function isFileVisibility(value: unknown): value is FileVisibility {
  return value === 'private' || value === 'portal' || value === 'public_branding';
}

function isDashboardStat(value: unknown): value is DashboardStat {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.label === 'string' &&
    (typeof value.value === 'number' || typeof value.value === 'string' || isMoneyAmount(value.value)) &&
    (typeof value.trendLabel === 'string' || value.trendLabel === null)
  );
}

function isDashboardListItem(value: unknown): value is DashboardListItem {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    (typeof value.subtitle === 'string' || value.subtitle === null) &&
    (typeof value.status === 'string' || value.status === null)
  );
}

function isAnalyticsPoint(value: unknown): value is AnalyticsPoint {
  return (
    isRecord(value) &&
    typeof value.label === 'string' &&
    (typeof value.value === 'number' || isMoneyAmount(value.value))
  );
}

function isMoneyAmount(value: unknown): value is MoneyAmount {
  return (
    isRecord(value) &&
    typeof value.amountMinor === 'number' &&
    Number.isInteger(value.amountMinor) &&
    typeof value.currency === 'string' &&
    /^[A-Z]{3}$/.test(value.currency)
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
