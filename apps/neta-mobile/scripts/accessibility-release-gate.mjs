import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const root = new URL('../', import.meta.url);
const files = ['src/app/', 'src/components/'].flatMap(directory =>
  readdirSync(new URL(directory, root), { recursive: true, withFileTypes: true })
    .filter(entry => entry.isFile() && entry.name.endsWith('.tsx'))
    .map(entry => path.join(entry.parentPath, entry.name)))
  .sort();
const failures = [];
for (const file of files) {
  const source = readFileSync(file, 'utf8');
  if (/allowFontScaling\s*=\s*\{false\}/.test(source)) failures.push(`${file}: font scaling kapatılamaz`);
  if (/<(?:TouchableOpacity|TouchableHighlight|TouchableWithoutFeedback)\b/.test(source)) failures.push(`${file}: ortak 48dp Button/Pressable semantiğini kullan`);
  for (const match of source.matchAll(/<Pressable\b([\s\S]*?)>/g)) {
    if (!/accessibilityRole=/.test(match[1] ?? '')) failures.push(`${file}: accessibilityRole olmayan Pressable`);
  }
}

const shell = readFileSync(new URL('src/components/navigation/app-shell.tsx', root), 'utf8');
for (const [pattern, message] of [
  [/accessibilityRole="tab"/, 'bottom navigation tab semantiği eksik'],
  [/accessibilityViewIsModal/, 'Others sheet modal focus sınırı eksik'],
  [/setAccessibilityFocus/, 'Others sheet focus geri dönüşü eksik'],
  [/reduceMotion \? 'none' : 'slide'/, 'Reduce Motion sheet davranışı eksik'],
]) {
  if (!pattern.test(shell)) failures.push(`src/components/navigation/app-shell.tsx: ${message}`);
}
if (failures.length) {
  process.stderr.write(`${failures.join('\n')}\n`);
  process.exit(1);
}
