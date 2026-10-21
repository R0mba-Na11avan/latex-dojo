# LaTeX Dojo

Practice writing LaTeX math. A rendered target equation sits on the right; write the source on the left, watch it render live, and submit when it looks the same.

**Live:** https://r0mba-na11avan.github.io/latex-dojo/

## How matching works

Your input and the target are both rendered with KaTeX and the outputs are compared, so equivalent source passes: `x^2` matches `x^{2}`, `\frac` matches `\dfrac`, and thin spaces (`\,` `\;` `\!`) are ignored. Larger spacing like `\quad` still counts.

## Run locally

```sh
npm install
npm run dev     # dev server
npm test        # match rules + every problem renders
npm run build   # static build in dist/
```

## Adding problems

Add an entry to `src/problems.json`:

```json
{ "id": "int-13", "title": "Short name", "topic": "Integrals", "difficulty": "medium", "tex": "\\int_0^1 x \\, dx" }
```

`id` must be unique (saved progress is keyed by it). `difficulty` is `easy`, `medium`, or `hard`. Run `npm test` to check it renders and doesn't duplicate an existing problem.

## Deploy

Pushes to `main` build, test, and deploy to GitHub Pages via `.github/workflows/deploy.yml`.

## License

MIT
