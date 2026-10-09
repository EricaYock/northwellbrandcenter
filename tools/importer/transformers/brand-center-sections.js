/* eslint-disable */
/* global WebImporter */

/**
 * Section transformer for the Brand Center mockup source pages.
 * afterTransform: each <section> becomes an EDS section – an <hr> separates sections and
 * data-style becomes a Section Metadata block (e.g. "divider", "center", "split").
 */
export default function transform(hookName, element, { document }) {
  if (hookName !== 'afterTransform') return;
  const sections = [...element.querySelectorAll('section.nw-section')];
  sections.forEach((section, i) => {
    const style = section.dataset.style;
    if (style) {
      const meta = WebImporter.DOMUtils.createTable([
        ['Section Metadata'],
        ['Style', style.split(/\s+/).join(', ')],
      ], document);
      section.append(meta);
    }
    if (i > 0) section.before(document.createElement('hr'));
    section.replaceWith(...section.childNodes);
  });
}
