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

export const problems: Problem[] = (bank as Omit<Problem, 'number'>[]).map((p, i) => ({
  ...p,
  number: i + 1,
}));

export const topics: string[] = [...new Set(problems.map((p) => p.topic))];

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
