/* eslint-disable */
/* global WebImporter */
/**
 * Parser for the adventure description tabs (Overview / Itinerary / What to
 * Bring). The source hides the bulk of the trip copy inside a tabs component;
 * for a content page we flatten it to sequential default content: each tab
 * title becomes an <h2> and its panel body follows. This keeps all the copy
 * (which is ~40% of the page) instead of dropping it.
 */
export default function parse(element, { document }) {
  const tabList = element.querySelector('.cmp-tabs__tablist');
  const titles = tabList
    ? [...tabList.querySelectorAll('.cmp-tabs__tab')].map((t) => t.textContent.trim())
    : [];
  const panels = [...element.querySelectorAll('.cmp-tabs__tabpanel')];

  const frag = document.createDocumentFragment();
  panels.forEach((panel, i) => {
    const title = titles[i];
    if (title) {
      const h = document.createElement('h2');
      h.textContent = title;
      frag.append(h);
    }
    // Move the panel's meaningful children (headings, paragraphs, lists) out.
    [...panel.children].forEach((child) => {
      frag.append(child);
    });
  });

  if (!frag.childNodes.length) {
    element.remove();
    return;
  }
  element.replaceWith(frag);
}
