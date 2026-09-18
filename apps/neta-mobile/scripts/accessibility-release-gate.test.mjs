import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cp, mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

test('accessibility scan needs no ripgrep or package cwd and checks nested TSX files', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'neta a11y '));
  try {
    await mkdir(path.join(root, 'scripts'));
    await mkdir(path.join(root, 'src/app/nested'), { recursive: true });
    await mkdir(path.join(root, 'src/components/navigation'), { recursive: true });
    await cp(new URL('./accessibility-release-gate.mjs', import.meta.url), path.join(root, 'scripts/gate.mjs'));
    await writeFile(path.join(root, 'src/components/navigation/app-shell.tsx'),
      'accessibilityRole="tab"; accessibilityViewIsModal; setAccessibilityFocus(); reduceMotion ? \'none\' : \'slide\';');
    const page = path.join(root, 'src/app/nested/page.tsx');
    const run = () => spawnSync(process.execPath, [path.join(root, 'scripts/gate.mjs')], {
      cwd: os.tmpdir(), env: { ...process.env, PATH: '' }, encoding: 'utf8', timeout: 10_000,
    });
    await writeFile(page, '<Pressable accessibilityRole="button" />');
    assert.equal(run().status, 0);
    await writeFile(page, '<Pressable /><Text allowFontScaling={false} /><TouchableOpacity />');
    const result = run();
    assert.equal(result.status, 1);
    assert.match(result.stderr, /font scaling/);
    assert.match(result.stderr, /accessibilityRole olmayan Pressable/);
    assert.match(result.stderr, /48dp/);
    assert.match(result.stderr, /page\.tsx/);
    await rm(path.join(root, 'src/components/navigation/app-shell.tsx'));
    assert.notEqual(run().status, 0, 'missing shell must fail closed');
  } finally { await rm(root, { recursive: true, force: true }); }
});
