/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import articleListRecentParser from './parsers/article-list-recent.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/wknd-cleanup.js';
import sectionsTransformer from './transformers/wknd-sections.js';

// PARSER REGISTRY
const parsers = {
  'article-list': articleListRecentParser,
};

// PAGE TEMPLATE CONFIGURATION
const PAGE_TEMPLATE = {
  name: 'adventures-listing',
  description: 'Adventures listing: title, intro teaser, and a grid of adventure cards.',
  urls: [
    'https://wknd.site/us/en/adventures.html',
  ],
  blocks: [
    { name: 'article-list', instances: ['.image-list.list'] },
  ],
  sections: [
    { id: 'l1', name: 'Title', selector: ['.cmp-title', 'main .title'], style: null, blocks: [], defaultContent: ['h1', '.cmp-title__text'] },
    { id: 'l2', name: 'Adventure Cards', selector: ['.image-list.list'], style: null, blocks: ['article-list'], defaultContent: [] },
  ],
};

// TRANSFORMER REGISTRY
const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      document.querySelectorAll(selector).forEach((element) => {
        pageBlocks.push({ name: blockDef.name, selector, element });
      });
    });
  });
  // The source renders one grid per category tab (All + per-category). We only
  // need one dynamic list: keep the FIRST as an index-driven article-list
  // (adventures index, no limit -> all trips) and drop the rest so publishing
  // an adventure updates this listing with no code change (G1).
  const rails = pageBlocks.filter((b) => b.name === 'article-list');
  rails.forEach((rail, i) => {
    if (i === 0) {
      rail.listPath = '/us/en/adventures/';
    } else {
      // remove the duplicate category grids from the DOM
      if (rail.element.parentNode) rail.element.remove();
      rail.skip = true;
    }
  });
  return pageBlocks.filter((b) => !b.skip);
}

export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;

    executeTransformers('beforeTransform', main, payload);

    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, {
            document, url, params, listPath: block.listPath, listLimit: block.listLimit,
          });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      }
    });

    executeTransformers('afterTransform', main, payload);

    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
