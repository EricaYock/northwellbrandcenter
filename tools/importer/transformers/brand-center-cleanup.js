/* eslint-disable */
/* global WebImporter */

/**
 * Cleanup transformer for the Brand Center mockup source pages.
 * beforeTransform: drop scripts/styles and designer annotations (.nw-annotation).
 */
export default function transform(hookName, element) {
  if (hookName === 'beforeTransform') {
    WebImporter.DOMUtils.remove(element, ['script', 'style', 'noscript', 'link', '.nw-annotation']);
  }
}
