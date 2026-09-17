/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import adventureFactsParser from './parsers/adventure-facts.js';
import adventureTabsParser from './parsers/adventure-tabs.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/wknd-cleanup.js';
import sectionsTransformer from './transformers/wknd-sections.js';

// PARSER REGISTRY
const parsers = {
  'adventure-facts': adventureFactsParser,
  'adventure-tabs': adventureTabsParser,
};

// PAGE TEMPLATE CONFIGURATION
const PAGE_TEMPLATE = {
  name: 'adventure',
  description: 'Adventure/trip detail page: hero image, title, trip-facts content fragment, and description. Mostly default content plus a facts table.',
  urls: [
    'https://wknd.site/us/en/adventures/bali-surf-camp.html',
  ],
  blocks: [
    { name: 'adventure-facts', instances: ['.cmp-contentfragment'] },
    { name: 'adventure-tabs', instances: ['.cmp-tabs'] },
  ],
  sections: [
    { id: 'a1', name: 'Hero Image', selector: ['.cmp-carousel', '.cmp-image', 'main .image'], style: null, blocks: [], defaultContent: ['.cmp-image'] },
    { id: 'a2', name: 'Title', selector: ['.cmp-title', 'main .title'], style: null, blocks: [], defaultContent: ['h1', '.cmp-title__text'] },
    { id: 'a3', name: 'Trip Facts', selector: ['.cmp-contentfragment', 'main .contentfragment'], style: null, blocks: ['adventure-facts'], defaultContent: [] },
    { id: 'a4', name: 'Description', selector: ['.cmp-tabs', 'main .tabs'], style: null, blocks: ['adventure-tabs'], defaultContent: ['h2', 'p', 'ul', 'ol'] },
  ],
};

// TRANSFORMER REGISTRY - cleanup first, then section breaks/metadata (2+ sections present)
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
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;

    // 1. beforeTransform (initial cleanup — strips header/nav/footer chrome)
    executeTransformers('beforeTransform', main, payload);

    // 2. Discover + parse blocks (trip-facts content fragment)
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      }
    });

    // 3. afterTransform (final cleanup + section breaks/metadata)
    executeTransformers('afterTransform', main, payload);

    // 4. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 5. Sanitized path
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
