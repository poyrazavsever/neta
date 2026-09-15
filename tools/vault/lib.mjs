import fs from 'node:fs';
import path from 'node:path';

const GROUP_LABELS = new Map([
  ['00-sistem', '00 — Sistem ve bakım'],
  ['01-urun', '01 — Ürün'],
  ['02-domainler', '02 — Domainler'],
  ['03-mimari', '03 — Mimari'],
  ['04-bilesenler', '04 — Bileşenler'],
  ['05-is-akislari', '05 — İş akışları'],
  ['06-kararlar', '06 — Kararlar'],
  ['07-guvenlik', '07 — Güvenlik'],
  ['08-operasyon', '08 — Operasyon'],
  ['09-yol-haritasi', '09 — Yol haritası'],
  ['10-arastirma', '10 — Araştırma'],
  ['11-kaynaklar', '11 — Kaynaklar'],
  ['ham', 'Ham kaynak alanı'],
  ['sablonlar', 'Şablonlar'],
]);

export function findRepositoryRoot(start = process.cwd()) {
  let current = path.resolve(start);

  while (true) {
    if (fs.existsSync(path.join(current, '.git')) && fs.existsSync(path.join(current, 'bilgi'))) {
      return current;
    }

    const parent = path.dirname(current);
    if (parent === current) return null;
    current = parent;
  }
}

export function listMarkdownFiles(directory) {
  if (!fs.existsSync(directory)) return [];

  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (entry.name.startsWith('.')) return [];
      return listMarkdownFiles(target);
    }
    return entry.isFile() && entry.name.endsWith('.md') ? [target] : [];
  });
}

export function parseFrontmatter(content) {
  const normalized = content.replaceAll('\r\n', '\n');
  const match = normalized.match(/^---\n([\s\S]*?)\n---(?:\n|$)/);
  if (!match) return { body: normalized, data: {}, raw: null };

  const data = {};
  let activeList = null;

  for (const line of match[1].split('\n')) {
    const listItem = line.match(/^\s{2}-\s+(.*)$/);
    if (listItem && activeList) {
      data[activeList].push(unquote(listItem[1].trim()));
      continue;
    }

    const property = line.match(/^([a-zA-Z0-9_-]+):(?:\s*(.*))?$/);
    if (!property) {
      activeList = null;
      continue;
    }

    const [, key, rawValue = ''] = property;
    if (!rawValue.trim()) {
      data[key] = [];
      activeList = key;
    } else if (rawValue.trim() === '[]') {
      data[key] = [];
      activeList = null;
    } else {
      data[key] = unquote(rawValue.trim());
      activeList = null;
    }
  }

  return {
    body: normalized.slice(match[0].length),
    data,
    raw: match[1],
  };
}

export function readVaultNotes(repositoryRoot) {
  const vaultRoot = path.join(repositoryRoot, 'bilgi');

  return listMarkdownFiles(vaultRoot)
    .filter((file) => path.relative(vaultRoot, file).replaceAll(path.sep, '/') !== 'harita.md')
    .map((file) => {
      const content = fs.readFileSync(file, 'utf8');
      const parsed = parseFrontmatter(content);
      const relativePath = path.relative(vaultRoot, file).replaceAll(path.sep, '/');
      const title = readTitle(parsed.body) ?? path.basename(relativePath, '.md');

      return {
        absolutePath: file,
        content,
        frontmatter: parsed.data,
        relativePath,
        summary: readSummary(parsed.body, parsed.data.ozet, title),
        title,
      };
    });
}

