/* eslint-disable */
/* global WebImporter */

/**
 * Parser for the Tiles block.
 * Source: ul.nw-tiles[data-variant] > li > (.nw-tile-media, .nw-tile-body)
 * Output: one row per tile → [image | body]
 */
export default function parse(element, { document }) {
  const variant = element.dataset.variant;
  const cells = [[variant ? `Tiles (${variant})` : 'Tiles']];
  element.querySelectorAll(':scope > li').forEach((tile) => {
    const media = tile.querySelector('.nw-tile-media');
    const body = tile.querySelector('.nw-tile-body');
    cells.push([media ? [...media.childNodes] : '', body ? [...body.childNodes] : '']);
  });
  element.replaceWith(WebImporter.DOMUtils.createTable(cells, document));
}
