const KEY = 'latex-practice:progress:v1';

interface Stored {
  solved: string[];
  streak: number;
  best: number;
}

function load(): Stored {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const data = JSON.parse(raw) as Partial<Stored>;
      return { solved: data.solved ?? [], streak: data.streak ?? 0, best: data.best ?? 0 };
    }
  } catch {
    // Storage unavailable or corrupt: start fresh.
  }
  return { solved: [], streak: 0, best: 0 };
}

/**
 * Solved set and streak, persisted per browser.
 * Streak = problems solved in a row without revealing the answer.
 */
export class Progress {
  private data = load();
  private solvedSet = new Set(this.data.solved);

  isSolved(id: string): boolean {
    return this.solvedSet.has(id);
  }

  get solvedCount(): number {
    return this.solvedSet.size;
  }

  get streak(): number {
    return this.data.streak;
  }

  get best(): number {
    return this.data.best;
  }

  recordSolve(id: string, revealed: boolean): void {
    this.solvedSet.add(id);
    this.data.streak = revealed ? 0 : this.data.streak + 1;
    this.data.best = Math.max(this.data.best, this.data.streak);
    this.save();
  }

  breakStreak(): void {
    this.data.streak = 0;
    this.save();
  }

  private save(): void {
    this.data.solved = [...this.solvedSet];
    try {
      localStorage.setItem(KEY, JSON.stringify(this.data));
    } catch {
      // Ignore: progress just won't persist.
    }
  }
}
