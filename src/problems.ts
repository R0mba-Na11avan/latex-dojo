import bank from './problems.json';

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Problem {
  id: string;
  title: string;
  topic: string;
  difficulty: Difficulty;
  tex: string;
  /** 1-based position in the full bank, used as the exercise number. */
  number: number;
}

const raw = bank as Omit<Problem, 'number'>[];
const DIFFICULTY_RANK: Record<Difficulty, number> = { easy: 0, medium: 1, hard: 2 };

/** Topics in the order they first appear in problems.json. */
export const topics: string[] = [...new Set(raw.map((p) => p.topic))];

/**
 * Bank order: by topic, then easy to hard, then file order.
 * Exercise numbers follow this order; progress is keyed by `id`, so renumbering is harmless.
 */
export const problems: Problem[] = raw
  .map((p, i) => ({ p, i }))
  .sort(
    (a, b) =>
      topics.indexOf(a.p.topic) - topics.indexOf(b.p.topic) ||
      DIFFICULTY_RANK[a.p.difficulty] - DIFFICULTY_RANK[b.p.difficulty] ||
      a.i - b.i,
  )
  .map(({ p }, i) => ({ ...p, number: i + 1 }));

export interface Filter {
  difficulty: Difficulty | 'all';
  topic: string | 'all';
}

export function applyFilter(filter: Filter): Problem[] {
  return problems.filter(
    (p) =>
      (filter.difficulty === 'all' || p.difficulty === filter.difficulty) &&
      (filter.topic === 'all' || p.topic === filter.topic),
  );
}

export const pad = (n: number) => String(n).padStart(3, '0');
