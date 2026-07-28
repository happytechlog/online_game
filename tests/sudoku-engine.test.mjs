import assert from "node:assert/strict";
import test from "node:test";
import {
  applyLogicalStep,
  CELL_COUNT,
  createLogicalState,
  findNextLogicalStep,
  findXChain,
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

const lockedCandidatesPuzzleText =
  "5.....91." +
  "..2.9..4." +
  "..834..6." +
  ".5976.4.3" +
  ".2..5...." +
  "..392.856" +
  "96153..84" +
  "..7.....5" +
  "..52...7.";

const candidatePairPuzzleText =
  "53....9.2" +
  "..2......" +
  "......567" +
  "8...6.423" +
  "4.68....." +
  "..39.4..." +
  ".6.5.7..4" +
  "28.41...." +
  ".4......9";

const candidateTriplePuzzleText =
  "....7...2" +
  "...1....." +
  "1..3.2.6." +
  "85....4.3" +
  ".2.....9." +
  "....248.." +
  "..1.....4" +
  "..7..9..5" +
  "3..2.6..9";

const xWingPuzzleText =
  "700090006" +
  "400207005" +
  "050030040" +
  "080000070" +
  "300409008" +
  "060000010" +
  "070040060" +
  "100902003" +
  "800010002";

const xWingSolutionText =
  "713594826" +
  "498267135" +
  "652138947" +
  "584621379" +
  "321479658" +
  "967385214" +
  "279843561" +
  "146952783" +
  "835716492";

const xyWingPuzzleText =
  "....6...." +
  "....1.863" +
  "..3..9..." +
  "9.4......" +
  "3.....7.4" +
  "57.82...." +
  ".....658." +
  "69...7..." +
  "....4..3.";

const xyWingSolutionText =
  "857362941" +
  "249715863" +
  "163489275" +
  "924673158" +
  "386951724" +
  "571824396" +
  "432196587" +
  "698537412" +
  "715248639";

const swordfishPuzzleText =
  "16.54..7." +
  "..8..1.3." +
  ".3.8....." +
  "7...5..69" +
  "6..9.2.57" +
  "........." +
  "....3..4." +
  ".......16" +
  "...1645..";

const swordfishSolutionText =
  "169543872" +
  "278691435" +
  "435827691" +
  "723458169" +
  "684912357" +
  "951376284" +
  "516239748" +
  "342785916" +
  "897164523";

function createCandidateState(overrides) {
  const board = parseBoard(".".repeat(CELL_COUNT));
  const state = createLogicalState(board);
  const candidates = state.candidates.map((cell) => [...cell]);

  for (const [index, digits] of overrides) {
    candidates[index] = digits;
  }

  return { board, candidates };
}

function withoutDigits(digits) {
  return [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(
    (digit) => !digits.includes(digit),
  );
}

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
  assert.equal(solved.difficulty, "easy");

  const stuck = solveLogically(parseBoard(hiddenSingleText));
  assert.equal(stuck.status, "stuck");
  assert.equal(stuck.steps.length > 0, true);
  assert.equal(stuck.hardestTechnique, "hidden-single");
  assert.equal(stuck.difficulty, null);
});

test("reports conflicting boards as invalid without producing steps", () => {
  const board = parseBoard(puzzleText);
  board[2] = 5;
  const result = solveLogically(board);

  assert.equal(result.status, "invalid");
  assert.deepEqual(result.steps, []);
  assert.equal(result.hardestTechnique, null);
  assert.equal(result.difficulty, null);
});

test("finds pointing locked candidates and preserves their eliminations", () => {
  const overrides = [];
  for (const index of [9, 10, 11, 18, 19, 20]) {
    overrides.push([index, withoutDigits([1])]);
  }
  const state = createCandidateState(overrides);
  const step = findNextLogicalStep(state);

  assert.equal(step.technique, "locked-candidates");
  assert.equal(step.pattern, "pointing");
  assert.deepEqual(step.unit, { kind: "box", index: 0 });
  assert.deepEqual(step.highlights, [
    { index: 0, digits: [1] },
    { index: 1, digits: [1] },
    { index: 2, digits: [1] },
  ]);
  assert.deepEqual(step.eliminations, [3, 4, 5, 6, 7, 8].map(
    (index) => ({ index, digits: [1] }),
  ));

  const next = applyLogicalStep(state, step);
  assert.equal(state.candidates[3].includes(1), true);
  assert.equal(next.candidates[3].includes(1), false);
  assert.deepEqual(next.board, state.board);
  assert.notEqual(next.board, state.board);
  assert.notEqual(next.candidates, state.candidates);
  assert.throws(() => applyLogicalStep(next, step), RangeError);
});

