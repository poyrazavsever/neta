import fs from 'node:fs';
import path from 'node:path';
import { root, pipeline, readJson, sha256, pageFolder, writeJson } from './lib.mjs';

const pages = readJson(path.join(pipeline, 'inventory/pages.json')).pages;
const assets = readJson(path.join(pipeline, 'inventory/assets.json')).assets;
const errors = []; const missing = []; let captures = 0;
const identities = new Set();
for (const page of pages) {
  const identity = `${page.platform}/${page.actor}/${page.id}`;
  if (identities.has(identity)) errors.push(`Duplicate page: ${identity}`); identities.add(identity);
  if (!fs.existsSync(path.join(root, page.source))) errors.push(`Missing source: ${page.source}`);
  const folder = pageFolder(page);
  const plan = readJson(path.join(folder, 'plan.json'));
  if (!Array.isArray(plan.states) || !Array.isArray(plan.assetRequests)) errors.push(`Invalid plan: ${identity}`);
  const manifest = path.join(folder, 'screenshots/manifest.json');
  const recorded = fs.existsSync(manifest) ? readJson(manifest).captures : [];
  for (const theme of ['light', 'dark']) if (!recorded.some((item) => item.theme === theme)) missing.push(`${identity}/${theme}`);
  for (const capture of recorded) {
    captures++;
    const file = path.resolve(root, capture.file);
    if (!file.startsWith(`${folder}${path.sep}`) || !fs.existsSync(file)) { errors.push(`Missing/unsafe PNG: ${capture.file}`); continue; }
    const bytes = fs.readFileSync(file);
    if (sha256(bytes) !== capture.sha256 || bytes.length !== capture.bytes || bytes.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a'
      || bytes.readUInt32BE(16) !== capture.width || bytes.readUInt32BE(20) !== capture.height) errors.push(`PNG integrity: ${capture.file}`);
    if (capture.fixture !== 'ui-assets-v1' || !capture.capturedAt || !capture.route) errors.push(`Missing provenance: ${capture.file}`);
    if (page.platform === 'mobile') {
      const expectedPath = page.actor === 'public' && page.id === 'home' ? '/login' : new URL(capture.route.replace(/\/\([^/]+\)/g, '') || '/', 'https://capture.invalid').pathname;
      if (capture.captureVersion !== 'native-v2-clean' || !capture.renderedRoute || capture.renderedRoute.pathname !== expectedPath || capture.renderedRoute.theme !== capture.theme
        || (page.actor === 'public' ? capture.renderedRoute.status !== 'unauthenticated' : capture.renderedRoute.role !== (page.actor === 'owner' ? 'freelancer' : 'client'))) errors.push(`Unverified native route/role/theme: ${capture.file}`);
    }
    if (/[?&](?:token|code|secret|password)=|Bearer\s+\S+/i.test(JSON.stringify(capture))) errors.push(`Sensitive metadata: ${capture.file}`);
  }
}
for (const asset of assets) for (const key of ['source', 'archive']) {
  const file = path.resolve(root, asset[key]);
  if (!file.startsWith(`${root}${path.sep}`) || !fs.existsSync(file) || sha256(fs.readFileSync(file)) !== asset.sha256) errors.push(`Asset integrity: ${asset[key]}`);
}
if (process.argv.includes('--require-complete')) errors.push(...missing.map((item) => `Missing capture: ${item}`));
writeJson(path.join(pipeline, 'reports/assets-health.json'), { schemaVersion: 1, checkedAt: new Date().toISOString(),
  requireComplete: process.argv.includes('--require-complete'), pages: pages.length, assets: assets.length, captures,
  missingThemeCaptures: missing, errors, passed: errors.length === 0, baselineApproval: 'pending-review', nativeRuntime: 'android-debug-dev-client' });
console.log(`UI assets: ${pages.length} pages, ${assets.length} assets, ${captures} captures; ${missing.length} missing theme captures.`);
for (const error of errors) console.error(error);
if (errors.length) process.exitCode = 1;
