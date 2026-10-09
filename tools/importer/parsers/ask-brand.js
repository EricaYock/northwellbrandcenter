/* eslint-disable */
/* global WebImporter */

/**
 * Parser for the Ask Brand block.
 * Source: form.nw-ask-brand[data-action] with heading, input[placeholder], button, ul.nw-suggestions
 * Output rows: [heading] / [placeholder | button label] / [suggestion list] / [results page link]
 */
export default function parse(element, { document }) {
  const cells = [['Ask Brand']];
  const heading = element.querySelector('h1, h2, h3');
  if (heading) cells.push([heading]);
  const input = element.querySelector('input');
  const button = element.querySelector('button');
  cells.push([input?.getAttribute('placeholder') || '', button?.textContent.trim() || '']);
  const list = element.querySelector('ul.nw-suggestions');
  if (list) {
    list.removeAttribute('class');
    cells.push([list]);
  }
  const action = element.dataset.action;
  if (action) {
    const a = document.createElement('a');
    a.href = action;
    a.textContent = element.dataset.actionLabel || action;
    cells.push([a]);
  }
  element.replaceWith(WebImporter.DOMUtils.createTable(cells, document));
}
