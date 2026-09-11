import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-contributors-card-image';
      else div.className = 'cards-contributors-card-body';
    });
    ul.append(li);
  });

  // In each body: first heading is the name, second is the role line,
  // and any link row becomes the social links group.
  ul.querySelectorAll('.cards-contributors-card-body').forEach((body) => {
    const headings = [...body.querySelectorAll('h1, h2, h3, h4, h5, h6')];
    if (headings[0]) headings[0].classList.add('contributor-name');
    if (headings[1]) headings[1].classList.add('contributor-role');
    const socialLinks = [...body.querySelectorAll('a')];
    if (socialLinks.length) {
      const social = document.createElement('p');
      social.className = 'contributor-social';
      socialLinks.forEach((a) => social.append(a));
      body.append(social);
    }
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    img.closest('picture').replaceWith(optimizedPic);
  });
  block.textContent = '';
  block.append(ul);
}
