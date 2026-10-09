import { createTag } from '../../scripts/shared.js';

const AUDIO_EXT = /\.(mp3|m4a|wav|ogg|aac)(\?|#|$)/i;

/**
 * Sound List – a stack of playable sound clips (sonic identity).
 * Each row: [label | link to the audio file]. Rows without an audio link render as
 * a disabled placeholder until the file is added.
 * @param {Element} block
 */
export default function decorate(block) {
  const ul = createTag('ul');
  const players = [];

  [...block.children].forEach((row) => {
    const [labelCell, linkCell] = row.children;
    const label = labelCell?.textContent.trim() || '';
    const link = (linkCell || labelCell)?.querySelector('a[href]');
    const src = link && AUDIO_EXT.test(link.href) ? link.href : null;

    const li = createTag('li');
    const button = createTag('button', {
      type: 'button',
      class: 'sound-list-play',
      'aria-label': label,
      'aria-pressed': 'false',
    });
    const bar = createTag('span', { class: 'sound-list-bar' }, [
      createTag('span', { class: 'sound-list-progress' }),
      createTag('span', { class: 'sound-list-label' }, label),
    ]);

    if (src) {
      const audio = new Audio();
      audio.preload = 'none';
      audio.src = src;
      players.push({ audio, button });
      button.addEventListener('click', () => {
        players.forEach((p) => { if (p.audio !== audio) p.audio.pause(); });
        if (audio.paused) audio.play(); else audio.pause();
      });
      audio.addEventListener('play', () => { button.setAttribute('aria-pressed', 'true'); li.classList.add('playing'); });
      audio.addEventListener('pause', () => { button.setAttribute('aria-pressed', 'false'); li.classList.remove('playing'); });
      audio.addEventListener('timeupdate', () => {
        const pct = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
        bar.style.setProperty('--progress', `${pct}%`);
      });
    } else {
      button.disabled = true;
      li.classList.add('placeholder');
    }

    li.append(button, bar);
    ul.append(li);
  });

  block.replaceChildren(ul);
}
