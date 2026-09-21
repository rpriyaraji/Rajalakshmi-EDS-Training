// Generic CTA phrases that read as non-descriptive link text on their own.
const GENERIC_LINK_TEXT = /^(read more|full article|learn more|view|see more|more|read)$/i;

export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-featured-${cols.length}-cols`);

  // Give generic CTA links a descriptive accessible name from the nearest
  // heading, so "Read More" isn't ambiguous to screen readers or search
  // (a11y + seo:link-text). Visible text is left unchanged.
  block.querySelectorAll('a').forEach((a) => {
    if (a.hasAttribute('aria-label')) return;
    if (!GENERIC_LINK_TEXT.test(a.textContent.trim())) return;
    const heading = a.closest('div')?.querySelector('h1, h2, h3, h4, h5, h6');
    if (heading) a.setAttribute('aria-label', `${a.textContent.trim()}: ${heading.textContent.trim()}`);
  });

  // setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('columns-featured-img-col');
        }
      }
    });
  });
}
