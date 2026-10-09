import { createTag, fetchQueryIndexAll } from '../../scripts/shared.js';

/**
 * Ask Brand – "Hi Brand, I am looking for…" prompt.
 *
 * Authored rows (all optional except the input row):
 *   - heading              e.g. "Hi Brand,"
 *   - placeholder | button e.g. "I am looking for…" | "Search ➔"
 *   - list of suggestion links (shown in the drop-down)
 *   - single link to a results page (form submits there instead of answering inline)
 *
 * Inline answers combine the authored suggestions with pages from the query index.
 * @param {Element} block
 */
export default async function decorate(block) {
  const rows = [...block.children];
  let heading = null;
  let placeholder = '';
  let buttonLabel = '';
  let suggestions = [];
  let action = null;

  rows.forEach((row) => {
    const cells = [...row.children];
    const h = row.querySelector('h1, h2, h3, h4, h5, h6');
    const list = row.querySelector('ul, ol');
    const links = row.querySelectorAll('a[href]');
    if (h) {
      heading = h;
    } else if (list) {
      suggestions = [...list.querySelectorAll('a[href]')].map((a) => ({
        title: a.textContent.trim(),
        href: a.getAttribute('href'),
      }));
    } else if (cells.length > 1) {
      placeholder = cells[0].textContent.trim();
      buttonLabel = cells[1].textContent.trim();
    } else if (links.length === 1) {
      action = new URL(links[0].href, window.location).pathname;
    } else if (!placeholder) {
      placeholder = row.textContent.trim();
    }
  });

  const form = createTag('form', { class: 'ask-brand-form', role: 'search' });
  if (action) {
    form.action = action;
    form.method = 'get';
  }

  const bar = createTag('div', { class: 'ask-brand-bar' });
  const inputId = `ask-brand-${Math.random().toString(36).slice(2, 8)}`;
  const input = createTag('input', {
    id: inputId,
    type: 'search',
    name: 'q',
    placeholder,
    autocomplete: 'off',
    'aria-label': placeholder,
  });
  const submit = createTag('button', { type: 'submit', class: 'button accent' }, buttonLabel);
  bar.append(input, submit);

  const results = createTag('ul', { class: 'ask-brand-results', id: `${inputId}-results` });
  input.setAttribute('aria-controls', results.id);
  form.append(bar, results);

  block.textContent = '';
  if (heading) {
    heading.classList.add('ask-brand-heading');
    block.append(heading);
  }
  block.append(form);

  let index = null;
  const loadIndex = async () => {
    if (index) return index;
    try {
      index = (await fetchQueryIndexAll()).map((row) => ({
        title: row.title,
        href: row.path,
        text: `${row.title || ''} ${row.description || ''}`.toLowerCase(),
      }));
    } catch (e) {
      index = [];
    }
    return index;
  };

  const render = (items) => {
    results.replaceChildren(...items.map((item) => createTag('li', {}, createTag('a', { href: item.href }, item.title))));
    block.classList.toggle('open', items.length > 0);
  };

  const answer = async (query) => {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.length) {
      render(suggestions);
      return;
    }
    const matches = (item) => terms.every((t) => (item.text || item.title.toLowerCase()).includes(t));
    const pages = (await loadIndex()).filter((p) => p.title && matches(p));
    const seen = new Set();
    const items = [...suggestions.filter(matches), ...pages].filter((item) => {
      if (seen.has(item.href)) return false;
      seen.add(item.href);
      return true;
    });
    render(items.length ? items.slice(0, 8) : suggestions);
  };

  if (suggestions.length) {
    input.addEventListener('focus', () => { if (!input.value) render(suggestions); });
  }
  input.addEventListener('input', () => { if (!action) answer(input.value.trim()); });
  form.addEventListener('submit', (e) => {
    if (action) return;
    e.preventDefault();
    answer(input.value.trim());
  });
  block.addEventListener('focusout', (e) => {
    if (!block.contains(e.relatedTarget) && !input.value) block.classList.remove('open');
  });

  // answer queries passed from the header search or the home page prompt
  const q = new URLSearchParams(window.location.search).get('q');
  if (q && !action) {
    input.value = q;
    answer(q);
  }
}
