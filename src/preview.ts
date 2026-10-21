import katex from 'katex';

/**
 * Live KaTeX preview. On a parse error the last valid render stays visible (dimmed)
 * and the error is shown beneath, so half-typed input doesn't flicker.
 */
export class Preview {
  private timer: number | undefined;
  private lastGood = '';

  constructor(
    private output: HTMLElement,
    private error: HTMLElement,
    private delay = 150,
  ) {}

  update(tex: string): void {
    window.clearTimeout(this.timer);
    this.timer = window.setTimeout(() => this.render(tex), this.delay);
  }

  /** Render immediately, e.g. when switching problems. */
  reset(tex = ''): void {
    window.clearTimeout(this.timer);
    this.lastGood = '';
    this.render(tex);
  }

  private render(tex: string): void {
    if (tex.trim() === '') {
      this.lastGood = '';
      this.output.innerHTML = '<span class="awaiting">AWAITING INPUT_</span>';
      this.output.classList.remove('stale');
      this.error.textContent = '';
      return;
    }
    try {
      this.lastGood = katex.renderToString(tex, { displayMode: true, throwOnError: true });
      this.output.innerHTML = this.lastGood;
      this.output.classList.remove('stale');
      this.error.textContent = '';
    } catch (e) {
      if (this.lastGood) this.output.innerHTML = this.lastGood;
      this.output.classList.toggle('stale', this.lastGood !== '');
      const msg = e instanceof Error ? e.message.replace(/^KaTeX parse error:\s*/, '') : String(e);
      this.error.textContent = `ERR // ${msg}`;
    }
  }
}
