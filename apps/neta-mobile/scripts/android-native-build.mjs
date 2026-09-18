import { spawn } from 'node:child_process';
import { access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Compile a release APK for native validation. Expo's generated debug signing
// is not a Play upload key and this command never claims store acceptance.
const args = process.argv.slice(2);
const architectures = ['arm64-v8a', 'armeabi-v7a', 'x86', 'x86_64'];
if (args.length && !(args.length === 2 && args[0] === '--architecture' && architectures.includes(args[1]))) {
  throw new Error('Usage: android-native-build.mjs [--architecture arm64-v8a|armeabi-v7a|x86|x86_64]');
}
const android = fileURLToPath(new URL('../android/', import.meta.url));
const wrapper = path.join(android, 'gradle/wrapper/gradle-wrapper.jar');
try { await access(wrapper); }
catch { throw new Error('Android native project missing. Run expo prebuild --platform android --no-install first.'); }
const java = process.env.JAVA_HOME
  ? path.join(process.env.JAVA_HOME, 'bin', process.platform === 'win32' ? 'java.exe' : 'java')
  : 'java';
// SDK 57's executable Gradle wrapper JAR avoids Windows batch/shell quoting.
const child = spawn(java, [
  '-Xmx64m', '-Xms64m', '-jar', wrapper, 'app:assembleRelease',
  '--no-daemon', '--console=plain', '--max-workers=2',
  ...(args.length ? [`-PreactNativeArchitectures=${args[1]}`] : []),
], {
  cwd: android,
  stdio: 'inherit',
  env: { ...process.env, EXPO_PUBLIC_APP_ENV: 'production', EXPO_PUBLIC_NETA_ORIGIN: '', EXPO_NO_DOTENV: '1' },
});
child.on('error', error => { process.stderr.write(`Unable to start Java: ${error.code ?? 'UNKNOWN'}\n`); process.exitCode = 1; });
child.on('close', code => {
  process.exitCode = code ?? 1;
  if (code === 0) process.stdout.write('Android release APK compiled. Signing/store/device acceptance remains pending.\n');
});
