import assert from 'node:assert/strict';
import path from 'node:path';
import { createRequire } from 'node:module';
import { nativeCaptureUi as ui } from './capture-mobile.mjs';
import { root, pipeline, readJson, pageFolder, recordScreenshot, writeJson } from './lib.mjs';

const { runtime } = ui;
const databasePath = path.resolve(runtime.databasePath);
if (!databasePath.startsWith(path.join(root, '.artifacts/ui-assets') + path.sep)) throw new Error('Yalnız izole UI fixture DB kabul edilir.');
const appRequire = createRequire(path.join(root, 'apps/neta-app/package.json'));
const Database = appRequire('better-sqlite3');
const db = new Database(databasePath, { readonly: true, fileMustExist: true });
const results = [];
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const pages = readJson(path.join(pipeline, 'inventory/pages.json')).pages;
const fileName = 'ui-native-smoke.png';
const deviceFile = `/sdcard/Download/${fileName}`;
const ownerId = db.prepare('SELECT id FROM user WHERE email = ?').get(runtime.owner.email).id;
// The fixture and diagnostics also create Node sessions; isolate Android's
// installed Expo fetch transport instead of counting every account login.
const sessionIds = () => new Set(db.prepare("SELECT id FROM session WHERE user_id = ? AND lower(user_agent) LIKE 'okhttp/%'").all(ownerId).map((row) => row.id));
let newSessionIds = [];
let signedIn = false;
let pushed = false;
async function captureCurrent(page, state, surface = 'app', route = `/(owner)/projects/${runtime.projectId}`) {
  const renderedRoute = await ui.currentRoute();
  assert.equal(renderedRoute.theme, 'light'); assert.equal(renderedRoute.role, 'freelancer');
  const xml = ui.xml();
  assert.equal(/Uncaught \(in promise|content-desc="Tools"|Beklenmeyen bir hata/.test(xml), false, 'Native runtime hata/overlay göstermemeli.');
  const file = path.join(pageFolder(page), 'screenshots', `light-tr-phone-${state}.png`);
  ui.run('shell', 'screencap', '-p', '/sdcard/neta-ui-assets.png'); ui.run('pull', '/sdcard/neta-ui-assets.png', file);
  recordScreenshot(page, file, { platform: 'android', actor: 'owner', theme: 'light', locale: 'tr', state,
    route, fixture: 'ui-assets-v1', runtime: 'debug-dev-client',
    device: ui.serial, renderedRoute, surface, captureVersion: 'native-v2-clean' });
}
async function scrollTo(text) {
  for (let attempt = 0; attempt < 10; attempt++) {
    const target = ui.nodes(ui.xml()).find((node) => ui.visible(node) && node.text === text);
    if (target) { ui.tap(target); await pause(600); return; }
    ui.run('shell', 'input', 'swipe', '540', '1900', '540', '700', '300'); await pause(400);
  }
  throw new Error(`Native aksiyon bulunamadı: ${text}`);
}
try {
  assert.equal((await ui.currentRoute()).status, 'unauthenticated', 'Probe öncesi fixture oturumu UI ile kapatılmış olmalı.');
  await ui.connectFixture();
  await ui.preferences('owner', 'light');
  const previousSessions = sessionIds();
  await ui.login('owner'); signedIn = true;
  newSessionIds = [...sessionIds()].filter((id) => !previousSessions.has(id));
  assert.equal(newSessionIds.length, 1, 'Native login bir yeni backend session oluşturmalı.');
  const page = pages.find((page) => page.platform === 'mobile' && page.actor === 'owner' && page.id === 'projects-id');
  await ui.navigate(`/(owner)/projects/${runtime.projectId}`);
  await ui.waitFor((list) => list.some((node) => node.text === 'Dosyalar'), 'project segments');
  for (const [label, state] of [['Plan', 'plan'], ['Görevler', 'tasks'], ['Revizyonlar', 'revisions'], ['Dosyalar', 'assets']]) {
    await ui.click(label); await pause(500);
    const sectionXml = ui.xml();
    if (sectionXml.includes('Bu bölüm kullanılamıyor')) throw new Error(`Project ${state} bölümü kullanılamıyor.`);
    if (state === 'assets') await ui.waitFor((list) => list.some((node) => node.text === 'atlas-sunum.png'), 'authorized project asset');
    await captureCurrent(page, state); results.push({ check: `project-${state}`, passed: true });
  }
  await ui.click('atlas-sunum.png');
  for (let attempt = 0; attempt < 15; attempt++) {
    const shareUi = ui.nodes(ui.xml());
    if (shareUi.some((node) => node.package === 'com.android.intentresolver') ||
      shareUi.some((node) => node.package === 'android' && node.text === 'Sharing image')) break;
    if (attempt === 14) throw new Error('Yetkili dosya native sharing sheet açmadı.');
    await pause(500);
  }
  await captureCurrent(page, 'native-share-sheet', 'android-system-share');
  ui.run('shell', 'input', 'keyevent', '4'); await pause(1200);
  const pendingDownloads = ui.run('shell', 'run-as', ui.appId, 'find', 'cache', '-name', 'neta-download-*');
  assert.equal(pendingDownloads.trim(), '', 'Share sonrası geçici indirme dosyası temizlenmeli.');
  results.push({ check: 'authenticated-download-share-cleanup', passed: true });

  let exists = false;
  try { ui.run('shell', 'test', '-e', deviceFile); exists = true; }
  catch (error) { if (error.status !== 1) throw error; }
  assert.equal(exists, false, 'Probe mevcut Downloads dosyasını ezmez.');
  ui.run('push', path.join(root, 'apps/neta-mobile/assets/logo/iconLogo.png'), deviceFile); pushed = true;
  const previousUploads = new Set(db.prepare('SELECT id FROM files WHERE original_name = ?').all(fileName).map((row) => row.id));
  await ui.navigate('/(owner)/files');
  await ui.click('Dosya seç');
  const drawer = await ui.waitFor((list) => list.find((node) => ui.visible(node) && /Show roots|Open navigation drawer/.test(node['content-desc'] ?? '')), 'document picker roots');
  ui.tap(drawer); await ui.click('Downloads');
  const pickedFile = await ui.waitFor((list) => list.find((node) => ui.visible(node) &&
    (node.text === fileName || node['content-desc']?.startsWith(`${fileName},`))), 'fixture picker file');
  ui.tap(pickedFile);
  await ui.waitFor((list) => list.some((node) => node.text.includes(fileName) && node.text.includes('yüklendi')), 'native upload success');
  const uploaded = db.prepare('SELECT id, kind, visibility, metadata_sanitized, auth_user_id FROM files WHERE original_name = ?').all(fileName).filter((row) => !previousUploads.has(row.id));
  assert.equal(uploaded.length, 1); assert.equal(uploaded[0].kind, 'avatar'); assert.equal(uploaded[0].visibility, 'private');
  assert.equal(uploaded[0].metadata_sanitized, 1); assert.equal(uploaded[0].auth_user_id, ownerId);
  const filesPage = pages.find((page) => page.platform === 'mobile' && page.actor === 'owner' && page.id === 'files');
  await captureCurrent(filesPage, 'upload-success', 'app', '/(owner)/files');
  results.push({ check: 'native-picker-multipart-upload', passed: true });
} catch (error) {
  results.push({ check: 'native-file-smoke', passed: false, reason: error.message }); console.error(error.message);
} finally {
  if (signedIn) {
    try {
      for (let attempt = 0; attempt < 3; attempt++) {
        if (!ui.nodes(ui.xml()).some((node) => node.package === 'com.android.intentresolver' || node.package?.endsWith('.documentsui'))) break;
        ui.run('shell', 'input', 'keyevent', '4'); await pause(1000);
      }
      await ui.logout();
      for (const id of newSessionIds) assert.equal(db.prepare('SELECT id FROM session WHERE id = ?').get(id), undefined, 'Native logout backend sessionı da sonlandırmalı.');
      results.push({ check: 'native-server-logout', passed: true });
    } catch (error) { results.push({ check: 'native-server-logout', passed: false, reason: error.message }); }
  }
  if (pushed) ui.run('shell', 'rm', deviceFile);
  db.close(); ui.close();
  writeJson(path.join(pipeline, 'reports/native-file-smoke.json'), { checkedAt: new Date().toISOString(), runtime: 'android-debug-dev-client', results,
    signedReleaseVerified: false, passed: results.length > 0 && results.every((result) => result.passed) });
}
if (results.some((result) => !result.passed)) process.exitCode = 1;
