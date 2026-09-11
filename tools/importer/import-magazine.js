/* eslint-disable */
/* global WebImporter */

// No block parsers — this article template is entirely default content.

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/wknd-cleanup.js';
import sectionsTransformer from './transformers/wknd-sections.js';

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'magazine',
  description: 'Long-form magazine article page: lead image, article body, author bio, and related-articles sidebar. All default content, no blocks.',
  urls: [
    'https://wknd.site/us/en/magazine/western-australia.html',
  ],
  blocks: [],
  sections: [
    { id: 'm1', name: 'Lead Image', selector: ['.cmp-image', 'main .image'], style: null, blocks: [], defaultContent: ['.cmp-image'] },
    { id: 'm2', name: 'Article Body', selector: ['.cmp-text', 'main .text'], style: null, blocks: [], defaultContent: ['h1', 'h2', 'h4', '.cmp-text', 'blockquote'] },
    { id: 'm3', name: 'Author Bio', selector: ['.cmp-experiencefragment', 'main .experiencefragment'], style: null, blocks: [], defaultContent: ['.cmp-title__text', '.cmp-image', '.cmp-button'] },
    { id: 'm4', name: 'Related Articles', selector: ['.cmp-list', 'main .list'], style: null, blocks: [], defaultContent: ['.cmp-list'] },
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

export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;

    // 1. beforeTransform (initial cleanup — strips header/nav/footer chrome)
    executeTransformers('beforeTransform', main, payload);

    // 2. No block parsing — content is all default content.

    // 3. afterTransform (final cleanup + section breaks/metadata)
    executeTransformers('afterTransform', main, payload);

    // 4. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 5. Sanitized path — map the root URL to /index
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
        blocks: [],
      },
    }];
  },
};
