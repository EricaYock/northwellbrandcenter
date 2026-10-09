import { createOptimizedPicture } from '../../scripts/aem.js';
import { createTag } from '../../scripts/shared.js';

/**
 * Tiles – a row of image tiles with a caption and/or button underneath.
 * Each row is a tile: [image | title, text, buttons].
 * Variant "bordered" frames the image (used for logo lockups).
 * @param {Element} block
 */
export default function decorate(block) {
  const ul = createTag('ul');
  [...block.children].forEach((row) => {
    const li = createTag('li');
    [...row.children].forEach((cell) => {
      const onlyPicture = cell.querySelector('picture') && !cell.textContent.trim();
      cell.className = onlyPicture ? 'tiles-image' : 'tiles-body';
      li.append(cell);
    });
    // a linked title makes the whole image clickable too
    const titleLink = li.querySelector('.tiles-body :is(h2, h3, h4) a[href]');
    const image = li.querySelector('.tiles-image');
    if (titleLink && image && !image.querySelector('a')) {
      const a = createTag('a', { href: titleLink.href, tabindex: '-1', 'aria-hidden': 'true' });
      a.append(...image.childNodes);
      image.append(a);
    }
    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]));
  });

  block.replaceChildren(ul);
}
