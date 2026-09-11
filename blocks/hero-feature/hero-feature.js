export default function decorate(block) {
  const picture = block.querySelector('picture');
  if (!picture) {
    block.classList.add('no-image');
    return;
  }

  // Group the text (heading, copy, CTA) into a card overlaid on the image.
  const content = document.createElement('div');
  content.className = 'hero-feature-content';
  [...block.querySelectorAll(':scope > div')].forEach((row) => {
    [...row.children].forEach((cell) => {
      if (cell.querySelector(':scope > picture') && cell.children.length === 1) return;
      while (cell.firstElementChild) content.append(cell.firstElementChild);
    });
  });

  const pictureWrapper = document.createElement('div');
  pictureWrapper.className = 'hero-feature-image';
  pictureWrapper.append(picture);

  block.textContent = '';
  block.append(pictureWrapper, content);
}
