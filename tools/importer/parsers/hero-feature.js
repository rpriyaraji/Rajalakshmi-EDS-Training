/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-feature. Base block: hero.
 * Source: https://wknd.site/us/en.html (.cmp-teaser--imagebottom)
 * Structure (from library-description.txt): 1 column, 3 rows.
 *   Row 1: block name. Row 2: background image (optional).
 *   Row 3: title (heading), subheading, CTA (optional).
 * NOTE: The source element may contain a sibling nested container (title +
 *   image-list); selectors are scoped to the teaser's own content/image so
 *   that nested content is excluded.
 */
export default function parse(element, { document }) {
  const content = element.querySelector('.cmp-teaser__content');
  const imageContainer = element.querySelector('.cmp-teaser__image');
  const image = imageContainer
    ? imageContainer.querySelector('img')
    : element.querySelector('.cmp-teaser__image img');

  // Text content: title, description, CTA(s).
  const title = content ? content.querySelector('.cmp-teaser__title, h1, h2, h3') : null;
  const description = content ? content.querySelector('.cmp-teaser__description, p') : null;
  const ctas = content
    ? Array.from(content.querySelectorAll('.cmp-teaser__action-link, .cmp-teaser__action-container a'))
    : [];

  const contentCell = [];
  if (title) contentCell.push(title);
  if (description) contentCell.push(description);
  contentCell.push(...ctas);

  // Empty-block guard.
  if (!image && !contentCell.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // 1-column block: each row is a single cell.
  const cells = [];
  if (image) cells.push([image]);          // Row 2: background image
  cells.push([contentCell]);               // Row 3: title/subheading/CTA

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-feature', cells });
  element.replaceWith(block);
}
