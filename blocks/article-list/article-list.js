import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Dynamic article-list block.
 * Reads a query-index JSON (published by the indexer) and renders article
 * cards. Content-driven: new articles appear on publish with no code change.
 *
 * Authoring:
 *   | article-list                    |
 *   | /us/en/magazine/query-index.json |   (optional; default shown)
 *   | limit: 4                         |   (optional)
 */

const DEFAULT_INDEX = '/us/en/magazine/query-index.json';

function readConfig(block) {
  const cfg = { index: DEFAULT_INDEX, limit: 0 };
  [...block.children].forEach((row) => {
    const text = row.textContent.trim();
    if (!text) return;
    const link = row.querySelector('a');
    if (link && link.href.includes('query-index')) {
      cfg.index = new URL(link.href).pathname;
    } else if (/\.json$/i.test(text)) {
      cfg.index = text.replace(/^https?:\/\/[^/]+/, '');
    } else if (/^limit:/i.test(text)) {
      cfg.limit = parseInt(text.split(':')[1], 10) || 0;
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

export default async function decorate(block) {
  const { index, limit } = readConfig(block);
  let articles = await fetchIndex(index);
  // newest first when a date is present
  articles.sort((a, b) => Number(b.lastModified || 0) - Number(a.lastModified || 0));
  if (limit > 0) articles = articles.slice(0, limit);

  const ul = document.createElement('ul');
  articles.forEach((article) => {
    const li = document.createElement('li');

    if (article.image) {
      const imageWrap = document.createElement('div');
      imageWrap.className = 'article-list-card-image';
      const pic = createOptimizedPicture(article.image, article.title || '', false, [{ width: '750' }]);
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
