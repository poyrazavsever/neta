import fs from 'node:fs';
import path from 'node:path';

import { findRepositoryRoot, listMarkdownFiles, parseFrontmatter, readVaultNotes, renderVaultMap } from './lib.mjs';

const ALLOWED_TYPES = new Set([
  'arastirma', 'bilesen', 'domain', 'gunluk', 'guvenlik', 'is-akisi', 'karar',
  'mimari', 'operasyon', 'sistem', 'urun', 'yol-haritasi', 'kaynak',
]);
const ALLOWED_STATUSES = new Set(['mevcut', 'planlanan', 'legacy', 'kaldirilacak', 'gecersiz-kilindi', 'arastirma']);
const ALLOWED_DECISION_STATUSES = new Set(['onerildi', 'kabul-edildi', 'kabul-edilmis-tasarim', 'reddedildi', 'gecersiz-kilindi']);
const REQUIRED_DECISION_SECTIONS = [
  '## Bağlam',
  '## Karar',
  '## Gerekçe',
  '## Değerlendirilen alternatifler',
  '## Varsayımlar',
  '## Yeniden değerlendirme koşulları',
  '## Canonical kaynaklar',
];

const repositoryRoot = findRepositoryRoot();
if (!repositoryRoot) {
  console.error('Neta repository kökü bulunamadı.');
  process.exit(1);
}

const vaultRoot = path.join(repositoryRoot, 'bilgi');
const markdownFiles = listMarkdownFiles(vaultRoot);
const relativeFiles = new Set(markdownFiles.map((file) => relative(repositoryRoot, file)));
const basenameIndex = buildBasenameIndex(relativeFiles);
const inbound = new Map([...relativeFiles].map((file) => [file, 0]));
const errors = [];

for (const file of markdownFiles) {
  const repositoryPath = relative(repositoryRoot, file);
  const content = fs.readFileSync(file, 'utf8');
  const parsed = parseFrontmatter(content);
  const isTemplate = repositoryPath.startsWith('bilgi/sablonlar/');

  if (!parsed.raw) {
    errors.push(`${repositoryPath}: YAML frontmatter yok.`);
    continue;
  }

  for (const key of ['tur', 'durum', 'guncellendi', 'guven']) {
    if (!Object.hasOwn(parsed.data, key)) errors.push(`${repositoryPath}: ${key} eksik.`);
  }

  if (!ALLOWED_TYPES.has(parsed.data.tur)) errors.push(`${repositoryPath}: geçersiz tur '${parsed.data.tur}'.`);
  if (!ALLOWED_STATUSES.has(parsed.data.durum)) errors.push(`${repositoryPath}: geçersiz durum '${parsed.data.durum}'.`);
  if (!['yuksek', 'orta', 'dusuk'].includes(parsed.data.guven)) errors.push(`${repositoryPath}: geçersiz guven '${parsed.data.guven}'.`);
  if (!isTemplate && !/^\d{4}-\d{2}-\d{2}$/.test(parsed.data.guncellendi ?? '')) {
    errors.push(`${repositoryPath}: guncellendi YYYY-MM-DD değil.`);
  }
  if (/[ \t]+$/m.test(content)) errors.push(`${repositoryPath}: satır sonunda boşluk var.`);

  const sources = Array.isArray(parsed.data.kaynaklar) ? parsed.data.kaynaklar : [];
  for (const source of sources) {
    if (!source || /^https?:\/\//.test(source)) continue;
    if (!fs.existsSync(path.join(repositoryRoot, source))) errors.push(`${repositoryPath}: kaynak bulunamadı '${source}'.`);
  }

  for (const match of content.matchAll(/\[\[([^\]]+)\]\]/g)) {
    const target = match[1].replaceAll('\\|', '|').split('|')[0].split('#')[0].trim();
    if (!target) continue;
    const resolved = resolveWikiLink(target, repositoryRoot, relativeFiles, basenameIndex);
    if (!resolved) errors.push(`${repositoryPath}: kırık wikilink [[${match[1]}]].`);
    else if (inbound.has(resolved)) inbound.set(resolved, inbound.get(resolved) + 1);
  }
}

validateDecisions(repositoryRoot, errors);

