/**
 * social-links — a row of social media icon links.
 * Content-driven: each row is one link (label + URL). The icon is chosen from
 * the link label / URL (facebook, twitter, instagram, …).
 *
 * Authoring:
 *   | social-links                    |
 *   | Facebook  | https://facebook.com/... |
 *   | Twitter   | https://twitter.com/...  |
 *   | Instagram | https://instagram.com/...|
 */

const NETWORKS = ['facebook', 'twitter', 'instagram', 'linkedin', 'youtube', 'pinterest'];

function detectNetwork(label, href) {
  const hay = `${label} ${href}`.toLowerCase();
  return NETWORKS.find((n) => hay.includes(n)) || null;
}

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.querySelectorAll('a')].forEach((a) => {
    const label = a.textContent.trim();
    const href = a.getAttribute('href') || '#';
    const network = detectNetwork(label, href);

    const li = document.createElement('li');
    const link = document.createElement('a');
    link.href = href;
    link.setAttribute('aria-label', label || network || 'Social link');
    if (network) link.classList.add(`social-links-${network}`);

    // Prefer an authored image (icon); otherwise fall back to a text label.
    const authoredImg = a.querySelector('img');
    if (authoredImg) {
      link.append(authoredImg);
    } else if (network) {
      const img = document.createElement('img');
      img.src = `/content/images/social-${network}.svg`;
      img.alt = label || network;
      img.width = 24;
      img.height = 24;
      link.append(img);
    } else {
      link.textContent = label;
    }
    li.append(link);
    ul.append(li);
  });

  block.textContent = '';
  block.append(ul);
}
