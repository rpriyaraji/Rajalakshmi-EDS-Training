# Article List

Dynamic list of magazine articles, driven by the published query index
(`helix-query.yaml` → `query-index.json`). New articles appear automatically on
publish — no code change required.

## Authoring

| article-list |
| --- |

Optional configuration rows:

| article-list |
| --- |
| /us/en/magazine/query-index.json |
| limit: 4 |
| path: /us/en/magazine/ |

- **index path** (a link or `.json` path): which query index to read. If omitted,
  the block tries `/us/en/magazine/query-index.json` then the site-wide
  `/query-index.json` — so it works whether the index is magazine-scoped or global.
- **limit: N**: cap the number of articles shown (newest first). `0`/omitted = all.
- **path: /prefix/**: article path prefix to filter on (defaults to
  `/us/en/magazine/`); results are limited to pages under this prefix and the
  listing page itself is excluded.

## How it works

`article-list.js` fetches the index JSON, sorts by `lastModified` (newest first),
and renders one flat card per article (image + linked title + description),
matching the WKND article-card style. The index fields (`title`, `description`,
`image`, `path`, `lastModified`) come from each article page's metadata as
configured in `helix-query.yaml`.

## Requirements

- `helix-query.yaml` present with an index whose `target` matches the path the
  block reads.
- Article pages published so the indexer includes them.
