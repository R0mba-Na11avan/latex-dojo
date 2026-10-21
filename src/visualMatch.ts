import katex from 'katex';
import { stripThinSpacing } from './match';

/** Size the comparison renders at; TOLERANCE is in px at this size. */
const FONT_SIZE = 40;
const TOLERANCE = 1;

interface Mark {
  kind: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

let host: HTMLDivElement | undefined;

function getHost(): HTMLDivElement {
  if (!host) {
    host = document.createElement('div');
    host.setAttribute('aria-hidden', 'true');
    host.style.cssText = `position:absolute;left:-100000px;top:0;width:max-content;font-size:${FONT_SIZE}px;visibility:hidden;pointer-events:none`;
    document.body.append(host);
  }
  return host;
}

/** Every visible piece of ink in a render: glyphs, rules (borders) and SVG shapes, with positions. */
function collectMarks(root: HTMLElement): Mark[] {
  const marks: Mark[] = [];
  const push = (kind: string, r: DOMRect) => {
    if (r.width === 0 && r.height === 0) return;
    marks.push({ kind, x: r.left, y: r.top, w: r.width, h: r.height });
  };

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent ?? '';
      const style = getComputedStyle(node.parentElement!);
      const font = `${style.fontFamily}|${style.fontStyle}|${style.fontWeight}`;
      // Per character, so grouping of text into spans doesn't matter.
      for (let i = 0; i < text.length; i++) {
        if (/\s/.test(text[i])) continue;
        range.setStart(node, i);
        range.setEnd(node, i + 1);
        push(`t:${text[i]}|${font}`, range.getBoundingClientRect());
      }
      continue;
    }
    const el = node as Element;
    if (el instanceof SVGSVGElement) {
      const shape = [...el.querySelectorAll('path, line, rect')].map((p) => p.outerHTML).join('');
      push(`svg:${shape}`, el.getBoundingClientRect());
      walker.nextSibling(); // contents already captured
      continue;
    }
    if (el instanceof HTMLElement) {
      const s = getComputedStyle(el);
      const borders = ['Top', 'Right', 'Bottom', 'Left']
        .map((side) => (s.getPropertyValue(`border-${side.toLowerCase()}-style`) === 'none' ? 0 : parseFloat(s.getPropertyValue(`border-${side.toLowerCase()}-width`))))
        .map((w) => Math.round(w * 4) / 4);
      if (borders.some((w) => w > 0)) push(`b:${borders.join(',')}`, el.getBoundingClientRect());
    }
  }

  // Positions relative to the ink's own top-left, so invisible struts/margins don't matter.
  const minX = Math.min(...marks.map((m) => m.x));
  const minY = Math.min(...marks.map((m) => m.y));
  for (const m of marks) {
    m.x -= minX;
    m.y -= minY;
  }
  return marks.sort((a, b) => a.y - b.y || a.x - b.x || a.kind.localeCompare(b.kind));
}

function render(tex: string): Mark[] {
  const el = document.createElement('div');
  getHost().append(el);
  try {
    katex.render(stripThinSpacing(tex), el, { displayMode: true, throwOnError: true });
    return collectMarks(el);
  } finally {
    el.remove();
  }
}

const close = (a: number, b: number) => Math.abs(a - b) <= TOLERANCE;

/**
 * Browser-only visual comparison: true when both renders put the same ink in the same places.
 * Catches equivalents whose KaTeX markup is structured differently, e.g. `{R^\mu}_\nu` vs `R^\mu{}_\nu`.
 */
export function visualMatches(attempt: string, target: string): boolean {
  if (attempt.trim() === '') return false;
  let a: Mark[];
  let b: Mark[];
  try {
    a = render(attempt);
    b = render(target);
  } catch {
    return false;
  }
  if (a.length !== b.length || a.length === 0) return false;
  // Sorting can interleave near-equal marks differently, so match each mark against any unused one.
  const used = new Set<number>();
  return a.every((m) => {
    const j = b.findIndex(
      (n, k) => !used.has(k) && n.kind === m.kind && close(n.x, m.x) && close(n.y, m.y) && close(n.w, m.w) && close(n.h, m.h),
    );
    if (j === -1) return false;
    used.add(j);
    return true;
  });
}
