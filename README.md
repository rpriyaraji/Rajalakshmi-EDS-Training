# WKND on Edge Delivery Services

A migration of the [WKND demo site](https://wknd.site/us/en.html) to Adobe Edge
Delivery Services (EDS), authored in Document Authoring (DA). Built as an
EDS-developer capstone: design-system extraction, page migration, custom blocks,
a dynamic query-index, and a performance/accessibility pass.

## Environments

- **Preview:** https://main--rajalakshmi-eds-training--rpriyaraji.aem.page/us/en
- **Live:** https://main--rajalakshmi-eds-training--rpriyaraji.aem.live/us/en

## What was migrated

All 26 meaningful pages of the source site (content published to DA):

| Template | Pages |
| --- | --- |
| Home | `/us/en` |
| Magazine listing | `/us/en/magazine` |
| Magazine article | 5 articles under `/us/en/magazine/*` |
| About | `/us/en/about-us` |
| Adventures listing | `/us/en/adventures` |
| Adventure detail | 16 trips under `/us/en/adventures/*` |
| FAQs | `/us/en/faqs` |

Global header/nav (`/nav`) and footer (`/footer`) are authored as fragments and
fetched by the `header` / `footer` blocks.

## Blocks

Custom and adapted blocks live in `blocks/`:

- **carousel-hero** — full-bleed hero carousel (home)
- **columns-featured** — featured-article split layout
- **hero-feature** — image + copy feature banner
- **cards** — base card grid; `secure` **variant** (`.cards.secure`) for the
  magazine "Members Only" teasers
- **cards-articles** — static article/adventure card grid
- **cards-contributors** — About-page people grid
- **article-list** — *dynamic, index-driven* card rail. Reads a
  `query-index.json` and renders the newest N entries. Config rows: `path:`
  (section prefix, e.g. `/us/en/adventures/`) and `limit:`. Drives both home
  rails and can power any section listing with no code change.
- **author**, **social-links**, **banner** — article/support blocks

Each block folder has a `README.md` documenting its authoring model.

## Dynamic content (query-index)

`helix-query.yaml` defines two indices, both committed to the repo:

- `articles` → `/us/en/magazine/query-index.json`
- `adventures` → `/us/en/adventures/query-index.json`

The home page rails and the section listings are all driven by these indices —
a newly published article or adventure appears automatically, with no content or
code edit.

## Migration tooling (`tools/importer/`)

The content in DA was produced by the project's bundled import scripts, not by
hand-editing HTML:

- `import-{home,magazine,adventure,adventures-listing,faqs,about-us}.js` — one
  import script per template, plus `*.bundle.js` (built with
  `@adobe/aem-import-helper bundle`)
- `parsers/` — per-block parsers; `transformers/wknd-*.js` — cleanup + section
  breaks. The cleanup transformer also normalizes internal `.html` links to the
  extensionless paths EDS serves.
- `localize-images.js` — downloads referenced images into `media/` and rewrites
  references, so pages don't depend on wknd.site
- `upload-to-da.js` / `publish-da.js` — push each page to DA (wrapped as a full
  document, images as absolute URLs) and preview/publish it

## Performance & accessibility

- Lighthouse CI (`.github/workflows/lighthouse.yaml`) runs mobile audits on the
  home, both listings, About, FAQs and an article on every push to `main`.
- Latest scores: **Performance 94–99, Accessibility 98–100, Best-Practices 100**
  across all templates.
- SEO shows ~69 on the `*.aem.page` / `*.aem.live` hosts because the platform
  serves `x-robots-tag: noindex` on all pre-production domains; this lifts
  automatically on the production domain.

## Local development

```sh
npm i
npm run lint
npx @adobe/aem-cli up   # serves local code against previewed content
```

## Reference

- [aem.live docs](https://www.aem.live/docs/)
- [Anatomy of a Project](https://www.aem.live/developer/anatomy-of-a-project)
- [Keeping it 100 (performance)](https://www.aem.live/developer/keeping-it-100)
