import {
  CELL_COUNT,
  matchesSolution,
  parseBoard,
  serializeBoard,
  type Digit,
  type PuzzleDefinition,
} from "../engine/index.ts";
import { createSudokuGame, type SudokuGameState } from "../game.ts";
import { SUDOKU_HINT_LIMIT } from "../hint.ts";
import {
  readStoredJson,
  removeStoredValue,
  writeStoredJson,
  type StorageLike,
} from "../../../storage/safe-storage.ts";

export const SUDOKU_ACTIVE_GAME_STORAGE_KEY =
  "online-games:sudoku:active:v1";

export interface SavedSudokuGame {
  version: 1;
  savedAt: string;
  puzzleId: string;
  board: string;
  notes: readonly (readonly Digit[])[];
  hintsRemaining: number;
  elapsedMs: number;
}

export interface RestoredSudokuGame {
  game: SudokuGameState;
  elapsedMs: number;
  savedAt: string;
}

function hasExactKeys(
  value: object,
  expected: readonly string[],
): boolean {
  const keys = Object.keys(value).sort();
  const sortedExpected = [...expected].sort();
  return (
    keys.length === sortedExpected.length &&
    keys.every((key, index) => key === sortedExpected[index])
  );
}

function isCanonicalNotes(
  value: unknown,
  board: ReturnType<typeof parseBoard>,
): value is readonly (readonly Digit[])[] {
  return (
    board !== null &&
    Array.isArray(value) &&
    value.length === CELL_COUNT &&
    value.every((notes, index) => {
      if (!Array.isArray(notes)) return false;
      if (board[index] !== null) return notes.length === 0;
      return notes.every(
        (digit, noteIndex) =>
          Number.isInteger(digit) &&
          digit >= 1 &&
          digit <= 9 &&
          (noteIndex === 0 || notes[noteIndex - 1] < digit),
      );
    })
  );
}

export function restoreSudokuGame(
  value: unknown,
  puzzles: readonly PuzzleDefinition[],
): RestoredSudokuGame | null {
  if (
    typeof value !== "object" ||
    value === null ||
    !hasExactKeys(value, [
      "board",
      "elapsedMs",
      "hintsRemaining",
      "notes",
      "puzzleId",
      "savedAt",
      "version",
    ])
  ) {
    return null;
  }

  const candidate = value as Record<string, unknown>;
  const puzzle =
    typeof candidate.puzzleId === "string"
      ? puzzles.find((entry) => entry.id === candidate.puzzleId)
      : undefined;
  const board =
    typeof candidate.board === "string"
      ? parseBoard(candidate.board)
      : null;
  const initialBoard = puzzle ? parseBoard(puzzle.puzzle) : null;
  const solution = puzzle ? parseBoard(puzzle.solution) : null;

  if (
    candidate.version !== 1 ||
    !puzzle ||
    board === null ||
    initialBoard === null ||
    solution === null ||
    typeof candidate.savedAt !== "string" ||
    Number.isNaN(Date.parse(candidate.savedAt)) ||
    !Number.isSafeInteger(candidate.hintsRemaining) ||
    Number(candidate.hintsRemaining) < 0 ||
    Number(candidate.hintsRemaining) > SUDOKU_HINT_LIMIT ||
    !Number.isSafeInteger(candidate.elapsedMs) ||
    Number(candidate.elapsedMs) < 0 ||
    !isCanonicalNotes(candidate.notes, board) ||
    matchesSolution(board, solution) ||
    initialBoard.some(
      (cell, index) => cell !== null && board[index] !== cell,
    )
  ) {
    return null;
  }

  const game = createSudokuGame(puzzle);
  return {
    game: {
      ...game,
      board,
      notes: candidate.notes,
      hintsRemaining: Number(candidate.hintsRemaining),
    },
    elapsedMs: Number(candidate.elapsedMs),
    savedAt: candidate.savedAt,
  };
}

export function createSavedSudokuGame(
  game: SudokuGameState,
  elapsedMs: number,
  now = new Date(),
): SavedSudokuGame {
  if (!Number.isSafeInteger(elapsedMs) || elapsedMs < 0) {
    throw new RangeError("Sudoku elapsed time must be a non-negative integer.");
  }
  return {
    version: 1,
    savedAt: now.toISOString(),
    puzzleId: game.puzzle.id,
    board: serializeBoard(game.board),
    notes: game.notes.map((notes) => [...notes]),
    hintsRemaining: game.hintsRemaining,
    elapsedMs,
  };
}

export function loadSudokuGame(
  storage: StorageLike,
  puzzles: readonly PuzzleDefinition[],
): RestoredSudokuGame | null {
  return restoreSudokuGame(
    readStoredJson(storage, SUDOKU_ACTIVE_GAME_STORAGE_KEY),
    puzzles,
  );
}

export function saveSudokuGame(
  storage: StorageLike,
  game: SudokuGameState,
  elapsedMs: number,
  now = new Date(),
): boolean {
  if (game.complete) return false;
  return writeStoredJson(
    storage,
    SUDOKU_ACTIVE_GAME_STORAGE_KEY,
    createSavedSudokuGame(game, elapsedMs, now),
  );
}

export function deleteSudokuGame(storage: StorageLike): boolean {
  return removeStoredValue(storage, SUDOKU_ACTIVE_GAME_STORAGE_KEY);
}
