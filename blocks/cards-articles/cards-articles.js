import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-articles-card-image';
      else div.className = 'cards-articles-card-body';
    });
    ul.append(li);
  });

  ul.querySelectorAll('.cards-articles-card-body').forEach((body) => {
    // Title: the linked heading of the card.
    const titleLink = body.querySelector('a');
    if (titleLink) titleLink.classList.add('title-link');

    // Description: bare text node(s) sitting alongside the title link. EDS may
    // wrap the cell content in a <p>, so look within the link's parent.
    const container = titleLink ? titleLink.parentElement : body;
    const textNodes = [...container.childNodes].filter(
      (n) => n.nodeType === Node.TEXT_NODE && n.textContent.trim(),
    );
    if (textNodes.length) {
      const desc = document.createElement('span');
      desc.className = 'description';
      desc.textContent = textNodes.map((n) => n.textContent.trim()).join(' ');
      textNodes.forEach((n) => n.remove());
      (titleLink || container.firstElementChild || container).after(desc);
    }
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    img.closest('picture').replaceWith(optimizedPic);
  });
  block.textContent = '';
  block.append(ul);
}
