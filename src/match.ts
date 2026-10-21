import katex from 'katex';

// Thin spacing commands that should not cause a mismatch. \quad and friends still count.
const THIN_SYMBOLS = new Set([',', ':', ';', '!', '>', ' ']);
const THIN_WORDS = /^(thinspace|medspace|thickspace|negthinspace|negmedspace|negthickspace)(?![a-zA-Z])/;

/** Remove thin spacing commands, leaving `\\` row breaks intact. */
export function stripThinSpacing(tex: string): string {
  let out = '';
  for (let i = 0; i < tex.length; i++) {
    const c = tex[i];
    if (c !== '\\') {
      out += c;
      continue;
    }
    const next = tex[i + 1];
    if (next === '\\') {
      out += '\\\\';
      i++;
    } else if (next !== undefined && THIN_SYMBOLS.has(next)) {
      i++;
    } else {
      const word = THIN_WORDS.exec(tex.slice(i + 1));
      if (word) i += word[0].length;
      else out += c;
    }
  }
  return out;
}

export function renderHtml(tex: string): string {
  return katex.renderToString(tex, { displayMode: true, output: 'html', throwOnError: true });
}

interface Node {
  tag: string;
  attrs: string;
  classes: string[];
  children: (Node | string)[];
}

const TOKEN = /<\/([a-zA-Z]+)\s*>|<([a-zA-Z]+)((?:\s+[^\s=>\/]+(?:=(?:"[^"]*"|'[^']*'|[^\s>]+))?)*)\s*(\/?)>|([^<]+)/g;

/** Minimal parser for KaTeX's well-formed HTML output. */
function parse(html: string): Node {
  const root: Node = { tag: 'root', attrs: '', classes: [], children: [] };
  const stack = [root];
  for (const m of html.matchAll(TOKEN)) {
    const top = stack[stack.length - 1];
    if (m[1]) {
      stack.pop();
    } else if (m[2]) {
      const rawAttrs = m[3] ?? '';
      const cls = /\sclass="([^"]*)"/.exec(rawAttrs)?.[1] ?? '';
      const attrs = rawAttrs
        .replace(/\sclass="[^"]*"/, '')
        .replace(/\saria-hidden="[^"]*"/, '')
        .trim();
      const node: Node = { tag: m[2], attrs, classes: cls.split(/\s+/).filter(Boolean), children: [] };
      top.children.push(node);
      if (!m[4]) stack.push(node);
    } else if (m[5]) {
      top.children.push(m[5]);
    }
  }
  return root;
}

/** Drop wrapper spans that add no visual information (e.g. the `mord` around a braced group). */
function simplify(node: Node): Node | string {
  const children = node.children.map((c) => (typeof c === 'string' ? c : simplify(c)));
  const only = children.length === 1 ? children[0] : undefined;
  if (
    node.tag === 'span' &&
    node.attrs === '' &&
    only !== undefined &&
    typeof only !== 'string' &&
    node.classes.every((c) => only.classes.includes(c))
  ) {
    return only;
  }
  return { ...node, children };
}

function serialize(node: Node | string): string {
  if (typeof node === 'string') return node;
  const cls = [...node.classes].sort().join(' ');
  return `<${node.tag} ${cls}|${node.attrs}>${node.children.map(serialize).join('')}</${node.tag}>`;
}

/** Canonical form of how `tex` renders; throws on invalid LaTeX. */
export function canonical(tex: string): string {
  return serialize(simplify(parse(renderHtml(stripThinSpacing(tex)))));
}

/** True when `attempt` renders the same as `target`. Invalid attempts never match. */
export function matches(attempt: string, target: string): boolean {
  if (attempt.trim() === '') return false;
  try {
    return canonical(attempt) === canonical(target);
  } catch {
    return false;
  }
}
