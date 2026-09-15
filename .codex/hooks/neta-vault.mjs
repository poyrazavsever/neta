import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';

import { findRepositoryRoot, parseFrontmatter } from '../../tools/vault/lib.mjs';

const TOPICS = [
  {
    pattern: /(mobil|mobile|expo|react native|ios|android|instance|qr|pairing|cihaz)/u,
    pages: [
      'bilgi/09-yol-haritasi/mobil-uygulama-plani.md',
      'bilgi/03-mimari/mobil-mimari.md',
      'bilgi/02-domainler/instance-ve-mobil-baglanti.md',
      'bilgi/05-is-akislari/mobil-instance-baglantisi.md',
    ],
    decisions: ['006', '007', '008'],
  },
  {
    pattern: /(api|contract|kontrat|endpoint|route|dto|presenter|capability)/u,
    pages: ['bilgi/03-mimari/api.md', 'bilgi/04-bilesenler/api-contracts.md', 'bilgi/00-sistem/celiskiler.md'],
    decisions: ['006'],
  },
  {
    pattern: /(auth|login|oturum|kimlik|yetki|davet|owner|client|musteri|müşteri)/u,
    pages: ['bilgi/03-mimari/kimlik-dogrulama.md', 'bilgi/02-domainler/kimlik-ve-erisim.md', 'bilgi/07-guvenlik/tehdit-modeli.md'],
    decisions: ['004', '008'],
  },
  {
    pattern: /(sqlite|database|veritabani|veritabanı|kalici|kalıcı|backup|restore|yedek|dosya|upload|storage)/u,
    pages: ['bilgi/03-mimari/veri-kaliciigi.md', 'bilgi/03-mimari/sqlite.md', 'bilgi/03-mimari/dosya-depolama.md'],
    decisions: ['001', '002', '003', '009'],
  },
  {
    pattern: /(supabase|legacy|import|aktarim|aktarım)/u,
    pages: ['bilgi/05-is-akislari/supabase-importu.md', 'bilgi/03-mimari/runtime.md'],
    decisions: ['005'],
  },
  {
    pattern: /(ai|yapay zeka|openai|groq|gemini|ollama|provider)/u,
    pages: ['bilgi/03-mimari/ai-mimarisi.md', 'bilgi/02-domainler/ai-ve-analiz.md', 'bilgi/07-guvenlik/sirlar.md'],
    decisions: [],
  },
  {
    pattern: /(karar|decision|adr|mimari|architecture)/u,
    pages: ['bilgi/06-kararlar/karar-kaydi.md', 'bilgi/00-sistem/kasa-semasi.md'],
    decisions: ['all'],
  },
  {
    pattern: /(bilgi|vault|dokuman|doküman|documentation|indeks|index|harita|hook|agent)/u,
    pages: ['bilgi/00-sistem/indeks.md', 'bilgi/00-sistem/kasa-semasi.md', 'bilgi/00-sistem/agent-baglam-ve-hooklar.md'],
    decisions: ['010'],
  },
];

const input = await readInput();
const repositoryRoot = findRepositoryRoot(input.cwd ?? process.cwd());

if (!repositoryRoot) {
  emit({});
} else {
  try {
    switch (input.hook_event_name) {
      case 'SessionStart':
      case 'SubagentStart':
        initializeState(repositoryRoot, input.session_id);
        emitAdditionalContext(input.hook_event_name, buildSessionContext(repositoryRoot));
        break;
      case 'UserPromptSubmit':
        handleUserPrompt(repositoryRoot, input);
        break;
      case 'Stop':
        handleStop(repositoryRoot, input);
        break;
      default:
        emit({});
    }
  } catch {
    emit({});
  }
}

function handleUserPrompt(root, payload) {
  const prompt = String(payload.prompt ?? '').toLocaleLowerCase('tr-TR');
  const matches = TOPICS.filter((topic) => topic.pattern.test(prompt));
  if (!matches.length) {
    emit({});
    return;
  }

  const pages = new Set(['bilgi/harita.md', 'bilgi/00-sistem/mevcut-durum.md', 'bilgi/00-sistem/degismez-kurallar.md']);
  const decisionIds = new Set();
  for (const topic of matches) {
    topic.pages.forEach((page) => pages.add(page));
    topic.decisions.forEach((identifier) => decisionIds.add(identifier));
  }

  const decisions = readDecisions(root);
  const selectedDecisions = decisionIds.has('all')
    ? decisions
    : decisions.filter((decision) => decisionIds.has(decision.identifier));
  const decisionLines = selectedDecisions.map(formatDecision);

  const context = [
    '<neta-vault-route>',
    'Bu prompt Neta bilgi kasasındaki kalıcı konularla eşleşti.',
    'İşleme başlamadan önce bilgi/harita.md üzerinden geç ve aşağıdaki notları oku:',
    ...[...pages].map((page) => `- ${page}`),
    ...(decisionLines.length ? ['İlgili yürürlükteki karar özetleri:', ...decisionLines] : []),
    'Notlardaki kritik iddiaları canonical kod/docs kaynağıyla doğrula; planlananı mevcut gibi anlatma.',
    '</neta-vault-route>',
  ].join('\n');

  emitAdditionalContext('UserPromptSubmit', context);
}

