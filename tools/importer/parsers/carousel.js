/* eslint-disable */
/* global WebImporter */

/**
 * Parser for the Carousel block.
 * Source: .nw-carousel > .nw-slide > (.nw-slide-content, .nw-slide-media)
 * Output: one row per slide → [content | image]
 */
export default function parse(element, { document }) {
  const cells = [['Carousel']];
  element.querySelectorAll(':scope > .nw-slide').forEach((slide) => {
    const content = slide.querySelector('.nw-slide-content');
    const media = slide.querySelector('.nw-slide-media');
    const row = [content ? [...content.childNodes] : ''];
    if (media) row.push([...media.childNodes]);
    cells.push(row);
  });
  element.replaceWith(WebImporter.DOMUtils.createTable(cells, document));
}
