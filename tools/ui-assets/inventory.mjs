import fs from 'node:fs';
import { initialBrief } from './brief.mjs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { root, pipeline, walk, relative, slash, sha256, writeJson, pageFolder } from './lib.mjs';

const platforms = [
  { id: 'mobile', app: 'apps/neta-mobile', routes: 'src/app', assets: ['assets'], alias: 'src' },
  { id: 'app', app: 'apps/neta-app', routes: 'app', assets: ['public'], alias: '' },
  { id: 'web', app: 'apps/neta-web', routes: 'app', assets: ['public', 'refs'], alias: '' },
];
const assetPattern = /\.(png|jpe?g|svg|webp|gif|ico|mp4|webm|woff2?|ttf|otf|mp3|wav)$/i;
const assets = [];
for (const platform of platforms) for (const directory of platform.assets) {
  for (const source of walk(path.join(root, platform.app, directory)).filter((file) => assetPattern.test(file))) {
    const bytes = fs.readFileSync(source);
    const copy = path.join(pipeline, 'shared', platform.id, 'originals', path.relative(path.join(root, platform.app), source));
    fs.mkdirSync(path.dirname(copy), { recursive: true });
    if (!fs.existsSync(copy) || sha256(fs.readFileSync(copy)) !== sha256(bytes)) fs.writeFileSync(copy, bytes);
    assets.push({ id: relative(source), platform: platform.id, source: relative(source), archive: relative(copy), bytes: bytes.length, sha256: sha256(bytes), role: directory === 'refs' ? 'reference' : 'runtime' });
  }
}
// Shared native navigation graphics and the Android icon font are shipped
// by installed dependencies, not apps/assets. Keep their provenance explicit.
const mobileRequire = createRequire(path.join(root, 'apps/neta-mobile/package.json'));
const symbolsRequire = createRequire(mobileRequire.resolve('expo-symbols'));
const dependencyRoots = [
  { name: 'expo-router', directory: path.join(path.dirname(mobileRequire.resolve('expo-router/package.json')), 'assets') },
  { name: 'material-symbols', directory: path.join(path.dirname(symbolsRequire.resolve('@expo-google-fonts/material-symbols/package.json')), '400Regular') },
];
for (const dependency of dependencyRoots) for (const source of walk(dependency.directory).filter((file) => assetPattern.test(file) || file.endsWith('.xml'))) {
  const bytes = fs.readFileSync(source);
  const copy = path.join(pipeline, 'shared/mobile/originals/dependencies', dependency.name, path.relative(dependency.directory, source));
  fs.mkdirSync(path.dirname(copy), { recursive: true });
  if (!fs.existsSync(copy) || sha256(fs.readFileSync(copy)) !== sha256(bytes)) fs.writeFileSync(copy, bytes);
  assets.push({ id: relative(source), platform: 'mobile', source: relative(source), archive: relative(copy),
    bytes: bytes.length, sha256: sha256(bytes), role: source.endsWith('.ttf.png') ? 'dependency-reference' : 'dependency-runtime', package: dependency.name });
}
function dependencies(source, platform, visited = new Set()) {
  if (visited.has(source) || !fs.existsSync(source)) return visited;
  visited.add(source);
  if (!/\.(tsx?|jsx?|css)$/.test(source)) return visited;
  const text = fs.readFileSync(source, 'utf8');
  const imports = [...text.matchAll(/(?:from\s*|import\s*|require\s*\()(['"])([^'"]+)\1/g)].map((match) => match[2]);
  for (const value of imports) {
    const target = value.startsWith('@/') ? path.join(root, platform.app, platform.alias, value.slice(2))
      : value.startsWith('.') ? path.resolve(path.dirname(source), value) : null;
    if (!target) continue;
    const resolved = [target, ...['.tsx', '.ts', '.js', '.css', '/index.tsx', '/index.ts'].map((extension) => target + extension)]
      .find((file) => fs.existsSync(file) && fs.statSync(file).isFile());
    if (resolved) dependencies(resolved, platform, visited);
  }
  return visited;
}
const pages = [];
for (const platform of platforms) {
  const routesRoot = path.join(root, platform.app, platform.routes);
  const sources = walk(routesRoot).filter((file) => platform.id === 'mobile'
    ? file.endsWith('.tsx') && !/^(?:_|\+|index\.tsx$)/.test(path.basename(file))
    : path.basename(file) === 'page.tsx');
  // Index routes are pages; layouts and native intent hooks are infrastructure.
  if (platform.id === 'mobile') sources.push(...walk(routesRoot).filter((file) => path.basename(file) === 'index.tsx'));
  for (const source of [...new Set(sources)].sort()) {
    let route = slash(path.relative(routesRoot, source)).replace(/(?:\/)?(?:page|index)\.tsx$/, '').replace(/\.tsx$/, '');
    const group = route.match(/^\(([^)]+)\)/)?.[1];
    const actor = platform.id === 'web' ? 'public' : route.includes('portal') ? 'client'
      : platform.id === 'app' && route.startsWith('(dashboard)') || ['owner', 'forms'].includes(group) ? 'owner' : 'public';
    route = `/${route.split('/').filter((part) => !/^\(.*\)$/.test(part)).join('/')}`;
    const id = (route === '/' ? 'home' : route.slice(1)).replace(/\[\[?\.\.\.(.*?)\]\]?/g, '$1').replace(/\[(.*?)\]/g, '$1').replace(/[^a-z0-9-]/gi, '-').replace(/-+/g, '-');
    const graph = dependencies(source, platform);
    let parent = path.dirname(source);
    while (parent.startsWith(routesRoot)) {
      for (const layout of ['layout.tsx', '_layout.tsx']) dependencies(path.join(parent, layout), platform, graph);
      if (parent === routesRoot) break;
      parent = path.dirname(parent);
    }
    const used = new Set([...graph].map(relative));
    if (platform.id === 'mobile') for (const asset of assets.filter((item) => item.role === 'dependency-runtime')) used.add(asset.id);
    for (const file of graph) {
      if (!/\.(tsx?|jsx?|css)$/.test(file)) continue;
      const text = fs.readFileSync(file, 'utf8');
      for (const asset of assets.filter((item) => item.platform === platform.id)) {
        const publicPath = asset.source.split('/public/')[1];
        if (publicPath && text.includes(`/${publicPath}`)) used.add(asset.source);
      }
    }
    pages.push({ id, platform: platform.id, actor, source: relative(source), route,
      dependencies: [...graph].filter((file) => fs.existsSync(file)).map(relative).sort(),
      assets: assets.filter((asset) => used.has(asset.source)).map((asset) => asset.id),
      parameters: [...route.matchAll(/\[+(?:\.\.\.)?([^\]]+)\]+/g)].map((match) => match[1]) });
  }
}
for (const page of pages) {
  const directory = pageFolder(page);
  writeJson(path.join(directory, 'page.json'), page);
  for (const folder of ['screenshots', 'assets/source', 'assets/export', 'design', 'reviews']) {
    const target = path.join(directory, folder);
    fs.mkdirSync(target, { recursive: true });
    fs.writeFileSync(path.join(target, '.gitkeep'), '');
  }
  const plan = path.join(directory, 'plan.json');
  if (!fs.existsSync(plan)) writeJson(plan, { status: 'baseline', ...initialBrief(page), userProblems: [],
    states: ['default', 'loading', 'empty', 'error', 'offline', 'validation', 'permission-denied'],
    variants: { themes: ['light', 'dark'], locales: ['tr', 'en'], sizes: page.platform === 'mobile' ? ['phone', 'tablet'] : ['desktop', 'narrow'] },
    assetRequests: [], acceptance: ['a11y', 'functional', 'visual', 'localization'], implementationStarted: false });
  else {
    const existing = JSON.parse(fs.readFileSync(plan, 'utf8'));
    if (existing.goal === null && existing.primaryAction === null) writeJson(plan, { ...existing, ...initialBrief(page) });
  }
}
writeJson(path.join(pipeline, 'inventory/assets.json'), { schemaVersion: 1, assets });
writeJson(path.join(pipeline, 'inventory/pages.json'), { schemaVersion: 1, pages });
writeJson(path.join(pipeline, 'inventory/docs-pages.json'), { pages: walk(path.join(root, 'apps/neta-web/content/docs')).filter((file) => file.endsWith('.md')).map((source) => {
  const parts = slash(path.relative(path.join(root, 'apps/neta-web/content/docs'), source)).replace(/\.md$/, '').split('/');
  return { source: relative(source), locale: parts[0], route: `/${parts[0]}/docs${parts[1] === 'index' ? '' : `/${parts.slice(1).join('/')}`}` };
}) });
console.log(`UI envanteri: ${pages.length} route, ${assets.length} görsel/medya/font arşivi.`);
