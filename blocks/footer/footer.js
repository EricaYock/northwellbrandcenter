import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';
import { toSitePath } from '../../scripts/shared.js';

/**
 * loads and decorates the footer
 * Footer fragment (/footer) sections: brand, links, legal
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment (skip if aem-embed already provided content)
  if (block.textContent === '') {
    const footerMeta = getMetadata('footer');
    const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : toSitePath('/footer');
    const fragment = await loadFragment(footerPath);

    block.textContent = '';
    const footer = document.createElement('div');
    while (fragment.firstElementChild) footer.append(fragment.firstElementChild);
    block.append(footer);
  }

  const classes = ['brand', 'links', 'legal'];
  block.querySelectorAll('.section').forEach((section, i) => {
    if (classes[i]) section.classList.add(`footer-${classes[i]}`);
  });

  // footer links are plain links, not buttons
  block.querySelectorAll('a.button').forEach((a) => {
    a.className = '';
    a.closest('.button-container')?.classList.remove('button-container');
  });
}
