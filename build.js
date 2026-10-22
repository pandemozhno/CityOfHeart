// Сборка проекта в один HTML-файл
// Запуск: node build.js   или   npm run build
// Результат: dist/city-of-heart.html

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = __dirname;
const OUT_DIR = path.join(ROOT, 'dist');
const OUT_FILE = path.join(OUT_DIR, 'city-of-heart.html');

const JS_FILES = [
  'js/data.js',
  'js/state.js',
  'js/game.js',
  'js/render.js',
  'js/main.js'
];

const CSS_FILE = 'css/style.css';
const HTML_FILE = 'index.html';

function readFile(rel) {
  const full = path.join(ROOT, rel);
  if (!fs.existsSync(full)) {
    console.error(`✗ Не найден файл: ${rel}`);
    process.exit(1);
  }
  return fs.readFileSync(full, 'utf8');
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

console.log('🔨 Сборка "Города Сердца"...\n');

let html = readFile(HTML_FILE);

// 1) Встраиваем CSS
const css = readFile(CSS_FILE);
const cssTag = new RegExp(`<link[^>]+href=["']${escapeRegex(CSS_FILE)}["'][^>]*>`, 'i');
if (!cssTag.test(html)) {
  console.error(`✗ В index.html не найден тег <link href="${CSS_FILE}">`);
  process.exit(1);
}
html = html.replace(cssTag, `<style>\n${css}\n</style>`);
console.log(`  ✓ CSS: ${CSS_FILE} (${(css.length / 1024).toFixed(1)} KB)`);

// 2) Встраиваем JS в нужном порядке
for (const file of JS_FILES) {
  const code = readFile(file);
  const scriptTag = new RegExp(`<script[^>]+src=["']${escapeRegex(file)}["'][^>]*><\\/script>`, 'i');
  if (!scriptTag.test(html)) {
    console.error(`✗ В index.html не найден <script src="${file}">`);
    process.exit(1);
  }
  html = html.replace(scriptTag, `<script>\n${code}\n</script>`);
  console.log(`  ✓ JS: ${file} (${(code.length / 1024).toFixed(1)} KB)`);
}

// 3) Сохраняем результат
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(OUT_FILE, html, 'utf8');

const totalKb = (html.length / 1024).toFixed(1);
console.log(`\n✅ Готово: ${path.relative(ROOT, OUT_FILE)} (${totalKb} KB)`);
console.log(`   Откройте этот файл в браузере — он работает автономно.\n`);