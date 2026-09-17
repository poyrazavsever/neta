import { readFile, realpath } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { evaluateReleaseRecord } from './release-readiness.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const args = process.argv.slice(2);
if (args.length > 1 || (args.length && !['--strict', '--report'].includes(args[0]))) throw new Error('Usage: release-readiness-gate.mjs [--report | --strict]');
const strict = args[0] === '--strict';
let report;
try {
  const text = await readFile(path.join(root, 'docs/mobile/release/release-candidate.json'), 'utf8');
  if (Buffer.byteLength(text) > 64 * 1024) throw new Error('Oversized record');
  const record = JSON.parse(text);
  const mobile = JSON.parse(await readFile(path.join(root, 'apps/neta-mobile/package.json'), 'utf8'));
  const git = args => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
  let sourceCommit = null; let sourceMatches = false;
  if (/^[a-f0-9]{40}$/.test(record.release?.commit ?? '')) {
    try {
      sourceCommit = git(['rev-parse', `${record.release.commit}^{commit}`]);
      git(['merge-base', '--is-ancestor', sourceCommit, 'HEAD']);
      // Evidence may be committed after the candidate without changing its code.
      sourceMatches = git(['diff', '--name-only', sourceCommit, 'HEAD', '--', 'apps', 'packages', 'tools', '.github', 'package.json', 'pnpm-lock.yaml', 'pnpm-workspace.yaml', '.nvmrc', 'Dockerfile', 'docker-compose.yml']) === '';
    } catch { sourceMatches = false; }
  }
  const blockers = await evaluateReleaseRecord(record, {
    appVersion: mobile.version, sourceCommit, sourceMatches, dirty: Boolean(git(['status', '--porcelain', '--untracked-files=normal'])), now: new Date(),
    async evidenceHash(relative) {
      const target = path.resolve(root, relative);
      if (await realpath(target) !== target) throw new Error('Linked evidence');
      return createHash('sha256').update(await readFile(target)).digest('hex');
    },
  });
  report = { schemaVersion: 1, ready: blockers.length === 0, blockers };
} catch { report = { schemaVersion: 1, ready: false, blockers: ['record.unreadable'] }; }
// Only identifiers are emitted: no URLs, reviewer details, credentials or body.
process.stdout.write(JSON.stringify(report, null, 2) + '\n');
if (strict && !report.ready) process.exitCode = 1;
