import type {
  Difficulty,
  PuzzleDefinition,
} from "../engine/index.ts";
import {
  readStoredJson,
  writeStoredJson,
  type StorageLike,
} from "../../../storage/safe-storage.ts";

export const SUDOKU_PUZZLE_CYCLE_STORAGE_KEY =
  "online-games:sudoku:puzzle-cycle:v1";

export interface SudokuPuzzleCycle {
  version: 1;
  usedIds: Readonly<Record<Difficulty, readonly string[]>>;
}

const DIFFICULTIES: readonly Difficulty[] = [
  "easy",
  "medium",
  "hard",
  "expert",
];

export function createEmptySudokuPuzzleCycle(): SudokuPuzzleCycle {
  return {
    version: 1,
    usedIds: { easy: [], medium: [], hard: [], expert: [] },
  };
}

export function isSudokuPuzzleCycle(
  value: unknown,
  puzzles: readonly PuzzleDefinition[],
): value is SudokuPuzzleCycle {
  if (
    typeof value !== "object" ||
    value === null ||
    Object.keys(value).length !== 2 ||
    !("version" in value) ||
    value.version !== 1 ||
    !("usedIds" in value) ||
    typeof value.usedIds !== "object" ||
    value.usedIds === null ||
    Object.keys(value.usedIds).length !== DIFFICULTIES.length
  ) {
    return false;
  }

  const puzzleDifficulty = new Map(
    puzzles.map((puzzle) => [puzzle.id, puzzle.difficulty]),
  );
  const usedIds = value.usedIds as Record<string, unknown>;
  return DIFFICULTIES.every((difficulty) => {
    const ids = usedIds[difficulty];
    return (
      Array.isArray(ids) &&
      ids.length <= 100 &&
      new Set(ids).size === ids.length &&
      ids.every(
        (id) =>
          typeof id === "string" &&
          puzzleDifficulty.get(id) === difficulty,
      )
    );
  });
}

export function loadSudokuPuzzleCycle(
  storage: StorageLike,
  puzzles: readonly PuzzleDefinition[],
): SudokuPuzzleCycle {
  const value = readStoredJson(storage, SUDOKU_PUZZLE_CYCLE_STORAGE_KEY);
  return isSudokuPuzzleCycle(value, puzzles)
    ? value
    : createEmptySudokuPuzzleCycle();
}

export function selectSudokuPuzzle(
  storage: StorageLike,
  puzzles: readonly PuzzleDefinition[],
  difficulty: Difficulty,
  random: () => number,
): PuzzleDefinition {
  const candidates = puzzles.filter(
    (puzzle) => puzzle.difficulty === difficulty,
  );
  if (candidates.length === 0) {
    throw new RangeError(`No Sudoku puzzles for ${difficulty}.`);
  }

  const randomValue = random();
  if (
    !Number.isFinite(randomValue) ||
    randomValue < 0 ||
    randomValue >= 1
  ) {
    throw new RangeError("Sudoku puzzle random value must be in [0, 1).");
  }

  const cycle = loadSudokuPuzzleCycle(storage, puzzles);
  const used =
    cycle.usedIds[difficulty].length >= candidates.length
      ? []
      : cycle.usedIds[difficulty];
  const usedSet = new Set(used);
  const available = candidates.filter(
    (puzzle) => !usedSet.has(puzzle.id),
  );
  const selected =
    available[Math.floor(randomValue * available.length)];
  const next: SudokuPuzzleCycle = {
    version: 1,
    usedIds: {
      ...cycle.usedIds,
      [difficulty]: [...used, selected.id],
    },
  };
  writeStoredJson(storage, SUDOKU_PUZZLE_CYCLE_STORAGE_KEY, next);
  return selected;
}
