/* eslint-disable */
/* global WebImporter */
/**
 * Parser that emits a dynamic, index-driven `article-list` block in place of a
 * static card grid. Used for both the home rails and the section listing pages
 * so publishing an article/adventure updates every surface from one publish.
 *
 * Options (via the parse payload):
 *   - listPath:  section prefix the list reads (default /us/en/magazine/).
 *                Non-magazine prefixes are emitted as a `path:` config row.
 *   - listLimit: max entries. 0 / undefined => no limit (show all) — used for
 *                the listing pages; the home rails pass 4.
 *
 * Emitted block (adventures listing example):
 *   | article-list             |
 *   | path: /us/en/adventures/ |
 */
export default function parse(element, { document, listPath, listLimit }) {
  const cells = [];
  if (listPath && listPath !== '/us/en/magazine/') {
    cells.push([`path: ${listPath}`]);
  }
  if (listLimit && listLimit > 0) {
    cells.push([`limit: ${listLimit}`]);
  }
  // article-list needs at least one config row to createBlock cleanly; when a
  // listing wants everything with the default magazine path, emit a harmless
  // path row so the table is well-formed.
  if (!cells.length) {
    cells.push([`path: ${listPath || '/us/en/magazine/'}`]);
  }
  const block = WebImporter.Blocks.createBlock(document, { name: 'article-list', cells });
  element.replaceWith(block);
}
