import assert from "node:assert/strict";
import test from "node:test";
import {
  applyLogicalStep,
  CELL_COUNT,
  findNextLogicalStep,
  getCandidates,
  getCellPosition,
  getConflictIndices,
  getPeerIndices,
  isCompleteBoard,
  matchesSolution,
  parseBoard,
  searchSolutions,
  serializeBoard,
  solveLogically,
  validatePuzzleDefinition,
} from "../src/features/sudoku/engine/index.ts";

const puzzleText =
  "53..7...." +
  "6..195..." +
  ".98....6." +
  "8...6...3" +
  "4..8.3..1" +
  "7...2...6" +
  ".6....28." +
  "...419..5" +
  "....8..79";

const solutionText =
  "534678912" +
  "672195348" +
  "198342567" +
  "859761423" +
  "426853791" +
  "713924856" +
  "961537284" +
  "287419635" +
  "345286179";

const hiddenSingleText =
  "5..6...12" +
  "..2....4." +
  "1.8.425.7" +
  ".597..4.." +
  ".2.8...91" +
  "..3..4.56" +
  "...5..2.4" +
  "28.41...." +
  "3452.6...";

test("parses and serializes canonical 81-cell boards", () => {
  const board = parseBoard(puzzleText);

  assert.notEqual(board, null);
  assert.equal(board.length, CELL_COUNT);
  assert.equal(board[0], 5);
  assert.equal(board[2], null);
  assert.equal(serializeBoard(board), puzzleText);
  assert.equal(parseBoard(".".repeat(80)), null);
  assert.equal(parseBoard(`${".".repeat(80)}x`), null);
});

test("maps cells and creates the twenty unique peers", () => {
  assert.deepEqual(getCellPosition(40), { row: 4, column: 4, box: 4 });

  const peers = getPeerIndices(40);
  assert.equal(peers.length, 20);
  assert.equal(new Set(peers).size, 20);
  assert.equal(peers.includes(40), false);
  assert.equal(peers.includes(36), true);
  assert.equal(peers.includes(4), true);
  assert.equal(peers.includes(30), true);
});

test("calculates candidates without mutating the board", () => {
  const board = parseBoard(puzzleText);
  const snapshot = [...board];

  assert.deepEqual(getCandidates(board, 2), [1, 2, 4]);
  assert.deepEqual(getCandidates(board, 0), []);
  assert.deepEqual(board, snapshot);
});

test("marks every duplicated digit in rows, columns, and boxes", () => {
  const board = parseBoard(".".repeat(CELL_COUNT));
  board[0] = 5;
  board[1] = 5;
  board[9] = 5;
  board[40] = 7;
  board[76] = 7;

  assert.deepEqual(getConflictIndices(board), [0, 1, 9, 40, 76]);
});

test("accepts only complete valid boards and exact stored solutions", () => {
  const solution = parseBoard(solutionText);
  const incomplete = parseBoard(puzzleText);
  const incorrect = [...solution];
  [incorrect[0], incorrect[1]] = [incorrect[1], incorrect[0]];

  assert.equal(isCompleteBoard(solution), true);
  assert.equal(isCompleteBoard(incomplete), false);
  assert.equal(isCompleteBoard(incorrect), false);
  assert.equal(matchesSolution(solution, solution), true);
  assert.equal(matchesSolution(incomplete, solution), false);
});

test("finds a unique solution without changing the puzzle", () => {
  const puzzle = parseBoard(puzzleText);
  const snapshot = [...puzzle];
  const result = searchSolutions(puzzle);

  assert.equal(result.count, 1);
  assert.equal(serializeBoard(result.solution), solutionText);
  assert.deepEqual(puzzle, snapshot);
});

test("distinguishes unsolvable and non-unique puzzles", () => {
  const impossible = parseBoard(puzzleText);
  impossible[2] = 5;

  assert.deepEqual(searchSolutions(impossible), {
    count: 0,
    solution: null,
  });
  assert.equal(searchSolutions(parseBoard(".".repeat(CELL_COUNT))).count, 2);
});

test("validates bundled puzzle structure, clues, uniqueness, and solution", () => {
  const valid = validatePuzzleDefinition({
    id: "easy-001",
    difficulty: "easy",
    puzzle: puzzleText,
    solution: solutionText,
  });
  assert.deepEqual(valid.issues, []);
  assert.equal(valid.valid, true);

  const badSolution = `6${solutionText.slice(1)}`;
  const invalid = validatePuzzleDefinition({
    id: "Easy 001",
    difficulty: "starter",
    puzzle: puzzleText,
    solution: badSolution,
  });
  assert.equal(invalid.valid, false);
  assert.equal(invalid.issues.includes("invalid-id"), true);
  assert.equal(invalid.issues.includes("invalid-difficulty"), true);
  assert.equal(invalid.issues.includes("solution-conflict"), true);
  assert.equal(invalid.issues.includes("clue-mismatch"), true);
});

test("returns a structured naked-single step before harder techniques", () => {
  const board = parseBoard(puzzleText);
  const step = findNextLogicalStep(board);

  assert.deepEqual(step, {
    technique: "naked-single",
    placements: [{ index: 40, digit: 5 }],
    eliminations: [],
    highlights: [{ index: 40, digits: [5] }],
    relatedCells: [40],
    unit: null,
  });
});

test("finds hidden singles deterministically by unit and digit", () => {
  const board = parseBoard(hiddenSingleText);
  const step = findNextLogicalStep(board);

  assert.equal(getCandidates(board, 2).length > 1, true);
  assert.equal(step.technique, "hidden-single");
  assert.deepEqual(step.placements, [{ index: 2, digit: 4 }]);
  assert.deepEqual(step.unit, { kind: "row", index: 0 });
  assert.deepEqual(step.relatedCells, [0, 1, 2, 3, 4, 5, 6, 7, 8]);
});

test("applies a logical placement immutably and rejects stale steps", () => {
  const board = parseBoard(puzzleText);
  const step = findNextLogicalStep(board);
  const next = applyLogicalStep(board, step);

  assert.equal(board[40], null);
  assert.equal(next[40], 5);
  assert.throws(() => applyLogicalStep(next, step), RangeError);
});

test("solves singles-only puzzles and reports the hardest used technique", () => {
  const solved = solveLogically(parseBoard(puzzleText));
  assert.equal(solved.status, "solved");
  assert.equal(serializeBoard(solved.board), solutionText);
  assert.equal(solved.steps.length, 51);
  assert.equal(solved.hardestTechnique, "naked-single");

  const stuck = solveLogically(parseBoard(hiddenSingleText));
  assert.equal(stuck.status, "stuck");
  assert.equal(stuck.steps.length > 0, true);
  assert.equal(stuck.hardestTechnique, "hidden-single");
});

test("reports conflicting boards as invalid without producing steps", () => {
  const board = parseBoard(puzzleText);
  board[2] = 5;
  const result = solveLogically(board);

  assert.equal(result.status, "invalid");
  assert.deepEqual(result.steps, []);
  assert.equal(result.hardestTechnique, null);
});