function handleStop(root, payload) {
  if (payload.stop_hook_active) {
    emit({});
    return;
  }

  const state = readState(payload.session_id);
  if (!state || state.repositoryRoot !== root) {
    initializeState(root, payload.session_id);
    emit({});
    return;
  }

  const changedPaths = changedSinceBaseline(root, state.baseline);
  const vaultChanged = changedPaths.some((file) => file.startsWith('bilgi/'));
  const productChanged = changedPaths.some(isProductPath);

  if (vaultChanged && !isMapCurrent(root)) {
    emit({
      decision: 'block',
      reason: 'Bilgi kasası değişti fakat bilgi/harita.md güncel değil. `pnpm vault:map` ve ardından `pnpm vault:check` çalıştır; gerçek bir bulgu varsa günlüğü de güncelle.',
    });
    return;
  }

  if (productChanged && !vaultChanged) {
    emit({
      decision: 'block',
      reason: 'Bu turda ürün kodu veya runtime sözleşmesi değişti, fakat bilgi kasasında karşılık gelen güncelleme görünmüyor. `git diff` ile kalıcı ürün/mimari/API/güvenlik etkisini değerlendir; etkisi varsa ilgili bilgi notunu, haritayı ve günlüğü güncelle. Yalnız biçimsel veya kalıcı etkisizse bunu doğrulayıp bitir.',
    });
    return;
  }

  emit({});
}

function buildSessionContext(root) {
  const decisions = readDecisions(root).map(formatDecision);
  return [
    '<neta-vault-context>',
    'Neta repository bilgi rotası zorunludur:',
    '1. Önce bilgi/harita.md dosyasını oku ve göreve uygun notları oradan seç.',
    '2. Sonra bilgi/00-sistem/mevcut-durum.md ve bilgi/00-sistem/degismez-kurallar.md dosyalarını oku.',
    '3. Mimari/ürün kararında bilgi/06-kararlar/karar-kaydi.md üzerinden bağımsız ADR notuna git.',
    '4. Kod mevcut davranışın, aktif ADR/roadmap hedef davranışın kanıtıdır; planlanan capability mevcut değildir.',
    'Yürürlükteki kararların kısa yönlendirme özeti:',
    ...decisions,
    'Anlamlı implementation değişikliğinden sonra ilgili bilgi notunu güncelle, pnpm vault:map ve pnpm vault:check çalıştır.',
    '</neta-vault-context>',
  ].join('\n');
}

function readDecisions(root) {
  const decisionRoot = path.join(root, 'bilgi', '06-kararlar');
  if (!fs.existsSync(decisionRoot)) return [];

  return fs.readdirSync(decisionRoot)
    .filter((file) => /^adr-\d{3}-.+\.md$/.test(file))
    .sort()
    .map((file) => {
      const parsed = parseFrontmatter(fs.readFileSync(path.join(decisionRoot, file), 'utf8'));
      return {
        identifier: file.match(/^adr-(\d{3})-/)[1],
        path: `bilgi/06-kararlar/${file}`,
        status: parsed.data.durum ?? 'belirsiz',
        summary: parsed.data.ozet ?? file,
      };
    });
}

function formatDecision(decision) {
  return `- ADR-${decision.identifier} [${decision.status}]: ${decision.summary} (${decision.path})`;
}

function initializeState(root, sessionId) {
  if (!sessionId) return;
  const file = statePath(sessionId);
  if (fs.existsSync(file)) return;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify({ baseline: readStatus(root), repositoryRoot: root }), 'utf8');
}

function readState(sessionId) {
  if (!sessionId) return null;
  const file = statePath(sessionId);
  if (!fs.existsSync(file)) return null;
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}

function statePath(sessionId) {
  const safeSessionId = String(sessionId).replace(/[^a-zA-Z0-9_-]/g, '_');
  const stateRoot = process.env.NETA_VAULT_HOOK_STATE_DIR || path.join(os.tmpdir(), 'neta-vault-hooks');
  return path.join(stateRoot, `${safeSessionId}.json`);
}

function readStatus(root) {
  const output = execFileSync('git', ['status', '--porcelain=v1', '-z', '--untracked-files=all'], {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024,
  });
  const chunks = output.split('\0').filter(Boolean);
  const status = {};

  for (let index = 0; index < chunks.length; index += 1) {
    const chunk = chunks[index];
    const code = chunk.slice(0, 2);
    const file = chunk.slice(3).replaceAll('\\', '/');
    status[file] = `${code}:${fingerprint(path.join(root, file))}`;
    if (/[RC]/.test(code)) index += 1;
  }
  return status;
}

function fingerprint(file) {
  if (!fs.existsSync(file)) return '<missing>';
  const stat = fs.statSync(file);
  if (!stat.isFile()) return `<${stat.size}:${stat.mtimeMs}>`;
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function changedSinceBaseline(root, baseline) {
  const current = readStatus(root);
  return [...new Set([...Object.keys(baseline), ...Object.keys(current)])]
    .filter((file) => baseline[file] !== current[file]);
}

function isProductPath(file) {
  return file.startsWith('apps/')
    || file.startsWith('packages/')
    || file.startsWith('tools/desktop-assistant/')
    || file.startsWith('.github/workflows/')
    || ['Dockerfile', 'docker-compose.yml', 'package.json', 'pnpm-lock.yaml', 'pnpm-workspace.yaml'].includes(file);
}

function isMapCurrent(root) {
  const result = spawnSync(process.execPath, [path.join(root, 'tools', 'vault', 'generate-map.mjs'), '--check'], {
    cwd: root,
    encoding: 'utf8',
  });
  return result.status === 0;
}

function emitAdditionalContext(eventName, additionalContext) {
  emit({
    hookSpecificOutput: {
      hookEventName: eventName,
      additionalContext,
    },
  });
}

function emit(value) {
  process.stdout.write(JSON.stringify(value));
  process.exit(0);
}

async function readInput() {
  let raw = '';
  for await (const chunk of process.stdin) raw += chunk;
  if (!raw.trim()) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}
