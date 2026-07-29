import type { Difficulty } from "../engine/index.ts";
import {
  readStoredJson,
  writeStoredJson,
  type StorageLike,
} from "../../../storage/safe-storage.ts";

export const SUDOKU_BEST_TIMES_STORAGE_KEY =
  "online-games:sudoku:best-times:v1";

export interface SudokuBestTimes {
  version: 1;
  times: Readonly<Record<Difficulty, number | null>>;
}

const DIFFICULTIES: readonly Difficulty[] = [
  "easy",
  "medium",
  "hard",
  "expert",
];

export function createEmptySudokuBestTimes(): SudokuBestTimes {
  return {
    version: 1,
    times: {
      easy: null,
      medium: null,
      hard: null,
      expert: null,
    },
  };
}

function isBestTime(value: unknown): value is number | null {
  return (
    value === null ||
    (Number.isSafeInteger(value) && Number(value) >= 0)
  );
}

export function isSudokuBestTimes(
  value: unknown,
): value is SudokuBestTimes {
  if (
    typeof value !== "object" ||
    value === null ||
    Object.keys(value).length !== 2 ||
    !("version" in value) ||
    value.version !== 1 ||
    !("times" in value) ||
    typeof value.times !== "object" ||
    value.times === null
  ) {
    return false;
  }

  const times = value.times as Record<string, unknown>;
  return (
    Object.keys(times).length === DIFFICULTIES.length &&
    DIFFICULTIES.every(
      (difficulty) =>
        Object.hasOwn(times, difficulty) &&
        isBestTime(times[difficulty]),
    )
  );
}

export function loadSudokuBestTimes(
  storage: StorageLike,
): SudokuBestTimes {
  const value = readStoredJson(storage, SUDOKU_BEST_TIMES_STORAGE_KEY);
  return isSudokuBestTimes(value)
    ? value
    : createEmptySudokuBestTimes();
}

export function updateSudokuBestTime(
  bestTimes: SudokuBestTimes,
  difficulty: Difficulty,
  elapsedMs: number,
): {
  bestTimes: SudokuBestTimes;
  bestTimeMs: number;
  isNewBest: boolean;
} {
  if (!Number.isSafeInteger(elapsedMs) || elapsedMs < 0) {
    throw new RangeError("Sudoku best time must be a non-negative integer.");
  }

  const current = bestTimes.times[difficulty];
  const isNewBest = current === null || elapsedMs < current;
  const bestTimeMs = isNewBest ? elapsedMs : current;

  return {
    bestTimes: isNewBest
      ? {
          version: 1,
          times: { ...bestTimes.times, [difficulty]: elapsedMs },
        }
      : bestTimes,
    bestTimeMs,
    isNewBest,
  };
}

export function saveSudokuBestTimes(
  storage: StorageLike,
  bestTimes: SudokuBestTimes,
): boolean {
  return (
    isSudokuBestTimes(bestTimes) &&
    writeStoredJson(storage, SUDOKU_BEST_TIMES_STORAGE_KEY, bestTimes)
  );
}
