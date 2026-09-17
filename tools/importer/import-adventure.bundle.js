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

  // tools/importer/import-adventure.js
  var import_adventure_exports = {};
  __export(import_adventure_exports, {
    default: () => import_adventure_default
  });

  // tools/importer/parsers/adventure-facts.js
  function parse(element, { document: document2 }) {
    const rows = [];
    element.querySelectorAll(".cmp-contentfragment__element").forEach((el) => {
      const title = el.querySelector(".cmp-contentfragment__element-title");
      const value = el.querySelector(".cmp-contentfragment__element-value");
      const t = title && title.textContent.trim();
      let v = value && value.textContent.trim();
      if (!t || !v) return;
      if (/^price$/i.test(t) && /^\d+(\.\d+)?$/.test(v)) {
        v = `$${Math.round(parseFloat(v)).toLocaleString("en-US")}`;
      }
      rows.push([t, v]);
    });
    if (!rows.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, {
      name: "columns (facts)",
      cells: rows
    });
    element.replaceWith(block);
  }

  // tools/importer/parsers/adventure-tabs.js
  function parse2(element, { document: document2 }) {
    const tabList = element.querySelector(".cmp-tabs__tablist");
    const titles = tabList ? [...tabList.querySelectorAll(".cmp-tabs__tab")].map((t) => t.textContent.trim()) : [];
    const panels = [...element.querySelectorAll(".cmp-tabs__tabpanel")];
    const frag = document2.createDocumentFragment();
    panels.forEach((panel, i) => {
      const title = titles[i];
      if (title) {
        const h = document2.createElement("h2");
        h.textContent = title;
        frag.append(h);
      }
      [...panel.children].forEach((child) => {
        frag.append(child);
      });
    });
    if (!frag.childNodes.length) {
      element.remove();
      return;
    }
    element.replaceWith(frag);
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

  // tools/importer/import-adventure.js
  var parsers = {
    "adventure-facts": parse,
    "adventure-tabs": parse2
  };
  var PAGE_TEMPLATE = {
    name: "adventure",
    description: "Adventure/trip detail page: hero image, title, trip-facts content fragment, and description. Mostly default content plus a facts table.",
    urls: [
      "https://wknd.site/us/en/adventures/bali-surf-camp.html"
    ],
    blocks: [
      { name: "adventure-facts", instances: [".cmp-contentfragment"] },
      { name: "adventure-tabs", instances: [".cmp-tabs"] }
    ],
    sections: [
      { id: "a1", name: "Hero Image", selector: [".cmp-carousel", ".cmp-image", "main .image"], style: null, blocks: [], defaultContent: [".cmp-image"] },
      { id: "a2", name: "Title", selector: [".cmp-title", "main .title"], style: null, blocks: [], defaultContent: ["h1", ".cmp-title__text"] },
      { id: "a3", name: "Trip Facts", selector: [".cmp-contentfragment", "main .contentfragment"], style: null, blocks: ["adventure-facts"], defaultContent: [] },
      { id: "a4", name: "Description", selector: [".cmp-tabs", "main .tabs"], style: null, blocks: ["adventure-tabs"], defaultContent: ["h2", "p", "ul", "ol"] }
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
        document2.querySelectorAll(selector).forEach((element) => {
          pageBlocks.push({ name: blockDef.name, selector, element });
        });
      });
    });
    return pageBlocks;
  }
  var import_adventure_default = {
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
  return __toCommonJS(import_adventure_exports);
})();
