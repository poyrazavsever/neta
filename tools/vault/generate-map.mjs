import fs from 'node:fs';
import path from 'node:path';

import { findRepositoryRoot, renderVaultMap } from './lib.mjs';

const repositoryRoot = findRepositoryRoot();
if (!repositoryRoot) {
  console.error('Neta repository kökü bulunamadı.');
  process.exit(1);
}

const mapPath = path.join(repositoryRoot, 'bilgi', 'harita.md');
const expected = renderVaultMap(repositoryRoot);

if (process.argv.includes('--check')) {
  const current = fs.existsSync(mapPath) ? fs.readFileSync(mapPath, 'utf8') : '';
  if (current !== expected) {
    console.error('bilgi/harita.md güncel değil. `pnpm vault:map` çalıştırın.');
    process.exit(1);
  }
  console.log('Vault haritası güncel.');
  process.exit(0);
}

fs.writeFileSync(mapPath, expected, 'utf8');
console.log(`Vault haritası üretildi: ${path.relative(repositoryRoot, mapPath)}`);
