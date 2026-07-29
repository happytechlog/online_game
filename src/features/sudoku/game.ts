import {
  CELL_COUNT,
  DIGITS,
  getPeerIndices,
  matchesSolution,
  parseBoard,
  type Board,
  type Digit,
  type PuzzleDefinition,
} from "./engine/index.ts";
import { SUDOKU_HINT_LIMIT } from "./hint.ts";

export type SudokuDirection = "up" | "down" | "left" | "right";

export interface SudokuGameState {
  puzzle: PuzzleDefinition;
  board: Board;
  givens: readonly boolean[];
  notes: readonly (readonly Digit[])[];
  selectedIndex: number | null;
  noteMode: boolean;
  hintsRemaining: number;
  complete: boolean;
}

function emptyNotes(): readonly (readonly Digit[])[] {
  return Array.from({ length: CELL_COUNT }, () => []);
}

function withCompletion(
  state: Omit<SudokuGameState, "complete">,
): SudokuGameState {
  const solution = parseBoard(state.puzzle.solution);
  if (solution === null) {
    throw new TypeError("Sudoku puzzle has an invalid solution.");
  }

  return {
    ...state,
    complete: matchesSolution(state.board, solution),
  };
}

export function createSudokuGame(
  puzzle: PuzzleDefinition,
): SudokuGameState {
  const board = parseBoard(puzzle.puzzle);
  if (board === null) {
    throw new TypeError("Sudoku puzzle has an invalid board.");
  }

  return {
    puzzle,
    board,
    givens: board.map((cell) => cell !== null),
    notes: emptyNotes(),
    selectedIndex: null,
    noteMode: false,
    hintsRemaining: SUDOKU_HINT_LIMIT,
    complete: false,
  };
}

export function selectSudokuCell(
  state: SudokuGameState,
  index: number,
): SudokuGameState {
  if (!Number.isInteger(index) || index < 0 || index >= CELL_COUNT) {
    return state;
  }
  return { ...state, selectedIndex: index };
}

export function clearSudokuSelection(
  state: SudokuGameState,
): SudokuGameState {
  if (state.selectedIndex === null) return state;
  return { ...state, selectedIndex: null };
}

export function moveSudokuSelection(
  state: SudokuGameState,
  direction: SudokuDirection,
): SudokuGameState {
  const current = state.selectedIndex ?? 0;
  const row = Math.floor(current / 9);
  const column = current % 9;
  const nextRow =
    direction === "up"
      ? Math.max(0, row - 1)
      : direction === "down"
        ? Math.min(8, row + 1)
        : row;
  const nextColumn =
    direction === "left"
      ? Math.max(0, column - 1)
      : direction === "right"
        ? Math.min(8, column + 1)
        : column;

  return { ...state, selectedIndex: nextRow * 9 + nextColumn };
}

export function toggleSudokuNoteMode(
  state: SudokuGameState,
): SudokuGameState {
  return { ...state, noteMode: !state.noteMode };
}

export function hasSudokuDigitEntryTarget(
  state: SudokuGameState,
): boolean {
  const index = state.selectedIndex;
  return (
    index !== null &&
    !state.givens[index] &&
    state.board[index] === null &&
    !state.complete
  );
}

export function getCompletedSudokuDigits(
  board: Board,
): readonly Digit[] {
  return DIGITS.filter(
    (digit) => board.filter((cell) => cell === digit).length >= 9,
  );
}

export function enterSudokuDigit(
  state: SudokuGameState,
  digit: Digit,
): SudokuGameState {
  const index = state.selectedIndex;
  if (
    index === null ||
    state.givens[index] ||
    state.complete ||
    !DIGITS.includes(digit)
  ) {
    return state;
  }

  if (state.noteMode && state.board[index] === null) {
    const notes = state.notes.map((cellNotes) => [...cellNotes]);
    notes[index] = notes[index].includes(digit)
      ? notes[index].filter((note) => note !== digit)
      : [...notes[index], digit].sort((left, right) => left - right);
    return { ...state, notes };
  }

  const board = [...state.board];
  board[index] = digit;
  const notes = state.notes.map((cellNotes) => [...cellNotes]);
  notes[index] = [];
  for (const peerIndex of getPeerIndices(index)) {
    notes[peerIndex] = notes[peerIndex].filter((note) => note !== digit);
  }

  return withCompletion({ ...state, board, notes });
}

export function eraseSudokuCell(
  state: SudokuGameState,
): SudokuGameState {
  const index = state.selectedIndex;
  if (index === null || state.givens[index] || state.complete) return state;

  const board = [...state.board];
  board[index] = null;
  const notes = state.notes.map((cellNotes) => [...cellNotes]);
  notes[index] = [];
  return withCompletion({ ...state, board, notes });
}
