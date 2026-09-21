/* eslint-disable */
/* global WebImporter */
/**
 * Parser for the FAQ accordion. Each accordion item is a question (button
 * title) and an answer (hidden panel body). For a content page we flatten each
 * item into an <h3> question followed by its answer content, in order — so all
 * Q&A copy is preserved as readable default content.
 */
export default function parse(element, { document }) {
  const items = [...element.querySelectorAll('.cmp-accordion__item')];
  const frag = document.createDocumentFragment();

  items.forEach((item) => {
    const title = item.querySelector('.cmp-accordion__title');
    const panel = item.querySelector('.cmp-accordion__panel');

    if (title) {
      // h2 (not h3) so the outline is h1 (page title) -> h2 (questions) with
      // no skipped level (fixes the heading-order a11y audit).
      const h = document.createElement('h2');
      h.textContent = title.textContent.trim();
      frag.append(h);
    }
    if (panel) {
      // Prefer the innermost paragraphs; fall back to .cmp-text wrappers, then
      // to raw panel text. Using only one source avoids duplicating answers.
      let sources = [...panel.querySelectorAll('p')];
      if (!sources.length) sources = [...panel.querySelectorAll('.cmp-text')];
      if (sources.length) {
        sources.forEach((t) => {
          const p = document.createElement('p');
          p.innerHTML = t.innerHTML;
          if (p.textContent.trim()) frag.append(p);
        });
      } else {
        const p = document.createElement('p');
        p.textContent = panel.textContent.trim();
        if (p.textContent) frag.append(p);
      }
    }
  });

  if (!frag.childNodes.length) {
    element.remove();
    return;
  }
  element.replaceWith(frag);
}
