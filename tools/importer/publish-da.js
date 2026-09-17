/* eslint-disable */
/*
 * publish-da.js — preview + publish migrated pages via admin.hlx.page.
 * Auth is injected by the host; no token needed.
 *
 * For each path it POSTs to the preview endpoint (which also triggers
 * indexing) and then the live endpoint.
 *
 * Usage:
 *   node tools/importer/publish-da.js [--only /us/en/adventures]
 *     [--org rpriyaraji] [--repo rajalakshmi-eds-training] [--branch main]
 *     [--preview-only]
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
function flag(name) {
  return process.argv.includes(name);
}

const ORG = arg('--org', 'rpriyaraji');
const REPO = arg('--repo', 'rajalakshmi-eds-training');
const BRANCH = arg('--branch', 'main');
const ONLY = arg('--only', '');
const PREVIEW_ONLY = flag('--preview-only');

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, out);
    else if (entry.name.endsWith('.plain.html')) out.push(p);
  }
  return out;
}
function contentPath(file) {
  const rel = path.relative(CONTENT_DIR, file).replace(/\.plain\.html$/, '');
  return `/${rel}`;
}

function hit(kind, p) {
  const url = `https://admin.hlx.page/${kind}/${ORG}/${REPO}/${BRANCH}${p}`;
  try {
    const out = execFileSync('curl', ['-sS', '-X', 'POST', url, '-o', '/dev/null', '-w', '%{http_code}'], { encoding: 'utf8' });
    return out.trim();
  } catch (e) {
    return `ERR:${e.message}`;
  }
}

function main() {
  let files = walk(CONTENT_DIR);
  if (ONLY) files = files.filter((f) => contentPath(f).startsWith(ONLY));
  files.sort();
  console.log(`Publishing ${files.length} path(s) on ${ORG}/${REPO}/${BRANCH}${PREVIEW_ONLY ? ' (preview only)' : ''}\n`);
  let ok = 0;
  for (const f of files) {
    const p = contentPath(f);
    const prev = hit('preview', p);
    const live = PREVIEW_ONLY ? '-' : hit('live', p);
    const good = /^2\d\d$/.test(prev) && (PREVIEW_ONLY || /^2\d\d$/.test(live));
    if (good) ok += 1;
    console.log(`${good ? '✓' : '✗'} ${p}  preview=${prev} live=${live}`);
  }
  console.log(`\nDone. ${ok}/${files.length} published.`);
  if (ok !== files.length) process.exit(1);
}

main();
