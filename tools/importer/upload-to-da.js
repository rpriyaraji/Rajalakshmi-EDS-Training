/* eslint-disable */
/*
 * upload-to-da.js — publish migrated content fragments to Document Authoring.
 *
 * For each content/**.plain.html fragment it:
 *   1. wraps the bare section <div>s in a full <body><header></header>
 *      <main>…</main><footer></footer></body> document (DA renders bare
 *      fragments as an empty <div></div>);
 *   2. rewrites root-absolute /media/... image srcs to absolute live URLs so
 *      DA ingests them as optimized assets instead of failing to about:error;
 *   3. POSTs the document to the DA source API (auth header injected by host).
 *
 * Usage:
 *   node tools/importer/upload-to-da.js [--only /us/en/adventures]
 *     [--org rpriyaraji] [--repo rajalakshmi-eds-training]
 *     [--live https://main--rajalakshmi-eds-training--rpriyaraji.aem.live]
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = process.cwd();
const CONTENT_DIR = path.join(ROOT, 'content');

function arg(name, def) {
  const i = process.argv.indexOf(name);
  return i !== -1 ? process.argv[i + 1] : def;
}

const ORG = arg('--org', 'rpriyaraji');
const REPO = arg('--repo', 'rajalakshmi-eds-training');
const LIVE = arg('--live', `https://main--${REPO}--${ORG}.aem.live`);
const ONLY = arg('--only', '');

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, out);
    else if (entry.name.endsWith('.plain.html')) out.push(p);
  }
  return out;
}

// content/us/en/foo.plain.html -> /us/en/foo
function contentPath(file) {
  const rel = path.relative(CONTENT_DIR, file).replace(/\.plain\.html$/, '');
  return `/${rel}`;
}

function wrapDocument(fragment) {
  // Rewrite /media/... to absolute live URLs (root-absolute -> about:error on DA).
  const withAbsImages = fragment.replace(/(src|srcset)="(\/media\/[^"]+)"/g, (m, attr, url) => `${attr}="${LIVE}${url}"`);
  return `<body>\n<header></header>\n<main>\n${withAbsImages}\n</main>\n<footer></footer>\n</body>\n`;
}

function uploadOne(file) {
  const p = contentPath(file);
  // nav/footer are fragments, not pages — still uploaded as-is documents.
  const html = wrapDocument(fs.readFileSync(file, 'utf8'));
  const tmp = path.join(require('os').tmpdir(), `da-upload-${p.replace(/\W+/g, '_')}.html`);
  fs.writeFileSync(tmp, html);
  const target = `https://admin.da.live/source/${ORG}/${REPO}${p}.html`;
  try {
    const out = execFileSync('curl', [
      '-sS', '-X', 'POST',
      '-F', `data=@${tmp};type=text/html`,
      target,
      '-o', '/dev/null', '-w', '%{http_code}',
    ], { encoding: 'utf8' });
    const ok = /^2\d\d$/.test(out.trim());
    console.log(`${ok ? '✓' : '✗'} ${p} -> ${out.trim()}`);
    return ok;
  } catch (e) {
    console.error(`✗ ${p} FAILED: ${e.message}`);
    return false;
  } finally {
    fs.unlinkSync(tmp);
  }
}

function main() {
  let files = walk(CONTENT_DIR);
  if (ONLY) files = files.filter((f) => contentPath(f).startsWith(ONLY));
  files.sort();
  console.log(`Uploading ${files.length} document(s) to ${ORG}/${REPO} (images -> ${LIVE})\n`);
  let ok = 0;
  for (const f of files) if (uploadOne(f)) ok += 1;
  console.log(`\nDone. ${ok}/${files.length} uploaded.`);
  if (ok !== files.length) process.exit(1);
}

main();
