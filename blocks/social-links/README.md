# Social Links

A horizontal row of social media icon links. Content-driven — each authored
link becomes an icon; the network (facebook/twitter/instagram/…) is detected
from the link label or URL, and the matching icon from `/content/images/` is used.

## Authoring

| social-links |
| --- |
| [Facebook](https://facebook.com/wknd) |
| [Twitter](https://twitter.com/wknd) |
| [Instagram](https://instagram.com/wknd) |

If the author includes an image inside the link, that image is used as the icon;
otherwise a bundled `social-<network>.svg` is used, falling back to a text label.
