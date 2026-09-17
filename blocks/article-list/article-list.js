import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Dynamic article-list block.
 * Reads a query-index JSON (published by the indexer) and renders article
 * cards. Content-driven: new articles appear on publish with no code change.
 *
 * Works with either index setup — a magazine-scoped index
 * (/us/en/magazine/query-index.json) or the site-wide default
 * (/query-index.json). It tries candidates in order and filters results to
 * magazine article paths, so no config change is needed on either choice.
 *
 * Authoring:
 *   | article-list       |
 *   | /custom/index.json |   (optional; overrides the candidates below)
 *   | limit: 4           |   (optional)
 *   | path: /us/en/magazine/ |  (optional; article path prefix to filter on)
 */

// Tried in order; first one that returns rows wins.
const DEFAULT_INDEXES = ['/us/en/magazine/query-index.json', '/query-index.json'];
const DEFAULT_PATH_PREFIX = '/us/en/magazine/';

function readConfig(block) {
  const cfg = { index: null, limit: 0, pathPrefix: DEFAULT_PATH_PREFIX };
  [...block.children].forEach((row) => {
    const text = row.textContent.trim();
    if (!text) return;
    const link = row.querySelector('a');
    if (link && /\.json/i.test(link.href)) {
      cfg.index = new URL(link.href).pathname;
    } else if (/^limit:/i.test(text)) {
      cfg.limit = parseInt(text.split(':')[1], 10) || 0;
    } else if (/^path:/i.test(text)) {
      cfg.pathPrefix = text.split(':')[1].trim();
    } else if (/\.json$/i.test(text)) {
      cfg.index = text.replace(/^https?:\/\/[^/]+/, '');
    }
  });
  return cfg;
}

async function fetchIndex(path) {
  try {
    const resp = await fetch(path);
    if (!resp.ok) return [];
    const json = await resp.json();
    return Array.isArray(json.data) ? json.data : [];
  } catch (e) {
    return [];
  }
}

// Try the authored index, else each default candidate, until one has rows.
async function loadArticles(configuredIndex) {
  const candidates = configuredIndex ? [configuredIndex] : DEFAULT_INDEXES;
  // eslint-disable-next-line no-restricted-syntax
  for (const candidate of candidates) {
    // eslint-disable-next-line no-await-in-loop
    const rows = await fetchIndex(candidate);
    if (rows.length) return rows;
  }
  return [];
}

function articleTime(a) {
  return Number(a.lastModified || 0) || Date.parse(a.date || a.publisheddate || '') || 0;
}

// A usable image is a real path — not empty, not the "about:error" placeholder
// DA writes for an image that failed to ingest, and not a data URI.
function usableImage(src) {
  if (!src || typeof src !== 'string') return '';
  const s = src.trim();
  if (!s || s.startsWith('about:') || s.startsWith('data:')) return '';
  return s;
}

export default async function decorate(block) {
  const { index, limit, pathPrefix } = readConfig(block);
  let articles = await loadArticles(index);

  // Keep only magazine article pages (drop the listing page and anything else).
  articles = articles.filter((a) => a.path
    && a.path.startsWith(pathPrefix)
    && a.path !== pathPrefix.replace(/\/$/, '')
    && !a.path.endsWith('/magazine'));

  // newest first
  articles.sort((a, b) => articleTime(b) - articleTime(a));
  if (limit > 0) articles = articles.slice(0, limit);

  const ul = document.createElement('ul');
  articles.forEach((article) => {
    const li = document.createElement('li');

    const imageSrc = usableImage(article.image);
    if (imageSrc) {
      const imageWrap = document.createElement('div');
      imageWrap.className = 'article-list-card-image';
      const pic = createOptimizedPicture(imageSrc, article.title || '', false, [{ width: '750' }]);
      const link = document.createElement('a');
      link.href = article.path;
      link.append(pic);
      imageWrap.append(link);
      li.append(imageWrap);
    }

    const body = document.createElement('div');
    body.className = 'article-list-card-body';
    if (article.title) {
      const h = document.createElement('h3');
      const a = document.createElement('a');
      a.href = article.path;
      a.textContent = article.title;
      h.append(a);
      body.append(h);
    }
    if (article.description) {
      const p = document.createElement('p');
      p.textContent = article.description;
      body.append(p);
    }
    li.append(body);
    ul.append(li);
  });

  block.textContent = '';
  block.append(ul);
}
