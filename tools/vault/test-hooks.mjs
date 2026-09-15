import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

import { findRepositoryRoot } from './lib.mjs';

const repositoryRoot = findRepositoryRoot();
assert.ok(repositoryRoot, 'Repository kökü bulunmalı.');

const stateDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'neta-vault-hook-test-'));
const hookPath = path.join(repositoryRoot, '.codex', 'hooks', 'neta-vault.mjs');
const sessionId = `test-${process.pid}`;

try {
  const session = runHook({
    cwd: repositoryRoot,
    hook_event_name: 'SessionStart',
    session_id: sessionId,
    source: 'startup',
  });
  assert.match(session.hookSpecificOutput.additionalContext, /bilgi\/harita\.md/);
  assert.match(session.hookSpecificOutput.additionalContext, /ADR-007/);

  const mobilePrompt = runHook({
    cwd: repositoryRoot,
    hook_event_name: 'UserPromptSubmit',
    prompt: 'Mobil instance ve pairing planını güncelle',
    session_id: sessionId,
    turn_id: 'turn-mobile',
  });
  assert.match(mobilePrompt.hookSpecificOutput.additionalContext, /mobil-uygulama-plani\.md/);
  assert.match(mobilePrompt.hookSpecificOutput.additionalContext, /ADR-008/);

  const unrelatedPrompt = runHook({
    cwd: repositoryRoot,
    hook_event_name: 'UserPromptSubmit',
    prompt: 'Merhaba',
    session_id: sessionId,
    turn_id: 'turn-empty',
  });
  assert.deepEqual(unrelatedPrompt, {});

  const stop = runHook({
    cwd: repositoryRoot,
    hook_event_name: 'Stop',
    session_id: sessionId,
    stop_hook_active: false,
    turn_id: 'turn-stop',
  });
  assert.deepEqual(stop, {});

  console.log('Vault hook testleri başarılı: session, prompt routing ve stop no-op.');
} finally {
  fs.rmSync(stateDirectory, { force: true, recursive: true });
}

function runHook(payload) {
  const result = spawnSync(process.execPath, [hookPath], {
    cwd: repositoryRoot,
    encoding: 'utf8',
    env: { ...process.env, NETA_VAULT_HOOK_STATE_DIR: stateDirectory },
    input: JSON.stringify(payload),
  });
  assert.equal(result.status, 0, result.stderr || 'Hook başarısız.');
  return JSON.parse(result.stdout || '{}');
}
