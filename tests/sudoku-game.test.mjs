import assert from "node:assert/strict";
import test from "node:test";
import {
  createSudokuGame,
  enterSudokuDigit,
  eraseSudokuCell,
  getConflictIndices,
  moveSudokuSelection,
  selectSudokuCell,
  toggleSudokuNoteMode,
} from "../src/features/sudoku/index.ts";

const solution =
  "534678912672195348198342567859761423426853791713924856961537284287419635345286179";
const puzzle = {
  id: "easy-test",
  difficulty: "easy",
  puzzle: `.${solution.slice(1, 4)}.${solution.slice(5)}`,
  solution,
};

test("creates a game with immutable given cells and bounded selection movement", () => {
  const game = createSudokuGame(puzzle);
  const given = selectSudokuCell(game, 1);

  assert.equal(given.givens[0], false);
  assert.equal(given.givens[1], true);
  assert.equal(enterSudokuDigit(given, 9), given);
  assert.equal(moveSudokuSelection(selectSudokuCell(game, 0), "up").selectedIndex, 0);
  assert.equal(moveSudokuSelection(selectSudokuCell(game, 80), "right").selectedIndex, 80);
});

test("toggles sorted notes and removes a placed digit from peer notes", () => {
  let game = selectSudokuCell(createSudokuGame(puzzle), 4);
  game = toggleSudokuNoteMode(game);
  game = enterSudokuDigit(game, 7);
  game = enterSudokuDigit(game, 2);
  assert.deepEqual(game.notes[4], [2, 7]);

  game = selectSudokuCell(game, 0);
  game = toggleSudokuNoteMode(game);
  game = enterSudokuDigit(game, 2);
  assert.deepEqual(game.notes[4], [7]);
  assert.equal(game.board[0], 2);
});

test("accepts provisional conflicts and erases editable entries", () => {
  let game = selectSudokuCell(createSudokuGame(puzzle), 0);
  game = enterSudokuDigit(game, 3);

  assert.deepEqual(getConflictIndices(game.board), [0, 1, 72]);
  game = eraseSudokuCell(game);
  assert.equal(game.board[0], null);
  assert.deepEqual(getConflictIndices(game.board), []);
});

test("marks completion only when the board matches the stored solution", () => {
  let game = selectSudokuCell(createSudokuGame(puzzle), 0);
  game = enterSudokuDigit(game, 5);
  assert.equal(game.complete, false);

  game = selectSudokuCell(game, 4);
  game = enterSudokuDigit(game, 7);
  assert.equal(game.complete, true);
});
