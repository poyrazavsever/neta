import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';
import { root, pipeline, readJson, pageFolder, recordScreenshot, writeJson } from './lib.mjs';

const runtime = readJson(path.join(root, '.artifacts/ui-assets/runtime.json'));
if (!runtime.fixture || new URL(runtime.baseUrl).hostname !== '127.0.0.1') throw new Error('Yalnız izole loopback UI fixture kabul edilir.');
const pages = readJson(path.join(pipeline, 'inventory/pages.json')).pages.filter((page) => page.platform !== 'mobile');
const webOrigin = process.env.NETA_UI_WEB_ORIGIN || 'http://127.0.0.1:4311';
if (new URL(webOrigin).hostname !== '127.0.0.1') throw new Error('Landing capture loopback üzerinde çalışmalıdır.');
const channel = process.env.NETA_UI_BROWSER || (process.platform === 'win32' ? 'msedge' : 'chromium');
const browser = await chromium.launch({ ...(channel === 'chromium' ? {} : { channel }), headless: true });
const results = [];
const viewport = { width: 1440, height: 1000 };
async function authenticatedContext(actor, theme) {
  const context = await browser.newContext({ viewport, locale: 'tr-TR', colorScheme: theme, reducedMotion: 'reduce' });
  await context.addCookies([{ name: 'neta-color-mode', value: theme, url: runtime.baseUrl }]);
  if (actor !== 'public') {
    const user = runtime[actor === 'owner' ? 'owner' : 'client'];
    const response = await context.request.post(`${runtime.baseUrl}/api/auth/sign-in/email`, {
      headers: { origin: runtime.baseUrl }, data: { email: user.email, password: user.password },
    });
    if (!response.ok()) throw new Error(`Fixture ${actor} login başarısız: ${response.status()}`);
    const preferences = await context.request.patch(`${runtime.baseUrl}/api/v1/me/preferences`, {
      headers: { origin: runtime.baseUrl }, data: { colorMode: theme, locale: 'tr' },
    });
    if (!preferences.ok()) throw new Error(`Fixture ${actor} theme başarısız: ${preferences.status()}`);
  }
  return context;
}
function resolvedRoute(page) {
  return page.route.replace('[id]', page.route.startsWith('/clients') ? runtime.clientId : runtime.projectId)
    .replace('[locale]', 'tr').replace('[token]', new URL(runtime.invitationUrl).pathname.split('/').at(-1));
}
try {
  for (const theme of ['light', 'dark']) {
    const contexts = {};
    try {
      for (const actor of ['public', 'owner', 'client']) contexts[actor] = await authenticatedContext(actor, theme);
      for (const page of pages) {
        const variants = page.platform === 'web'
          ? page.route.includes('docs') ? readJson(path.join(pipeline, 'inventory/docs-pages.json')).pages.map((doc) => doc.route)
            : page.route.includes('[locale]') ? ['/tr', '/en'] : ['/']
          : [resolvedRoute(page)];
        // /docs and /[locale]/docs share rendering; catalog retains both source routes.
        for (const route of variants) {
          const tab = await contexts[page.actor].newPage();
          const label = page.route.includes('[token]') ? '/invite/[fixture]' : route;
          try {
            const response = await tab.goto(new URL(route, page.platform === 'web' ? webOrigin : runtime.baseUrl).toString(), { waitUntil: 'networkidle', timeout: 60000 });
            await tab.evaluate(() => document.fonts.ready);
            // Scroll-reveal sections must be rendered before a full-page capture.
            await tab.evaluate(async () => {
              for (let y = 0; y < document.body.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise((resolve) => setTimeout(resolve, 40)); }
              window.scrollTo(0, 0);
            });
            await tab.waitForTimeout(400);
            const final = new URL(tab.url()); const expected = new URL(route, final.origin).pathname;
            const redirected = final.pathname !== expected;
            const renderedTheme = await tab.evaluate(() => ({ colorMode: document.documentElement.dataset.colorMode ?? null,
              darkClass: document.documentElement.classList.contains('dark'), background: getComputedStyle(document.body).backgroundColor }));
            const slug = page.platform === 'web' ? route.replace(/[^a-z0-9-]/gi, '-').replace(/^-|-$/g, '') || 'home' : 'default';
            const locale = route.startsWith('/en') ? 'en' : 'tr';
            const file = path.join(pageFolder(page), 'screenshots', `${theme}-${locale}-desktop-${slug}.png`);
            await tab.screenshot({ path: file, fullPage: true, animations: 'disabled', mask: [tab.locator('input[type=password]'), tab.locator('canvas[aria-label*=QR]')] });
            recordScreenshot(page, file, { platform: page.platform, actor: page.actor, theme, locale: route.startsWith('/en') ? 'en' : 'tr', viewport,
              route: label, state: redirected ? 'redirect' : 'default', fixture: 'ui-assets-v1', runtime: page.platform === 'app' ? 'production-standalone' : 'production-next', browser: channel === 'msedge' ? 'Microsoft Edge' : channel, httpStatus: response?.status(),
              redirectedTo: redirected ? final.pathname : null, renderedTheme });
            results.push({ platform: page.platform, pageId: page.id, actor: page.actor, route: label, theme, status: 'captured', httpStatus: response?.status(), redirected });
            console.log(`Captured ${page.platform}/${page.actor}/${page.id} ${theme} ${label}`);
          } catch (error) {
            results.push({ platform: page.platform, pageId: page.id, route: label, actor: page.actor, theme, status: 'failed', reason: error.message.replaceAll(runtime.invitationUrl, '/invite/[fixture]') });
            console.error(`Capture failed ${page.id} ${theme}: ${error.message.split('\n')[0]}`);
          } finally { await tab.close(); }
        }
      }
    } finally { await Promise.all(Object.values(contexts).map((context) => context.close())); }
  }
} finally {
  await browser.close();
  writeJson(path.join(pipeline, 'reports/web-capture.json'), { capturedAt: new Date().toISOString(), results });
}
if (results.some((result) => result.status === 'failed')) process.exitCode = 1;
