/* eslint-disable */
/* global WebImporter */
/**
 * Parser for the home page listing rails.
 * Instead of emitting a static cards grid, it emits a dynamic `article-list`
 * block that reads the published query-index at render time, so a home rail
 * stays in sync with its section with no code/content edit.
 *
 * `listPath` selects which section the rail reflects:
 *   - /us/en/magazine/   -> "Recent Articles" (default; magazine index)
 *   - /us/en/adventures/ -> "Where do you want to go?" (adventures index)
 *
 * Emitted block (adventures example):
 *   | article-list          |
 *   | path: /us/en/adventures/ |
 *   | limit: 4              |
 */
export default function parse(element, { document, listPath }) {
  const cells = [];
  if (listPath && listPath !== '/us/en/magazine/') {
    cells.push([`path: ${listPath}`]);
  }
  cells.push(['limit: 4']);
  const block = WebImporter.Blocks.createBlock(document, { name: 'article-list', cells });
  element.replaceWith(block);
}
