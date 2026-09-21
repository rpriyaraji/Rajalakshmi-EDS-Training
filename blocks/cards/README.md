# cards

Base **cards** block — a responsive grid of image + text cards.

## Authoring (Document Authoring)

Model: `container`

Block table with one row per card. Each row has two cells: an image and the
card body (heading/text). The block decorates each row into a `<li>` with a
`cards-card-image` and `cards-card-body`.

## Supported variations

- **secure** — compact "Members Only" teaser cards used on the magazine
  listing. Add `secure` to the block name (renders as `.cards.secure`): larger
  fixed-height image, serif title, 2-up grid. Styling is scoped to
  `.cards.secure` in `cards.css`, so it is a variant of this block — not a
  separate block.

## Universal Editor fields

N/A (Document Authoring project)
