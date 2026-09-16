import fs from 'node:fs';
import path from 'node:path';
import net from 'node:net';
import { randomBytes } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { execFileSync, spawn } from 'node:child_process';
import Database from 'better-sqlite3';
import sharp from 'sharp';

const app = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const root = path.resolve(app, '../..');
process.chdir(app);
const port = Number(process.env.NETA_UI_PORT || 4310);
await new Promise((resolve, reject) => {
  const probe = net.createServer(); probe.once('error', reject);
  probe.listen(port, '127.0.0.1', () => probe.close(resolve));
});
const baseUrl = `http://127.0.0.1:${port}`;
const dataDir = path.join(root, '.artifacts/ui-assets', `fixture-${Date.now()}`);
const databasePath = path.join(dataDir, 'neta.db');
const env = { ...process.env, NODE_ENV: 'production', DATA_DIR: dataDir, DATABASE_PATH: databasePath,
  APP_URL: baseUrl, NEXT_PUBLIC_SITE_URL: baseUrl, TRUSTED_ORIGINS: baseUrl,
  BETTER_AUTH_SECRET: randomBytes(32).toString('hex'), NETA_MINIMUM_MOBILE_VERSION: '0.1.0',
  HOSTNAME: '127.0.0.1', PORT: String(port), NEXT_TELEMETRY_DISABLED: '1' };
