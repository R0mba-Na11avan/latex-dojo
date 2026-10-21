/** Decorative, deterministic barcode SVG derived from a string. Not a real symbology. */
export function barcode(text: string, height = 28): string {
  let seed = 0;
  for (const ch of text) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0;
  const next = () => {
    seed = (seed * 1103515245 + 12345) >>> 0;
    return seed;
  };

  const bars: string[] = [];
  let x = 0;
  const guard = (at: number) => [`<rect x="${at}" width="1" height="${height}"/>`, `<rect x="${at + 2}" width="1" height="${height}"/>`];
  bars.push(...guard(x));
  x += 5;
  for (let i = 0; i < 26; i++) {
    const w = 1 + (next() % 3);
    bars.push(`<rect x="${x}" width="${w}" height="${height - 4}"/>`);
    x += w + 1 + (next() % 2);
  }
  bars.push(...guard(x));
  x += 3;
  return `<svg class="barcode" viewBox="0 0 ${x} ${height}" width="${x * 1.4}" height="${height}" preserveAspectRatio="none" aria-hidden="true" fill="currentColor">${bars.join('')}</svg>`;
}
