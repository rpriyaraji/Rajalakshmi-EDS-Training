/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import carouselHeroParser from './parsers/carousel-hero.js';
import columnsFeaturedParser from './parsers/columns-featured.js';
import cardsArticlesParser from './parsers/cards-articles.js';
import heroFeatureParser from './parsers/hero-feature.js';
import articleListRecentParser from './parsers/article-list-recent.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/wknd-cleanup.js';
import sectionsTransformer from './transformers/wknd-sections.js';

// PARSER REGISTRY
const parsers = {
  'carousel-hero': carouselHeroParser,
  'columns-featured': columnsFeaturedParser,
  'cards-articles': cardsArticlesParser,
  'hero-feature': heroFeatureParser,
  'article-list': articleListRecentParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'home',
  description: 'WKND home page: hero carousel, featured article, article/adventure card grids, and a feature hero banner.',
  urls: [
    'https://wknd.site/us/en.html',
  ],
  blocks: [
    { name: 'carousel-hero', instances: ['.cmp-carousel--hero'] },
    { name: 'columns-featured', instances: ['.cmp-teaser--featured'] },
    { name: 'cards-articles', instances: ['.image-list.list'] },
    { name: 'hero-feature', instances: ['.cmp-teaser--imagebottom'] },
  ],
  sections: [
    {
      id: 's1', name: 'Hero Carousel',
      selector: ['.carousel.cmp-carousel--hero', '.cmp-carousel--hero'],
      style: null, blocks: ['carousel-hero'], defaultContent: [],
    },
    {
      id: 's2', name: 'Featured Article',
      selector: ['.teaser.cmp-teaser--featured', '.cmp-teaser--featured'],
      style: null, blocks: ['columns-featured'], defaultContent: [],
    },
    {
      id: 's3', name: 'Recent Articles',
      selector: ['.image-list.list'],
      style: null, blocks: ['cards-articles'],
      defaultContent: ['.cmp-title--underline', '.cmp-button--primary'],
    },
    {
      id: 's4', name: 'Next Adventures / Climbing New Zealand',
      selector: ['.teaser.cmp-teaser--imagebottom', '.cmp-teaser--imagebottom'],
      style: null, blocks: ['hero-feature'], defaultContent: ['.cmp-title--underline'],
    },
    {
      id: 's5', name: 'Where do you want to go?',
      selector: ['.image-list.list'],
      style: null, blocks: ['cards-articles'],
      defaultContent: ['.cmp-title', '.cmp-button--primary'],
    },
  ],
};

// TRANSFORMER REGISTRY - cleanup first, then section breaks/metadata (2+ sections present)
const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook.
 */
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

/**
 * Find all block instances on the page based on the embedded template.
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });
  // The home page has two identical `.image-list.list` rails. The FIRST one
  // ("Recent Articles" -> magazine) becomes a dynamic, index-driven
  // `article-list`; the second ("Where do you want to go?" -> adventures)
  // stays a static `cards-articles` grid.
  const cardRails = pageBlocks.filter((b) => b.name === 'cards-articles');
  if (cardRails.length > 0) {
    cardRails[0].name = 'article-list';
  }

  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;

    // 1. beforeTransform (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 2. Discover blocks
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block (skip elements already replaced by a prior parser)
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. afterTransform (final cleanup + section breaks/metadata)
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Sanitized path — map the root URL to /index
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
