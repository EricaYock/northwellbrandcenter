import { createTag } from '../../scripts/shared.js';

/* Screen-reader labels for the carousel controls (slide names come from authored headings). */
const LABELS = {
  previous: 'Previous slide',
  next: 'Next slide',
  pause: 'Pause rotation',
  play: 'Start rotation',
  slide: 'Slide',
};

const INTERVAL = 7000;

const CHEVRON = (dir) => `<svg viewBox="0 0 24 48" aria-hidden="true" focusable="false"><path d="${dir === 'prev' ? 'M20 4 4 24l16 20' : 'M4 4l16 20L4 44'}" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

/**
 * Carousel – rotating feature slider.
 * Each row is a slide: [image | heading, text, buttons].
 * @param {Element} block
 */
export default function decorate(block) {
  const rows = [...block.children];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const track = createTag('div', { class: 'carousel-slides', 'aria-live': 'off' });
  const dots = createTag('div', { class: 'carousel-dots' });

  const slides = rows.map((row, i) => {
    const slide = createTag('div', {
      class: 'carousel-slide',
      role: 'group',
      'aria-roledescription': 'slide',
    });
    [...row.children].forEach((cell) => {
      const onlyPicture = cell.querySelector('picture') && !cell.textContent.trim();
      cell.className = onlyPicture ? 'carousel-slide-image' : 'carousel-slide-content';
      slide.append(cell);
    });
    const heading = slide.querySelector('h1, h2, h3, h4');
    const name = heading?.textContent.trim() || `${LABELS.slide} ${i + 1}`;
    slide.setAttribute('aria-label', `${i + 1} / ${rows.length}: ${name}`);
    slide.querySelectorAll('img').forEach((img) => {
      img.loading = i === 0 ? 'eager' : 'lazy';
    });
    track.append(slide);

    const dot = createTag('button', {
      type: 'button',
      class: 'carousel-dot',
      'aria-label': name,
    });
    dots.append(dot);
    row.remove();
    return slide;
  });

  let current = 0;
  let timer = null;
  let playing = false;
  let hold = false; // temporary pause while hovered / focused

  const show = (index) => {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      const active = i === current;
      slide.classList.toggle('active', active);
      slide.setAttribute('aria-hidden', String(!active));
      slide.querySelectorAll('a, button').forEach((el) => {
        if (active) el.removeAttribute('tabindex');
        else el.setAttribute('tabindex', '-1');
      });
    });
    [...dots.children].forEach((dot, i) => {
      dot.setAttribute('aria-current', i === current ? 'true' : 'false');
    });
  };

  const toggle = createTag('button', { type: 'button', class: 'carousel-toggle' });
  const schedule = () => {
    clearInterval(timer);
    timer = playing && !hold ? setInterval(() => show(current + 1), INTERVAL) : null;
  };
  const setPlaying = (value) => {
    playing = value;
    schedule();
    toggle.classList.toggle('paused', !playing);
    toggle.setAttribute('aria-label', playing ? LABELS.pause : LABELS.play);
    track.setAttribute('aria-live', playing ? 'off' : 'polite');
  };
  const setHold = (value) => {
    hold = value;
    schedule();
  };

  const prev = createTag('button', { type: 'button', class: 'carousel-nav carousel-prev', 'aria-label': LABELS.previous });
  const next = createTag('button', { type: 'button', class: 'carousel-nav carousel-next', 'aria-label': LABELS.next });
  prev.innerHTML = CHEVRON('prev');
  next.innerHTML = CHEVRON('next');

  const userNavigate = (index) => {
    setPlaying(false);
    show(index);
  };
  prev.addEventListener('click', () => userNavigate(current - 1));
  next.addEventListener('click', () => userNavigate(current + 1));
  [...dots.children].forEach((dot, i) => dot.addEventListener('click', () => userNavigate(i)));
  toggle.addEventListener('click', () => setPlaying(!playing));

  // swipe support (arrows are hidden on small screens)
  let touchX = null;
  track.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    touchX = null;
    if (Math.abs(dx) > 50) userNavigate(current + (dx < 0 ? 1 : -1));
  });

  const frame = createTag('div', { class: 'carousel-frame' }, [prev, track, next]);
  const controls = createTag('div', { class: 'carousel-controls' }, [dots]);
  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'carousel');
  block.append(frame, controls);

  show(0);
  if (slides.length > 1) {
    controls.append(toggle);
    setPlaying(!reducedMotion);
    // pause while the user is reading or interacting
    block.addEventListener('mouseenter', () => setHold(true));
    block.addEventListener('mouseleave', () => setHold(block.contains(document.activeElement)));
    block.addEventListener('focusin', () => setHold(true));
    block.addEventListener('focusout', (e) => { if (!block.contains(e.relatedTarget)) setHold(false); });
  } else {
    block.classList.add('single');
  }
}
