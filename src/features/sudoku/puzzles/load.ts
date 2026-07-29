import {
  getConflictIndices,
  parseBoard,
  type Difficulty,
  type PuzzleDefinition,
} from "../engine/index.ts";
import {
  SUDOKU_PUZZLE_BUNDLE_VERSION,
  type SudokuPuzzleBundle,
} from "./prepare.ts";

export const SUDOKU_PUZZLES_PER_DIFFICULTY = 100;

const DIFFICULTIES: readonly Difficulty[] = [
  "easy",
  "medium",
  "hard",
  "expert",
];
const DIFFICULTY_SET = new Set<Difficulty>(DIFFICULTIES);
const PUZZLE_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const CANONICAL_PUZZLE_PATTERN = /^[1-9.]{81}$/;
const SOLUTION_PATTERN = /^[1-9]{81}$/;

export type PuzzleBundleLoadIssueCode =
  | "invalid-bundle"
  | "invalid-version"
  | "invalid-puzzles"
  | "invalid-entry"
  | "duplicate-id"
  | "duplicate-puzzle"
  | "invalid-difficulty-count";

export interface PuzzleBundleLoadIssue {
  code: PuzzleBundleLoadIssueCode;
  index: number | null;
  id: string | null;
  difficulty?: Difficulty;
  actual?: number;
  expected?: number;
}

export interface PuzzleBundleLoadResult {
  valid: boolean;
  issues: readonly PuzzleBundleLoadIssue[];
  bundle: SudokuPuzzleBundle | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasExactKeys(
  value: Record<string, unknown>,
  expectedKeys: readonly string[],
): boolean {
  const keys = Object.keys(value).sort();
  const sortedExpectedKeys = [...expectedKeys].sort();
  return (
    keys.length === sortedExpectedKeys.length &&
    keys.every((key, index) => key === sortedExpectedKeys[index])
  );
}

function isLightweightValidDefinition(
  value: unknown,
): value is PuzzleDefinition {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, ["difficulty", "id", "puzzle", "solution"]) ||
    typeof value.id !== "string" ||
    !PUZZLE_ID_PATTERN.test(value.id) ||
    !DIFFICULTY_SET.has(value.difficulty as Difficulty) ||
    typeof value.puzzle !== "string" ||
    !CANONICAL_PUZZLE_PATTERN.test(value.puzzle) ||
    typeof value.solution !== "string" ||
    !SOLUTION_PATTERN.test(value.solution)
  ) {
    return false;
  }

  const puzzle = parseBoard(value.puzzle);
  const solution = parseBoard(value.solution);
  if (
    puzzle === null ||
    solution === null ||
    getConflictIndices(solution).length > 0
  ) {
    return false;
  }

  return puzzle.every(
    (cell, index) => cell === null || cell === solution[index],
  );
}

function invalidEnvelope(
  code: "invalid-bundle" | "invalid-version" | "invalid-puzzles",
): PuzzleBundleLoadResult {
  return {
    valid: false,
    issues: [{ code, index: null, id: null }],
    bundle: null,
  };
}

export function loadSudokuPuzzleBundle(
  value: unknown,
): PuzzleBundleLoadResult {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, ["puzzles", "version"])
  ) {
    return invalidEnvelope("invalid-bundle");
  }
  if (value.version !== SUDOKU_PUZZLE_BUNDLE_VERSION) {
    return invalidEnvelope("invalid-version");
  }
  if (!Array.isArray(value.puzzles)) {
    return invalidEnvelope("invalid-puzzles");
  }

  const issues: PuzzleBundleLoadIssue[] = [];
  const puzzles: PuzzleDefinition[] = [];
  const seenIds = new Set<string>();
  const seenPuzzles = new Set<string>();
  const counts: Record<Difficulty, number> = {
    easy: 0,
    medium: 0,
    hard: 0,
    expert: 0,
  };

  value.puzzles.forEach((candidate, index) => {
    const id =
      isRecord(candidate) && typeof candidate.id === "string"
        ? candidate.id
        : null;

    if (!isLightweightValidDefinition(candidate)) {
      issues.push({ code: "invalid-entry", index, id });
      return;
    }

    if (seenIds.has(candidate.id)) {
      issues.push({ code: "duplicate-id", index, id: candidate.id });
    }
    if (seenPuzzles.has(candidate.puzzle)) {
      issues.push({ code: "duplicate-puzzle", index, id: candidate.id });
    }

    seenIds.add(candidate.id);
    seenPuzzles.add(candidate.puzzle);
    counts[candidate.difficulty] += 1;
    puzzles.push(candidate);
  });

  for (const difficulty of DIFFICULTIES) {
    if (counts[difficulty] !== SUDOKU_PUZZLES_PER_DIFFICULTY) {
      issues.push({
        code: "invalid-difficulty-count",
        index: null,
        id: null,
        difficulty,
        actual: counts[difficulty],
        expected: SUDOKU_PUZZLES_PER_DIFFICULTY,
      });
    }
  }

  if (issues.length > 0) {
    return { valid: false, issues, bundle: null };
  }

  return {
    valid: true,
    issues: [],
    bundle: {
      version: SUDOKU_PUZZLE_BUNDLE_VERSION,
      puzzles,
    },
  };
}
