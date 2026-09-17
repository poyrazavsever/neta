import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const root = fileURLToPath(new URL('../', import.meta.url));
const expoRoot = path.dirname(require.resolve('expo/package.json'));

// Run JavaScript entry points directly; .bin shell shims are not portable.
export function runExpo(args, options = {}) {
  return execFileSync(process.execPath, [path.join(expoRoot, 'bin/cli'), ...args], { cwd: root, encoding: 'utf8', ...options });
}

export function runAutolinking(args) {
  return execFileSync(process.execPath, [path.join(expoRoot, 'bin/autolinking'), ...args], { cwd: root, encoding: 'utf8' });
}
