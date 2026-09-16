const path = require('node:path');

const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');
const config = getDefaultConfig(projectRoot);
config.watchFolders = (config.watchFolders ?? []).filter((folder) =>
  folder !== path.join(monorepoRoot, 'apps/neta-app') && folder !== path.join(monorepoRoot, 'apps/neta-web'));

// Other apps' disposable build/DB output must never be crawled by Metro.
// Their cleanup can otherwise race Windows FSWatcher and crash the dev server.
const ignoredWorkspaceOutput = /[/\\](?:\.next[^/\\]*|\.data|\.artifacts|\.tooling|assets-pipeline)[/\\]/;
const defaultBlockList = config.resolver.blockList;
config.resolver.blockList = [
  ...(Array.isArray(defaultBlockList) ? defaultBlockList : defaultBlockList ? [defaultBlockList] : []),
  ignoredWorkspaceOutput,
];

const workspaceAliases = new Map([
  ['@neta/api-contracts', path.join(monorepoRoot, 'packages/api-contracts/src/index.ts')],
  ['@neta/design-tokens', path.join(monorepoRoot, 'packages/design-tokens/src/index.ts')],
]);

const defaultResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  const alias = workspaceAliases.get(moduleName);

  if (alias) {
    return {
      filePath: alias,
      type: 'sourceFile',
    };
  }

  if (defaultResolveRequest) {
    return defaultResolveRequest(context, moduleName, platform);
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