const expectedMap = renderVaultMap(repositoryRoot);
const mapPath = path.join(vaultRoot, 'harita.md');
if (!fs.existsSync(mapPath) || fs.readFileSync(mapPath, 'utf8') !== expectedMap) {
  errors.push('bilgi/harita.md güncel değil; `pnpm vault:map` çalıştırılmalı.');
}

for (const [file, count] of inbound) {
  if (count === 0 && file !== 'bilgi/harita.md' && !file.startsWith('bilgi/sablonlar/')) {
    errors.push(`${file}: orphan sayfa.`);
  }
}

if (errors.length) {
  console.error(`Vault sağlık kontrolü başarısız (${errors.length} bulgu):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

const decisions = readVaultNotes(repositoryRoot).filter((note) => /^06-kararlar\/adr-\d{3}-/.test(note.relativePath));
console.log(`Vault sağlıklı: ${markdownFiles.length} Markdown, ${decisions.length} ADR, 0 bulgu.`);

function validateDecisions(root, findings) {
  const decisionRoot = path.join(root, 'bilgi', '06-kararlar');
  const files = fs.readdirSync(decisionRoot).filter((file) => /^adr-\d{3}-.+\.md$/.test(file)).sort();
  const identifiers = files.map((file) => Number.parseInt(file.match(/^adr-(\d{3})-/)[1], 10));
  identifiers.forEach((identifier, index) => {
    if (identifier !== index + 1) findings.push(`ADR numarası kesintili: ${files.join(', ')}.`);
  });

  const indexContent = fs.readFileSync(path.join(decisionRoot, 'karar-kaydi.md'), 'utf8');
  for (const file of files) {
    const content = fs.readFileSync(path.join(decisionRoot, file), 'utf8');
    const parsed = parseFrontmatter(content);
    const identifier = file.match(/^adr-(\d{3})-/)[1];
    if (!ALLOWED_DECISION_STATUSES.has(parsed.data.karar_durumu)) {
      findings.push(`${file}: geçersiz karar_durumu '${parsed.data.karar_durumu}'.`);
    }
    if (typeof parsed.data.ozet !== 'string' || !parsed.data.ozet.trim()) findings.push(`${file}: ozet eksik.`);
    if (!new RegExp(`^# ADR-${identifier} — `, 'm').test(content)) findings.push(`${file}: başlık kimliği dosyayla eşleşmiyor.`);
    for (const section of REQUIRED_DECISION_SECTIONS) {
      if (!content.includes(section)) findings.push(`${file}: '${section}' bölümü eksik.`);
    }
    if (Buffer.byteLength(content, 'utf8') > 25 * 1024) findings.push(`${file}: 25 KB karar notu sınırını aşıyor.`);
    if (!indexContent.includes(`06-kararlar/${file.slice(0, -3)}`)) findings.push(`${file}: karar indeksinde yok.`);
  }

  const next = String((identifiers.at(-1) ?? 0) + 1).padStart(3, '0');
  if (!indexContent.includes(`ADR-${next}`)) findings.push(`karar-kaydi.md sıradaki numara ADR-${next} bilgisini taşımıyor.`);
}

function resolveWikiLink(target, root, files, basenames) {
  const normalizedTarget = target.endsWith('.md') ? target.slice(0, -3) : target;
  const candidates = normalizedTarget.startsWith('bilgi/')
    ? [`${normalizedTarget}.md`]
    : [`bilgi/${normalizedTarget}.md`, `${normalizedTarget}.md`];
  const direct = candidates.find((candidate) => files.has(candidate) || fs.existsSync(path.join(root, candidate)));
  if (direct) return direct;

  if (!normalizedTarget.includes('/')) {
    const matches = basenames.get(`${normalizedTarget}.md`) ?? [];
    if (matches.length === 1) return matches[0];
  }
  return null;
}

function buildBasenameIndex(files) {
  const index = new Map();
  for (const file of files) {
    const basename = path.posix.basename(file);
    if (!index.has(basename)) index.set(basename, []);
    index.get(basename).push(file);
  }
  return index;
}

function relative(root, file) {
  return path.relative(root, file).replaceAll(path.sep, '/');
}
