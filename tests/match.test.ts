import { describe, expect, it } from 'vitest';
import { matches, stripThinSpacing, canonical } from '../src/match';
import problems from '../src/problems.json';

describe('stripThinSpacing', () => {
  it('removes thin spaces but keeps row breaks', () => {
    expect(stripThinSpacing('a\\,b\\;c\\!d')).toBe('abcd');
    expect(stripThinSpacing('a \\\\ b')).toBe('a \\\\ b');
    expect(stripThinSpacing('a\\\\\\,b')).toBe('a\\\\b');
    expect(stripThinSpacing('a\\thinspace b')).toBe('a b');
    expect(stripThinSpacing('\\thinspacex')).toBe('\\thinspacex');
  });
});

describe('matches', () => {
  const same: [string, string][] = [
    ['x^2', 'x^{2}'],
    ['x^2dx', 'x^2\\,dx'],
    ['\\frac{1}{2}', '\\dfrac{1}{2}'],
    ['{a}+b', 'a+b'],
    ['x_1^2', 'x^2_1'],
    ['\\frac12', '\\frac{1}{2}'],
    ['a  +   b', 'a+b'],
    ['\\int_0^1 f(x)\\,dx', '\\int_{0}^{1}f(x)dx'],
    ['e^{i\\pi}+1=0', 'e^{i \\pi} + 1 = 0'],
  ];
  it.each(same)('%s matches %s', (a, b) => expect(matches(a, b)).toBe(true));

  const different: [string, string][] = [
    ['a\\quad b', 'ab'],
    ['\\alpha', 'a'],
    ['x^2', 'x_2'],
    ['\\sin x', 'sin x'],
    ['\\frac{1}{2}', '1/2'],
    ['(x)', '[x]'],
  ];
  it.each(different)('%s differs from %s', (a, b) => expect(matches(a, b)).toBe(false));

  it('rejects invalid and empty input', () => {
    expect(matches('\\frac{1}{', '\\frac{1}{2}')).toBe(false);
    expect(matches('', '')).toBe(false);
    expect(matches('   ', 'x')).toBe(false);
  });
});

describe('problem bank', () => {
  it('has unique ids', () => {
    const ids = problems.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
  it('has no two problems that render identically', () => {
    const seen = new Map<string, string>();
    for (const p of problems) {
      const key = canonical(p.tex);
      expect(seen.get(key), `${p.id} duplicates ${seen.get(key)}`).toBeUndefined();
      seen.set(key, p.id);
    }
  });
  it.each(problems.map((p) => [p.id, p.tex]))('%s renders and matches itself', (_id, tex) => {
    expect(() => canonical(tex)).not.toThrow();
    expect(matches(tex, tex)).toBe(true);
  });
});
