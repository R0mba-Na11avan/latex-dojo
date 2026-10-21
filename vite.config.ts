import { defineConfig } from 'vite';

export default defineConfig({
  // Relative asset paths so the build works from any static host subpath (e.g. GitHub Pages).
  base: './',
  build: {
    // KaTeX + CodeMirror make up most of the bundle; that's expected.
    chunkSizeWarningLimit: 800,
  },
});
