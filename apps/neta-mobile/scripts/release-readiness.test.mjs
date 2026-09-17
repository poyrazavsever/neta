import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtempSync, mkdirSync, copyFileSync, writeFileSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { evaluateReleaseRecord, RELEASE_GATES } from './release-readiness.mjs';

const context = { appVersion: '0.1.0', sourceCommit: 'a'.repeat(40), sourceMatches: true, dirty: false, now: new Date('2026-09-17T12:00:00.000Z'), evidenceHash: async () => 'b'.repeat(64) };
function reviewedRecord() {
  return { schemaVersion: 1, release: { appVersion: '0.1.0', commit: context.sourceCommit },
    operations: { privacyUrl: 'https://takeneta.com/privacy', supportUrl: 'https://takeneta.com/support', incidentOwner: 'release-owner', licenseDecision: 'approved' },
    gates: RELEASE_GATES.map(id => ({ id, status: 'passed', reviewedBy: 'release-reviewer', reviewedAt: '2026-09-17T11:00:00.000Z',
      evidence: { path: `docs/mobile/release/evidence/${id}.md`, sha256: 'b'.repeat(64) },
      artifact: id.startsWith('signed-') ? { fileName: id === 'signed-ios' ? 'Neta.ipa' : 'Neta.aab', sha256: 'c'.repeat(64), certificateSha256: 'd'.repeat(64), signing: 'release', buildVersion: '12' } : null })) };
}

test('release readiness requires every reviewed proof and the exact clean revision', async () => {
  assert.deepEqual(await evaluateReleaseRecord(reviewedRecord(), context), []);
  const record = reviewedRecord(); record.gates[0].status = 'pending'; record.gates.pop();
  const blockers = await evaluateReleaseRecord(record, { ...context, sourceMatches: false, dirty: true });
  for (const id of ['gate.signed-ios', 'gate.operations.missing', 'release.commit', 'release.dirty-worktree']) assert.ok(blockers.includes(id));
  const duplicate = reviewedRecord(); duplicate.gates.push(duplicate.gates[0]);
  assert.ok((await evaluateReleaseRecord(duplicate, context)).includes('gates.schema'));
});
test('changed, missing and unsafe evidence cannot be marked accepted', async () => {
  assert.ok((await evaluateReleaseRecord(reviewedRecord(), { ...context, evidenceHash: async () => 'f'.repeat(64) })).includes('gate.signed-ios.evidence-hash'));
  assert.ok((await evaluateReleaseRecord(reviewedRecord(), { ...context, evidenceHash: async () => { throw Error('missing'); } })).includes('gate.signed-ios.evidence-unavailable'));
  for (const value of ['../../private.md', 'https://example.com/proof?token=secret', 'docs/mobile/release/evidence/proof.md?token=secret']) {
    const record = reviewedRecord(); record.gates[0].evidence.path = value;
    assert.ok((await evaluateReleaseRecord(record, context)).includes('gate.signed-ios.evidence'));
  }
});
test('debug signing, JS exports and unreviewed claims never substitute for store artifacts', async () => {
  for (const change of [{ signing: 'debug' }, { fileName: 'entry.hbc' }, { certificateSha256: '' }, { buildVersion: '0' }]) {
    const record = reviewedRecord(); Object.assign(record.gates[0].artifact, change);
    assert.ok((await evaluateReleaseRecord(record, context)).includes('gate.signed-ios.signed-artifact'));
  }
  const record = reviewedRecord(); record.gates[0].reviewedAt = '2099-01-01T00:00:00.000Z'; record.gates[1].reviewedBy = null;
  const blockers = await evaluateReleaseRecord(record, context);
  assert.ok(blockers.includes('gate.signed-ios.review')); assert.ok(blockers.includes('gate.signed-android.review'));
});
test('placeholder URLs, unresolved licensing and credential-shaped fields block submission', async () => {
  for (const value of ['http://takeneta.com/privacy', 'https://example.com/privacy', 'https://127.0.0.1/privacy', 'https://user:secret@takeneta.com/privacy', 'https://takeneta.com/privacy?token=secret']) {
    const record = reviewedRecord(); record.operations.privacyUrl = value;
    assert.ok((await evaluateReleaseRecord(record, context)).includes('operations.privacyUrl'));
  }
  const record = reviewedRecord(); record.operations.licenseDecision = 'pending'; record.password = 'do-not-store';
  assert.deepEqual(await evaluateReleaseRecord(record, context), ['record.schema']);
  delete record.password;
  assert.ok((await evaluateReleaseRecord(record, context)).includes('operations.licenseDecision'));
});

test('CLI accepts evidence-only commits but rejects changed candidate code and dirty trees', () => {
  const base = path.resolve(tmpdir());
  const root = mkdtempSync(path.join(base, 'neta-release-source-test-'));
  const env = { ...process.env, GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: path.join(root, 'no-global-config') };
  const git = args => execFileSync('git', args, { cwd: root, env, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  const commit = () => { git(['add', '.']); git(['-c', 'user.name=Release Fixture', '-c', 'user.email=fixture@example.test', 'commit', '--quiet', '-m', 'synthetic acceptance fixture']); };
  const scripts = path.join(root, 'apps/neta-mobile/scripts');
  const cli = path.join(scripts, 'release-readiness-gate.mjs');
  const run = () => {
    const result = spawnSync(process.execPath, [cli, '--strict'], { cwd: root, env, encoding: 'utf8' });
    assert.equal(result.error, undefined);
    return { status: result.status, report: JSON.parse(result.stdout) };
  };
  try {
    mkdirSync(scripts, { recursive: true });
    for (const file of ['release-readiness-gate.mjs', 'release-readiness.mjs']) copyFileSync(new URL(file, import.meta.url), path.join(scripts, file));
    writeFileSync(path.join(root, 'apps/neta-mobile/package.json'), JSON.stringify({ version: '0.1.0' }));
    git(['init', '--quiet']); commit();
    const record = reviewedRecord(); record.release.commit = git(['rev-parse', 'HEAD']);
    mkdirSync(path.join(root, 'docs/mobile/release/evidence'), { recursive: true });
    for (const gate of record.gates) {
      const content = 'Synthetic test attestation; not a real store acceptance.\n';
      writeFileSync(path.join(root, gate.evidence.path), content);
      gate.evidence.sha256 = createHash('sha256').update(content).digest('hex');
      gate.reviewedAt = '2020-01-01T00:00:00.000Z';
    }
    writeFileSync(path.join(root, 'docs/mobile/release/release-candidate.json'), JSON.stringify(record));
    commit(); // Record references its source commit, never its own future SHA.
    assert.deepEqual(run(), { status: 0, report: { schemaVersion: 1, ready: true, blockers: [] } });
    writeFileSync(path.join(root, 'untracked.txt'), 'PRIVATE-FIXTURE-CONTENT');
    assert.ok(run().report.blockers.includes('release.dirty-worktree'));
    rmSync(path.join(root, 'untracked.txt'));
    writeFileSync(path.join(scripts, 'release-readiness.mjs'), readFileSync(path.join(scripts, 'release-readiness.mjs'), 'utf8') + '\n// changed candidate code\n');
    commit();
    const changed = run(); assert.equal(changed.status, 1); assert.ok(changed.report.blockers.includes('release.commit'));
  } finally {
    if (path.dirname(path.resolve(root)) !== base || !path.basename(root).startsWith('neta-release-source-test-')) throw new Error('Unexpected fixture cleanup target');
    rmSync(root, { recursive: true, force: true });
  }
});