export function renderVaultMap(repositoryRoot) {
  const notes = readVaultNotes(repositoryRoot);
  const latestDate = notes
    .map((note) => note.frontmatter.guncellendi)
    .filter((value) => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value))
    .sort()
    .at(-1) ?? '1970-01-01';
  const groups = new Map();

  for (const note of notes) {
    const group = note.relativePath.includes('/') ? note.relativePath.split('/')[0] : 'giris';
    if (!groups.has(group)) groups.set(group, []);
    groups.get(group).push(note);
  }

  const orderedGroups = [...groups.entries()].sort(([left], [right]) => groupOrder(left) - groupOrder(right) || left.localeCompare(right, 'tr'));
  const lines = [
    '---',
    'tur: sistem',
    'durum: mevcut',
    `guncellendi: ${latestDate}`,
    'guven: yuksek',
    'ozet: "Neta bilgi kasasındaki bütün kalıcı notları tek satırlık özetlerle yönlendiren üretilmiş genel indeks."',
    'kaynaklar:',
    '  - bilgi',
    'ilgili:',
    '  - "[[00-sistem/indeks|Küratörlü indeks]]"',
    '  - "[[00-sistem/kasa-semasi|Kasa şeması]]"',
    'etiketler:',
    '  - neta',
    '  - harita',
    '  - indeks',
    '---',
    '',
    '# Neta bilgi haritası',
    '',
    '> Bu dosya `pnpm vault:map` ile üretilir. Elle değiştirilmez; not ekleme, taşıma veya anlamlı metadata değişikliğinden sonra yeniden üretilir.',
    '',
    '## Zorunlu okuma rotası',
    '',
    '1. Her Neta görevinin başında önce bu haritadan geç.',
    '2. [[00-sistem/mevcut-durum|Mevcut durum]] ve [[00-sistem/degismez-kurallar|değişmez kuralları]] oku.',
    '3. Yalnız görevle ilgili domain, mimari, güvenlik ve ADR notlarını seç.',
    '4. Kritik veya değişmiş olabilecek iddiaları notların gösterdiği canonical kod ve `docs/` kaynaklarında yeniden doğrula.',
    '5. Planlanan bir kararı çalışan capability gibi anlatma.',
    '',
    '## Kapsam',
    '',
    `Bu harita **${notes.length}** kalıcı Markdown notunu listeler. Tek satırlık özet yönlendirme içindir; karar veya implementation kanıtının yerine geçmez.`,
  ];

  for (const [group, groupNotes] of orderedGroups) {
    lines.push('', `## ${GROUP_LABELS.get(group) ?? humanize(group)}`, '');

    groupNotes
      .sort((left, right) => noteOrder(left.relativePath) - noteOrder(right.relativePath) || left.relativePath.localeCompare(right.relativePath, 'tr'))
      .forEach((note) => {
        const link = note.relativePath.slice(0, -3);
        const type = note.frontmatter.tur ?? 'bilgi';
        const status = note.frontmatter.durum ?? 'belirsiz';
        lines.push(`- [[${link}|${note.title}]] — ${note.summary} _(${type} · ${status})_`);
      });
  }

  lines.push('', '## Bakım', '', '- Haritayı üret: `pnpm vault:map`', '- Haritanın güncelliğini ve kasa sağlığını denetle: `pnpm vault:check`', '');
  return lines.join('\n');
}

function readTitle(body) {
  return body.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? null;
}

function readSummary(body, frontmatterSummary, title) {
  if (typeof frontmatterSummary === 'string' && frontmatterSummary.trim()) {
    return truncate(cleanInline(frontmatterSummary), 190);
  }

  const lines = body.replace(/^#\s+.+$/m, '').split('\n');
  let inFence = false;
  let paragraph = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (line.startsWith('```')) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    if (!line) {
      if (paragraph.length) break;
      continue;
    }

    if (/^(#|>|[-*+]\s|\d+\.\s|\||---$)/.test(line)) {
      if (paragraph.length) break;
      continue;
    }

    paragraph.push(line);
  }

  const summary = cleanInline(paragraph.join(' '));
  return truncate(summary || `${title} hakkında kalıcı Neta bilgi notu.`, 190);
}

function cleanInline(value) {
  return value
    .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, '$2')
    .replace(/\[\[([^\]]+)\]\]/g, '$1')
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    .replace(/[`*_~]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function truncate(value, maxLength) {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 1).trimEnd()}…`;
}

function unquote(value) {
  if (value.startsWith('"') && value.endsWith('"')) {
    try {
      return JSON.parse(value);
    } catch {
      return value.slice(1, -1);
    }
  }
  if (value.startsWith("'") && value.endsWith("'")) return value.slice(1, -1);
  return value;
}

function humanize(value) {
  return value.replace(/^\d+-/, '').replaceAll('-', ' ').replace(/^./, (character) => character.toLocaleUpperCase('tr-TR'));
}

function groupOrder(group) {
  if (group === 'giris') return -1;
  const numeric = Number.parseInt(group.slice(0, 2), 10);
  if (Number.isFinite(numeric)) return numeric;
  if (group === 'ham') return 90;
  if (group === 'sablonlar') return 91;
  return 89;
}

function noteOrder(relativePath) {
  if (relativePath.endsWith('/indeks.md')) return -3;
  if (relativePath.endsWith('/karar-kaydi.md')) return -2;
  if (relativePath.endsWith('/mevcut-durum.md')) return -1;
  return 0;
}
