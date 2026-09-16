import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { root, pipeline, readJson, pageFolder, recordScreenshot, writeJson, sha256 } from './lib.mjs';

const runtime = readJson(path.join(root, '.artifacts/ui-assets/runtime.json'));
if (!runtime.fixture || new URL(runtime.baseUrl).hostname !== '127.0.0.1') throw new Error('Yalnız izole loopback UI fixture kabul edilir.');
const adb = process.env.NETA_UI_ADB || (process.platform === 'win32'
  ? path.join(process.env.LOCALAPPDATA, 'Android/Sdk/platform-tools/adb.exe') : 'adb');
const serial = process.env.NETA_UI_DEVICE || 'emulator-5554';
const appId = process.env.NETA_ANDROID_PACKAGE || 'com.neta.mobile';
const scheme = process.env.NETA_APP_SCHEME || 'neta';
const results = [];
const resume = process.argv.includes('--resume');
const fixtureStartedAt = fs.statSync(path.join(root, '.artifacts/ui-assets/runtime.json')).mtimeMs;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const run = (...args) => execFileSync(adb, ['-s', serial, ...args], { encoding: 'utf8', timeout: 45000, maxBuffer: 2 * 1024 * 1024 });
const mobileRequire = createRequire(path.join(root, 'apps/neta-mobile/package.json'));
const expoRequire = createRequire(mobileRequire.resolve('expo/package.json'));
const InspectorSocket = createRequire(expoRequire.resolve('@expo/cli/package.json'))('ws');
let inspector; let requestId = 0;
const inspectorRequests = new Map();
async function inspectorEvaluate(expression) {
  if (!inspector || inspector.readyState !== InspectorSocket.OPEN) {
    const targets = await (await fetch('http://127.0.0.1:8081/json/list')).json();
    const target = targets.find((item) => item.webSocketDebuggerUrl && (item.title?.includes(appId) || item.description?.includes(appId)));
    if (!target) throw new Error('Yerel Hermes inspector bulunamadı.');
    const socket = new InspectorSocket(target.webSocketDebuggerUrl, { origin: 'http://127.0.0.1:8081' });
    inspector = socket;
    socket.on('message', (event) => {
      const data = JSON.parse(event.toString()); const pending = inspectorRequests.get(data.id);
      if (!pending) return; inspectorRequests.delete(data.id); clearTimeout(pending.timeout);
      try { pending.resolve(JSON.parse(data.result.result.value)); }
      catch { pending.reject(new Error('Opt-in capture state hazır değil.')); }
    });
    socket.on('close', () => {
      if (inspector === socket) inspector = null;
      for (const pending of inspectorRequests.values()) { clearTimeout(pending.timeout); pending.reject(new Error('Hermes bağlantısı kapandı.')); }
      inspectorRequests.clear();
    });
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => { socket.close(); reject(new Error('Hermes bağlantı timeout')); }, 10000);
      socket.once('open', () => { clearTimeout(timeout); socket.send(JSON.stringify({ id: 0, method: 'Runtime.enable' })); resolve(); });
      socket.on('error', () => { clearTimeout(timeout); reject(new Error('Hermes inspector bağlantısı kurulamadı.')); });
    });
  }
  return new Promise((resolve, reject) => {
    const id = ++requestId;
    const timeout = setTimeout(() => { inspectorRequests.delete(id); reject(new Error('Hermes route state timeout')); }, 10000);
    inspectorRequests.set(id, { resolve, reject, timeout });
    inspector.send(JSON.stringify({ id, method: 'Runtime.evaluate', params: { expression, returnByValue: true } }));
  });
}
const currentRoute = () => inspectorEvaluate('JSON.stringify(globalThis.__NETA_UI_CAPTURE_STATE__)');
function nodes(xml) {
  return [...xml.matchAll(/<node\s+([^>]+)>?/g)].map((match) => Object.fromEntries([...match[1].matchAll(/([a-z-]+)="([^"]*)"/g)].map((value) => [value[1], value[2]])));
}
function tap(node) {
  const bounds = node.bounds?.match(/\[(\d+),(\d+)\]\[(\d+),(\d+)\]/); if (!bounds || !visible(node)) throw new Error('UI elemanı görünür değil.');
  run('shell', 'input', 'tap', String(Math.round((Number(bounds[1]) + Number(bounds[3])) / 2)), String(Math.round((Number(bounds[2]) + Number(bounds[4])) / 2)));
}
function visible(node) {
  const bounds = node.bounds?.match(/\[(\d+),(\d+)\]\[(\d+),(\d+)\]/);
  return bounds && Number(bounds[3]) > Number(bounds[1]) && Number(bounds[4]) - Number(bounds[2]) >= 20;
}
function xml() { run('shell', 'uiautomator', 'dump', '--compressed', '/sdcard/neta-ui-assets.xml'); return run('shell', 'cat', '/sdcard/neta-ui-assets.xml'); }
async function waitFor(predicate, label, attempts = 30) {
  for (let attempt = 0; attempt < attempts; attempt++) {
    const current = xml(); const value = predicate(nodes(current), current); if (value) return value;
    await sleep(1000);
  }
  throw new Error(`UI bekleme başarısız: ${label}`);
}
async function click(text) {
  const target = await waitFor((list) => list.find((node) => visible(node) && (node.text === text || node['content-desc'] === text)), text, 10);
  tap(target); await sleep(500);
}
async function navigate(route) {
  if (!await inspectorEvaluate(`JSON.stringify(globalThis.__NETA_UI_CAPTURE_NAVIGATE__(${JSON.stringify(route)}))`)) throw new Error('Capture route reddedildi.');
  await sleep(1200);
}
async function login(actor) {
  await navigate('/login');
  if ((await currentRoute()).status !== 'unauthenticated') throw new Error('Login öncesi session kapanmadı.');
  const fields = await waitFor((list) => {
    const edit = list.filter((node) => node.class === 'android.widget.EditText'); return edit.length >= 2 ? edit : null;
  }, 'login fields');
  const fill = (field, value) => { tap(field); run('shell', 'input', 'keyevent', '123'); if (field.text) run('shell', 'input', 'keyevent', ...Array.from({ length: field.text.length + 2 }, () => '67')); run('shell', 'input', 'text', value); };
  fill(fields[0], runtime[actor].email);
  run('shell', 'input', 'keyevent', '66'); await sleep(400);
  const passwordField = await waitFor((list) => list.find((node) => node.class === 'android.widget.EditText' && node.password === 'true' && visible(node)), 'password field');
  fill(passwordField, runtime[actor].password);
  await waitFor((list) => list.some((node) => node.class === 'android.widget.EditText' && node.text === runtime[actor].email), `${actor} email input`, 5);
  run('shell', 'input', 'keyevent', '66');
  await waitFor((list, source) => !source.includes('class="android.widget.EditText"') &&
    (actor === 'owner' ? source.includes('Müşteriler') : source.includes('Revizyonlar')), `${actor} authenticated shell`);
}
async function logout(actor = 'owner') {
  await navigate(actor === 'owner' ? '/(owner)/settings' : '/(portal)/settings');
  const list = nodes(xml());
  let target = list.find((node) => visible(node) && (node.text === 'Çıkış yap' || node['content-desc'] === 'Çıkış yap'));
  for (let attempt = 0; !target && attempt < 12; attempt++) {
    run('shell', 'input', 'swipe', '540', '1800', '540', '650', '300'); await sleep(400);
    target = nodes(xml()).find((node) => visible(node) && (node.text === 'Çıkış yap' || node['content-desc'] === 'Çıkış yap'));
  }
  if (!target) throw new Error('Logout aksiyonu bulunamadı.'); tap(target);
  await waitFor((list) => list.filter((node) => node.class === 'android.widget.EditText').length >= 2, `${actor} logout login form`, 15);
}
const selectedPageIds = process.argv.find((argument) => argument.startsWith('--pages='))?.slice(8).split(',');
const pages = readJson(path.join(pipeline, 'inventory/pages.json')).pages.filter((page) => page.platform === 'mobile' && (!selectedPageIds || selectedPageIds.includes(page.id)));
function routeFor(page) {
  let route = page.route;
  if (page.actor === 'owner' && page.source.includes('/(owner)/')) route = `/(owner)${route === '/' ? '' : route}`;
  if (page.actor === 'client' && page.source.includes('/(portal)/')) route = `/(portal)${route === '/' ? '' : route}`;
  route = route.replace('[id]', page.route.startsWith('/clients') ? runtime.clientId : page.route.startsWith('/tasks') ? runtime.taskId : runtime.projectId);
  if (['client-activity', 'invitation'].includes(page.id)) route += `?clientId=${runtime.clientId}`;
  if (['project-risk', 'portal-revision'].includes(page.id)) route += `?projectId=${runtime.projectId}`;
  if (page.id === 'journal-entry') route += `?date=${runtime.date}`;
  return route;
}
async function capture(page, theme, state = 'default', route = routeFor(page)) {
  const manifestFile = path.join(pageFolder(page), 'screenshots/manifest.json');
  if (resume && fs.existsSync(manifestFile)) {
    const previous = readJson(manifestFile).captures.find((item) => item.theme === theme && (item.state === state || page.actor === 'public' && page.id === 'home' && item.state === 'redirect')
      && item.captureVersion === 'native-v2-clean'
      && Date.parse(item.capturedAt) >= fixtureStartedAt && item.renderedRoute?.theme === theme
      && (page.actor === 'public' ? item.renderedRoute.status === 'unauthenticated' : item.renderedRoute.role === (page.actor === 'owner' ? 'freelancer' : 'client')));
    if (previous && fs.existsSync(path.join(root, previous.file)) && sha256(fs.readFileSync(path.join(root, previous.file))) === previous.sha256) {
      results.push({ platform: 'mobile', actor: page.actor, pageId: page.id, theme, state, status: 'reused' });
      console.log(`Reused mobile/${page.actor}/${page.id} ${theme} ${state}`); return;
    }
  }
  await navigate(route);
  const expectedPath = page.actor === 'public' && page.id === 'home' ? '/login' : new URL(route.replace(/\/\([^/]+\)/g, '') || '/', 'https://capture.invalid').pathname;
  const expectedGroup = page.source.match(/src\/app\/(\([^/]+\))/)?.[1] ?? 'index';
  let renderedRoute;
  for (let attempt = 0; attempt < 15; attempt++) {
    renderedRoute = await currentRoute();
    if (renderedRoute?.pathname === expectedPath && renderedRoute.theme === theme && (page.actor === 'public' && page.id === 'home' || renderedRoute.group === expectedGroup)
      && (page.actor === 'public' ? renderedRoute.status === 'unauthenticated' : renderedRoute.role === (page.actor === 'owner' ? 'freelancer' : 'client'))) break;
    if (attempt === 14) throw new Error(`Route render doğrulanamadı: ${page.id}`);
    await sleep(500);
  }
  const current = await waitFor((list, source) => {
    if (page.source.includes('/(owner)/') && list.filter((node) => node.text && !/^[\uE000-\uF8FF]$/.test(node.text)).length < 12) return null;
    return source;
  }, `${page.id} rendered content`, 12);
  if (page.actor === 'client' && page.source.includes('/(portal)/') && current.includes('text="Müşteriler"')) throw new Error('Client route owner shell açtı; actor/route kabulü başarısız.');
  if (/There was a problem loading|System UI isn|Beklenmeyen bir hata/.test(current)) throw new Error('Native runtime hata ekranında.');
  if (/Uncaught \(in promise|content-desc="Tools"/.test(current)) throw new Error('Debug hata veya Tools overlay görünür; temiz capture yapılamıyor.');
  if (/This account cannot access the resource|Oturum değişti; yeniden giriş/.test(current)) throw new Error('Native account self-service veya actor binding başarısız.');
  if (page.actor !== 'public' && current.includes('text="Email"') && current.includes('text="Giriş yap"')) throw new Error('Auth guard login yönlendirmesi; hedef sayfa açılmadı.');
  const file = path.join(pageFolder(page), 'screenshots', `${theme}-tr-phone-${state}.png`);
  const deviceFile = '/sdcard/neta-ui-assets.png';
  run('shell', 'screencap', '-p', deviceFile); run('pull', deviceFile, file);
  recordScreenshot(page, file, { platform: 'android', actor: page.actor, theme, locale: 'tr', route,
    state: page.id === 'home' && page.actor === 'public' ? 'redirect' : state, fixture: 'ui-assets-v1', runtime: 'debug-dev-client', device: serial, renderedRoute, captureVersion: 'native-v2-clean' });
  results.push({ platform: 'mobile', actor: page.actor, pageId: page.id, theme, state, status: 'captured' });
  console.log(`Captured mobile/${page.actor}/${page.id} ${theme} ${state}`);
}
async function preferences(actor, theme) {
  const credentials = runtime[actor];
  const login = await fetch(`${runtime.baseUrl}/api/auth/sign-in/email`, { method: 'POST', headers: { origin: runtime.baseUrl, 'content-type': 'application/json' }, body: JSON.stringify({ email: credentials.email, password: credentials.password }) });
  if (!login.ok) throw new Error('Fixture preference login başarısız.');
  const cookie = login.headers.getSetCookie().map((value) => value.split(';', 1)[0]).join('; ');
  const response = await fetch(`${runtime.baseUrl}/api/v1/me/preferences`, { method: 'PATCH', headers: { origin: runtime.baseUrl, cookie, 'content-type': 'application/json' }, body: JSON.stringify({ colorMode: theme, locale: 'tr' }) });
  if (!response.ok) throw new Error('Fixture tema güncellenemedi.');
}
async function connectFixture() {
  run('shell', 'am', 'start', '-W', '-a', 'android.intent.action.VIEW', '-d', `${scheme}://connect?origin=${encodeURIComponent(runtime.baseUrl)}`, '-p', appId);
  await waitFor((list) => list.some((node) => node.text === runtime.baseUrl), 'fixture origin confirmation');
  await click('Bu instance’a bağlan'); await sleep(1200);
}
async function main() {
try {
  if (run('shell', 'getprop', 'sys.boot_completed').trim() !== '1' || !run('shell', 'service', 'check', 'package').includes('found')) throw new Error('Android boot/package servisi hazır değil.');
  run('reverse', 'tcp:8081', 'tcp:8081');
  const port = new URL(runtime.baseUrl).port; run('reverse', `tcp:${port}`, `tcp:${port}`);
  for (let attempt = 0; attempt < 30; attempt++) {
    try { if ((await currentRoute())?.status) break; } catch { /* Native bundle can still be loading. */ }
    if (attempt === 29) throw new Error('Opt-in native capture bundle hazır değil.');
    await sleep(500);
  }
  await navigate('/(owner)/settings');
  const initial = xml();
  if (!nodes(initial).some((node) => node.class === 'android.widget.EditText')) await logout(initial.includes('Revizyonlar') ? 'client' : 'owner');
  await connectFixture();
  for (const theme of ['light', 'dark']) {
    for (const actor of ['owner', 'client']) await preferences(actor, theme);
    // Start from a logged-out session; existing login must be ended via the UI.
    await login('owner');
    for (const page of pages.filter((page) => page.actor === 'owner')) {
      try { await capture(page, theme); }
      catch (error) { results.push({ pageId: page.id, actor: page.actor, theme, status: 'failed', reason: error.message }); console.error(`Failed ${page.id}: ${error.message}`); }
    }
    await logout();
    for (const page of pages.filter((page) => page.actor === 'public')) {
      try { await capture(page, theme); }
      catch (error) { results.push({ pageId: page.id, actor: page.actor, theme, status: 'failed', reason: error.message }); }
    }
    await login('client');
    for (const page of pages.filter((page) => page.actor === 'client')) {
      try { await capture(page, theme); }
      catch (error) { results.push({ pageId: page.id, actor: page.actor, theme, status: 'failed', reason: error.message }); }
    }
    // Portal uses its own guarded settings route.
    await logout('client');
  }
} catch (error) { console.error(error.message); results.push({ status: 'failed', reason: error.message }); }
finally { inspector?.close(); writeJson(path.join(pipeline, 'reports/mobile-capture.json'), { capturedAt: new Date().toISOString(), results }); }
if (results.some((result) => result.status === 'failed')) process.exitCode = 1;
}
export const nativeCaptureUi = { run, xml, nodes, visible, tap, waitFor, click, navigate, login, logout, currentRoute, preferences,
  connectFixture, runtime, appId, serial, close: () => inspector?.close() };
if (process.argv[1] && path.resolve(process.argv[1]) === path.join(root, 'tools/ui-assets/capture-mobile.mjs')) await main();
