import assert from "node:assert/strict";
import test from "node:test";
import {
  chordCell,
  beginMinesweeperPointerInteraction,
  completeMinesweeperLongPress,
  consumeMinesweeperPointerClick,
  createMinesweeperGame,
  cycleCellMark,
  getMineCounter,
  revealCell,
  toggleQuestionMark,
  shouldAutosaveMinesweeperGame,
} from "../src/features/minesweeper/index.ts";

const mines = [0, 2, 10, 20, 30, 40, 50, 60, 70, 80];

test("first reveal generates mines after the click and keeps that cell safe", () => {
  const game = createMinesweeperGame("beginner");
  const next = revealCell(game, 40, () => 0);
  assert.equal(game.generated, false);
  assert.equal(next.generated, true);
  assert.equal(next.cells[40].mine, false);
  assert.equal(next.cells[40].revealed, true);
});

test("input helpers suppress exactly the click after a completed touch long press", () => {
  const touch = beginMinesweeperPointerInteraction("touch");
  assert.equal(consumeMinesweeperPointerClick(touch).suppress, false);
  const completed = completeMinesweeperLongPress(touch);
  const result = consumeMinesweeperPointerClick(completed);
  assert.equal(result.suppress, true);
  assert.equal(result.nextInteraction, null);
  assert.equal(beginMinesweeperPointerInteraction("mouse"), null);
});

test("autosave waits until the user resolves a restored-game choice", () => {
  assert.equal(shouldAutosaveMinesweeperGame({ hydrated: false, hasSavedGameChoice: false, phase: "ready" }), false);
  assert.equal(shouldAutosaveMinesweeperGame({ hydrated: true, hasSavedGameChoice: true, phase: "ready" }), false);
  assert.equal(shouldAutosaveMinesweeperGame({ hydrated: true, hasSavedGameChoice: false, phase: "ready" }), true);
  assert.equal(shouldAutosaveMinesweeperGame({ hydrated: true, hasSavedGameChoice: false, phase: "won" }), false);
});

test("flood reveal opens zero regions and their numbered boundary", () => {
  let game = createMinesweeperGame("beginner", { mineIndexes: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] });
  game = revealCell(game, 79);
  assert.equal(game.cells[79].revealed, true);
  assert.equal(game.cells[71].revealed, true);
  assert.equal(game.cells[20].revealed, true);
  assert.equal(game.cells[0].revealed, false);
});

test("marks cycle and marked cells cannot be revealed", () => {
  let game = createMinesweeperGame();
  game = cycleCellMark(game, 1);
  assert.equal(game.cells[1].mark, "flagged");
  assert.equal(getMineCounter(game), 9);
  assert.equal(revealCell(game, 1), game);
  game = cycleCellMark(game, 1);
  assert.equal(game.cells[1].mark, "questioned");
  game = cycleCellMark(game, 1);
  assert.equal(game.cells[1].mark, "covered");
  assert.equal(toggleQuestionMark(game, 1).cells[1].mark, "questioned");
});

test("a chord only opens when flags match and incorrect flags can lose", () => {
  let game = createMinesweeperGame("beginner", { mineIndexes: mines });
  game = revealCell(game, 1); // numbered 3, adjacent to mines 0, 2, and 10
  assert.equal(chordCell(game, 1), game);
  game = cycleCellMark(game, 0);
  game = cycleCellMark(game, 2);
  game = cycleCellMark(game, 9); // wrong flag replaces mine 10
  game = chordCell(game, 1);
  assert.equal(game.phase, "lost");
  assert.equal(game.explodedIndex, 10);
});

test("revealing all safe cells wins and automatically flags mines", () => {
  let game = createMinesweeperGame("beginner", { mineIndexes: mines });
  for (let index = 0; index < game.cells.length && game.phase !== "won"; index += 1) {
    if (!game.cells[index].mine) game = revealCell(game, index);
  }
  assert.equal(game.phase, "won");
  assert.equal(game.cells.filter((cell) => cell.mine && cell.mark === "flagged").length, 10);
});
