import assert from "node:assert/strict";
import test from "node:test";
import {
  createPausedSudokuTimer,
  createSavedSudokuGame,
  createSudokuGame,
  deleteSudokuGame,
  enterSudokuDigit,
  loadSudokuGame,
  loadSudokuPuzzleCycle,
  requestSudokuHint,
  saveSudokuGame,
  selectSudokuCell,
  selectSudokuPuzzle,
  sudokuPuzzleBundle,
  SUDOKU_ACTIVE_GAME_STORAGE_KEY,
  SUDOKU_PUZZLE_CYCLE_STORAGE_KEY,
  toggleSudokuNoteMode,
} from "../src/features/sudoku/index.ts";

function createMemoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem(key) {
      return values.get(key) ?? null;
    },
    setItem(key, value) {
      values.set(key, value);
    },
    removeItem(key) {
      values.delete(key);
    },
    values,
  };
}

const puzzles = sudokuPuzzleBundle.puzzles;
const easyPuzzle = puzzles.find((puzzle) => puzzle.difficulty === "easy");

test("round-trips the active board, notes, hints, and elapsed time", () => {
  const emptyIndex = [...easyPuzzle.puzzle].findIndex(
    (character) => character === ".",
  );
  let game = selectSudokuCell(createSudokuGame(easyPuzzle), emptyIndex);
  game = toggleSudokuNoteMode(game);
  game = enterSudokuDigit(game, 2);
  game = requestSudokuHint(game).state;
  const storage = createMemoryStorage();
  const now = new Date("2026-07-28T12:00:00.000Z");

  assert.equal(saveSudokuGame(storage, game, 12_345, now), true);
  const restored = loadSudokuGame(storage, puzzles);
  assert.equal(restored.savedAt, now.toISOString());
  assert.equal(restored.elapsedMs, 12_345);
  assert.deepEqual(restored.game.board, game.board);
  assert.deepEqual(restored.game.notes, game.notes);
  assert.equal(restored.game.hintsRemaining, 2);
  assert.equal(restored.game.selectedIndex, null);
  assert.equal(restored.game.noteMode, false);
  assert.deepEqual(createPausedSudokuTimer(restored.elapsedMs), {
    status: "paused",
    elapsedMs: 12_345,
    startedAtMs: null,
  });
});

test("rejects malformed saves, unknown puzzles, changed givens, and full solutions", () => {
  const game = createSudokuGame(easyPuzzle);
  const saved = createSavedSudokuGame(game, 1_000);
  const givenIndex = [...easyPuzzle.puzzle].findIndex(
    (character) => character !== ".",
  );
  const changedGiven =
    `${saved.board.slice(0, givenIndex)}.` +
    saved.board.slice(givenIndex + 1);
  const invalidValues = [
    { ...saved, extra: true },
    { ...saved, puzzleId: "missing-puzzle" },
    { ...saved, board: changedGiven },
    { ...saved, board: easyPuzzle.solution },
    { ...saved, hintsRemaining: 4 },
    { ...saved, notes: saved.notes.slice(1) },
  ];

  for (const value of invalidValues) {
    const storage = createMemoryStorage({
      [SUDOKU_ACTIVE_GAME_STORAGE_KEY]: JSON.stringify(value),
    });
    assert.equal(loadSudokuGame(storage, puzzles), null);
  }
});

test("contains active-save storage failures and deletes only its own key", () => {
  const unavailable = {
    getItem() {
      throw new Error("blocked");
    },
    setItem() {
      throw new Error("quota");
    },
    removeItem() {
      throw new Error("blocked");
    },
  };
  const game = createSudokuGame(easyPuzzle);
  assert.equal(loadSudokuGame(unavailable, puzzles), null);
  assert.equal(saveSudokuGame(unavailable, game, 0), false);
  assert.equal(deleteSudokuGame(unavailable), false);

  const storage = createMemoryStorage({
    keep: "value",
    [SUDOKU_ACTIVE_GAME_STORAGE_KEY]: "{}",
  });
  assert.equal(deleteSudokuGame(storage), true);
  assert.equal(storage.getItem("keep"), "value");
});

test("selects all 100 puzzles before resetting only that difficulty", () => {
  const storage = createMemoryStorage();
  const selectedIds = new Set();
  for (let index = 0; index < 100; index += 1) {
    selectedIds.add(
      selectSudokuPuzzle(storage, puzzles, "easy", () => 0).id,
    );
  }
  assert.equal(selectedIds.size, 100);

  selectSudokuPuzzle(storage, puzzles, "medium", () => 0);
  const resetSelection = selectSudokuPuzzle(
    storage,
    puzzles,
    "easy",
    () => 0,
  );
  const cycle = loadSudokuPuzzleCycle(storage, puzzles);
  assert.equal(cycle.usedIds.easy.length, 1);
  assert.equal(cycle.usedIds.easy[0], resetSelection.id);
  assert.equal(cycle.usedIds.medium.length, 1);
});

test("recovers an invalid puzzle cycle without touching active saves", () => {
  const storage = createMemoryStorage({
    [SUDOKU_ACTIVE_GAME_STORAGE_KEY]: "active",
    [SUDOKU_PUZZLE_CYCLE_STORAGE_KEY]: JSON.stringify({
      version: 1,
      usedIds: {
        easy: ["missing"],
        medium: [],
        hard: [],
        expert: [],
      },
    }),
  });

  const selected = selectSudokuPuzzle(
    storage,
    puzzles,
    "expert",
    () => 0.5,
  );
  assert.equal(selected.difficulty, "expert");
  assert.equal(storage.getItem(SUDOKU_ACTIVE_GAME_STORAGE_KEY), "active");
  assert.equal(loadSudokuPuzzleCycle(storage, puzzles).usedIds.expert.length, 1);
});