fs.mkdirSync(dataDir, { recursive: true });
execFileSync(process.execPath, ['scripts/migrate.mjs'], { env, stdio: 'inherit' });
const serverFile = path.join(app, '.next/standalone/apps/neta-app/server.js');
if (!fs.existsSync(serverFile)) throw new Error('Önce pnpm app:build çalıştırın.');
const server = spawn(process.execPath, [serverFile], { cwd: path.dirname(serverFile), env, stdio: ['ignore', 'pipe', 'pipe'] });
let output = ''; server.stdout.on('data', (chunk) => { output = (output + chunk).slice(-4000); });
server.stderr.on('data', (chunk) => { output = (output + chunk).slice(-4000); });
let db;
let stopping = false;
function stop(code = 0) {
  if (stopping) return; stopping = true; db?.close();
  if (process.platform === 'win32') { try { execFileSync('taskkill', ['/PID', String(server.pid), '/T', '/F'], { stdio: 'ignore' }); } catch {} }
  else server.kill('SIGTERM');
  process.exitCode = code;
  setTimeout(() => process.exit(code), 250);
}
process.on('SIGINT', stop); process.on('SIGTERM', stop);
async function request(route, body, cookie, method = 'POST') {
  const response = await fetch(new URL(route, baseUrl), { method, headers: { origin: baseUrl, ...(cookie ? { cookie } : {}),
    ...(body ? { 'content-type': 'application/json' } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
  const payload = await response.json();
  if (!response.ok) throw new Error(`${route}: ${response.status} ${payload.error?.code ?? payload.code ?? 'failed'}`);
  return { response, payload };
}
const cookieHeader = (response) => response.headers.getSetCookie().map((value) => value.split(';', 1)[0]).join('; ');
try {
  for (let attempt = 0; ; attempt++) {
    try { if ((await fetch(`${baseUrl}/api/health/live`)).ok) break; } catch {}
    if (attempt > 120 || server.exitCode !== null) throw new Error(output || 'Fixture runtime başlamadı.');
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  const owner = { email: 'ui-owner@example.test', password: 'UI-Fixture-Owner-123', name: 'Deniz Tasarım' };
  const client = { email: 'ui-client@example.test', password: 'UI-Fixture-Client-123', name: 'Atlas Ekibi' };
  const signup = await request('/api/auth/sign-up/email', owner);
  const ownerCookie = cookieHeader(signup.response); const ownerId = signup.payload.user.id;
  db = new Database(databasePath); db.pragma('foreign_keys = ON');
  db.prepare('UPDATE instance_branding SET application_name = ?, organization_name = ?').run('Neta UI Studio', 'Örnek Tasarım Stüdyosu');
  db.prepare('INSERT INTO clients (id, owner_user_id, name, email) VALUES (?, ?, ?, ?)')
    .run('ui-client-atlas', ownerId, 'Atlas Teknoloji', client.email);
  db.prepare('INSERT INTO clients (id, owner_user_id, name, email) VALUES (?, ?, ?, ?)')
    .run('ui-client-luna', ownerId, 'Luna Atölye', 'ui-luna@example.test');
  db.prepare('INSERT INTO projects (id, owner_user_id, client_id, name, status, progress, revision_quota) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run('ui-project-atlas', ownerId, 'ui-client-atlas', 'Atlas marka ve web tasarımı', 'active', 65, 3);
  db.prepare('INSERT INTO projects (id, owner_user_id, client_id, name, status, progress) VALUES (?, ?, ?, ?, ?, ?)')
    .run('ui-project-luna', ownerId, 'ui-client-luna', 'Luna görsel kimliği', 'planning', 15);
  const now = Date.now(); const date = new Date(now).toISOString().slice(0, 10);
  for (const [id, title, status, visibility] of [['ui-task-public', 'Ana sayfa tasarımını gözden geçir', 'in_progress', 1], ['ui-task-private', 'Sunum dosyasını hazırla', 'todo', 0], ['ui-task-done', 'Renk paletini belirle', 'done', 1]]) {
    db.prepare('INSERT INTO tasks (id, owner_user_id, client_id, project_id, title, status, priority, is_public_to_client, scheduled_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .run(id, ownerId, 'ui-client-atlas', 'ui-project-atlas', title, status, 'medium', visibility, date);
  }
  db.prepare('INSERT INTO project_planning_sections (id, owner_user_id, project_id, category, title, content, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run('ui-plan', ownerId, 'ui-project-atlas', 'overview', 'Proje hedefleri', 'Tutarlı bir marka deneyimi ve erişilebilir bir web sitesi.', 0);
  db.prepare('INSERT INTO client_activities (id, owner_user_id, client_id, type, title, content, activity_date) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run('ui-activity', ownerId, 'ui-client-atlas', 'meeting', 'Tasarım görüşmesi', 'Ana sayfa akışı ve teslim tarihleri konuşuldu.', now);
  db.prepare('INSERT INTO calendar_events (id, owner_user_id, client_id, project_id, title, type, starts_at, ends_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .run('ui-calendar', ownerId, 'ui-client-atlas', 'ui-project-atlas', 'Atlas tasarım değerlendirmesi', 'meeting', now, now + 3600000);
  for (const [id, type, amount, currency] of [['ui-finance-income', 'income', 2500000, 'TRY'], ['ui-finance-expense', 'expense', 150000, 'TRY'], ['ui-finance-eur', 'income', 120000, 'EUR']]) {
    db.prepare('INSERT INTO finance_transactions (id, owner_user_id, type, amount_minor, currency, transaction_date, payment_status) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(id, ownerId, type, amount, currency, date, 'paid');
  }
  db.prepare('INSERT INTO journal_entries (id, owner_user_id, entry_date, mood_score, energy_score, work_satisfaction_score, note) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run('ui-journal', ownerId, date, 4, 4, 5, 'Bu metin yalnızca UI arşivi için hazırlanmış örnek bir günlük girdisidir.');
  db.prepare('INSERT INTO chat_sessions (id, owner_user_id, title) VALUES (?, ?, ?)').run('ui-chat', ownerId, 'Proje planı');
  const invite = await request('/api/portal-invitations', { clientId: 'ui-client-atlas', email: client.email, locale: 'tr' }, ownerCookie);
  const accepted = await request('/api/portal-invitations/accept', { token: invite.payload.invitation.invitationUrl.split('/').at(-1), displayName: client.name, password: client.password });
  const clientId = accepted.payload.user?.id ?? db.prepare('SELECT auth_user_id FROM clients WHERE id = ?').get('ui-client-atlas').auth_user_id;
  db.prepare('INSERT INTO project_revisions (id, owner_user_id, project_id, client_id, requested_by_user_id, description, source_locale) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run('ui-revision', ownerId, 'ui-project-atlas', 'ui-client-atlas', clientId, 'Başlıktaki boşluğu ve buton sırasını güncelleyelim.', 'tr');
  const pendingInvite = await request('/api/portal-invitations', { clientId: 'ui-client-luna', email: 'ui-luna@example.test', locale: 'tr' }, ownerCookie);
  const png = await sharp({ create: { width: 640, height: 360, channels: 4, background: '#C81E1E' } }).png().toBuffer();
  const form = new FormData(); form.set('file', new File([png], 'atlas-sunum.png', { type: 'image/png' }));
  form.set('kind', 'project_asset'); form.set('projectId', 'ui-project-atlas'); form.set('visibility', 'portal');
  const uploaded = await fetch(`${baseUrl}/api/v1/files`, { method: 'POST', headers: { origin: baseUrl, cookie: ownerCookie, 'idempotency-key': 'ui-fixture-asset-upload' }, body: form });
  if (!uploaded.ok) throw new Error(`Fixture upload ${uploaded.status}`);
  const runtime = { schemaVersion: 1, fixture: true, baseUrl, dataDir, databasePath, serverPid: server.pid,
    owner, client, projectId: 'ui-project-atlas', clientId: 'ui-client-atlas', taskId: 'ui-task-public', date,
    invitationUrl: pendingInvite.payload.invitation.invitationUrl };
  fs.writeFileSync(path.join(root, '.artifacts/ui-assets/runtime.json'), JSON.stringify(runtime, null, 2));
  console.log(`UI fixture hazır: ${baseUrl}. Kişisel .data kullanılmadı. Durdurmak için Ctrl+C.`);
  await new Promise(() => {});
} catch (error) { console.error(error.message); stop(1); }
