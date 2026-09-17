import { access, readFile, readdir } from 'node:fs/promises';
import { runAutolinking } from './expo-cli.mjs';

const root = new URL('../', import.meta.url);
const args = process.argv.slice(2);
const sourceOnly = args.length === 1 && args[0] === '--source-only';
const platform = args.length === 2 && args[0] === '--platform' ? args[1] : 'all';
if ((!sourceOnly && args.length && !(args.length === 2 && args[0] === '--platform')) || !['all', 'android', 'ios'].includes(platform)) {
  throw new Error('Usage: native-release-gate.mjs [--source-only | --platform android|ios|all]');
}
const failures = [];
const packageJson = JSON.parse(await readFile(new URL('package.json', root), 'utf8'));
const appConfig = await readFile(new URL('app.config.ts', root), 'utf8');
const plugin = await readFile(new URL('plugins/with-neta-ios-fixes.cjs', root), 'utf8');
const modules = [
  ['expo-document-picker', 'ExpoDocumentPicker'],
  ['expo-file-system', 'ExpoFileSystem'],
  ['expo-crypto', 'ExpoCrypto'],
  ['expo-secure-store', 'ExpoSecureStore'],
  ['expo-sharing', 'ExpoSharing'],
  ['@react-native-community/datetimepicker', 'RNDateTimePicker'],
];
for (const [dependency] of modules) if (!packageJson.dependencies?.[dependency]) failures.push(`package.json: ${dependency} eksik`);
if (!appConfig.includes('./plugins/with-neta-ios-fixes.cjs') || !plugin.includes("phase.alwaysOutOfDate = '1'")) failures.push('iOS config-plugin dependency-analysis düzeltmesi eksik');
if (!appConfig.includes('configureAndroidBackup: true')) failures.push('SecureStore Android backup exclusion config eksik');

try {
  const resolution = JSON.parse(runAutolinking(['resolve', '--platform', 'android', '--json']));
  const packages = new Set((resolution.modules ?? []).map(module => module.packageName));
  for (const [dependency] of modules.filter(([name]) => name.startsWith('expo-'))) if (!packages.has(dependency)) failures.push(`Expo autolinking: ${dependency} resolve edilmedi`);
  const rn = JSON.parse(runAutolinking(['react-native-config', '--platform', 'android', '--json']));
  if (!rn.dependencies?.['@react-native-community/datetimepicker']?.platforms?.android) failures.push('React Native autolinking: RNDateTimePicker resolve edilmedi');
} catch {
  failures.push('Android autolinking çözümlemesi çalışmadı');
}

if (!sourceOnly && ['all', 'android'].includes(platform)) {
  try {
    const settings = await readFile(new URL('android/settings.gradle', root), 'utf8');
    if (!settings.includes('expoAutolinking')) failures.push('android/settings.gradle: Expo autolinking eksik');
    await access(new URL('android/gradlew', root));
  } catch { failures.push('Android native proje eksik; expo prebuild --platform android --no-install çalıştır'); }
}
if (!sourceOnly && ['all', 'ios'].includes(platform)) {
  try {
    const lock = await readFile(new URL('ios/Podfile.lock', root), 'utf8');
    for (const [, nativeName] of modules) if (!lock.includes(nativeName)) failures.push(`ios/Podfile.lock: ${nativeName} eksik`);
    const workspaces = (await readdir(new URL('ios/', root), { withFileTypes: true })).filter(entry => entry.isDirectory() && entry.name.endsWith('.xcworkspace'));
    if (workspaces.length !== 1) throw new Error('Expected one app workspace');
    await access(new URL(`ios/${workspaces[0].name}/contents.xcworkspacedata`, root));
    const manifest = await readFile(new URL('ios/Pods/Manifest.lock', root), 'utf8');
    if (manifest !== lock) failures.push('Podfile.lock ile Pods/Manifest.lock senkron değil');
  } catch { failures.push('iOS native proje/Pods eksik; macOS üzerinde pnpm ios:pods çalıştır'); }
}
for (const file of await sourceTree(new URL('src/', root))) {
  const source = await readFile(file, 'utf8');
  if (/from ['"]expo-haptics['"]|\bHaptics\.|\bVibration\./.test(source)) failures.push(`${file.pathname}: onaysız haptic çağrısı`);
}
if (packageJson.dependencies?.['expo-haptics']) failures.push('Kullanılmayan expo-haptics native bağımlılığı');
if (failures.length) { process.stderr.write(`${failures.join('\n')}\n`); process.exitCode = 1; }
else process.stdout.write(`Native ${sourceOnly ? 'source/config + autolinking' : platform + ' project + autolinking'} gate passed; signed build/device acceptance remains separate.\n`);

async function sourceTree(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const url = new URL(`${entry.name}${entry.isDirectory() ? '/' : ''}`, directory);
    if (entry.isDirectory()) files.push(...await sourceTree(url));
    else if (/\.[jt]sx?$/.test(entry.name)) files.push(url);
  }
  return files;
}
