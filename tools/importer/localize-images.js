/* eslint-disable */
/*
 * localize-images.js — download externally-referenced images into the project
 * and rewrite content src="" references to local, served paths.
 *
 * Repeatable post-import step: scans content/**.plain.html, downloads each
 * remote image once (deduped by URL) into media/, and rewrites the references.
 *
 * Usage: node tools/importer/localize-images.js [--host https://wknd.site]
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = process.cwd();
const CONTENT_DIR = path.join(ROOT, 'content');
const MEDIA_DIR = path.join(ROOT, 'media');
const HOST_FILTER = (() => {
  const i = process.argv.indexOf('--host');
  return i !== -1 ? process.argv[i + 1] : 'https://wknd.site';
})();

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, out);
    else if (entry.name.endsWith('.plain.html')) out.push(p);
  }
  return out;
}

function extractExt(url) {
  const m = url.split('?')[0].match(/\.(jpe?g|png|gif|webp|svg|avif)$/i);
  return m ? `.${m[1].toLowerCase().replace('jpeg', 'jpg')}` : '.jpg';
}

// Stable local filename: slug of last meaningful segment + short hash of full URL.
function localName(url) {
  const clean = url.split('?')[0];
  const segs = clean.split('/').filter(Boolean);
  const base = (segs[segs.length - 1] || 'image').replace(/\.[a-z0-9]+$/i, '');
  const slug = base.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'image';
  const hash = crypto.createHash('sha1').update(url).digest('hex').slice(0, 8);
  return `${slug}-${hash}${extractExt(url)}`;
}

async function download(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(dest, buf);
  return buf.length;
}

async function main() {
  const files = walk(CONTENT_DIR);
  const urlRe = new RegExp(`(src|srcset)="(${HOST_FILTER.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^"\\s]+)"`, 'g');

  // Collect unique URLs across all files.
  const urls = new Set();
  for (const f of files) {
    const html = fs.readFileSync(f, 'utf8');
    let m;
    // eslint-disable-next-line no-cond-assign
    while ((m = urlRe.exec(html)) !== null) urls.add(m[2]);
  }

  if (!urls.size) {
    console.log(`No ${HOST_FILTER} image URLs found in content/.`);
    return;
  }

  fs.mkdirSync(MEDIA_DIR, { recursive: true });
  const map = new Map(); // remote URL -> /media/local-name
  let downloaded = 0;
  let reused = 0;

  for (const url of urls) {
    const name = localName(url);
    const dest = path.join(MEDIA_DIR, name);
    const localPath = `/media/${name}`;
    map.set(url, localPath);
    if (fs.existsSync(dest)) {
      reused += 1;
      continue;
    }
    try {
      const bytes = await download(url, dest);
      downloaded += 1;
      console.log(`  ✓ ${name} (${bytes} bytes)`);
    } catch (e) {
      console.error(`  ✗ FAILED ${url}: ${e.message}`);
      map.delete(url); // leave the original reference untouched on failure
    }
  }

  // Rewrite references in every content file.
  let rewrites = 0;
  for (const f of files) {
    let html = fs.readFileSync(f, 'utf8');
    let changed = false;
    for (const [url, local] of map) {
      if (html.includes(url)) {
        html = html.split(url).join(local);
        changed = true;
        rewrites += 1;
      }
    }
    if (changed) fs.writeFileSync(f, html);
  }

  console.log(`\nLocalized: ${downloaded} downloaded, ${reused} reused, ${map.size} mapped, ${rewrites} reference(s) rewritten across ${files.length} file(s).`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
