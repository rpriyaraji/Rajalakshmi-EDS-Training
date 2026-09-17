/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: WKND site-wide cleanup.
 * Removes non-authorable site chrome (header, footer, nav, search, mobile nav,
 * tracking iframe) and leftover empty <meta> tags left inside cmp-image blocks.
 *
 * All selectors verified against migration-work/cleaned.html:
 *   - header.experiencefragment (line 5): language nav, main nav, search, sign-in
 *   - footer.experiencefragment (line 471)
 *   - iframe#destination_publishing_iframe... Adobe ID syncing (line 566)
 *   - #toggleNav (line 568), #mobileNav (line 574): mobile nav chrome
 *   - <meta> tags nested in cmp-image (lines 183, 204, 227, 271, 334, 378)
 *
 * NOTE: bare <hr> is intentionally NOT removed — the section transformer inserts
 * <hr> section breaks, and cmp-separator__horizontal-rule elements exist in DOM.
 * Class names are preserved because section selectors and parsers depend on them.
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Non-authorable chrome removed before parsing so it can't interfere with
    // block matching. Selectors from captured DOM.
    WebImporter.DOMUtils.remove(element, [
      'header.experiencefragment', // site header: language nav, main nav, search, sign-in
      'footer.experiencefragment', // site footer
      '#toggleNav', // mobile nav toggle
      '#mobileNav', // mobile nav drawer
      'iframe', // Adobe ID syncing iframe (#destination_publishing_iframe...)
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // Leftover empty <meta> tags nested inside cmp-image markup.
    WebImporter.DOMUtils.remove(element, [
      'meta',
      'noscript',
    ]);

    // Normalize internal links: EDS serves extensionless paths, so a
    // root-relative /us/en/foo.html link 404s. Strip the .html from same-site
    // links (leave anchors, external URLs, and asset links untouched).
    element.querySelectorAll('a[href]').forEach((a) => {
      const href = a.getAttribute('href');
      if (!href) return;
      if (/^\/[^/].*\.html(#.*)?$/.test(href) || /^\/us\/en.*\.html(#.*)?$/.test(href)) {
        a.setAttribute('href', href.replace(/\.html(?=(#|$))/, ''));
      }
    });
  }
}
