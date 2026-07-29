import type { Board, Digit } from "./engine/index.ts";
import type { SudokuGameState } from "./game.ts";

export interface SudokuGameSnapshot {
  board: Board;
  notes: readonly (readonly Digit[])[];
  complete: boolean;
}

export interface SudokuHistory {
  past: readonly SudokuGameSnapshot[];
  future: readonly SudokuGameSnapshot[];
}

export interface SudokuHistoryResult {
  state: SudokuGameState;
  history: SudokuHistory;
  changed: boolean;
}

function snapshotGame(state: SudokuGameState): SudokuGameSnapshot {
  return {
    board: [...state.board],
    notes: state.notes.map((notes) => [...notes]),
    complete: state.complete,
  };
}

function restoreSnapshot(
  state: SudokuGameState,
  snapshot: SudokuGameSnapshot,
): SudokuGameState {
  return {
    ...state,
    board: [...snapshot.board],
    notes: snapshot.notes.map((notes) => [...notes]),
    complete: snapshot.complete,
  };
}

function hasPlayerStateChanged(
  before: SudokuGameState,
  after: SudokuGameState,
): boolean {
  return (
    before.board.some((cell, index) => cell !== after.board[index]) ||
    before.notes.some((notes, index) => {
      const nextNotes = after.notes[index];
      return (
        notes.length !== nextNotes.length ||
        notes.some((digit, noteIndex) => digit !== nextNotes[noteIndex])
      );
    })
  );
}

export function createSudokuHistory(): SudokuHistory {
  return { past: [], future: [] };
}

export function recordSudokuAction(
  history: SudokuHistory,
  before: SudokuGameState,
  after: SudokuGameState,
): SudokuHistory {
  if (!hasPlayerStateChanged(before, after)) return history;
  return {
    past: [...history.past, snapshotGame(before)],
    future: [],
  };
}

export function undoSudokuAction(
  state: SudokuGameState,
  history: SudokuHistory,
): SudokuHistoryResult {
  const snapshot = history.past.at(-1);
  if (!snapshot) return { state, history, changed: false };

  return {
    state: restoreSnapshot(state, snapshot),
    history: {
      past: history.past.slice(0, -1),
      future: [...history.future, snapshotGame(state)],
    },
    changed: true,
  };
}

export function redoSudokuAction(
  state: SudokuGameState,
  history: SudokuHistory,
): SudokuHistoryResult {
  const snapshot = history.future.at(-1);
  if (!snapshot) return { state, history, changed: false };

  return {
    state: restoreSnapshot(state, snapshot),
    history: {
      past: [...history.past, snapshotGame(state)],
      future: history.future.slice(0, -1),
    },
    changed: true,
  };
}
