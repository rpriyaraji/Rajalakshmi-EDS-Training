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

- **index path** (a link or `.json` path): which query index to read. Defaults to
  `/us/en/magazine/query-index.json`.
- **limit: N**: cap the number of articles shown (newest first). `0`/omitted = all.

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
