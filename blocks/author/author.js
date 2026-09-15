import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * author — writer / photographer details card.
 * Shows an avatar, a name, and a role/title (e.g. "Photographer, Skiier").
 *
 * Authoring:
 *   | author  |                                   |
 *   | (image) | Sofia Sjöberg                     |
 *   |         | Photographer, Skiier, Youtuber    |
 *
 * The first cell with an image is the avatar; the text cell holds the name
 * (first line / heading) and the role (following lines).
 */

export default function decorate(block) {
  const avatar = block.querySelector('picture, img');
  const texts = [...block.querySelectorAll('p, h1, h2, h3, h4, h5, h6')]
    .filter((el) => el.textContent.trim() && !el.querySelector('picture, img'));

  const card = document.createElement('div');
  card.className = 'author-card';

  if (avatar) {
    const avatarWrap = document.createElement('div');
    avatarWrap.className = 'author-avatar';
    const img = avatar.tagName === 'IMG' ? avatar : avatar.querySelector('img');
    if (img) {
      avatarWrap.append(createOptimizedPicture(img.src, img.alt || '', false, [{ width: '200' }]));
    }
    card.append(avatarWrap);
  }

  const info = document.createElement('div');
  info.className = 'author-info';
  if (texts[0]) {
    const name = document.createElement('p');
    name.className = 'author-name';
    name.textContent = texts[0].textContent.trim();
    info.append(name);
  }
  if (texts[1]) {
    const role = document.createElement('p');
    role.className = 'author-role';
    role.textContent = texts[1].textContent.trim();
    info.append(role);
  }
  card.append(info);

  block.textContent = '';
  block.append(card);
}
