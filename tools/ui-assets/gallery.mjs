import fs from 'node:fs';
import path from 'node:path';
import { root, pipeline, readJson, pageFolder } from './lib.mjs';

const escape = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const pages = readJson(path.join(pipeline, 'inventory/pages.json')).pages;
let count = 0;
const sections = pages.map((page) => {
  const manifest = path.join(pageFolder(page), 'screenshots/manifest.json');
  const captures = fs.existsSync(manifest) ? readJson(manifest).captures : [];
  count += captures.length;
  return `<section data-search="${escape(`${page.platform} ${page.actor} ${page.id} ${page.route}`)}"><h2>${escape(`${page.platform} / ${page.actor} / ${page.id}`)}</h2><p>${escape(page.route)} · <a href="${path.relative(pipeline, path.join(pageFolder(page), 'plan.json')).replaceAll('\\', '/')}">Sayfa planı</a></p><div class="grid">${captures.map((capture) => {
    const url = path.relative(pipeline, path.join(root, capture.file)).replaceAll('\\', '/');
    return `<figure><a href="${escape(url)}"><img loading="lazy" src="${escape(url)}" alt="${escape(`${page.id} ${capture.theme} ${capture.state}`)}"></a><figcaption>${escape(`${capture.theme} · ${capture.locale} · ${capture.state} · ${capture.width}×${capture.height}`)}</figcaption></figure>`;
  }).join('')}</div></section>`;
}).join('');
fs.writeFileSync(path.join(pipeline, 'galeri.html'), `<!doctype html><html lang="tr"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Neta UI başlangıç arşivi</title><style>body{font:16px system-ui;background:#101522;color:#e5eaf5;margin:32px}a{color:#a9c6ff}input{padding:12px;width:min(600px,90%);font:inherit}section{border-top:1px solid #344055;padding:20px 0}.grid{display:flex;flex-wrap:wrap;gap:20px}figure{width:280px;margin:0}img{width:100%;height:400px;object-fit:contain;object-position:top;background:#242d40}figcaption{font-size:13px;padding:8px}p{color:#b3bfd6}[hidden]{display:none}</style><h1>Neta UI başlangıç arşivi</h1><p>${pages.length} route · ${count} gerçek ekran görüntüsü. Sentetik fixture; Android debug ve web production. Görsele tıklayarak tam boy aç.</p><input id="search" aria-label="Sayfa ara" placeholder="Platform, rol veya sayfa ara…">${sections}<script>document.querySelector('#search').addEventListener('input',e=>{const q=e.target.value.toLocaleLowerCase('tr');document.querySelectorAll('section').forEach(s=>s.hidden=!s.dataset.search.toLocaleLowerCase('tr').includes(q))})</script></html>\n`);
console.log(`Gallery: ${count} captures.`);
