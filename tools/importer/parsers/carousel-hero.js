/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-hero. Base block: carousel.
 * Source: https://wknd.site/us/en.html (.cmp-carousel--hero)
 * Structure (from library-description.txt): 2 columns, multiple rows.
 *   Row 1: block name. Each subsequent row = one slide: [image, textContent].
 *   textContent cell may hold title (heading), description, and CTA.
 */
export default function parse(element, { document }) {
  // Each slide is a hero teaser inside a carousel item.
  let slides = Array.from(element.querySelectorAll('.cmp-teaser--hero'));
  // Fallback: use carousel items directly if the teaser class isn't present.
  if (!slides.length) {
    slides = Array.from(element.querySelectorAll('.cmp-carousel__item'));
  }

  const cells = [];

  slides.forEach((slide) => {
    // Image cell (mandatory per description).
    const image = slide.querySelector('.cmp-teaser__image img, img');

    // Text content cell (optional): title, description, CTA(s).
    const title = slide.querySelector('.cmp-teaser__title, h1, h2, h3');
    const description = slide.querySelector('.cmp-teaser__description, p');
    const ctas = Array.from(
      slide.querySelectorAll('.cmp-teaser__action-link, .cmp-teaser__action-container a'),
    );

    const contentCell = [];
    if (title) contentCell.push(title);
    if (description) contentCell.push(description);
    contentCell.push(...ctas);

    // Only add a slide row if it has at least an image or content.
    if (image || contentCell.length) {
      cells.push([image || '', contentCell]);
    }
  });

  // Empty-block guard: nothing extracted.
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-hero', cells });
  element.replaceWith(block);
}
