export default function decorate(block) {
  // Flatten the auto-blocked structure (div > div > p), then group the text
  // (heading, copy, button) into a panel that overlays the bottom of the image.
  const picture = block.querySelector('picture');
  const heading = block.querySelector('h1, h2');
  const paragraphs = [...block.querySelectorAll('p')].filter((p) => !p.querySelector('picture'));

  const content = document.createElement('div');
  content.className = 'hero-content';
  if (heading) content.append(heading);
  paragraphs.forEach((p) => {
    if (p.textContent.trim()) content.append(p);
  });

  block.replaceChildren();
  if (picture) block.append(picture);
  block.append(content);
}