test("finds claiming locked candidates from a row into its box", () => {
  const overrides = [];
  for (const index of [2, 3, 4, 5, 6, 7, 8]) {
    overrides.push([index, withoutDigits([2])]);
  }
  const step = findNextLogicalStep(createCandidateState(overrides));

  assert.equal(step.technique, "locked-candidates");
  assert.equal(step.pattern, "claiming");
  assert.deepEqual(step.unit, { kind: "row", index: 0 });
  assert.deepEqual(step.highlights, [
    { index: 0, digits: [2] },
    { index: 1, digits: [2] },
  ]);
  assert.deepEqual(step.eliminations, [9, 10, 11, 18, 19, 20].map(
    (index) => ({ index, digits: [2] }),
  ));
});

test("finds naked candidate pairs and removes both digits from the unit", () => {
  const state = createCandidateState([
    [0, [1, 2]],
    [1, [1, 2]],
  ]);
  const step = findNextLogicalStep(state);

  assert.equal(step.technique, "candidate-pair");
  assert.equal(step.pattern, "naked");
  assert.deepEqual(step.unit, { kind: "row", index: 0 });
  assert.deepEqual(step.highlights, [
    { index: 0, digits: [1, 2] },
    { index: 1, digits: [1, 2] },
  ]);
  assert.deepEqual(step.eliminations, [2, 3, 4, 5, 6, 7, 8].map(
    (index) => ({ index, digits: [1, 2] }),
  ));
});

test("finds hidden candidate pairs and removes unrelated candidates", () => {
  const overrides = [
    [0, [1, 2, 3]],
    [1, [1, 2, 4]],
  ];
  for (const index of [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 18, 19, 20]) {
    overrides.push([index, withoutDigits([1, 2])]);
  }
  const step = findNextLogicalStep(createCandidateState(overrides));

  assert.equal(step.technique, "candidate-pair");
  assert.equal(step.pattern, "hidden");
  assert.deepEqual(step.unit, { kind: "row", index: 0 });
  assert.deepEqual(step.eliminations, [
    { index: 0, digits: [3] },
    { index: 1, digits: [4] },
  ]);
});

test("classifies logically solved locked-candidate puzzles as Medium", () => {
  const result = solveLogically(parseBoard(lockedCandidatesPuzzleText));

  assert.equal(result.status, "solved");
  assert.equal(result.difficulty, "medium");
  assert.equal(result.hardestTechnique, "locked-candidates");
  assert.equal(
    result.steps.some((step) => step.technique === "locked-candidates"),
    true,
  );
  assert.equal(serializeBoard(result.board), solutionText);
});

test("retains pair eliminations through a complete Medium solution", () => {
  const result = solveLogically(parseBoard(candidatePairPuzzleText));

  assert.equal(result.status, "solved");
  assert.equal(result.difficulty, "medium");
  assert.equal(result.hardestTechnique, "candidate-pair");
  assert.equal(
    result.steps.some((step) => step.technique === "candidate-pair"),
    true,
  );
  assert.equal(serializeBoard(result.board), solutionText);
});

test("finds naked candidate triples and removes their digits from a unit", () => {
  const state = createCandidateState([
    [0, [1, 2]],
    [1, [1, 3]],
    [2, [2, 3]],
  ]);
  const step = findNextLogicalStep(state);

  assert.equal(step.technique, "candidate-triple");
  assert.equal(step.pattern, "naked");
  assert.deepEqual(step.unit, { kind: "row", index: 0 });
  assert.deepEqual(step.highlights, [
    { index: 0, digits: [1, 2] },
    { index: 1, digits: [1, 3] },
    { index: 2, digits: [2, 3] },
  ]);
  assert.deepEqual(step.eliminations, [3, 4, 5, 6, 7, 8].map(
    (index) => ({ index, digits: [1, 2, 3] }),
  ));
});

