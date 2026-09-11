/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-secure. Base block: cards.
 * Source: https://wknd.site/us/en/magazine.html (.cmp-teaser--secure)
 *
 * Follows the EDS "Cards" convention: table has 2 columns, multiple rows,
 * first row is the block name. Each subsequent row is one card:
 *   cell 1 = Image (mandatory), cell 2 = text content (Title heading + Description).
 *
 * Each matched element is ONE members-only teaser, so this produces a
 * single-card cards-secure block; sibling instances lay out as a grid via CSS.
 */
export default function parse(element, { document }) {
  const image = element.querySelector('.cmp-teaser__image img, img');
  const title = element.querySelector('.cmp-teaser__title, h2, h3');
  const description = element.querySelector('.cmp-teaser__description, p');

  const contentCell = [];
  if (title) contentCell.push(title);
  if (description) contentCell.push(description);

  // Empty-block guard.
  if (!image && !contentCell.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [[image || '', contentCell]];
  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-secure', cells });
  element.replaceWith(block);
}
