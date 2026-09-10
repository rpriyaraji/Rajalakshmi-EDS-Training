export default function decorate(block) {
  // Extract children rows: [imageRow, titleRow, colorRow]
  const [imageRow, titleRow, colorRow] = [...block.children];

  // Apply optional custom background color if authored
  const customColor = colorRow?.textContent?.trim();
  if (customColor) {
    block.style.backgroundColor = customColor;
  }
}