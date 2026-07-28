import {
  serializeBoard,
  solveLogically,
  validatePuzzleDefinition,
  type Difficulty,
  type PuzzleDefinition,
  type PuzzleValidationIssue,
} from "../engine/index.ts";

export const SUDOKU_PUZZLE_SOURCE_VERSION = 1;
export const SUDOKU_PUZZLE_BUNDLE_VERSION = 1;

const DIFFICULTIES: readonly Difficulty[] = [
  "easy",
  "medium",
  "hard",
  "expert",
];

const DIFFICULTY_RANK = new Map(
  DIFFICULTIES.map((difficulty, index) => [difficulty, index]),
);

export type PuzzlePreparationIssueCode =
  | PuzzleValidationIssue
  | "invalid-source"
  | "invalid-version"
  | "invalid-puzzles"
  | "duplicate-id"
  | "duplicate-puzzle"
  | "logical-unsolved"
  | "difficulty-mismatch";

export interface PuzzlePreparationIssue {
  code: PuzzlePreparationIssueCode;
  index: number | null;
  id: string | null;
  actualDifficulty?: Difficulty | null;
}

export interface PuzzlePreparationSummary {
  total: number;
  accepted: number;
  rejected: number;
  byDifficulty: Readonly<Record<Difficulty, number>>;
}

export interface SudokuPuzzleSource {
  version: typeof SUDOKU_PUZZLE_SOURCE_VERSION;
  puzzles: readonly PuzzleDefinition[];
}

export interface SudokuPuzzleBundle {
  version: typeof SUDOKU_PUZZLE_BUNDLE_VERSION;
  puzzles: readonly PuzzleDefinition[];
}

export interface PuzzlePreparationResult {
  valid: boolean;
  issues: readonly PuzzlePreparationIssue[];
  summary: PuzzlePreparationSummary;
  bundle: SudokuPuzzleBundle | null;
}

function createDifficultyCounts(): Record<Difficulty, number> {
  return {
    easy: 0,
    medium: 0,
    hard: 0,
    expert: 0,
  };
}

function createEmptyResult(
  code: "invalid-source" | "invalid-version" | "invalid-puzzles",
): PuzzlePreparationResult {
  return {
    valid: false,
    issues: [{ code, index: null, id: null }],
    summary: {
      total: 0,
      accepted: 0,
      rejected: 0,
      byDifficulty: createDifficultyCounts(),
    },
    bundle: null,
  };
}

function getCandidateId(value: unknown): string | null {
  if (typeof value !== "object" || value === null || !("id" in value)) {
    return null;
  }

  return typeof value.id === "string" ? value.id : null;
}

function comparePuzzles(
  left: PuzzleDefinition,
  right: PuzzleDefinition,
): number {
  const difficultyDifference =
    (DIFFICULTY_RANK.get(left.difficulty) ?? 0) -
    (DIFFICULTY_RANK.get(right.difficulty) ?? 0);

  if (difficultyDifference !== 0) return difficultyDifference;
  if (left.id < right.id) return -1;
  if (left.id > right.id) return 1;
  return 0;
}

export function prepareSudokuPuzzleBundle(
  value: unknown,
): PuzzlePreparationResult {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return createEmptyResult("invalid-source");
  }
  if (
    !("version" in value) ||
    value.version !== SUDOKU_PUZZLE_SOURCE_VERSION
  ) {
    return createEmptyResult("invalid-version");
  }
  if (!("puzzles" in value) || !Array.isArray(value.puzzles)) {
    return createEmptyResult("invalid-puzzles");
  }

  const issues: PuzzlePreparationIssue[] = [];
  const accepted: PuzzleDefinition[] = [];
  const seenIds = new Set<string>();
  const seenPuzzles = new Set<string>();
  const difficultyCounts = createDifficultyCounts();

  value.puzzles.forEach((candidate, index) => {
    const id = getCandidateId(candidate);
    const validation = validatePuzzleDefinition(candidate);
    const entryIssues: PuzzlePreparationIssue[] = validation.issues.map(
      (code) => ({ code, index, id }),
    );

    if (id !== null && seenIds.has(id)) {
      entryIssues.push({ code: "duplicate-id", index, id });
    }

    const canonicalPuzzle =
      validation.puzzle === null
        ? null
        : serializeBoard(validation.puzzle);
    if (
      canonicalPuzzle !== null &&
      seenPuzzles.has(canonicalPuzzle)
    ) {
      entryIssues.push({ code: "duplicate-puzzle", index, id });
    }

    if (id !== null) seenIds.add(id);
    if (canonicalPuzzle !== null) seenPuzzles.add(canonicalPuzzle);

    if (
      validation.valid &&
      validation.puzzle !== null &&
      validation.solution !== null &&
      canonicalPuzzle !== null &&
      entryIssues.length === 0
    ) {
      const logicalResult = solveLogically(validation.puzzle);
      const difficulty = (candidate as PuzzleDefinition).difficulty;

      if (logicalResult.status !== "solved") {
        entryIssues.push({ code: "logical-unsolved", index, id });
      } else if (logicalResult.difficulty !== difficulty) {
        entryIssues.push({
          code: "difficulty-mismatch",
          index,
          id,
          actualDifficulty: logicalResult.difficulty,
        });
      } else {
        const definition = candidate as PuzzleDefinition;
        accepted.push({
          id: definition.id,
          difficulty,
          puzzle: canonicalPuzzle,
          solution: serializeBoard(validation.solution),
        });
        difficultyCounts[difficulty] += 1;
      }
    }

    issues.push(...entryIssues);
  });

  const summary: PuzzlePreparationSummary = {
    total: value.puzzles.length,
    accepted: accepted.length,
    rejected: value.puzzles.length - accepted.length,
    byDifficulty: difficultyCounts,
  };

  if (issues.length > 0) {
    return { valid: false, issues, summary, bundle: null };
  }

  return {
    valid: true,
    issues: [],
    summary,
    bundle: {
      version: SUDOKU_PUZZLE_BUNDLE_VERSION,
      puzzles: accepted.sort(comparePuzzles),
    },
  };
}
