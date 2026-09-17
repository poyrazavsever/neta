export const RELEASE_GATES = Object.freeze([
  'signed-ios', 'signed-android', 'two-https-instances', 'owner-client-native',
  'ai-provider-native', 'native-a11y-performance', 'migration-restore',
  'compatibility', 'store-internal', 'privacy-support-license', 'operations',
]);

// A passed quality check never substitutes for these reviewed release proofs.
export async function evaluateReleaseRecord(record, context) {
  const blockers = new Set();
  const block = id => blockers.add(id);
  if (!hasKeys(record, ['schemaVersion', 'release', 'operations', 'gates']) || record.schemaVersion !== 1) return ['record.schema'];
  if (!hasKeys(record.release, ['appVersion', 'commit']) || record.release.appVersion !== context.appVersion) block('release.version');
  if (!/^[a-f0-9]{40}$/.test(record.release?.commit ?? '') || record.release.commit !== context.sourceCommit || context.sourceMatches !== true) block('release.commit');
  if (context.dirty) block('release.dirty-worktree');
  if (!hasKeys(record.operations, ['privacyUrl', 'supportUrl', 'incidentOwner', 'licenseDecision'])) block('operations.schema');
  for (const field of ['privacyUrl', 'supportUrl']) if (!publicUrl(record.operations?.[field])) block(`operations.${field}`);
  if (!label(record.operations?.incidentOwner)) block('operations.incidentOwner');
  if (record.operations?.licenseDecision !== 'approved') block('operations.licenseDecision');
  if (!Array.isArray(record.gates)) return [...blockers, 'gates.schema'];
  const seen = new Set();
  for (const gate of record.gates) {
    if (!hasKeys(gate, ['id', 'status', 'reviewedBy', 'reviewedAt', 'evidence', 'artifact']) || !RELEASE_GATES.includes(gate.id) || seen.has(gate.id)) { block('gates.schema'); continue; }
    seen.add(gate.id);
    if (gate.status !== 'passed') { block(`gate.${gate.id}`); continue; }
    if (!label(gate.reviewedBy) || !reviewTime(gate.reviewedAt, context.now)) block(`gate.${gate.id}.review`);
    if (!hasKeys(gate.evidence, ['path', 'sha256']) || !/^docs\/mobile\/release\/evidence\/[a-z0-9][a-z0-9-]*\.md$/.test(gate.evidence.path) || !sha256(gate.evidence.sha256)) {
      block(`gate.${gate.id}.evidence`);
    } else {
      try { if (await context.evidenceHash(gate.evidence.path) !== gate.evidence.sha256) block(`gate.${gate.id}.evidence-hash`); }
      catch { block(`gate.${gate.id}.evidence-unavailable`); }
    }
    if (gate.id.startsWith('signed-')) {
      const extension = gate.id === 'signed-ios' ? 'ipa' : 'aab';
      if (!hasKeys(gate.artifact, ['fileName', 'sha256', 'signing', 'certificateSha256', 'buildVersion']) ||
        !new RegExp(`^[A-Za-z0-9][A-Za-z0-9._-]*\\.${extension}$`).test(gate.artifact.fileName) ||
        !sha256(gate.artifact.sha256) || !sha256(gate.artifact.certificateSha256) || gate.artifact.signing !== 'release' ||
        !/^[1-9]\d*$/.test(gate.artifact.buildVersion)) block(`gate.${gate.id}.signed-artifact`);
    } else if (gate.artifact !== null) block(`gate.${gate.id}.artifact`);
  }
  for (const id of RELEASE_GATES) if (!seen.has(id)) block(`gate.${id}.missing`);
  return [...blockers].sort();
}

function hasKeys(value, keys) {
  return value !== null && typeof value === 'object' && !Array.isArray(value) &&
    Object.keys(value).length === keys.length && keys.every(key => Object.hasOwn(value, key));
}
function sha256(value) { return typeof value === 'string' && /^[a-f0-9]{64}$/.test(value); }
function label(value) { return typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9 ._-]{1,79}$/.test(value); }
function reviewTime(value, now) {
  if (typeof value !== 'string') return false;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) && date.toISOString() === value && date.getTime() <= now.getTime();
}
function publicUrl(value) {
  if (typeof value !== 'string') return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password && !url.search && !url.hash &&
      /^[a-z0-9-]+(?:\.[a-z0-9-]+)+$/i.test(url.hostname) && !/^\d+\.\d+\.\d+\.\d+$/.test(url.hostname) &&
      !/(?:^|\.)(?:localhost|local|test|invalid|example|example\.com|example\.net|example\.org)$/i.test(url.hostname);
  } catch { return false; }
}
