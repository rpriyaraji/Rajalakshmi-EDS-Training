/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-articles. Base block: cards.
 * Source: https://wknd.site/us/en.html (.image-list.list)
 * Structure (from library-description.txt): 2 columns, multiple rows.
 *   Row 1: block name. Each subsequent row = one card: [image, textContent].
 *   textContent cell may hold title (heading, as a link), description, CTA.
 */
export default function parse(element, { document }) {
  const items = Array.from(element.querySelectorAll('.cmp-image-list__item'));

  const cells = [];

  items.forEach((item) => {
    // Image cell (mandatory).
    const image = item.querySelector('.cmp-image-list__item-image img, img');

    // Title: prefer the title link so the card heading is clickable.
    const titleLink = item.querySelector('.cmp-image-list__item-title-link');
    const titleSpan = item.querySelector('.cmp-image-list__item-title');
    const description = item.querySelector('.cmp-image-list__item-description');

    const contentCell = [];
    if (titleLink) {
      // Keep the link but ensure it carries the visible title text.
      contentCell.push(titleLink);
    } else if (titleSpan) {
      contentCell.push(titleSpan);
    }
    if (description) contentCell.push(description);

    if (image || contentCell.length) {
      cells.push([image || '', contentCell]);
    }
  });

  // Empty-block guard.
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-articles', cells });
  element.replaceWith(block);
}
