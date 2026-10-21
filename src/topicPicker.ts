import katex from 'katex';

/** Glyph shown in each topic's badge, rendered with KaTeX so it matches the math font. */
const TOPIC_ICONS: Record<string, string> = {
  all: '\\ast',
  Scripts: 'x^2',
  Greek: '\\alpha',
  Fractions: '\\tfrac{a}{b}',
  Roots: '\\sqrt{x}',
  Sums: '\\Sigma',
  Integrals: '\\int',
  Limits: '\\infty',
  Functions: 'f(x)',
  Delimiters: '\\langle\\rangle',
  Accents: '\\vec{v}',
  Sets: '\\in',
  Matrices: '\\left[\\begin{smallmatrix}a&b\\\\c&d\\end{smallmatrix}\\right]',
  Environments: '\\{',
  Fonts: '\\mathcal{F}',
  Arrows: '\\Rightarrow',
  Annotations: '\\cancel{x}',
  Logic: '\\forall',
  'Number Theory': '\\equiv',
  'Linear Algebra': '\\otimes',
  Probability: '\\mathbb{E}',
  Calculus: '\\partial',
  Physics: '\\hbar',
  Famous: 'e^{i\\pi}',
};

export const icon = (topic: string) =>
  `<span class="topic-icon" aria-hidden="true">${katex.renderToString(TOPIC_ICONS[topic] ?? '\\bullet', { throwOnError: false })}</span>`;

export interface TopicPicker {
  setValue(topic: string): void;
  /** Problem counts per topic under the current difficulty filter; topics with 0 are dimmed. */
  setCounts(counts: Map<string, number>, total: number): void;
}

interface Options {
  root: HTMLElement;
  topics: string[];
  onChange: (topic: string) => void;
}

/** Accessible single-select listbox replacing the native <select>, which can't be themed. */
export function createTopicPicker({ root, topics, onChange }: Options): TopicPicker {
  const values = ['all', ...topics];
  const label = (v: string) => (v === 'all' ? 'All topics' : v);
  let value = 'all';
  let active = 0;

  root.classList.add('picker');
  root.innerHTML = `
    <button type="button" class="picker-btn" id="topic-btn" aria-haspopup="listbox" aria-expanded="false" aria-labelledby="topic-label topic-btn"></button>
    <ul class="picker-list" id="topic-list" role="listbox" tabindex="-1" aria-labelledby="topic-label" hidden>
      ${values
        .map(
          (v, i) => `
        <li role="option" id="topic-opt-${i}" data-value="${v}" aria-selected="false">
          ${icon(v)}<span class="topic-name">${label(v)}</span><span class="topic-count"></span>
        </li>`,
        )
        .join('')}
    </ul>`;

  const btn = root.querySelector<HTMLButtonElement>('.picker-btn')!;
  const list = root.querySelector<HTMLUListElement>('.picker-list')!;
  const options = [...list.querySelectorAll<HTMLLIElement>('[role=option]')];

  function renderButton(): void {
    btn.innerHTML = `${icon(value)}<span class="topic-name">${label(value)}</span><span class="caret" aria-hidden="true"></span>`;
    options.forEach((o) => o.setAttribute('aria-selected', String(o.dataset.value === value)));
  }

  function highlight(i: number): void {
    active = (i + options.length) % options.length;
    options.forEach((o, j) => o.classList.toggle('active', j === active));
    list.setAttribute('aria-activedescendant', options[active].id);
    options[active].scrollIntoView({ block: 'nearest' });
  }

  function open(): void {
    list.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
    highlight(values.indexOf(value));
    list.focus();
    document.addEventListener('pointerdown', outside);
  }

  function close(refocus = true): void {
    list.hidden = true;
    btn.setAttribute('aria-expanded', 'false');
    document.removeEventListener('pointerdown', outside);
    if (refocus) btn.focus();
  }

  function outside(e: PointerEvent): void {
    if (!root.contains(e.target as Node)) close(false);
  }

  function choose(i: number): void {
    const next = values[i];
    close();
    if (next === value) return;
    value = next;
    renderButton();
    onChange(value);
  }

  btn.addEventListener('click', () => (list.hidden ? open() : close()));
  btn.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      open();
    }
  });

  list.addEventListener('click', (e) => {
    const opt = (e.target as HTMLElement).closest<HTMLLIElement>('[role=option]');
    if (opt) choose(options.indexOf(opt));
  });
  list.addEventListener('pointermove', (e) => {
    const opt = (e.target as HTMLElement).closest<HTMLLIElement>('[role=option]');
    if (opt && options.indexOf(opt) !== active) highlight(options.indexOf(opt));
  });
  list.addEventListener('keydown', (e) => {
    const keys: Record<string, () => void> = {
      ArrowDown: () => highlight(active + 1),
      ArrowUp: () => highlight(active - 1),
      Home: () => highlight(0),
      End: () => highlight(options.length - 1),
      Enter: () => choose(active),
      ' ': () => choose(active),
      Escape: () => close(),
      Tab: () => close(false),
    };
    const run = keys[e.key];
    if (run) {
      if (e.key !== 'Tab') e.preventDefault();
      run();
    } else if (e.key.length === 1 && /\S/.test(e.key)) {
      // Type-ahead: jump to the next topic starting with the typed letter.
      const ch = e.key.toLowerCase();
      for (let step = 1; step <= values.length; step++) {
        const i = (active + step) % values.length;
        if (label(values[i]).toLowerCase().startsWith(ch)) {
          highlight(i);
          break;
        }
      }
    }
  });

  renderButton();

  return {
    setValue(topic) {
      value = topic;
      renderButton();
    },
    setCounts(counts, total) {
      options.forEach((o) => {
        const v = o.dataset.value!;
        const n = v === 'all' ? total : (counts.get(v) ?? 0);
        o.querySelector('.topic-count')!.textContent = String(n).padStart(2, '0');
        o.classList.toggle('empty', n === 0);
      });
    },
  };
}
