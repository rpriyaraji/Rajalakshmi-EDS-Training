/* eslint-disable */
/* global WebImporter */
/**
 * Parser for the home "Recent Articles" rail.
 * Instead of emitting a static cards grid, it emits a dynamic `article-list`
 * block that reads the published magazine query-index at render time, so the
 * home rail stays in sync with the magazine section with no code/content edit.
 *
 * Source element: the same .image-list.list used by cards-articles, but here it
 * is replaced wholesale by a single config-driven block.
 *
 * Emitted block:
 *   | article-list |
 *   | limit: 4     |
 */
export default function parse(element, { document }) {
  const cells = [['limit: 4']];
  const block = WebImporter.Blocks.createBlock(document, { name: 'article-list', cells });
  element.replaceWith(block);
}
