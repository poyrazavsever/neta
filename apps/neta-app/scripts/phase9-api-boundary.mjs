import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const appRoot = process.cwd();
const repoRoot = path.resolve(appRoot, "../..");
const requiredRoutes = [
  "app/.well-known/neta/route.ts",
  "app/api/v1/meta/route.ts",
  "app/api/v1/health/route.ts",
  "app/api/v1/me/route.ts",
  "app/api/v1/me/preferences/route.ts",
  "app/api/v1/localization/catalog/route.ts",
  "app/api/v1/dashboard/overview/route.ts",
  "app/api/v1/clients/route.ts",
  "app/api/v1/clients/[id]/route.ts",
  "app/api/v1/projects/route.ts",
  "app/api/v1/projects/[id]/route.ts",
  "app/api/v1/projects/[id]/planning-sections/route.ts",
  "app/api/v1/projects/[id]/revisions/route.ts",
  "app/api/v1/tasks/route.ts",
  "app/api/v1/tasks/[id]/route.ts",
  "app/api/v1/calendar/events/route.ts",
  "app/api/v1/calendar/events/[id]/route.ts",
  "app/api/v1/[...path]/route.ts",
];
for (const route of requiredRoutes) {
  assert.ok(fs.existsSync(path.join(appRoot, route)), `Missing v1 bootstrap route: ${route}`);
}

const sharedContracts = readRepository("packages/api-contracts/src/index.ts");
for (const value of [
  "NETA_PROTOCOL = 'neta'",
  "NETA_DISCOVERY_VERSION = 1",
  "NETA_API_VERSION = '1'",
  "NETA_CAPABILITY_DETAILS",
  "status: 'planned'",
  "'mobile-v1'",
  "'auth.device-pairing.v1'",
  "'freelancer.dashboard.v1'",
  "NetaDiscoveryDocument",
  "NetaInstanceMetadata",
  "NetaMeProfile",
  "NetaRuntimeCatalog",
  "NetaMePreferencesMutation",
  "PaginatedResponse",
  "MultiCurrencyFinanceSummary",
]) {
  assert.ok(sharedContracts.includes(value), `Missing shared API contract marker: ${value}`);
}

const serverContracts = read("server/api/v1/contracts.ts");
assert.match(serverContracts, /from "@neta\/api-contracts"/, "Backend must consume the shared contract package");
assert.match(serverContracts, /isNetaDiscoveryDocument/, "Discovery presenter must validate its output");
assert.match(serverContracts, /isNetaInstanceMetadata/, "Metadata presenter must validate its output");

const localization = read("server/api/v1/localization.ts");
for (const value of ["parseAcceptLanguage", "negotiateLocale", "UNSUPPORTED_LOCALE", "Accept-Language"]) {
  assert.ok(localization.includes(value), `Missing localization contract marker: ${value}`);
}

const discovery = read("app/.well-known/neta/route.ts");
assert.doesNotMatch(discovery, /getSession|requireSession|authorization/i, "Discovery must remain public");

const meRoute = read("app/api/v1/me/route.ts");
assert.match(meRoute, /requireApiV1Session/, "Me must use the common API session policy");
assert.match(meRoute, /getApiMeProfile/, "Me must use the canonical presenter path");

const preferencesRoute = read("app/api/v1/me/preferences/route.ts");
assert.match(preferencesRoute, /\.strict\(\)/, "Preference mutations must reject unknown fields");
assert.match(preferencesRoute, /locale/, "Preference mutations must expose canonical locale");
assert.match(preferencesRoute, /timezone/, "Preference mutations must validate timezone");

assert.match(read("app/api/v1/meta/route.ts"), /stale-while-revalidate=300/, "Meta must keep public revalidation");
assert.match(read("server/domain/errors.ts"), /METHOD_NOT_ALLOWED/, "v1 must have a stable 405 code");
assert.match(read("server/api/v1/responses.ts"), /X-Content-Type-Options/, "v1 JSON responses must disable MIME sniffing");

for (const fixture of [
  "discovery.json",
  "meta.json",
  "me-owner.json",
  "me-client.json",
  "me-preferences-owner.json",
  "catalog.json",
  "error-validation.json",
  "page.json",
]) {
  JSON.parse(readRepository(`packages/api-contracts/fixtures/${fixture}`));
}

for (const futureRoute of [
  "app/api/v1/pairing",
  "app/api/v1/device-sessions",
]) {
  assert.equal(fs.existsSync(path.join(appRoot, futureRoute)), false, `${futureRoute} must not ship before implementation`);
}

const runtimeFiles = [
  ...requiredRoutes,
  "server/api/v1/auth.ts",
  "server/api/v1/contracts.ts",
  "server/api/v1/localization.ts",
  "server/api/v1/me-profile.ts",
  "server/api/v1/owner-read.ts",
  "server/api/v1/pagination.ts",
  "server/api/v1/presenters.ts",
  "server/api/v1/responses.ts",
  "server/api/v1/runtime.ts",
  "server/instance/service.ts",
];
for (const file of runtimeFiles) {
  assert.doesNotMatch(read(file), /@supabase\/|supabase\.co/i, `Supabase reference in ${file}`);
}

for (const route of requiredRoutes.filter((route) => /dashboard|clients|projects|tasks|calendar/.test(route))) {
  const source = read(route);
  assert.match(source, /requireApiV1Role/, `${route} must derive role from the session`);
  assert.match(source, /apiV1MethodNotAllowed/, `${route} must reject unimplemented writes explicitly`);
}

console.log("API v1 boundary passed: shared bootstrap contracts, truthful capabilities and JSON errors verified.");

function read(relativePath) {
  return fs.readFileSync(path.join(appRoot, relativePath), "utf8");
}

function readRepository(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
}
