/* eslint-disable */
/* global WebImporter */

/**
 * Parser for the Columns block (and its variants, e.g. banner).
 * Source: .nw-columns[data-variant] > .nw-row? > .nw-col
 * Output: one table row per .nw-row (or a single row), one cell per .nw-col
 */
export default function parse(element, { document }) {
  const variant = element.dataset.variant;
  const name = variant ? `Columns (${variant})` : 'Columns';
  const rows = element.querySelectorAll(':scope > .nw-row');
  const rowEls = rows.length ? [...rows] : [element];
  const cells = [[name]];
  rowEls.forEach((rowEl) => {
    cells.push([...rowEl.querySelectorAll(':scope > .nw-col')].map((col) => [...col.childNodes]));
  });
  element.replaceWith(WebImporter.DOMUtils.createTable(cells, document));
}
