import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as sass from 'sass';
import { placeholderPdf } from './pdf.mjs';
import { pages } from './pages.mjs';
import { documents } from './data.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const write = async (rel, content) => {
  const file = join(dist, rel);
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, content);
};

await rm(dist, { recursive: true, force: true });

// Стили
const { css } = sass.compile(join(root, 'src/styles/main.scss'), { style: 'compressed' });
await write('assets/style.css', css);

// Шрифты (Golos Text, Unbounded: кириллица и латиница), хранятся рядом со стилями
const fontDir = (name) => join(root, 'node_modules/@fontsource-variable', name, 'files');
for (const [pkg, file] of [
  ['golos-text', 'golos-text-cyrillic-wght-normal.woff2'],
  ['golos-text', 'golos-text-latin-wght-normal.woff2'],
  ['unbounded', 'unbounded-cyrillic-wght-normal.woff2'],
  ['unbounded', 'unbounded-latin-wght-normal.woff2'],
]) {
  await cp(join(fontDir(pkg), file), join(dist, 'assets/fonts', file));
}
await cp(join(root, 'src/assets/favicon.svg'), join(dist, 'assets/favicon.svg'));

// Страницы
for (const [path, html] of Object.entries(pages())) await write(path, html);

// Демонстрационные файлы реестра
for (const d of documents) await write(`files/${d.slug}.pdf`, placeholderPdf(d.number));

console.log(`Готово: ${Object.keys(pages()).length} страниц, ${documents.length} файлов -> dist/`);
