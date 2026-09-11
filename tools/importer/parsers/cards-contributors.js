/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: cards-contributors
 * Base block: cards
 * Source: WKND experience-fragment contributor card (.cmp-experience-fragment--contributor)
 * Generated: 2026-09-11
 *
 * Structure (per library-description.txt — "Cards", 2 columns):
 *   - Row 1: block name (handled by createBlock)
 *   - Each card row: [ image cell, text cell ]
 *       cell 1 = portrait image (mandatory)
 *       cell 2 = name (h3) + role (h5) + social icon links (Facebook/Twitter/Instagram)
 *
 * The instances[] selector matches ONE contributor card section per element,
 * so this parser emits a single card row for the element it receives.
 */
export default function parse(element, { document }) {
  // --- INPUT EXTRACTION (selectors validated against source.html) ---

  // Portrait image (mandatory). Prefer the core-component image class, fall back to any img.
  const image = element.querySelector('.cmp-image__image, .image img, img');

  // Name — first title, rendered as an <h3>.
  const name = element.querySelector('h3.cmp-title__text, h3');

  // Role/tagline — second title (cmp-title--black), rendered as an <h5>.
  const role = element.querySelector('h5.cmp-title__text, h5');

  // Social icon links (Facebook / Twitter / Instagram) — anchors in the button list.
  const socialLinks = Array.from(
    element.querySelectorAll('.cmp-buildingblock--btn-list a.cmp-button, .cmp-button a, a.cmp-button'),
  );

  // Empty-block guard: bail gracefully if the card has no meaningful content.
  if (!image && !name && !role && socialLinks.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // --- BUILD TEXT CELL (cell 2) ---
  const textCell = [];
  if (name) textCell.push(name);
  if (role) textCell.push(role);
  socialLinks.forEach((link) => {
    // Normalize the link label to its visible text so icon-only markup renders sensibly.
    const label = (link.querySelector('.cmp-button__text')?.textContent || link.textContent || '').trim();
    if (label) link.textContent = label;
    textCell.push(link);
  });

  // --- BUILD CELLS (2-column "Cards" structure) ---
  const cells = [];
  cells.push([image || '', textCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-contributors', cells });
  element.replaceWith(block);
}
