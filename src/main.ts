import 'katex/dist/katex.min.css';
import '@fontsource/archivo-black/400.css';
import '@fontsource/archivo/800-italic.css';
import '@fontsource/archivo/500.css';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/600.css';
import '@fontsource/noto-sans-jp/700.css';
import './styles.css';

import katex from 'katex';
import { createEditor, insertText, setText } from './editor';
import { createRefDrawer } from './refDrawer';
import { Preview } from './preview';
import { matches } from './match';
import { visualMatches } from './visualMatch';
import { Progress } from './progress';
import { barcode } from './barcode';
import { createTopicPicker } from './topicPicker';
import { applyFilter, pad, problems, topics, type Difficulty, type Filter, type Problem } from './problems';

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;

const DIFF_LABEL: Record<Difficulty, string> = { easy: 'EASY', medium: 'MED', hard: 'HARD' };
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

const progress = new Progress();
const filter: Filter = { difficulty: 'all', topic: 'all' };
let list: Problem[] = problems;
let current: Problem = problems[0];
let revealed = false;
let solvedNow = false;
let source = '';

const preview = new Preview($('output'), $('error'));
const editor = createEditor({
  parent: $('editor'),
  onChange: (text) => {
    source = text;
    preview.update(text);
  },
  onSubmit: submit,
});

// ---- rendering ---------------------------------------------------------

function renderStats(): void {
  $('stat-solved').textContent = `${pad(progress.solvedCount)}/${pad(problems.length)}`;
  $('stat-streak').textContent = String(progress.streak).padStart(2, '0');
  $('stat-best').textContent = String(progress.best).padStart(2, '0');
}

function renderCounter(): void {
  const pos = list.indexOf(current);
  $('counter').textContent = `${pad(pos + 1)} / ${pad(list.length)}`;
}

function setStatus(text: string, tone: 'neutral' | 'good' | 'bad' = 'neutral'): void {
  const el = $('status');
  el.textContent = text;
  el.dataset.tone = tone;
}

function load(problem: Problem): void {
  current = problem;
  revealed = false;
  solvedNow = false;

  const num = pad(problem.number);
  $('ex-num').textContent = num;
  $('target-label').textContent = `Target // EX-${num}`;
  $('ex-title').textContent = problem.title;
  $('ex-data').textContent =
    `Diff: ${DIFF_LABEL[problem.difficulty]} · Topic: ${problem.topic}` +
    (progress.isSolved(problem.id) ? ' · 済 Solved' : '');
  $('target-barcode').innerHTML = barcode(problem.id);
  katex.render(problem.tex, $('target'), { displayMode: true, throwOnError: false });

  $('reveal').hidden = true;
  $('reveal-src').textContent = problem.tex;
  $('reveal-btn').removeAttribute('disabled');

  $('burst').classList.remove('show');
  $('target-panel').classList.remove('jitter');
  $('next-btn').hidden = true;
  $('submit').hidden = false;
  setStatus('Status // Ready');

  setText(editor, '');
  source = '';
  preview.reset();
  renderCounter();
  editor.focus();
}

// ---- actions -----------------------------------------------------------

function submit(): void {
  if (solvedNow) return;
  // Fast structural check first; fall back to comparing actual glyph positions.
  if (matches(source, current.tex) || visualMatches(source, current.tex)) {
    solvedNow = true;
    progress.recordSolve(current.id, revealed);
    renderStats();
    $('ex-data').textContent = `Diff: ${DIFF_LABEL[current.difficulty]} · Topic: ${current.topic} · 済 Solved`;
    setStatus(revealed ? 'Match // Solved with reveal' : 'Match // Approved', 'good');
    const burst = $('burst');
    burst.classList.remove('show');
    void burst.offsetWidth; // restart animation
    burst.classList.add('show');
    $('submit').hidden = true;
    const next = $('next-btn');
    next.hidden = false;
    next.focus();
  } else {
    setStatus(source.trim() === '' ? 'Empty // Type something first' : 'Mismatch // Retry', 'bad');
    if (!reduceMotion.matches) {
      const panel = $('target-panel');
      panel.classList.remove('jitter');
      void panel.offsetWidth;
      panel.classList.add('jitter');
    }
  }
}

function step(delta: number): void {
  const pos = list.indexOf(current);
  load(list[(pos + delta + list.length) % list.length]);
}

