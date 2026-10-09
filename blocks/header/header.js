/*
 * Header block – Northwell Brand Center
 * Nav fragment (/nav) is authored as three sections:
 *   1. brand  – linked logo image, optional site title paragraph (e.g. "Brand Center")
 *   2. links  – list of primary navigation links (tabs)
 *   3. tools  – a single link to the search page; its text is used as the search label
 */

import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';
import { createTag, getSiteRoot, toSitePath } from '../../scripts/shared.js';

const DESKTOP = window.matchMedia('(min-width: 900px)');

const SEARCH_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="10" cy="10" r="6.5" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M15 15l6 6" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>';

function getNavPath() {
  const meta = getMetadata('nav');
  return (meta ? new URL(meta, window.location).pathname : null) || toSitePath('/nav');
}

/**
 * Site path of a URL without the preview root, trailing slash or /index.
 * @param {string} href
 * @returns {string}
 */
function sitePath(href) {
  const root = getSiteRoot();
  let path = new URL(href, window.location).pathname;
  if (root && path.startsWith(`${root}/`)) path = path.slice(root.length);
  path = path.replace(/\/index$/, '/').replace(/(.)\/$/, '$1');
  return path || '/';
}

/**
 * Points root-relative links at the right page for the current environment.
 * @param {HTMLAnchorElement} a
 */
function fixLink(a) {
  const href = a.getAttribute('href');
  if (href) a.setAttribute('href', toSitePath(href));
}

/**
 * Builds the brand lockup: one home link holding the logo and the site title.
 * @param {Element} section brand section
 * @returns {HTMLDivElement}
 */
function buildBrand(section) {
  const brand = createTag('div', { class: 'nav-brand' });
  if (!section) return brand;
  const link = section.querySelector('a[href]');
  const picture = section.querySelector('picture, img');
  const title = [...section.querySelectorAll('p')]
    .find((p) => !p.querySelector('picture, img') && p.textContent.trim());

  const home = createTag('a', { href: toSitePath(link?.getAttribute('href') || '/'), class: 'nav-brand-link' });
  if (picture) home.append(picture);
  if (title) home.append(createTag('span', { class: 'nav-brand-title' }, title.textContent.trim()));
  home.querySelectorAll('img').forEach((img) => {
    img.loading = 'eager';
    img.fetchPriority = 'high';
  });
  brand.append(home);
  return brand;
}

/**
 * Builds the pill-shaped search form from the authored tools link.
 * @param {Element} section tools section
 * @returns {HTMLFormElement|null}
 */
function buildSearch(section) {
  const link = section?.querySelector('a[href]');
  if (!link) return null;
  const label = link.textContent.trim();

  const form = createTag('form', {
    class: 'nav-search',
    role: 'search',
    action: toSitePath(new URL(link.href, window.location).pathname),
    method: 'get',
  });
  const input = createTag('input', {
    type: 'search',
    name: 'q',
    placeholder: label,
    'aria-label': label,
    autocomplete: 'off',
  });
  const button = createTag('button', { type: 'submit', 'aria-label': label });
  button.innerHTML = SEARCH_ICON;
  form.append(input, button);
  return form;
}

function toggleMenu(nav, open) {
  const expanded = open ?? nav.getAttribute('aria-expanded') !== 'true';
  nav.setAttribute('aria-expanded', String(expanded));
  nav.querySelector('.nav-hamburger button')?.setAttribute('aria-expanded', String(expanded));
  document.body.style.overflowY = expanded && !DESKTOP.matches ? 'hidden' : '';
}

/**
 * loads and decorates the header
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const fragment = await loadFragment(getNavPath());
  const sections = fragment ? [...fragment.querySelectorAll(':scope > .section')] : [];
  const [brandSection, linksSection, toolsSection] = sections;

  const nav = createTag('nav', { id: 'nav', 'aria-expanded': 'false' });
  const brand = buildBrand(brandSection);

  // primary links (tabs) – the tab for the current page, or its parent path, is marked current
  const sectionsEl = createTag('div', { class: 'nav-sections' });
  const list = linksSection?.querySelector('ul');
  if (list) {
    const here = sitePath(window.location.href);
    list.querySelectorAll('a').forEach((a) => {
      a.className = '';
      a.closest('.button-container')?.classList.remove('button-container');
      const target = sitePath(a.href);
      if (target !== '/' && (here === target || here.startsWith(`${target}/`))) {
        a.setAttribute('aria-current', 'page');
      }
      fixLink(a);
    });
    sectionsEl.append(list);
  }

  // tools / search
  const tools = createTag('div', { class: 'nav-tools' });
  const search = buildSearch(toolsSection);
  if (search) tools.append(search);

  // hamburger (mobile)
  const hamburger = createTag('div', { class: 'nav-hamburger' });
  const menuLabel = linksSection?.querySelector('h2, h3, p:not(:has(a))')?.textContent.trim() || 'Menu';
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-expanded="false" aria-label="${menuLabel}">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.querySelector('button').addEventListener('click', () => toggleMenu(nav));

  nav.append(brand, hamburger, sectionsEl, tools);

  window.addEventListener('keydown', (e) => {
    if (e.code === 'Escape' && nav.getAttribute('aria-expanded') === 'true') {
      toggleMenu(nav, false);
      hamburger.querySelector('button').focus();
    }
  });
  DESKTOP.addEventListener('change', () => toggleMenu(nav, false));

  const wrapper = createTag('div', { class: 'nav-wrapper' });
  wrapper.append(nav);
  block.replaceChildren(wrapper);
}
