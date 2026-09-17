// media query match that indicates desktop width
const isDesktop = window.matchMedia('(min-width: 900px)');

/**
 * Fetch the nav fragment. Metadata-independent dual-fetch: root first
 * (DA/EDS production + proxying dev server), then /content as a fallback —
 * so production never wastes a failed request before the header appears.
 */
async function fetchNav() {
  let resp = await fetch('/nav.plain.html');
  if (!resp.ok) resp = await fetch('/content/nav.plain.html');
  if (!resp.ok) return null;
  const html = await resp.text();
  const container = document.createElement('div');
  container.innerHTML = html;
  return container;
}

/**
 * Build the search form from the ":search:" marker. Form controls are created
 * in JS (never embedded in the plain fragment).
 */
function buildSearch(toolsSection) {
  const marker = [...toolsSection.querySelectorAll('p')]
    .find((p) => p.textContent.trim() === ':search:');
  if (!marker) return;
  const form = document.createElement('form');
  form.className = 'nav-search';
  form.setAttribute('role', 'search');
  form.action = '/us/en/search.html';
  form.innerHTML = `
    <label class="nav-search-label" for="nav-search-input">Search</label>
    <input id="nav-search-input" name="q" type="search" placeholder="Search" autocomplete="off">
    <button type="submit" aria-label="Search"></button>`;
  marker.replaceWith(form);
}

function toggleMenu(nav, expanded) {
  nav.setAttribute('aria-expanded', expanded ? 'true' : 'false');
  const button = nav.querySelector('.nav-hamburger button');
  if (button) button.setAttribute('aria-label', expanded ? 'Close navigation' : 'Open navigation');
  document.body.style.overflowY = expanded && !isDesktop.matches ? 'hidden' : '';
}

/**
 * loads and decorates the header nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const fragment = await fetchNav();
  block.textContent = '';
  if (!fragment) return;

  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  // The fragment stores images with relative paths (validator requirement).
  // Once injected into a deep page URL they must resolve from the content root,
  // so rewrite relative image srcs to root-absolute /content/... paths.
  nav.querySelectorAll('img[src^="images/"]').forEach((img) => {
    const rel = img.getAttribute('src');
    img.src = `/content/${rel}`;
  });

  // Map the 3 fragment sections: brand (logo + utility), sections (nav links), tools (search).
  const classes = ['brand', 'sections', 'tools'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  // Build the search form in the tools section.
  const navTools = nav.querySelector('.nav-tools');
  if (navTools) buildSearch(navTools);

  // Hamburger toggle for mobile.
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => {
    const expanded = nav.getAttribute('aria-expanded') === 'true';
    toggleMenu(nav, !expanded);
  });
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');

  // Close the mobile menu and reset when resizing up to desktop.
  isDesktop.addEventListener('change', () => {
    if (isDesktop.matches) toggleMenu(nav, false);
  });

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
