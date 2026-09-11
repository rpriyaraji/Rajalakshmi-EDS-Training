/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-about-us.js
  var import_about_us_exports = {};
  __export(import_about_us_exports, {
    default: () => import_about_us_default
  });

  // tools/importer/parsers/cards-contributors.js
  function parse(element, { document: document2 }) {
    const image = element.querySelector(".cmp-image__image, .image img, img");
    const name = element.querySelector("h3.cmp-title__text, h3");
    const role = element.querySelector("h5.cmp-title__text, h5");
    const socialLinks = Array.from(
      element.querySelectorAll(".cmp-buildingblock--btn-list a.cmp-button, .cmp-button a, a.cmp-button")
    );
    if (!image && !name && !role && socialLinks.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const textCell = [];
    if (name) textCell.push(name);
    if (role) textCell.push(role);
    socialLinks.forEach((link) => {
      var _a;
      const label = (((_a = link.querySelector(".cmp-button__text")) == null ? void 0 : _a.textContent) || link.textContent || "").trim();
      if (label) link.textContent = label;
      textCell.push(link);
    });
    const cells = [];
    cells.push([image || "", textCell]);
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-contributors", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-featured.js
  function parse2(element, { document: document2 }) {
    const content = element.querySelector(".cmp-teaser__content");
    const imageContainer = element.querySelector(".cmp-teaser__image");
    const image = imageContainer ? imageContainer.querySelector("img") : element.querySelector(".cmp-teaser__image img");
    const pretitle = content ? content.querySelector(".cmp-teaser__pretitle") : null;
    const title = content ? content.querySelector(".cmp-teaser__title, h1, h2, h3") : null;
    const description = content ? content.querySelector(".cmp-teaser__description, p:not(.cmp-teaser__pretitle)") : null;
    const ctas = content ? Array.from(content.querySelectorAll(".cmp-teaser__action-link, .cmp-teaser__action-container a")) : [];
    const textCell = [];
    if (pretitle) textCell.push(pretitle);
    if (title) textCell.push(title);
    if (description) textCell.push(description);
    textCell.push(...ctas);
    if (!textCell.length && !image) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    cells.push([textCell, image || ""]);
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-featured", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-articles.js
  function parse3(element, { document: document2 }) {
    const items = Array.from(element.querySelectorAll(".cmp-image-list__item"));
    const cells = [];
    items.forEach((item) => {
      const image = item.querySelector(".cmp-image-list__item-image img, img");
      const titleLink = item.querySelector(".cmp-image-list__item-title-link");
      const titleSpan = item.querySelector(".cmp-image-list__item-title");
      const description = item.querySelector(".cmp-image-list__item-description");
      const contentCell = [];
      if (titleLink) {
        contentCell.push(titleLink);
      } else if (titleSpan) {
        contentCell.push(titleSpan);
      }
      if (description) contentCell.push(description);
      if (image || contentCell.length) {
        cells.push([image || "", contentCell]);
      }
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-articles", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-secure.js
  function parse4(element, { document: document2 }) {
    const image = element.querySelector(".cmp-teaser__image img, img");
    const title = element.querySelector(".cmp-teaser__title, h2, h3");
    const description = element.querySelector(".cmp-teaser__description, p");
    const contentCell = [];
    if (title) contentCell.push(title);
    if (description) contentCell.push(description);
    if (!image && !contentCell.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [[image || "", contentCell]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-secure", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/wknd-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        "header.experiencefragment",
        // site header: language nav, main nav, search, sign-in
        "footer.experiencefragment",
        // site footer
        "#toggleNav",
        // mobile nav toggle
        "#mobileNav",
        // mobile nav drawer
        "iframe"
        // Adobe ID syncing iframe (#destination_publishing_iframe...)
      ]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        "meta",
        "noscript"
      ]);
    }
  }

  // tools/importer/transformers/wknd-sections.js
  var SECTION_MARKER_ATTR = "data-excat-section-id";
  function querySection(root, selectors) {
    for (const sel of selectors) {
      const el = root.querySelector(sel);
      if (el) return el;
    }
    return null;
  }
  function transform2(hookName, element, payload) {
    const sections = payload.template && payload.template.sections || [];
    if (hookName === "beforeTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (i === 0 && !section.style) continue;
        const sectionEl = querySection(element, section.selector);
        if (!sectionEl) continue;
        const hr = document.createElement("hr");
        if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
        sectionEl.before(hr);
      }
    }
    if (hookName === "afterTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (!section.style) continue;
        const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
        const anchor = marker || querySection(element, section.selector);
        if (!anchor) continue;
        const metadataBlock = WebImporter.Blocks.createBlock(document, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        anchor.after(metadataBlock);
        if (marker) {
          marker.removeAttribute(SECTION_MARKER_ATTR);
          if (i === 0) marker.remove();
        }
      }
    }
  }

  // tools/importer/import-about-us.js
  var parsers = {
    "cards-contributors": parse,
    "columns-featured": parse2,
    "cards-articles": parse3,
    "cards-secure": parse4
  };
  var PAGE_TEMPLATE = {
    name: "about-us",
    description: "About Us page (contributor + guide people-card grids) and Magazine listing page (featured article + article grid).",
    urls: [
      "https://wknd.site/us/en/about-us.html",
      "https://wknd.site/us/en/magazine.html"
    ],
    blocks: [
      { name: "cards-contributors", instances: [".cmp-experience-fragment--contributor"] },
      { name: "columns-featured", instances: [".cmp-teaser--featured"] },
      { name: "cards-articles", instances: [".image-list.list"] },
      { name: "cards-secure", instances: [".cmp-teaser--secure"] }
    ],
    sections: [
      {
        id: "a1",
        name: "Page Title",
        selector: [".title.cmp-layout-container--fixed", "main .title"],
        style: null,
        blocks: [],
        defaultContent: ["h1"]
      },
      {
        id: "a2",
        name: "Our Contributors",
        selector: [".cmp-experience-fragment--contributor"],
        style: null,
        blocks: ["cards-contributors"],
        defaultContent: [".cmp-title__text", ".cmp-text"]
      },
      {
        id: "a3",
        name: "WKND Guides",
        selector: [".cmp-experience-fragment--contributor"],
        style: null,
        blocks: ["cards-contributors"],
        defaultContent: [".cmp-title__text", ".cmp-text"]
      },
      {
        id: "a4",
        name: "Members Only",
        selector: [".cmp-teaser--secure"],
        style: null,
        blocks: ["cards-secure"],
        defaultContent: [".cmp-title--underline"]
      }
    ]
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document2, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document2.querySelectorAll(selector);
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_about_us_default = {
    transform: (payload) => {
      const { document: document2, url, params } = payload;
      const main = document2.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document2, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document: document2, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document2.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document2);
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: {
          title: document2.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_about_us_exports);
})();
