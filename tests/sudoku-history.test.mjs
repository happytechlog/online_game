import assert from "node:assert/strict";
import test from "node:test";
import {
  createSudokuGame,
  createSudokuHistory,
  enterSudokuDigit,
  recordSudokuAction,
  redoSudokuAction,
  selectSudokuCell,
  toggleSudokuNoteMode,
  undoSudokuAction,
} from "../src/features/sudoku/index.ts";

const solution =
  "534678912672195348198342567859761423426853791713924856961537284287419635345286179";
const puzzle = {
  id: "easy-history",
  difficulty: "easy",
  puzzle: `.${solution.slice(1, 4)}.${solution.slice(5)}`,
  solution,
};

function applyAction(state, history, action) {
  const nextState = action(state);
  return {
    state: nextState,
    history: recordSudokuAction(history, state, nextState),
  };
}

test("does not record selection or rejected given-cell changes", () => {
  const initial = createSudokuGame(puzzle);
  const selected = selectSudokuCell(initial, 1);
  const rejected = enterSudokuDigit(selected, 9);
  const history = recordSudokuAction(
    createSudokuHistory(),
    initial,
    rejected,
  );

  assert.deepEqual(history, createSudokuHistory());
});

test("undoes and redoes note edits exactly", () => {
  let state = toggleSudokuNoteMode(
    selectSudokuCell(createSudokuGame(puzzle), 4),
  );
  let history = createSudokuHistory();

  ({ state, history } = applyAction(
    state,
    history,
    (game) => enterSudokuDigit(game, 2),
  ));
  ({ state, history } = applyAction(
    state,
    history,
    (game) => enterSudokuDigit(game, 7),
  ));
  assert.deepEqual(state.notes[4], [2, 7]);

  let result = undoSudokuAction(state, history);
  assert.deepEqual(result.state.notes[4], [2]);
  result = redoSudokuAction(result.state, result.history);
  assert.deepEqual(result.state.notes[4], [2, 7]);
});

test("restores every peer note removed by one final placement", () => {
  let state = toggleSudokuNoteMode(
    selectSudokuCell(createSudokuGame(puzzle), 4),
  );
  let history = createSudokuHistory();
  ({ state, history } = applyAction(
    state,
    history,
    (game) => enterSudokuDigit(game, 5),
  ));

  state = selectSudokuCell(state, 0);
  state = toggleSudokuNoteMode(state);
  ({ state, history } = applyAction(
    state,
    history,
    (game) => enterSudokuDigit(game, 5),
  ));
  assert.equal(state.board[0], 5);
  assert.deepEqual(state.notes[4], []);

  const undone = undoSudokuAction(state, history);
  assert.equal(undone.state.board[0], null);
  assert.deepEqual(undone.state.notes[4], [5]);

  const redone = redoSudokuAction(undone.state, undone.history);
  assert.equal(redone.state.board[0], 5);
  assert.deepEqual(redone.state.notes[4], []);
});

test("clears redo after a divergent player action", () => {
  let state = selectSudokuCell(createSudokuGame(puzzle), 0);
  let history = createSudokuHistory();
  ({ state, history } = applyAction(
    state,
    history,
    (game) => enterSudokuDigit(game, 1),
  ));
  const undone = undoSudokuAction(state, history);

  ({ state, history } = applyAction(
    undone.state,
    undone.history,
    (game) => enterSudokuDigit(game, 2),
  ));
  assert.deepEqual(history.future, []);
  assert.equal(redoSudokuAction(state, history).changed, false);
});
