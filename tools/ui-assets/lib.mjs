import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const pipeline = path.join(root, 'bilgi/assets-pipeline');
export const slash = (value) => value.split(path.sep).join('/');
export const relative = (value) => slash(path.relative(root, value));
export const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
export const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
export function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}
export function walk(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(file) : [file];
  }).sort();
}
export function safePipelinePath(value) {
  const result = path.resolve(pipeline, value);
  if (!result.startsWith(`${pipeline}${path.sep}`)) throw new Error('Pipeline dışına yazılamaz.');
  return result;
}
export function pageFolder(page) { return safePipelinePath(`pages/${page.platform}/${page.actor}/${page.id}`); }
export function recordScreenshot(page, file, details) {
  const bytes = fs.readFileSync(file);
  if (bytes.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') throw new Error('PNG olmayan screenshot');
  const manifest = path.join(pageFolder(page), 'screenshots/manifest.json');
  const current = fs.existsSync(manifest) ? readJson(manifest) : { pageId: page.id, captures: [] };
  const capture = { file: relative(file), sha256: sha256(bytes), bytes: bytes.length,
    width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20), capturedAt: new Date().toISOString(), ...details };
  current.captures = current.captures.filter((item) => item.file !== capture.file).concat(capture);
  writeJson(manifest, current);
}