test("finds hidden candidate triples and removes unrelated candidates", () => {
  const overrides = [
    [0, [1, 2, 4]],
    [1, [2, 3, 5]],
    [2, [1, 3, 6]],
  ];
  for (const index of [3, 4, 5, 6, 7, 8, 9, 10, 11, 18, 19, 20]) {
    overrides.push([index, withoutDigits([1, 2, 3])]);
  }
  const step = findNextLogicalStep(createCandidateState(overrides));

  assert.equal(step.technique, "candidate-triple");
  assert.equal(step.pattern, "hidden");
  assert.deepEqual(step.unit, { kind: "row", index: 0 });
  assert.deepEqual(step.eliminations, [
    { index: 0, digits: [4] },
    { index: 1, digits: [5] },
    { index: 2, digits: [6] },
  ]);
});

test("finds row-based X-Wings and eliminates candidates in both columns", () => {
  const overrides = [];
  for (const row of [0, 3]) {
    for (const column of [0, 2, 3, 5, 6, 7, 8]) {
      overrides.push([row * 9 + column, withoutDigits([1])]);
    }
  }
  const step = findNextLogicalStep(createCandidateState(overrides));

  assert.equal(step.technique, "x-wing");
  assert.equal(step.pattern, "row-based");
  assert.equal(step.unit, null);
  assert.deepEqual(step.highlights, [1, 4, 28, 31].map(
    (index) => ({ index, digits: [1] }),
  ));
  assert.deepEqual(step.eliminations, [
    10, 13, 19, 22, 37, 40, 46, 49, 55, 58, 64, 67, 73, 76,
  ].map((index) => ({ index, digits: [1] })));
});

test("finds column-based X-Wings and eliminates candidates in both rows", () => {
  const overrides = [];
  for (const column of [2, 7]) {
    for (const row of [0, 2, 3, 4, 6, 7, 8]) {
      overrides.push([row * 9 + column, withoutDigits([2])]);
    }
  }
  const step = findNextLogicalStep(createCandidateState(overrides));

  assert.equal(step.technique, "x-wing");
  assert.equal(step.pattern, "column-based");
  assert.equal(step.unit, null);
  assert.deepEqual(step.highlights, [11, 47, 16, 52].sort(
    (left, right) => left - right,
  ).map((index) => ({ index, digits: [2] })));
  assert.deepEqual(step.eliminations, [
    9, 10, 12, 13, 14, 15, 17,
    45, 46, 48, 49, 50, 51, 53,
  ].map((index) => ({ index, digits: [2] })));
});

test("finds XY-Wings and eliminates the shared pincer candidate", () => {
  const state = createCandidateState([
    [10, [1, 2]],
    [1, [1, 3]],
    [12, [2, 3]],
  ]);
  const step = findNextLogicalStep(state);

  assert.equal(step.technique, "xy-wing");
  assert.equal(step.pattern, "xy-wing");
  assert.equal(step.unit, null);
  assert.deepEqual(step.highlights, [
    { index: 10, digits: [1, 2] },
    { index: 1, digits: [1, 3] },
    { index: 12, digits: [2, 3] },
  ]);
  assert.deepEqual(step.eliminations, [3, 4, 5, 9, 11].map(
    (index) => ({ index, digits: [3] }),
  ));

  const applied = applyLogicalStep(state, step);
  assert.equal(applied.candidates[3].includes(3), false);
  assert.equal(applied.candidates[4].includes(3), false);
  assert.equal(applied.candidates[5].includes(3), false);
  assert.equal(applied.candidates[9].includes(3), false);
  assert.equal(applied.candidates[11].includes(3), false);
});

test("finds row-based Swordfish and eliminates candidates in cover columns", () => {
  const overrides = [];
  const sourceColumns = new Map([
    [0, [1, 4]],
    [3, [1, 7]],
    [6, [4, 7]],
  ]);
  for (const [row, columns] of sourceColumns) {
    for (let column = 0; column < 9; column += 1) {
      if (!columns.includes(column)) {
        overrides.push([row * 9 + column, withoutDigits([4])]);
      }
    }
  }
  const step = findNextLogicalStep(createCandidateState(overrides));

  assert.equal(step.technique, "swordfish");
  assert.equal(step.pattern, "row-based");
  assert.deepEqual(step.highlights, [1, 4, 28, 34, 58, 61].map(
    (index) => ({ index, digits: [4] }),
  ));
  assert.deepEqual(step.eliminations, [
    10, 13, 16, 19, 22, 25, 37, 40, 43, 46, 49, 52, 64, 67, 70, 73, 76, 79,
  ].map((index) => ({ index, digits: [4] })));
});