function random(): void {
  if (list.length < 2) return;
  const unsolved = list.filter((p) => p !== current && !progress.isSolved(p.id));
  const pool = unsolved.length ? unsolved : list.filter((p) => p !== current);
  load(pool[Math.floor(Math.random() * pool.length)]);
}

function reveal(): void {
  if (revealed) return;
  revealed = true;
  $('reveal').hidden = false;
  $('reveal-btn').setAttribute('disabled', '');
  if (!solvedNow) {
    progress.breakStreak();
    renderStats();
  }
}

function refilter(): void {
  const next = applyFilter(filter);
  if (next.length === 0) {
    setStatus('Filter // No exercises match', 'bad');
    return;
  }
  list = next;
  updateTopicCounts();
  document.querySelectorAll<HTMLButtonElement>('.chip').forEach((chip) => {
    chip.setAttribute('aria-pressed', String(chip.dataset.difficulty === filter.difficulty));
  });
  if (list.includes(current)) renderCounter();
  else load(list[0]);
}

// ---- index drawer ------------------------------------------------------

function openIndex(): void {
  const tiles = $('tiles');
  tiles.replaceChildren(
    ...problems.map((p) => {
      const tile = document.createElement('button');
      tile.className = 'tile';
      if (!list.includes(p)) tile.classList.add('filtered');
      if (p === current) tile.classList.add('current');
      const solved = progress.isSolved(p.id);
      tile.innerHTML = `
        <span class="tile-num">${pad(p.number)}</span>
        <span class="tile-title"></span>
        <span class="tile-meta">${DIFF_LABEL[p.difficulty]} · ${p.topic}</span>
        ${solved ? '<span class="hanko" lang="ja">済</span>' : ''}`;
      tile.querySelector('.tile-title')!.textContent = p.title;
      tile.setAttribute('aria-label', `Exercise ${p.number}: ${p.title}${solved ? ', solved' : ''}`);
      tile.addEventListener('click', () => {
        if (!list.includes(p)) {
          filter.difficulty = 'all';
          filter.topic = 'all';
          topicPicker.setValue('all');
          refilter();
        }
        $<HTMLDialogElement>('index').close();
        load(p);
      });
      return tile;
    }),
  );
  $<HTMLDialogElement>('index').showModal();
}

// ---- wiring ------------------------------------------------------------

const topicPicker = createTopicPicker({
  root: $('topic'),
  topics,
  onChange: (topic) => {
    filter.topic = topic;
    refilter();
  },
});

function updateTopicCounts(): void {
  const pool = applyFilter({ difficulty: filter.difficulty, topic: 'all' });
  const counts = new Map<string, number>();
  for (const p of pool) counts.set(p.topic, (counts.get(p.topic) ?? 0) + 1);
  topicPicker.setCounts(counts, pool.length);
}
updateTopicCounts();

document.querySelectorAll<HTMLButtonElement>('.chip').forEach((chip) =>
  chip.addEventListener('click', () => {
    filter.difficulty = chip.dataset.difficulty as Filter['difficulty'];
    refilter();
  }),
);

$('prev').addEventListener('click', () => step(-1));
$('next').addEventListener('click', () => step(1));
$('next-btn').addEventListener('click', () => step(1));
$('random').addEventListener('click', random);
$('submit').addEventListener('click', submit);
$('reveal-btn').addEventListener('click', reveal);
$('open-index').addEventListener('click', openIndex);
$('close-index').addEventListener('click', () => $<HTMLDialogElement>('index').close());
$<HTMLDialogElement>('index').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) (e.currentTarget as HTMLDialogElement).close();
});

const refDrawer = createRefDrawer({
  root: $('ref'),
  toggleButton: $<HTMLButtonElement>('open-ref'),
  onInsert: (tex) => insertText(editor, tex),
});
$('open-ref').addEventListener('click', () => refDrawer.toggle());
document.addEventListener('keydown', (e) => {
  const t = e.target as HTMLElement;
  const typing = t.isContentEditable || t instanceof HTMLInputElement || t instanceof HTMLTextAreaElement;
  if (e.key === '?' && !typing) {
    e.preventDefault();
    refDrawer.toggle();
  }
});

renderStats();
load(problems.find((p) => !progress.isSolved(p.id)) ?? problems[0]);
