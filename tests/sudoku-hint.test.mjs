import assert from "node:assert/strict";
import test from "node:test";
import {
  createSudokuGame,
  createSudokuHint,
  enterSudokuDigit,
  parseBoard,
  requestSudokuHint,
  selectSudokuCell,
} from "../src/features/sudoku/index.ts";

const puzzleText =
  "53..7....6..195....98....6.8...6...34..8.3..17...2...6.6....28....419..5....8..79";
const solution =
  "534678912672195348198342567859761423426853791713924856961537284287419635345286179";
const puzzle = {
  id: "easy-hint",
  difficulty: "easy",
  puzzle: puzzleText,
  solution,
};

test("derives a structured hint without changing the board", () => {
  const board = parseBoard(puzzleText);
  const snapshot = [...board];
  const hint = createSudokuHint(board);

  assert.equal(hint.step.technique, "naked-single");
  assert.deepEqual(hint.step.placements, [{ index: 40, digit: 5 }]);
  assert.equal(hint.cellIndices.includes(40), true);
  assert.deepEqual(hint.candidates, [{ index: 40, digits: [5] }]);
  assert.deepEqual(board, snapshot);
});

test("decrements only successful hints and stops after three", () => {
  let state = createSudokuGame(puzzle);
  for (const remaining of [2, 1, 0]) {
    const result = requestSudokuHint(state);
    assert.notEqual(result.hint, null);
    assert.equal(result.state.hintsRemaining, remaining);
    state = result.state;
  }

  const exhausted = requestSudokuHint(state);
  assert.equal(exhausted.hint, null);
  assert.equal(exhausted.state, state);
});

test("does not spend a hint on a conflicting board", () => {
  let state = selectSudokuCell(createSudokuGame(puzzle), 2);
  state = enterSudokuDigit(state, 5);
  const result = requestSudokuHint(state);

  assert.equal(result.hint, null);
  assert.equal(result.state, state);
  assert.equal(result.state.hintsRemaining, 3);
});