test("finds column-based Swordfish and eliminates candidates in cover rows", () => {
  const overrides = [];
  const sourceRows = new Map([
    [0, [1, 4]],
    [3, [1, 7]],
    [6, [4, 7]],
  ]);
  for (const [column, rows] of sourceRows) {
    for (let row = 0; row < 9; row += 1) {
      if (!rows.includes(row)) {
        overrides.push([row * 9 + column, withoutDigits([5])]);
      }
    }
  }
  const step = findNextLogicalStep(createCandidateState(overrides));

  assert.equal(step.technique, "swordfish");
  assert.equal(step.pattern, "column-based");
  assert.deepEqual(step.highlights, [9, 36, 12, 66, 42, 69].sort(
    (left, right) => left - right,
  ).map((index) => ({ index, digits: [5] })));
  assert.deepEqual(step.eliminations, [
    10, 11, 13, 14, 16, 17, 37, 38, 40, 41, 43, 44,
    64, 65, 67, 68, 70, 71,
  ].map((index) => ({ index, digits: [5] })));
});

test("finds bounded X-Chains and eliminates candidates seen by both endpoints", () => {
  const overrides = [];
  for (const [row, columns] of [[0, [0, 4]], [1, [1, 4]]]) {
    for (let column = 0; column < 9; column += 1) {
      if (!columns.includes(column)) {
        overrides.push([row * 9 + column, withoutDigits([1])]);
      }
    }
  }
  const step = findXChain(createCandidateState(overrides));

  assert.equal(step.technique, "logical-chain");
  assert.equal(step.pattern, "x-chain");
  assert.deepEqual(step.highlights, [0, 4, 13, 10].map(
    (index) => ({ index, digits: [1] }),
  ));
  assert.deepEqual(step.eliminations, [18, 19, 20].map(
    (index) => ({ index, digits: [1] }),
  ));
});

test("classifies a unique candidate-triple puzzle as Hard", () => {
  const puzzle = parseBoard(candidateTriplePuzzleText);
  const uniqueness = searchSolutions(puzzle);
  const result = solveLogically(puzzle);

  assert.equal(uniqueness.count, 1);
  assert.equal(result.status, "solved");
  assert.equal(result.difficulty, "hard");
  assert.equal(result.hardestTechnique, "candidate-triple");
  assert.equal(
    result.steps.some((step) => step.technique === "candidate-triple"),
    true,
  );
  assert.equal(serializeBoard(result.board), solutionText);
});

test("retains X-Wing eliminations through a unique Hard solution", () => {
  const puzzle = parseBoard(xWingPuzzleText);
  const uniqueness = searchSolutions(puzzle);
  const result = solveLogically(puzzle);

  assert.equal(uniqueness.count, 1);
  assert.equal(result.status, "solved");
  assert.equal(result.difficulty, "hard");
  assert.equal(result.hardestTechnique, "x-wing");
  assert.equal(
    result.steps.filter((step) => step.technique === "x-wing").length,
    2,
  );
  assert.equal(serializeBoard(result.board), xWingSolutionText);
});

test("retains XY-Wing eliminations through a unique Expert solution", () => {
  const puzzle = parseBoard(xyWingPuzzleText);
  const uniqueness = searchSolutions(puzzle);
  const result = solveLogically(puzzle);

  assert.equal(uniqueness.count, 1);
  assert.equal(result.status, "solved");
  assert.equal(result.difficulty, "expert");
  assert.equal(result.hardestTechnique, "xy-wing");
  assert.equal(
    result.steps.some((step) => step.technique === "xy-wing"),
    true,
  );
  assert.equal(serializeBoard(result.board), xyWingSolutionText);
});

test("retains Swordfish eliminations through a unique Expert solution", () => {
  const puzzle = parseBoard(swordfishPuzzleText);
  const uniqueness = searchSolutions(puzzle);
  const result = solveLogically(puzzle);

  assert.equal(uniqueness.count, 1);
  assert.equal(result.status, "solved");
  assert.equal(result.difficulty, "expert");
  assert.equal(result.hardestTechnique, "swordfish");
  assert.equal(
    result.steps.some((step) => step.technique === "swordfish"),
    true,
  );
  assert.equal(serializeBoard(result.board), swordfishSolutionText);
});
