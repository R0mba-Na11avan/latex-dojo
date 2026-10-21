export interface RefItem {
  /** LaTeX source; rendered and inserted as-is. */
  tex: string;
  note?: string;
}

export interface RefSection {
  title: string;
  /** Short explanation shown under the heading. */
  intro?: string;
  items: RefItem[];
  /** Render entries in display style (big operators, matrices). */
  display?: boolean;
}

const symbols = (list: string) => list.split(' ').map((tex) => ({ tex }));

export const cheatsheet: RefSection[] = [
  {
    title: 'Superscripts & subscripts',
    intro: 'Braces group more than one character: x^{10}, not x^10.',
    items: [
      { tex: 'x^2', note: 'power' },
      { tex: 'x_i', note: 'index' },
      { tex: 'x_i^2', note: 'both' },
      { tex: 'x^{10}', note: 'grouped' },
      { tex: 'a_{ij}', note: 'grouped' },
      { tex: "f'(x)", note: 'prime' },
      { tex: 'e^{-x^2}', note: 'nested' },
      { tex: '{}^{14}C', note: 'pre-script' },
    ],
  },
  {
    title: 'Greek lowercase',
    items: symbols(
      '\\alpha \\beta \\gamma \\delta \\epsilon \\varepsilon \\zeta \\eta \\theta \\vartheta \\iota \\kappa \\lambda \\mu \\nu \\xi \\pi \\rho \\sigma \\tau \\upsilon \\phi \\varphi \\chi \\psi \\omega',
    ),
  },
  {
    title: 'Greek uppercase',
    intro: 'Only letters that differ from Latin have commands (no \\Alpha).',
    items: symbols('\\Gamma \\Delta \\Theta \\Lambda \\Xi \\Pi \\Sigma \\Upsilon \\Phi \\Psi \\Omega'),
  },
  {
    title: 'Fractions & roots',
    items: [
      { tex: '\\frac{a}{b}', note: 'fraction' },
      { tex: '\\dfrac{a}{b}', note: 'display size' },
      { tex: '\\tfrac{a}{b}', note: 'text size' },
      { tex: '\\cfrac{1}{1+\\cfrac{1}{x}}', note: 'continued' },
      { tex: '\\binom{n}{k}', note: 'binomial' },
      { tex: '\\sqrt{x}', note: 'square root' },
      { tex: '\\sqrt[n]{x}', note: 'nth root' },
    ],
  },
  {
    title: 'Operators',
    items: symbols('+ - \\pm \\mp \\times \\div \\cdot \\circ \\ast \\star \\bullet \\oplus \\otimes \\setminus'),
  },
  {
    title: 'Relations',
    items: symbols(
      '= \\ne < > \\le \\ge \\ll \\gg \\approx \\sim \\simeq \\cong \\equiv \\propto \\mid \\nmid \\parallel \\perp',
    ),
  },
  {
    title: 'Sets',
    items: symbols(
      '\\in \\notin \\subset \\subseteq \\supset \\supseteq \\cup \\cap \\emptyset \\varnothing \\mathbb{N} \\mathbb{Z} \\mathbb{Q} \\mathbb{R} \\mathbb{C}',
    ),
  },
  {
    title: 'Big operators',
    intro: 'Limits go in _ and ^; in display mode they sit above and below.',
    display: true,
    items: [
      { tex: '\\sum_{i=1}^{n}', note: 'sum' },
      { tex: '\\prod_{k=1}^{n}', note: 'product' },
      { tex: '\\int_a^b', note: 'integral' },
      { tex: '\\iint', note: 'double' },
      { tex: '\\iiint', note: 'triple' },
      { tex: '\\oint', note: 'contour' },
      { tex: '\\bigcup_{i}', note: 'union' },
      { tex: '\\bigcap_{i}', note: 'intersection' },
      { tex: '\\bigoplus_{i}', note: 'direct sum' },
      { tex: '\\lim_{x \\to 0}', note: 'limit' },
      { tex: '\\max_{x \\in S}', note: 'max' },
      { tex: '\\sum_{\\substack{i<n \\\\ j<m}}', note: 'two-line limits' },
    ],
  },
  {
    title: 'Functions',
    intro: 'Use the command so names are upright: \\sin x, not sin x.',
    items: [
      ...symbols(
        '\\sin \\cos \\tan \\sec \\csc \\cot \\arcsin \\arccos \\arctan \\sinh \\cosh \\tanh \\log \\ln \\exp \\det \\gcd \\deg \\dim \\ker \\Pr \\sup \\inf',
      ),
      { tex: '\\log_2 x', note: 'with base' },
      { tex: '\\operatorname{rank}', note: 'custom name' },
    ],
  },
  {
    title: 'Calculus',
    intro: 'A thin space \\, before dx is customary (the checker ignores it).',
    items: [
      { tex: '\\frac{dy}{dx}', note: 'derivative' },
      { tex: '\\frac{\\partial f}{\\partial x}', note: 'partial' },
      { tex: '\\frac{d^2 y}{dx^2}', note: 'second' },
      { tex: '\\int f(x) \\, dx', note: 'integral' },
      { tex: '\\partial', note: 'partial' },
      { tex: '\\nabla', note: 'nabla' },
      { tex: '\\infty', note: 'infinity' },
      { tex: '\\dot{x}', note: 'time deriv.' },
      { tex: '\\ddot{x}', note: 'second' },
    ],
  },
  {
    title: 'Delimiters',
    intro: '\\left and \\right grow to fit their contents.',
    items: [
      { tex: '(x)', note: 'parens' },
      { tex: '[x]', note: 'brackets' },
      { tex: '\\{x\\}', note: 'braces' },
      { tex: '|x|', note: 'abs' },
      { tex: '\\|x\\|', note: 'norm' },
      { tex: '\\langle x \\rangle', note: 'angle' },
      { tex: '\\lfloor x \\rfloor', note: 'floor' },
      { tex: '\\lceil x \\rceil', note: 'ceiling' },
      { tex: '\\left( \\frac{a}{b} \\right)', note: 'auto size' },
      { tex: '\\left. \\frac{a}{b} \\right|_{0}', note: 'one-sided' },
      { tex: '\\bigl( \\Bigl( \\biggl(', note: 'manual sizes' },
    ],
  },
  {
    title: 'Accents',
    items: [
      ...symbols('\\hat{x} \\bar{x} \\tilde{x} \\vec{x} \\dot{x} \\ddot{x} \\check{x} \\breve{x} \\acute{x} \\grave{x}'),
      { tex: '\\overline{xy}', note: 'wide bar' },
      { tex: '\\underline{xy}', note: 'underline' },
      { tex: '\\widehat{xyz}', note: 'wide hat' },
      { tex: '\\widetilde{xyz}', note: 'wide tilde' },
      { tex: '\\overrightarrow{AB}', note: 'vector' },
    ],
  },
  {
    title: 'Arrows',
    items: [
      ...symbols(
        '\\to \\gets \\leftrightarrow \\Rightarrow \\Leftarrow \\iff \\implies \\mapsto \\longrightarrow \\hookrightarrow \\twoheadrightarrow \\uparrow \\downarrow',
      ),
      { tex: '\\xrightarrow{f}', note: 'labeled' },
    ],
  },
  {
    title: 'Logic',
    items: symbols('\\forall \\exists \\exists! \\nexists \\neg \\land \\lor \\top \\bot \\vdash \\models \\therefore \\because'),
  },
  {
    title: 'Fonts',
    items: [
      { tex: '\\mathbb{R}', note: 'blackboard' },
      { tex: '\\mathbf{v}', note: 'bold' },
      { tex: '\\boldsymbol{\\alpha}', note: 'bold symbol' },
      { tex: '\\mathcal{L}', note: 'calligraphic' },
      { tex: '\\mathscr{F}', note: 'script' },
      { tex: '\\mathfrak{g}', note: 'fraktur' },
      { tex: '\\mathrm{d}x', note: 'upright' },
      { tex: '\\mathsf{T}', note: 'sans' },
      { tex: '\\text{if } x > 0', note: 'plain text' },
    ],
  },
  {
    title: 'Matrices & environments',
    intro: '& separates columns, \\\\ ends a row.',
    display: true,
    items: [
      { tex: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}', note: 'pmatrix' },
      { tex: '\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}', note: 'bmatrix' },
      { tex: '\\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix}', note: 'vmatrix' },
      { tex: '\\begin{Bmatrix} a & b \\\\ c & d \\end{Bmatrix}', note: 'Bmatrix' },
      { tex: '\\begin{cases} a & x > 0 \\\\ b & x \\le 0 \\end{cases}', note: 'cases' },
      { tex: '\\begin{aligned} a &= b \\\\ &= c \\end{aligned}', note: 'aligned' },
      { tex: '\\begin{array}{c|c} a & b \\\\ c & d \\end{array}', note: 'array' },
    ],
  },
  {
    title: 'Annotations',
    display: true,
    items: [
      { tex: '\\boxed{x}', note: 'box' },
      { tex: '\\cancel{x}', note: 'strike' },
      { tex: '\\overbrace{a+b}^{n}', note: 'overbrace' },
      { tex: '\\underbrace{a+b}_{n}', note: 'underbrace' },
      { tex: '\\overset{!}{=}', note: 'over' },
      { tex: '\\underset{x}{\\max}', note: 'under' },
    ],
  },
  {
    title: 'Dots & spacing',
    intro: 'Thin spaces (\\, \\: \\; \\!) are ignored when checking; \\quad is not.',
    items: [
      { tex: '\\ldots', note: 'low dots' },
      { tex: '\\cdots', note: 'centered' },
      { tex: '\\vdots', note: 'vertical' },
      { tex: '\\ddots', note: 'diagonal' },
      { tex: 'a\\,b', note: 'thin' },
      { tex: 'a\\;b', note: 'thick' },
      { tex: 'a\\quad b', note: 'quad' },
      { tex: 'a\\qquad b', note: 'qquad' },
      { tex: 'a\\!b', note: 'negative' },
    ],
  },
  {
    title: 'Misc symbols',
    items: symbols('\\hbar \\ell \\aleph \\Re \\Im \\wp \\angle \\triangle \\prime \\dagger \\checkmark 90^\\circ'),
  },
];
