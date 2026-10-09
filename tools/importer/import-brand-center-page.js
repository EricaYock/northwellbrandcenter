/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import carouselParser from './parsers/carousel.js';
import askBrandParser from './parsers/ask-brand.js';
import columnsParser from './parsers/columns.js';
import tilesParser from './parsers/tiles.js';
import soundListParser from './parsers/sound-list.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/brand-center-cleanup.js';
import sectionsTransformer from './transformers/brand-center-sections.js';

// PARSER REGISTRY
const parsers = {
  carousel: carouselParser,
  'ask-brand': askBrandParser,
  columns: columnsParser,
  tiles: tilesParser,
  'sound-list': soundListParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'brand-center-page',
  description: 'Northwell Health Brand Center pages built from the Brand Center Reimagination mockup',
  blocks: [
    { name: 'carousel', instances: ['.nw-carousel'] },
    { name: 'ask-brand', instances: ['form.nw-ask-brand'] },
    { name: 'columns', instances: ['.nw-columns'] },
    { name: 'tiles', instances: ['ul.nw-tiles'] },
    { name: 'sound-list', instances: ['ul.nw-sounds'] },
  ],
  sections: [
    { id: 'section-n', name: 'Mockup section', selector: ['section.nw-section'] },
    { id: 'section-n-plus-1', name: 'Mockup section (repeated)', selector: ['section.nw-section + section.nw-section'], style: 'divider' },
  ],
};

// TRANSFORMER REGISTRY (sections transformer runs in afterTransform)
const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

// Fragments (nav, footer) carry no page metadata
const FRAGMENTS = ['/nav', '/footer'];

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
  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;

    // 1. initial cleanup
    executeTransformers('beforeTransform', main, payload);

    // 2-3. find and parse blocks
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (!parser) return;
      try {
        parser(block.element, { document, url, params });
      } catch (e) {
        console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
      }
    });

    // 4. section breaks + section metadata
    executeTransformers('afterTransform', main, payload);

    // 5. path + metadata. Images stay root-relative (./images/…) so they resolve to the
    //    site's own images folder rather than the local mockup server.
    const rawPath = new URL(params.originalURL || url).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    if (!FRAGMENTS.includes(path)) {
      const hr = document.createElement('hr');
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
    }

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
