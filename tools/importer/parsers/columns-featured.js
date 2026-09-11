/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-featured. Base block: columns.
 * Source: https://wknd.site/us/en.html (.cmp-teaser--featured)
 * Structure (from library-description.txt): multiple columns; first row = block name.
 *   Second row lays out content side by side. Here the featured teaser is two
 *   columns: [textContent, image].
 * NOTE: The source element may contain sibling nested blocks (title, image-list);
 *   selectors are scoped to the teaser's own content/image so those are excluded.
 */
export default function parse(element, { document }) {
  // Scope strictly to the teaser's own content and image containers.
  const content = element.querySelector('.cmp-teaser__content');
  const imageContainer = element.querySelector('.cmp-teaser__image');
  const image = imageContainer ? imageContainer.querySelector('img') : element.querySelector('.cmp-teaser__image img');

  // Text column: pretitle, title, description, CTA(s).
  const pretitle = content ? content.querySelector('.cmp-teaser__pretitle') : null;
  const title = content ? content.querySelector('.cmp-teaser__title, h1, h2, h3') : null;
  const description = content ? content.querySelector('.cmp-teaser__description, p:not(.cmp-teaser__pretitle)') : null;
  const ctas = content
    ? Array.from(content.querySelectorAll('.cmp-teaser__action-link, .cmp-teaser__action-container a'))
    : [];

  const textCell = [];
  if (pretitle) textCell.push(pretitle);
  if (title) textCell.push(title);
  if (description) textCell.push(description);
  textCell.push(...ctas);

  // Empty-block guard.
  if (!textCell.length && !image) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  cells.push([textCell, image || '']);

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-featured', cells });
  element.replaceWith(block);
}
