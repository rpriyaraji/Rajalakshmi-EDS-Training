/* eslint-disable */
/* global WebImporter */
/**
 * Parser for the adventure trip-facts content fragment.
 * Source: .cmp-contentfragment on wknd.site adventure pages. Each fact is a
 * title/value pair (Activity, Adventure Type, Trip Length, Group Size,
 * Difficulty, Price). Emits a simple two-column `columns` table so the facts
 * render as a clean spec list rather than a raw run of text.
 *
 * Emitted block:
 *   | columns (facts) |
 *   | Activity | Surfing |
 *   | ...      | ...     |
 */
export default function parse(element, { document }) {
  const rows = [];
  element.querySelectorAll('.cmp-contentfragment__element').forEach((el) => {
    const title = el.querySelector('.cmp-contentfragment__element-title');
    const value = el.querySelector('.cmp-contentfragment__element-value');
    const t = title && title.textContent.trim();
    let v = value && value.textContent.trim();
    if (!t || !v) return;
    // Price comes through as "5000.0" — tidy it to a currency string.
    if (/^price$/i.test(t) && /^\d+(\.\d+)?$/.test(v)) {
      v = `$${Math.round(parseFloat(v)).toLocaleString('en-US')}`;
    }
    rows.push([t, v]);
  });

  // No fact pairs -> this is a prose content fragment (e.g. an itinerary panel),
  // not the trip-facts spec list. Leave its content in place (unwrap the
  // wrapper) so the tabs parser can flatten it; never delete it.
  if (!rows.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'columns (facts)',
    cells: rows,
  });
  element.replaceWith(block);
}
