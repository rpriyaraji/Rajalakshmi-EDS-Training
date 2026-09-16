export default function decorate(block) {
  // Rows are [imageRow, titleRow, colorRow]; only the color row is used here.
  const colorRow = [...block.children][2];

  // Apply optional custom background color if authored
  const customColor = colorRow?.textContent?.trim();
  if (customColor) {
    block.style.backgroundColor = customColor;
  }
}
