/* eslint-disable */
/* global WebImporter */

/**
 * Parser for the Sound List block.
 * Source: ul.nw-sounds > li[data-src]
 * Output: one row per clip → [label | audio link] (link omitted until a file exists)
 */
export default function parse(element, { document }) {
  const cells = [['Sound List']];
  element.querySelectorAll(':scope > li').forEach((li) => {
    const label = li.textContent.trim();
    const src = li.dataset.src;
    if (src) {
      const a = document.createElement('a');
      a.href = src;
      a.textContent = src;
      cells.push([label, a]);
    } else {
      cells.push([label]);
    }
  });
  element.replaceWith(WebImporter.DOMUtils.createTable(cells, document));
}
