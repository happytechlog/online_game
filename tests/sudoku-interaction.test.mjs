import assert from "node:assert/strict";
import test from "node:test";
import {
  resolveSudokuKeyboardCommand,
  shouldAutoPauseSudoku,
} from "../src/features/sudoku/index.ts";

test("maps keyboard gameplay commands while the timer is running", () => {
  assert.deepEqual(
    resolveSudokuKeyboardCommand({ key: "ArrowLeft" }, "running"),
    { type: "move", direction: "left" },
  );
  assert.deepEqual(
    resolveSudokuKeyboardCommand({ key: "7" }, "running"),
    { type: "enter", digit: 7 },
  );
  assert.deepEqual(
    resolveSudokuKeyboardCommand({ key: "Delete" }, "running"),
    { type: "erase" },
  );
  assert.deepEqual(
    resolveSudokuKeyboardCommand({ key: "n" }, "running"),
    { type: "toggle-notes" },
  );
});

test("maps cross-platform undo, redo, and pause shortcuts", () => {
  assert.deepEqual(
    resolveSudokuKeyboardCommand(
      { key: "z", ctrlKey: true },
      "running",
    ),
    { type: "undo" },
  );
  assert.deepEqual(
    resolveSudokuKeyboardCommand(
      { key: "Z", metaKey: true, shiftKey: true },
      "running",
    ),
    { type: "redo" },
  );
  assert.deepEqual(
    resolveSudokuKeyboardCommand(
      { key: "y", ctrlKey: true },
      "running",
    ),
    { type: "redo" },
  );
  assert.deepEqual(
    resolveSudokuKeyboardCommand({ key: "p" }, "paused"),
    { type: "toggle-pause" },
  );
});

test("ignores gameplay commands when paused, finished, modified, or editing", () => {
  assert.equal(
    resolveSudokuKeyboardCommand({ key: "4" }, "paused"),
    null,
  );
  assert.equal(
    resolveSudokuKeyboardCommand({ key: "p" }, "finished"),
    null,
  );
  assert.equal(
    resolveSudokuKeyboardCommand(
      { key: "ArrowDown", altKey: true },
      "running",
    ),
    null,
  );
  assert.equal(
    resolveSudokuKeyboardCommand(
      { key: "1", editableTarget: true },
      "running",
    ),
    null,
  );
  assert.equal(
    resolveSudokuKeyboardCommand(
      { key: "z", ctrlKey: true, defaultPrevented: true },
      "running",
    ),
    null,
  );
});

test("auto-pauses only an active running game when the page becomes hidden", () => {
  assert.equal(shouldAutoPauseSudoku(true, "running", true), true);
  assert.equal(shouldAutoPauseSudoku(true, "running", false), false);
  assert.equal(shouldAutoPauseSudoku(true, "paused", true), false);
  assert.equal(shouldAutoPauseSudoku(false, "running", true), false);
  assert.equal(shouldAutoPauseSudoku(true, null, true), false);
});
