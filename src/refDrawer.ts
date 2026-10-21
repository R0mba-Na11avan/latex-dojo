import katex from 'katex';
import { cheatsheet } from './cheatsheet';

export interface RefDrawer {
  toggle(): void;
  close(): void;
}

interface Options {
  root: HTMLElement;
  toggleButton: HTMLButtonElement;
  /** Called with an entry's source when it's clicked. */
  onInsert: (tex: string) => void;
}

/** Non-modal cheat-sheet drawer: searchable LaTeX reference, click an entry to insert it. */
export function createRefDrawer({ root, toggleButton, onInsert }: Options): RefDrawer {
  const search = root.querySelector<HTMLInputElement>('.ref-search')!;
  const body = root.querySelector<HTMLElement>('.ref-body')!;
  const empty = root.querySelector<HTMLElement>('.ref-empty')!;
  let built = false;

  // Rendering ~250 KaTeX snippets is deferred until first open.
  function build(): void {
    built = true;
    body.replaceChildren(
      ...cheatsheet.map((section) => {
        const el = document.createElement('section');
        el.className = 'ref-section';
        el.dataset.title = section.title.toLowerCase();
        el.innerHTML = `<h3 class="microlabel">${section.title}</h3>${section.intro ? `<p class="ref-intro"></p>` : ''}<div class="ref-grid${section.display ? ' wide' : ''}"></div>`;
        if (section.intro) el.querySelector('.ref-intro')!.textContent = section.intro;
        el.querySelector('.ref-grid')!.append(
          ...section.items.map((item) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'ref-item';
            btn.dataset.search = `${item.tex} ${item.note ?? ''}`.toLowerCase();
            btn.title = `Insert ${item.tex}`;
            btn.innerHTML = `<span class="ref-glyph">${katex.renderToString(item.tex, { displayMode: false, throwOnError: false })}</span><code></code>${item.note ? '<span class="ref-note"></span>' : ''}`;
            btn.querySelector('code')!.textContent = item.tex;
            if (item.note) btn.querySelector('.ref-note')!.textContent = item.note;
            if (section.display) btn.querySelector('.ref-glyph')!.classList.add('display');
            btn.addEventListener('click', () => onInsert(item.tex));
            return btn;
          }),
        );
        return el;
      }),
    );
  }

  function filter(): void {
    const q = search.value.trim().toLowerCase();
    let any = false;
    body.querySelectorAll<HTMLElement>('.ref-section').forEach((section) => {
      const titleHit = section.dataset.title!.includes(q);
      let shown = 0;
      section.querySelectorAll<HTMLElement>('.ref-item').forEach((item) => {
        const hit = !q || titleHit || item.dataset.search!.includes(q);
        item.hidden = !hit;
        if (hit) shown++;
      });
      section.hidden = shown === 0;
      any ||= shown > 0;
    });
    empty.hidden = any;
  }

  function open(): void {
    if (!built) build();
    root.classList.add('open');
    root.inert = false;
    toggleButton.setAttribute('aria-expanded', 'true');
    search.focus();
  }

  function close(): void {
    root.classList.remove('open');
    root.inert = true;
    toggleButton.setAttribute('aria-expanded', 'false');
  }

  const isOpen = () => root.classList.contains('open');

  root.inert = true;
  search.addEventListener('input', filter);
  root.querySelector('.ref-close')!.addEventListener('click', () => {
    close();
    toggleButton.focus();
  });
  root.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      close();
      toggleButton.focus();
    }
  });

  return {
    toggle: () => (isOpen() ? close() : open()),
    close,
  };
}
