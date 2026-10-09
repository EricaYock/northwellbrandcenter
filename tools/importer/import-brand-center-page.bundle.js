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

  // tools/importer/import-brand-center-page.js
  var import_brand_center_page_exports = {};
  __export(import_brand_center_page_exports, {
    default: () => import_brand_center_page_default
  });

  // tools/importer/parsers/carousel.js
  function parse(element, { document }) {
    const cells = [["Carousel"]];
    element.querySelectorAll(":scope > .nw-slide").forEach((slide) => {
      const content = slide.querySelector(".nw-slide-content");
      const media = slide.querySelector(".nw-slide-media");
      const row = [content ? [...content.childNodes] : ""];
      if (media) row.push([...media.childNodes]);
      cells.push(row);
    });
    element.replaceWith(WebImporter.DOMUtils.createTable(cells, document));
  }

  // tools/importer/parsers/ask-brand.js
  function parse2(element, { document }) {
    const cells = [["Ask Brand"]];
    const heading = element.querySelector("h1, h2, h3");
    if (heading) cells.push([heading]);
    const input = element.querySelector("input");
    const button = element.querySelector("button");
    cells.push([(input == null ? void 0 : input.getAttribute("placeholder")) || "", (button == null ? void 0 : button.textContent.trim()) || ""]);
    const list = element.querySelector("ul.nw-suggestions");
    if (list) {
      list.removeAttribute("class");
      cells.push([list]);
    }
    const action = element.dataset.action;
    if (action) {
      const a = document.createElement("a");
      a.href = action;
      a.textContent = element.dataset.actionLabel || action;
      cells.push([a]);
    }
    element.replaceWith(WebImporter.DOMUtils.createTable(cells, document));
  }

  // tools/importer/parsers/columns.js
  function parse3(element, { document }) {
    const variant = element.dataset.variant;
    const name = variant ? `Columns (${variant})` : "Columns";
    const rows = element.querySelectorAll(":scope > .nw-row");
    const rowEls = rows.length ? [...rows] : [element];
    const cells = [[name]];
    rowEls.forEach((rowEl) => {
      cells.push([...rowEl.querySelectorAll(":scope > .nw-col")].map((col) => [...col.childNodes]));
    });
    element.replaceWith(WebImporter.DOMUtils.createTable(cells, document));
  }

  // tools/importer/parsers/tiles.js
  function parse4(element, { document }) {
    const variant = element.dataset.variant;
    const cells = [[variant ? `Tiles (${variant})` : "Tiles"]];
    element.querySelectorAll(":scope > li").forEach((tile) => {
      const media = tile.querySelector(".nw-tile-media");
      const body = tile.querySelector(".nw-tile-body");
      cells.push([media ? [...media.childNodes] : "", body ? [...body.childNodes] : ""]);
    });
    element.replaceWith(WebImporter.DOMUtils.createTable(cells, document));
  }

  // tools/importer/parsers/sound-list.js
  function parse5(element, { document }) {
    const cells = [["Sound List"]];
    element.querySelectorAll(":scope > li").forEach((li) => {
      const label = li.textContent.trim();
      const src = li.dataset.src;
      if (src) {
        const a = document.createElement("a");
        a.href = src;
        a.textContent = src;
        cells.push([label, a]);
      } else {
        cells.push([label]);
      }
    });
    element.replaceWith(WebImporter.DOMUtils.createTable(cells, document));
  }

  // tools/importer/transformers/brand-center-cleanup.js
  function transform(hookName, element) {
    if (hookName === "beforeTransform") {
      WebImporter.DOMUtils.remove(element, ["script", "style", "noscript", "link", ".nw-annotation"]);
    }
  }

  // tools/importer/transformers/brand-center-sections.js
  function transform2(hookName, element, { document }) {
    if (hookName !== "afterTransform") return;
    const sections = [...element.querySelectorAll("section.nw-section")];
    sections.forEach((section, i) => {
      const style = section.dataset.style;
      if (style) {
        const meta = WebImporter.DOMUtils.createTable([
          ["Section Metadata"],
          ["Style", style.split(/\s+/).join(", ")]
        ], document);
        section.append(meta);
      }
      if (i > 0) section.before(document.createElement("hr"));
      section.replaceWith(...section.childNodes);
    });
  }

  // tools/importer/import-brand-center-page.js
  var parsers = {
    carousel: parse,
    "ask-brand": parse2,
    columns: parse3,
    tiles: parse4,
    "sound-list": parse5
  };
  var PAGE_TEMPLATE = {
    name: "brand-center-page",
    description: "Northwell Health Brand Center pages built from the Brand Center Reimagination mockup",
    blocks: [
      { name: "carousel", instances: [".nw-carousel"] },
      { name: "ask-brand", instances: ["form.nw-ask-brand"] },
      { name: "columns", instances: [".nw-columns"] },
      { name: "tiles", instances: ["ul.nw-tiles"] },
      { name: "sound-list", instances: ["ul.nw-sounds"] }
    ],
    sections: [
      { id: "section-n", name: "Mockup section", selector: ["section.nw-section"] },
      { id: "section-n-plus-1", name: "Mockup section (repeated)", selector: ["section.nw-section + section.nw-section"], style: "divider" }
    ]
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  var FRAGMENTS = ["/nav", "/footer"];
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
  function findBlocksOnPage(document, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        document.querySelectorAll(selector).forEach((element) => {
          pageBlocks.push({ name: blockDef.name, selector, element });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_brand_center_page_default = {
    transform: (payload) => {
      const { document, url, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (!parser) return;
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const rawPath = new URL(params.originalURL || url).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      if (!FRAGMENTS.includes(path)) {
        const hr = document.createElement("hr");
        main.appendChild(hr);
        WebImporter.rules.createMetadata(main, document);
      }
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_brand_center_page_exports);
})();
