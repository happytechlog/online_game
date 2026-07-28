import {
  assertBoard,
  getCandidates,
  getConflictIndices,
  isCompleteBoard,
  matchesSolution,
  parseBoard,
} from "./board.ts";
import {
  type Board,
  type Difficulty,
  type Digit,
  type PuzzleDefinition,
  type PuzzleValidationIssue,
  type PuzzleValidationResult,
} from "./types.ts";

const DIFFICULTIES = new Set<Difficulty>([
  "easy",
  "medium",
  "hard",
  "expert",
]);

export interface SolutionSearchResult {
  count: 0 | 1 | 2;
  solution: Board | null;
}

function findBestEmptyCell(
  board: Board,
): { index: number; candidates: readonly Digit[] } | null {
  let best: { index: number; candidates: readonly Digit[] } | null = null;

  for (let index = 0; index < board.length; index += 1) {
    if (board[index] !== null) continue;
    const candidates = getCandidates(board, index);

    if (candidates.length === 0) return { index, candidates };
    if (best === null || candidates.length < best.candidates.length) {
      best = { index, candidates };
      if (candidates.length === 1) break;
    }
  }

  return best;
}

export function searchSolutions(
  board: Board,
  maximumSolutions = 2,
): SolutionSearchResult {
  assertBoard(board);
  if (
    !Number.isInteger(maximumSolutions) ||
    maximumSolutions < 1 ||
    maximumSolutions > 2
  ) {
    throw new RangeError("maximumSolutions must be 1 or 2.");
  }
  if (getConflictIndices(board).length > 0) {
    return { count: 0, solution: null };
  }

  let count = 0;
  let solution: Board | null = null;

  const visit = (current: Board): void => {
    if (count >= maximumSolutions) return;
    const empty = findBestEmptyCell(current);

    if (empty === null) {
      count += 1;
      solution ??= current;
      return;
    }
    if (empty.candidates.length === 0) return;

    for (const digit of empty.candidates) {
      const next = [...current];
      next[empty.index] = digit;
      visit(next);
      if (count >= maximumSolutions) return;
    }
  };

  visit([...board]);
  return { count: Math.min(count, 2) as 0 | 1 | 2, solution };
}

export function validatePuzzleDefinition(
  value: unknown,
): PuzzleValidationResult {
  const issues: PuzzleValidationIssue[] = [];
  if (typeof value !== "object" || value === null) {
    return {
      valid: false,
      issues: ["invalid-id", "invalid-difficulty", "invalid-puzzle", "invalid-solution"],
      puzzle: null,
      solution: null,
    };
  }

  const candidate = value as Partial<PuzzleDefinition>;
  if (typeof candidate.id !== "string" || !/^[a-z0-9][a-z0-9-]*$/.test(candidate.id)) {
    issues.push("invalid-id");
  }
  if (
    typeof candidate.difficulty !== "string" ||
    !DIFFICULTIES.has(candidate.difficulty as Difficulty)
  ) {
    issues.push("invalid-difficulty");
  }

  const puzzle =
    typeof candidate.puzzle === "string" ? parseBoard(candidate.puzzle) : null;
  const solution =
    typeof candidate.solution === "string"
      ? parseBoard(candidate.solution)
      : null;
  if (puzzle === null) issues.push("invalid-puzzle");
  if (solution === null) issues.push("invalid-solution");

  if (puzzle !== null && solution !== null) {
    if (!solution.every((cell) => cell !== null)) {
      issues.push("solution-incomplete");
    } else if (!isCompleteBoard(solution)) {
      issues.push("solution-conflict");
    }

    if (puzzle.some(
      (cell, index) => cell !== null && cell !== solution[index],
    )) {
      issues.push("clue-mismatch");
    }

    const search = searchSolutions(puzzle);
    if (search.count === 0) {
      issues.push("no-solution");
    } else if (search.count > 1) {
      issues.push("multiple-solutions");
    } else if (
      search.solution !== null &&
      !matchesSolution(search.solution, solution)
    ) {
      issues.push("solution-mismatch");
    }
  }

  return {
    valid: issues.length === 0,
    issues,
    puzzle,
    solution,
  };
}
